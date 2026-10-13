import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiFileText, 
  FiDollarSign,
  FiArrowLeft
} from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFinancialData } from '../context/FinancialDataContext';

const DashboardContainer = styled.div`
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
  
  @media (min-width: 768px) {
    max-width: 800px;
  }
  
  @media (min-width: 1024px) {
    max-width: 1200px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
`;


const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const SummaryCard = styled.div`
  background: ${props => props.bgColor || 'white'};
  padding: 1rem;
  border-radius: 12px;
  text-align: left;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.textColor || '#1e293b'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.active ? '#14b8a6' : '#e2e8f0'};
  background: ${props => props.active ? 'white' : '#f8fafc'};
  color: ${props => props.active ? '#14b8a6' : '#64748b'};
  
  &:hover {
    background: ${props => props.active ? '#f0fdfa' : '#f1f5f9'};
  }
`;

const FormSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
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
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
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
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
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

const UpcomingSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const UpcomingItem = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f0fdfa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14b8a6;
  font-size: 1.25rem;
`;

const ItemContent = styled.div`
  flex: 1;
`;

const ItemTitle = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const ItemSubtitle = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const ItemAmount = styled.div`
  font-weight: 600;
  color: #1e293b;
  font-size: 1.125rem;
`;

const ChartSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;


const ChartContainer = styled.div`
  height: 200px;
  width: 100%;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1rem;
`;

const ChartPlaceholder = styled.div`
  color: #94a3b8;
  font-size: 0.875rem;
  text-align: center;
`;

const ChartLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
`;

const LegendDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const MonthLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
  padding: 0 0.5rem;
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



