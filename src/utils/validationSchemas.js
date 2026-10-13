import * as Yup from 'yup';

// Common validation schemas
export const emailSchema = Yup.string()
  .email('Invalid email address')
  .required('Email is required');

export const passwordSchema = Yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .required('Password is required');

export const phoneSchema = Yup.string()
  .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Invalid phone number');

// Login form validation
export const loginSchema = Yup.object().shape({
  email: emailSchema,
  password: Yup.string().required('Password is required'),
});

// Forgot password validation
export const forgotPasswordSchema = Yup.object().shape({
  email: emailSchema,
});

// Registration form validation
export const registrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  businessName: Yup.string()
    .min(2, 'Business name must be at least 2 characters')
    .required('Business name is required'),
});

// Customer form validation
export const customerSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: emailSchema,
  phone: phoneSchema,
  address: Yup.string(),
  customerType: Yup.string().required('Customer type is required'),
});

// Product form validation
export const productSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Product name must be at least 2 characters')
    .required('Product name is required'),
  description: Yup.string(),
  unitPrice: Yup.number()
    .positive('Price must be positive')
    .required('Price is required'),
  category: Yup.string(),
  itemType: Yup.string().required('Item type is required'),
  initialStock: Yup.number()
    .when('itemType', {
      is: 'product',
      then: (schema) => schema.min(0, 'Stock cannot be negative').required('Initial stock is required for products'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

// Quote/Invoice form validation
export const quoteSchema = Yup.object().shape({
  customer: Yup.mixed().required('Customer is required'),
  quoteDate: Yup.date().required('Date is required'),
  items: Yup.array()
    .min(1, 'At least one item is required')
    .of(
      Yup.object().shape({
        name: Yup.string().required('Item name is required'),
        quantity: Yup.number()
          .positive('Quantity must be positive')
          .required('Quantity is required'),
        price: Yup.number()
          .positive('Price must be positive')
          .required('Price is required'),
      })
    ),
});

// Business onboarding validation
export const businessOnboardingSchema = Yup.object().shape({
  businessName: Yup.string()
    .min(2, 'Business name must be at least 2 characters')
    .required('Business name is required'),
  email: emailSchema,
  phone: phoneSchema,
  address: Yup.string(),
});

// User form validation
export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: emailSchema,
  role: Yup.string().required('Role is required'),
});
