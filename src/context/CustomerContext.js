import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useFirebaseBusiness } from './FirebaseBusinessContext';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const CustomerContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CUSTOMERS: 'SET_CUSTOMERS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  SET_SELECTED_CUSTOMER: 'SET_SELECTED_CUSTOMER',
  CLEAR_SELECTED_CUSTOMER: 'CLEAR_SELECTED_CUSTOMER'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  customers: [],
  selectedCustomer: null
};

// Reducer
function customerReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_CUSTOMERS:
      return { ...state, customers: action.payload };
    
    case ACTIONS.ADD_CUSTOMER:
      return { ...state, customers: [...state.customers, action.payload] };
    
    case ACTIONS.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer => 
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    case ACTIONS.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    
    case ACTIONS.SET_SELECTED_CUSTOMER:
      return { ...state, selectedCustomer: action.payload };
    
    case ACTIONS.CLEAR_SELECTED_CUSTOMER:
      return { ...state, selectedCustomer: null };
    
    default:
      return state;
  }
}

export function CustomerProvider({ children }) {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { user } = useFirebaseBusiness();

  // Set up real-time listener for customers
  useEffect(() => {
    if (!user) return;

    const customersQuery = query(
      collection(db, 'users', user.uid, 'customers'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(customersQuery, (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_CUSTOMERS, payload: customersData });
    });

    return () => unsubscribe();
  }, [user]);

  // Add customer
  const addCustomer = useCallback(async (customerData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const docRef = await addDoc(collection(db, 'users', user.uid, 'customers'), {
        ...customerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Update customer
  const updateCustomer = useCallback(async (id, customerData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await updateDoc(doc(db, 'users', user.uid, 'customers', id), {
        ...customerData,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Delete customer
  const deleteCustomer = useCallback(async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', user.uid, 'customers', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  // Select customer
  const selectCustomer = useCallback((customer) => {
    dispatch({ type: ACTIONS.SET_SELECTED_CUSTOMER, payload: customer });
  }, []);

  // Clear selected customer
  const clearSelectedCustomer = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTED_CUSTOMER });
  }, []);

  // Search customers
  const searchCustomers = useCallback((searchTerm) => {
    if (!searchTerm) return state.customers;
    
    return state.customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.customers]);

  // Get customer by ID
  const getCustomerById = useCallback((id) => {
    return state.customers.find(customer => customer.id === id);
  }, [state.customers]);

  // Import customers from CSV/JSON
  const importCustomers = useCallback(async (customersData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      const results = [];
      for (const customerData of customersData) {
        const result = await addCustomer(customerData);
        results.push(result);
      }
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, results };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user, addCustomer]);

  // Export customers
  const exportCustomers = useCallback(() => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Address', 'City', 'State', 'Zip', 'Country', 'Notes'],
      ...state.customers.map(customer => [
        customer.name || '',
        customer.email || '',
        customer.phone || '',
        customer.company || '',
        customer.address || '',
        customer.city || '',
        customer.state || '',
        customer.zip || '',
        customer.country || '',
        customer.notes || ''
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [state.customers]);

  const value = {
    ...state,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    clearSelectedCustomer,
    searchCustomers,
    getCustomerById,
    importCustomers,
    exportCustomers
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
