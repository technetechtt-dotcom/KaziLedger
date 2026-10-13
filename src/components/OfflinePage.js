import React from 'react';
import styled from 'styled-components';
import { FiWifiOff, FiRefreshCw, FiHome } from 'react-icons/fi';

const OfflineContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #f8fafc;
  text-align: center;
`;

const OfflineIcon = styled.div`
  width: 120px;
  height: 120px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  color: #dc2626;
  font-size: 3rem;
`;

const OfflineTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const OfflineDescription = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  margin: 0 0 2rem 0;
  max-width: 500px;
  line-height: 1.6;
`;

const OfflineActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  background: ${props => props.variant === 'primary' ? '#3b82f6' : '#f1f5f9'};
  color: ${props => props.variant === 'primary' ? 'white' : '#64748b'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#2563eb' : '#e2e8f0'};
  }
`;

const OfflineFeatures = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 600px;
`;

const FeaturesTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
`;

const FeatureItem = styled.li`
  padding: 0.5rem 0;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    color: #10b981;
    font-weight: bold;
  }
`;

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <OfflineContainer>
      <OfflineIcon>
        <FiWifiOff />
      </OfflineIcon>
      
      <OfflineTitle>You're Offline</OfflineTitle>
      
      <OfflineDescription>
        It looks like you've lost your internet connection. Don't worry - 
        this app works offline too! You can still view your data and perform 
        basic tasks until your connection is restored.
      </OfflineDescription>
      
      <OfflineActions>
        <ActionButton variant="primary" onClick={handleRefresh}>
          <FiRefreshCw />
          Try Again
        </ActionButton>
        <ActionButton onClick={handleGoHome}>
          <FiHome />
          Go Home
        </ActionButton>
      </OfflineActions>
      
      <OfflineFeatures>
        <FeaturesTitle>Available Offline Features:</FeaturesTitle>
        <FeaturesList>
          <FeatureItem>View existing quotes and invoices</FeatureItem>
          <FeatureItem>Browse customer information</FeatureItem>
          <FeatureItem>Access inventory data</FeatureItem>
          <FeatureItem>View reports and analytics</FeatureItem>
          <FeatureItem>Edit settings and preferences</FeatureItem>
        </FeaturesList>
      </OfflineFeatures>
    </OfflineContainer>
  );
}
