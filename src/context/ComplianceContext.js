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

const ComplianceContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  documents: []
};

// Reducer
function complianceReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_DOCUMENTS:
      return { ...state, documents: action.payload };
    
    case ACTIONS.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };
    
    case ACTIONS.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(document =>
          document.id === action.payload.id ? action.payload : document
        )
      };
    
    case ACTIONS.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(document => document.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export const ComplianceProvider = ({ children }) => {
  const { business, user } = useFirebaseBusiness();
  const [state, dispatch] = useReducer(complianceReducer, initialState);

  // Load documents from Firebase
  useEffect(() => {
    if (!business?.id || !user?.uid) return;

    const documentsQuery = query(
      collection(db, 'businesses', business.id, 'compliance_documents'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(documentsQuery, (snapshot) => {
      const documentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiryDate: doc.data().expiryDate?.toDate?.()?.toISOString() || doc.data().expiryDate
      }));

      dispatch({ type: ACTIONS.SET_DOCUMENTS, payload: documentsData });
    }, (error) => {
      console.error('Error loading compliance documents:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    });

    return () => unsubscribe();
  }, [business?.id, user?.uid]);

  const addDocument = useCallback(async (documentData) => {
    if (!business?.id || !user?.uid) {
      throw new Error('Business ID or User ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const documentWithTimestamp = {
        ...documentData,
        businessId: business.id,
        userId: user.uid,
        createdAt: serverTimestamp(),
        expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null
      };

      const docRef = await addDoc(collection(db, 'businesses', business.id, 'compliance_documents'), documentWithTimestamp);
      
      const newDocument = {
        id: docRef.id,
        ...documentData,
        businessId: business.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        expiryDate: documentData.expiryDate || null
      };

      dispatch({ type: ACTIONS.ADD_DOCUMENT, payload: newDocument });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding document:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id, user?.uid]);

  const updateDocument = useCallback(async (id, documentData) => {
    if (!business?.id) {
      throw new Error('Business ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const documentRef = doc(db, 'businesses', business.id, 'compliance_documents', id);
      const updateData = {
        ...documentData,
        updatedAt: serverTimestamp(),
        expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null
      };

      await updateDoc(documentRef, updateData);

      const updatedDocument = {
        id,
        ...state.documents.find(d => d.id === id),
        ...documentData,
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: ACTIONS.UPDATE_DOCUMENT, payload: updatedDocument });
      return { success: true };
    } catch (error) {
      console.error('Error updating document:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id, state.documents]);

  const deleteDocument = useCallback(async (id) => {
    if (!business?.id) {
      throw new Error('Business ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const documentRef = doc(db, 'businesses', business.id, 'compliance_documents', id);
      await deleteDoc(documentRef);

      dispatch({ type: ACTIONS.DELETE_DOCUMENT, payload: id });
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id]);

  const getDocumentsByType = useCallback((type) => {
    return state.documents.filter(document => document.type === type);
  }, [state.documents]);

  const getExpiringDocuments = useCallback((days = 30) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return state.documents.filter(document => {
      if (!document.expiryDate) return false;
      const expiryDate = new Date(document.expiryDate);
      return expiryDate >= today && expiryDate <= futureDate;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [state.documents]);

  const getOverdueDocuments = useCallback(() => {
    const today = new Date();
    
    return state.documents.filter(document => {
      if (!document.expiryDate) return false;
      const expiryDate = new Date(document.expiryDate);
      return expiryDate < today;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  }, [state.documents]);

  const value = {
    ...state,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentsByType,
    getExpiringDocuments,
    getOverdueDocuments
  };

  return (
    <ComplianceContext.Provider value={value}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};
