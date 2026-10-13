import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiUpload, 
  FiFileText, 
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiEye,
  FiX,
  FiArrowLeft
} from 'react-icons/fi';
import { useCompliance } from '../context/ComplianceContext';

const ComplianceContainer = styled.div`
  padding: 1rem;
  max-width: 400px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
`;

const AddButton = styled.button`
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DocumentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => {
    if (props.status === 'expired') return '#dc2626';
    if (props.status === 'expiring') return '#f59e0b';
    return '#10b981';
  }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const DocumentInfo = styled.div`
  flex: 1;
`;

const DocumentName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const DocumentType = styled.span`
  background: #f1f5f9;
  color: #64748b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &.valid {
    background: #d1fae5;
    color: #059669;
  }
  
  &.expiring {
    background: #fef3c7;
    color: #d97706;
  }
  
  &.expired {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const DocumentDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  color: #1e293b;
  font-weight: 500;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: #14b8a6;
    color: #14b8a6;
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
    background: #fee2e2;
    color: #dc2626;
    border-color: #fecaca;
    
    &:hover {
      background: #fecaca;
    }
  }
`;

const UploadModal = styled.div`
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

const UploadContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const UploadHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UploadTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

const UploadBody = styled.div`
  padding: 1.5rem;
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

const FileUpload = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #14b8a6;
    background: #f0fdfa;
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0d9488;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #64748b;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const EmptyText = styled.p`
  font-size: 0.875rem;
  margin: 0;
