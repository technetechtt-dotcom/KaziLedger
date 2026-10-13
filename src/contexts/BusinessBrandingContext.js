import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const BusinessBrandingContext = createContext();

export const useBusinessBranding = () => {
  const context = useContext(BusinessBrandingContext);
  if (!context) {
    throw new Error('useBusinessBranding must be used within a BusinessBrandingProvider');
  }
  return context;
};

export const BusinessBrandingProvider = ({ children }) => {
  const { business, user } = useFirebaseBusiness();
  const [businessInfo, setBusinessInfo] = useState({
    logo: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: '',
      accountHolderName: '',
      iban: ''
    },
    taxInfo: {
      taxId: '',
      vatNumber: '',
      businessRegistration: ''
    }
  });
  const [loading, setLoading] = useState(false);

  // Load business branding from Firebase
  useEffect(() => {
    if (!business?.id || !user?.uid) return;

    const brandingRef = doc(db, 'businesses', business.id, 'settings', 'branding');
    
    const unsubscribe = onSnapshot(brandingRef, (doc) => {
      if (doc.exists()) {
        setBusinessInfo(doc.data());
      }
    }, (error) => {
      console.error('Error loading business branding:', error);
    });

    return () => unsubscribe();
  }, [business?.id, user?.uid]);

  const updateBusinessInfo = async (updates) => {
    try {
      setLoading(true);
      const updatedInfo = {
        ...businessInfo,
        ...updates
      };
      setBusinessInfo(updatedInfo);
      
      if (business?.id) {
        const brandingRef = doc(db, 'businesses', business.id, 'settings', 'branding');
        await setDoc(brandingRef, updatedInfo, { merge: true });
      }
    } catch (error) {
      console.error('Error updating business info:', error);
      alert('Failed to update business info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateBankDetails = async (bankUpdates) => {
    try {
      setLoading(true);
      const updatedInfo = {
        ...businessInfo,
        bankDetails: {
          ...businessInfo.bankDetails,
          ...bankUpdates
        }
      };
      setBusinessInfo(updatedInfo);
      
      if (business?.id) {
        const brandingRef = doc(db, 'businesses', business.id, 'settings', 'branding');
        await setDoc(brandingRef, updatedInfo, { merge: true });
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      alert('Failed to update bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaxInfo = async (taxUpdates) => {
    try {
      setLoading(true);
      const updatedInfo = {
        ...businessInfo,
        taxInfo: {
          ...businessInfo.taxInfo,
          ...taxUpdates
        }
      };
      setBusinessInfo(updatedInfo);
      
      if (business?.id) {
        const brandingRef = doc(db, 'businesses', business.id, 'settings', 'branding');
        await setDoc(brandingRef, updatedInfo, { merge: true });
      }
    } catch (error) {
      console.error('Error updating tax info:', error);
      alert('Failed to update tax info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (logoData) => {
    try {
      setLoading(true);
      const updatedInfo = {
        ...businessInfo,
        logo: logoData
      };
      setBusinessInfo(updatedInfo);
      
      if (business?.id) {
        const brandingRef = doc(db, 'businesses', business.id, 'settings', 'branding');
        await setDoc(brandingRef, updatedInfo, { merge: true });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    businessInfo,
    updateBusinessInfo,
    updateBankDetails,
    updateTaxInfo,
    uploadLogo,
    loading
  };

  return (
    <BusinessBrandingContext.Provider value={value}>
      {children}
    </BusinessBrandingContext.Provider>
  );
};
