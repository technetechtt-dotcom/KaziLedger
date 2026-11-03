import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiUpload } from 'react-icons/fi';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 1000px; margin: 0 auto;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Select = styled.select`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer;`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; display: block; margin-bottom: 0.25rem;`;

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]; });
    const amount = parseFloat(row.amount || row.credit || row.debit || 0);
    const signed = row.debit && !row.amount ? -Math.abs(amount) : amount;
    return {
      date: row.date || row.posted || new Date().toISOString().split('T')[0],
      description: row.description || row.narration || row.memo || 'Bank line',
      amount: signed,
      reference: row.reference || row.ref || ''
    };
  });
}

export default function BankFeeds() {
  const {
    bankAccounts,
    bankTransactions,
    addBankAccount,
    addBankTransaction,
    importBankCsvRows,
    reconcileBankTransaction,
    unreconcileBankTransaction,
    postJournal
  } = useAccountingExtensions();
  const { invoices, expenses, income, recordPayment } = useFinancialData();
  const { formatCurrency } = useCurrency();

  const [accountForm, setAccountForm] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    currency: 'ZAR',
    openingBalance: '0'
  });
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [manualTx, setManualTx] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    reference: ''
  });

  const accountId = selectedAccountId || bankAccounts[0]?.id || '';
  const txs = useMemo(
    () => bankTransactions.filter((t) => !accountId || t.bankAccountId === accountId),
    [bankTransactions, accountId]
  );

  const matchOptions = useMemo(() => {
    const inv = invoices
      .filter((i) => i.status !== 'paid' && i.type !== 'credit_note')
      .map((i) => ({
        type: 'invoice',
        id: i.id,
        label: `${i.invoiceNumber} · ${i.clientName || ''} · ${formatCurrency(i.total ?? i.amount ?? 0)}`
      }));
    const exp = (expenses || []).slice(0, 50).map((e) => ({
      type: 'expense',
      id: e.id,
      label: `Expense ${e.category || ''} · ${e.vendor || ''} · ${formatCurrency(e.amount || 0)}`
    }));
    const inc = (income || []).slice(0, 50).map((e) => ({
      type: 'income',
      id: e.id,
      label: `Income ${e.category || ''} · ${formatCurrency(e.amount || 0)}`
    }));
    return [...inv, ...exp, ...inc];
  }, [invoices, expenses, income, formatCurrency]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    const result = await addBankAccount(accountForm);
    if (result.success) {
      toast.success('Bank account added');
      setAccountForm({ name: '', bankName: '', accountNumber: '', currency: 'ZAR', openingBalance: '0' });
      setSelectedAccountId(result.id);
    } else alert(result.error);
  };

  const handleManualTx = async (e) => {
    e.preventDefault();
    if (!accountId) return alert('Select a bank account first');
    const result = await addBankTransaction({
      ...manualTx,
      bankAccountId: accountId,
      amount: parseFloat(manualTx.amount),
      source: 'manual'
    });
    if (result.success) {
      toast.success('Transaction added');
      setManualTx({ date: new Date().toISOString().split('T')[0], description: '', amount: '', reference: '' });
    } else alert(result.error);
  };

  const handleCsv = async (file) => {
    if (!accountId) return alert('Select a bank account first');
    const text = await file.text();
    const rows = parseCsv(text);
    const result = await importBankCsvRows(accountId, rows);
    toast.success(`Imported ${result.imported} transactions`);
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Bank Feeds</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Accounts, CSV import, and reconciliation</p>
        </div>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Bank accounts</h3>
        <form onSubmit={handleAddAccount} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          <div><Label>Name</Label><Input value={accountForm.name} onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label>Bank</Label><Input value={accountForm.bankName} onChange={(e) => setAccountForm((p) => ({ ...p, bankName: e.target.value }))} /></div>
          <div><Label>Account #</Label><Input value={accountForm.accountNumber} onChange={(e) => setAccountForm((p) => ({ ...p, accountNumber: e.target.value }))} /></div>
          <div><Label>Opening balance</Label><Input type="number" step="0.01" value={accountForm.openingBalance} onChange={(e) => setAccountForm((p) => ({ ...p, openingBalance: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit">Add account</Button></div>
        </form>
        <Select value={accountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
          <option value="">Select account</option>
          {bankAccounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name} · {formatCurrency(a.balance || 0)}</option>
          ))}
        </Select>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Import / add transactions</h3>
        <Label>CSV (headers: date, description, amount, reference)</Label>
        <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])} />
        <form onSubmit={handleManualTx} style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem' }}>
          <div><Label>Date</Label><Input type="date" value={manualTx.date} onChange={(e) => setManualTx((p) => ({ ...p, date: e.target.value }))} /></div>
          <div><Label>Description</Label><Input value={manualTx.description} onChange={(e) => setManualTx((p) => ({ ...p, description: e.target.value }))} required /></div>
          <div><Label>Amount (+ in / − out)</Label><Input type="number" step="0.01" value={manualTx.amount} onChange={(e) => setManualTx((p) => ({ ...p, amount: e.target.value }))} required /></div>
          <div><Label>Reference</Label><Input value={manualTx.reference} onChange={(e) => setManualTx((p) => ({ ...p, reference: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiUpload /> Add</Button></div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Reconcile</h3>
        {txs.length === 0 && <p style={{ color: '#64748b' }}>No bank transactions yet</p>}
        {txs.map((tx) => (
          <div key={tx.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{tx.description}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tx.date} · {tx.reference || 'No ref'}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: tx.amount >= 0 ? '#16a34a' : '#dc2626' }}>{formatCurrency(tx.amount)}</div>
              <div style={{ fontSize: '0.8rem' }}>{tx.status}{tx.matchedLabel ? ` · ${tx.matchedLabel}` : ''}</div>
            </div>
            {tx.status !== 'reconciled' ? (
              <Select
                defaultValue=""
                onChange={async (e) => {
                  const opt = matchOptions.find((m) => `${m.type}:${m.id}` === e.target.value);
                  if (!opt) return;
                  const result = await reconcileBankTransaction(tx.id, opt);
                  if (!result.success) {
                    alert(result.error);
                    return;
                  }

                  const absAmount = Math.abs(parseFloat(tx.amount) || 0);
                  try {
                    if (opt.type === 'invoice' && absAmount > 0) {
                      const payResult = await recordPayment(opt.id, {
                        amount: absAmount,
                        date: tx.date || new Date().toISOString().split('T')[0],
                        method: 'bank',
                        notes: `Bank reconcile: ${tx.description || ''}`
                      });
                      if (!payResult.success) {
                        toast.warn(`Reconciled, but payment failed: ${payResult.error}`);
                        return;
                      }
                    } else if (opt.type === 'expense' && absAmount > 0) {
                      const journalResult = await postJournal({
                        memo: `Bank reconcile expense: ${tx.description || opt.label || ''}`,
                        date: tx.date || new Date().toISOString().split('T')[0],
                        lines: [
                          { accountCode: '5100', debit: absAmount, credit: 0, memo: opt.label },
                          { accountCode: '1000', debit: 0, credit: absAmount, memo: 'Bank' }
                        ]
                      });
                      if (!journalResult.success) {
                        toast.warn(`Reconciled, but journal failed: ${journalResult.error}`);
                        return;
                      }
                    }
                    toast.success('Reconciled');
                  } catch (sideEffectError) {
                    toast.warn(`Reconciled, but follow-up failed: ${sideEffectError.message}`);
                  }
                }}
              >
                <option value="">Match to…</option>
                {matchOptions.map((m) => (
                  <option key={`${m.type}:${m.id}`} value={`${m.type}:${m.id}`}>{m.label}</option>
                ))}
              </Select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>Matched</span>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await unreconcileBankTransaction(tx.id);
                    if (result.success) toast.success('Unreconciled');
                    else alert(result.error);
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  Unreconcile
                </button>
              </div>
            )}
          </div>
        ))}
      </Card>
    </Page>
  );
}
