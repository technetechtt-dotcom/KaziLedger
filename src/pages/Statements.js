import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiDownload, 
  FiEye, 
  FiSearch, 
  FiFileText,
  FiArrowLeft,
  FiRefreshCw,
  FiGrid,
  FiMail
} from 'react-icons/fi';
import { useCustomer } from '../context/CustomerContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { generateStatementPDF, generateCombinedOutstandingStatementPDF } from '../firebase/pdf';
import { exportStatementToExcel, exportCombinedOutstandingToExcel } from '../utils/statementExcel';
import {
  AGING_LABELS,
  buildArAging,
  getInvoiceBalance,
  isOutstandingInvoice
} from '../utils/arAging';
import { functionsService } from '../firebase/functions';
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
  background: ${props => {
    if (props.variant === 'primary') return '#3b82f6';
    if (props.variant === 'excel') return '#059669';
    return '#6b7280';
  }};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  
  &:hover {
    background: ${props => {
      if (props.variant === 'primary') return '#2563eb';
      if (props.variant === 'excel') return '#047857';
      return '#4b5563';
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  const { invoices, loading: invoicesLoading, updateInvoice } = useFinancialData();
  const { formatCurrency } = useCurrency();
  const { business } = useBusinessBranding();
  const { user } = useFirebaseBusiness();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const PERIOD_OPTIONS = [
    { value: 'all', label: 'All Time' },
    { value: '2weeks', label: 'Last 2 Weeks' },
    { value: '1month', label: 'Last 1 Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 1 Year' }
  ];

  const getInvoiceAmount = (invoice) => parseFloat(invoice?.total ?? invoice?.amount ?? 0) || 0;

  const resolveCustomer = (invoice) => {
    if (invoice.customerId) {
      const match = customers.find(c => c.id === invoice.customerId);
      if (match) return match;
    }
    return null;
  };

  const getPeriodStartDate = (period) => {
    if (period === 'all') return null;
    const now = new Date();
    const start = new Date(now);
    switch (period) {
      case '2weeks':
        start.setDate(start.getDate() - 14);
        break;
      case '1month':
        start.setMonth(start.getMonth() - 1);
        break;
      case '3months':
        start.setMonth(start.getMonth() - 3);
        break;
      case '6months':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        return null;
    }
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getPeriodLabel = (period) =>
    PERIOD_OPTIONS.find(option => option.value === period)?.label || 'All Time';

  const getInvoiceDate = (invoice) => {
    const raw = invoice.invoiceDate || invoice.createdAt || invoice.dueDate;
    if (!raw) return null;
    if (typeof raw === 'object' && typeof raw.toDate === 'function') {
      return raw.toDate();
    }
    return new Date(raw);
  };

  const isInvoiceInPeriod = (invoice, period) => {
    const startDate = getPeriodStartDate(period);
    if (!startDate) return true;
    const invoiceDate = getInvoiceDate(invoice);
    if (!invoiceDate || Number.isNaN(invoiceDate.getTime())) return false;
    return invoiceDate >= startDate;
  };

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
    
    const customerInvoices = invoices.filter(invoice =>
      invoice.customerId === customer.id && isInvoiceInPeriod(invoice, periodFilter)
    );
    const hasOutstanding = customerInvoices.some(invoice => invoice.status !== 'paid');
    
    if (statusFilter === 'outstanding') return matchesSearch && hasOutstanding;
    if (statusFilter === 'paid') return matchesSearch && customerInvoices.length > 0 && !hasOutstanding;
    
    return matchesSearch;
  });

  // Get customer statement data
  const getCustomerStatement = (customerId) => {
    const customerInvoices = invoices.filter(invoice =>
      invoice.customerId === customerId && isInvoiceInPeriod(invoice, periodFilter)
    );

    const creditNotes = customerInvoices.filter(inv => inv.type === 'credit_note');
    const regularInvoices = customerInvoices.filter(inv => inv.type !== 'credit_note');
    
    const totalAmount = regularInvoices.reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);
    const creditTotal = creditNotes.reduce((sum, invoice) => sum + Math.abs(getInvoiceAmount(invoice)), 0);
    const paidAmount = regularInvoices
      .reduce((sum, invoice) => sum + (parseFloat(invoice.amountPaid) || (invoice.status === 'paid' ? getInvoiceAmount(invoice) : 0)), 0);
    const outstandingAmount = Math.max(
      0,
      regularInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0) - creditTotal
    );
    
    const overdueInvoices = regularInvoices.filter(invoice => {
      if (!isOutstandingInvoice(invoice)) return false;
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      return dueDate < today;
    });
    
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + getInvoiceBalance(invoice), 0);
    const aging = buildArAging(regularInvoices);
    
    return {
      totalAmount,
      paidAmount,
      outstandingAmount,
      overdueAmount,
      creditTotal,
      aging,
      periodLabel: getPeriodLabel(periodFilter),
      invoices: customerInvoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    };
  };

  const getCombinedOutstandingStatement = () => {
    const periodInvoices = invoices.filter(invoice => isInvoiceInPeriod(invoice, periodFilter));
    const outstanding = periodInvoices
      .filter(isOutstandingInvoice)
      .map((invoice) => {
        const customer = resolveCustomer(invoice);
        return {
          ...invoice,
          customerName: customer?.name || invoice.clientName || invoice.customerName || 'Customer',
          customerEmail: customer?.email || invoice.clientEmail || '',
          balance: getInvoiceBalance(invoice)
        };
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const customerIds = new Set(outstanding.map(inv => inv.customerId).filter(Boolean));
    const overdueAmount = outstanding
      .filter(inv => new Date(inv.dueDate) < new Date())
      .reduce((sum, inv) => sum + getInvoiceBalance(inv), 0);
    const outstandingAmount = outstanding.reduce((sum, inv) => sum + getInvoiceBalance(inv), 0);
    const aging = buildArAging(outstanding);

    return {
      invoices: outstanding,
      invoiceCount: outstanding.length,
      customerCount: customerIds.size,
      outstandingAmount,
      overdueAmount,
      aging,
      periodLabel: getPeriodLabel(periodFilter)
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
        periodLabel: statementData.periodLabel,
        generatedDate: new Date().toISOString().split('T')[0]
      };
      
      await generateStatementPDF(statementInfo);
      toast.success('Statement PDF downloaded');
    } catch (error) {
      console.error('Error generating statement PDF:', error);
      alert('Error generating statement PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportExcel = async (customer) => {
    setIsExportingExcel(true);
    try {
      const statementData = getCustomerStatement(customer.id);
      const result = exportStatementToExcel({
        customer,
        business,
        statementData,
        periodLabel: statementData.periodLabel,
        generatedDate: new Date().toISOString().split('T')[0]
      });

      if (result.success) {
        toast.success('Statement Excel sheet downloaded');
      }
    } catch (error) {
      console.error('Error exporting statement Excel:', error);
      alert('Error exporting statement to Excel. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleCombinedPdf = async () => {
    setIsGeneratingPDF(true);
    try {
      const statementData = getCombinedOutstandingStatement();
      if (statementData.invoiceCount === 0) {
        toast.info('No outstanding invoices for this period');
        return;
      }
      await generateCombinedOutstandingStatementPDF({
        business,
        statementData,
        periodLabel: statementData.periodLabel,
        generatedDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Combined outstanding PDF downloaded');
    } catch (error) {
      console.error('Error generating combined PDF:', error);
      alert('Error generating combined statement PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCombinedExcel = async () => {
    setIsExportingExcel(true);
    try {
      const statementData = getCombinedOutstandingStatement();
      if (statementData.invoiceCount === 0) {
        toast.info('No outstanding invoices for this period');
        return;
      }
      exportCombinedOutstandingToExcel({
        business,
        statementData,
        periodLabel: statementData.periodLabel,
        generatedDate: new Date().toISOString().split('T')[0]
      });
      toast.success('Combined outstanding Excel downloaded');
    } catch (error) {
      console.error('Error exporting combined Excel:', error);
      alert('Error exporting combined statement Excel. Please try again.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const sendInvoiceReminder = async (invoice) => {
    const email = invoice.clientEmail || invoice.customerEmail || resolveCustomer(invoice)?.email;
    const name = invoice.clientName || invoice.customerName || resolveCustomer(invoice)?.name || 'Customer';
    if (!email) {
      throw new Error(`No email for invoice ${invoice.invoiceNumber}`);
    }

    const reminderPayload = {
      ...invoice,
      description: `PAYMENT REMINDER: ${invoice.description || 'Invoice'}`,
      reminder: true
    };

    const result = await functionsService.sendInvoiceEmail(
      user?.uid,
      invoice.id || invoice.invoiceNumber,
      email,
      name,
      reminderPayload
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to send reminder');
    }

    await updateInvoice(invoice.id, {
      ...invoice,
      lastReminderAt: new Date().toISOString()
    });
  };

  const handleRemindAllOverdue = async () => {
    setIsSendingReminders(true);
    try {
      const combined = getCombinedOutstandingStatement();
      const overdue = combined.invoices.filter(inv => new Date(inv.dueDate) < new Date());
      if (overdue.length === 0) {
        toast.info('No overdue invoices to remind');
        return;
      }

      const cloudResult = await functionsService.sendPaymentReminders();
      if (cloudResult.success) {
        for (const invoice of overdue) {
          await updateInvoice(invoice.id, {
            ...invoice,
            lastReminderAt: new Date().toISOString()
          });
        }
        toast.success(`Payment reminders sent for ${overdue.length} overdue invoice(s)`);
        return;
      }

      let sent = 0;
      let failed = 0;
      for (const invoice of overdue) {
        try {
          await sendInvoiceReminder(invoice);
          sent += 1;
        } catch (err) {
          console.error(err);
          failed += 1;
        }
      }
      toast.success(`Reminders sent: ${sent}${failed ? `, failed: ${failed}` : ''}`);
    } catch (error) {
      console.error('Error sending reminders:', error);
      alert('Error sending payment reminders. Please try again.');
    } finally {
      setIsSendingReminders(false);
    }
  };

  const closeModal = () => {
    setShowStatementModal(false);
    setSelectedCustomer(null);
  };

  const combinedSummary = getCombinedOutstandingStatement();

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
        <div style={{ flex: 1 }}>
          <Title>Statement of Accounts</Title>
          <Subtitle>View and download customer statements based on outstanding invoices</Subtitle>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <ActionButton
            onClick={handleCombinedPdf}
            disabled={isGeneratingPDF || combinedSummary.invoiceCount === 0}
            title="Download combined outstanding PDF"
          >
            <FiDownload /> Combined PDF
          </ActionButton>
          <ActionButton
            variant="excel"
            onClick={handleCombinedExcel}
            disabled={isExportingExcel || combinedSummary.invoiceCount === 0}
            title="Export combined outstanding Excel"
          >
            <FiGrid /> Combined Excel
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={handleRemindAllOverdue}
            disabled={isSendingReminders}
            title="Remind all overdue"
          >
            <FiMail /> Remind Overdue
          </ActionButton>
        </div>
      </Header>

      <StatementSummary style={{ marginBottom: '1.5rem' }}>
        <SummaryItem>
          <SummaryLabel>Combined Outstanding</SummaryLabel>
          <SummaryValue type="outstanding">{formatCurrency(combinedSummary.outstandingAmount)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Overdue</SummaryLabel>
          <SummaryValue type="overdue">{formatCurrency(combinedSummary.overdueAmount)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Outstanding Invoices</SummaryLabel>
          <SummaryValue type="total">{combinedSummary.invoiceCount}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Customers Owing</SummaryLabel>
          <SummaryValue type="total">{combinedSummary.customerCount}</SummaryValue>
        </SummaryItem>
      </StatementSummary>

      <div style={{
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.75rem' }}>
          AR Aging ({getPeriodLabel(periodFilter)})
        </div>
        <StatementSummary style={{ marginBottom: 0 }}>
          {AGING_LABELS.map(({ key, label }) => (
            <SummaryItem key={key}>
              <SummaryLabel>{label}</SummaryLabel>
              <SummaryValue type={key === 'current' ? 'paid' : 'outstanding'}>
                {formatCurrency(combinedSummary.aging[key] || 0)}
              </SummaryValue>
            </SummaryItem>
          ))}
        </StatementSummary>
      </div>

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

        <FilterSelect
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          aria-label="Statement period"
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
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
                      title="Download PDF"
                    >
                      <FiDownload />
                    </ActionButton>
                    <ActionButton
                      variant="excel"
                      onClick={() => handleExportExcel(customer)}
                      disabled={isExportingExcel}
                      title="Export Excel"
                    >
                      <FiGrid />
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
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <ActionButton
                  onClick={() => handleDownloadStatement(selectedCustomer)}
                  disabled={isGeneratingPDF}
                  title="Download PDF"
                >
                  <FiDownload />
                  PDF
                </ActionButton>
                <ActionButton
                  variant="excel"
                  onClick={() => handleExportExcel(selectedCustomer)}
                  disabled={isExportingExcel}
                  title="Export Excel"
                >
                  <FiGrid />
                  Excel
                </ActionButton>
                <CloseButton onClick={closeModal}>×</CloseButton>
              </div>
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
                  <InfoValue>{getCustomerStatement(selectedCustomer.id).periodLabel}</InfoValue>
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
                      <TableCell>{formatCurrency(getInvoiceAmount(invoice))}</TableCell>
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
