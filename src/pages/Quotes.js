import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiTrash2,
  FiCalendar,
  FiX,
  FiSend,
  FiSliders,
  FiEye,
  FiDownload,
  FiFileText,
  FiPackage,
  FiArrowLeft
} from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCustomer } from '../context/CustomerContext';
import QuoteTemplate from '../components/QuoteTemplate';
import { functionsService } from '../firebase/functions';
import { generateNextQuoteNumber } from '../services/numberGenerator';

const QuotesContainer = styled.div`
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

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 640px) {
    margin-bottom: 1rem;
    padding: 0;
  }
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

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
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

const InputGroup = styled.div`
  position: relative;
`;

const CalendarIcon = styled(FiCalendar)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
  pointer-events: none;
`;

const ErrorMessage = styled.div`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
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
  z-index: 1000;
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
  transition: all 0.2s;
  
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
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const ItemCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemInfo = styled.div`
  flex: 1;
`;


const ItemActions = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #374151;
  }
`;

const AddItemButton = styled.button`
  width: 100%;
  padding: 1rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #14b8a6;
    color: #14b8a6;
  }
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: ${props => props.total ? '2px solid #e5e7eb' : '1px solid #f3f4f6'};
  font-weight: ${props => props.total ? '700' : '500'};
  font-size: ${props => props.total ? '1.125rem' : '0.875rem'};
  color: ${props => props.total ? '#14b8a6' : '#1e293b'};
`;

const VatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
  font-weight: 500;
  font-size: 0.875rem;
  color: #1e293b;
`;

const VatInput = styled.input`
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
  }
`;

const EditTemplateButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const PreviewButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #f8fafc;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
`;

const DownloadButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #f8fafc;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #10b981;
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
  margin-bottom: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #059669;
  }
`;

const SendQuoteButton = styled.button`
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
  margin-bottom: 2rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

const PreviewModal = styled.div`
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

const PreviewContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const PreviewHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PreviewTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ClosePreviewButton = styled.button`
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

const PreviewBody = styled.div`
  padding: 1.5rem;
`;

// Quotes Management Styled Components
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

const MainTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CreateButton = styled.button`
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

const QuoteGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const QuoteCard = styled.div`
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

const QuoteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuoteInfo = styled.div`
  flex: 1;
`;

const QuoteNumber = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const CustomerName = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 0.25rem 0;
`;

const QuoteDate = styled.p`
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
      case 'accepted': return '#f0fdf4';
      case 'pending': return '#fef3c7';
      case 'rejected': return '#fef2f2';
      case 'expired': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'accepted': return '#16a34a';
      case 'pending': return '#d97706';
      case 'rejected': return '#dc2626';
      case 'expired': return '#6b7280';
      default: return '#6b7280';
    }
  }};
`;

const QuoteDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const QuoteAmount = styled.div`
  text-align: right;
`;

const AmountValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const ValidUntil = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const QuoteActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const QuoteActionButton = styled.button`
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

