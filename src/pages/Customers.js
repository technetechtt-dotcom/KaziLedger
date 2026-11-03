import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiDownload,
  FiUpload,
  FiX,
  FiArrowLeft
} from 'react-icons/fi';
import { useCustomer } from '../context/CustomerContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { generateNextCustomerNumber } from '../services/numberGenerator';

const CustomersContainer = styled.div`
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
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    padding: 0.75rem;
    gap: 0.5rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  
  @media (max-width: 640px) {
    min-width: 150px;
    flex: 1 1 100%;
    order: 2;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #f8fafc;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    order: 1;
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  min-width: 40px;
  height: 40px;
  
  &:hover {
    background: #f8fafc;
    color: #374151;
  }
  
  @media (max-width: 640px) {
    flex: 1;
    min-width: auto;
  }
`;

const AddButton = styled.button`
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`;

const CustomersList = styled.div`
  padding: 1rem;
`;

const CustomerCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 640px) {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }
`;

const CustomerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const CustomerName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CustomerActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const IconButton = styled.button`
  padding: 0.25rem;
  border: none;
  background: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const InfoIcon = styled.div`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  margin: 0 0 1.5rem 0;
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
  padding: 1rem;
  
  @media (max-width: 640px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 640px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
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
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background: #3b82f6;
  color: white;
  border: none;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  
  &:hover {
    background: #f8fafc;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
`;

const UploadText = styled.p`
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
`;


