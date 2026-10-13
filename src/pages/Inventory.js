import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiPlus, 
  FiSearch, 
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowDown,
  FiArrowUp,
  FiX,
  FiPackage,
  FiSettings,
  FiUsers
} from 'react-icons/fi';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFinancialData } from '../context/FinancialDataContext';

const InventoryContainer = styled.div`
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
  background: white;
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

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const ContentArea = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #1e293b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const StockMovementSection = styled.div`
  margin-top: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #14b8a6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f0fdfa;
  }
`;

const MovementEntry = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

const MovementIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: ${props => props.type === 'in' ? '#dcfce7' : '#fef2f2'};
  border-radius: 6px;
  margin-right: 0.75rem;
  color: ${props => props.type === 'in' ? '#16a34a' : '#dc2626'};
`;

const MovementDetails = styled.div`
  flex: 1;
`;

const MovementType = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const MovementReference = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const MovementTime = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f9fafb;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    background: white;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f9fafb;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    background: white;
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const PriceInput = styled.div`
  position: relative;
`;

const DollarSign = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

const PriceInputField = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f9fafb;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    background: white;
  }
`;

const SaveButton = styled.button`
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

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 1rem;
`;

const ProductsSectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  padding: 0 0.5rem;
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProductCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: ${props => props.lowStock ? '#fefce8' : 'white'};
  border-radius: 8px;
  margin: 0 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #9ca3af;
  overflow: hidden;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const ProductPrice = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #14b8a6;
  margin: 0.25rem 0;
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.lowStock ? '#f59e0b' : '#64748b'};
`;

const WarningIcon = styled(FiAlertTriangle)`
  font-size: 0.875rem;
  color: #f59e0b;
`;

const ItemTypeTabs = styled.div`
  display: flex;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.25rem;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#14b8a6' : '#64748b'};
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '500'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? 'white' : '#f1f5f9'};
  }
`;

