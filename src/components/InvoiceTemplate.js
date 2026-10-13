import React from 'react';
import styled from 'styled-components';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { useCurrency } from '../contexts/CurrencyContext';

const InvoiceContainer = styled.div`
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

const InvoiceInfo = styled.div`
  text-align: right;
`;

const InvoiceTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #14b8a6;
  margin: 0 0 1rem 0;
`;

const InvoiceDetails = styled.div`
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

const PaymentSection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const PaymentTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const PaymentDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
`;

const Footer = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  font-size: 0.75rem;
  color: #94a3b8;
`;

export default function InvoiceTemplate({ invoice, items = [] }) {
  const { businessInfo } = useBusinessBranding();
  const { formatCurrency } = useCurrency();

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + tax;

  return (
    <InvoiceContainer>
      <Header>
        <BusinessInfo>
          {businessInfo.logo && (
            <Logo>
              <img src={businessInfo.logo} alt="Business Logo" />
            </Logo>
          )}
          <BusinessName>{businessInfo.businessName || 'Your Business Name'}</BusinessName>
          <BusinessDetails>
            {businessInfo.businessAddress && <div>{businessInfo.businessAddress}</div>}
            {businessInfo.businessPhone && <div>Phone: {businessInfo.businessPhone}</div>}
            {businessInfo.businessEmail && <div>Email: {businessInfo.businessEmail}</div>}
            {businessInfo.businessWebsite && <div>Website: {businessInfo.businessWebsite}</div>}
          </BusinessDetails>
        </BusinessInfo>
        
        <InvoiceInfo>
          <InvoiceTitle>INVOICE</InvoiceTitle>
          <InvoiceDetails>
            <div><strong>Invoice #:</strong> {invoice?.invoiceNumber || 'INV-001'}</div>
            <div><strong>Date:</strong> {invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            <div><strong>Due Date:</strong> {invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : new Date().toLocaleDateString()}</div>
            <div><strong>Status:</strong> {invoice?.status || 'Pending'}</div>
          </InvoiceDetails>
        </InvoiceInfo>
      </Header>

      <ClientSection>
        <div>
          <SectionTitle>Bill To:</SectionTitle>
          <ClientInfo>
            <div><strong>{invoice?.clientName || 'Client Name'}</strong></div>
            {invoice?.clientEmail && <div>{invoice.clientEmail}</div>}
            {invoice?.clientPhone && <div>{invoice.clientPhone}</div>}
            {invoice?.clientAddress && (
              <div style={{ marginTop: '0.5rem' }}>
                <div>{invoice.clientAddress}</div>
                {invoice?.clientCity && (
                  <div>
                    {invoice.clientCity}
                    {invoice?.clientPostalCode && `, ${invoice.clientPostalCode}`}
                  </div>
                )}
                {invoice?.clientCountry && <div>{invoice.clientCountry}</div>}
              </div>
            )}
          </ClientInfo>
        </div>
        
        <div>
          <SectionTitle>Payment Terms:</SectionTitle>
          <ClientInfo>
            <div>Payment due within 30 days</div>
            <div>Late payments subject to 1.5% monthly interest</div>
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
                <TableCellRight>{formatCurrency(item.price)}</TableCellRight>
                <TableCellRight>{formatCurrency(item.quantity * item.price)}</TableCellRight>
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
              <TotalValue>{formatCurrency(subtotal)}</TotalValue>
            </TotalRow>
            <TotalRow className="subtotal">
              <TotalLabel>Tax (15%):</TotalLabel>
              <TotalValue>{formatCurrency(tax)}</TotalValue>
            </TotalRow>
            <TotalRow className="total">
              <TotalLabel>Total:</TotalLabel>
              <TotalValue>{formatCurrency(total)}</TotalValue>
            </TotalRow>
          </tbody>
        </TotalsTable>
      </TotalsSection>

      {businessInfo.bankDetails.bankName && (
        <PaymentSection>
          <PaymentTitle>Payment Information</PaymentTitle>
          <PaymentDetails>
            <div><strong>Bank:</strong> {businessInfo.bankDetails.bankName}</div>
            <div><strong>Account Holder:</strong> {businessInfo.bankDetails.accountHolderName}</div>
            <div><strong>Account Number:</strong> {businessInfo.bankDetails.accountNumber}</div>
            {businessInfo.bankDetails.routingNumber && (
              <div><strong>Routing Number:</strong> {businessInfo.bankDetails.routingNumber}</div>
            )}
            {businessInfo.bankDetails.swiftCode && (
              <div><strong>SWIFT Code:</strong> {businessInfo.bankDetails.swiftCode}</div>
            )}
            {businessInfo.bankDetails.iban && (
              <div><strong>IBAN:</strong> {businessInfo.bankDetails.iban}</div>
            )}
          </PaymentDetails>
        </PaymentSection>
      )}

      <Footer>
        <div>Thank you for your business!</div>
        {businessInfo.taxInfo.taxId && (
          <div>Tax ID: {businessInfo.taxInfo.taxId}</div>
        )}
        {businessInfo.taxInfo.vatNumber && (
          <div>VAT Number: {businessInfo.taxInfo.vatNumber}</div>
        )}
      </Footer>
    </InvoiceContainer>
  );
}
