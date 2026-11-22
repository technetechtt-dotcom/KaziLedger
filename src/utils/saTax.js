/**
 * South African PAYE / UIF estimates for payroll.
 * Brackets approximate SARS 2025/26 tax year (1 Mar 2025 – 28 Feb 2026).
 * For internal estimates — not a substitute for e@syFile / tax practitioner advice.
 */

export const PAYE_BRACKETS_2026 = [
  { upTo: 237100, rate: 0.18, base: 0 },
  { upTo: 370500, rate: 0.26, base: 42678 },
  { upTo: 512800, rate: 0.31, base: 77362 },
  { upTo: 673000, rate: 0.36, base: 121475 },
  { upTo: 857900, rate: 0.39, base: 179147 },
  { upTo: 1817000, rate: 0.41, base: 251258 },
  { upTo: Infinity, rate: 0.45, base: 644489 }
];

/** Primary rebate (under 65) — 2025/26 */
export const PRIMARY_REBATE_2026 = 17235;

/** UIF: 1% employee contribution, capped on monthly remuneration */
export const UIF_RATE = 0.01;
export const UIF_MONTHLY_CEILING = 17712;

/**
 * Annual PAYE on taxable income (after applying progressive brackets, before rebate).
 */
export function annualPayeBeforeRebate(annualTaxable) {
  const income = Math.max(0, parseFloat(annualTaxable) || 0);
  let previous = 0;
  for (const bracket of PAYE_BRACKETS_2026) {
    if (income <= bracket.upTo) {
      return bracket.base + (income - previous) * bracket.rate;
    }
    previous = bracket.upTo === Infinity ? previous : bracket.upTo;
  }
  return 0;
}

/**
 * Monthly PAYE estimate from monthly gross salary.
 * Annualises ×12, applies brackets + primary rebate, returns monthly withholding.
 */
export function calculateMonthlyPaye(monthlyGross, { rebate = PRIMARY_REBATE_2026 } = {}) {
  const monthly = Math.max(0, parseFloat(monthlyGross) || 0);
  const annual = monthly * 12;
  const annualTax = Math.max(0, annualPayeBeforeRebate(annual) - rebate);
  return +(annualTax / 12).toFixed(2);
}

/**
 * Monthly employee UIF (1%, capped).
 */
export function calculateMonthlyUif(monthlyGross) {
  const monthly = Math.max(0, parseFloat(monthlyGross) || 0);
  const base = Math.min(monthly, UIF_MONTHLY_CEILING);
  return +(base * UIF_RATE).toFixed(2);
}

/**
 * Full payroll line deductions for an employee.
 */
export function calculatePayrollDeductions(monthlyGross) {
  const gross = Math.max(0, parseFloat(monthlyGross) || 0);
  const tax = calculateMonthlyPaye(gross);
  const uif = calculateMonthlyUif(gross);
  const net = +(gross - tax - uif).toFixed(2);
  return { gross: +gross.toFixed(2), tax, uif, net };
}
