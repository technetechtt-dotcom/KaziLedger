import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FiUser, 
  FiGlobe, 
  FiDollarSign,
  FiImage,
  FiSave,
  FiEdit3,
  FiShield,
  FiUsers,
  FiSliders,
  FiFileText,
  FiUpload,
  FiArrowLeft,
  FiTrash2,
  FiMail,
  FiMoreVertical,
  FiPlus,
  FiEdit,
  FiUserPlus,
  FiEdit2
} from 'react-icons/fi';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useUser } from '../context/UserContext';
import { useCurrency } from '../contexts/CurrencyContext';
import BusinessBrandingSettings from '../components/BusinessBrandingSettings';

const SettingsContainer = styled.div`
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
  
  @media (min-width: 768px) {
    text-align: left;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  
  @media (min-width: 640px) {
    font-size: 2rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 2.25rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  
  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  @media (min-width: 1024px) {
    gap: 2.5rem;
  }
`;

const SettingsCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  @media (min-width: 640px) {
    padding: 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 2rem;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 640px) {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  
  @media (min-width: 640px) {
    margin-bottom: 1.5rem;
  }
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
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 640px) {
    padding: 0.875rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 640px) {
    padding: 0.875rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  @media (max-width: 640px) {
    padding: 0.875rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
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
    background: #3b82f6;
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

const ToggleLabel = styled.span`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
`;

const LogoUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const LogoPreview = styled.div`
  width: 80px;
  height: 80px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 2rem;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ColorOption = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const LanguageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const LanguageOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
  
  &.selected {
    border-color: #3b82f6;
    background: #f0f9ff;
  }
`;

const LanguageInput = styled.input`
  margin: 0;
`;

const LanguageInfo = styled.div`
  flex: 1;
`;

const LanguageName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const LanguageCode = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  }
`;

const TemplatePreview = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 2rem;
  background: white;
  margin-bottom: 1rem;
`;

const TemplateHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const TemplateLogo = styled.div`
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 8px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 1.5rem;
`;

const TemplateTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const TemplateSubtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
`;

const TemplateContent = styled.div`
  margin-bottom: 2rem;
`;

const TemplateRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    font-size: 1.125rem;
  }
`;

const TemplateLabel = styled.span`
  color: #64748b;
`;

const TemplateValue = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const SecurityUserRole = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const RoleIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`;

const RoleInfo = styled.div`
  flex: 1;
`;

const RoleName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
`;

const RoleDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

const RoleActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RoleButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const TemplateManagementButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    background: #e5e7eb;
    border-color: #d1d5db;
  }
`;

// User Roles & Permissions Styles
const UserRolesContainer = styled.div`
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

const PageTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  flex: 1;
  text-align: center;
`;

const MenuButton = styled.button`
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

const ContentArea = styled.div`
  padding: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
`;

const SectionSubtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1.5rem 0;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.gender === 'male' ? '#3b82f6' : '#ec4899'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin-right: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const UserRole = styled.div`
  font-size: 0.875rem;
  color: #14b8a6;
  font-weight: 500;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  color: #14b8a6;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f0fdfa;
  }
`;

const AddUserButton = styled.button`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 2rem);
  max-width: 368px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  
  &:hover {
    background: #0d9488;
  }
  
  &:active {
    transform: translateX(-50%) translateY(1px);
  }
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  background: #f8fafc;
  color: #374151;
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
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
  z-index: 9999;
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
  padding: 1rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  @media (min-width: 640px) {
    padding: 2rem;
    width: 90%;
  }
  
  @media (max-width: 640px) {
    max-height: 85vh;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (min-width: 640px) {
    margin-bottom: 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  
  @media (min-width: 640px) {
    font-size: 1.25rem;
  }
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

const EmployeeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  
  @media (max-width: 640px) {
    max-height: 250px;
  }
`;

const EmployeeItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 0.75rem;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }
  
  @media (min-width: 640px) {
    padding: 1rem;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const EmployeeInfo = styled.div`
  flex: 1;
  min-width: 0; /* Prevents overflow */
`;

const EmployeeName = styled.div`
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  
  @media (min-width: 640px) {
    font-size: 1rem;
  }
`;

const EmployeeDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #64748b;
  flex-wrap: wrap;

  span {
    &:not(:last-child) {
      &::after {
        content: '•';
        margin-left: 0.5rem;
        margin-right: 0.25rem;
      }
    }
  }
  
  @media (min-width: 640px) {
    font-size: 0.875rem;
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
    
    span::after {
      content: '';
      margin: 0;
    }
  }
`;

const EmployeeActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  
  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;

  h3 {
    margin: 1rem 0 0.5rem 0;
    color: #374151;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`;

const ResponsiveGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SaveButtonContainer = styled.div`
  margin-top: 2rem;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 640px) {
    text-align: center;
    margin-top: 1.5rem;
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const SaveStatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => {
    switch(props.status) {
      case 'saving': return '#f59e0b';
      case 'saved': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
  }};
  font-weight: 500;
`;

const SaveStatusIcon = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch(props.status) {
      case 'saving': return '#f59e0b';
      case 'saved': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
  }};
  animation: ${props => props.status === 'saving' ? 'pulse 1.5s ease-in-out infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const LastSavedText = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-left: 0.5rem;
`;

const RetryButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
  }
`;

const colors = [
  '#3b82f6', '#059669', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
];

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'af', name: 'Afrikaans', native: 'Afrikaans' },
  { code: 'zu', name: 'Zulu', native: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', native: 'isiXhosa' }
];

