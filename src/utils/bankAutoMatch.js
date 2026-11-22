/**
 * Suggest matches for a bank transaction against invoices, expenses, and income.
 * Scoring: amount proximity, reference/invoice number, description vs name/vendor.
 */

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function amountClose(a, b, tolerance = 0.5) {
  return Math.abs(Math.abs(parseFloat(a) || 0) - Math.abs(parseFloat(b) || 0)) <= tolerance;
}

function textOverlap(a, b) {
  const aa = norm(a);
  const bb = norm(b);
  if (!aa || !bb) return 0;
  if (aa.includes(bb) || bb.includes(aa)) return 40;
  const tokens = bb.split(' ').filter((t) => t.length > 2);
  const hits = tokens.filter((t) => aa.includes(t)).length;
  if (!tokens.length) return 0;
  return Math.round((hits / tokens.length) * 30);
}

/**
 * @returns {{ type, id, label, score, reason }[]} sorted best-first
 */
export function suggestBankMatches(tx, { invoices = [], expenses = [], income = [] } = {}) {
  if (!tx || tx.status === 'reconciled') return [];
  const absAmt = Math.abs(parseFloat(tx.amount) || 0);
  const desc = tx.description || '';
  const ref = tx.reference || '';
  const isInflow = (parseFloat(tx.amount) || 0) >= 0;
  const scored = [];

  if (isInflow) {
    invoices
      .filter((i) => i.status !== 'paid' && i.type !== 'credit_note')
      .forEach((inv) => {
        const invAmt = parseFloat(inv.balanceDue ?? inv.total ?? inv.amount ?? 0) || 0;
        let score = 0;
        const reasons = [];
        if (amountClose(absAmt, invAmt)) {
          score += 50;
          reasons.push('amount');
        } else if (Math.abs(absAmt - invAmt) / Math.max(invAmt, 1) < 0.05) {
          score += 30;
          reasons.push('~amount');
        }
        if (ref && inv.invoiceNumber && norm(ref).includes(norm(inv.invoiceNumber))) {
          score += 45;
          reasons.push('invoice #');
        }
        score += textOverlap(desc, inv.clientName || inv.customerName);
        if (textOverlap(desc, inv.clientName || inv.customerName) > 0) reasons.push('customer');
        if (score >= 40) {
          scored.push({
            type: 'invoice',
            id: inv.id,
            label: `${inv.invoiceNumber} · ${inv.clientName || ''} · R${invAmt.toFixed(2)}`,
            score,
            reason: reasons.join(', ') || 'possible'
          });
        }
      });

    income.forEach((inc) => {
      const amt = parseFloat(inc.amount) || 0;
      let score = 0;
      const reasons = [];
      if (amountClose(absAmt, amt)) {
        score += 50;
        reasons.push('amount');
      }
      score += textOverlap(desc, `${inc.category || ''} ${inc.notes || ''}`);
      if (score >= 45) {
        scored.push({
          type: 'income',
          id: inc.id,
          label: `Income ${inc.category || ''} · R${amt.toFixed(2)}`,
          score,
          reason: reasons.join(', ') || 'possible'
        });
      }
    });
  } else {
    expenses.forEach((exp) => {
      const amt = parseFloat(exp.amount) || 0;
      let score = 0;
      const reasons = [];
      if (amountClose(absAmt, amt)) {
        score += 50;
        reasons.push('amount');
      }
      score += textOverlap(desc, `${exp.vendor || ''} ${exp.category || ''} ${exp.notes || ''}`);
      if (ref && exp.notes && norm(ref).includes(norm(exp.notes).slice(0, 12))) {
        score += 20;
        reasons.push('ref');
      }
      if (textOverlap(desc, exp.vendor) > 0) reasons.push('vendor');
      if (score >= 40) {
        scored.push({
          type: 'expense',
          id: exp.id,
          label: `Expense ${exp.category || ''} · ${exp.vendor || ''} · R${amt.toFixed(2)}`,
          score,
          reason: reasons.join(', ') || 'possible'
        });
      }
    });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Auto-reconcile all unreconciled txs that have a high-confidence unique match.
 * @param {Function} reconcileFn - async (txId, match) => result
 */
export async function autoReconcileBankFeed(txs, sources, reconcileFn, { minScore = 70 } = {}) {
  const unreconciled = (txs || []).filter((t) => t.status !== 'reconciled');
  let matched = 0;
  const details = [];

  for (const tx of unreconciled) {
    const suggestions = suggestBankMatches(tx, sources);
    const best = suggestions[0];
    const second = suggestions[1];
    if (!best || best.score < minScore) continue;
    if (second && second.score >= best.score - 5) continue; // ambiguous
    const result = await reconcileFn(tx.id, {
      type: best.type,
      id: best.id,
      label: best.label
    });
    if (result?.success) {
      matched += 1;
      details.push({ txId: tx.id, match: best });
    }
  }

  return { matched, details };
}
