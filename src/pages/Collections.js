import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiMail, FiLink, FiDownload, FiPlay } from 'react-icons/fi';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCustomer } from '../context/CustomerContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { functionsService } from '../firebase/functions';
import { createCustomerPortalLink } from '../utils/portalLinks';
import { getInvoiceBalance, isOutstandingInvoice } from '../utils/arAging';
import { downloadExcel, stamp } from '../utils/downloadExport';
import { toast } from 'react-toastify';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect } from 'react';

const Page = styled.div`padding: 1rem; max-width: 1000px; margin: 0 auto; padding-bottom: 4rem;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Button = styled.button`
  background: ${p => (p.$secondary ? 'white' : '#14b8a6')};
  color: ${p => (p.$secondary ? '#334155' : 'white')};
  border: 1px solid ${p => (p.$secondary ? '#e2e8f0' : '#14b8a6')};
  border-radius: 6px; padding: 0.55rem 0.9rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.35rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const Input = styled.input`padding: 0.55rem; border: 1px solid #d1d5db; border-radius: 6px;`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; display: block; margin-bottom: 0.25rem;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;

const DEFAULT_SETTINGS = {
  enabled: true,
  daysOverdue: 7,
  includePortalLink: true,
  lastRunAt: null
};

export default function Collections() {
  const { invoices, quotes } = useFinancialData();
  const { customers } = useCustomer();
  const { user, business } = useFirebaseBusiness();
  const { formatCurrency } = useCurrency();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [busy, setBusy] = useState(false);
  const [lastPortalUrl, setLastPortalUrl] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    getDoc(doc(db, 'users', user.uid, 'settings', 'collections')).then((snap) => {
      if (snap.exists()) setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
    }).catch(() => {});
  }, [user]);

  const overdue = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (parseInt(settings.daysOverdue, 10) || 7));
    return (invoices || [])
      .filter((inv) => isOutstandingInvoice(inv))
      .filter((inv) => {
        if (!inv.dueDate) return false;
        return new Date(inv.dueDate) <= cutoff;
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [invoices, settings.daysOverdue]);

  const totalOverdue = overdue.reduce((s, i) => s + getInvoiceBalance(i), 0);

  const saveSettings = async (next) => {
    setSettings(next);
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'settings', 'collections'), {
      ...next,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast.success('Collections settings saved');
  };

  const runReminders = async () => {
    setBusy(true);
    try {
      const result = await functionsService.sendPaymentReminders();
      if (result.success) {
        const sent = result.data?.sent ?? 0;
        toast.success(sent ? `Sent ${sent} reminder email(s)` : 'Reminders processed (check email config if sent = 0)');
        const next = { ...settings, lastRunAt: new Date().toISOString() };
        await saveSettings(next);
      } else {
        // Fallback: mailto drip for first overdue with email
        let opened = 0;
        for (const inv of overdue.slice(0, 5)) {
          const email = inv.clientEmail || inv.customer?.email;
          if (!email) continue;
          const subject = encodeURIComponent(`Payment reminder — ${inv.invoiceNumber}`);
          const body = encodeURIComponent(
            `Hi ${inv.clientName || 'Customer'},\n\nThis is a reminder that invoice ${inv.invoiceNumber} for ${formatCurrency(getInvoiceBalance(inv))} was due on ${inv.dueDate}.\n\nPlease arrange payment at your earliest convenience.\n\nRegards,\n${business?.name || 'Accounts'}`
          );
          window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
          opened += 1;
        }
        toast.info(opened ? `Opened ${opened} reminder draft(s). Cloud Function: ${result.error}` : result.error);
      }
    } finally {
      setBusy(false);
    }
  };

  const sharePortal = async (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;
    const result = await createCustomerPortalLink({
      userId: user.uid,
      business,
      customer,
      invoices,
      quotes
    });
    if (!result.success) return alert(result.error);
    setLastPortalUrl(result.url);
    try {
      await navigator.clipboard.writeText(result.url);
      toast.success('Portal link copied');
    } catch {
      toast.success('Portal link created');
    }
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Collections</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Reminders, statement drips, and customer portal links</p>
          </div>
        </div>
        <Button type="button" $secondary onClick={() => {
          downloadExcel(`Collections_Overdue_${stamp()}.xlsx`, overdue.map((i) => ({
            Invoice: i.invoiceNumber,
            Customer: i.clientName || i.customerName,
            Due: i.dueDate,
            Balance: getInvoiceBalance(i),
            Email: i.clientEmail || ''
          })), 'Overdue');
          toast.success('Overdue list downloaded');
        }}>
          <FiDownload /> Export
        </Button>
      </div>

      <Card>
        <strong>Overdue: {formatCurrency(totalOverdue)}</strong>
        <span style={{ color: '#64748b', marginLeft: '0.75rem' }}>({overdue.length} invoices)</span>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Automation settings</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <Label>Remind when overdue by (days)</Label>
            <Input
              type="number"
              min="1"
              value={settings.daysOverdue}
              onChange={(e) => setSettings((p) => ({ ...p, daysOverdue: e.target.value }))}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              checked={!!settings.enabled}
              onChange={(e) => setSettings((p) => ({ ...p, enabled: e.target.checked }))}
            />
            Enable scheduled drip (Cloud Function daily)
          </label>
          <Button type="button" $secondary onClick={() => saveSettings(settings)}>Save settings</Button>
          <Button type="button" onClick={runReminders} disabled={busy}>
            <FiPlay /> {busy ? 'Running…' : 'Run reminders now'}
          </Button>
        </div>
        {settings.lastRunAt && (
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 0 }}>
            Last run: {new Date(settings.lastRunAt).toLocaleString()}
          </p>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Overdue invoices</h3>
        <Table>
          <thead>
            <tr><th>Invoice</th><th>Customer</th><th>Due</th><th>Balance</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {overdue.map((inv) => {
              const customer = customers.find((c) => c.id === inv.customerId)
                || customers.find((c) => c.email && c.email === inv.clientEmail);
              return (
                <tr key={inv.id}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{inv.clientName || inv.customerName || '—'}</td>
                  <td>{inv.dueDate}</td>
                  <td>{formatCurrency(getInvoiceBalance(inv))}</td>
                  <td style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      $secondary
                      onClick={() => {
                        const email = inv.clientEmail || customer?.email;
                        if (!email) return toast.info('No customer email');
                        const subject = encodeURIComponent(`Payment reminder — ${inv.invoiceNumber}`);
                        const body = encodeURIComponent(`Hi ${inv.clientName || ''},\n\nInvoice ${inv.invoiceNumber} is overdue. Balance ${formatCurrency(getInvoiceBalance(inv))}.\n`);
                        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                      }}
                    >
                      <FiMail /> Remind
                    </Button>
                    {customer && (
                      <Button type="button" onClick={() => sharePortal(customer.id)}>
                        <FiLink /> Portal
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {overdue.length === 0 && <p style={{ color: '#64748b' }}>No overdue invoices for the current threshold.</p>}
        {lastPortalUrl && (
          <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
            Last portal link: <a href={lastPortalUrl}>{lastPortalUrl}</a>
          </p>
        )}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Share portal by customer</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {customers.slice(0, 20).map((c) => (
            <Button key={c.id} type="button" $secondary onClick={() => sharePortal(c.id)}>
              <FiLink /> {c.name}
            </Button>
          ))}
        </div>
        {customers.length === 0 && <p style={{ color: '#64748b' }}>Add customers first</p>}
      </Card>
    </Page>
  );
}
