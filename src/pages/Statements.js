import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiDownload, 
  FiEye, 
  FiSearch, 
  FiFileText,
  FiArrowLeft,
  FiRefreshCw
} from 'react-icons/fi';
import { useCustomer } from '../context/CustomerContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { generateStatementPDF } from '../firebase/pdf';
import { toast } from 'react-toastify';

const StatementsContainer = styled.div`
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  
  @media (min-width: 768px) {
    padding: 2rem;
    max-width: 1200px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const BackButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  
  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  
  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RefreshButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #059669;
  }
`;

// Removed unused styled components for cleaner code

const CustomerList = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

const CustomerCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CustomerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CustomerInfo = styled.div`
  flex: 1;
`;

const CustomerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const CustomerEmail = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
`;

const CustomerActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#3b82f6' : '#6b7280'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#2563eb' : '#4b5563'};
  }
`;

const StatementSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

const SummaryLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const SummaryValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => {
    switch(props.type) {
      case 'total': return '#1e293b';
      case 'outstanding': return '#dc2626';
      case 'paid': return '#059669';
      case 'overdue': return '#dc2626';
      default: return '#1e293b';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const EmptyStateText = styled.p`
  font-size: 0.875rem;
  margin: 0;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  padding: 1.5rem 1.5rem 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const StatementHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
`;

const BusinessName = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const StatementTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
`;

const StatementInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
`;

const TransactionsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

const TableHeader = styled.th`
  background: #f8fafc;
  padding: 0.75rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  
  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch(props.status) {
      case 'paid': return '#dcfce7';
      case 'pending': return '#fef3c7';
      case 'overdue': return '#fee2e2';
      default: return '#f1f5f9';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'paid': return '#166534';
      case 'pending': return '#92400e';
      case 'overdue': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const StatementFooter = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TotalSection = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
`;

const TotalLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const TotalValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  
  &::after {
    content: '';
    width: 2rem;
    height: 2rem;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * Statements of Accounts Component
 * 
 * This component provides real-time access to customer statements based on invoice data.
 * 
 * Data Flow:
 * 1. FinancialDataContext provides real-time invoice data via Firebase onSnapshot
 * 2. CustomerContext provides customer information
 * 3. Data automatically updates when invoices are created, updated, or deleted
 * 4. Statement calculations are performed in real-time based on current invoice status
 * 5. PDF generation uses the latest data from the context
 * 
 * Real-time Features:
 * - Live data indicator shows when data was last updated
 * - Toast notifications inform users of data changes
 * - Summary statistics update automatically
 * - Customer statements reflect current invoice status
 */
export default function Statements() {
  const { customers, loading: customersLoading } = useCustomer();
  const { invoices, loading: invoicesLoading } = useFinancialData();
  const { formatCurrency } = useCurrency();
  const { business } = useBusinessBranding();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Data updates are handled by the context automatically

  // Log data changes for debugging and show toast notification
  useEffect(() => {
    if (!invoicesLoading && invoices.length > 0) {
      const outstandingCount = invoices.filter(inv => inv.status !== 'paid').length;
      const paidCount = invoices.filter(inv => inv.status === 'paid').length;
      
      console.log('Statements: Invoices data updated', {
        totalInvoices: invoices.length,
        outstandingInvoices: outstandingCount,
        paidInvoices: paidCount,
        timestamp: new Date().toISOString()
      });
      
      // Show subtle notification for data updates (only if there are invoices)
      if (invoices.length > 0) {
        toast.info(`📊 Data updated: ${invoices.length} invoices loaded`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    }
  }, [invoices, invoicesLoading]);

  // Filter customers based on search term and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customer.id);
    const hasOutstanding = customerInvoices.some(invoice => invoice.status !== 'paid');
    
    if (statusFilter === 'outstanding') return matchesSearch && hasOutstanding;
    if (statusFilter === 'paid') return matchesSearch && !hasOutstanding;
    
    return matchesSearch;
  });

  // Get customer statement data
  const getCustomerStatement = (customerId) => {
    const customerInvoices = invoices.filter(invoice => invoice.customerId === customerId);
    
    const totalAmount = customerInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const paidAmount = customerInvoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const outstandingAmount = totalAmount - paidAmount;
    
    const overdueInvoices = customerInvoices.filter(invoice => {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today;
    });
    
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    return {
      totalAmount,
      paidAmount,
      outstandingAmount,
      overdueAmount,
      invoices: customerInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  };

  const handleViewStatement = (customer) => {
    setSelectedCustomer(customer);
    setShowStatementModal(true);
  };

  const handleDownloadStatement = async (customer) => {
    setIsGeneratingPDF(true);
    try {
      const statementData = getCustomerStatement(customer.id);
      const statementInfo = {
        customer,
        business,
        statementData,
        generatedDate: new Date().toISOString().split('T')[0]
      };
      
      await generateStatementPDF(statementInfo);
    } catch (error) {
      console.error('Error generating statement PDF:', error);
      alert('Error generating statement PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const closeModal = () => {
    setShowStatementModal(false);
    setSelectedCustomer(null);
  };

  // Data refresh is handled automatically by the context

  if (customersLoading || invoicesLoading) {
    return (
      <StatementsContainer>
        <Header>
          <BackButton onClick={() => window.history.back()}>
            <FiArrowLeft />
          </BackButton>
          <div>
            <Title>Statement of Accounts</Title>
            <Subtitle>View and download customer statements</Subtitle>
          </div>
        </Header>
        <LoadingSpinner />
      </StatementsContainer>
    );
  }

  return (
    <StatementsContainer>
      <Header>
        <BackButton onClick={() => window.history.back()}>
          <FiArrowLeft />
        </BackButton>
        <div>
          <Title>Statement of Accounts</Title>
          <Subtitle>View and download customer statements based on outstanding invoices</Subtitle>
        </div>
      </Header>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon>
            <FiSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Customers</option>
          <option value="outstanding">With Outstanding Invoices</option>
          <option value="paid">Fully Paid</option>
        </FilterSelect>
        
        <RefreshButton onClick={() => window.location.reload()}>
          <FiRefreshCw />
          Refresh
        </RefreshButton>
      </ControlsContainer>

      {filteredCustomers.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>
            <FiFileText />
          </EmptyStateIcon>
          <EmptyStateTitle>No customers found</EmptyStateTitle>
          <EmptyStateText>
            {searchTerm ? 'Try adjusting your search terms' : 'No customers match the selected filter'}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <CustomerList>
          {filteredCustomers.map(customer => {
            const statementData = getCustomerStatement(customer.id);
            
            return (
              <CustomerCard key={customer.id}>
                <CustomerHeader>
                  <CustomerInfo>
                    <CustomerName>{customer.name}</CustomerName>
                    <CustomerEmail>{customer.email}</CustomerEmail>
                  </CustomerInfo>
                  <CustomerActions>
                    <ActionButton
                      variant="primary"
                      onClick={() => handleViewStatement(customer)}
                      title="View Statement"
                    >
                      <FiEye />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDownloadStatement(customer)}
                      disabled={isGeneratingPDF}
                      title="Download Statement"
                    >
                      <FiDownload />
                    </ActionButton>
                  </CustomerActions>
                </CustomerHeader>
                
                <StatementSummary>
                  <SummaryItem>
                    <SummaryLabel>Total Amount</SummaryLabel>
                    <SummaryValue type="total">
                      {formatCurrency(statementData.totalAmount)}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>Outstanding</SummaryLabel>
                    <SummaryValue type="outstanding">
                      {formatCurrency(statementData.outstandingAmount)}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>Paid</SummaryLabel>
                    <SummaryValue type="paid">
                      {formatCurrency(statementData.paidAmount)}
                    </SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>Overdue</SummaryLabel>
                    <SummaryValue type="overdue">
                      {formatCurrency(statementData.overdueAmount)}
                    </SummaryValue>
                  </SummaryItem>
                </StatementSummary>
              </CustomerCard>
            );
          })}
        </CustomerList>
      )}

      {/* Statement View Modal */}
      {showStatementModal && selectedCustomer && (
        <Modal onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Statement of Account</ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <StatementHeader>
                <BusinessName>{business?.name || 'Business Name'}</BusinessName>
                <StatementTitle>Statement of Account</StatementTitle>
              </StatementHeader>
              
              <StatementInfo>
                <InfoSection>
                  <InfoLabel>Customer</InfoLabel>
                  <InfoValue>{selectedCustomer.name}</InfoValue>
                  <InfoValue>{selectedCustomer.email}</InfoValue>
                </InfoSection>
                <InfoSection>
                  <InfoLabel>Statement Period</InfoLabel>
                  <InfoValue>All Time</InfoValue>
                  <InfoValue>Generated: {new Date().toLocaleDateString()}</InfoValue>
                </InfoSection>
              </StatementInfo>
              
              <TransactionsTable>
                <thead>
                  <tr>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Invoice #</TableHeader>
                    <TableHeader>Description</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Due Date</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {getCustomerStatement(selectedCustomer.id).invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.description || 'Invoice'}</TableCell>
                      <TableCell>{formatCurrency(invoice.total || 0)}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status}>
                          {invoice.status}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </TransactionsTable>
              
              <StatementFooter>
                <TotalSection>
                  <TotalLabel>Total Outstanding</TotalLabel>
                  <TotalValue>
                    {formatCurrency(getCustomerStatement(selectedCustomer.id).outstandingAmount)}
                  </TotalValue>
                </TotalSection>
                <TotalSection>
                  <TotalLabel>Total Amount</TotalLabel>
                  <TotalValue>
                    {formatCurrency(getCustomerStatement(selectedCustomer.id).totalAmount)}
                  </TotalValue>
                </TotalSection>
              </StatementFooter>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </StatementsContainer>
  );
}
