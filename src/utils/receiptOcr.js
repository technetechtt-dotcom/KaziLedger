import Tesseract from 'tesseract.js';

/**
 * Run OCR on an image file or data URL
 * @param {File|Blob|string} imageSource
 * @param {function} onProgress - optional progress callback (0-100)
 * @returns {Promise<{ text: string, confidence: number }>}
 */
export const runOcr = async (imageSource, onProgress) => {
  const result = await Tesseract.recognize(imageSource, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  return {
    text: result.data.text || '',
    confidence: result.data.confidence || 0,
  };
};

/**
 * Parse OCR text into structured receipt/invoice fields
 * Tuned for South African slips (VAT 15%) and common invoice formats
 */
export const parseReceiptText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const fullText = lines.join('\n');

  return {
    vendor: extractVendor(lines),
    date: extractDate(fullText),
    amount: extractTotalAmount(fullText, lines),
    vatAmount: extractVatAmount(fullText, lines),
    vatRate: extractVatRate(fullText) ?? 15,
    invoiceNumber: extractInvoiceNumber(fullText),
    category: suggestCategory(fullText),
    rawText: text,
  };
};

const MONEY_RE = /(?:R\s*|ZAR\s*|\$\s*)?(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\d+\.\d{2})/gi;

const parseMoney = (str) => {
  if (!str) return null;
  const cleaned = String(str).replace(/[^\d.]/g, '');
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : null;
};

const extractVendor = (lines) => {
  // Prefer early non-noise lines as merchant name
  const noise = /^(tel|fax|vat|tax|invoice|receipt|total|date|cash|card|change|thank|www\.|http)/i;
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const line = lines[i];
    if (line.length < 3 || line.length > 60) continue;
    if (noise.test(line)) continue;
    if (/^\d+$/.test(line)) continue;
    if (MONEY_RE.test(line)) {
      MONEY_RE.lastIndex = 0;
      continue;
    }
    return line;
  }
  return '';
};

const extractDate = (text) => {
  const patterns = [
    /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})/, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})/, // DD/MM/YY
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    let year;
    let month;
    let day;

    if (match[1].length === 4) {
      year = match[1];
      month = match[2].padStart(2, '0');
      day = match[3].padStart(2, '0');
    } else {
      day = match[1].padStart(2, '0');
      month = match[2].padStart(2, '0');
      year = match[3].length === 2 ? `20${match[3]}` : match[3];

      // Heuristic: if first number > 12, treat as day (SA style DD/MM)
      // else assume DD/MM still (common in SA)
      if (parseInt(match[1], 10) > 12) {
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
      }
    }

    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) {
      return iso;
    }
  }

  return new Date().toISOString().split('T')[0];
};

const extractLabeledAmount = (text, labels) => {
  const labelPattern = labels.join('|');
  const regex = new RegExp(
    `(?:${labelPattern})\\s*[:#]?\\s*(?:R\\s*|ZAR\\s*|\\$\\s*)?(\\d{1,3}(?:[,\\s]\\d{3})*(?:\\.\\d{2})|\\d+\\.\\d{2})`,
    'i'
  );
  const match = text.match(regex);
  return match ? parseMoney(match[1]) : null;
};

const extractTotalAmount = (text, lines) => {
  const labeled =
    extractLabeledAmount(text, [
      'grand\\s*total',
      'amount\\s*due',
      'total\\s*due',
      'total\\s*incl(?:usive)?(?:\\s*of)?\\s*vat',
      'total\\s*payable',
      'balance\\s*due',
      'net\\s*total',
      'total',
    ]) ||
    extractLabeledAmount(text, ['amount', 'sum']);

  if (labeled != null) return labeled;

  // Fallback: largest money-like value on the slip
  const amounts = [];
  for (const line of lines) {
    let m;
    const re = /(?:R\s*|ZAR\s*|\$\s*)?(\d{1,3}(?:[,\s]\d{3})*(?:\.\d{2})|\d+\.\d{2})/g;
    while ((m = re.exec(line)) !== null) {
      const val = parseMoney(m[1]);
      if (val != null && val > 0 && val < 1000000) amounts.push(val);
    }
  }

  if (!amounts.length) return '';
  return Math.max(...amounts);
};

const extractVatAmount = (text, lines) => {
  const labeled = extractLabeledAmount(text, [
    'vat\\s*amount',
    'vat\\s*total',
    'tax\\s*amount',
    'vat\\s*@\\s*\\d+%',
    'vat',
    'tax',
  ]);
  if (labeled != null) return labeled;

  // Infer from total if 15% VAT inclusive
  const total = extractTotalAmount(text, lines);
  if (typeof total === 'number' && total > 0) {
    return Math.round((total * 15) / 115 * 100) / 100;
  }
  return '';
};

const extractVatRate = (text) => {
  const match = text.match(/vat\s*(?:@|at)?\s*(\d{1,2}(?:\.\d+)?)\s*%/i);
  if (match) return parseFloat(match[1]);
  if (/vat|tax invoice/i.test(text)) return 15;
  return null;
};

const extractInvoiceNumber = (text) => {
  const patterns = [
    /(?:invoice|inv|receipt|slip|ref|reference)\s*(?:no|number|#)?\s*[:.]?\s*([A-Z0-9\-\/]+)/i,
    /(?:tax\s*invoice)\s*(?:no|number|#)?\s*[:.]?\s*([A-Z0-9\-\/]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m?.[1] && m[1].length >= 3) return m[1];
  }
  return '';
};

const suggestCategory = (text) => {
  const lower = text.toLowerCase();
  const rules = [
    { category: 'Fuel', keywords: ['fuel', 'petrol', 'diesel', 'garage', 'engen', 'shell', 'bp ', 'caltex', 'sasol'] },
    { category: 'Travel', keywords: ['uber', 'bolt', 'taxi', 'flight', 'airline', 'hotel', 'parking', 'toll'] },
    { category: 'Meals', keywords: ['restaurant', 'cafe', 'coffee', 'food', 'meal', 'takeaway', 'pizza', 'burger'] },
    { category: 'Utilities', keywords: ['electricity', 'water', 'municipal', 'eskom', 'internet', 'fibre', 'telkom', 'vodacom', 'mtn'] },
    { category: 'Office Supplies', keywords: ['stationery', 'office', 'paper', 'ink', 'toner', 'waltons'] },
    { category: 'Equipment', keywords: ['hardware', 'laptop', 'computer', 'monitor', 'printer', 'tool'] },
    { category: 'Software', keywords: ['software', 'subscription', 'saas', 'microsoft', 'adobe', 'google workspace'] },
    { category: 'Marketing', keywords: ['advert', 'marketing', 'facebook ads', 'google ads', 'promo'] },
    { category: 'Professional Services', keywords: ['consult', 'legal', 'accountant', 'attorney', 'audit'] },
    { category: 'Rent', keywords: ['rent', 'lease', 'rental'] },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.category;
  }
  return 'Other';
};

/**
 * Full pipeline: OCR + parse
 */
export const scanReceipt = async (imageSource, onProgress) => {
  const { text, confidence } = await runOcr(imageSource, onProgress);
  const parsed = parseReceiptText(text);
  return {
    ...parsed,
    confidence,
  };
};
