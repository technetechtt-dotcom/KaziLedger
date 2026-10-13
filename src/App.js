import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiMenu } from 'react-icons/fi';

// Components - Lazy loaded for performance
import Navigation from './components/Navigation';
import PWAInstaller from './components/PWAInstaller';

// Optimized combined providers
import { AppProviders } from './providers/AppProviders';
import { useFirebaseBusiness } from './context/FirebaseBusinessContext';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Statements = lazy(() => import('./pages/Statements'));
const Scanner = lazy(() => import('./pages/Scanner'));
const Reports = lazy(() => import('./pages/Reports'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Customers = lazy(() => import('./pages/Customers'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Settings = lazy(() => import('./pages/Settings'));
const Compliance = lazy(() => import('./pages/Compliance'));
const DocumentTemplates = lazy(() => import('./pages/DocumentTemplates'));
const FirebaseLogin = lazy(() => import('./pages/FirebaseLogin'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
  
  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
  
  @media (min-width: 768px) {
    margin-left: 280px;
    width: calc(100% - 280px);
  }
`;

const TopHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  z-index: 10;
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const HamburgerButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;


const MobileContent = styled.div`
  flex: 1;
  padding-bottom: 80px; /* Space for bottom navigation */
  
  @media (min-width: 768px) {
    padding-bottom: 0;
  }
`;

function AppContent() {
  const { isAuthenticated, isOnboardingComplete, loading } = useFirebaseBusiness();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Use Firebase loading state
    setIsLoading(loading);
  }, [loading]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };


  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Loading Business Operations App...</LoadingText>
      </LoadingContainer>
    );
  }

  if (!isAuthenticated) {
    return <FirebaseLogin />;
  }

  if (!isOnboardingComplete) {
    return <Onboarding />;
  }

  return (
    <AppContainer>
      <Navigation isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={() => setIsMobileMenuOpen(false)} />
      <MainContent>
        <TopHeader>
          <HamburgerButton onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
            <FiMenu aria-hidden="true" />
          </HamburgerButton>
        </TopHeader>
        <MobileContent>
          <Suspense fallback={
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading...</LoadingText>
            </LoadingContainer>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/statements" element={<Statements />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/templates" element={<DocumentTemplates />} />
            </Routes>
          </Suspense>
        </MobileContent>
      </MainContent>
      
      {/* PWA Installer */}
      <PWAInstaller />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppContainer>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8fafc;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
`;

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
