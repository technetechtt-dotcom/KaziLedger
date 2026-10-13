import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiArrowLeft,
  FiDownload,
  FiX,
  FiChevronDown
} from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFinancialData } from '../context/FinancialDataContext';

const ReportsContainer = styled.div`
  padding: 0;
  max-width: 400px;
  margin: 0 auto;
  background: white;
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1e293b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const TimePeriodTabs = styled.div`
  display: flex;
  margin: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
`;

const TimeTab = styled.button`
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


const ContentArea = styled.div`
  padding: 1rem;
`;


const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const FinancialCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FinancialRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
    font-weight: 700;
    font-size: 1.125rem;
  }
`;

const FinancialLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const FinancialValue = styled.div`
  font-size: 0.875rem;
  color: ${props => props.positive ? '#14b8a6' : '#1e293b'};
  font-weight: ${props => props.positive ? '700' : '500'};
`;

const ExportButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

// Export Modal Styles
const ModalOverlay = styled.div`
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
`;

const ModalSectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const SelectContainer = styled.div`
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f9fafb;
  appearance: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    background: white;
  }
`;

const SelectIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #14b8a6;
  pointer-events: none;
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  cursor: pointer;
`;

const ToggleInfo = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const ToggleInput = styled.input`
  position: relative;
  width: 48px;
  height: 24px;
  appearance: none;
  background: #d1d5db;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:checked {
    background: #14b8a6;
  }
  
  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.2s ease;
  }
  
  &:checked:before {
    transform: translateX(24px);
  }
`;

const ExportModalButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  
  &:hover {
    background: #0d9488;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

export default function Reports() {
  const { formatCurrency } = useCurrency();
  const { invoices, income, expenses, quotes } = useFinancialData();
  const [activePeriod, setActivePeriod] = useState('daily');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBalanceSheet, setShowBalanceSheet] = useState(false);
  const [showProfitLoss, setShowProfitLoss] = useState(false);
  const [useAllTimeData, setUseAllTimeData] = useState(true); // Default to all-time data to show invoice data
  const [exportSettings, setExportSettings] = useState({
    format: 'PDF',
    dateRange: 'Last 30 Days',
    reportType: 'Profit & Loss',
    currency: 'USD',
    detailedTransactions: false,
    customLogo: false
  });

  // Firebase handles data loading automatically through the context

  const handleBack = () => {
    window.history.back();
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleCloseModal = () => {
    setShowExportModal(false);
  };

  const handleExportSettingChange = (field, value) => {
    setExportSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportSubmit = () => {
    console.log('Exporting with settings:', exportSettings);
    generateReport();
    setShowExportModal(false);
  };

  // Get date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (activePeriod) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'weekly':
        const startOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
        endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 6, 23, 59, 59);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return { startDate, endDate };
  };

  // Filter data by date range
  const filterDataByPeriod = (data, dateField = 'date') => {
    const { startDate, endDate } = getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculate detailed financial metrics
  const calculateDetailedMetrics = () => {
    // Use all-time data or period-filtered data based on toggle
    const filteredIncome = useAllTimeData ? income : filterDataByPeriod(income);
    const filteredExpenses = useAllTimeData ? expenses : filterDataByPeriod(expenses);
    const filteredInvoices = useAllTimeData ? invoices : filterDataByPeriod(invoices, 'createdAt');
    const filteredQuotes = useAllTimeData ? quotes : filterDataByPeriod(quotes, 'createdAt');

    // Debug filtered invoices
    console.log('calculateDetailedMetrics - Invoice filtering debug:', {
      useAllTimeData,
      totalInvoices: invoices.length,
      filteredInvoicesCount: filteredInvoices.length,
      sampleInvoice: filteredInvoices.length > 0 ? filteredInvoices[0] : 'No invoices',
      invoiceStatuses: filteredInvoices.map(inv => inv.status)
    });

    // Income breakdown
    const incomeByCategory = filteredIncome.reduce((acc, item) => {
      const category = item.category || 'Other';
      acc[category] = (acc[category] || 0) + parseFloat(item.amount || 0);
      return acc;
    }, {});

    // Expense breakdown
    const expensesByCategory = filteredExpenses.reduce((acc, item) => {
      const category = item.category || 'Other';
      acc[category] = (acc[category] || 0) + parseFloat(item.amount || 0);
      return acc;
    }, {});

    // Invoice metrics
    const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pending');
    const overdueInvoices = filteredInvoices.filter(inv => {
      if (inv.status === 'paid') return false;
      const dueDate = new Date(inv.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo;
    });

    // Quote metrics
    const acceptedQuotes = filteredQuotes.filter(q => q.status === 'accepted');
    const pendingQuotes = filteredQuotes.filter(q => q.status === 'pending');
    const rejectedQuotes = filteredQuotes.filter(q => q.status === 'rejected');

    // Totals
    const totalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalInvoiceRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    return {
      income: {
        total: totalIncome,
        byCategory: incomeByCategory,
        transactions: filteredIncome
      },
      expenses: {
        total: totalExpenses,
        byCategory: expensesByCategory,
        transactions: filteredExpenses
      },
      invoices: {
        paid: { count: paidInvoices.length, amount: totalInvoiceRevenue, list: paidInvoices },
        pending: { count: pendingInvoices.length, amount: totalPendingAmount, list: pendingInvoices },
        overdue: { count: overdueInvoices.length, amount: totalOverdueAmount, list: overdueInvoices },
        total: { count: filteredInvoices.length, amount: filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) }
      },
      quotes: {
        accepted: { count: acceptedQuotes.length, list: acceptedQuotes },
        pending: { count: pendingQuotes.length, list: pendingQuotes },
        rejected: { count: rejectedQuotes.length, list: rejectedQuotes },
        total: { count: filteredQuotes.length }
      },
      netProfit: totalIncome + totalInvoiceRevenue - totalExpenses,
      period: activePeriod
    };
  };

  // Generate and download report
  const generateReport = async () => {
    try {
      const reportData = calculateDetailedMetrics();
      const { startDate, endDate } = getDateRange();
      
      // Create detailed report content
      const reportContent = `
FINANCIAL REPORT - ${activePeriod.toUpperCase()}
Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}
Generated: ${new Date().toLocaleString()}

=== INCOME SUMMARY ===
Total Income: ${formatCurrency(reportData.income.total)}

Income by Category:
${Object.entries(reportData.income.byCategory).map(([cat, amount]) => 
  `${cat}: ${formatCurrency(amount)}`
).join('\n')}

Detailed Income Transactions:
${reportData.income.transactions.map(item => 
  `${new Date(item.date || item.createdAt).toLocaleDateString()} - ${item.category || 'Other'}: ${formatCurrency(item.amount)} ${item.notes ? `(${item.notes})` : ''}`
).join('\n')}

=== EXPENSE SUMMARY ===
Total Expenses: ${formatCurrency(reportData.expenses.total)}

Expenses by Category:
${Object.entries(reportData.expenses.byCategory).map(([cat, amount]) => 
  `${cat}: ${formatCurrency(amount)}`
).join('\n')}

Detailed Expense Transactions:
${reportData.expenses.transactions.map(item => 
  `${new Date(item.date || item.createdAt).toLocaleDateString()} - ${item.category || 'Other'}: ${formatCurrency(item.amount)} ${item.vendor ? `(${item.vendor})` : ''} ${item.notes ? `- ${item.notes}` : ''}`
).join('\n')}

=== INVOICE SUMMARY ===
Total Invoice Revenue: ${formatCurrency(reportData.invoices.paid.amount)}
Pending Invoices: ${reportData.invoices.pending.count} (${formatCurrency(reportData.invoices.pending.amount)})
Overdue Invoices: ${reportData.invoices.overdue.count} (${formatCurrency(reportData.invoices.overdue.amount)})

Paid Invoices:
${reportData.invoices.paid.list.map(inv => 
  `${inv.invoiceNumber} - ${inv.clientName}: ${formatCurrency(inv.amount)} (Paid: ${new Date(inv.paidDate || inv.createdAt).toLocaleDateString()})`
).join('\n')}

Pending Invoices:
${reportData.invoices.pending.list.map(inv => 
  `${inv.invoiceNumber} - ${inv.clientName}: ${formatCurrency(inv.amount)} (Due: ${new Date(inv.dueDate).toLocaleDateString()})`
).join('\n')}

=== QUOTE SUMMARY ===
Total Quotes: ${reportData.quotes.total.count}
Accepted: ${reportData.quotes.accepted.count}
Pending: ${reportData.quotes.pending.count}
Rejected: ${reportData.quotes.rejected.count}

=== PROFIT & LOSS ===
Total Revenue: ${formatCurrency(reportData.income.total + reportData.invoices.paid.amount)}
Total Expenses: ${formatCurrency(reportData.expenses.total)}
Net Profit: ${formatCurrency(reportData.netProfit)}
Profit Margin: ${reportData.income.total + reportData.invoices.paid.amount > 0 ? 
  ((reportData.netProfit / (reportData.income.total + reportData.invoices.paid.amount)) * 100).toFixed(2) : 0}%
      `;

      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial_Report_${activePeriod}_${new Date().toISOString().split('T')[0]}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };



  const handleViewBalanceSheet = () => {
    setShowBalanceSheet(true);
  };

  const handleBackFromBalanceSheet = () => {
    setShowBalanceSheet(false);
  };

  const handleViewProfitLoss = () => {
    setShowProfitLoss(true);
  };

  const handleBackFromProfitLoss = () => {
    setShowProfitLoss(false);
  };

  if (showProfitLoss) {
    const detailedReportData = calculateDetailedMetrics();
    
    return (
      <ReportsContainer>
        <TopBar>
          <BackButton onClick={handleBackFromProfitLoss}>
            <FiArrowLeft />
          </BackButton>
          <Title>Profit & Loss</Title>
          <div></div>
        </TopBar>

        <ContentArea>
          <SectionTitle>Income Sources</SectionTitle>
          <FinancialCard>
            {Object.entries(detailedReportData.income.byCategory).length > 0 ? (
              Object.entries(detailedReportData.income.byCategory).map(([category, amount]) => (
                <FinancialRow key={category}>
                  <FinancialLabel>{category}</FinancialLabel>
                  <FinancialValue style={{ color: '#14b8a6' }}>{formatCurrency(amount)}</FinancialValue>
            </FinancialRow>
              ))
            ) : (
              <FinancialRow>
                <FinancialLabel style={{ textAlign: 'center', color: '#64748b' }}>No income recorded for this period</FinancialLabel>
                <FinancialValue></FinancialValue>
            </FinancialRow>
            )}
            <FinancialRow style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem', backgroundColor: '#f8fafc', fontWeight: '700' }}>
              <FinancialLabel style={{ fontWeight: '700' }}>Total Income</FinancialLabel>
              <FinancialValue style={{ color: '#14b8a6', fontWeight: '700' }}>{formatCurrency(detailedReportData.income.total)}</FinancialValue>
            </FinancialRow>
          </FinancialCard>

          <SectionTitle>Expense Categories</SectionTitle>
          <FinancialCard>
            {Object.entries(detailedReportData.expenses.byCategory).length > 0 ? (
              Object.entries(detailedReportData.expenses.byCategory).map(([category, amount]) => (
                <FinancialRow key={category}>
                  <FinancialLabel>{category}</FinancialLabel>
                  <FinancialValue style={{ color: '#dc2626' }}>-{formatCurrency(amount)}</FinancialValue>
                </FinancialRow>
              ))
            ) : (
              <FinancialRow>
                <FinancialLabel style={{ textAlign: 'center', color: '#64748b' }}>No expenses recorded for this period</FinancialLabel>
                <FinancialValue></FinancialValue>
              </FinancialRow>
            )}
            <FinancialRow style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem', backgroundColor: '#f8fafc', fontWeight: '700' }}>
              <FinancialLabel style={{ fontWeight: '700' }}>Total Expenses</FinancialLabel>
              <FinancialValue style={{ color: '#dc2626', fontWeight: '700' }}>-{formatCurrency(detailedReportData.expenses.total)}</FinancialValue>
            </FinancialRow>
          </FinancialCard>

          <FinancialCard style={{ backgroundColor: detailedReportData.netProfit >= 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${detailedReportData.netProfit >= 0 ? '#14b8a6' : '#dc2626'}` }}>
            <FinancialRow style={{ fontWeight: '700', fontSize: '1.125rem' }}>
              <FinancialLabel>Net Profit</FinancialLabel>
              <FinancialValue style={{ color: detailedReportData.netProfit >= 0 ? '#14b8a6' : '#dc2626', fontWeight: '700', fontSize: '1.125rem' }}>
                {formatCurrency(detailedReportData.netProfit)}
              </FinancialValue>
            </FinancialRow>
        </FinancialCard>

        <SectionTitle>Invoice Payment Details</SectionTitle>
        <FinancialCard>
          <FinancialRow>
            <FinancialLabel>Paid Invoices ({detailedReportData.invoices.paid.count})</FinancialLabel>
            <FinancialValue style={{ color: '#16a34a' }}>{formatCurrency(detailedReportData.invoices.paid.amount)}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Pending Invoices ({detailedReportData.invoices.pending.count})</FinancialLabel>
            <FinancialValue style={{ color: '#f59e0b' }}>{formatCurrency(detailedReportData.invoices.pending.amount)}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Overdue Invoices ({detailedReportData.invoices.overdue.count})</FinancialLabel>
            <FinancialValue style={{ color: '#dc2626' }}>{formatCurrency(detailedReportData.invoices.overdue.amount)}</FinancialValue>
          </FinancialRow>
          <FinancialRow style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem', backgroundColor: '#f8fafc', fontWeight: '700' }}>
            <FinancialLabel style={{ fontWeight: '700' }}>Total Outstanding</FinancialLabel>
            <FinancialValue style={{ color: '#1e293b', fontWeight: '700' }}>{formatCurrency(detailedReportData.invoices.pending.amount + detailedReportData.invoices.overdue.amount)}</FinancialValue>
          </FinancialRow>
        </FinancialCard>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={generateReport}
            style={{
              background: '#14b8a6',
              border: '1px solid #14b8a6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              margin: '0 auto'
            }}
          >
            <FiDownload />
            Export Detailed Report
          </button>
        </div>
      </ContentArea>
      </ReportsContainer>
    );
  }

  if (showBalanceSheet) {
    return (
      <ReportsContainer>
        <TopBar>
          <BackButton onClick={handleBackFromBalanceSheet}>
            <FiArrowLeft />
          </BackButton>
          <Title>Balance Sheet</Title>
          <div></div>
        </TopBar>

        <ContentArea>
          <SectionTitle>Assets</SectionTitle>
          <FinancialCard>
            <FinancialRow>
              <FinancialLabel>Cash</FinancialLabel>
              <FinancialValue>{formatCurrency(12500)}</FinancialValue>
            </FinancialRow>
            <FinancialRow>
              <FinancialLabel>Accounts Receivable</FinancialLabel>
              <FinancialValue>{formatCurrency(5000)}</FinancialValue>
            </FinancialRow>
            <FinancialRow>
              <FinancialLabel>Inventory</FinancialLabel>
              <FinancialValue>{formatCurrency(2500)}</FinancialValue>
            </FinancialRow>
            <FinancialRow>
              <FinancialLabel>Equipment</FinancialLabel>
              <FinancialValue>{formatCurrency(10000)}</FinancialValue>
            </FinancialRow>
            <FinancialRow style={{ backgroundColor: '#f0fdf4', fontWeight: '700', fontSize: '1rem' }}>
              <FinancialLabel>Total Assets</FinancialLabel>
              <FinancialValue positive>{formatCurrency(30000)}</FinancialValue>
            </FinancialRow>
          </FinancialCard>

          <SectionTitle>Liabilities</SectionTitle>
          <FinancialCard>
            <FinancialRow>
              <FinancialLabel>Accounts Payable</FinancialLabel>
              <FinancialValue>{formatCurrency(2000)}</FinancialValue>
            </FinancialRow>
            <FinancialRow>
              <FinancialLabel>Loans</FinancialLabel>
              <FinancialValue>{formatCurrency(3000)}</FinancialValue>
            </FinancialRow>
            <FinancialRow style={{ backgroundColor: '#f0fdf4', fontWeight: '700', fontSize: '1rem' }}>
              <FinancialLabel>Total Liabilities</FinancialLabel>
              <FinancialValue>{formatCurrency(5000)}</FinancialValue>
            </FinancialRow>
          </FinancialCard>

          <SectionTitle>Equity</SectionTitle>
          <FinancialCard>
            <FinancialRow>
              <FinancialLabel>Owner's Equity</FinancialLabel>
              <FinancialValue>{formatCurrency(25000)}</FinancialValue>
            </FinancialRow>
          </FinancialCard>

          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#14b8a6',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            <span>Total Liabilities & Equity</span>
            <span>{formatCurrency(30000)}</span>
          </div>
        </ContentArea>
      </ReportsContainer>
    );
  }

  const reportData = calculateDetailedMetrics();

  // Debug: Log data to verify real-time updates and consistency
  console.log('Reports - Real-time data check:', {
    income: income.length,
    expenses: expenses.length,
    invoices: invoices.length,
    quotes: quotes.length,
    rawInvoicesData: invoices,
    useAllTimeData,
    reportData,
    period: activePeriod
  });

  // Additional debugging for invoice data
  console.log('Reports - Invoice data debugging:', {
    allInvoices: invoices,
    filteredInvoicesLength: useAllTimeData ? invoices.length : filterDataByPeriod(invoices, 'createdAt').length,
    filteredInvoices: useAllTimeData ? invoices : filterDataByPeriod(invoices, 'createdAt'),
    invoiceDataStructure: invoices.length > 0 ? Object.keys(invoices[0]) : 'No invoices found'
  });

  // Verify data matches with Invoices tab calculations
  const invoiceTabStats = {
    total: invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0),
    paid: invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0),
    pending: invoices.filter(invoice => invoice.status === 'pending').reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0),
    overdue: invoices.filter(invoice => {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo;
    }).reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0)
  };

  console.log('Reports - Invoice data verification:', {
    reportsInvoiceData: {
      paid: reportData.invoices.paid.amount,
      pending: reportData.invoices.pending.amount,
      overdue: reportData.invoices.overdue.amount
    },
    invoiceTabStats,
    dataMatches: {
      paid: Math.abs(reportData.invoices.paid.amount - invoiceTabStats.paid) < 0.01,
      pending: Math.abs(reportData.invoices.pending.amount - invoiceTabStats.pending) < 0.01,
      overdue: Math.abs(reportData.invoices.overdue.amount - invoiceTabStats.overdue) < 0.01
    }
  });

  return (
    <ReportsContainer>
      <TopBar>
        <BackButton onClick={handleBack}>
          <FiArrowLeft />
        </BackButton>
        <Title>Financial Statements</Title>
        <div></div>
      </TopBar>

      <div style={{ margin: '1rem', textAlign: 'center' }}>
        <button
          onClick={() => setUseAllTimeData(!useAllTimeData)}
          style={{
            background: useAllTimeData ? '#14b8a6' : '#f8fafc',
            color: useAllTimeData ? 'white' : '#64748b',
            border: '1px solid #e2e8f0',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          {useAllTimeData ? 'Showing All-Time Data (matches Invoice tab)' : 'Showing Period Data'}
        </button>
      </div>

      {!useAllTimeData && (
        <TimePeriodTabs>
        <TimeTab 
          active={activePeriod === 'daily'} 
          onClick={() => setActivePeriod('daily')}
        >
          Daily
        </TimeTab>
        <TimeTab 
          active={activePeriod === 'weekly'} 
          onClick={() => setActivePeriod('weekly')}
        >
          Weekly
        </TimeTab>
        <TimeTab 
          active={activePeriod === 'monthly'} 
          onClick={() => setActivePeriod('monthly')}
        >
          Monthly
        </TimeTab>
        <TimeTab 
          active={activePeriod === 'yearly'} 
          onClick={() => setActivePeriod('yearly')}
        >
          Yearly
        </TimeTab>
      </TimePeriodTabs>
      )}

      <ContentArea>
        <SectionTitle>
          {useAllTimeData ? 'All-Time' : activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Profit & Loss
        </SectionTitle>
        <FinancialCard>
          <FinancialRow>
            <FinancialLabel>Total Revenue</FinancialLabel>
            <FinancialValue>{formatCurrency(reportData.income.total + reportData.invoices.paid.amount)}</FinancialValue>
          </FinancialRow>
            <FinancialRow style={{ paddingLeft: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
            <FinancialLabel>↳ Direct Income</FinancialLabel>
            <FinancialValue style={{ fontSize: '0.875rem' }}>{formatCurrency(reportData.income.total)}</FinancialValue>
            </FinancialRow>
          <FinancialRow style={{ paddingLeft: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
            <FinancialLabel>↳ Invoice Payments</FinancialLabel>
            <FinancialValue style={{ fontSize: '0.875rem' }}>{formatCurrency(reportData.invoices.paid.amount)}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Total Expenses</FinancialLabel>
            <FinancialValue>-{formatCurrency(reportData.expenses.total)}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Net Profit</FinancialLabel>
            <FinancialValue positive={reportData.netProfit >= 0}>{formatCurrency(reportData.netProfit)}</FinancialValue>
          </FinancialRow>
          <div style={{ marginTop: '1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              onClick={handleViewProfitLoss}
              style={{
                background: 'none',
                border: '1px solid #14b8a6',
                color: '#14b8a6',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              View Detailed Profit & Loss
            </button>
            <button 
              onClick={generateReport}
              style={{
                background: '#14b8a6',
                border: '1px solid #14b8a6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <FiDownload />
              Export Report
            </button>
          </div>
        </FinancialCard>

        <SectionTitle>Invoice Status Summary</SectionTitle>
        <FinancialCard>
          {reportData.invoices.total.count === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p>No invoices found.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {useAllTimeData ? 'No invoices have been created yet.' : `No invoices found for the ${activePeriod} period.`}
              </p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Create invoices in the Invoices tab to see data here.
              </p>
            </div>
          ) : (
            <>
              <FinancialRow>
                <FinancialLabel>Paid Invoices ({reportData.invoices.paid.count})</FinancialLabel>
                <FinancialValue>{formatCurrency(reportData.invoices.paid.amount)}</FinancialValue>
              </FinancialRow>
              <FinancialRow>
                <FinancialLabel>Pending Invoices ({reportData.invoices.pending.count})</FinancialLabel>
                <FinancialValue style={{ color: '#f59e0b' }}>{formatCurrency(reportData.invoices.pending.amount)}</FinancialValue>
              </FinancialRow>
              <FinancialRow>
                <FinancialLabel>Overdue Invoices ({reportData.invoices.overdue.count})</FinancialLabel>
                <FinancialValue style={{ color: '#dc2626' }}>{formatCurrency(reportData.invoices.overdue.amount)}</FinancialValue>
              </FinancialRow>
              <FinancialRow>
                <FinancialLabel>Total Outstanding</FinancialLabel>
                <FinancialValue>{formatCurrency(reportData.invoices.pending.amount + reportData.invoices.overdue.amount)}</FinancialValue>
              </FinancialRow>
            </>
          )}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button 
              onClick={handleViewBalanceSheet}
              style={{
                background: 'none',
                border: '1px solid #14b8a6',
                color: '#14b8a6',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              View Detailed Balance Sheet
            </button>
          </div>
        </FinancialCard>

        <SectionTitle>Income Breakdown</SectionTitle>
        <FinancialCard>
          {Object.entries(reportData.income.byCategory).length > 0 ? (
            Object.entries(reportData.income.byCategory).map(([category, amount]) => (
              <FinancialRow key={category}>
                <FinancialLabel>{category}</FinancialLabel>
                <FinancialValue>{formatCurrency(amount)}</FinancialValue>
              </FinancialRow>
            ))
          ) : (
            <FinancialRow>
              <FinancialLabel style={{ textAlign: 'center', color: '#64748b' }}>No income recorded for this period</FinancialLabel>
              <FinancialValue></FinancialValue>
            </FinancialRow>
          )}
        </FinancialCard>

        <SectionTitle>Expense Breakdown</SectionTitle>
        <FinancialCard>
          {Object.entries(reportData.expenses.byCategory).length > 0 ? (
            Object.entries(reportData.expenses.byCategory).map(([category, amount]) => (
              <FinancialRow key={category}>
                <FinancialLabel>{category}</FinancialLabel>
                <FinancialValue>-{formatCurrency(amount)}</FinancialValue>
              </FinancialRow>
            ))
          ) : (
            <FinancialRow>
              <FinancialLabel style={{ textAlign: 'center', color: '#64748b' }}>No expenses recorded for this period</FinancialLabel>
              <FinancialValue></FinancialValue>
            </FinancialRow>
          )}
        </FinancialCard>

        <SectionTitle>Quote Summary</SectionTitle>
        <FinancialCard>
          <FinancialRow>
            <FinancialLabel>Total Quotes</FinancialLabel>
            <FinancialValue>{reportData.quotes.total.count}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Accepted Quotes</FinancialLabel>
            <FinancialValue style={{ color: '#16a34a' }}>{reportData.quotes.accepted.count}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Pending Quotes</FinancialLabel>
            <FinancialValue style={{ color: '#f59e0b' }}>{reportData.quotes.pending.count}</FinancialValue>
          </FinancialRow>
          <FinancialRow>
            <FinancialLabel>Rejected Quotes</FinancialLabel>
            <FinancialValue style={{ color: '#dc2626' }}>{reportData.quotes.rejected.count}</FinancialValue>
          </FinancialRow>
        </FinancialCard>

        <ExportButton onClick={handleExport}>
          <FiDownload />
          Export as CSV / PDF
        </ExportButton>
      </ContentArea>

      {showExportModal && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div></div>
              <ModalTitle>Export Statements</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <ModalSectionTitle>Export Options</ModalSectionTitle>
              
              <FormGroup>
                <Label>Format</Label>
                <SelectContainer>
                  <Select
                    value={exportSettings.format}
                    onChange={(e) => handleExportSettingChange('format', e.target.value)}
                  >
                    <option value="PDF">PDF</option>
                    <option value="CSV">CSV</option>
                    <option value="Excel">Excel</option>
                  </Select>
                  <SelectIcon>
                    <FiChevronDown />
                  </SelectIcon>
                </SelectContainer>
              </FormGroup>

              <FormGroup>
                <Label>Date Range</Label>
                <SelectContainer>
                  <Select
                    value={exportSettings.dateRange}
                    onChange={(e) => handleExportSettingChange('dateRange', e.target.value)}
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last 90 Days">Last 90 Days</option>
                    <option value="This Year">This Year</option>
                    <option value="Custom Range">Custom Range</option>
                  </Select>
                  <SelectIcon>
                    <FiChevronDown />
                  </SelectIcon>
                </SelectContainer>
              </FormGroup>

              <FormGroup>
                <Label>Report Type</Label>
                <SelectContainer>
                  <Select
                    value={exportSettings.reportType}
                    onChange={(e) => handleExportSettingChange('reportType', e.target.value)}
                  >
                    <option value="Profit & Loss">Profit & Loss</option>
                    <option value="Balance Sheet">Balance Sheet</option>
                    <option value="Cash Flow">Cash Flow</option>
                    <option value="All Reports">All Reports</option>
                  </Select>
                  <SelectIcon>
                    <FiChevronDown />
                  </SelectIcon>
                </SelectContainer>
              </FormGroup>

              <FormGroup>
                <Label>Currency</Label>
                <SelectContainer>
                  <Select
                    value={exportSettings.currency}
                    onChange={(e) => handleExportSettingChange('currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="ZAR">ZAR</option>
                  </Select>
                  <SelectIcon>
                    <FiChevronDown />
                  </SelectIcon>
                </SelectContainer>
              </FormGroup>

              <ModalSectionTitle>Additional Settings</ModalSectionTitle>

              <ToggleSwitch>
                <ToggleInfo>
                  <ToggleTitle>Detailed Transactions</ToggleTitle>
                  <ToggleDescription>Include detailed transaction data</ToggleDescription>
                </ToggleInfo>
                <ToggleInput
                  type="checkbox"
                  checked={exportSettings.detailedTransactions}
                  onChange={(e) => handleExportSettingChange('detailedTransactions', e.target.checked)}
                />
              </ToggleSwitch>

              <ToggleSwitch>
                <ToggleInfo>
                  <ToggleTitle>Custom Logo</ToggleTitle>
                  <ToggleDescription>Add your logo to the document</ToggleDescription>
                </ToggleInfo>
                <ToggleInput
                  type="checkbox"
                  checked={exportSettings.customLogo}
                  onChange={(e) => handleExportSettingChange('customLogo', e.target.checked)}
                />
              </ToggleSwitch>

              <ExportModalButton onClick={handleExportSubmit}>
                Export
              </ExportModalButton>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </ReportsContainer>
  );
}