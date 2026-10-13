// PWA Service for managing offline functionality and app features

class PWAService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Check if app is installed as PWA
  isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true;
  }

  // Check if service worker is supported
  isServiceWorkerSupported() {
    return 'serviceWorker' in navigator;
  }

  // Register service worker
  async registerServiceWorker() {
    if (!this.isServiceWorkerSupported()) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Show notification
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Store data for offline use
  storeOfflineData(key, data) {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      return true;
    } catch (error) {
      console.error('Failed to store offline data:', error);
      return false;
    }
  }

  // Retrieve offline data
  getOfflineData(key) {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }

  // Queue action for when online
  queueOfflineAction(action) {
    this.offlineQueue.push({
      ...action,
      timestamp: Date.now()
    });
    this.storeOfflineData('offline_queue', this.offlineQueue);
  }

  // Sync offline actions when back online
  async syncOfflineData() {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    console.log('Syncing offline data...');
    
    for (const action of this.offlineQueue) {
      try {
        // Process each queued action
        await this.processOfflineAction(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }

    // Clear the queue after processing
    this.offlineQueue = [];
    localStorage.removeItem('offline_queue');
  }

  // Process individual offline action
  async processOfflineAction(action) {
    // This would integrate with your Firebase service
    // to sync offline changes when connection is restored
    console.log('Processing offline action:', action);
  }

  // Check if data is stale (older than specified minutes)
  isDataStale(key, maxAgeMinutes = 60) {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const ageMinutes = (Date.now() - parsed.timestamp) / (1000 * 60);
        return ageMinutes > maxAgeMinutes;
      }
      return true;
    } catch (error) {
      return true;
    }
  }

  // Clear old offline data
  clearOldOfflineData(maxAgeHours = 24) {
    const keys = Object.keys(localStorage);
    const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

    keys.forEach(key => {
      if (key.startsWith('offline_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted data
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Get app version for cache busting
  getAppVersion() {
    return process.env.REACT_APP_VERSION || '1.0.0';
  }

  // Check for app updates
  async checkForUpdates() {
    if (!this.isServiceWorkerSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        return true;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
    return false;
  }

  // Install app prompt
  async showInstallPrompt() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // The app can be installed
      return true;
    }
    return false;
  }
}

// Create singleton instance
const pwaService = new PWAService();

export default pwaService;
