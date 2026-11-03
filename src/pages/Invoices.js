import React, { useState } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSend, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCustomer } from '../context/CustomerContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { functionsService } from '../firebase/functions';
import InvoiceTemplate from '../components/InvoiceTemplate';

const Container = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  margin-right: 1rem;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
`;

const Button = styled.button`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.bgColor || '#f8fafc'};
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${props => props.borderColor || '#14b8a6'};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.color || '#1e293b'};
`;

const FilterTabs = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
`;

const FilterTab = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: ${props => props.active ? '#14b8a6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#0d9488' : '#e5e7eb'};
  }
`;

const InvoiceGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const InvoiceCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #14b8a6;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const InvoiceInfo = styled.div`
  flex: 1;
`;

const InvoiceNumber = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const ClientName = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
`;

const InvoiceDate = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.status) {
      case 'paid': return '#f0fdf4';
      case 'pending': return '#fef3c7';
      case 'overdue': return '#fef2f2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'paid': return '#16a34a';
      case 'pending': return '#d97706';
      case 'overdue': return '#dc2626';
      default: return '#6b7280';
    }
  }};
`;

const InvoiceDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const Amount = styled.div`
  text-align: right;
`;

const AmountValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const DueDate = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
  background: #f8fafc;
  }

  &.primary {
  background: #14b8a6;
  color: white;
    border-color: #14b8a6;
  
  &:hover {
    background: #0d9488;
    }
  }
  
  &.danger {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    
    &:hover {
      background: #dc2626;
    }
  }
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
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
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
  
  &:hover {
  color: #1e293b;
  }
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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  
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

export default function Invoices() {
  const { formatCurrency } = useCurrency();
  const { customers } = useCustomer();
  const { addIncome, addInvoice, updateInvoice, deleteInvoice, invoices, totals } = useFinancialData();
  const { user } = useFirebaseBusiness();
  const { businessInfo } = useBusinessBranding();
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientPostalCode: '',
    clientCountry: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  // Load invoices from localStorage on component mount
  // Firebase handles data loading automatically through the context

  const calculateStats = () => {
    const total = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
    const paid = invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
    const pending = invoices.filter(invoice => invoice.status === 'pending').reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
    const overdue = invoices.filter(invoice => {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo; // Must be 30+ days past due
    }).reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);
    
    return { total, paid, pending, overdue };
  };

  const stats = calculateStats();

  const generateInvoiceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const count = invoices.length + 1;
    return `INV-${year}${month}${day}-${String(count).padStart(3, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customer || !formData.amount || !formData.dueDate) {
      alert('Please select a customer and fill in all required fields');
      return;
    }

    try {
      // Structure the data properly, excluding the complex customer object
      const invoiceData = {
        // Customer reference
        customerId: typeof formData.customer === 'object' ? formData.customer.id : null,
        
        // Client information (strings for display)
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        clientAddress: formData.clientAddress || '',
        clientCity: formData.clientCity || '',
        clientPostalCode: formData.clientPostalCode || '',
        clientCountry: formData.clientCountry || '',
        
        // Invoice details
        invoiceNumber: editingInvoice ? editingInvoice.invoiceNumber : generateInvoiceNumber(),
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description || '',
        status: formData.status,
        // Only set createdAt for edits, let Firebase set it for new invoices
        ...(editingInvoice && { createdAt: editingInvoice.createdAt })
      };

      console.log('Creating invoice with structured data:', invoiceData);

      if (editingInvoice) {
        const result = await updateInvoice(editingInvoice.id, invoiceData);
        console.log('Update invoice result:', result);
        if (result.success) {
          alert('Invoice updated successfully!');
        } else {
          alert('Failed to update invoice: ' + result.error);
          return;
        }
      } else {
        const result = await addInvoice(invoiceData);
        console.log('Add invoice result:', result);
        if (result.success) {
          alert('Invoice created successfully!');
          console.log('Invoice created with ID:', result.id);
          
          // Small delay to ensure Firebase listener picks up the change
          setTimeout(() => {
            console.log('Invoices after creation:', invoices);
          }, 1000);
        } else {
          alert('Failed to create invoice: ' + result.error);
          return;
        }
      }

      setFormData({
        customer: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        clientPostalCode: '',
        clientCountry: '',
        amount: '',
        dueDate: '',
        description: '',
        status: 'pending'
      });
      setShowModal(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const handleEdit = (invoice) => {
    // Try to reconstruct customer object from invoice data or use existing customer
    let customerData = '';
    if (invoice.customerId && customers) {
      const customer = customers.find(c => c.id === invoice.customerId);
      if (customer) {
        customerData = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          company: customer.company,
          address: customer.address,
          city: customer.city,
          postalCode: customer.postalCode,
          country: customer.country
        };
      }
    }

    setFormData({
      customer: customerData,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail || '',
      clientPhone: invoice.clientPhone || '',
      clientAddress: invoice.clientAddress || '',
      clientCity: invoice.clientCity || '',
      clientPostalCode: invoice.clientPostalCode || '',
      clientCountry: invoice.clientCountry || '',
      amount: invoice.amount.toString(),
      dueDate: invoice.dueDate,
      description: invoice.description || '',
      status: invoice.status
    });
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(invoiceId);
        alert('Invoice deleted successfully!');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handlePreviewInvoice = () => {
    // Validate required fields (invoice number is auto-generated, so we don't need to check it)
    if (!formData.customer || !formData.amount || !formData.dueDate) {
      alert('Please select a customer and fill in all required fields (Customer, Amount, Due Date) before previewing');
      return;
    }

    // Create a preview invoice object from current form data
    const previewInvoice = {
      id: 'preview',
      invoiceNumber: editingInvoice ? editingInvoice.invoiceNumber : generateInvoiceNumber(),
      clientName: formData.clientName,
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      clientAddress: formData.clientAddress || '',
      clientCity: formData.clientCity || '',
      clientPostalCode: formData.clientPostalCode || '',
      clientCountry: formData.clientCountry || '',
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      description: formData.description || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setViewingInvoice(previewInvoice);
  };

  const handleMarkAsPaid = async (invoice) => {
    if (window.confirm(`Mark invoice ${invoice.invoiceNumber} as paid? This will add ${formatCurrency(invoice.amount)} to your income.`)) {
      try {
        // Update invoice status in Firebase
        await updateInvoice(invoice.id, {
          ...invoice,
          status: 'paid',
          paidDate: new Date().toISOString()
        });

        // Add to financial income
        const result = await addIncome({
          amount: invoice.amount,
          date: new Date().toISOString().split('T')[0],
          category: 'Invoice Payment',
          source: invoice.clientName,
          notes: `Payment for invoice ${invoice.invoiceNumber}`
        });

        if (result.success) {
          alert('Invoice marked as paid and added to income successfully!');
        } else {
          alert('Invoice marked as paid, but failed to add to income: ' + result.error);
        }
      } catch (error) {
        console.error('Error marking invoice as paid:', error);
        alert('Failed to mark invoice as paid. Please try again.');
      }
    }
  };

  const handleSendInvoice = async (invoice) => {
    const customerEmail = invoice.clientEmail;
    const customerName = invoice.clientName;

    if (!customerEmail) {
      alert('This invoice does not have a customer email address. Please edit the invoice to add an email.');
      return;
    }

    try {
      const result = await functionsService.sendInvoiceEmail(
        user?.uid,
        invoice.invoiceNumber,
        customerEmail,
        customerName || 'Customer',
        invoice
      );

      if (result.success) {
        alert('Invoice sent successfully!');
      } else {
        alert('Failed to send invoice: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice. Please try again.');
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      // Try the programmatic PDF generation first
      const { generateInvoicePDF, downloadPDF } = await import('../firebase/pdf');
      
      const invoiceData = {
        invoiceNumber: invoice.invoiceNumber,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        status: invoice.status,
        customer: {
          name: invoice.clientName || 'Client Name',
          email: invoice.clientEmail || '',
          phone: invoice.clientPhone || '',
          address: invoice.clientAddress || '',
          city: invoice.clientCity || '',
          postalCode: invoice.clientPostalCode || '',
          country: invoice.clientCountry || ''
        },
        items: [{
          description: invoice.description || 'Services rendered',
          quantity: 1,
          price: invoice.amount
        }]
      };
      
      const businessData = {
        name: businessInfo.businessName || 'Your Business Name',
        address: businessInfo.businessAddress || '',
        phone: businessInfo.businessPhone || '',
        email: businessInfo.businessEmail || '',
        website: businessInfo.businessWebsite || '',
        taxInfo: businessInfo.taxInfo || {},
        bankDetails: businessInfo.bankDetails || {}
      };
      
      console.log('Generating invoice PDF with data:', { invoiceData, businessData });
      
      const pdf = generateInvoicePDF(invoiceData, businessData);
      const filename = `Invoice_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdf, filename);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      
      // Fallback: Use html2canvas approach
      try {
        const tempElement = document.createElement('div');
        tempElement.id = 'temp-invoice-pdf';
        tempElement.style.position = 'absolute';
        tempElement.style.left = '-9999px';
        tempElement.style.top = '-9999px';
        tempElement.style.visibility = 'hidden';
        tempElement.style.width = '800px';
        tempElement.style.minHeight = '600px';
        tempElement.style.backgroundColor = '#ffffff';
        tempElement.style.padding = '20px';
        tempElement.style.boxSizing = 'border-box';
        
        document.body.appendChild(tempElement);

        const { createRoot } = await import('react-dom/client');
        const { generatePDFFromElement } = await import('../firebase/pdf');
        
        const root = createRoot(tempElement);
        
        root.render(
          React.createElement(InvoiceTemplate, {
            invoice: {
              ...invoice,
              clientAddress: invoice.clientAddress || '',
              clientCity: invoice.clientCity || '',
              clientPostalCode: invoice.clientPostalCode || '',
              clientCountry: invoice.clientCountry || ''
            },
            items: [{
              description: invoice.description || 'Services rendered',
              quantity: 1,
              price: invoice.amount
            }]
          })
        );

        setTimeout(async () => {
          try {
            const filename = `Invoice_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
            await generatePDFFromElement('temp-invoice-pdf', filename);
            
            root.unmount();
            document.body.removeChild(tempElement);
          } catch (error) {
            console.error('Error generating PDF with fallback approach:', error);
            alert('Failed to generate PDF. Please try again.');
            
            try {
              root.unmount();
              document.body.removeChild(tempElement);
            } catch (cleanupError) {
              console.error('Error during cleanup:', cleanupError);
            }
          }
        }, 2000);
        
      } catch (fallbackError) {
        console.error('Error with fallback PDF generation:', fallbackError);
        alert('Failed to download invoice. Please try again.');
      }
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo; // Must be 30+ days past due to be considered overdue
    }
    return invoice.status === filterStatus;
  });

  // Debug: Log invoices data and verify consistency with Reports
  console.log('Invoices - Data consistency check:', {
    totalInvoices: invoices.length,
    filteredInvoices: filteredInvoices.length,
    filterStatus,
    stats,
    invoicesData: invoices
  });

  // Verify calculations match what Reports tab would show
  console.log('Invoices - Verification for Reports correspondence:', {
    invoiceStats: stats,
    contextTotals: {
      pendingAmount: totals?.pendingAmount,
      paidAmount: totals?.paidAmount,
      overdueAmount: totals?.overdueAmount
    },
    dataMatches: {
      paid: Math.abs(stats.paid - (totals?.paidAmount || 0)) < 0.01,
      pending: Math.abs(stats.pending - (totals?.pendingAmount || 0)) < 0.01,
      overdue: Math.abs(stats.overdue - (totals?.overdueAmount || 0)) < 0.01
    }
  });

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={() => window.history.back()} title="Go back">
            <FiArrowLeft />
          </BackButton>
          <Title>Invoice Management</Title>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Create Invoice
        </Button>
      </Header>

      <StatsGrid>
        <StatCard bgColor="#f0fdf4" borderColor="#16a34a">
          <StatLabel>Total Invoices</StatLabel>
          <StatValue color="#16a34a">{formatCurrency(stats.total)}</StatValue>
        </StatCard>
        <StatCard bgColor="#f0fdf4" borderColor="#16a34a">
          <StatLabel>Paid</StatLabel>
          <StatValue color="#16a34a">{formatCurrency(stats.paid)}</StatValue>
        </StatCard>
        <StatCard bgColor="#fef3c7" borderColor="#d97706">
          <StatLabel>Pending</StatLabel>
          <StatValue color="#d97706">{formatCurrency(stats.pending)}</StatValue>
        </StatCard>
        <StatCard bgColor="#fef2f2" borderColor="#dc2626">
          <StatLabel>Overdue</StatLabel>
          <StatValue color="#dc2626">{formatCurrency(stats.overdue)}</StatValue>
        </StatCard>
      </StatsGrid>

      <FilterTabs>
        <FilterTab 
          active={filterStatus === 'all'} 
          onClick={() => setFilterStatus('all')}
        >
          All Invoices
        </FilterTab>
        <FilterTab 
          active={filterStatus === 'pending'} 
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </FilterTab>
        <FilterTab 
          active={filterStatus === 'paid'} 
          onClick={() => setFilterStatus('paid')}
        >
          Paid
        </FilterTab>
        <FilterTab 
          active={filterStatus === 'overdue'} 
          onClick={() => setFilterStatus('overdue')}
        >
          Overdue
        </FilterTab>
      </FilterTabs>

      <InvoiceGrid>
        {filteredInvoices.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#64748b',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <p>No invoices found</p>
            {filterStatus !== 'all' && <p>Try changing the filter or create your first invoice</p>}
          </div>
        )}
        {filteredInvoices.map(invoice => {
          console.log('Rendering invoice:', invoice);
          return (
            <InvoiceCard key={invoice.id}>
            <InvoiceHeader>
              <InvoiceInfo>
                <InvoiceNumber>{invoice.invoiceNumber}</InvoiceNumber>
                <ClientName>{invoice.clientName}</ClientName>
                <InvoiceDate>
                  Created: {new Date(invoice.createdAt).toLocaleDateString()}
                </InvoiceDate>
              </InvoiceInfo>
              <StatusBadge status={invoice.status}>
                {(() => {
                  if (invoice.status === 'paid') return 'paid';
                  if (invoice.status === 'pending') {
                    const dueDate = new Date(invoice.dueDate);
                    const now = new Date();
                    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                    const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                    
                    if (dueDate < thirtyDaysAgo) {
                      return `pending (Overdue ${daysLate} days)`;
                    } else if (dueDate < now) {
                      return `pending (Late ${daysLate} days)`;
                    } else {
                      return 'pending';
                    }
                  }
                  return invoice.status;
                })()}
              </StatusBadge>
            </InvoiceHeader>
            
            <InvoiceDetails>
              <div>
                <DueDate>Due: {new Date(invoice.dueDate).toLocaleDateString()}</DueDate>
                {invoice.description && (
                  <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {invoice.description}
                  </div>
                )}
              </div>
              <Amount>
                <AmountValue>{formatCurrency(invoice.amount)}</AmountValue>
              </Amount>
            </InvoiceDetails>

            <Actions>
              <ActionButton onClick={() => setViewingInvoice(invoice)}>
                View
              </ActionButton>
              <ActionButton 
                onClick={() => handleSendInvoice(invoice)}
                style={{ background: '#14b8a6', color: 'white', borderColor: '#14b8a6' }}
                title="Send invoice via email"
              >
                <FiSend style={{ marginRight: '0.25rem' }} />
                Send
              </ActionButton>
              {invoice.status !== 'paid' && (
                <ActionButton 
                  className="primary" 
                  onClick={() => handleMarkAsPaid(invoice)}
                >
                  Mark as Paid
                </ActionButton>
              )}
              <ActionButton 
                className="danger" 
                onClick={() => handleDelete(invoice.id)}
              >
                Delete
              </ActionButton>
            </Actions>
          </InvoiceCard>
          );
        })}
      </InvoiceGrid>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Customer *</Label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Select
                    value={typeof formData.customer === 'object' ? formData.customer.id : formData.customer}
                    onChange={(e) => {
                      const customerId = e.target.value;
                      if (customerId) {
                        const customer = customers.find(c => c.id === customerId);
                        if (customer) {
                          setFormData(prev => ({
                            ...prev,
                            customer: {
                              id: customer.id,
                              name: customer.name,
                              email: customer.email,
                              phone: customer.phone,
                              company: customer.company,
                              address: customer.address,
                              city: customer.city,
                              postalCode: customer.postalCode,
                              country: customer.country
                            },
                            clientName: customer.name,
                            clientEmail: customer.email || '',
                            clientPhone: customer.phone || '',
                            clientAddress: customer.address || '',
                            clientCity: customer.city || '',
                            clientPostalCode: customer.postalCode || '',
                            clientCountry: customer.country || ''
                          }));
                        }
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          customer: '',
                          clientName: '',
                          clientEmail: '',
                          clientPhone: '',
                          clientAddress: '',
                          clientCity: '',
                          clientPostalCode: '',
                          clientCountry: ''
                        }));
                      }
                    }}
                    style={{ flex: 1 }}
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers && customers.length > 0 ? (
                      customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company ? `(${customer.company})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No customers available</option>
                    )}
                  </Select>
                  <button
                    type="button"
                    onClick={() => window.open('/customers', '_blank')}
                    style={{ 
                      padding: '0.5rem', 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FiPlus />
                  </button>
                </div>
              </FormGroup>

              {formData.customer && (
                <FormGroup>
                  <Label>Customer Details</Label>
                  <div style={{ 
                    padding: '0.75rem', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#64748b'
                  }}>
                    <div><strong>{formData.clientName}</strong></div>
                    {formData.clientEmail && <div>Email: {formData.clientEmail}</div>}
                    {formData.clientPhone && <div>Phone: {formData.clientPhone}</div>}
                    {formData.clientAddress && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div>Address:</div>
                        <div>{formData.clientAddress}</div>
                        {formData.clientCity && (
                          <div>
                            {formData.clientCity}
                            {formData.clientPostalCode && `, ${formData.clientPostalCode}`}
                          </div>
                        )}
                        {formData.clientCountry && <div>{formData.clientCountry}</div>}
                      </div>
                    )}
                  </div>
                </FormGroup>
              )}

              <FormGroup>
                <Label>Amount *</Label>
                <Input
                type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the services or products..."
                />
              </FormGroup>

              <Actions style={{ marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                <ActionButton type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton type="button" onClick={handlePreviewInvoice} style={{ background: '#6b7280' }}>
                  Preview Invoice
                </ActionButton>
                <ActionButton type="submit" className="primary">
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </ActionButton>
              </Actions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {viewingInvoice && (
        <Modal onClick={(e) => e.target === e.currentTarget && setViewingInvoice(null)}>
          <ModalContent style={{ maxWidth: '900px', width: '95%' }}>
            <ModalHeader>
              <ModalTitle>Invoice Preview</ModalTitle>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ActionButton 
                  onClick={() => handleDownloadInvoice(viewingInvoice)}
                  style={{ background: '#3b82f6', color: 'white', borderColor: '#3b82f6' }}
                  title="Download invoice as PDF"
                >
                  <FiDownload style={{ marginRight: '0.25rem' }} />
                  Download
                </ActionButton>
                <ActionButton 
                  onClick={() => {
                    handleEdit(viewingInvoice);
                    setViewingInvoice(null); // Close preview modal when opening edit modal
                  }}
                  style={{ background: '#6b7280', color: 'white', borderColor: '#6b7280' }}
                  title="Edit invoice"
                >
                  Edit
                </ActionButton>
                <CloseButton onClick={() => setViewingInvoice(null)}>×</CloseButton>
              </div>
            </ModalHeader>
            <InvoiceTemplate 
              invoice={viewingInvoice}
              items={[{
                description: viewingInvoice.description || 'Services rendered',
                quantity: 1,
                price: viewingInvoice.amount
              }]}
            />
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}