const ItemTypeIcon = styled.div`
  font-size: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const EmptyStateText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

// Item types
const ITEM_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  CONSULTATION: 'consultation'
};

// Sample product data
// Products are now managed by FinancialDataContext

// Sample stock movement data
const stockMovements = [
  {
    id: 1,
    type: 'in',
    reference: 'INV-2024-001',
    time: '10:30 AM',
    date: 'today'
  },
  {
    id: 2,
    type: 'out',
    reference: 'SO-2024-002',
    time: '11:45 AM',
    date: 'today'
  },
  {
    id: 3,
    type: 'in',
    reference: 'INV-2024-002',
    time: '9:15 AM',
    date: 'yesterday'
  },
  {
    id: 4,
    type: 'out',
    reference: 'SO-2024-003',
    time: '2:20 PM',
    date: 'yesterday'
  }
];

export default function Inventory() {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const { 
    products, 
    addProduct, 
    addExpense 
  } = useFinancialData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeItemType, setActiveItemType] = useState(ITEM_TYPES.PRODUCT);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    initialStock: '',
    itemType: ITEM_TYPES.PRODUCT,
    duration: '', // For services and consultations
    category: ''
  });

  // Filter products by type and search term
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = product.itemType === activeItemType || (!product.itemType && activeItemType === ITEM_TYPES.PRODUCT);
    return matchesSearch && matchesType;
  });

  // Get items by type
  const getItemsByType = (type) => {
    return products.filter(product => 
      product.itemType === type || (!product.itemType && type === ITEM_TYPES.PRODUCT)
    );
  };

  const getItemTypeIcon = (type) => {
    switch (type) {
      case ITEM_TYPES.PRODUCT:
        return <FiPackage />;
      case ITEM_TYPES.SERVICE:
        return <FiSettings />;
      case ITEM_TYPES.CONSULTATION:
        return <FiUsers />;
      default:
        return <FiPackage />;
    }
  };

  const getItemTypeLabel = (type) => {
    switch (type) {
      case ITEM_TYPES.PRODUCT:
        return 'Products';
      case ITEM_TYPES.SERVICE:
        return 'Services';
      case ITEM_TYPES.CONSULTATION:
        return 'Consultations';
      default:
        return 'Items';
    }
  };

  const handleAddProduct = () => {
    setProductForm(prev => ({
      ...prev,
      itemType: activeItemType
    }));
    setShowAddProduct(true);
  };

  const handleCloseAddProduct = () => {
    setShowAddProduct(false);
    setProductForm({
      name: '',
      description: '',
      unitPrice: '',
      initialStock: '',
      itemType: activeItemType,
      duration: '',
      category: ''
    });
  };

  const handleItemTypeChange = (type) => {
    setActiveItemType(type);
    setProductForm(prev => ({
      ...prev,
      itemType: type
    }));
  };

  const handleInputChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    // For products, require initial stock
    if (productForm.itemType === ITEM_TYPES.PRODUCT && !productForm.initialStock) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const unitPrice = parseFloat(productForm.unitPrice);
      const initialStock = productForm.itemType === ITEM_TYPES.PRODUCT ? parseInt(productForm.initialStock) : 0;
      
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: unitPrice,
        itemType: productForm.itemType,
        category: productForm.category || 'General',
        sku: `${productForm.itemType.toUpperCase()}-${Date.now()}`,
        status: 'active'
      };

      // Add type-specific fields
      if (productForm.itemType === ITEM_TYPES.PRODUCT) {
        productData.quantity = initialStock;
        productData.minQuantity = 5;
        productData.unitPrice = unitPrice;
        productData.currentStock = initialStock;
      } else if (productForm.itemType === ITEM_TYPES.SERVICE || productForm.itemType === ITEM_TYPES.CONSULTATION) {
        productData.duration = productForm.duration;
        productData.unitPrice = unitPrice;
        productData.quantity = 0; // Services/consultations don't have stock
        productData.currentStock = 0;
      }
      
      const result = await addProduct(productData);

      if (result.success) {
        // If initial stock > 0, create an expense record for inventory purchase (products only)
        if (productForm.itemType === ITEM_TYPES.PRODUCT && initialStock > 0) {
          await addExpense({
            amount: initialStock * unitPrice,
            date: new Date().toISOString().split('T')[0],
            category: 'inventory',
            vendor: 'Stock Purchase',
            notes: `Initial stock purchase for ${productForm.name} (${initialStock} units)`,
            source: 'inventory',
            sourceId: result.id
          });
        }
        
        const itemTypeLabel = getItemTypeLabel(productForm.itemType);
        alert(`${itemTypeLabel.slice(0, -1)} added successfully!`);
        handleCloseAddProduct();
      } else {
        alert(`Failed to add ${getItemTypeLabel(productForm.itemType).toLowerCase().slice(0, -1)}: ` + result.error);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert(`Failed to add ${getItemTypeLabel(productForm.itemType).toLowerCase().slice(0, -1)}. Please try again.`);
    }
  };

  const handleBack = () => {
    if (showStockMovement) {
      setShowStockMovement(false);
    } else {
      // Navigate back to previous page
      window.history.back();
    }
  };

  const handleViewStockMovement = () => {
    setShowStockMovement(true);
  };

  const todayMovements = stockMovements.filter(movement => movement.date === 'today');
  const yesterdayMovements = stockMovements.filter(movement => movement.date === 'yesterday');

  if (showStockMovement) {
    return (
      <InventoryContainer>
        <TopBar>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
          </BackButton>
          <PageTitle>Stock Movement Log</PageTitle>
          <div></div>
        </TopBar>

        <ContentArea>
          <div>
            <SectionTitle>Today</SectionTitle>
            {todayMovements.map((movement) => (
              <MovementEntry key={movement.id}>
                <MovementIcon type={movement.type}>
                  {movement.type === 'in' ? <FiArrowDown /> : <FiArrowUp />}
                </MovementIcon>
                <MovementDetails>
                  <MovementType>
                    {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                  </MovementType>
                  <MovementReference>
                    Reference: {movement.reference}
                  </MovementReference>
                </MovementDetails>
                <MovementTime>{movement.time}</MovementTime>
              </MovementEntry>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <SectionTitle>Yesterday</SectionTitle>
            {yesterdayMovements.map((movement) => (
              <MovementEntry key={movement.id}>
                <MovementIcon type={movement.type}>
                  {movement.type === 'in' ? <FiArrowDown /> : <FiArrowUp />}
                </MovementIcon>
                <MovementDetails>
                  <MovementType>
                    {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                  </MovementType>
                  <MovementReference>
                    Reference: {movement.reference}
                  </MovementReference>
                </MovementDetails>
                <MovementTime>{movement.time}</MovementTime>
              </MovementEntry>
            ))}
          </div>
        </ContentArea>
      </InventoryContainer>
    );
  }

  return (
    <InventoryContainer>
      <ContentArea>
        <Header>
          <Title>Inventory</Title>
          <AddButton onClick={handleAddProduct} aria-label="Add new product">
            <FiPlus aria-hidden="true" />
          </AddButton>
        </Header>

        <ItemTypeTabs>
          <TabButton 
            active={activeItemType === ITEM_TYPES.PRODUCT} 
            onClick={() => handleItemTypeChange(ITEM_TYPES.PRODUCT)}
            aria-label="View products"
            aria-pressed={activeItemType === ITEM_TYPES.PRODUCT}
          >
            <ItemTypeIcon aria-hidden="true">{getItemTypeIcon(ITEM_TYPES.PRODUCT)}</ItemTypeIcon>
            Products
          </TabButton>
          <TabButton 
            active={activeItemType === ITEM_TYPES.SERVICE} 
            onClick={() => handleItemTypeChange(ITEM_TYPES.SERVICE)}
            aria-label="View services"
            aria-pressed={activeItemType === ITEM_TYPES.SERVICE}
          >
            <ItemTypeIcon aria-hidden="true">{getItemTypeIcon(ITEM_TYPES.SERVICE)}</ItemTypeIcon>
            Services
          </TabButton>
          <TabButton 
            active={activeItemType === ITEM_TYPES.CONSULTATION} 
            onClick={() => handleItemTypeChange(ITEM_TYPES.CONSULTATION)}
            aria-label="View consultations"
            aria-pressed={activeItemType === ITEM_TYPES.CONSULTATION}
          >
            <ItemTypeIcon aria-hidden="true">{getItemTypeIcon(ITEM_TYPES.CONSULTATION)}</ItemTypeIcon>
            Consultations
          </TabButton>
        </ItemTypeTabs>

        <SearchBar>
          <SearchIcon aria-hidden="true" />
          <SearchInput
            type="text"
            placeholder={`Search ${getItemTypeLabel(activeItemType).toLowerCase()}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label={`Search ${getItemTypeLabel(activeItemType).toLowerCase()}`}
          />
        </SearchBar>

        <ProductsSectionTitle>{getItemTypeLabel(activeItemType)}</ProductsSectionTitle>

        <ProductsList>
          {filteredProducts.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>{getItemTypeIcon(activeItemType)}</EmptyStateIcon>
              <EmptyStateTitle>No {getItemTypeLabel(activeItemType).toLowerCase()} found</EmptyStateTitle>
              <EmptyStateText>
                {searchTerm ? 'Try adjusting your search terms' : `Add your first ${getItemTypeLabel(activeItemType).toLowerCase().slice(0, -1)} to get started`}
              </EmptyStateText>
            </EmptyState>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} lowStock={product.lowStock}>
                <ProductImage>
                  {getItemTypeIcon(product.itemType || ITEM_TYPES.PRODUCT)}
                </ProductImage>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{formatCurrency(product.unitPrice || product.price || 0)}</ProductPrice>
                  {product.itemType === ITEM_TYPES.PRODUCT ? (
                    <StockInfo lowStock={(product.currentStock || 0) < 5}>
                      {(product.currentStock || 0) < 5 && <WarningIcon />}
                      {(product.currentStock || 0) < 5 ? `Low Stock: ${product.currentStock || 0}` : `Stock: ${product.currentStock || 0}`}
                    </StockInfo>
                  ) : (
                    <StockInfo>
                      {product.duration && `Duration: ${product.duration}`}
                      {product.category && ` • ${product.category}`}
                    </StockInfo>
                  )}
                </ProductInfo>
              </ProductCard>
            ))
          )}
        </ProductsList>

        <StockMovementSection>
          <SectionHeader>
            <SectionTitle>Recent Stock Movement</SectionTitle>
            <ViewAllButton onClick={handleViewStockMovement}>
              View All
            </ViewAllButton>
          </SectionHeader>
          
          {todayMovements.slice(0, 2).map((movement) => (
            <MovementEntry key={movement.id}>
              <MovementIcon type={movement.type}>
                {movement.type === 'in' ? <FiArrowDown /> : <FiArrowUp />}
              </MovementIcon>
              <MovementDetails>
                <MovementType>
                  {movement.type === 'in' ? 'Stock In' : 'Stock Out'}
                </MovementType>
                <MovementReference>
                  Reference: {movement.reference}
                </MovementReference>
              </MovementDetails>
              <MovementTime>{movement.time}</MovementTime>
            </MovementEntry>
          ))}
        </StockMovementSection>
      </ContentArea>

      {showAddProduct && (
        <ModalOverlay onClick={handleCloseAddProduct}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div></div>
              <ModalTitle>Add {getItemTypeLabel(activeItemType).slice(0, -1)}</ModalTitle>
              <CloseButton onClick={handleCloseAddProduct}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <FormGroup>
                <Label>{getItemTypeLabel(activeItemType).slice(0, -1)} Name</Label>
                <Input
                  type="text"
                  placeholder={
                    activeItemType === ITEM_TYPES.PRODUCT ? "e.g., Artisan Coffee Beans" :
                    activeItemType === ITEM_TYPES.SERVICE ? "e.g., Website Design" :
                    "e.g., Business Strategy Consultation"
                  }
                  value={productForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  placeholder={
                    activeItemType === ITEM_TYPES.PRODUCT ? "e.g., Dark roast, single-origin from Ethiopia" :
                    activeItemType === ITEM_TYPES.SERVICE ? "e.g., Complete website design and development" :
                    "e.g., Comprehensive business strategy analysis and recommendations"
                  }
                  value={productForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Category</Label>
                <Input
                  type="text"
                  placeholder={
                    activeItemType === ITEM_TYPES.PRODUCT ? "e.g., Food & Beverage" :
                    activeItemType === ITEM_TYPES.SERVICE ? "e.g., Web Development" :
                    "e.g., Business Consulting"
                  }
                  value={productForm.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                />
              </FormGroup>

              {(activeItemType === ITEM_TYPES.SERVICE || activeItemType === ITEM_TYPES.CONSULTATION) && (
                <FormGroup>
                  <Label>Duration</Label>
                  <Input
                    type="text"
                    placeholder="e.g., 2 hours, 1 day, 1 week"
                    value={productForm.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label>Price</Label>
                <PriceInput>
                  <DollarSign>{getCurrencySymbol()}</DollarSign>
                  <PriceInputField
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={productForm.unitPrice}
                    onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  />
                </PriceInput>
              </FormGroup>

              {activeItemType === ITEM_TYPES.PRODUCT && (
                <FormGroup>
                  <Label>Initial Stock</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={productForm.initialStock}
                    onChange={(e) => handleInputChange('initialStock', e.target.value)}
                  />
                </FormGroup>
              )}

              <SaveButton onClick={handleSaveProduct}>
                Save {getItemTypeLabel(activeItemType).slice(0, -1)}
              </SaveButton>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </InventoryContainer>
  );
}