import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiDollarSign, FiUsers, FiFileText, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { functionsService } from '../firebase/functions';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';

const AnalyticsContainer = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin: 1rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    background: #2563eb;
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  background: ${props => props.color || '#3b82f6'};
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
`;


const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin: 1rem 0;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin: 1rem 0;
`;

export default function BusinessAnalytics() {
  const { user } = useFirebaseBusiness();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadMetrics = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await functionsService.calculateBusinessMetrics(user.uid, 'monthly');
      
      if (result.success) {
        setMetrics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleBackup = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await functionsService.backupBusinessData(user.uid);
      
      if (result.success) {
        setSuccess(`Backup created successfully! ${result.data.totalDocuments} documents backed up.`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await functionsService.validateBusinessData(user.uid);
      
      if (result.success) {
        if (result.data.valid) {
          setSuccess('Data validation passed! No issues found.');
        } else {
          setError(`Data validation found ${result.data.totalIssues} issues. Check console for details.`);
          console.log('Data validation issues:', result.data.issues);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to validate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (!user) {
    return null;
  }

  return (
    <AnalyticsContainer>
      <Header>
        <Title>Business Analytics</Title>
        <RefreshButton onClick={() => loadMetrics()} disabled={loading}>
          {loading ? <LoadingSpinner /> : <FiRefreshCw />}
          Refresh
        </RefreshButton>
      </Header>


      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {metrics && (
        <MetricsGrid>
          <MetricCard>
            <MetricIcon color="#10b981">
              <FiDollarSign />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Total Income</MetricLabel>
              <MetricValue>R{metrics.totalIncome?.toFixed(2) || '0.00'}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#ef4444">
              <FiTrendingUp />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Total Expenses</MetricLabel>
              <MetricValue>R{metrics.totalExpenses?.toFixed(2) || '0.00'}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#3b82f6">
              <FiFileText />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Net Profit</MetricLabel>
              <MetricValue>R{metrics.netProfit?.toFixed(2) || '0.00'}</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <MetricIcon color="#8b5cf6">
              <FiUsers />
            </MetricIcon>
            <MetricContent>
              <MetricLabel>Transactions</MetricLabel>
              <MetricValue>{metrics.transactionCount || 0}</MetricValue>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <RefreshButton onClick={handleBackup} disabled={loading}>
          <FiDownload />
          Backup Data
        </RefreshButton>
        
        <RefreshButton onClick={handleValidateData} disabled={loading}>
          <FiRefreshCw />
          Validate Data
        </RefreshButton>
      </div>
    </AnalyticsContainer>
  );
}