`;

export default function Compliance() {
  // eslint-disable-next-line no-unused-vars
  const { documents, addDocument, updateDocument, deleteDocument, loading } = useCompliance();
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Documents are now loaded from Firebase via the useCompliance hook

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    issueDate: '',
    expiryDate: '',
    file: null
  });

  const getStatusInfo = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Expired', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', text: 'Expiring Soon', days: daysUntilExpiry };
    } else {
      return { status: 'valid', text: 'Valid', days: daysUntilExpiry };
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.file) {
      try {
        const documentData = {
          name: formData.name,
          type: formData.type,
          status: getStatusInfo(formData.expiryDate).status,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          fileSize: (formData.file.size / (1024 * 1024)).toFixed(1) + ' MB',
          uploadedDate: new Date().toISOString().split('T')[0]
        };
        
        const result = await addDocument(documentData);
        if (result.success) {
          alert('Document added successfully!');
          setFormData({
            name: '',
            type: '',
            issueDate: '',
            expiryDate: '',
            file: null
          });
          setShowUploadModal(false);
        } else {
          alert('Failed to add document: ' + result.error);
        }
      } catch (error) {
        console.error('Error adding document:', error);
        alert('Failed to add document. Please try again.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const result = await deleteDocument(id);
        if (result.success) {
          alert('Document deleted successfully!');
        } else {
          alert('Failed to delete document: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const documentTypes = [
    'Registration',
    'Tax',
    'Insurance',
    'Safety',
    'License',
    'Permit',
    'Certificate',
    'Other'
  ];

  const expiredDocs = documents.filter(doc => doc.status === 'expired');
  const expiringDocs = documents.filter(doc => doc.status === 'expiring');
  const validDocs = documents.filter(doc => doc.status === 'valid');

  return (
    <ComplianceContainer>
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={() => window.history.back()} title="Go back">
            <FiArrowLeft />
          </BackButton>
          <Title>Compliance & Documents</Title>
        </div>
        <AddButton onClick={() => setShowUploadModal(true)}>
          <FiPlus />
          Add Document
        </AddButton>
      </TopBar>

      {(expiredDocs.length > 0 || expiringDocs.length > 0) && (
        <Section>
          <SectionTitle>
            <FiAlertTriangle style={{ color: '#f59e0b' }} />
            Alerts & Reminders
          </SectionTitle>
          
          {expiredDocs.map(doc => {
            const statusInfo = getStatusInfo(doc.expiryDate);
            return (
              <DocumentCard key={doc.id} status="expired">
                <DocumentHeader>
                  <DocumentInfo>
                    <DocumentName>{doc.name}</DocumentName>
                    <DocumentType>{doc.type}</DocumentType>
                  </DocumentInfo>
                  <StatusBadge className="expired">
                    <FiAlertTriangle />
                    Expired {statusInfo.days} days ago
                  </StatusBadge>
                </DocumentHeader>
                
                <DocumentDetails>
                  <DetailItem>
                    <DetailLabel>Issue Date</DetailLabel>
                    <DetailValue>{new Date(doc.issueDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Expiry Date</DetailLabel>
                    <DetailValue>{new Date(doc.expiryDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                </DocumentDetails>
                
                <DocumentActions>
                  <ActionButton className="primary">
                    <FiUpload />
                    Renew
                  </ActionButton>
                  <ActionButton>
                    <FiEye />
                    View
                  </ActionButton>
                  <ActionButton>
                    <FiDownload />
                    Download
                  </ActionButton>
                  <ActionButton className="danger" onClick={() => handleDelete(doc.id)}>
                    <FiTrash2 />
                    Delete
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            );
          })}
          
          {expiringDocs.map(doc => {
            const statusInfo = getStatusInfo(doc.expiryDate);
            return (
              <DocumentCard key={doc.id} status="expiring">
                <DocumentHeader>
                  <DocumentInfo>
                    <DocumentName>{doc.name}</DocumentName>
                    <DocumentType>{doc.type}</DocumentType>
                  </DocumentInfo>
                  <StatusBadge className="expiring">
                    <FiClock />
                    Expires in {statusInfo.days} days
                  </StatusBadge>
                </DocumentHeader>
                
                <DocumentDetails>
                  <DetailItem>
                    <DetailLabel>Issue Date</DetailLabel>
                    <DetailValue>{new Date(doc.issueDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Expiry Date</DetailLabel>
                    <DetailValue>{new Date(doc.expiryDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                </DocumentDetails>
                
                <DocumentActions>
                  <ActionButton className="primary">
                    <FiUpload />
                    Renew
                  </ActionButton>
                  <ActionButton>
                    <FiEye />
                    View
                  </ActionButton>
                  <ActionButton>
                    <FiDownload />
                    Download
                  </ActionButton>
                  <ActionButton className="danger" onClick={() => handleDelete(doc.id)}>
                    <FiTrash2 />
                    Delete
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            );
          })}
        </Section>
      )}

      <Section>
        <SectionTitle>
          <FiFileText />
          All Documents
        </SectionTitle>
        
        {validDocs.length === 0 && expiredDocs.length === 0 && expiringDocs.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📄</EmptyIcon>
            <EmptyTitle>No Documents Yet</EmptyTitle>
            <EmptyText>Upload your business documents to start tracking compliance</EmptyText>
          </EmptyState>
        ) : (
          validDocs.map(doc => {
            const statusInfo = getStatusInfo(doc.expiryDate);
            return (
              <DocumentCard key={doc.id} status="valid">
                <DocumentHeader>
                  <DocumentInfo>
                    <DocumentName>{doc.name}</DocumentName>
                    <DocumentType>{doc.type}</DocumentType>
                  </DocumentInfo>
                  <StatusBadge className="valid">
                    <FiCheckCircle />
                    {statusInfo.text}
                  </StatusBadge>
                </DocumentHeader>
                
                <DocumentDetails>
                  <DetailItem>
                    <DetailLabel>Issue Date</DetailLabel>
                    <DetailValue>{new Date(doc.issueDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Expiry Date</DetailLabel>
                    <DetailValue>{new Date(doc.expiryDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>File Size</DetailLabel>
                    <DetailValue>{doc.fileSize}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Uploaded</DetailLabel>
                    <DetailValue>{new Date(doc.uploadedDate).toLocaleDateString()}</DetailValue>
                  </DetailItem>
                </DocumentDetails>
                
                <DocumentActions>
                  <ActionButton>
                    <FiEye />
                    View
                  </ActionButton>
                  <ActionButton>
                    <FiDownload />
                    Download
                  </ActionButton>
                  <ActionButton>
                    <FiEdit />
                    Edit
                  </ActionButton>
                  <ActionButton className="danger" onClick={() => handleDelete(doc.id)}>
                    <FiTrash2 />
                    Delete
                  </ActionButton>
                </DocumentActions>
              </DocumentCard>
            );
          })
        )}
      </Section>

      {showUploadModal && (
        <UploadModal onClick={() => setShowUploadModal(false)}>
          <UploadContent onClick={(e) => e.stopPropagation()}>
            <UploadHeader>
              <UploadTitle>Upload Document</UploadTitle>
              <CloseButton onClick={() => setShowUploadModal(false)}>
                <FiX />
              </CloseButton>
            </UploadHeader>
            
            <UploadBody>
              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Document Name</Label>
                  <Input
                    type="text"
                    placeholder="e.g., Business Registration Certificate"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Document Type</Label>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                  >
                    <option value="">Select Type</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Upload File</Label>
                  <FileUpload onClick={() => document.getElementById('fileInput').click()}>
                    <UploadIcon>
                      <FiUpload />
                    </UploadIcon>
                    <UploadText>
                      {formData.file ? formData.file.name : 'Click to select file or drag and drop'}
                    </UploadText>
                    <input
                      id="fileInput"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </FileUpload>
                </FormGroup>
                
                <SaveButton type="submit">
                  Upload Document
                </SaveButton>
              </form>
            </UploadBody>
          </UploadContent>
        </UploadModal>
      )}
    </ComplianceContainer>
  );
}
