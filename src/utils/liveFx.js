/**
 * Fetch live FX rates with ZAR as base (units of ZAR per 1 foreign unit).
 * Primary: Frankfurter (ECB). Fallback: open.er-api.com
 */

const TARGETS = ['USD', 'EUR', 'GBP', 'ZAR'];

export async function fetchLiveRatesToZar() {
  const errors = [];

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=ZAR');
    if (res.ok) {
      const data = await res.json();
      // frankfurter from ZAR: rates[USD] = how many USD per 1 ZAR
      // We store rateToBase = ZAR per 1 foreign → invert
      const rates = [{ code: 'ZAR', name: 'South African Rand', rateToBase: 1 }];
      Object.entries(data.rates || {}).forEach(([code, perZar]) => {
        const n = parseFloat(perZar);
        if (!n) return;
        rates.push({
          code,
          name: code,
          rateToBase: +(1 / n).toFixed(6),
          source: 'frankfurter',
          asOf: data.date || new Date().toISOString().slice(0, 10)
        });
      });
      return { success: true, rates, source: 'frankfurter', asOf: data.date };
    }
    errors.push(`frankfurter ${res.status}`);
  } catch (e) {
    errors.push(e.message);
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/ZAR');
    if (res.ok) {
      const data = await res.json();
      if (data.result === 'success' && data.rates) {
        const rates = TARGETS.map((code) => {
          if (code === 'ZAR') return { code: 'ZAR', name: 'South African Rand', rateToBase: 1 };
          const perZar = parseFloat(data.rates[code]);
          return {
            code,
            name: code,
            rateToBase: perZar ? +(1 / perZar).toFixed(6) : 1,
            source: 'open.er-api',
            asOf: data.time_last_update_utc || new Date().toISOString()
          };
        });
        return { success: true, rates, source: 'open.er-api', asOf: data.time_last_update_utc };
      }
    }
    errors.push(`er-api ${res.status}`);
  } catch (e) {
    errors.push(e.message);
  }

  return { success: false, error: errors.join('; ') || 'Unable to fetch live rates' };
}
