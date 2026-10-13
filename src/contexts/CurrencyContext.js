import React, { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  // Currency configuration
  const currencyConfig = {
    USD: { symbol: '$', name: 'US Dollar', position: 'before' },
    EUR: { symbol: '€', name: 'Euro', position: 'before' },
    GBP: { symbol: '£', name: 'British Pound', position: 'before' },
    ZAR: { symbol: 'R', name: 'South African Rand', position: 'before' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
    AUD: { symbol: 'A$', name: 'Australian Dollar', position: 'before' },
    JPY: { symbol: '¥', name: 'Japanese Yen', position: 'before' },
    INR: { symbol: '₹', name: 'Indian Rupee', position: 'before' }
  };

  const getCurrencySymbol = () => currencyConfig[defaultCurrency]?.symbol || '$';
  const getCurrencyName = () => currencyConfig[defaultCurrency]?.name || 'US Dollar';
  const getCurrencyPosition = () => currencyConfig[defaultCurrency]?.position || 'before';

  const formatCurrency = (amount, decimals = 2) => {
    const symbol = getCurrencySymbol();
    const position = getCurrencyPosition();
    const formattedAmount = parseFloat(amount).toFixed(decimals);
    
    return position === 'before' ? `${symbol}${formattedAmount}` : `${formattedAmount}${symbol}`;
  };

  const value = {
    defaultCurrency,
    setDefaultCurrency,
    currencyConfig,
    getCurrencySymbol,
    getCurrencyName,
    getCurrencyPosition,
    formatCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
