import React from 'react';
import styled from 'styled-components';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { useCurrency } from '../contexts/CurrencyContext';

const QuoteContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const BusinessInfo = styled.div`
  flex: 1;
`;

const Logo = styled.div`
  width: 120px;
  height: 120px;
  margin-bottom: 1rem;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const BusinessName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const BusinessDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
`;

const QuoteInfo = styled.div`
  text-align: right;
`;

const QuoteTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #14b8a6;
  margin: 0 0 1rem 0;
`;

const QuoteDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  
  div {
    margin-bottom: 0.25rem;
  }
`;

const ClientSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const ClientInfo = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableHeader = styled.th`
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 1px solid #e2e8f0;
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
`;

const TableCellRight = styled(TableCell)`
  text-align: right;
`;

const TotalsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
`;

const TotalsTable = styled.table`
  width: 300px;
`;

const TotalRow = styled.tr`
  &.subtotal td {
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 0.5rem;
  }
  
  &.total td {
    font-weight: 700;
    font-size: 1.125rem;
    padding-top: 0.5rem;
    border-top: 2px solid #14b8a6;
    color: #1e293b;
  }
`;

const TotalLabel = styled.td`
  text-align: right;
  padding: 0.25rem 0.75rem;
  color: #64748b;
`;

const TotalValue = styled.td`
  text-align: right;
  padding: 0.25rem 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const TermsSection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const TermsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const TermsList = styled.ul`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  padding-left: 1.25rem;
  
  li {
    margin-bottom: 0.25rem;
  }
`;

const ValiditySection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  text-align: center;
`;

const ValidityText = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const Footer = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
`;

// Inner component that uses context hooks
function QuoteTemplateWithContext({ quote, items, businessInfo, formatCurrency }) {
  const contextBusinessInfo = useBusinessBranding();
  const contextCurrency = useCurrency();
  
  // Use provided props or fall back to context
  const finalBusinessInfo = businessInfo || contextBusinessInfo.businessInfo;
  const finalFormatCurrency = formatCurrency || contextCurrency.formatCurrency;
  
  return <QuoteTemplateContent 
    quote={quote} 
    items={items} 
    businessInfo={finalBusinessInfo} 
    formatCurrency={finalFormatCurrency} 
  />;
}

