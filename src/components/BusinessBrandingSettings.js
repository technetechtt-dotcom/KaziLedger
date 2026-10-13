import React, { useState } from 'react';
import styled from 'styled-components';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';

const Container = styled.div`
  padding: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
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
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const LogoUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const LogoPreview = styled.div`
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const UploadButton = styled.label`
  padding: 0.5rem 1rem;
  background: #14b8a6;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

const SaveButton = styled.button`
  background: #14b8a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export default function BusinessBrandingSettings() {
  const { businessInfo, updateBusinessInfo, updateBankDetails, updateTaxInfo, uploadLogo } = useBusinessBranding();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadLogo(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate save operation
    setTimeout(() => {
      setIsLoading(false);
      alert('Business information saved successfully!');
    }, 1000);
  };

  return (
    <Container>
      <Section>
        <SectionTitle>Company Logo</SectionTitle>
        <LogoUpload>
          <LogoPreview>
            {businessInfo.logo ? (
              <img src={businessInfo.logo} alt="Company Logo" />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>No Logo</span>
            )}
          </LogoPreview>
          <div>
            <UploadButton htmlFor="logo-upload">
              Upload Logo
            </UploadButton>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Recommended: 200x200px, PNG or JPG
            </p>
          </div>
        </LogoUpload>
      </Section>

      <Section>
        <SectionTitle>Business Information</SectionTitle>
        <FormGroup>
          <Label>Business Name *</Label>
          <Input
            type="text"
            value={businessInfo.businessName}
            onChange={(e) => updateBusinessInfo({ businessName: e.target.value })}
            placeholder="Your Business Name"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Business Address</Label>
          <TextArea
            value={businessInfo.businessAddress}
            onChange={(e) => updateBusinessInfo({ businessAddress: e.target.value })}
            placeholder="Street Address, City, State, ZIP Code"
          />
        </FormGroup>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={businessInfo.businessPhone}
              onChange={(e) => updateBusinessInfo({ businessPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={businessInfo.businessEmail}
              onChange={(e) => updateBusinessInfo({ businessEmail: e.target.value })}
              placeholder="business@example.com"
            />
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label>Website</Label>
          <Input
            type="url"
            value={businessInfo.businessWebsite}
            onChange={(e) => updateBusinessInfo({ businessWebsite: e.target.value })}
            placeholder="https://www.yourbusiness.com"
          />
        </FormGroup>
      </Section>

      <Section>
        <SectionTitle>Bank Details</SectionTitle>
        <TwoColumnGrid>
          <FormGroup>
            <Label>Bank Name</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.bankName}
              onChange={(e) => updateBankDetails({ bankName: e.target.value })}
              placeholder="Bank of America"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Account Holder Name</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.accountHolderName}
              onChange={(e) => updateBankDetails({ accountHolderName: e.target.value })}
              placeholder="Your Business Name"
            />
          </FormGroup>
        </TwoColumnGrid>

        <TwoColumnGrid>
          <FormGroup>
            <Label>Account Number</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.accountNumber}
              onChange={(e) => updateBankDetails({ accountNumber: e.target.value })}
              placeholder="1234567890"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Routing Number (US)</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.routingNumber}
              onChange={(e) => updateBankDetails({ routingNumber: e.target.value })}
              placeholder="021000021"
            />
          </FormGroup>
        </TwoColumnGrid>

        <TwoColumnGrid>
          <FormGroup>
            <Label>SWIFT Code</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.swiftCode}
              onChange={(e) => updateBankDetails({ swiftCode: e.target.value })}
              placeholder="BOFAUS3N"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>IBAN</Label>
            <Input
              type="text"
              value={businessInfo.bankDetails.iban}
              onChange={(e) => updateBankDetails({ iban: e.target.value })}
              placeholder="GB29 NWBK 6016 1331 9268 19"
            />
          </FormGroup>
        </TwoColumnGrid>
      </Section>

      <Section>
        <SectionTitle>Tax Information</SectionTitle>
        <TwoColumnGrid>
          <FormGroup>
            <Label>Tax ID / EIN</Label>
            <Input
              type="text"
              value={businessInfo.taxInfo.taxId}
              onChange={(e) => updateTaxInfo({ taxId: e.target.value })}
              placeholder="12-3456789"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>VAT Number</Label>
            <Input
              type="text"
              value={businessInfo.taxInfo.vatNumber}
              onChange={(e) => updateTaxInfo({ vatNumber: e.target.value })}
              placeholder="GB123456789"
            />
          </FormGroup>
        </TwoColumnGrid>

        <FormGroup>
          <Label>Business Registration Number</Label>
          <Input
            type="text"
            value={businessInfo.taxInfo.businessRegistration}
            onChange={(e) => updateTaxInfo({ businessRegistration: e.target.value })}
            placeholder="Registration number"
          />
        </FormGroup>
      </Section>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <SaveButton onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Business Information'}
        </SaveButton>
      </div>
    </Container>
  );
}