export default function Customers() {
  const {
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    importCustomers,
    exportCustomers
  } = useCustomer();
  const { user } = useFirebaseBusiness();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'South Africa',
    notes: '',
    customerType: 'individual',
    customerNumber: ''
  });

  const filteredCustomers = searchCustomers(searchTerm);

  // Generate customer number when component loads or modal opens
  useEffect(() => {
    const generateCustomerNumber = async () => {
      if (user?.uid && showModal && !editingCustomer) {
        try {
          const result = await generateNextCustomerNumber(user.uid);
          if (result.success) {
            setFormData(prev => ({
              ...prev,
              customerNumber: result.number
            }));
          }
        } catch (error) {
          console.error('Error generating customer number:', error);
          // Fallback to timestamp-based number
          setFormData(prev => ({
            ...prev,
            customerNumber: `CUST-${String(Date.now()).slice(-3)}`
          }));
        }
      }
    };

    generateCustomerNumber();
  }, [user?.uid, showModal, editingCustomer]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCustomer = async () => {
    setEditingCustomer(null);
    // Generate new customer number
    const newCustomerNumber = await generateNextCustomerNumber(user.uid);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'South Africa',
      notes: '',
      customerType: 'individual',
      customerNumber: newCustomerNumber.success ? newCustomerNumber.number : `CUST-${String(Date.now()).slice(-3)}`
    });
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      company: customer.company || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      country: customer.country || 'South Africa',
      notes: customer.notes || '',
      customerType: customer.customerType || 'individual'
    });
    setShowModal(true);
  };

  const handleSaveCustomer = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }

    try {
      let result;
      if (editingCustomer) {
        result = await updateCustomer(editingCustomer.id, formData);
      } else {
        result = await addCustomer(formData);
      }

      if (result.success) {
        alert(editingCustomer ? 'Customer updated successfully!' : 'Customer added successfully!');
        setShowModal(false);
        setEditingCustomer(null);
      } else {
        alert('Failed to save customer: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        const result = await deleteCustomer(customer.id);
        if (result.success) {
          alert('Customer deleted successfully!');
        } else {
          alert('Failed to delete customer: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const customers = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
            const customer = {};
            headers.forEach((header, index) => {
              customer[header.toLowerCase()] = values[index] || '';
            });
            if (customer.name && customer.email) {
              customers.push(customer);
            }
          }
        }

        if (customers.length > 0) {
          importCustomers(customers).then(result => {
            if (result.success) {
              alert(`Successfully imported ${customers.length} customers!`);
              setShowImportModal(false);
            } else {
              alert('Failed to import customers: ' + result.error);
            }
          });
        } else {
          alert('No valid customers found in the file.');
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Failed to parse file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <CustomersContainer>
      <TopBar>
        <BackButton 
          onClick={() => window.history.back()} 
          title="Go back"
          aria-label="Go back"
        >
          <FiArrowLeft aria-hidden="true" />
        </BackButton>
        <PageTitle>Customers</PageTitle>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        <ActionButtons>
          <ActionButton 
            onClick={() => setShowImportModal(true)} 
            title="Import"
            aria-label="Import customers"
          >
            <FiUpload aria-hidden="true" />
          </ActionButton>
          <ActionButton 
            onClick={exportCustomers} 
            title="Export"
            aria-label="Export customers"
          >
            <FiDownload aria-hidden="true" />
          </ActionButton>
          <AddButton onClick={handleAddCustomer} aria-label="Add new customer">
            <FiPlus aria-hidden="true" />
            Add Customer
          </AddButton>
        </ActionButtons>
      </TopBar>

      <CustomersList>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>👥</EmptyIcon>
            <EmptyTitle>No customers found</EmptyTitle>
            <EmptyText>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first customer to get started'}
            </EmptyText>
            {!searchTerm && (
              <AddButton onClick={handleAddCustomer}>
                <FiPlus />
                Add Customer
              </AddButton>
            )}
          </EmptyState>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id}>
              <CustomerHeader>
                <CustomerName>{customer.name}</CustomerName>
                <CustomerActions>
                  <IconButton onClick={() => handleEditCustomer(customer)} title="Edit">
                    <FiEdit2 />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteCustomer(customer)} title="Delete">
                    <FiTrash2 />
                  </IconButton>
                </CustomerActions>
              </CustomerHeader>
              <CustomerInfo>
                {customer.email && (
                  <InfoRow>
                    <InfoIcon><FiMail /></InfoIcon>
                    {customer.email}
                  </InfoRow>
                )}
                {customer.phone && (
                  <InfoRow>
                    <InfoIcon><FiPhone /></InfoIcon>
                    {customer.phone}
                  </InfoRow>
                )}
                {customer.company && (
                  <InfoRow>
                    <InfoIcon><FiBriefcase /></InfoIcon>
                    {customer.company}
                  </InfoRow>
                )}
                {(customer.address || customer.city) && (
                  <InfoRow>
                    <InfoIcon><FiMapPin /></InfoIcon>
                    {[customer.address, customer.city, customer.state].filter(Boolean).join(', ')}
                  </InfoRow>
                )}
              </CustomerInfo>
            </CustomerCard>
          ))
        )}
      </CustomersList>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormGroup>
                <Label>Customer Number</Label>
                <Input
                  type="text"
                  value={formData.customerNumber}
                  onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                  placeholder="Auto-generated"
                  readOnly
                  style={{ backgroundColor: '#f8fafc', color: '#6b7280' }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Customer name"
                />
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="customer@example.com"
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+27 12 345 6789"
                />
              </FormGroup>

              <FormGroup>
                <Label>Customer Type</Label>
                <Select
                  value={formData.customerType}
                  onChange={(e) => handleInputChange('customerType', e.target.value)}
                >
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                </Select>
              </FormGroup>

              {formData.customerType === 'business' && (
                <FormGroup>
                  <Label>Company</Label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </FormGroup>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label>City</Label>
                  <Input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>State/Province</Label>
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                  />
                </FormGroup>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label>ZIP/Postal Code</Label>
                  <Input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="12345"
                  />
                </FormGroup>
                <FormGroup style={{ flex: 1 }}>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Notes</Label>
                <TextArea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this customer..."
                />
              </FormGroup>

              <ButtonGroup>
                <SecondaryButton onClick={() => setShowModal(false)}>
                  Cancel
                </SecondaryButton>
                <PrimaryButton onClick={handleSaveCustomer} disabled={loading}>
                  {loading ? 'Saving...' : (editingCustomer ? 'Update' : 'Add')} Customer
                </PrimaryButton>
              </ButtonGroup>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {showImportModal && (
        <Modal onClick={() => setShowImportModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Import Customers</ModalTitle>
              <CloseButton onClick={() => setShowImportModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FileUploadArea onClick={() => document.getElementById('csvFile').click()}>
                <FiUpload style={{ fontSize: '2rem', color: '#6b7280' }} />
                <UploadText>Click to upload CSV file</UploadText>
                <UploadText style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  CSV should include: Name, Email, Phone, Company, Address, City, State, Zip, Country, Notes
                </UploadText>
              </FileUploadArea>
              <FileInput
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleImportFile}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </CustomersContainer>
  );
}
