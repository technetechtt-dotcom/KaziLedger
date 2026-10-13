// PWA Configuration
export const PWA_CONFIG = {
  // App Information
  appName: 'Business Operations',
  appShortName: 'Business Ops',
  appDescription: 'Complete business management platform for quotes, invoices, inventory, and customer management',
  
  // Theme Colors
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
  
  // Display Mode
  display: 'standalone',
  
  // Orientation
  orientation: 'portrait-primary',
  
  // Scope
  scope: '/',
  
  // Start URL
  startUrl: '/',
  
  // Categories
  categories: ['business', 'productivity', 'finance'],
  
  // Language
  lang: 'en',
  dir: 'ltr',
  
  // Icons Configuration
  icons: {
    sizes: [16, 32, 48, 64, 96, 128, 192, 256, 384, 512],
    purpose: 'maskable any'
  },
  
  // Shortcuts
  shortcuts: [
    {
      name: 'New Quote',
      short_name: 'Quote',
      description: 'Create a new quote',
      url: '/quotes?action=new',
      icons: [{ src: '/logo192.png', sizes: '192x192' }]
    },
    {
      name: 'New Invoice',
      short_name: 'Invoice',
      description: 'Create a new invoice',
      url: '/invoices?action=new',
      icons: [{ src: '/logo192.png', sizes: '192x192' }]
    },
    {
      name: 'View Statements',
      short_name: 'Statements',
      description: 'View customer statements',
      url: '/statements',
      icons: [{ src: '/logo192.png', sizes: '192x192' }]
    },
    {
      name: 'Dashboard',
      short_name: 'Dashboard',
      description: 'View business dashboard',
      url: '/',
      icons: [{ src: '/logo192.png', sizes: '192x192' }]
    }
  ],
  
  // Screenshots (placeholder - would need actual screenshots)
  screenshots: [
    {
      src: '/screenshot-wide.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide',
      label: 'Dashboard view on desktop'
    },
    {
      src: '/screenshot-narrow.png',
      sizes: '750x1334',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Mobile app view'
    }
  ],
  
  // Cache Configuration
  cache: {
    name: 'business-ops-cache',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100
  },
  
  // Offline Configuration
  offline: {
    enabled: true,
    fallbackPage: '/offline',
    cacheStrategy: 'cacheFirst'
  },
  
  // Notification Configuration
  notifications: {
    enabled: true,
    permissionRequired: true,
    defaultIcon: '/logo192.png',
    defaultBadge: '/logo192.png'
  },
  
  // Update Configuration
  updates: {
    checkInterval: 24 * 60 * 60 * 1000, // 24 hours
    promptUser: true,
    autoUpdate: false
  }
};

export default PWA_CONFIG;