export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const { totals, addIncome, addExpense, loading, invoices, quotes, income, expenses } = useFinancialData();
  const [activeTab, setActiveTab] = useState('expense');
  const [activePeriod, setActivePeriod] = useState('daily');
  // Firebase handles data loading automatically through the context

  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    category: 'Product Sale',
    service: '',
    product: '',
    notes: ''
  });

  const [expenseFormData, setExpenseFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Default to today's date
    category: 'Office Supplies',
    vendor: '',
    notes: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset service when category changes
      ...(field === 'category' && value !== 'Service' ? { service: '' } : {}),
      // Reset product when category changes
      ...(field === 'category' && value !== 'Product Sale' ? { product: '' } : {})
    }));
  };

  const handleExpenseInputChange = (field, value) => {
    setExpenseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await addIncome({
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        service: formData.service,
        product: formData.product,
        notes: formData.notes
      });

      if (result.success) {
        alert('Income recorded successfully!');
        // Reset form
        setFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'Product Sale',
          service: '',
          product: '',
          notes: ''
        });
      } else {
        alert('Failed to record income: ' + result.error);
      }
    } catch (error) {
      console.error('Error recording income:', error);
      alert('Failed to record income. Please try again.');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    
    if (!expenseFormData.amount || !expenseFormData.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const result = await addExpense({
        amount: parseFloat(expenseFormData.amount),
        date: expenseFormData.date,
        category: expenseFormData.category,
        vendor: expenseFormData.vendor,
        notes: expenseFormData.notes
      });

      if (result.success) {
        alert('Expense recorded successfully!');
        // Reset form
        setExpenseFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: 'Office Supplies',
          vendor: '',
          notes: ''
        });
      } else {
        alert('Failed to record expense: ' + result.error);
      }
    } catch (error) {
      console.error('Error recording expense:', error);
      alert('Failed to record expense. Please try again.');
    }
  };

  // Get date range based on selected period (same as Reports page)
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

  // Filter data by date range (same logic as Reports page)
  const filterDataByPeriod = (data, dateField = 'date') => {
    const { startDate, endDate } = getDateRange();
    return data.filter(item => {
      const itemDate = new Date(item[dateField] || item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Calculate period-specific metrics (same as Reports page)
  const getFilteredData = () => {
    const filteredIncome = filterDataByPeriod(income || []);
    const filteredExpenses = filterDataByPeriod(expenses || []);
    const filteredInvoices = filterDataByPeriod(invoices, 'createdAt');

    const periodTotalIncome = filteredIncome.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const periodTotalExpenses = filteredExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const periodPaidAmount = filteredInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

    const periodTotalRevenue = periodTotalIncome + periodPaidAmount;
    const periodNetProfit = periodTotalRevenue - periodTotalExpenses;

    return {
      totalIncome: periodTotalIncome,
      totalExpenses: periodTotalExpenses,
      totalRevenue: periodTotalRevenue,
      netProfit: periodNetProfit,
      // Use global totals for non-period specific metrics
      pendingAmount: totals.pendingAmount,
      inventoryValue: totals.inventoryValue,
      lowStockItems: totals.lowStockItems,
      period: activePeriod
    };
  };

  const filteredData = getFilteredData();

  // Data consistency check removed for production

  // Get pending invoices (not paid, regardless of due date)
  const getPendingInvoices = () => {
    return invoices
      .filter(invoice => invoice.status !== 'paid')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // Show top 5 pending
  };

  // Get outstanding/overdue invoices (30+ days past due date and not paid)
  const getOutstandingInvoices = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    return invoices
      .filter(invoice => {
        if (invoice.status === 'paid') return false;
        const dueDate = new Date(invoice.dueDate);
        return dueDate < thirtyDaysAgo; // Must be 30+ days past due
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5); // Show top 5 overdue
  };

  // getUpcomingInvoices function removed - not currently used

  // Get recent quotes (created within last 30 days)
  const getRecentQuotes = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return quotes
      .filter(quote => {
        const createdDate = new Date(quote.createdAt || quote.date);
        return createdDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 3); // Show top 3 recent
  };

  const pendingInvoices = getPendingInvoices();
  const outstandingInvoices = getOutstandingInvoices();
  // const upcomingInvoices = getUpcomingInvoices(); // Removed unused variable
  const recentQuotes = getRecentQuotes();

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={() => window.history.back()} title="Go back">
            <FiArrowLeft />
          </BackButton>
          <Title>Home</Title>
        </div>
        <div></div>
      </Header>

      {/* <BusinessAnalytics /> */}

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

      <SummaryCards>
        <SummaryCard bgColor="#f0fdf4">
          <SummaryLabel>{activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Income</SummaryLabel>
          <SummaryValue textColor="#16a34a">
            {loading ? '...' : formatCurrency(filteredData.totalIncome)}
          </SummaryValue>
        </SummaryCard>
        <SummaryCard bgColor="#fef2f2">
          <SummaryLabel>{activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Expenses</SummaryLabel>
          <SummaryValue textColor="#dc2626">
            {loading ? '...' : formatCurrency(filteredData.totalExpenses)}
          </SummaryValue>
        </SummaryCard>
        <SummaryCard bgColor="#f0f9ff">
          <SummaryLabel>{activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Profit</SummaryLabel>
          <SummaryValue textColor={filteredData.netProfit >= 0 ? "#2563eb" : "#dc2626"}>
            {loading ? '...' : formatCurrency(filteredData.netProfit)}
          </SummaryValue>
        </SummaryCard>
            <SummaryCard bgColor="#fafafa">
              <SummaryLabel>Pending Amount</SummaryLabel>
              <SummaryValue textColor="#6b7280">
                {loading ? '...' : formatCurrency(filteredData.pendingAmount)}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard bgColor="#fef3c7">
              <SummaryLabel>Inventory Value</SummaryLabel>
              <SummaryValue textColor="#d97706">
                {loading ? '...' : formatCurrency(filteredData.inventoryValue)}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard bgColor="#fecaca">
              <SummaryLabel>Low Stock Items</SummaryLabel>
              <SummaryValue textColor="#dc2626">
                {loading ? '...' : filteredData.lowStockItems}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard bgColor="#fff7ed">
              <SummaryLabel>Pending Invoices</SummaryLabel>
              <SummaryValue textColor="#ea580c">
                {loading ? '...' : pendingInvoices.length}
              </SummaryValue>
            </SummaryCard>
            <SummaryCard bgColor="#fef2f2">
              <SummaryLabel>Outstanding Invoices</SummaryLabel>
              <SummaryValue textColor="#dc2626">
                {loading ? '...' : outstandingInvoices.length}
              </SummaryValue>
            </SummaryCard>
      </SummaryCards>

      <ActionButtons>
        <ActionButton 
          active={activeTab === 'expense'} 
          onClick={() => setActiveTab('expense')}
        >
          Record Expense
        </ActionButton>
        <ActionButton 
          active={activeTab === 'income'} 
          onClick={() => setActiveTab('income')}
        >
          Record Income
        </ActionButton>
      </ActionButtons>

      {activeTab === 'income' && (
        <FormSection>
          <FormTitle>Record Income</FormTitle>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Amount</Label>
              <Input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="$ 0.00"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="Product Sale">Product Sale</option>
                <option value="Service">Service</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>
            
            {formData.category === 'Service' && (
              <FormGroup>
                <Label>Service Type</Label>
                <Select
                  value={formData.service}
                  onChange={(e) => handleInputChange('service', e.target.value)}
                >
                  <option value="">Select a service...</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="SEO Services">SEO Services</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other Service">Other Service</option>
                </Select>
              </FormGroup>
            )}
            
            {formData.category === 'Product Sale' && (
              <FormGroup>
                <Label>Product</Label>
                <Select
                  value={formData.product}
                  onChange={(e) => handleInputChange('product', e.target.value)}
                >
                  <option value="">Select a product...</option>
                  <option value="Classic T-Shirt">Classic T-Shirt</option>
                  <option value="Premium Hoodie">Premium Hoodie</option>
                  <option value="Baseball Cap">Baseball Cap</option>
                  <option value="Leather Belt">Leather Belt</option>
                  <option value="Canvas Tote Bag">Canvas Tote Bag</option>
                  <option value="Wireless Headphones">Wireless Headphones</option>
                  <option value="Smart Watch">Smart Watch</option>
                  <option value="Laptop Stand">Laptop Stand</option>
                  <option value="Phone Case">Phone Case</option>
                  <option value="Coffee Mug">Coffee Mug</option>
                </Select>
              </FormGroup>
            )}
            
            <FormGroup>
              <Label>Notes (optional)</Label>
              <TextArea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="e.g., Client project payment"
              />
            </FormGroup>
            
            <SubmitButton type="submit">
              <FiPlus />
              Record Income
            </SubmitButton>
          </form>
        </FormSection>
      )}

      {activeTab === 'expense' && (
        <FormSection>
          <FormTitle>Record Expense</FormTitle>
          <form onSubmit={handleExpenseSubmit}>
            <FormGroup>
              <Label>Amount</Label>
              <Input
                type="text"
                value={expenseFormData.amount}
                onChange={(e) => handleExpenseInputChange('amount', e.target.value)}
                placeholder="$ 0.00"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                value={expenseFormData.date}
                onChange={(e) => handleExpenseInputChange('date', e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Category</Label>
              <Select
                value={expenseFormData.category}
                onChange={(e) => handleExpenseInputChange('category', e.target.value)}
              >
                <option value="Office Supplies">Office Supplies</option>
                <option value="Utilities">Utilities</option>
                <option value="Rent">Rent</option>
                <option value="Marketing">Marketing</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Equipment">Equipment</option>
                <option value="Software">Software</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Vendor/Payee</Label>
              <Input
                type="text"
                value={expenseFormData.vendor}
                onChange={(e) => handleExpenseInputChange('vendor', e.target.value)}
                placeholder="e.g., Office Depot, Amazon, etc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Notes (optional)</Label>
              <TextArea
                value={expenseFormData.notes}
                onChange={(e) => handleExpenseInputChange('notes', e.target.value)}
                placeholder="e.g., Monthly office supplies purchase"
              />
            </FormGroup>
            
            <SubmitButton type="submit">
              <FiPlus />
              Record Expense
            </SubmitButton>
          </form>
        </FormSection>
      )}

      <ChartSection>
        <ChartTitle>Income vs. Expenses</ChartTitle>
        

        <ChartContainer>
          <ChartPlaceholder>
            Chart will be displayed here
          </ChartPlaceholder>
        </ChartContainer>

        <ChartLegend>
          <LegendItem>
            <LegendDot color="#14b8a6" />
            Income
          </LegendItem>
          <LegendItem>
            <LegendDot color="#f87171" />
            Expenses
          </LegendItem>
        </ChartLegend>

        <MonthLabels>
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
        </MonthLabels>
      </ChartSection>

      {/* Outstanding Invoices Section */}
      {outstandingInvoices.length > 0 && (
        <UpcomingSection>
          <SectionTitle style={{ color: '#dc2626' }}>⚠️ Outstanding Invoices (Overdue)</SectionTitle>
          
          {outstandingInvoices.map((invoice, index) => {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
            
            return (
              <UpcomingItem key={`outstanding-${invoice.id || index}`} style={{ border: '2px solid #fecaca' }}>
                <ItemIcon style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <FiFileText />
                </ItemIcon>
                <ItemContent>
                  <ItemTitle style={{ color: '#dc2626' }}>{invoice.invoiceNumber}</ItemTitle>
                  <ItemSubtitle style={{ color: '#dc2626', fontWeight: '600' }}>
                    Overdue by {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} (30+ days late) • {invoice.clientName}
                  </ItemSubtitle>
                </ItemContent>
                <ItemAmount style={{ color: '#dc2626' }}>{formatCurrency(invoice.amount)}</ItemAmount>
              </UpcomingItem>
            );
          })}
        </UpcomingSection>
      )}

      {/* Pending Invoices Section */}
      <UpcomingSection>
        <SectionTitle>📋 Pending Invoices</SectionTitle>
        
        {pendingInvoices.length > 0 ? (
          pendingInvoices.map((invoice, index) => {
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            const isPastDue = daysUntilDue < 0;
            const isOverdue = isPastDue && Math.abs(daysUntilDue) >= 30; // 30+ days past due
            const isLateButNotOverdue = isPastDue && Math.abs(daysUntilDue) < 30; // Past due but < 30 days
            
            return (
              <UpcomingItem key={`pending-${invoice.id || index}`}>
                <ItemIcon style={{ 
                  background: isOverdue ? '#fef2f2' : isLateButNotOverdue ? '#fef3c7' : '#f0fdfa', 
                  color: isOverdue ? '#dc2626' : isLateButNotOverdue ? '#f59e0b' : '#14b8a6' 
                }}>
                  <FiFileText />
                </ItemIcon>
                <ItemContent>
                  <ItemTitle>{invoice.invoiceNumber}</ItemTitle>
                  <ItemSubtitle>
                    {isOverdue ? `Overdue by ${Math.abs(daysUntilDue)} days` :
                     isLateButNotOverdue ? `Late by ${Math.abs(daysUntilDue)} days (not yet overdue)` :
                     daysUntilDue === 0 ? 'Due today' : 
                     daysUntilDue === 1 ? 'Due tomorrow' : 
                     daysUntilDue < 0 ? `Late by ${Math.abs(daysUntilDue)} days` :
                     `Due in ${daysUntilDue} days`} • {invoice.clientName}
                  </ItemSubtitle>
                </ItemContent>
                <ItemAmount>{formatCurrency(invoice.amount)}</ItemAmount>
              </UpcomingItem>
            );
          })
        ) : (
          <UpcomingItem>
            <ItemIcon style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <FiFileText />
            </ItemIcon>
            <ItemContent>
              <ItemTitle>No pending invoices</ItemTitle>
              <ItemSubtitle>All invoices have been paid</ItemSubtitle>
            </ItemContent>
            <ItemAmount>{formatCurrency(0)}</ItemAmount>
          </UpcomingItem>
        )}
      </UpcomingSection>

      {/* Recent Quotes Section */}
      {recentQuotes.length > 0 && (
        <UpcomingSection>
          <SectionTitle>💰 Recent Quotes</SectionTitle>
          
          {recentQuotes.map((quote, index) => {
            const createdDate = new Date(quote.createdAt || quote.date);
            const daysAgo = Math.ceil((new Date() - createdDate) / (1000 * 60 * 60 * 24));
            const quoteTotal = quote.items ? 
              quote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) : 
              quote.total || 0;
            
            return (
              <UpcomingItem key={`quote-${quote.id || index}`}>
                <ItemIcon style={{ background: '#fefce8', color: '#f59e0b' }}>
                  <FiDollarSign />
                </ItemIcon>
                <ItemContent>
                  <ItemTitle>{quote.quoteNumber || `Quote #${quote.id}`}</ItemTitle>
                  <ItemSubtitle>
                    {daysAgo === 0 ? 'Created today' : 
                     daysAgo === 1 ? 'Created yesterday' : 
                     `Created ${daysAgo} days ago`} • {quote.customerName || 'Customer'}
                  </ItemSubtitle>
                </ItemContent>
                <ItemAmount>{formatCurrency(quoteTotal)}</ItemAmount>
              </UpcomingItem>
            );
          })}
        </UpcomingSection>
      )}
    </DashboardContainer>
  );
}
