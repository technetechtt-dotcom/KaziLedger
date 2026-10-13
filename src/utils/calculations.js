// VAT and Discount Calculation Utilities

/**
 * Calculate VAT amount based on subtotal and VAT rate
 * @param {number} subtotal - The subtotal amount
 * @param {number} vatRate - The VAT rate as a percentage (e.g., 15 for 15%)
 * @returns {number} The VAT amount
 */
export const calculateVAT = (subtotal, vatRate) => {
  return (subtotal * vatRate) / 100;
};

/**
 * Calculate discount amount based on subtotal and discount
 * @param {number} subtotal - The subtotal amount
 * @param {number} discountValue - The discount value
 * @param {boolean} isPercentage - Whether the discount is a percentage or fixed amount
 * @returns {number} The discount amount
 */
export const calculateDiscount = (subtotal, discountValue, isPercentage = true) => {
  if (isPercentage) {
    return (subtotal * discountValue) / 100;
  }
  return Math.min(discountValue, subtotal); // Don't allow discount to exceed subtotal
};

/**
 * Calculate the total amount after applying VAT and discount
 * @param {number} subtotal - The subtotal amount
 * @param {number} vatRate - The VAT rate as a percentage
 * @param {number} discountValue - The discount value
 * @param {boolean} isDiscountPercentage - Whether the discount is a percentage
 * @param {boolean} vatEnabled - Whether VAT is enabled
 * @returns {object} Object containing all calculated values
 */
export const calculateTotal = (subtotal, vatRate, discountValue, isDiscountPercentage = true, vatEnabled = true) => {
  // Calculate discount first
  const discountAmount = calculateDiscount(subtotal, discountValue, isDiscountPercentage);
  const afterDiscount = subtotal - discountAmount;
  
  // Calculate VAT on the amount after discount
  const vatAmount = vatEnabled ? calculateVAT(afterDiscount, vatRate) : 0;
  
  // Calculate final total
  const total = afterDiscount + vatAmount;
  
  return {
    subtotal,
    discountAmount,
    afterDiscount,
    vatAmount,
    total,
    vatRate: vatEnabled ? vatRate : 0
  };
};

/**
 * Calculate line item totals with VAT and discount
 * @param {Array} items - Array of line items
 * @param {number} vatRate - The VAT rate as a percentage
 * @param {number} discountValue - The discount value
 * @param {boolean} isDiscountPercentage - Whether the discount is a percentage
 * @param {boolean} vatEnabled - Whether VAT is enabled
 * @returns {object} Object containing all calculated values
 */
export const calculateLineItems = (items, vatRate, discountValue, isDiscountPercentage = true, vatEnabled = true) => {
  // Calculate subtotal from all items
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    return sum + itemTotal;
  }, 0);
  
  // Calculate overall totals
  const totals = calculateTotal(subtotal, vatRate, discountValue, isDiscountPercentage, vatEnabled);
  
  // Calculate per-item details
  const itemDetails = items.map(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscount = isDiscountPercentage 
      ? (itemSubtotal * discountValue) / 100
      : (itemSubtotal / subtotal) * discountValue; // Proportional discount
    const itemAfterDiscount = itemSubtotal - itemDiscount;
    const itemVAT = vatEnabled ? calculateVAT(itemAfterDiscount, vatRate) : 0;
    const itemTotal = itemAfterDiscount + itemVAT;
    
    return {
      ...item,
      subtotal: itemSubtotal,
      discountAmount: itemDiscount,
      afterDiscount: itemAfterDiscount,
      vatAmount: itemVAT,
      total: itemTotal
    };
  });
  
  return {
    items: itemDetails,
    ...totals
  };
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (e.g., 'ZAR', 'USD')
 * @param {string} locale - The locale for formatting
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'ZAR', locale = 'en-ZA') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parse currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} The parsed number
 */
export const parseCurrency = (currencyString) => {
  // Remove currency symbols and spaces, then parse
  const cleaned = currencyString.replace(/[^\d.,-]/g, '');
  return parseFloat(cleaned.replace(',', '.')) || 0;
};

/**
 * Validate VAT rate
 * @param {number} vatRate - The VAT rate to validate
 * @returns {boolean} Whether the VAT rate is valid
 */
export const validateVATRate = (vatRate) => {
  return vatRate >= 0 && vatRate <= 100;
};

/**
 * Validate discount value
 * @param {number} discountValue - The discount value to validate
 * @param {boolean} isPercentage - Whether the discount is a percentage
 * @param {number} subtotal - The subtotal amount
 * @returns {boolean} Whether the discount value is valid
 */
export const validateDiscount = (discountValue, isPercentage, subtotal) => {
  if (isPercentage) {
    return discountValue >= 0 && discountValue <= 100;
  }
  return discountValue >= 0 && discountValue <= subtotal;
};

/**
 * Calculate tax breakdown for reporting
 * @param {Array} transactions - Array of transactions
 * @param {string} period - The period ('daily', 'weekly', 'monthly', 'yearly')
 * @returns {object} Tax breakdown object
 */
export const calculateTaxBreakdown = (transactions, period = 'monthly') => {
  const now = new Date();
  let startDate, endDate;
  
  switch (period) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'weekly':
      const startOfWeek = now.getDate() - now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek);
      endDate = new Date(now.getFullYear(), now.getMonth(), startOfWeek + 7);
      break;
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate < endDate;
  });
  
  const breakdown = filteredTransactions.reduce((acc, transaction) => {
    acc.totalVAT += transaction.vatAmount || 0;
    acc.totalDiscount += transaction.discountAmount || 0;
    acc.totalIncome += transaction.total || 0;
    acc.transactionCount += 1;
    return acc;
  }, {
    totalVAT: 0,
    totalDiscount: 0,
    totalIncome: 0,
    transactionCount: 0
  });
  
  return breakdown;
};

/**
 * Calculate profit margin
 * @param {number} revenue - Total revenue
 * @param {number} expenses - Total expenses
 * @returns {object} Profit margin calculation
 */
export const calculateProfitMargin = (revenue, expenses) => {
  const profit = revenue - expenses;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  return {
    profit,
    margin,
    revenue,
    expenses
  };
};

/**
 * Round to specified decimal places
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundTo = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export default {
  calculateVAT,
  calculateDiscount,
  calculateTotal,
  calculateLineItems,
  formatCurrency,
  parseCurrency,
  validateVATRate,
  validateDiscount,
  calculateTaxBreakdown,
  calculateProfitMargin,
  roundTo
};
