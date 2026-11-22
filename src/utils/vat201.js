/**
 * VAT201-style draft calculator for South African VAT returns.
 */

const DEFAULT_RATE = 15;

function inPeriod(dateValue, start, end) {
  if (!dateValue) return false;
  const d = typeof dateValue?.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

function extractVatFromInclusive(total, rate) {
  const t = Math.abs(parseFloat(total) || 0);
  const r = parseFloat(rate) || 0;
  if (!r || t <= 0) return { net: t, vat: 0 };
  const net = t / (1 + r / 100);
  return { net, vat: t - net };
}

function saleBreakdown(inv, defaultRate = DEFAULT_RATE) {
  const total = Math.abs(parseFloat(inv.total ?? inv.amount ?? 0) || 0);
  const rate = inv.vatRate != null ? parseFloat(inv.vatRate) : defaultRate;
  const category = (inv.vatCategory || '').toLowerCase();

  if (category === 'zero' || category === 'zero_rated' || rate === 0) {
    return { net: total, vat: 0, bucket: 'zeroRated' };
  }
  if (category === 'exempt') {
    return { net: total, vat: 0, bucket: 'exempt' };
  }
  if (inv.vatAmount != null) {
    const vat = Math.abs(parseFloat(inv.vatAmount) || 0);
    return { net: Math.max(0, total - vat), vat, bucket: 'standard' };
  }
  const { net, vat } = extractVatFromInclusive(total, rate || defaultRate);
  return { net, vat, bucket: 'standard' };
}

function expenseVat(exp, defaultRate = DEFAULT_RATE) {
  const total = Math.abs(parseFloat(exp.amount) || 0);
  if (exp.taxDeductible === false) return { net: total, vat: 0, deductible: false };
  if (exp.vatAmount != null) {
    const vat = Math.abs(parseFloat(exp.vatAmount) || 0);
    return { net: Math.max(0, total - vat), vat, deductible: true };
  }
  const rate = exp.vatRate != null ? parseFloat(exp.vatRate) : defaultRate;
  const { net, vat } = extractVatFromInclusive(total, rate);
  return { net, vat, deductible: true };
}

/**
 * Build a VAT201-style draft for a period.
 */
export function buildVat201Draft({ invoices = [], expenses = [], periodStart, periodEnd, vatRate = DEFAULT_RATE }) {
  const sales = invoices.filter(
    (inv) => inv.type !== 'credit_note' && inPeriod(inv.invoiceDate || inv.createdAt, periodStart, periodEnd)
  );
  const credits = invoices.filter(
    (inv) => inv.type === 'credit_note' && inPeriod(inv.invoiceDate || inv.createdAt, periodStart, periodEnd)
  );
  const periodExpenses = expenses.filter((exp) => inPeriod(exp.date || exp.createdAt, periodStart, periodEnd));

  let standardSales = 0;
  let zeroRatedSales = 0;
  let exemptSales = 0;
  let outputVat = 0;

  sales.forEach((inv) => {
    const b = saleBreakdown(inv, vatRate);
    if (b.bucket === 'zeroRated') zeroRatedSales += b.net;
    else if (b.bucket === 'exempt') exemptSales += b.net;
    else {
      standardSales += b.net;
      outputVat += b.vat;
    }
  });

  let creditStandard = 0;
  let creditVat = 0;
  credits.forEach((inv) => {
    const b = saleBreakdown(inv, vatRate);
    creditStandard += b.net;
    creditVat += b.vat;
  });

  let capitalInputVat = 0;
  let otherInputVat = 0;
  let expenseNet = 0;

  periodExpenses.forEach((exp) => {
    const b = expenseVat(exp, vatRate);
    if (!b.deductible) return;
    expenseNet += b.net;
    if ((exp.category || '').toLowerCase().includes('capital') || exp.capitalGoods) {
      capitalInputVat += b.vat;
    } else {
      otherInputVat += b.vat;
    }
  });

  const inputVat = capitalInputVat + otherInputVat;
  const netVat = outputVat - creditVat - inputVat;

  return {
    periodStart,
    periodEnd,
    vatRate,
    // VAT201-ish boxes
    box1_standardSales: +standardSales.toFixed(2),
    box1A_zeroRated: +zeroRatedSales.toFixed(2),
    box1B_exempt: +exemptSales.toFixed(2),
    box4_outputVat: +outputVat.toFixed(2),
    box9_creditNotesNet: +creditStandard.toFixed(2),
    box10_creditVat: +creditVat.toFixed(2),
    box14_capitalInputVat: +capitalInputVat.toFixed(2),
    box14A_otherInputVat: +otherInputVat.toFixed(2),
    box15_inputVat: +inputVat.toFixed(2),
    box16_vatPayable: +netVat.toFixed(2),
    // aliases used by UI
    standardSales: +standardSales.toFixed(2),
    zeroRatedSales: +zeroRatedSales.toFixed(2),
    exemptSales: +exemptSales.toFixed(2),
    outputVat: +outputVat.toFixed(2),
    creditVat: +creditVat.toFixed(2),
    expenseNet: +expenseNet.toFixed(2),
    inputVat: +inputVat.toFixed(2),
    capitalInputVat: +capitalInputVat.toFixed(2),
    otherInputVat: +otherInputVat.toFixed(2),
    netVat: +netVat.toFixed(2),
    salesCount: sales.length,
    creditsCount: credits.length,
    sales,
    credits,
    deductibleExpenses: periodExpenses.filter((e) => e.taxDeductible !== false)
  };
}
