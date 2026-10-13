import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import {
  FiArrowLeft,
  FiCamera,
  FiUpload,
  FiFileText,
  FiCheck,
  FiRefreshCw,
  FiShield,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useFinancialData } from '../context/FinancialDataContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useCompliance } from '../context/ComplianceContext';
import { uploadReceipt } from '../firebase/storage';
import { scanReceipt } from '../utils/receiptOcr';
import { logAnalyticsEvent } from '../utils/analytics';

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Utilities',
  'Rent',
  'Marketing',
  'Travel',
  'Meals',
  'Fuel',
  'Equipment',
  'Software',
  'Professional Services',
  'Other',
];

const ScannerContainer = styled.div`
  padding: 1rem;
  max-width: 640px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  padding-bottom: 6rem;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.25rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1e293b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;

  &:hover {
    background: #f1f5f9;
  }
`;

const Title = styled.h1`
  font-size: 1.35rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const Intro = styled.p`
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.25rem;
  text-align: center;
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem 0.75rem;
  background: ${(p) => (p.$primary ? '#14b8a6' : 'white')};
  color: ${(p) => (p.$primary ? 'white' : '#0f766e')};
  border: 2px solid #14b8a6;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(p) => (p.$primary ? '#0d9488' : '#f0fdfa')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const DropZone = styled.div`
  border: 2px dashed ${(p) => (p.$active ? '#14b8a6' : '#cbd5e1')};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  background: ${(p) => (p.$active ? '#f0fdfa' : '#f8fafc')};
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
  }
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 280px;
  object-fit: contain;
  border-radius: 8px;
  background: #f1f5f9;
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.75rem 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${(p) => p.$value}%;
  background: #14b8a6;
  transition: width 0.2s ease;
