import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiSend, FiDownload, FiArrowLeft, FiPackage, FiX, FiTrash2, FiMail, FiRefreshCw } from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCustomer } from '../context/CustomerContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { functionsService } from '../firebase/functions';
import { getInvoiceBalance, isOutstandingInvoice } from '../utils/arAging';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { toast } from 'react-toastify';

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
      case 'paid':
      case 'credited': return '#f0fdf4';
      case 'pending':
      case 'partial': return '#fef3c7';
      case 'overdue': return '#fef2f2';
      case 'issued': return '#eff6ff';
      case 'void': return '#f1f5f9';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'paid':
      case 'credited': return '#16a34a';
      case 'pending':
      case 'partial': return '#d97706';
      case 'overdue': return '#dc2626';
      case 'issued': return '#2563eb';
      case 'void': return '#64748b';
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

const InventorySelector = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
`;

const InventoryModal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const InventoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const InventoryTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const InventoryCloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const InventoryList = styled.div`
  padding: 1rem;
`;

const InventoryItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
  }
`;

const InventoryItemInfo = styled.div`
  flex: 1;
`;

const InventoryItemName = styled.div`
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const InventoryItemDetails = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #14b8a6;
`;

const ItemStock = styled.div`
  font-size: 0.75rem;
  color: ${props => props.lowStock ? '#ef4444' : '#16a34a'};
  font-weight: 500;
`;

const InventoryButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#14b8a6' : '#f8fafc'};
  color: ${props => props.variant === 'primary' ? 'white' : '#64748b'};
  border: 1px solid ${props => props.variant === 'primary' ? '#14b8a6' : '#e2e8f0'};
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#0f766e' : '#f1f5f9'};
  }
