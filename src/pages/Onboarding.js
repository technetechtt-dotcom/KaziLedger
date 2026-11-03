import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiArrowRight, 
  FiArrowLeft, 
  FiCheck,
  FiGlobe,
  FiDollarSign,
  // FiPercent,
  FiImage,
  FiUser
} from 'react-icons/fi';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import FileUpload from '../components/FileUpload';
import { uploadBusinessLogo } from '../firebase/storage';

const OnboardingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

const OnboardingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.active ? '#3b82f6' : '#e5e7eb'};
  transition: background 0.3s ease;
`;

const StepContent = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const StepIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
`;

const StepTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StepDescription = styled.p`
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;


const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  }
  
  &.secondary {
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
    
    &:hover {
      border-color: #3b82f6;
      color: #3b82f6;
    }
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 2rem;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #059669, #047857);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
`;

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const SuccessDescription = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2rem;
`;

const currencies = [
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' }
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'Zulu' },
  { code: 'xh', name: 'Xhosa' }
];

const steps = [
  {
    id: 'business',
    title: 'Business Information',
    description: 'Tell us about your business to get started',
    icon: <FiUser />
  },
  {
    id: 'financial',
    title: 'Financial Settings',
    description: 'Configure your currency and VAT preferences',
    icon: <FiDollarSign />
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Set your language and other preferences',
    icon: <FiGlobe />
  },
  {
    id: 'logo',
    title: 'Business Logo',
    description: 'Upload your business logo for professional documents',
    icon: <FiImage />
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'Your business profile is ready to go',
    icon: <FiCheck />
  }
];

export default function Onboarding() {
  const { updateBusiness, dispatch } = useFirebaseBusiness();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: '',
    currency: 'ZAR',
    vatEnabled: true,
    defaultVatRate: 15,
    language: 'en',
    logo: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      // Save business data to Firebase
      await updateBusiness(formData);
      
      // Mark onboarding as complete
      dispatch({ 
        type: 'COMPLETE_ONBOARDING', 
        payload: formData 
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving business data:', error);
      setIsLoading(false);
    }
  };

  const handleLogoSelect = async (file) => {
    setLogoFile(file);
    setLogoUploading(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      handleInputChange('logo', previewUrl);
      
      // Upload to Firebase Storage
      const result = await uploadBusinessLogo('temp-user-id', file);
      if (result.success) {
        handleInputChange('logo', result.url);
      } else {
        console.error('Logo upload failed:', result.error);
        alert('Failed to upload logo. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    handleInputChange('logo', null);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'business':
        return (
          <Form>
            <FormGroup>
              <Label>Business Name *</Label>
              <Input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="business@example.com"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+27 82 123 4567"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Business Address</Label>
              <TextArea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your business address"
              />
            </FormGroup>
          </Form>
        );

      case 'financial':
        return (
          <Form>
            <FormGroup>
              <Label>Default Currency *</Label>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Enable VAT</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.vatEnabled}
                  onChange={(e) => handleInputChange('vatEnabled', e.target.checked)}
                />
                <span>Yes, I need to charge VAT</span>
              </div>
            </FormGroup>
            
            {formData.vatEnabled && (
              <FormGroup>
                <Label>Default VAT Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultVatRate}
                  onChange={(e) => handleInputChange('defaultVatRate', parseFloat(e.target.value))}
                  placeholder="15"
                />
              </FormGroup>
            )}
          </Form>
        );

      case 'preferences':
        return (
          <Form>
            <FormGroup>
              <Label>Language *</Label>
              <Select
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </Form>
        );

      case 'logo':
        return (
          <Form>
            <FileUpload
              onFileSelect={handleLogoSelect}
              onFileRemove={handleLogoRemove}
              files={logoFile ? [logoFile] : []}
              loading={logoUploading}
              accept="image/*"
              maxFiles={1}
              type="image"
            />
          </Form>
        );

      case 'complete':
        return (
          <SuccessMessage>
            <SuccessIcon>
              <FiCheck />
            </SuccessIcon>
            <SuccessTitle>Welcome to BusinessApp!</SuccessTitle>
            <SuccessDescription>
              Your business profile has been set up successfully. 
              You can now start managing your invoices, quotes, and more.
            </SuccessDescription>
          </SuccessMessage>
        );

      default:
        return null;
    }
  };

  return (
    <OnboardingContainer>
      <OnboardingCard>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>

        <StepIndicator>
          {steps.map((_, index) => (
            <StepDot key={index} active={index <= currentStep} />
          ))}
        </StepIndicator>

        <StepContent>
          <StepIcon>
            {steps[currentStep].icon}
          </StepIcon>
          <StepTitle>{steps[currentStep].title}</StepTitle>
          <StepDescription>{steps[currentStep].description}</StepDescription>
        </StepContent>

        {renderStepContent()}

        {currentStep < totalSteps - 1 && (
          <ButtonGroup>
            {currentStep > 0 && (
              <Button
                type="button"
                className="secondary"
                onClick={handlePrevious}
              >
                <FiArrowLeft />
                Previous
              </Button>
            )}
            <Button
              type="button"
              className="primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Next'}
              <FiArrowRight />
            </Button>
          </ButtonGroup>
        )}

        {currentStep === totalSteps - 1 && (
          <ButtonGroup>
            <Button
              type="button"
              className="primary"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? 'Completing setup...' : 'Get Started'}
              <FiCheck />
            </Button>
          </ButtonGroup>
        )}
      </OnboardingCard>
    </OnboardingContainer>
  );
}
