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

const AppointmentContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  ADD_APPOINTMENT: 'ADD_APPOINTMENT',
  UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
  DELETE_APPOINTMENT: 'DELETE_APPOINTMENT'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  appointments: []
};

// Reducer
function appointmentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_APPOINTMENTS:
      return { ...state, appointments: action.payload };
    
    case ACTIONS.ADD_APPOINTMENT:
      return { ...state, appointments: [...state.appointments, action.payload] };
    
    case ACTIONS.UPDATE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map(appointment =>
          appointment.id === action.payload.id ? action.payload : appointment
        )
      };
    
    case ACTIONS.DELETE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.filter(appointment => appointment.id !== action.payload)
      };
    
    default:
      return state;
  }
}

export const AppointmentProvider = ({ children }) => {
  const { business, user } = useFirebaseBusiness();
  const [state, dispatch] = useReducer(appointmentReducer, initialState);

  // Load appointments from Firebase
  useEffect(() => {
    if (!business?.id || !user?.uid) return;

    const appointmentsQuery = query(
      collection(db, 'businesses', business.id, 'appointments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        appointmentDate: doc.data().appointmentDate?.toDate?.()?.toISOString() || doc.data().appointmentDate
      }));

      dispatch({ type: ACTIONS.SET_APPOINTMENTS, payload: appointmentsData });
    }, (error) => {
      console.error('Error loading appointments:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    });

    return () => unsubscribe();
  }, [business?.id, user?.uid]);

  const addAppointment = useCallback(async (appointmentData) => {
    if (!business?.id || !user?.uid) {
      throw new Error('Business ID or User ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const appointmentWithTimestamp = {
        ...appointmentData,
        businessId: business.id,
        userId: user.uid,
        createdAt: serverTimestamp(),
        appointmentDate: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate) : serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'businesses', business.id, 'appointments'), appointmentWithTimestamp);
      
      const newAppointment = {
        id: docRef.id,
        ...appointmentData,
        businessId: business.id,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        appointmentDate: appointmentData.appointmentDate || new Date().toISOString()
      };

      dispatch({ type: ACTIONS.ADD_APPOINTMENT, payload: newAppointment });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error adding appointment:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id, user?.uid]);

  const updateAppointment = useCallback(async (id, appointmentData) => {
    if (!business?.id) {
      throw new Error('Business ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const appointmentRef = doc(db, 'businesses', business.id, 'appointments', id);
      const updateData = {
        ...appointmentData,
        updatedAt: serverTimestamp(),
        appointmentDate: appointmentData.appointmentDate ? new Date(appointmentData.appointmentDate) : undefined
      };

      await updateDoc(appointmentRef, updateData);

      const updatedAppointment = {
        id,
        ...state.appointments.find(a => a.id === id),
        ...appointmentData,
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: ACTIONS.UPDATE_APPOINTMENT, payload: updatedAppointment });
      return { success: true };
    } catch (error) {
      console.error('Error updating appointment:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id, state.appointments]);

  const deleteAppointment = useCallback(async (id) => {
    if (!business?.id) {
      throw new Error('Business ID not available');
    }

    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });

      const appointmentRef = doc(db, 'businesses', business.id, 'appointments', id);
      await deleteDoc(appointmentRef);

      dispatch({ type: ACTIONS.DELETE_APPOINTMENT, payload: id });
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [business?.id]);

  const getAppointmentsByDate = useCallback((date) => {
    const targetDate = new Date(date).toDateString();
    return state.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate).toDateString();
      return appointmentDate === targetDate;
    });
  }, [state.appointments]);

  const getUpcomingAppointments = useCallback((days = 7) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return state.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= today && appointmentDate <= futureDate;
    }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  }, [state.appointments]);

  const value = {
    ...state,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getUpcomingAppointments
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};