export default function Settings() {
  const { business, updateBusiness } = useFirebaseBusiness();
  const { defaultCurrency, setDefaultCurrency, currencyConfig } = useCurrency();
  const { users, addUser, updateUser, deleteUser, USER_ROLES } = useUser();
  const [formData, setFormData] = useState({
    name: business.name || '',
    email: business.email || '',
    phone: business.phone || '',
    address: business.address || '',
    vatEnabled: business.vatEnabled || true,
    defaultVatRate: business.defaultVatRate || 15,
    currency: business.currency || 'ZAR',
    language: business.language || 'en',
    logo: business.logo || null
  });
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [showPassword, setShowPassword] = useState(false);
  const [showUserRoles, setShowUserRoles] = useState(false);
  const [showBrandingSettings, setShowBrandingSettings] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: USER_ROLES.EMPLOYEE,
    department: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    emergencyContact: '',
    emergencyPhone: '',
    isActive: true
  });

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Auto-save function with debouncing
  const autoSave = useCallback(async (data) => {
    if (saveStatus === 'saving') return; // Prevent multiple simultaneous saves
    
    setSaveStatus('saving');
    try {
      // Save business data
      await updateBusiness(data);
      
      // Save currency setting if it has changed
      if (defaultCurrency !== currencyConfig[defaultCurrency]?.code) {
        // Currency is handled by the CurrencyContext, so we don't need to save it separately
        // The CurrencyContext will persist the change
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  }, [updateBusiness, saveStatus, defaultCurrency, currencyConfig]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      autoSave(formData);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [formData, hasUnsavedChanges, autoSave]);

  const handleSave = () => {
    autoSave(formData);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('logo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBack = () => {
    setShowUserRoles(false);
  };

  const handleAddUser = () => {
    console.log('handleAddUser called - opening add user modal');
    setUserFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: USER_ROLES.EMPLOYEE,
      department: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      emergencyContact: '',
      emergencyPhone: '',
      isActive: true
    });
    setEditingUser(null);
    setShowAddUserModal(true);
  };

  const handleEditUser = (user) => {
    setUserFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || USER_ROLES.EMPLOYEE,
      department: user.department || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      postalCode: user.postalCode || '',
      country: user.country || '',
      emergencyContact: user.emergencyContact || '',
      emergencyPhone: user.emergencyPhone || '',
      isActive: user.isActive !== false
    });
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          alert('User deleted successfully!');
        } else {
          alert('Failed to delete user: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    console.log('handleUserFormSubmit called with data:', userFormData);
    
    if (!userFormData.firstName || !userFormData.lastName || !userFormData.email) {
      alert('Please fill in all required fields (First Name, Last Name, and Email)');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if email already exists
    if (!editingUser && users.some(user => user.email === userFormData.email)) {
      alert('A user with this email address already exists');
      return;
    }

    try {
      if (editingUser) {
        console.log('Updating existing user:', editingUser.id);
        const result = await updateUser(editingUser.id, userFormData);
        console.log('Update user result:', result);
        if (result.success) {
          alert('User updated successfully!');
          setShowEditUserModal(false);
          setEditingUser(null);
        } else {
          alert('Failed to update user: ' + result.error);
        }
      } else {
        console.log('Adding new user with data:', userFormData);
        console.log('addUser function available:', typeof addUser);
        const result = await addUser(userFormData);
        console.log('Add user result:', result);
        if (result.success) {
          alert('User added successfully!');
          setShowAddUserModal(false);
        } else {
          alert('Failed to add user: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleUserFormChange = (field, value) => {
    console.log('Form field changed:', field, '=', value);
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  if (showUserRoles) {
    return (
      <UserRolesContainer>
        <TopBar>
          <BackButton onClick={handleBack}>
            <FiArrowLeft />
          </BackButton>
          <PageTitle>User Roles & Permissions</PageTitle>
          <MenuButton>
            <FiMoreVertical />
          </MenuButton>
        </TopBar>

        <ContentArea>
          <SectionTitle>Manage Users</SectionTitle>
          <SectionSubtitle>Assign roles and customize access levels</SectionSubtitle>

          <UserList>
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard key={user.id}>
                  <UserAvatar gender={user.gender || 'neutral'}>
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>{user.firstName} {user.lastName}</UserName>
                    <UserRole>{user.role}</UserRole>
                    {user.email && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        <FiMail style={{ marginRight: '0.25rem' }} />
                        {user.email}
                      </div>
                    )}
                    {user.phone && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📞 {user.phone}
                      </div>
                    )}
                    {user.department && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        🏢 {user.department}
                      </div>
                    )}
                    {user.city && user.country && (
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        📍 {user.city}, {user.country}
                      </div>
                    )}
                  </UserInfo>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <EditButton onClick={() => handleEditUser(user)} title="Edit user">
                      <FiEdit />
                    </EditButton>
                    <EditButton 
                      onClick={() => handleDeleteUser(user.id)} 
                      title="Delete user"
                      style={{ color: '#dc2626' }}
                    >
                      <FiTrash2 />
                    </EditButton>
                  </div>
                </UserCard>
              ))
            ) : (
              <UserCard>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', width: '100%' }}>
                  <FiUsers style={{ fontSize: '3rem', marginBottom: '1rem', color: '#94a3b8' }} />
                  <h3>No employees added yet</h3>
                  <p>Add your first employee to get started</p>
                </div>
              </UserCard>
            )}
          </UserList>
        </ContentArea>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AddUserButton onClick={handleAddUser}>
            <FiPlus />
            Add New User
          </AddUserButton>
        </div>

        {/* Add User Modal */}
        {showAddUserModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && setShowAddUserModal(false)}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Add New Employee</ModalTitle>
                <CloseButton onClick={() => setShowAddUserModal(false)}>×</CloseButton>
              </ModalHeader>

              <form onSubmit={handleUserFormSubmit}>
                <FormGroup>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    value={userFormData.firstName}
                    onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    value={userFormData.lastName}
                    onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => handleUserFormChange('email', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => handleUserFormChange('phone', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Role *</Label>
                  <Select
                    value={userFormData.role}
                    onChange={(e) => handleUserFormChange('role', e.target.value)}
                    required
                  >
                    <option value={USER_ROLES.EMPLOYEE}>Employee</option>
                    <option value={USER_ROLES.MANAGER}>Manager</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                    <option value={USER_ROLES.OWNER}>Owner</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Department</Label>
                  <Input
                    type="text"
                    value={userFormData.department}
                    onChange={(e) => handleUserFormChange('department', e.target.value)}
                    placeholder="e.g., Sales, Marketing, Operations"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Address</Label>
                  <Input
                    type="text"
                    value={userFormData.address}
                    onChange={(e) => handleUserFormChange('address', e.target.value)}
                    placeholder="Street address"
                  />
                </FormGroup>

                <ResponsiveGrid>
                  <FormGroup>
                    <Label>City</Label>
                    <Input
                      type="text"
                      value={userFormData.city}
                      onChange={(e) => handleUserFormChange('city', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>State/Province</Label>
                    <Input
                      type="text"
                      value={userFormData.state}
                      onChange={(e) => handleUserFormChange('state', e.target.value)}
                    />
                  </FormGroup>
                </ResponsiveGrid>

                <ResponsiveGrid>
                  <FormGroup>
                    <Label>Postal Code</Label>
                    <Input
                      type="text"
                      value={userFormData.postalCode}
                      onChange={(e) => handleUserFormChange('postalCode', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Country</Label>
                    <Input
                      type="text"
                      value={userFormData.country}
                      onChange={(e) => handleUserFormChange('country', e.target.value)}
                    />
                  </FormGroup>
                </ResponsiveGrid>

                <FormGroup>
                  <Label>Emergency Contact Name</Label>
                  <Input
                    type="text"
                    value={userFormData.emergencyContact}
                    onChange={(e) => handleUserFormChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact person"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    type="tel"
                    value={userFormData.emergencyPhone}
                    onChange={(e) => handleUserFormChange('emergencyPhone', e.target.value)}
                    placeholder="Emergency contact phone number"
                  />
                </FormGroup>

                <FormGroup>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ToggleInput
                      type="checkbox"
                      checked={userFormData.isActive}
                      onChange={(e) => handleUserFormChange('isActive', e.target.checked)}
                    />
                    <ToggleLabel>Active User</ToggleLabel>
                  </div>
                </FormGroup>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <ActionButton type="button" onClick={() => setShowAddUserModal(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit" style={{ background: '#14b8a6', color: 'white' }}>
                    Add Employee
                  </ActionButton>
                </div>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && setShowEditUserModal(false)}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Edit Employee</ModalTitle>
                <CloseButton onClick={() => setShowEditUserModal(false)}>×</CloseButton>
              </ModalHeader>

              <form onSubmit={handleUserFormSubmit}>
                <FormGroup>
                  <Label>First Name *</Label>
                  <Input
                    type="text"
                    value={userFormData.firstName}
                    onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Last Name *</Label>
                  <Input
                    type="text"
                    value={userFormData.lastName}
                    onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => handleUserFormChange('email', e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => handleUserFormChange('phone', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Role *</Label>
                  <Select
                    value={userFormData.role}
                    onChange={(e) => handleUserFormChange('role', e.target.value)}
                    required
                  >
                    <option value={USER_ROLES.EMPLOYEE}>Employee</option>
                    <option value={USER_ROLES.MANAGER}>Manager</option>
                    <option value={USER_ROLES.ADMIN}>Administrator</option>
                    <option value={USER_ROLES.OWNER}>Owner</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Department</Label>
                  <Input
                    type="text"
                    value={userFormData.department}
                    onChange={(e) => handleUserFormChange('department', e.target.value)}
                    placeholder="e.g., Sales, Marketing, Operations"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Address</Label>
                  <Input
                    type="text"
                    value={userFormData.address}
                    onChange={(e) => handleUserFormChange('address', e.target.value)}
                    placeholder="Street address"
                  />
                </FormGroup>

                <ResponsiveGrid>
                  <FormGroup>
                    <Label>City</Label>
                    <Input
                      type="text"
                      value={userFormData.city}
                      onChange={(e) => handleUserFormChange('city', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>State/Province</Label>
                    <Input
                      type="text"
                      value={userFormData.state}
                      onChange={(e) => handleUserFormChange('state', e.target.value)}
                    />
                  </FormGroup>
                </ResponsiveGrid>

                <ResponsiveGrid>
                  <FormGroup>
                    <Label>Postal Code</Label>
                    <Input
                      type="text"
                      value={userFormData.postalCode}
                      onChange={(e) => handleUserFormChange('postalCode', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Country</Label>
                    <Input
                      type="text"
                      value={userFormData.country}
                      onChange={(e) => handleUserFormChange('country', e.target.value)}
                    />
                  </FormGroup>
                </ResponsiveGrid>

                <FormGroup>
                  <Label>Emergency Contact Name</Label>
                  <Input
                    type="text"
                    value={userFormData.emergencyContact}
                    onChange={(e) => handleUserFormChange('emergencyContact', e.target.value)}
                    placeholder="Emergency contact person"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    type="tel"
                    value={userFormData.emergencyPhone}
                    onChange={(e) => handleUserFormChange('emergencyPhone', e.target.value)}
                    placeholder="Emergency contact phone number"
                  />
                </FormGroup>

                <FormGroup>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ToggleInput
                      type="checkbox"
                      checked={userFormData.isActive}
                      onChange={(e) => handleUserFormChange('isActive', e.target.checked)}
                    />
                    <ToggleLabel>Active User</ToggleLabel>
                  </div>
                </FormGroup>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <ActionButton type="button" onClick={() => setShowEditUserModal(false)}>
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit" style={{ background: '#14b8a6', color: 'white' }}>
                    Update Employee
                  </ActionButton>
                </div>
              </form>
            </ModalContent>
          </Modal>
        )}

      </UserRolesContainer>
    );
  }

  return (
    <SettingsContainer>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Manage your business profile and preferences</Subtitle>
      </Header>

      <SettingsGrid>
        <SettingsCard>
          <CardTitle>
            <FiImage />
            Business Branding & Documents
          </CardTitle>
          
          <CardDescription>
            Configure your logo, business details, and bank information for invoices and quotes.
          </CardDescription>
          
          <ActionButton onClick={() => setShowBrandingSettings(true)}>
            <FiEdit3 />
            Configure Branding
          </ActionButton>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiUser />
            Business Profile
          </CardTitle>
          
          <FormGroup>
            <Label>Business Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter business name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="business@example.com"
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

          <FormGroup>
            <Label>Business Logo</Label>
            <LogoUpload>
              <LogoPreview>
                {formData.logo ? (
                  <LogoImage src={formData.logo} alt="Business logo" />
                ) : (
                  <FiImage />
                )}
              </LogoPreview>
              <div>
                <UploadButton onClick={() => document.getElementById('logo-upload').click()}>
                  <FiUpload />
                  Upload Logo
                </UploadButton>
                <HiddenFileInput
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </div>
            </LogoUpload>
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiDollarSign />
            Financial Settings
          </CardTitle>
          
          <FormGroup>
            <Label>Default Currency</Label>
            <Select
              value={defaultCurrency}
              onChange={(e) => {
                setDefaultCurrency(e.target.value);
                setHasUnsavedChanges(true);
              }}
            >
              {Object.entries(currencyConfig).map(([code, config]) => (
                <option key={code} value={code}>
                  {config.symbol} - {config.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={formData.vatEnabled}
                onChange={(e) => handleInputChange('vatEnabled', e.target.checked)}
              />
              <ToggleLabel>Enable VAT</ToggleLabel>
            </ToggleSwitch>
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
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiGlobe />
            Language & Region
          </CardTitle>
          
          <FormGroup>
            <Label>Language</Label>
            <LanguageGrid>
              {languages.map(lang => (
                <LanguageOption
                  key={lang.code}
                  className={formData.language === lang.code ? 'selected' : ''}
                >
                  <LanguageInput
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={formData.language === lang.code}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                  />
                  <LanguageInfo>
                    <LanguageName>{lang.native}</LanguageName>
                    <LanguageCode>{lang.name}</LanguageCode>
                  </LanguageInfo>
                </LanguageOption>
              ))}
            </LanguageGrid>
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiSliders />
            Document Templates
          </CardTitle>
          
          <FormGroup>
            <Label>Template Management</Label>
            <TemplateManagementButton onClick={() => window.location.href = '/templates'}>
              <FiFileText />
              Manage Document Templates
            </TemplateManagementButton>
          </FormGroup>
          
          <FormGroup>
            <Label>Template Color</Label>
            <ColorPicker>
              {colors.map(color => (
                <ColorOption
                  key={color}
                  color={color}
                  selected={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </ColorPicker>
          </FormGroup>

          <FormGroup>
            <Label>Template Preview</Label>
            <TemplatePreview>
              <TemplateHeader>
                <TemplateLogo>
                  {formData.logo ? (
                    <LogoImage src={formData.logo} alt="Logo" />
                  ) : (
                    <FiFileText />
                  )}
                </TemplateLogo>
                <TemplateTitle>{formData.name || 'Your Business'}</TemplateTitle>
                <TemplateSubtitle>Professional Services</TemplateSubtitle>
              </TemplateHeader>
              
              <TemplateContent>
                <TemplateRow>
                  <TemplateLabel>Item Description</TemplateLabel>
                  <TemplateValue>R1,000.00</TemplateValue>
                </TemplateRow>
                <TemplateRow>
                  <TemplateLabel>Subtotal</TemplateLabel>
                  <TemplateValue>R1,000.00</TemplateValue>
                </TemplateRow>
                <TemplateRow>
                  <TemplateLabel>VAT ({formData.defaultVatRate}%)</TemplateLabel>
                  <TemplateValue>R{formData.defaultVatRate * 10}</TemplateValue>
                </TemplateRow>
                <TemplateRow>
                  <TemplateLabel>Total</TemplateLabel>
                  <TemplateValue>R{1000 + (formData.defaultVatRate * 10)}</TemplateValue>
                </TemplateRow>
              </TemplateContent>
            </TemplatePreview>
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiShield />
            Security & Access
          </CardTitle>
          
          <SecurityUserRole>
            <RoleIcon>
              <FiUser />
            </RoleIcon>
            <RoleInfo>
              <RoleName>Admin User</RoleName>
              <RoleDescription>Full access to all features</RoleDescription>
            </RoleInfo>
            <RoleActions>
              <RoleButton>
                <FiEdit3 />
                Edit
              </RoleButton>
            </RoleActions>
          </SecurityUserRole>

          <FormGroup>
            <Label>Change Password</Label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </FormGroup>

          <FormGroup>
            <ToggleSwitch>
              <ToggleInput
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <ToggleLabel>Show password</ToggleLabel>
            </ToggleSwitch>
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>
            <FiUsers />
            User Management
          </CardTitle>
          
          <FormGroup>
            <Label>User Roles & Permissions</Label>
            <TemplateManagementButton onClick={() => setShowUserRoles(true)}>
              <FiUsers />
              Manage User Roles & Permissions
            </TemplateManagementButton>
          </FormGroup>

          <FormGroup>
            <Label>Current Employees ({users.length})</Label>
            {users.length > 0 ? (
              <EmployeeList>
                {users.map((user) => (
                  <EmployeeItem key={user.id}>
                    <EmployeeInfo>
                      <EmployeeName>{user.firstName} {user.lastName}</EmployeeName>
                      <EmployeeDetails>
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{user.role}</span>
                        {user.department && (
                          <>
                            <span>•</span>
                            <span>{user.department}</span>
                          </>
                        )}
                      </EmployeeDetails>
                    </EmployeeInfo>
                    <EmployeeActions>
                      <ActionButton 
                        type="button" 
                        onClick={() => handleEditUser(user)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        <FiEdit2 />
                      </ActionButton>
                      <ActionButton 
                        type="button" 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ backgroundColor: '#dc3545' }}
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </EmployeeActions>
                  </EmployeeItem>
                ))}
              </EmployeeList>
            ) : (
              <EmptyState>
                <FiUsers size={48} />
                <h3>No employees added yet</h3>
                <p>Add your first employee to get started</p>
              </EmptyState>
            )}
          </FormGroup>

          <FormGroup>
            <RoleButton onClick={() => {
              console.log('Add New Employee button clicked');
              setShowAddUserModal(true);
            }}>
              <FiUserPlus />
              Add New Employee
            </RoleButton>
          </FormGroup>
        </SettingsCard>
      </SettingsGrid>

      <SaveButtonContainer>
        <SaveStatusIndicator status={saveStatus}>
          <SaveStatusIcon status={saveStatus} />
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && (
            <>
              Save failed
              <RetryButton onClick={() => autoSave(formData)}>
                Retry
              </RetryButton>
            </>
          )}
          {saveStatus === 'idle' && hasUnsavedChanges && 'Unsaved changes'}
          {lastSaved && saveStatus === 'saved' && (
            <LastSavedText>
              {lastSaved.toLocaleTimeString()}
            </LastSavedText>
          )}
        </SaveStatusIndicator>
        <SaveButton onClick={handleSave}>
          <FiSave />
          Save Settings
        </SaveButton>
      </SaveButtonContainer>

      {showBrandingSettings && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowBrandingSettings(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Business Branding Settings</ModalTitle>
              <CloseButton onClick={() => setShowBrandingSettings(false)}>×</CloseButton>
            </ModalHeader>
            <BusinessBrandingSettings />
          </ModalContent>
        </Modal>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowAddUserModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Add New Employee</ModalTitle>
              <CloseButton onClick={() => setShowAddUserModal(false)}>×</CloseButton>
            </ModalHeader>

            <form onSubmit={handleUserFormSubmit}>
              <FormGroup>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={userFormData.firstName}
                  onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  value={userFormData.lastName}
                  onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => handleUserFormChange('phone', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Role *</Label>
                <Select
                  value={userFormData.role}
                  onChange={(e) => handleUserFormChange('role', e.target.value)}
                  required
                >
                  <option value={USER_ROLES.EMPLOYEE}>Employee</option>
                  <option value={USER_ROLES.MANAGER}>Manager</option>
                  <option value={USER_ROLES.ADMIN}>Administrator</option>
                  <option value={USER_ROLES.OWNER}>Owner</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Department</Label>
                <Input
                  type="text"
                  value={userFormData.department}
                  onChange={(e) => handleUserFormChange('department', e.target.value)}
                  placeholder="e.g., Sales, Marketing, Operations"
                />
              </FormGroup>

              <FormGroup>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={userFormData.address}
                  onChange={(e) => handleUserFormChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </FormGroup>

              <ResponsiveGrid>
                <FormGroup>
                  <Label>City</Label>
                  <Input
                    type="text"
                    value={userFormData.city}
                    onChange={(e) => handleUserFormChange('city', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>State/Province</Label>
                  <Input
                    type="text"
                    value={userFormData.state}
                    onChange={(e) => handleUserFormChange('state', e.target.value)}
                  />
                </FormGroup>
              </ResponsiveGrid>

              <ResponsiveGrid>
                <FormGroup>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    value={userFormData.postalCode}
                    onChange={(e) => handleUserFormChange('postalCode', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    value={userFormData.country}
                    onChange={(e) => handleUserFormChange('country', e.target.value)}
                  />
                </FormGroup>
              </ResponsiveGrid>

              <FormGroup>
                <Label>Emergency Contact Name</Label>
                <Input
                  type="text"
                  value={userFormData.emergencyContact}
                  onChange={(e) => handleUserFormChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact person"
                />
              </FormGroup>

              <FormGroup>
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  value={userFormData.emergencyPhone}
                  onChange={(e) => handleUserFormChange('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone number"
                />
              </FormGroup>

              <FormGroup>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ToggleInput
                    type="checkbox"
                    checked={userFormData.isActive}
                    onChange={(e) => handleUserFormChange('isActive', e.target.checked)}
                  />
                  <ToggleLabel>Active User</ToggleLabel>
                </div>
              </FormGroup>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <ActionButton type="button" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton type="submit" style={{ background: '#14b8a6', color: 'white' }}>
                  Add Employee
                </ActionButton>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowEditUserModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Edit Employee</ModalTitle>
              <CloseButton onClick={() => setShowEditUserModal(false)}>×</CloseButton>
            </ModalHeader>

            <form onSubmit={handleUserFormSubmit}>
              <FormGroup>
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={userFormData.firstName}
                  onChange={(e) => handleUserFormChange('firstName', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  value={userFormData.lastName}
                  onChange={(e) => handleUserFormChange('lastName', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => handleUserFormChange('phone', e.target.value)}
                />
              </FormGroup>

              <FormGroup>
                <Label>Role *</Label>
                <Select
                  value={userFormData.role}
                  onChange={(e) => handleUserFormChange('role', e.target.value)}
                  required
                >
                  <option value={USER_ROLES.EMPLOYEE}>Employee</option>
                  <option value={USER_ROLES.MANAGER}>Manager</option>
                  <option value={USER_ROLES.ADMIN}>Administrator</option>
                  <option value={USER_ROLES.OWNER}>Owner</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Department</Label>
                <Input
                  type="text"
                  value={userFormData.department}
                  onChange={(e) => handleUserFormChange('department', e.target.value)}
                  placeholder="e.g., Sales, Marketing, Operations"
                />
              </FormGroup>

              <FormGroup>
                <Label>Address</Label>
                <Input
                  type="text"
                  value={userFormData.address}
                  onChange={(e) => handleUserFormChange('address', e.target.value)}
                  placeholder="Street address"
                />
              </FormGroup>

              <ResponsiveGrid>
                <FormGroup>
                  <Label>City</Label>
                  <Input
                    type="text"
                    value={userFormData.city}
                    onChange={(e) => handleUserFormChange('city', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>State/Province</Label>
                  <Input
                    type="text"
                    value={userFormData.state}
                    onChange={(e) => handleUserFormChange('state', e.target.value)}
                  />
                </FormGroup>
              </ResponsiveGrid>

              <ResponsiveGrid>
                <FormGroup>
                  <Label>Postal Code</Label>
                  <Input
                    type="text"
                    value={userFormData.postalCode}
                    onChange={(e) => handleUserFormChange('postalCode', e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Country</Label>
                  <Input
                    type="text"
                    value={userFormData.country}
                    onChange={(e) => handleUserFormChange('country', e.target.value)}
                  />
                </FormGroup>
              </ResponsiveGrid>

              <FormGroup>
                <Label>Emergency Contact Name</Label>
                <Input
                  type="text"
                  value={userFormData.emergencyContact}
                  onChange={(e) => handleUserFormChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact person"
                />
              </FormGroup>

              <FormGroup>
                <Label>Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  value={userFormData.emergencyPhone}
                  onChange={(e) => handleUserFormChange('emergencyPhone', e.target.value)}
                  placeholder="Emergency contact phone number"
                />
              </FormGroup>

              <FormGroup>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ToggleInput
                    type="checkbox"
                    checked={userFormData.isActive}
                    onChange={(e) => handleUserFormChange('isActive', e.target.checked)}
                  />
                  <ToggleLabel>Active User</ToggleLabel>
                </div>
              </FormGroup>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <ActionButton type="button" onClick={() => setShowEditUserModal(false)}>
                  Cancel
                </ActionButton>
                <ActionButton type="submit" style={{ background: '#14b8a6', color: 'white' }}>
                  Update Employee
                </ActionButton>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}
    </SettingsContainer>
  );
}
