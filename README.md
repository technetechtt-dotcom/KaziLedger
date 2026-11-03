# Business Operations Mobile App

A comprehensive React mobile-first application for managing daily business operations including invoices, quotes, receipts, inventory, and more.

## 🚀 Features

### Core Functionality
- **Dashboard**: KPIs, income vs expenses charts, quick actions
- **Quotes Management**: Create, edit, preview, and export quotes with VAT/discount calculations
- **Invoice Management**: Generate invoices with payment tracking and overdue alerts
- **Document Scanner**: OCR-powered receipt scanning and expense recording
- **Reports & Analytics**: Comprehensive reporting with charts and data visualization
- **Inventory Management**: Stock tracking with low-stock alerts and movement logs
- **Appointments & Shifts**: Calendar view and staff scheduling
- **Settings**: Business profile, multi-language support, and document templates

### Key Technical Features
- **VAT & Discount System**: Flexible VAT and discount calculations per item or globally
- **PDF Export**: Professional PDF generation for quotes and invoices
- **OCR Integration**: Document scanning with automatic data extraction
- **Multi-language Support**: English, Afrikaans, Zulu, Xhosa
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Real-time Calculations**: Live VAT, discount, and total calculations
- **Data Persistence**: Local storage with context management

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-operations-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 📱 Mobile Usage

The app is designed mobile-first and works best on mobile devices. Key mobile features:

- **Bottom Navigation**: Easy thumb navigation
- **Touch-Friendly**: Large buttons and touch targets
- **Camera Integration**: Direct camera access for document scanning
- **Responsive Layout**: Adapts to different screen sizes
- **Swipe Gestures**: Intuitive navigation patterns

## 🎨 Design System

### Color Palette
- **Primary**: #3b82f6 (Blue)
- **Success**: #059669 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)
- **Neutral**: #64748b (Slate)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Gradient backgrounds, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Bottom tabs on mobile, sidebar on desktop

## 🔧 Configuration

### Business Settings
Configure your business profile in Settings:
- Business name and logo
- Contact information
- Default currency and VAT rate
- Language preferences
- Document templates

### VAT Configuration
- Enable/disable VAT globally
- Set default VAT rate (default: 15%)
- Apply VAT per item or globally
- Support for different VAT rates per item

### Discount System
- Percentage discounts (0-100%)
- Fixed amount discounts
- Per-item or overall discounts
- Automatic calculation and validation

## 📊 Reports & Analytics

### Available Reports
- **Daily**: Today's income and expenses
- **Weekly**: 7-day rolling reports
- **Monthly**: Calendar month reports
- **Yearly**: Annual summaries

### Chart Types
- Bar charts for income vs expenses
- Pie charts for expense categories
- Line charts for trend analysis
- KPI cards with change indicators

## 📄 PDF Export

### Features
- Professional document templates
- Customizable business logo and colors
- Automatic calculations (VAT, discounts, totals)
- Multiple currency support
- Print-ready formatting

### Supported Documents
- Quotes with itemized breakdowns
- Invoices with payment terms
- Custom document templates

## 🔍 Document Scanner

### OCR Capabilities
- Automatic text extraction from receipts
- Vendor name recognition
- Date and amount detection
- Category classification
- Manual editing and validation

### Supported Formats
- Camera capture
- File upload (JPEG, PNG, PDF)
- Drag and drop interface

## 🌍 Multi-language Support

### Supported Languages
- **English** (en)
- **Afrikaans** (af)
- **Zulu** (zu)
- **Xhosa** (xh)

### Localization Features
- Interface translations
- Currency formatting
- Date and number formatting
- RTL support (where applicable)

## 🏗️ Architecture

### Tech Stack
- **React 18**: Modern React with hooks
- **React Router**: Client-side routing
- **Styled Components**: CSS-in-JS styling
- **Context API**: State management
- **Recharts**: Data visualization
- **jsPDF**: PDF generation
- **Tesseract.js**: OCR processing
- **React Dropzone**: File uploads

### Project Structure
```
src/
├── components/          # Reusable components
├── pages/              # Page components
├── context/            # React context providers
├── utils/              # Utility functions
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project
2. Deploy the `build` folder to Netlify
3. Configure redirects for client-side routing

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 📱 PWA Features

The app can be installed as a Progressive Web App:
- Offline functionality
- App-like experience
- Push notifications (future)
- Background sync (future)

## 🔒 Security

### Data Protection
- Local storage encryption
- Secure file handling
- Input validation
- XSS protection

### Privacy
- No data sent to external servers
- Local data storage only
- GDPR compliant

## 🐛 Troubleshooting

### Common Issues

1. **Scanner not working**
   - Ensure camera permissions are granted
   - Try using HTTPS (required for camera access)

2. **PDF generation fails**
   - Check browser compatibility
   - Ensure sufficient memory

3. **OCR not accurate**
   - Use high-quality images
   - Ensure good lighting
   - Try different image formats

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons by Feather Icons
- Charts by Recharts
- PDF generation by jsPDF
- OCR by Tesseract.js
- UI inspiration from modern business apps

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for small businesses**
