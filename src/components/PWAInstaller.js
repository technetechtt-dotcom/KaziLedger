import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiDownload, FiX, FiWifiOff } from 'react-icons/fi';
import { toast } from 'react-toastify';

const InstallPrompt = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  z-index: 10000;
  border: 1px solid #e5e7eb;
  max-width: 400px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    left: auto;
    right: 20px;
    width: 350px;
  }
`;

const InstallContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const InstallIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Ik0xNCAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOGwtNi02eiIvPgo8cGF0aCBkPSJNMTQgMnY2aDYiLz4KPHBhdGggZD0iTTE2IDEzSDgiLz4KPHBhdGggZD0iTTE2IDE3SDgiLz4KPHBhdGggZD0iTTEwIDlIOHYyIi8+Cjwvc3ZnPgo8L3N2Zz4K");
  background-size: 24px 24px;
  background-position: center;
  background-repeat: no-repeat;
`;

const InstallText = styled.div`
  flex: 1;
`;

const InstallTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const InstallDescription = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
`;

const InstallActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const InstallButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #2563eb;
  }
`;

const DismissButton = styled.button`
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e2e8f0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;

const OfflineIndicator = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.isOnline ? '#10b981' : '#ef4444'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after a delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed && !isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('🟢 Connection restored', {
        position: "top-right",
        autoClose: 2000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('🔴 Working offline', {
        position: "top-right",
        autoClose: 3000,
      });
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success('🎉 App installed successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
  };

  return (
    <>
      {/* Offline Indicator */}
      {!isOnline && (
        <OfflineIndicator isOnline={isOnline}>
          <FiWifiOff />
          Offline Mode
        </OfflineIndicator>
      )}

      {/* Install Prompt */}
      {showInstallPrompt && !isInstalled && (
        <InstallPrompt>
          <InstallContent>
            <InstallIcon>
              <FiDownload />
            </InstallIcon>
            <InstallText>
              <InstallTitle>Install Business Ops</InstallTitle>
              <InstallDescription>
                Install this app for quick access and offline functionality
              </InstallDescription>
            </InstallText>
            <CloseButton onClick={handleClose}>
              <FiX />
            </CloseButton>
          </InstallContent>
          
          <InstallActions>
            <InstallButton onClick={handleInstall}>
              <FiDownload />
              Install
            </InstallButton>
            <DismissButton onClick={handleDismiss}>
              Not now
            </DismissButton>
          </InstallActions>
        </InstallPrompt>
      )}
    </>
  );
}