export default function Quotes() {
  const { formatCurrency } = useCurrency();
  const { businessInfo } = useBusinessBranding();
  const { user } = useFirebaseBusiness();
  const { addQuote, updateQuote, deleteQuote, quotes, products } = useFinancialData();
  const { customers } = useCustomer();
  const [showPreview, setShowPreview] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
  const [viewingQuote, setViewingQuote] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Customers loading handled by context
  const [formData, setFormData] = useState({
    customer: '',
    quoteNumber: '',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [],
    vatRate: 15,
    discount: 0,
    notes: '',
    projectDescription: '',
    projectDuration: ''
  });
  const [showInventorySelector, setShowInventorySelector] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [isQuoteSaved, setIsQuoteSaved] = useState(false);

  // Generate quote number when component loads
  useEffect(() => {
    const generateQuoteNumber = async () => {
      if (user?.uid) {
        try {
          const result = await generateNextQuoteNumber(user.uid);
          if (result.success) {
            setFormData(prev => ({
              ...prev,
              quoteNumber: result.number
            }));
          }
        } catch (error) {
          console.error('Error generating quote number:', error);
          // Fallback to timestamp-based number
          setFormData(prev => ({
            ...prev,
            quoteNumber: `QT-${String(Date.now()).slice(-4)}`
          }));
        }
      }
    };

    generateQuoteNumber();
  }, [user?.uid]);

  const handleInputChange = (field, value) => {
    // Reset saved quote state when user starts editing
    if (isQuoteSaved) {
      setIsQuoteSaved(false);
    }
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      
      // Auto-update validUntil if quoteDate changes and validUntil becomes invalid
      if (field === 'quoteDate' && updated.validUntil && updated.validUntil < value) {
        const quoteDate = new Date(value);
        const validUntilDate = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days later
        updated.validUntil = validUntilDate.toISOString().split('T')[0];
      }
      
      return updated;
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0.00, total: 0.00, isFromInventory: false, productId: null }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const openInventorySelector = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    setInventorySearchTerm('');
    setShowInventorySelector(true);
  };

  const selectInventoryItem = (product) => {
    if (selectedItemIndex !== null) {
      const isLowStock = (product.quantity || 0) <= (product.minQuantity || 0);
      
      if (isLowStock) {
        const confirmSelection = window.confirm(
          `Warning: ${product.name} has low stock (${product.quantity || 0} items). Do you want to continue?`
        );
        if (!confirmSelection) {
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, index) => 
          index === selectedItemIndex 
            ? {
                ...item,
                name: product.name,
                price: product.price || 0,
                total: (product.price || 0) * item.quantity,
                isFromInventory: true,
                productId: product.id
              }
            : item
        )
      }));
    }
    setShowInventorySelector(false);
    setSelectedItemIndex(null);
  };

  const resetItemToManual = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? {
              ...item,
              name: '',
              price: 0,
              total: 0,
              isFromInventory: false,
              productId: null
            }
          : item
      )
    }));
  };

  const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = (subtotal * formData.vatRate) / 100;
  const grandTotal = subtotal + vatAmount - formData.discount;

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
  };

  const handleDownload = async () => {
    // First, save the quote if it hasn't been saved yet
    if (!isQuoteSaved) {
      if (!formData.customer) {
        alert('Please select a customer before downloading');
        return;
      }
      
      if (!formData.items || formData.items.length === 0) {
        alert('Please add at least one item to the quote before downloading');
        return;
      }

      try {
        console.log('Auto-saving quote before download...');
        const result = await addQuote({
          ...formData,
          customerId: typeof formData.customer === 'object' ? formData.customer.id : null,
          customerName: typeof formData.customer === 'object' ? formData.customer.name : formData.customer,
          total: grandTotal,
          status: 'pending',
          createdAt: new Date().toISOString()
        });

        if (result.success) {
          setIsQuoteSaved(true);
          console.log('Quote auto-saved successfully with ID:', result.id);
        } else {
          console.error('Failed to auto-save quote:', result.error);
          alert('Failed to save quote. Please try again.');
          return;
        }
      } catch (error) {
        console.error('Error auto-saving quote:', error);
        alert('Failed to save quote. Please try again.');
        return;
      }
    }

    try {
      // Try the programmatic PDF generation first
      const { generateQuotePDF, downloadPDF } = await import('../firebase/pdf');
      
      const quoteData = {
        quoteNumber: formData.quoteNumber,
        createdAt: formData.quoteDate,
        customer: {
          name: typeof formData.customer === 'object' && formData.customer.name 
            ? `${formData.customer.name}${formData.customer.company ? ` (${formData.customer.company})` : ''}`
            : formData.customer || 'Client Name',
          email: typeof formData.customer === 'object' ? formData.customer.email : '',
          phone: typeof formData.customer === 'object' ? formData.customer.phone : '',
          address: typeof formData.customer === 'object' ? formData.customer.address : ''
        },
        items: formData.items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          price: item.price
        }))
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
      
      console.log('Generating PDF programmatically with data:', { quoteData, businessData });
      
      const pdf = generateQuotePDF(quoteData, businessData);
      const filename = `Quote_${formData.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdf, filename);
      
      return; // Exit early if programmatic approach works
      
    } catch (error) {
      console.error('Error with programmatic PDF generation:', error);
      console.log('Falling back to html2canvas approach...');
    }
    
    try {
      // Fallback to html2canvas approach
      // Create a temporary element with the current quote data
      const tempElement = document.createElement('div');
      tempElement.id = 'temp-quote-pdf';
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.visibility = 'hidden';
      tempElement.style.width = '800px'; // Set explicit width
      tempElement.style.minHeight = '600px'; // Set minimum height
      tempElement.style.backgroundColor = '#ffffff'; // Ensure white background
      tempElement.style.padding = '20px'; // Add some padding
      tempElement.style.boxSizing = 'border-box';
      
      document.body.appendChild(tempElement);

      // Render the QuoteTemplate with current form data
      const { createRoot } = await import('react-dom/client');
      const { generatePDFFromElement } = await import('../firebase/pdf');
      
      const root = createRoot(tempElement);
      
      root.render(
        React.createElement(QuoteTemplate, {
          quote: {
            quoteNumber: formData.quoteNumber,
            createdAt: formData.quoteDate,
            clientName: typeof formData.customer === 'object' && formData.customer.name 
              ? `${formData.customer.name}${formData.customer.company ? ` (${formData.customer.company})` : ''}`
              : formData.customer || 'Client Name',
            clientEmail: typeof formData.customer === 'object' ? formData.customer.email : '',
            clientPhone: typeof formData.customer === 'object' ? formData.customer.phone : '',
            clientAddress: typeof formData.customer === 'object' ? formData.customer.address : '',
            clientCity: typeof formData.customer === 'object' ? formData.customer.city : '',
            clientPostalCode: typeof formData.customer === 'object' ? formData.customer.postalCode : '',
            clientCountry: typeof formData.customer === 'object' ? formData.customer.country : '',
            projectDescription: formData.projectDescription || 'Project description',
            projectDuration: formData.projectDuration || '',
            status: 'Pending'
          },
          items: formData.items.map(item => ({
            description: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          businessInfo: businessInfo,
          formatCurrency: formatCurrency
        })
      );

      // Wait for rendering and generate PDF
      setTimeout(async () => {
        try {
          // Check if the element has content
          const element = document.getElementById('temp-quote-pdf');
          if (!element) {
            throw new Error('Temporary element not found');
          }
          
          console.log('Element content:', element.innerHTML);
          console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);
          console.log('Element computed styles:', window.getComputedStyle(element));
          
          // Check if there are any styled-components
          const styledElements = element.querySelectorAll('[class*="sc-"]');
          console.log('Styled components found:', styledElements.length);
          
          // If no content, try a different approach
          if (element.innerHTML.trim() === '' || element.offsetHeight === 0) {
            console.log('Element is empty, trying alternative approach...');
            
            // Try rendering without styled-components first
            const simpleElement = document.createElement('div');
            simpleElement.id = 'temp-simple-quote-pdf';
            simpleElement.style.position = 'fixed';
            simpleElement.style.top = '0';
            simpleElement.style.left = '0';
            simpleElement.style.zIndex = '9999';
            simpleElement.style.width = '800px';
            simpleElement.style.minHeight = '600px';
            simpleElement.style.backgroundColor = '#ffffff';
            simpleElement.style.padding = '20px';
            simpleElement.style.fontFamily = 'Arial, sans-serif';
            simpleElement.style.border = '2px solid red'; // Debug border
            
            // Create a simple HTML version
            const quoteData = {
              quoteNumber: formData.quoteNumber,
              createdAt: formData.quoteDate,
              clientName: typeof formData.customer === 'object' && formData.customer.name 
                ? `${formData.customer.name}${formData.customer.company ? ` (${formData.customer.company})` : ''}`
                : formData.customer || 'Client Name',
              clientEmail: typeof formData.customer === 'object' ? formData.customer.email : '',
              clientPhone: typeof formData.customer === 'object' ? formData.customer.phone : '',
              clientAddress: typeof formData.customer === 'object' ? formData.customer.address : '',
              clientCity: typeof formData.customer === 'object' ? formData.customer.city : '',
              clientPostalCode: typeof formData.customer === 'object' ? formData.customer.postalCode : '',
              clientCountry: typeof formData.customer === 'object' ? formData.customer.country : '',
              projectDescription: formData.projectDescription || 'Project description',
              projectDuration: formData.projectDuration || '',
              status: 'Pending'
            };
            
            const items = formData.items.map(item => ({
              description: item.name,
              quantity: item.quantity,
              price: item.price
            }));
            
            const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const tax = subtotal * 0.15;
            const total = subtotal + tax;
            
            simpleElement.innerHTML = `
              <div style="max-width: 800px; margin: 0 auto; background: white; padding: 2rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid #e2e8f0;">
                  <div style="flex: 1;">
                    <h1 style="font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0 0 0.5rem 0;">${businessInfo.businessName || 'Your Business Name'}</h1>
                    <div style="font-size: 0.875rem; color: #64748b; line-height: 1.4;">
                      ${businessInfo.businessAddress ? `<div>${businessInfo.businessAddress}</div>` : ''}
                      ${businessInfo.businessPhone ? `<div>Phone: ${businessInfo.businessPhone}</div>` : ''}
                      ${businessInfo.businessEmail ? `<div>Email: ${businessInfo.businessEmail}</div>` : ''}
                      ${businessInfo.businessWebsite ? `<div>Website: ${businessInfo.businessWebsite}</div>` : ''}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <h2 style="font-size: 2rem; font-weight: 700; color: #14b8a6; margin: 0 0 1rem 0;">QUOTE</h2>
                    <div style="font-size: 0.875rem; color: #64748b;">
                      <div><strong>Quote #:</strong> ${quoteData.quoteNumber}</div>
                      <div><strong>Date:</strong> ${new Date(quoteData.createdAt).toLocaleDateString()}</div>
                      <div><strong>Valid Until:</strong> ${new Date(new Date(quoteData.createdAt).getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}</div>
                      <div><strong>Status:</strong> ${quoteData.status}</div>
                    </div>
                  </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                  <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0;">Quote For:</h3>
                    <div style="font-size: 0.875rem; color: #64748b; line-height: 1.4;">
                      <div><strong>${quoteData.clientName}</strong></div>
                      ${quoteData.clientEmail ? `<div>${quoteData.clientEmail}</div>` : ''}
                      ${quoteData.clientPhone ? `<div>${quoteData.clientPhone}</div>` : ''}
                      ${quoteData.clientAddress ? `
                        <div style="margin-top: 0.5rem;">
                          <div>${quoteData.clientAddress}</div>
                          ${quoteData.clientCity ? `
                            <div>
                              ${quoteData.clientCity}${quoteData.clientPostalCode ? `, ${quoteData.clientPostalCode}` : ''}
                            </div>
                          ` : ''}
                          ${quoteData.clientCountry ? `<div>${quoteData.clientCountry}</div>` : ''}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0;">Project Details:</h3>
                    <div style="font-size: 0.875rem; color: #64748b; line-height: 1.4;">
                      <div>${quoteData.projectDescription}</div>
                      ${quoteData.projectDuration ? `<div>Duration: ${quoteData.projectDuration}</div>` : ''}
                    </div>
                  </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
                  <thead>
                    <tr>
                      <th style="background: #f8fafc; padding: 0.75rem; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Description</th>
                      <th style="background: #f8fafc; padding: 0.75rem; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Quantity</th>
                      <th style="background: #f8fafc; padding: 0.75rem; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Price</th>
                      <th style="background: #f8fafc; padding: 0.75rem; text-align: left; font-weight: 600; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${items.length > 0 ? items.map(item => `
                      <tr>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0; color: #64748b;">${item.description}</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: right;">${item.quantity}</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: right;">${formatCurrency(item.price)}</td>
                        <td style="padding: 0.75rem; border-bottom: 1px solid #e2e8f0; color: #64748b; text-align: right;">${formatCurrency(item.quantity * item.price)}</td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="4" style="padding: 0.75rem; text-align: center; font-style: italic; color: #94a3b8;">No items added</td>
                      </tr>
                    `}
                  </tbody>
                </table>
                
                <div style="display: flex; justify-content: flex-end; margin-bottom: 2rem;">
                  <table style="width: 300px;">
                    <tbody>
                      <tr>
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #64748b;">Subtotal:</td>
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #64748b; font-weight: 500;">${formatCurrency(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #64748b;">Tax (15%):</td>
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #64748b; font-weight: 500;">${formatCurrency(tax)}</td>
                      </tr>
                      <tr style="border-top: 2px solid #14b8a6;">
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.125rem;">Total:</td>
                        <td style="text-align: right; padding: 0.25rem 0.75rem; color: #1e293b; font-weight: 700; font-size: 1.125rem;">${formatCurrency(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0;">
                  <h3 style="font-size: 1rem; font-weight: 600; color: #1e293b; margin: 0 0 0.5rem 0;">Terms & Conditions</h3>
                  <ul style="font-size: 0.875rem; color: #64748b; line-height: 1.4; margin: 0; padding-left: 1.25rem;">
                    <li>This quote is valid for 30 days from the date of issue</li>
                    <li>Payment terms: 50% deposit required to commence work</li>
                    <li>Remaining balance due upon project completion</li>
                    <li>All prices include applicable taxes unless otherwise stated</li>
                    <li>Additional work requested may incur extra charges</li>
                    <li>Project timeline may vary based on client feedback and changes</li>
                  </ul>
                </div>
                
                <div style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-radius: 6px; text-align: center;">
                  <div style="font-size: 0.875rem; color: #64748b; font-weight: 500;">
                    This quote is valid until <strong>${new Date(new Date(quoteData.createdAt).getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}</strong>
                  </div>
                </div>
                
                <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center; font-size: 0.75rem; color: #94a3b8;">
                  <div>Thank you for considering our services!</div>
                  
                  ${(businessInfo.taxInfo?.taxId || businessInfo.taxInfo?.vatNumber || businessInfo.taxInfo?.businessRegistration) ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: left;">
                      <div style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">Tax Information:</div>
                      ${businessInfo.taxInfo?.taxId ? `<div>Tax ID: ${businessInfo.taxInfo.taxId}</div>` : ''}
                      ${businessInfo.taxInfo?.vatNumber ? `<div>VAT Number: ${businessInfo.taxInfo.vatNumber}</div>` : ''}
                      ${businessInfo.taxInfo?.businessRegistration ? `<div>Business Registration: ${businessInfo.taxInfo.businessRegistration}</div>` : ''}
                    </div>
                  ` : ''}
                  
                  ${(businessInfo.bankDetails?.bankName || businessInfo.bankDetails?.accountNumber || businessInfo.bankDetails?.swiftCode) ? `
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: left;">
                      <div style="font-weight: 600; margin-bottom: 0.5rem; color: #1e293b;">Bank Details:</div>
                      ${businessInfo.bankDetails?.bankName ? `<div>Bank: ${businessInfo.bankDetails.bankName}</div>` : ''}
                      ${businessInfo.bankDetails?.accountHolderName ? `<div>Account Holder: ${businessInfo.bankDetails.accountHolderName}</div>` : ''}
                      ${businessInfo.bankDetails?.accountNumber ? `<div>Account Number: ${businessInfo.bankDetails.accountNumber}</div>` : ''}
                      ${businessInfo.bankDetails?.routingNumber ? `<div>Routing Number: ${businessInfo.bankDetails.routingNumber}</div>` : ''}
                      ${businessInfo.bankDetails?.swiftCode ? `<div>SWIFT Code: ${businessInfo.bankDetails.swiftCode}</div>` : ''}
                      ${businessInfo.bankDetails?.iban ? `<div>IBAN: ${businessInfo.bankDetails.iban}</div>` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
            
            document.body.appendChild(simpleElement);
            
            // Wait a bit for the HTML to render
            setTimeout(async () => {
              try {
                console.log('Simple element content:', simpleElement.innerHTML);
                console.log('Simple element dimensions:', simpleElement.offsetWidth, simpleElement.offsetHeight);
                
                // Make it visible for debugging
                simpleElement.style.visibility = 'visible';
                
                // Wait a moment to see it
                setTimeout(async () => {
                  try {
                    const filename = `Quote_${formData.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
                    await generatePDFFromElement('temp-simple-quote-pdf', filename);
                    
                    // Cleanup both elements
                    root.unmount();
                    document.body.removeChild(tempElement);
                    document.body.removeChild(simpleElement);
                  } catch (error) {
                    console.error('Error generating PDF with simple approach:', error);
                    alert('Failed to generate PDF. Please try again.');
                    
                    // Cleanup on error
                    try {
                      root.unmount();
                      document.body.removeChild(tempElement);
                      document.body.removeChild(simpleElement);
                    } catch (cleanupError) {
                      console.error('Error during cleanup:', cleanupError);
                    }
                  }
                }, 2000); // Wait 2 seconds to see the element
              } catch (error) {
                console.error('Error in simple approach:', error);
                alert('Failed to generate PDF. Please try again.');
                
                // Cleanup on error
                try {
                  root.unmount();
                  document.body.removeChild(tempElement);
                  document.body.removeChild(simpleElement);
                } catch (cleanupError) {
                  console.error('Error during cleanup:', cleanupError);
                }
              }
            }, 500);
            
            return;
          }
          
          const filename = `Quote_${formData.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
          await generatePDFFromElement('temp-quote-pdf', filename);
          
          // Cleanup
          root.unmount();
          document.body.removeChild(tempElement);
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Failed to generate PDF. Please try again.');
          
          // Cleanup on error
          try {
            root.unmount();
            document.body.removeChild(tempElement);
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
          }
        }
      }, 2000); // Increased timeout to 2 seconds
      
    } catch (error) {
      console.error('Error downloading quote:', error);
      alert('Failed to download quote. Please try again.');
    }
  };


  const handleSave = async () => {
    if (!formData.customer) {
      alert('Please select a customer');
      return;
    }
    
    if (!formData.items || formData.items.length === 0) {
      alert('Please add at least one item to the quote');
      return;
    }

    try {
      const result = await addQuote({
        ...formData,
        customerId: typeof formData.customer === 'object' ? formData.customer.id : null,
        customerName: typeof formData.customer === 'object' ? formData.customer.name : formData.customer,
        total: grandTotal,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      if (result.success) {
        setIsQuoteSaved(true);
        alert('Quote saved successfully! You can now download it.');
        
        // Reset form
        // Generate new quote number for next quote
        const newQuoteNumber = await generateNextQuoteNumber(user.uid);
        setFormData({
          customer: '',
          quoteNumber: newQuoteNumber.success ? newQuoteNumber.number : `QT-${String(Date.now()).slice(-4)}`,
          quoteDate: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [],
          notes: '',
          vatRate: 15,
          discount: 0
        });
        
        // Reset saved quote state after a delay to allow download
        setTimeout(() => {
          setIsQuoteSaved(false);
        }, 10000); // Reset after 10 seconds
      } else {
        alert('Failed to save quote: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      alert('Failed to save quote. Please try again.');
    }
  };

  const handleSendQuote = async () => {
    const customerEmail = typeof formData.customer === 'object' ? formData.customer.email : '';
    const customerName = typeof formData.customer === 'object' ? formData.customer.name : formData.customer;

    if (!formData.customer || !customerEmail) {
      alert('Please select a customer with a valid email address');
      return;
    }

    try {
      const result = await functionsService.sendQuoteEmail(
        user?.uid,
        formData.quoteNumber,
        customerEmail,
        customerName || 'Customer',
        formData
      );

      if (result.success) {
        alert('Quote sent successfully!');
      } else {
        alert('Failed to send quote: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending quote:', error);
      alert('Failed to send quote. Please try again.');
    }
  };

  // Quote Management Functions
  const handleEditQuote = (quote) => {
    setEditingQuote(quote);
    setFormData({
      customer: quote.customer || '',
      quoteNumber: quote.quoteNumber,
      quoteDate: quote.quoteDate || quote.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
      validUntil: quote.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: quote.items || [],
      vatRate: quote.vatRate || 15,
      discount: quote.discount || 0,
      notes: quote.notes || '',
      projectDescription: quote.projectDescription || '',
      projectDuration: quote.projectDuration || ''
    });
    setShowCreateModal(true);
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        const result = await deleteQuote(quoteId);
        if (result.success) {
          alert('Quote deleted successfully!');
        } else {
          alert('Failed to delete quote: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('Failed to delete quote. Please try again.');
      }
    }
  };

  const handleViewQuote = (quote) => {
    setViewingQuote(quote);
  };

  const handleUpdateQuoteStatus = async (quoteId, newStatus) => {
    const statusText = newStatus === 'accepted' ? 'accepted' : 'rejected';
    const confirmMessage = `Are you sure you want to mark this quote as ${statusText}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const quote = quotes.find(q => q.id === quoteId);
      if (!quote) return;

      const updateData = {
        ...quote,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Add status change timestamp
      if (newStatus === 'accepted') {
        updateData.acceptedAt = new Date().toISOString();
      } else if (newStatus === 'rejected') {
        updateData.rejectedAt = new Date().toISOString();
      }

      const result = await updateQuote(quoteId, updateData);

      if (result.success) {
        const message = newStatus === 'accepted' 
          ? 'Quote accepted successfully! You can now create an invoice for this quote.'
          : 'Quote rejected successfully.';
        alert(message);
      } else {
        alert('Failed to update quote status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
      alert('Failed to update quote status. Please try again.');
    }
  };

  const handleDownloadQuote = async (quote) => {
    try {
      // Use the existing download logic but with the quote data
      const { generateQuotePDF, downloadPDF } = await import('../firebase/pdf');
      
      const quoteData = {
        quoteNumber: quote.quoteNumber,
        createdAt: quote.createdAt || quote.date,
        customer: {
          name: quote.customerName || 'Customer',
          email: quote.customer?.email || '',
          phone: quote.customer?.phone || '',
          address: quote.customer?.address || ''
        },
        items: quote.items || []
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
      
      const pdf = generateQuotePDF(quoteData, businessData);
      const filename = `Quote_${quote.quoteNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(pdf, filename);
      
    } catch (error) {
      console.error('Error downloading quote:', error);
      alert('Failed to download quote. Please try again.');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (filterStatus === 'all') return true;
    return quote.status === filterStatus;
  });

  // Data consistency check removed for production

  const calculateQuoteTotal = (quote) => {
    if (quote.total) return quote.total;
    if (quote.items && Array.isArray(quote.items)) {
      const subtotal = quote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const vatAmount = (subtotal * (quote.vatRate || 15)) / 100;
      return subtotal + vatAmount - (quote.discount || 0);
    }
    return 0;
  };

  const isQuoteExpired = (quote) => {
    if (!quote.validUntil) return false;
    const validUntil = new Date(quote.validUntil);
    const today = new Date();
    return validUntil < today;
  };

  return (
    <QuotesContainer>
      {!showCreateModal ? (
        <>
          <Header>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <BackButton onClick={() => window.history.back()} title="Go back">
                <FiArrowLeft />
              </BackButton>
              <MainTitle>Quote Management</MainTitle>
            </div>
            <CreateButton onClick={() => setShowCreateModal(true)}>
              Create Quote
            </CreateButton>
          </Header>

          <FilterTabs>
            <FilterTab 
              active={filterStatus === 'all'} 
              onClick={() => setFilterStatus('all')}
            >
              All Quotes
            </FilterTab>
            <FilterTab 
              active={filterStatus === 'pending'} 
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </FilterTab>
            <FilterTab 
              active={filterStatus === 'accepted'} 
              onClick={() => setFilterStatus('accepted')}
            >
              Accepted
            </FilterTab>
            <FilterTab 
              active={filterStatus === 'rejected'} 
              onClick={() => setFilterStatus('rejected')}
            >
              Rejected
            </FilterTab>
          </FilterTabs>

          <QuoteGrid>
            {filteredQuotes.length > 0 ? (
              filteredQuotes.map(quote => {
                const total = calculateQuoteTotal(quote);
                const expired = isQuoteExpired(quote);
                const status = expired && quote.status === 'pending' ? 'expired' : quote.status;
                
                return (
                  <QuoteCard key={quote.id}>
                    <QuoteHeader>
                      <QuoteInfo>
                        <QuoteNumber>{quote.quoteNumber}</QuoteNumber>
                        <CustomerName>{quote.customerName || 'Unknown Customer'}</CustomerName>
                        <QuoteDate>
                          Created: {new Date(quote.createdAt || quote.date).toLocaleDateString()}
                        </QuoteDate>
                      </QuoteInfo>
                      <StatusBadge status={status}>
                        {status || 'pending'}
                      </StatusBadge>
                    </QuoteHeader>
                    
                    <QuoteDetails>
                      <div>
                        {quote.validUntil && (
                          <ValidUntil>
                            Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                            {expired && <span style={{ color: '#dc2626', fontWeight: '600' }}> (Expired)</span>}
                          </ValidUntil>
                        )}
                      </div>
                      <QuoteAmount>
                        <AmountValue>{formatCurrency(total)}</AmountValue>
                      </QuoteAmount>
                    </QuoteDetails>

                    <QuoteActions>
                      <QuoteActionButton onClick={() => handleViewQuote(quote)}>
                        View
                      </QuoteActionButton>
                      {quote.status === 'pending' && !expired && (
                        <>
                          <QuoteActionButton 
                            className="primary"
                            onClick={() => handleUpdateQuoteStatus(quote.id, 'accepted')}
                            style={{ background: '#16a34a', borderColor: '#16a34a' }}
                          >
                            Accept
                          </QuoteActionButton>
                          <QuoteActionButton 
                            onClick={() => handleUpdateQuoteStatus(quote.id, 'rejected')}
                            style={{ background: '#dc2626', color: 'white', borderColor: '#dc2626' }}
                          >
                            Reject
                          </QuoteActionButton>
                        </>
                      )}
                      <QuoteActionButton 
                        className="danger" 
                        onClick={() => handleDeleteQuote(quote.id)}
                      >
                        Delete
                      </QuoteActionButton>
                    </QuoteActions>
                  </QuoteCard>
                );
              })
            ) : (
              <QuoteCard>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <FiFileText style={{ fontSize: '3rem', marginBottom: '1rem', color: '#94a3b8' }} />
                  <h3>No quotes found</h3>
                  <p>Create your first quote to get started</p>
                </div>
              </QuoteCard>
            )}
          </QuoteGrid>
        </>
      ) : (
        <>
          <TopBar>
            <CloseButton onClick={() => {
              setShowCreateModal(false);
              setEditingQuote(null);
            }}>
              <FiX />
            </CloseButton>
            <Title>{editingQuote ? 'Edit Quote' : 'New Quote'}</Title>
            <div></div>
          </TopBar>

      <Section>
        <FormGroup>
          <Label>Customer</Label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Select
              value={typeof formData.customer === 'object' ? formData.customer.id : formData.customer}
              onChange={(e) => {
                const customerId = e.target.value;
                if (customerId) {
                  const customer = customers.find(c => c.id === customerId);
                  if (customer) {
                    handleInputChange('customer', {
                      id: customer.id,
                      name: customer.name,
                      email: customer.email,
                      phone: customer.phone,
                      company: customer.company,
                      address: customer.address
                    });
                  }
                } else {
                  handleInputChange('customer', '');
                }
              }}
              style={{ flex: 1 }}
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

        <FormGroup>
          <Label>Quote Number</Label>
          <Input
            type="text"
            value={formData.quoteNumber}
            onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Quote Date</Label>
          <InputGroup>
            <Input
              type="date"
              value={formData.quoteDate}
              onChange={(e) => handleInputChange('quoteDate', e.target.value)}
            />
            <CalendarIcon />
          </InputGroup>
        </FormGroup>

        <FormGroup>
          <Label>Valid Until</Label>
          <InputGroup>
            <Input
              type="date"
              value={formData.validUntil}
              onChange={(e) => handleInputChange('validUntil', e.target.value)}
              min={formData.quoteDate}
            />
            <CalendarIcon />
          </InputGroup>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                const quoteDate = new Date(formData.quoteDate);
                const validUntilDate = new Date(quoteDate.getTime() + (30 * 24 * 60 * 60 * 1000));
                handleInputChange('validUntil', validUntilDate.toISOString().split('T')[0]);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              +30 days
            </button>
            <button
              type="button"
              onClick={() => {
                const quoteDate = new Date(formData.quoteDate);
                const validUntilDate = new Date(quoteDate.getTime() + (7 * 24 * 60 * 60 * 1000));
                handleInputChange('validUntil', validUntilDate.toISOString().split('T')[0]);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              +7 days
            </button>
          </div>
          {formData.validUntil && formData.validUntil < formData.quoteDate && (
            <ErrorMessage>
              Valid Until date cannot be before Quote Date
            </ErrorMessage>
          )}
        </FormGroup>

      </Section>

      <Section>
        <SectionTitle>Items</SectionTitle>

        {formData.items.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            color: '#64748b',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '2px dashed #d1d5db'
          }}>
            <FiPackage style={{ fontSize: '3rem', marginBottom: '1rem', color: '#94a3b8' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0' }}>
              No items added yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
              Click "Add Item" below to start building your quote
            </p>
            <AddItemButton onClick={addItem} style={{ 
              width: 'auto', 
              padding: '0.75rem 1.5rem',
              border: '2px solid #14b8a6',
              background: 'white',
              color: '#14b8a6'
            }}>
              <FiPlus />
              Add Your First Item
            </AddItemButton>
          </div>
        ) : (
          <>
            {formData.items.map((item, index) => (
              <ItemCard key={index}>
                <ItemInfo>
                  <FormGroup>
                    <Label>Item Name</Label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].name = e.target.value;
                          newItems[index].total = newItems[index].quantity * newItems[index].price;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                        placeholder="Enter item name or select from inventory"
                        style={{ flex: 1 }}
                      />
                      {!item.isFromInventory && (
                        <InventoryButton 
                          variant="primary"
                          onClick={() => openInventorySelector(index)}
                        >
                          <FiPackage /> Inventory
                        </InventoryButton>
                      )}
                      {item.isFromInventory && (
                        <ManualButton 
                          onClick={() => resetItemToManual(index)}
                        >
                          Manual
                        </ManualButton>
                      )}
                    </div>
                    {item.isFromInventory && (
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>
                        ✓ From inventory
                        {item.productId && (() => {
                          const product = products.find(p => p.id === item.productId);
                          const isLowStock = product && (product.quantity || 0) <= (product.minQuantity || 0);
                          return isLowStock ? (
                            <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>
                              ⚠ Low stock ({product.quantity || 0})
                            </span>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </FormGroup>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <FormGroup style={{ flex: 1 }}>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          newItems[index].total = newItems[index].quantity * newItems[index].price;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                      />
                    </FormGroup>
                    
                    <FormGroup style={{ flex: 1 }}>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].price = parseFloat(e.target.value) || 0;
                          newItems[index].total = newItems[index].quantity * newItems[index].price;
                          setFormData(prev => ({ ...prev, items: newItems }));
                        }}
                      />
                    </FormGroup>
                    
                    <FormGroup style={{ flex: 1 }}>
                      <Label>Total</Label>
                      <Input
                        type="text"
                        value={formatCurrency(item.total)}
                        readOnly
                        style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
                      />
                    </FormGroup>
                  </div>
                </ItemInfo>
                <ItemActions onClick={() => removeItem(index)}>
                  <FiTrash2 />
                </ItemActions>
              </ItemCard>
            ))}

            <AddItemButton onClick={addItem}>
              <FiPlus />
              Add Item
            </AddItemButton>
          </>
        )}
      </Section>

      <Section>
        <SectionTitle>Summary</SectionTitle>
        <SummaryCard>
          {formData.items.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#64748b',
              fontStyle: 'italic'
            }}>
              Add items to see pricing summary
            </div>
          ) : (
            <>
              <SummaryRow>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </SummaryRow>
              <VatRow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>VAT</span>
                  <VatInput
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => handleInputChange('vatRate', parseInt(e.target.value) || 0)}
                  />
                  <span>%</span>
                </div>
                <span>{formatCurrency(vatAmount)}</span>
              </VatRow>
              <SummaryRow>
                <span>Discount</span>
                <span>{formatCurrency(formData.discount)}</span>
              </SummaryRow>
              <SummaryRow total>
                <span>Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </SummaryRow>
            </>
          )}
        </SummaryCard>
      </Section>

      <EditTemplateButton>
        <FiSliders />
        Edit Template
      </EditTemplateButton>

      <ActionButtons>
        <PreviewButton onClick={handlePreview}>
          <FiEye />
          Preview
        </PreviewButton>
        <DownloadButton onClick={handleDownload}>
          <FiDownload />
          {isQuoteSaved ? 'Download' : 'Save & Download'}
        </DownloadButton>
      </ActionButtons>

      <SaveButton onClick={handleSave}>
        <FiFileText />
        Save Quote
      </SaveButton>


            <SendQuoteButton onClick={handleSendQuote}>
              <FiSend />
              Send Quote
            </SendQuoteButton>


      {showPreview && (
        <PreviewModal onClick={handleClosePreview}>
          <PreviewContent onClick={(e) => e.stopPropagation()}>
            <PreviewHeader>
              <PreviewTitle>Quote Preview</PreviewTitle>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleDownload}
                  style={{
                    background: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <FiDownload />
                  {isQuoteSaved ? 'Download PDF' : 'Save & Download PDF'}
                </button>
                <ClosePreviewButton onClick={handleClosePreview}>
                  <FiX />
                </ClosePreviewButton>
              </div>
            </PreviewHeader>
            <PreviewBody>
              <div id="quote-preview-content">
                <QuoteTemplate 
                  quote={{
                    quoteNumber: formData.quoteNumber,
                    createdAt: formData.quoteDate,
                    clientName: typeof formData.customer === 'object' && formData.customer.name 
                      ? `${formData.customer.name}${formData.customer.company ? ` (${formData.customer.company})` : ''}`
                      : formData.customer || 'Client Name',
                    clientEmail: typeof formData.customer === 'object' ? formData.customer.email : '',
                    clientPhone: typeof formData.customer === 'object' ? formData.customer.phone : '',
                    clientAddress: typeof formData.customer === 'object' ? formData.customer.address : '',
                    clientCity: typeof formData.customer === 'object' ? formData.customer.city : '',
                    clientPostalCode: typeof formData.customer === 'object' ? formData.customer.postalCode : '',
                    clientCountry: typeof formData.customer === 'object' ? formData.customer.country : '',
                    projectDescription: formData.projectDescription || 'Project description',
                    projectDuration: formData.projectDuration || '',
                    status: 'Pending'
                  }}
                  items={formData.items.map(item => ({
                    description: item.name,
                    quantity: item.quantity,
                    price: item.price
                  }))}
                />
              </div>
            </PreviewBody>
          </PreviewContent>
        </PreviewModal>
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
                  placeholder="Search inventory items..."
                  value={inventorySearchTerm}
                  onChange={(e) => setInventorySearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <FiPackage style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                  <p>No inventory items found.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Add items to your inventory first.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredProducts = products.filter(product => 
                    product.name && product.name.toLowerCase().includes(inventorySearchTerm.toLowerCase())
                  );
                  
                  if (filteredProducts.length === 0 && inventorySearchTerm) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        <p>No items found matching "{inventorySearchTerm}"</p>
                      </div>
                    );
                  }
                  
                  return filteredProducts.map((product) => (
                  <InventoryItem 
                    key={product.id} 
                    onClick={() => selectInventoryItem(product)}
                  >
                    <InventoryItemInfo>
                      <InventoryItemName>{product.name}</InventoryItemName>
                      <InventoryItemDetails>
                        {product.description && `${product.description} • `}
                        <ItemStock lowStock={(product.quantity || 0) <= (product.minQuantity || 0)}>
                          Stock: {product.quantity || 0}
                          {(product.quantity || 0) <= (product.minQuantity || 0) && ' (Low Stock)'}
                        </ItemStock>
                      </InventoryItemDetails>
                    </InventoryItemInfo>
                    <ItemPrice>{formatCurrency(product.price || 0)}</ItemPrice>
                  </InventoryItem>
                  ));
                })()
              )}
            </InventoryList>
          </InventoryModal>
        </InventorySelector>
      )}
        </>
      )}

      {/* Quote Viewing Modal */}
      {viewingQuote && (
        <PreviewModal onClick={() => setViewingQuote(null)}>
          <PreviewContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
            <PreviewHeader>
              <PreviewTitle>Quote Preview</PreviewTitle>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {viewingQuote.status === 'pending' && !isQuoteExpired(viewingQuote) && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateQuoteStatus(viewingQuote.id, 'accepted');
                        setViewingQuote(null);
                      }}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateQuoteStatus(viewingQuote.id, 'rejected');
                        setViewingQuote(null);
                      }}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDownloadQuote(viewingQuote)}
                  style={{
                    background: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <FiDownload />
                  Download PDF
                </button>
                <button
                  onClick={() => {
                    handleEditQuote(viewingQuote);
                    setViewingQuote(null);
                  }}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  Edit
                </button>
                <ClosePreviewButton onClick={() => setViewingQuote(null)}>
                  <FiX />
                </ClosePreviewButton>
              </div>
            </PreviewHeader>
            <PreviewBody>
              <QuoteTemplate 
                quote={{
                  ...viewingQuote,
                  clientName: viewingQuote.customerName || 'Customer',
                  clientEmail: viewingQuote.customer?.email || '',
                  clientPhone: viewingQuote.customer?.phone || '',
                  clientAddress: viewingQuote.customer?.address || '',
                  clientCity: viewingQuote.customer?.city || '',
                  clientPostalCode: viewingQuote.customer?.postalCode || '',
                  clientCountry: viewingQuote.customer?.country || ''
                }}
                items={viewingQuote.items || []}
              />
            </PreviewBody>
          </PreviewContent>
        </PreviewModal>
      )}

    </QuotesContainer>
  );
}