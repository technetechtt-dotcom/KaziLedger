# Firebase Storage Setup Guide

## 🚀 **File Upload & PDF Generation Features Added!**

Your business app now includes:
- ✅ **File Upload System** - Upload business logos and documents
- ✅ **PDF Generation** - Professional quotes and invoices
- ✅ **Firebase Storage Integration** - Secure file storage

## 📋 **Setup Instructions**

### **Step 1: Enable Firebase Storage**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `kaziledger`
3. In the left sidebar, click **"Storage"**
4. Click **"Get started"**
5. Choose **"Start in test mode"** (we'll secure it later)
6. Select a location (choose the same as your Firestore: `us-central1`)
7. Click **"Done"**

### **Step 2: Deploy Storage Rules**

After enabling Storage, run this command to deploy the security rules:

```bash
firebase deploy --only storage
```

### **Step 3: Test the Features**

1. **Test File Upload:**
   - Go to `http://localhost:3000/storage-test`
   - Click "Test Storage Upload" to verify Firebase Storage is working

2. **Test Logo Upload:**
   - Complete the onboarding process
   - On the logo step, upload a business logo
   - The logo will be stored in Firebase Storage

3. **Test PDF Generation:**
   - Go to Quotes page
   - Fill in quote details
   - Click the download button to generate a professional PDF

## 🎯 **Features Overview**

### **File Upload System**
- **Business Logo Upload** - During onboarding
- **Document Attachments** - For quotes and invoices
- **Product Images** - For inventory management
- **Drag & Drop Interface** - Easy file selection
- **File Type Validation** - Only allowed file types
- **Size Limits** - 5MB maximum per file

### **PDF Generation**
- **Professional Quotes** - Branded with your business logo
- **Invoice Generation** - Complete with payment terms
- **Custom Styling** - Matches your business colors
- **Automatic Calculations** - VAT, discounts, totals
- **Download Ready** - Instant PDF download

## 🔧 **Technical Details**

### **File Storage Structure**
```
users/{userId}/
├── business/
│   └── logo/
│       └── logo_timestamp.ext
├── documents/
│   ├── quotes/
│   ├── invoices/
│   └── general/
└── products/
    └── images/
        └── product_{productId}_timestamp.ext
```

### **Security Rules**
- Users can only upload/access their own files
- Authenticated users only
- File size and type validation

### **PDF Features**
- Responsive design
- Business branding
- Professional layout
- Automatic calculations
- Print-ready format

## 🚨 **Troubleshooting**

### **Storage Upload Fails**
- Ensure Firebase Storage is enabled
- Check that storage rules are deployed
- Verify user is authenticated

### **PDF Generation Issues**
- Check browser console for errors
- Ensure all required fields are filled
- Try refreshing the page

### **File Upload Errors**
- Check file size (max 5MB)
- Verify file type is allowed
- Ensure stable internet connection

## 🎉 **Next Steps**

Once Storage is enabled, you can:
1. **Upload business logos** during onboarding
2. **Generate professional PDFs** for quotes
3. **Add document attachments** to quotes/invoices
4. **Upload product images** for inventory

The app is now ready for professional business use with file management and document generation capabilities!