// Component without context dependencies
function QuoteTemplateContent({ quote, items, businessInfo, formatCurrency }) {
  // Use provided props with fallbacks
  const finalBusinessInfo = businessInfo || {
    logo: '',
    businessName: 'Your Business Name',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    taxInfo: {
      taxId: '',
      vatNumber: ''
    }
  };
  
  const finalFormatCurrency = formatCurrency || ((amount) => `$${amount.toFixed(2)}`);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + tax;

  // Calculate validity date (30 days from quote date)
  const quoteDate = quote?.createdAt ? new Date(quote.createdAt) : new Date();
  const validityDate = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000));

  return (
    <QuoteContainer>
      <Header>
        <BusinessInfo>
          {finalBusinessInfo.logo && (
            <Logo>
              <img src={finalBusinessInfo.logo} alt="Business Logo" />
            </Logo>
          )}
          <BusinessName>{finalBusinessInfo.businessName || 'Your Business Name'}</BusinessName>
          <BusinessDetails>
            {finalBusinessInfo.businessAddress && <div>{finalBusinessInfo.businessAddress}</div>}
            {finalBusinessInfo.businessPhone && <div>Phone: {finalBusinessInfo.businessPhone}</div>}
            {finalBusinessInfo.businessEmail && <div>Email: {finalBusinessInfo.businessEmail}</div>}
            {finalBusinessInfo.businessWebsite && <div>Website: {finalBusinessInfo.businessWebsite}</div>}
          </BusinessDetails>
        </BusinessInfo>
        
        <QuoteInfo>
          <QuoteTitle>QUOTE</QuoteTitle>
          <QuoteDetails>
            <div><strong>Quote #:</strong> {quote?.quoteNumber || 'QTE-001'}</div>
            <div><strong>Date:</strong> {quote?.createdAt ? new Date(quote.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            <div><strong>Valid Until:</strong> {validityDate.toLocaleDateString()}</div>
            <div><strong>Status:</strong> {quote?.status || 'Pending'}</div>
          </QuoteDetails>
        </QuoteInfo>
      </Header>

      <ClientSection>
        <div>
          <SectionTitle>Quote For:</SectionTitle>
          <ClientInfo>
            <div><strong>{quote?.clientName || 'Client Name'}</strong></div>
            {quote?.clientEmail && <div>{quote.clientEmail}</div>}
            {quote?.clientPhone && <div>{quote.clientPhone}</div>}
            {quote?.clientAddress && (
              <div style={{ marginTop: '0.5rem' }}>
                <div>{quote.clientAddress}</div>
                {quote?.clientCity && (
                  <div>
                    {quote.clientCity}
                    {quote?.clientPostalCode && `, ${quote.clientPostalCode}`}
                  </div>
                )}
                {quote?.clientCountry && <div>{quote.clientCountry}</div>}
              </div>
            )}
          </ClientInfo>
        </div>
        
        <div>
          <SectionTitle>Project Details:</SectionTitle>
          <ClientInfo>
            <div>{quote?.projectDescription || 'Project description'}</div>
            {quote?.projectDuration && <div>Duration: {quote.projectDuration}</div>}
          </ClientInfo>
        </div>
      </ClientSection>

      <ItemsTable>
        <thead>
          <tr>
            <TableHeader>Description</TableHeader>
            <TableHeader>Quantity</TableHeader>
            <TableHeader>Price</TableHeader>
            <TableHeader>Amount</TableHeader>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index}>
                <TableCell>{item.description}</TableCell>
                <TableCellRight>{item.quantity}</TableCellRight>
                <TableCellRight>{finalFormatCurrency(item.price)}</TableCellRight>
                <TableCellRight>{finalFormatCurrency(item.quantity * item.price)}</TableCellRight>
              </tr>
            ))
          ) : (
            <tr>
              <TableCell colSpan="4" style={{ textAlign: 'center', fontStyle: 'italic', color: '#94a3b8' }}>
                No items added
              </TableCell>
            </tr>
          )}
        </tbody>
      </ItemsTable>

      <TotalsSection>
        <TotalsTable>
          <tbody>
            <TotalRow className="subtotal">
              <TotalLabel>Subtotal:</TotalLabel>
              <TotalValue>{finalFormatCurrency(subtotal)}</TotalValue>
            </TotalRow>
            <TotalRow className="subtotal">
              <TotalLabel>Tax (15%):</TotalLabel>
              <TotalValue>{finalFormatCurrency(tax)}</TotalValue>
            </TotalRow>
            <TotalRow className="total">
              <TotalLabel>Total:</TotalLabel>
              <TotalValue>{finalFormatCurrency(total)}</TotalValue>
            </TotalRow>
          </tbody>
        </TotalsTable>
      </TotalsSection>

      <TermsSection>
        <TermsTitle>Terms & Conditions</TermsTitle>
        <TermsList>
          <li>This quote is valid for 30 days from the date of issue</li>
          <li>Payment terms: 50% deposit required to commence work</li>
          <li>Remaining balance due upon project completion</li>
          <li>All prices include applicable taxes unless otherwise stated</li>
          <li>Additional work requested may incur extra charges</li>
          <li>Project timeline may vary based on client feedback and changes</li>
        </TermsList>
      </TermsSection>

      <ValiditySection>
        <ValidityText>
          This quote is valid until <strong>{validityDate.toLocaleDateString()}</strong>
        </ValidityText>
      </ValiditySection>

      <Footer>
        <div>Thank you for considering our services!</div>
        
        {/* Tax Information */}
        {(finalBusinessInfo.taxInfo?.taxId || finalBusinessInfo.taxInfo?.vatNumber || finalBusinessInfo.taxInfo?.businessRegistration) && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Tax Information:</div>
            {finalBusinessInfo.taxInfo?.taxId && (
              <div>Tax ID: {finalBusinessInfo.taxInfo.taxId}</div>
            )}
            {finalBusinessInfo.taxInfo?.vatNumber && (
              <div>VAT Number: {finalBusinessInfo.taxInfo.vatNumber}</div>
            )}
            {finalBusinessInfo.taxInfo?.businessRegistration && (
              <div>Business Registration: {finalBusinessInfo.taxInfo.businessRegistration}</div>
            )}
          </div>
        )}
        
        {/* Bank Details */}
        {(finalBusinessInfo.bankDetails?.bankName || finalBusinessInfo.bankDetails?.accountNumber || finalBusinessInfo.bankDetails?.swiftCode) && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>Bank Details:</div>
            {finalBusinessInfo.bankDetails?.bankName && (
              <div>Bank: {finalBusinessInfo.bankDetails.bankName}</div>
            )}
            {finalBusinessInfo.bankDetails?.accountHolderName && (
              <div>Account Holder: {finalBusinessInfo.bankDetails.accountHolderName}</div>
            )}
            {finalBusinessInfo.bankDetails?.accountNumber && (
              <div>Account Number: {finalBusinessInfo.bankDetails.accountNumber}</div>
            )}
            {finalBusinessInfo.bankDetails?.routingNumber && (
              <div>Routing Number: {finalBusinessInfo.bankDetails.routingNumber}</div>
            )}
            {finalBusinessInfo.bankDetails?.swiftCode && (
              <div>SWIFT Code: {finalBusinessInfo.bankDetails.swiftCode}</div>
            )}
            {finalBusinessInfo.bankDetails?.iban && (
              <div>IBAN: {finalBusinessInfo.bankDetails.iban}</div>
            )}
          </div>
        )}
      </Footer>
    </QuoteContainer>
  );
}

// Main export component that handles context availability
export default function QuoteTemplate({ quote, items = [], businessInfo = null, formatCurrency = null }) {
  // If props are provided, use the content component directly
  if (businessInfo !== null || formatCurrency !== null) {
    return <QuoteTemplateContent 
      quote={quote} 
      items={items} 
      businessInfo={businessInfo} 
      formatCurrency={formatCurrency} 
    />;
  }
  
  // Otherwise, use the context-aware component
  return <QuoteTemplateWithContext 
    quote={quote} 
    items={items} 
    businessInfo={businessInfo} 
    formatCurrency={formatCurrency} 
  />;
}
