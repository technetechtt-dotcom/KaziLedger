import React, { createContext, useContext, useReducer, useEffect } from 'react';

const BusinessContext = createContext();

const initialState = {
  isAuthenticated: false,
  isOnboardingComplete: false,
  business: {
    name: '',
    logo: null,
    vatEnabled: true,
    defaultVatRate: 15,
    currency: 'ZAR',
    language: 'en',
    address: '',
    phone: '',
    email: ''
  },
  quotes: [],
  invoices: [],
  expenses: [],
  products: [],
  customers: [],
  reports: {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  }
};

function businessReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true
      };
    
    case 'LOGOUT':
      return {
        ...initialState
      };
    
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isOnboardingComplete: true,
        business: {
          ...state.business,
          ...action.payload
        }
      };
    
    case 'UPDATE_BUSINESS':
      return {
        ...state,
        business: {
          ...state.business,
          ...action.payload
        }
      };
    
    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload]
      };
    
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote => 
          quote.id === action.payload.id ? action.payload : quote
        )
      };
    
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter(quote => quote.id !== action.payload)
      };
    
    case 'ADD_INVOICE':
      return {
        ...state,
        invoices: [...state.invoices, action.payload]
      };
    
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(invoice => 
          invoice.id === action.payload.id ? action.payload : invoice
        )
      };
    
    case 'DELETE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.filter(invoice => invoice.id !== action.payload)
      };
    
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload]
      };
    
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product => 
          product.id === action.payload.id ? action.payload : product
        )
      };
    
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload]
      };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
}

export function BusinessProvider({ children }) {
  const [state, dispatch] = useReducer(businessReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('businessAppData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      dispatch({ type: 'LOAD_DATA', payload: parsedData });
    } else {
      // Set as authenticated for demo purposes
      dispatch({ type: 'LOGIN' });
      dispatch({ type: 'COMPLETE_ONBOARDING' });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('businessAppData', JSON.stringify(state));
  }, [state]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
