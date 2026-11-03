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
  const [defaultCurrency, setDefaultCurrency] = useState('ZAR');

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

  const getCurrencySymbol = (code = defaultCurrency) =>
    currencyConfig[code]?.symbol || currencyConfig[defaultCurrency]?.symbol || 'R';
  const getCurrencyName = (code = defaultCurrency) =>
    currencyConfig[code]?.name || currencyConfig[defaultCurrency]?.name || 'South African Rand';
  const getCurrencyPosition = (code = defaultCurrency) =>
    currencyConfig[code]?.position || 'before';

  const formatCurrency = (amount, decimalsOrCode = 2, maybeDecimals) => {
    let code = defaultCurrency;
    let decimals = 2;
    if (typeof decimalsOrCode === 'string') {
      code = decimalsOrCode;
      decimals = typeof maybeDecimals === 'number' ? maybeDecimals : 2;
    } else if (typeof decimalsOrCode === 'number') {
      decimals = decimalsOrCode;
    }

    const symbol = getCurrencySymbol(code);
    const position = getCurrencyPosition(code);
    const formattedAmount = (parseFloat(amount) || 0).toFixed(decimals);

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
