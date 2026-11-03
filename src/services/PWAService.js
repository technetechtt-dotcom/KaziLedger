// PWA Service for managing offline functionality and app features

class PWAService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.setupEventListeners();
    this.loadQueueFromStorage();
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

  loadQueueFromStorage() {
    const stored = this.getOfflineData('queue');
    if (Array.isArray(stored)) {
      this.offlineQueue = stored;
    }
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
    this.storeOfflineData('queue', this.offlineQueue);
  }

  // Sync offline actions when back online
  async syncOfflineData() {
    this.loadQueueFromStorage();
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    console.log('Syncing offline data...', this.offlineQueue.length, 'actions');
    const remaining = [];

    for (const action of this.offlineQueue) {
      try {
        await this.processOfflineAction(action);
      } catch (error) {
        console.error('Failed to process offline action:', error);
        remaining.push(action);
      }
    }

    this.offlineQueue = remaining;
    if (remaining.length === 0) {
      localStorage.removeItem('offline_queue');
    } else {
      this.storeOfflineData('queue', remaining);
    }
  }

  // Process individual offline action — flush queued HTTP / custom payloads
  async processOfflineAction(action) {
    if (!action) return;

    // Prefer explicit fetch target if the queued action includes one
    if (action.url) {
      const response = await fetch(action.url, {
        method: action.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(action.headers || {})
        },
        body: action.body != null
          ? (typeof action.body === 'string' ? action.body : JSON.stringify(action.body))
          : undefined,
        credentials: action.credentials || 'same-origin'
      });
      if (!response.ok) {
        throw new Error(`Offline sync HTTP ${response.status} for ${action.url}`);
      }
      return;
    }

    // Replay against a named endpoint shorthand (minimal working sync)
    if (action.endpoint) {
      const response = await fetch(action.endpoint, {
        method: action.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...(action.headers || {}) },
        body: JSON.stringify(action.payload || action.data || {})
      });
      if (!response.ok) {
        throw new Error(`Offline sync failed for endpoint ${action.endpoint}`);
      }
      return;
    }

    // Persist-only / no-op markers: acknowledge so they leave the queue
    if (action.type === 'noop' || action.type === 'ack') {
      return;
    }

    console.log('Processed offline action (no transport):', action.type || action);
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