`;

const ManualButton = styled.button`
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ItemCard = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
`;

const getInvoiceAmount = (invoice) => parseFloat(invoice?.total ?? invoice?.amount ?? 0) || 0;

export default function Invoices() {
  const { formatCurrency, currencyConfig } = useCurrency();
  const { customers } = useCustomer();
  const {
    addInvoice,
    updateInvoice,
    deleteInvoice,
    invoices,
    products,
    totals,
    recordPayment,
    voidInvoice,
    createCreditNote,
    generateDueRecurringInvoices
  } = useFinancialData();
  const { convertAmount, fxRates, baseCurrency } = useAccountingExtensions();
  const { user } = useFirebaseBusiness();
  const { businessInfo } = useBusinessBranding();
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [showInventorySelector, setShowInventorySelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryTypeFilter, setInventoryTypeFilter] = useState('all');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', method: 'eft', notes: '' });
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
    status: 'pending',
    items: [],
    currency: 'ZAR',
    isRecurring: false,
    recurrenceInterval: 'monthly',
    recurrenceNextRun: '',
    recurrenceEndDate: ''
  });

  const emptyForm = {
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
    status: 'pending',
    items: [],
    currency: baseCurrency || 'ZAR',
    isRecurring: false,
    recurrenceInterval: 'monthly',
    recurrenceNextRun: '',
    recurrenceEndDate: ''
  };

  const currencyOptions = (fxRates?.length
    ? fxRates.map((r) => r.code)
    : Object.keys(currencyConfig));

  useEffect(() => {
    generateDueRecurringInvoices().then((result) => {
      if (result?.created > 0) {
        toast.info(`Generated ${result.created} recurring invoice(s)`);
      }
    }).catch(() => {});
  }, [generateDueRecurringInvoices]);

  const getItemTypeLabel = (itemType) => {
    if (itemType === 'service') return 'Service';
    if (itemType === 'consultation') return 'Consultation';
    return 'Product';
  };

  const recalculateAmount = (items) =>
    items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

  const addItem = () => {
    setFormData(prev => {
      const items = [...prev.items, {
        name: '',
        quantity: 1,
        price: 0,
        total: 0,
        isFromInventory: false,
        productId: null,
        itemType: null
      }];
      return { ...prev, items, amount: recalculateAmount(items).toFixed(2) };
    });
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const items = prev.items.filter((_, i) => i !== index);
      return { ...prev, items, amount: recalculateAmount(items).toFixed(2) };
    });
  };

  const openInventorySelector = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    setInventorySearchTerm('');
    setInventoryTypeFilter('all');
    setShowInventorySelector(true);
  };

  const selectInventoryItem = (product) => {
    if (selectedItemIndex === null) return;

    const itemType = product.itemType || 'product';
    const isProduct = itemType === 'product';
    const isLowStock = isProduct && (product.quantity || 0) <= (product.minQuantity || 0);

    if (isLowStock) {
      const confirmSelection = window.confirm(
        `Warning: ${product.name} has low stock (${product.quantity || 0} items). Do you want to continue?`
      );
      if (!confirmSelection) return;
    }

    const price = parseFloat(product.price ?? product.unitPrice ?? 0) || 0;

    setFormData(prev => {
      const items = prev.items.map((item, index) =>
        index === selectedItemIndex
          ? {
              ...item,
              name: product.name,
              price,
              total: price * item.quantity,
              isFromInventory: true,
              productId: product.id,
              itemType
            }
          : item
      );
      return { ...prev, items, amount: recalculateAmount(items).toFixed(2) };
    });

    setShowInventorySelector(false);
    setSelectedItemIndex(null);
  };

  const resetItemToManual = (index) => {
    setFormData(prev => {
      const items = prev.items.map((item, i) =>
        i === index
          ? {
              ...item,
              name: '',
              price: 0,
              total: 0,
              isFromInventory: false,
              productId: null,
              itemType: null
            }
          : item
      );
      return { ...prev, items, amount: recalculateAmount(items).toFixed(2) };
    });
  };

  const getInvoiceItemsForDisplay = (invoice) => {
    if (invoice.items && invoice.items.length > 0) {
      return invoice.items.map(item => ({
        description: item.name || item.description || 'Item',
        quantity: item.quantity || 1,
        price: item.price || 0
      }));
    }
    return [{
      description: invoice.description || 'Services rendered',
      quantity: 1,
      price: getInvoiceAmount(invoice)
    }];
  };

  // Load invoices from localStorage on component mount
  // Firebase handles data loading automatically through the context

  const calculateStats = () => {
    const total = invoices.reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);
    const paid = invoices.filter(invoice => invoice.status === 'paid').reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);
    const pending = invoices.filter(invoice => invoice.status === 'pending').reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);
    const overdue = invoices.filter(invoice => {
      if (invoice.status === 'paid') return false;
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo; // Must be 30+ days past due
    }).reduce((sum, invoice) => sum + getInvoiceAmount(invoice), 0);
    
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
    
    const calculatedAmount = formData.items.length > 0
      ? recalculateAmount(formData.items)
      : parseFloat(formData.amount);

    if (!formData.customer || !calculatedAmount || !formData.dueDate) {
      alert('Please select a customer, add at least one item or amount, and fill in the due date');
      return;
    }

    if (formData.items.length > 0 && formData.items.some(item => !item.name)) {
      alert('Please fill in a name for every invoice item');
      return;
    }

    try {
      const descriptionFromItems = formData.items
        .map(item => item.name)
        .filter(Boolean)
        .join(', ');

      const currency = formData.currency || baseCurrency || 'ZAR';
      const exchangeRate = convertAmount(1, currency, baseCurrency || 'ZAR');
      const amountInBase = convertAmount(calculatedAmount, currency, baseCurrency || 'ZAR');

      const invoiceData = {
        customerId: typeof formData.customer === 'object' ? formData.customer.id : null,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        clientAddress: formData.clientAddress || '',
        clientCity: formData.clientCity || '',
        clientPostalCode: formData.clientPostalCode || '',
        clientCountry: formData.clientCountry || '',
        invoiceNumber: editingInvoice ? editingInvoice.invoiceNumber : generateInvoiceNumber(),
        amount: calculatedAmount,
        total: calculatedAmount,
        currency,
        exchangeRate,
        amountInBase,
        baseCurrency: baseCurrency || 'ZAR',
        amountPaid: editingInvoice ? (editingInvoice.amountPaid || 0) : 0,
        balanceDue: editingInvoice
          ? Math.max(0, calculatedAmount - (parseFloat(editingInvoice.amountPaid) || 0))
          : calculatedAmount,
        items: formData.items,
        dueDate: formData.dueDate,
        description: formData.description || descriptionFromItems || '',
        status: formData.status,
        type: editingInvoice?.type || 'invoice',
        isRecurring: !!formData.isRecurring,
        recurrence: formData.isRecurring
          ? {
              interval: formData.recurrenceInterval || 'monthly',
              nextRun: formData.recurrenceNextRun || formData.dueDate,
              endDate: formData.recurrenceEndDate || null,
              active: true
            }
          : null,
        ...(editingInvoice && { createdAt: editingInvoice.createdAt })
      };

      if (editingInvoice) {
        const result = await updateInvoice(editingInvoice.id, invoiceData);
        if (result.success) {
          alert('Invoice updated successfully!');
        } else {
          alert('Failed to update invoice: ' + result.error);
          return;
        }
      } else {
        const result = await addInvoice(invoiceData);
        if (result.success) {
          alert('Invoice created successfully!');
        } else {
          alert('Failed to create invoice: ' + result.error);
          return;
        }
      }

      setFormData(emptyForm);
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

    const items = (invoice.items || []).map(item => ({
      name: item.name || item.description || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
      total: item.total ?? ((item.quantity || 1) * (item.price || 0)),
      isFromInventory: !!item.productId || !!item.isFromInventory,
      productId: item.productId || null,
      itemType: item.itemType || null
    }));

    setFormData({
      customer: customerData,
      clientName: invoice.clientName || invoice.customerName || '',
      clientEmail: invoice.clientEmail || '',
      clientPhone: invoice.clientPhone || '',
      clientAddress: invoice.clientAddress || '',
      clientCity: invoice.clientCity || '',
      clientPostalCode: invoice.clientPostalCode || '',
      clientCountry: invoice.clientCountry || '',
      amount: getInvoiceAmount(invoice).toString(),
      dueDate: invoice.dueDate,
      description: invoice.description || '',
      status: invoice.status,
      items,
      currency: invoice.currency || baseCurrency || 'ZAR',
      isRecurring: !!invoice.isRecurring,
      recurrenceInterval: invoice.recurrence?.interval || 'monthly',
      recurrenceNextRun: invoice.recurrence?.nextRun || '',
      recurrenceEndDate: invoice.recurrence?.endDate || ''
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

  const handleVoidInvoice = async (invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'void' || invoice.type === 'credit_note') return;
    if (!window.confirm(`Void invoice ${invoice.invoiceNumber}? This clears the remaining balance.`)) return;
    const result = await voidInvoice(invoice.id);
    if (result.success) {
      toast.success('Invoice voided');
    } else {
      alert(result.error || 'Failed to void invoice');
    }
  };

  const handlePreviewInvoice = () => {
    const calculatedAmount = formData.items.length > 0
      ? recalculateAmount(formData.items)
      : parseFloat(formData.amount);

    if (!formData.customer || !calculatedAmount || !formData.dueDate) {
      alert('Please select a customer and fill in all required fields (Customer, Amount/Items, Due Date) before previewing');
      return;
    }

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
      amount: calculatedAmount,
      total: calculatedAmount,
      items: formData.items,
      dueDate: formData.dueDate,
      description: formData.description || '',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setViewingInvoice(previewInvoice);
  };

  const openPaymentModal = (invoice) => {
    const balance = getInvoiceBalance(invoice);
    setPaymentModalInvoice(invoice);
    setPaymentForm({
      amount: balance.toFixed(2),
      date: new Date().toISOString().split('T')[0],
      method: 'eft',
      notes: ''
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      const result = await recordPayment(paymentModalInvoice.id, {
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date,
        method: paymentForm.method,
        notes: paymentForm.notes
      });
      if (result.success) {
        toast.success(result.status === 'paid' ? 'Invoice paid in full' : 'Partial payment recorded');
        setPaymentModalInvoice(null);
      } else {
        alert('Failed to record payment: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to record payment.');
    }
  };

  const handleIssueCreditNote = async (invoice) => {
    const balance = getInvoiceBalance(invoice);
    if (balance <= 0) {
      alert('This invoice has no outstanding balance to credit.');
      return;
    }
    if (!window.confirm(`Issue a credit note of ${formatCurrency(balance)} for invoice ${invoice.invoiceNumber}?`)) {
      return;
    }
    const result = await createCreditNote(invoice.id, { amount: balance, applyToBalance: true });
    if (result.success) {
      toast.success(`Credit note ${result.creditNumber} created`);
    } else {
      alert('Failed to create credit note: ' + result.error);
    }
  };

  const handleSendReminder = async (invoice) => {
    const customerEmail = invoice.clientEmail;
    const customerName = invoice.clientName;
    if (!customerEmail) {
      alert('This invoice does not have a customer email address.');
      return;
    }
    try {
      const result = await functionsService.sendInvoiceEmail(
        user?.uid,
        invoice.id || invoice.invoiceNumber,
        customerEmail,
        customerName || 'Customer',
        {
          ...invoice,
          description: `PAYMENT REMINDER: ${invoice.description || 'Invoice'}`,
          reminder: true
        }
      );
      if (result.success) {
        await updateInvoice(invoice.id, {
          ...invoice,
          lastReminderAt: new Date().toISOString(),
          skipAutoIncome: true
        });
        toast.success('Payment reminder sent');
      } else {
        alert('Failed to send reminder: ' + result.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to send reminder.');
    }
  };

  const handleGenerateRecurring = async () => {
    const result = await generateDueRecurringInvoices();
    if (result.success) {
      toast.success(result.created ? `Generated ${result.created} invoice(s)` : 'No recurring invoices due');
    } else {
      alert('Failed to generate recurring invoices: ' + result.error);
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
        items: getInvoiceItemsForDisplay(invoice)
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
            items: getInvoiceItemsForDisplay(invoice)
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
    if (filterStatus === 'credit_note') return invoice.type === 'credit_note';
    if (filterStatus === 'recurring') return !!invoice.isRecurring;
    if (filterStatus === 'partial') return invoice.status === 'partial';
    if (filterStatus === 'overdue') {
      if (!isOutstandingInvoice(invoice)) return false;
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      return dueDate < thirtyDaysAgo;
    }
    if (filterStatus === 'pending') {
      return invoice.type !== 'credit_note' && (invoice.status === 'pending' || invoice.status === 'partial');
    }
    return invoice.status === filterStatus && invoice.type !== 'credit_note';
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
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            type="button"
            onClick={handleGenerateRecurring}
            style={{ background: '#0f766e' }}
            title="Generate due recurring invoices"
          >
            <FiRefreshCw style={{ marginRight: '0.35rem' }} />
            Generate Recurring
          </Button>
          <Button onClick={() => { setEditingInvoice(null); setFormData(emptyForm); setShowModal(true); }}>
            Create Invoice
          </Button>
        </div>
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
        <FilterTab
          active={filterStatus === 'partial'}
          onClick={() => setFilterStatus('partial')}
        >
          Partial
        </FilterTab>
        <FilterTab
          active={filterStatus === 'credit_note'}
          onClick={() => setFilterStatus('credit_note')}
        >
          Credit Notes
        </FilterTab>
        <FilterTab
          active={filterStatus === 'recurring'}
          onClick={() => setFilterStatus('recurring')}
        >
          Recurring
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
                <InvoiceNumber>
                  {invoice.invoiceNumber}
                  {invoice.type === 'credit_note' ? ' (Credit)' : ''}
                  {invoice.isRecurring ? ' ↻' : ''}
                </InvoiceNumber>
                <ClientName>{invoice.clientName || invoice.customerName}</ClientName>
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
                <AmountValue>{formatCurrency(Math.abs(getInvoiceAmount(invoice)))}</AmountValue>
                {invoice.type !== 'credit_note' && isOutstandingInvoice(invoice) && (
                  <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
                    Balance: {formatCurrency(getInvoiceBalance(invoice))}
                  </div>
                )}
              </Amount>
            </InvoiceDetails>

            <Actions>
              <ActionButton onClick={() => setViewingInvoice(invoice)}>
                View
              </ActionButton>
              {invoice.type !== 'credit_note' && (
                <ActionButton 
                  onClick={() => handleSendInvoice(invoice)}
                  style={{ background: '#14b8a6', color: 'white', borderColor: '#14b8a6' }}
                  title="Send invoice via email"
                >
                  <FiSend style={{ marginRight: '0.25rem' }} />
                  Send
                </ActionButton>
              )}
              {isOutstandingInvoice(invoice) && (
                <>
                  <ActionButton
                    className="primary"
                    onClick={() => openPaymentModal(invoice)}
                  >
                    Record Payment
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleSendReminder(invoice)}
                    title="Send payment reminder"
                  >
                    <FiMail style={{ marginRight: '0.25rem' }} />
                    Remind
                  </ActionButton>
                  <ActionButton onClick={() => handleIssueCreditNote(invoice)}>
                    Credit Note
                  </ActionButton>
                </>
              )}
              {invoice.type !== 'credit_note' && invoice.status !== 'paid' && invoice.status !== 'void' && (
                <ActionButton
                  onClick={() => handleVoidInvoice(invoice)}
                  title="Void this invoice"
                  style={{ color: '#64748b' }}
                >
                  Void
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
          <ModalContent style={{ maxWidth: '700px' }}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Label style={{ marginBottom: 0 }}>Items (Products / Services / Consultations)</Label>
                  <InventoryButton type="button" variant="primary" onClick={addItem}>
                    <FiPlus style={{ marginRight: '0.25rem' }} />
                    Add Item
                  </InventoryButton>
                </div>

                {formData.items.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '1rem',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontSize: '0.875rem'
                  }}>
                    Add items from inventory, or enter a manual amount below.
                  </div>
                ) : (
                  formData.items.map((item, index) => (
                    <ItemCard key={index}>
                      <FormGroup>
                        <Label>Item Name</Label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Input
                            type="text"
                            value={item.name}
                            onChange={(e) => {
                              const items = [...formData.items];
                              items[index] = { ...items[index], name: e.target.value };
                              setFormData(prev => ({
                                ...prev,
                                items,
                                amount: recalculateAmount(items).toFixed(2)
                              }));
                            }}
                            placeholder="Enter name or select from inventory"
                            style={{ flex: 1 }}
                          />
                          {!item.isFromInventory ? (
                            <InventoryButton type="button" variant="primary" onClick={() => openInventorySelector(index)}>
                              <FiPackage /> Inventory
                            </InventoryButton>
                          ) : (
                            <ManualButton type="button" onClick={() => resetItemToManual(index)}>
                              Manual
                            </ManualButton>
                          )}
                          <ManualButton type="button" onClick={() => removeItem(index)} title="Remove item">
                            <FiTrash2 />
                          </ManualButton>
                        </div>
                        {item.isFromInventory && (
                          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                            ✓ From inventory ({getItemTypeLabel(item.itemType)})
                          </div>
                        )}
                      </FormGroup>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value, 10) || 1;
                              const items = [...formData.items];
                              items[index] = {
                                ...items[index],
                                quantity,
                                total: quantity * (parseFloat(items[index].price) || 0)
                              };
                              setFormData(prev => ({
                                ...prev,
                                items,
                                amount: recalculateAmount(items).toFixed(2)
                              }));
                            }}
                          />
                        </FormGroup>
                        <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                          <Label>Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price}
                            onChange={(e) => {
                              const price = parseFloat(e.target.value) || 0;
                              const items = [...formData.items];
                              items[index] = {
                                ...items[index],
                                price,
                                total: price * (items[index].quantity || 1)
                              };
                              setFormData(prev => ({
                                ...prev,
                                items,
                                amount: recalculateAmount(items).toFixed(2)
                              }));
                            }}
                          />
                        </FormGroup>
                        <FormGroup style={{ flex: 1, marginBottom: 0 }}>
                          <Label>Total</Label>
                          <Input
                            type="text"
                            value={formatCurrency(item.total || 0)}
                            readOnly
                            style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                          />
                        </FormGroup>
                      </div>
                    </ItemCard>
                  ))
                )}
              </FormGroup>

              <FormGroup>
                <Label>Currency</Label>
                <Select
                  value={formData.currency || baseCurrency || 'ZAR'}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                >
                  {currencyOptions.map((code) => (
                    <option key={code} value={code}>
                      {code}{currencyConfig[code] ? ` — ${currencyConfig[code].name}` : ''}
                    </option>
                  ))}
                </Select>
                {formData.currency && formData.currency !== (baseCurrency || 'ZAR') && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Rate: 1 {formData.currency} = {convertAmount(1, formData.currency, baseCurrency || 'ZAR').toFixed(4)} {baseCurrency || 'ZAR'}
                    {formData.amount ? (
                      <> · ≈ {formatCurrency(convertAmount(formData.amount, formData.currency, baseCurrency || 'ZAR'), baseCurrency || 'ZAR')} base</>
                    ) : null}
                  </div>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Amount {formData.items.length > 0 ? '(auto-calculated)' : '*'} ({formData.currency || 'ZAR'})</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  readOnly={formData.items.length > 0}
                  required={formData.items.length === 0}
                  style={formData.items.length > 0 ? { backgroundColor: '#f8fafc', color: '#64748b' } : undefined}
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
                <Label>Notes / Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional notes for this invoice..."
                />
              </FormGroup>

              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={!!formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      isRecurring: e.target.checked,
                      recurrenceNextRun: prev.recurrenceNextRun || prev.dueDate || new Date().toISOString().split('T')[0]
                    }))}
                  />
                  Recurring invoice template
                </label>
              </FormGroup>

              {formData.isRecurring && (
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <FormGroup style={{ flex: 1, minWidth: '140px' }}>
                    <Label>Interval</Label>
                    <Select
                      value={formData.recurrenceInterval}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: e.target.value }))}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </Select>
                  </FormGroup>
                  <FormGroup style={{ flex: 1, minWidth: '140px' }}>
                    <Label>Next run</Label>
                    <Input
                      type="date"
                      value={formData.recurrenceNextRun}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceNextRun: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup style={{ flex: 1, minWidth: '140px' }}>
                    <Label>End date (optional)</Label>
                    <Input
                      type="date"
                      value={formData.recurrenceEndDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                    />
                  </FormGroup>
                </div>
              )}

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
              items={getInvoiceItemsForDisplay(viewingInvoice)}
            />
          </ModalContent>
        </Modal>
      )}

      {paymentModalInvoice && (
        <Modal onClick={(e) => e.target === e.currentTarget && setPaymentModalInvoice(null)}>
          <ModalContent style={{ maxWidth: '420px' }}>
            <ModalHeader>
              <ModalTitle>Record Payment — {paymentModalInvoice.invoiceNumber}</ModalTitle>
              <CloseButton onClick={() => setPaymentModalInvoice(null)}>×</CloseButton>
            </ModalHeader>
            <form onSubmit={handleRecordPayment}>
              <FormGroup>
                <Label>Balance due</Label>
                <Input
                  type="text"
                  readOnly
                  value={formatCurrency(getInvoiceBalance(paymentModalInvoice))}
                  style={{ background: '#f8fafc' }}
                />
              </FormGroup>
              <FormGroup>
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={getInvoiceBalance(paymentModalInvoice)}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Method</Label>
                <Select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                >
                  <option value="eft">EFT / Bank transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Notes</Label>
                <TextArea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional payment reference"
                />
              </FormGroup>
              <Actions style={{ justifyContent: 'flex-end' }}>
                <ActionButton type="button" onClick={() => setPaymentModalInvoice(null)}>Cancel</ActionButton>
                <ActionButton type="submit" className="primary">Save Payment</ActionButton>
              </Actions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {showInventorySelector && (
        <InventorySelector onClick={() => setShowInventorySelector(false)}>
          <InventoryModal onClick={(e) => e.stopPropagation()}>
            <InventoryHeader>
              <InventoryTitle>Select from Inventory</InventoryTitle>
              <InventoryCloseButton onClick={() => setShowInventorySelector(false)}>
                <FiX />
              </InventoryCloseButton>
            </InventoryHeader>
            <InventoryList>
              <div style={{ marginBottom: '1rem' }}>
                <Input
                  type="text"
                  placeholder="Search products, services, consultations..."
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'All' },
                  { value: 'product', label: 'Products' },
                  { value: 'service', label: 'Services' },
                  { value: 'consultation', label: 'Consultations' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setInventoryTypeFilter(type.value)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '6px',
                      border: inventoryTypeFilter === type.value ? '1px solid #14b8a6' : '1px solid #e2e8f0',
                      background: inventoryTypeFilter === type.value ? '#f0fdfa' : 'white',
                      color: inventoryTypeFilter === type.value ? '#0f766e' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <FiPackage style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                  <p>No inventory items found.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Add products, services, or consultations in Inventory first.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredProducts = products.filter(product => {
                    if (!product.name) return false;
                    const matchesSearch = product.name.toLowerCase().includes(inventorySearchTerm.toLowerCase());
                    const itemType = product.itemType || 'product';
                    const matchesType = inventoryTypeFilter === 'all' || itemType === inventoryTypeFilter;
                    return matchesSearch && matchesType;
                  });

                  if (filteredProducts.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <p>
                          {inventorySearchTerm
                            ? `No items found matching "${inventorySearchTerm}"`
                            : `No ${inventoryTypeFilter === 'all' ? 'items' : inventoryTypeFilter + 's'} found.`}
                        </p>
                      </div>
                    );
                  }

                  return filteredProducts.map((product) => {
                    const itemType = product.itemType || 'product';
                    const isProduct = itemType === 'product';
                    const price = parseFloat(product.price ?? product.unitPrice ?? 0) || 0;
                    const isLowStock = isProduct && (product.quantity || 0) <= (product.minQuantity || 0);

                    return (
                      <InventoryItem
                        key={product.id}
                        onClick={() => selectInventoryItem(product)}
                      >
                        <InventoryItemInfo>
                          <InventoryItemName>
                            {product.name}
                            <span style={{
                              marginLeft: '0.5rem',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              color: '#0f766e',
                              background: '#f0fdfa',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px'
                            }}>
                              {getItemTypeLabel(itemType)}
                            </span>
                          </InventoryItemName>
                          <InventoryItemDetails>
                            {product.description && `${product.description} • `}
                            {isProduct ? (
                              <ItemStock lowStock={isLowStock}>
                                Stock: {product.quantity || 0}
                                {isLowStock && ' (Low Stock)'}
                              </ItemStock>
                            ) : (
                              <span>
                                {product.duration ? `Duration: ${product.duration}` : 'No stock required'}
                              </span>
                            )}
                          </InventoryItemDetails>
                        </InventoryItemInfo>
                        <ItemPrice>{formatCurrency(price)}</ItemPrice>
                      </InventoryItem>
                    );
                  });
                })()
              )}
            </InventoryList>
          </InventoryModal>
        </InventorySelector>
      )}
    </Container>
  );
}