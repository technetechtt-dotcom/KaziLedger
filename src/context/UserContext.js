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

const UserContext = createContext();

// User roles and their permissions
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager', 
  EMPLOYEE: 'employee'
};

export const PERMISSIONS = {
  // Financial permissions
  VIEW_FINANCIAL_DATA: 'view_financial_data',
  EDIT_FINANCIAL_DATA: 'edit_financial_data',
  DELETE_FINANCIAL_DATA: 'delete_financial_data',
  
  // Customer permissions
  VIEW_CUSTOMERS: 'view_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  DELETE_CUSTOMERS: 'delete_customers',
  
  // Invoice permissions
  VIEW_INVOICES: 'view_invoices',
  CREATE_INVOICES: 'create_invoices',
  EDIT_INVOICES: 'edit_invoices',
  DELETE_INVOICES: 'delete_invoices',
  SEND_INVOICES: 'send_invoices',
  
  // Quote permissions
  VIEW_QUOTES: 'view_quotes',
  CREATE_QUOTES: 'create_quotes',
  EDIT_QUOTES: 'edit_quotes',
  DELETE_QUOTES: 'delete_quotes',
  SEND_QUOTES: 'send_quotes',
  
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  
  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  
  // Settings permissions
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  EDIT_BUSINESS_SETTINGS: 'edit_business_settings',
  
  // Reports permissions
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  
  // Owner-specific permissions
  MANAGE_BUSINESS: 'manage_business',
  VIEW_ALL_DATA: 'view_all_data',
  DELETE_BUSINESS_DATA: 'delete_business_data',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  ACCESS_ANALYTICS: 'access_analytics'
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.OWNER]: Object.values(PERMISSIONS), // All permissions - business owner
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS), // All permissions - trusted admin
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.EDIT_FINANCIAL_DATA,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.EDIT_CUSTOMERS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.EDIT_INVOICES,
    PERMISSIONS.SEND_INVOICES,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.CREATE_QUOTES,
    PERMISSIONS.EDIT_QUOTES,
    PERMISSIONS.SEND_QUOTES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.EDIT_INVENTORY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],
  [USER_ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_FINANCIAL_DATA,
    PERMISSIONS.VIEW_CUSTOMERS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.CREATE_INVOICES,
    PERMISSIONS.VIEW_QUOTES,
    PERMISSIONS.CREATE_QUOTES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_REPORTS
  ]
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USERS: 'SET_USERS',
  ADD_USER: 'ADD_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  users: []
};

// Reducer
function userReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_USERS:
      return { ...state, users: action.payload };
    
    case ACTIONS.ADD_USER:
      return { ...state, users: [...state.users, action.payload] };
    
    case ACTIONS.UPDATE_USER:
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        )
      };
    
    case ACTIONS.DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const { user: currentUser } = useFirebaseBusiness();

  // Set up real-time listener for users
  useEffect(() => {
    if (!currentUser) return;

    const usersQuery = query(
      collection(db, 'users', currentUser.uid, 'employees'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      dispatch({ type: ACTIONS.SET_USERS, payload: usersData });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Add user
  const addUser = useCallback(async (userData) => {
    console.log('UserContext addUser called with:', userData);
    console.log('Current user:', currentUser?.uid);
    
    if (!currentUser) {
      console.log('No current user - authentication required');
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      console.log('Setting loading state...');
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      console.log('Adding user to Firestore collection:', `users/${currentUser.uid}/employees`);
      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'employees'), {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      
      console.log('User added successfully with ID:', docRef.id);
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Update user
  const updateUser = useCallback(async (id, userData) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await updateDoc(doc(db, 'users', currentUser.uid, 'employees', id), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Delete user
  const deleteUser = useCallback(async (id) => {
    if (!currentUser) return { success: false, error: 'User not authenticated' };
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      await deleteDoc(doc(db, 'users', currentUser.uid, 'employees', id));
      
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [currentUser]);

  // Check if user has permission
  const hasPermission = useCallback((userRole, permission) => {
    if (!userRole) return false;
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }, []);

  // Get user permissions
  const getUserPermissions = useCallback((userRole) => {
    return ROLE_PERMISSIONS[userRole] || [];
  }, []);

  const value = {
    ...state,
    addUser,
    updateUser,
    deleteUser,
    hasPermission,
    getUserPermissions,
    USER_ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
