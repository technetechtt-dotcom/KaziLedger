import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFirebaseBusiness } from './FirebaseBusinessContext';
import { deleteFile, uploadDocument } from '../firebase/storage';

const DocumentLibraryContext = createContext();

export const DOCUMENT_CATEGORIES = [
  'Receipt',
  'Invoice scan',
  'Tax',
  'Compliance',
  'Contract',
  'Bank statement',
  'ID / KYC',
  'Other'
];

export const DOCUMENT_SOURCES = {
  SCANNER: 'scanner',
  UPLOAD: 'upload',
  COMPLIANCE: 'compliance'
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DOCUMENTS: 'SET_DOCUMENTS'
};

const initialState = {
  loading: false,
  error: null,
  documents: []
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.SET_DOCUMENTS:
      return { ...state, documents: action.payload, loading: false };
    default:
      return state;
  }
}

export function DocumentLibraryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useFirebaseBusiness();

  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: ACTIONS.SET_DOCUMENTS, payload: [] });
      return undefined;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    const q = query(
      collection(db, 'users', user.uid, 'documentLibrary'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        dispatch({
          type: ACTIONS.SET_DOCUMENTS,
          payload: snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || d.data().createdAt || null,
            updatedAt: d.data().updatedAt?.toDate?.()?.toISOString?.() || d.data().updatedAt || null
          }))
        });
      },
      (err) => {
        console.error('Document library listen failed', err);
        dispatch({ type: ACTIONS.SET_ERROR, payload: err.message });
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const addLibraryDocument = useCallback(async (data) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' };
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'documentLibrary'), {
        name: data.name || 'Untitled document',
        category: data.category || 'Other',
        tags: Array.isArray(data.tags) ? data.tags : [],
        notes: data.notes || '',
        source: data.source || DOCUMENT_SOURCES.UPLOAD,
        mimeType: data.mimeType || '',
        size: data.size || 0,
        downloadURL: data.downloadURL || data.fileUrl || null,
        storagePath: data.storagePath || data.receiptPath || null,
        documentDate: data.documentDate || data.date || null,
        vendor: data.vendor || '',
        amount: data.amount != null ? parseFloat(data.amount) || null : null,
        expenseId: data.expenseId || null,
        status: data.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, id: ref.id };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user?.uid]);

  const uploadAndAddDocument = useCallback(async ({ file, name, category, tags, notes, documentDate, vendor }) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' };
    if (!file) return { success: false, error: 'No file selected' };

    const typeFolder = (category || 'other').toLowerCase().replace(/\s+/g, '_');
    const upload = await uploadDocument(user.uid, file, typeFolder);
    if (!upload.success) return { success: false, error: upload.error || 'Upload failed' };

    return addLibraryDocument({
      name: name || file.name || 'Uploaded document',
      category: category || 'Other',
      tags,
      notes,
      documentDate,
      vendor,
      source: DOCUMENT_SOURCES.UPLOAD,
      mimeType: file.type || '',
      size: file.size || 0,
      downloadURL: upload.url,
      storagePath: upload.path
    });
  }, [user?.uid, addLibraryDocument]);

  const updateLibraryDocument = useCallback(async (id, updates) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' };
    try {
      const payload = { ...updates, updatedAt: serverTimestamp() };
      delete payload.id;
      delete payload.createdAt;
      await updateDoc(doc(db, 'users', user.uid, 'documentLibrary', id), payload);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user?.uid]);

  const deleteLibraryDocument = useCallback(async (id, storagePath) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' };
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'documentLibrary', id));
      if (storagePath) {
        await deleteFile(storagePath);
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user?.uid]);

  const value = {
    ...state,
    addLibraryDocument,
    uploadAndAddDocument,
    updateLibraryDocument,
    deleteLibraryDocument,
    DOCUMENT_CATEGORIES,
    DOCUMENT_SOURCES
  };

  return (
    <DocumentLibraryContext.Provider value={value}>
      {children}
    </DocumentLibraryContext.Provider>
  );
}

export function useDocumentLibrary() {
  const ctx = useContext(DocumentLibraryContext);
  if (!ctx) {
    throw new Error('useDocumentLibrary must be used within DocumentLibraryProvider');
  }
  return ctx;
}
