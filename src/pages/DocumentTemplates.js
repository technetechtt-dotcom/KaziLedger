import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  FiArrowLeft,
  FiCheck
} from 'react-icons/fi';
import { useBusinessBranding } from '../contexts/BusinessBrandingContext';
import { toast } from 'react-toastify';

const TEMPLATE_STORAGE_KEY = 'kaziledger_document_template';

const TemplatesContainer = styled.div`
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const TemplateCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: ${props => props.selected ? '2px solid #3b82f6' : '1px solid #e5e7eb'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.selected ? '#3b82f6' : '#d1d5db'};
  }
`;

const TemplateContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PreviewContainer = styled.div`
  position: relative;
  width: 60px;
  height: 80px;
  background: #f8fafc;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
`;

const DocumentPreview = styled.div`
  width: 45px;
  height: 60px;
  background: white;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 6px;
    right: 6px;
    height: 2px;
    background: ${props => props.$accent || '#e5e7eb'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 6px;
    right: 6px;
    height: 1px;
    background: #e5e7eb;
  }
`;

const PencilIcon = styled.div`
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #d97706;
  border-radius: 2px;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -1px;
    width: 5px;
    height: 4px;
    background: #f59e0b;
    border-radius: 2px 2px 0 0;
  }
`;

const TemplateInfo = styled.div`
  flex: 1;
`;

const TemplateName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const TemplateDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const CheckIcon = styled.div`
  width: 24px;
  height: 24px;
  background: #1e293b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
`;

export default function DocumentTemplates() {
  const { businessInfo, updateBusinessInfo } = useBusinessBranding();
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    try {
      return localStorage.getItem(TEMPLATE_STORAGE_KEY)
        || businessInfo?.documentTemplateId
        || 'invoice-default';
    } catch {
      return 'invoice-default';
    }
  });

  useEffect(() => {
    if (businessInfo?.documentTemplateId) {
      setSelectedTemplate(businessInfo.documentTemplateId);
    }
  }, [businessInfo?.documentTemplateId]);

  const templates = [
    {
      id: 'invoice-default',
      category: 'Invoice Template',
      name: 'Default Template',
      description: 'Modern, clean layout',
      type: 'invoice',
      accent: '#10b981'
    },
    {
      id: 'invoice-classic',
      category: 'Invoice Template',
      name: 'Classic Template',
      description: 'Serif header, muted accent',
      type: 'invoice',
      accent: '#1e293b'
    },
    {
      id: 'quote-standard',
      category: 'Quote Template',
      name: 'Standard Template',
      description: 'Classic, professional layout',
      type: 'quote',
      accent: '#3b82f6'
    },
    {
      id: 'quote-modern',
      category: 'Quote Template',
      name: 'Modern Template',
      description: 'Bold teal header band',
      type: 'quote',
      accent: '#14b8a6'
    }
  ];

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {});

  const handleSelectTemplate = async (templateId) => {
    setSelectedTemplate(templateId);
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, templateId);
    } catch (e) {
      console.warn('Could not persist template to localStorage', e);
    }
    try {
      await updateBusinessInfo({ documentTemplateId: templateId });
      toast.success('Template preference saved');
    } catch (e) {
      toast.warn('Saved locally; cloud sync failed');
    }
  };

  return (
    <TemplatesContainer>
      <TopBar>
        <BackButton type="button" onClick={() => window.history.back()}>
          <FiArrowLeft />
        </BackButton>
        <Title>Document Templates</Title>
        <div></div>
      </TopBar>

      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <Section key={category}>
          <SectionTitle>{category}</SectionTitle>
          {categoryTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              selected={selectedTemplate === template.id}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <TemplateContent>
                <PreviewContainer>
                  <DocumentPreview $accent={template.accent} />
                  <PencilIcon />
                </PreviewContainer>
                <TemplateInfo>
                  <TemplateName>{template.name}</TemplateName>
                  <TemplateDescription>{template.description}</TemplateDescription>
                </TemplateInfo>
                {selectedTemplate === template.id && (
                  <CheckIcon>
                    <FiCheck />
                  </CheckIcon>
                )}
              </TemplateContent>
            </TemplateCard>
          ))}
        </Section>
      ))}
    </TemplatesContainer>
  );
}