`;

const StatusText = styled.p`
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.4rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 72px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PrimaryButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  margin-bottom: 0.75rem;

  &:hover:not(:disabled) {
    background: #0d9488;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8fafc;
    color: #334155;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ecfdf5;
  color: #047857;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 1rem;
`;

const ErrorBanner = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessBanner = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const Hint = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0.25rem 0 0;
`;

const emptyForm = () => ({
  vendor: '',
  date: new Date().toISOString().split('T')[0],
  amount: '',
  vatAmount: '',
  vatRate: 15,
  invoiceNumber: '',
  category: 'Other',
  notes: '',
  taxDeductible: true,
  keepForCompliance: true,
});

export default function Scanner() {
  const navigate = useNavigate();
  const { addExpense } = useFinancialData();
  const { user } = useFirebaseBusiness();
  const { addDocument } = useCompliance();

  const cameraInputRef = useRef(null);
  const [step, setStep] = useState('capture'); // capture | processing | review | done
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [rawText, setRawText] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const resetAll = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setProgress(0);
    setForm(emptyForm());
    setRawText('');
    setConfidence(null);
    setError('');
    setSuccess('');
    setStep('capture');
  };

  const processImage = useCallback(async (imageFile) => {
    setError('');
    setSuccess('');
    setFile(imageFile);
    setPreviewUrl(URL.createObjectURL(imageFile));
    setStep('processing');
    setProgress(0);

    try {
      const result = await scanReceipt(imageFile, setProgress);
      setForm({
        vendor: result.vendor || '',
        date: result.date || new Date().toISOString().split('T')[0],
        amount: result.amount !== '' && result.amount != null ? String(result.amount) : '',
        vatAmount: result.vatAmount !== '' && result.vatAmount != null ? String(result.vatAmount) : '',
        vatRate: result.vatRate || 15,
        invoiceNumber: result.invoiceNumber || '',
        category: result.category || 'Other',
        notes: '',
        taxDeductible: true,
        keepForCompliance: true,
      });
      setRawText(result.rawText || '');
      setConfidence(result.confidence);
      setStep('review');
      logAnalyticsEvent('receipt_scanned', {
        confidence: result.confidence,
        category: result.category,
      });
    } catch (err) {
      console.error('OCR error:', err);
      setError('Could not read this document. Try a clearer photo or enter details manually.');
      setForm(emptyForm());
      setStep('review');
    }
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) processImage(acceptedFiles[0]);
    },
    [processImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: step === 'processing' || saving,
  });

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (!form.date) {
      setError('Please enter the expense date.');
      return;
    }

    setSaving(true);
    try {
      let receiptUrl = null;
      let receiptPath = null;

      if (file && user?.uid) {
        const upload = await uploadReceipt(user.uid, file);
        if (upload.success) {
          receiptUrl = upload.url;
          receiptPath = upload.path;
        }
      }

      const vatAmount = form.vatAmount !== '' ? parseFloat(form.vatAmount) : null;
      const expensePayload = {
        amount,
        date: form.date,
        category: form.category,
        vendor: form.vendor || 'Unknown vendor',
        notes: form.notes || `Scanned slip/invoice${form.invoiceNumber ? ` #${form.invoiceNumber}` : ''}`,
        vatAmount: Number.isFinite(vatAmount) ? vatAmount : null,
        vatRate: parseFloat(form.vatRate) || 15,
        invoiceNumber: form.invoiceNumber || null,
        taxDeductible: !!form.taxDeductible,
        source: 'scanner',
        receiptUrl,
        receiptPath,
        ocrConfidence: confidence,
        rawOcrText: rawText ? rawText.slice(0, 4000) : null,
        complianceRetention: !!form.keepForCompliance,
      };

      const result = await addExpense(expensePayload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save expense');
      }

      // Best-effort compliance archive for tax records
      if (form.keepForCompliance) {
        try {
          await addDocument({
            name: `Receipt - ${form.vendor || 'Expense'} - ${form.date}`,
            type: 'tax_receipt',
            category: 'Tax & Compliance',
            description: `Scanned expense receipt. Amount: ${amount}. VAT: ${vatAmount ?? 'n/a'}. Invoice: ${form.invoiceNumber || 'n/a'}`,
            status: 'active',
            fileUrl: receiptUrl,
            expenseId: result.id,
            amount,
            vatAmount,
            vendor: form.vendor,
            documentDate: form.date,
          });
        } catch (complianceErr) {
          // Expense is still saved; compliance archive may fail if business profile incomplete
          console.warn('Compliance archive skipped:', complianceErr);
        }
      }

      logAnalyticsEvent('expense_from_scan', {
        amount,
        category: form.category,
        taxDeductible: form.taxDeductible,
      });

      setSuccess('Expense saved for tax and compliance tracking.');
      setStep('done');
    } catch (err) {
      console.error('Save expense error:', err);
      setError(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScannerContainer>
      <TopBar>
        <BackButton
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiArrowLeft aria-hidden="true" />
        </BackButton>
        <Title>Scan Slips & Invoices</Title>
        <div style={{ width: 40 }} />
      </TopBar>

      {error && <ErrorBanner role="alert">{error}</ErrorBanner>}
      {success && <SuccessBanner role="status">{success}</SuccessBanner>}

      {step === 'capture' && (
        <Card>
          <Intro>
            Capture or upload slips and invoices. OCR extracts vendor, date, amount, and VAT
            so you can track expenses for tax and compliance.
          </Intro>

          <ActionRow>
            <ActionButton
              type="button"
              $primary
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Take photo of receipt"
            >
              <FiCamera size={22} aria-hidden="true" />
              Take Photo
            </ActionButton>
            <ActionButton
              type="button"
              onClick={() => document.getElementById('receipt-upload')?.click()}
              aria-label="Upload receipt image"
            >
              <FiUpload size={22} aria-hidden="true" />
              Upload File
            </ActionButton>
          </ActionRow>

          <HiddenInput
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processImage(f);
              e.target.value = '';
            }}
          />
          <HiddenInput
            id="receipt-upload"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) processImage(f);
              e.target.value = '';
            }}
          />

          <DropZone {...getRootProps()} $active={isDragActive}>
            <input {...getInputProps()} />
            <FiFileText size={28} style={{ marginBottom: 8 }} aria-hidden="true" />
            <div>{isDragActive ? 'Drop the file here' : 'Or drag & drop a slip / invoice here'}</div>
            <Hint>JPG, PNG, WEBP — clear, well-lit photos work best</Hint>
          </DropZone>
        </Card>
      )}

      {step === 'processing' && (
        <Card>
          {previewUrl && <PreviewImage src={previewUrl} alt="Receipt preview" />}
          <StatusText>Reading document… {progress}%</StatusText>
          <ProgressBar>
            <ProgressFill $value={progress} />
          </ProgressBar>
          <Hint style={{ textAlign: 'center' }}>Extracting vendor, date, amount, and VAT</Hint>
        </Card>
      )}

      {(step === 'review' || step === 'done') && (
        <Card>
          {previewUrl && <PreviewImage src={previewUrl} alt="Scanned receipt" />}

          {typeof confidence === 'number' && (
            <Badge>
              <FiShield aria-hidden="true" />
              OCR confidence: {Math.round(confidence)}%
            </Badge>
          )}

          <FormGroup>
            <Label htmlFor="vendor">Vendor / Supplier</Label>
            <Input
              id="vendor"
              value={form.vendor}
              onChange={(e) => handleFieldChange('vendor', e.target.value)}
              placeholder="Shop or supplier name"
              disabled={step === 'done'}
            />
          </FormGroup>

          <Grid2>
            <FormGroup>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                disabled={step === 'done'}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="amount">Total Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                placeholder="0.00"
                disabled={step === 'done'}
              />
            </FormGroup>
          </Grid2>

          <Grid2>
            <FormGroup>
              <Label htmlFor="vatAmount">VAT Amount</Label>
              <Input
                id="vatAmount"
                type="number"
                step="0.01"
                min="0"
                value={form.vatAmount}
                onChange={(e) => handleFieldChange('vatAmount', e.target.value)}
                placeholder="0.00"
                disabled={step === 'done'}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="vatRate">VAT Rate %</Label>
              <Input
                id="vatRate"
                type="number"
                step="0.01"
                min="0"
                value={form.vatRate}
                onChange={(e) => handleFieldChange('vatRate', e.target.value)}
                disabled={step === 'done'}
              />
            </FormGroup>
          </Grid2>

          <FormGroup>
            <Label htmlFor="invoiceNumber">Invoice / Slip Number</Label>
            <Input
              id="invoiceNumber"
              value={form.invoiceNumber}
              onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
              placeholder="Optional"
              disabled={step === 'done'}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">Expense Category</Label>
            <Select
              id="category"
              value={form.category}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              disabled={step === 'done'}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="notes">Notes</Label>
            <TextArea
              id="notes"
              value={form.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Business purpose (helps with tax audits)"
              disabled={step === 'done'}
            />
          </FormGroup>

          <CheckboxRow>
            <input
              type="checkbox"
              checked={form.taxDeductible}
              onChange={(e) => handleFieldChange('taxDeductible', e.target.checked)}
              disabled={step === 'done'}
            />
            Mark as tax-deductible expense
          </CheckboxRow>

          <CheckboxRow>
            <input
              type="checkbox"
              checked={form.keepForCompliance}
              onChange={(e) => handleFieldChange('keepForCompliance', e.target.checked)}
              disabled={step === 'done'}
            />
            Keep copy for tax & compliance records
          </CheckboxRow>

          {step === 'review' && (
            <>
              <PrimaryButton
                type="button"
                onClick={handleSave}
                disabled={saving}
                aria-label="Save scanned expense"
              >
                <FiCheck aria-hidden="true" />
                {saving ? 'Saving…' : 'Save Expense'}
              </PrimaryButton>
              <SecondaryButton type="button" onClick={resetAll} disabled={saving}>
                <FiRefreshCw aria-hidden="true" />
                Scan Another
              </SecondaryButton>
            </>
          )}

          {step === 'done' && (
            <>
              <PrimaryButton type="button" onClick={resetAll} aria-label="Scan another document">
                <FiCamera aria-hidden="true" />
                Scan Another Document
              </PrimaryButton>
              <SecondaryButton type="button" onClick={() => navigate('/')}>
                Go to Dashboard
              </SecondaryButton>
            </>
          )}
        </Card>
      )}
    </ScannerContainer>
  );
}
