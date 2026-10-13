import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FirebaseBusinessProvider } from '../context/FirebaseBusinessContext';
import { UserProvider } from '../context/UserContext';
import { FinancialDataProvider } from '../context/FinancialDataContext';
import { CustomerProvider } from '../context/CustomerContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { BusinessBrandingProvider } from '../contexts/BusinessBrandingContext';
import { AppointmentProvider } from '../context/AppointmentContext';
import { ComplianceProvider } from '../context/ComplianceContext';

// Create a QueryClient instance with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Combined App Providers Component
 * Optimizes provider nesting to reduce re-renders
 * Uses React Query for data fetching and caching
 */
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseBusinessProvider>
        <UserProvider>
          <FinancialDataProvider>
            <CustomerProvider>
              <AppointmentProvider>
                <ComplianceProvider>
                  <CurrencyProvider>
                    <BusinessBrandingProvider>
                      {children}
                    </BusinessBrandingProvider>
                  </CurrencyProvider>
                </ComplianceProvider>
              </AppointmentProvider>
            </CustomerProvider>
          </FinancialDataProvider>
        </UserProvider>
      </FirebaseBusinessProvider>
    </QueryClientProvider>
  );
}
