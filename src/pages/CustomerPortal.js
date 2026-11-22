import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { loadPublicPortal } from '../utils/portalLinks';

const Page = styled.div`
  min-height: 100vh;
  background: #f1f5f9;
  padding: 1.5rem 1rem 3rem;
`;
const Shell = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;
const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
`;
const Brand = styled.h1`
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  color: #0f766e;
`;
const Muted = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
`;
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.9rem;
  &:last-child { border-bottom: none; }
`;

function money(n) {
  return `R ${Number(n || 0).toFixed(2)}`;
}

export default function CustomerPortal() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await loadPublicPortal(token);
      if (cancelled) return;
      if (!result.success) setState({ loading: false, error: result.error, data: null });
      else setState({ loading: false, error: '', data: result.data });
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (state.loading) {
    return (
      <Page>
        <Shell><Card><Muted>Loading your portal…</Muted></Card></Shell>
      </Page>
    );
  }

  if (state.error || !state.data) {
    return (
      <Page>
        <Shell>
          <Card>
            <h2 style={{ marginTop: 0 }}>Link unavailable</h2>
            <Muted>{state.error || 'Unable to load portal'}</Muted>
          </Card>
        </Shell>
      </Page>
    );
  }

  const { data } = state;
  const openInvoices = (data.invoices || []).filter((i) => i.status !== 'paid' && i.status !== 'void');

  return (
    <Page>
      <Shell>
        <Card>
          <Brand>{data.businessName || 'Business portal'}</Brand>
          <Muted>Customer access for {data.customerName || 'you'}</Muted>
          {(data.businessEmail || data.businessPhone) && (
            <Muted style={{ marginTop: 8 }}>
              {[data.businessEmail, data.businessPhone].filter(Boolean).join(' · ')}
            </Muted>
          )}
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Account summary</h3>
          <Row>
            <span>Outstanding balance</span>
            <strong>{money(data.outstandingTotal)}</strong>
          </Row>
          <Row>
            <span>Open invoices</span>
            <strong>{openInvoices.length}</strong>
          </Row>
          <Row>
            <span>Quotes</span>
            <strong>{(data.quotes || []).length}</strong>
          </Row>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Invoices</h3>
          {(data.invoices || []).length === 0 && <Muted>No invoices shared on this link.</Muted>}
          {(data.invoices || []).map((inv) => (
            <Row key={inv.id || inv.invoiceNumber}>
              <div>
                <div style={{ fontWeight: 600 }}>{inv.invoiceNumber}</div>
                <Muted>Due {inv.dueDate || '—'} · {inv.status}</Muted>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{money(inv.total)}</div>
                <Muted>Balance {money(inv.balanceDue)}</Muted>
              </div>
            </Row>
          ))}
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>Quotes</h3>
          {(data.quotes || []).length === 0 && <Muted>No quotes shared on this link.</Muted>}
          {(data.quotes || []).map((q) => (
            <Row key={q.id || q.quoteNumber}>
              <div>
                <div style={{ fontWeight: 600 }}>{q.quoteNumber}</div>
                <Muted>{q.status}{q.validUntil ? ` · valid until ${q.validUntil}` : ''}</Muted>
              </div>
              <strong>{money(q.total)}</strong>
            </Row>
          ))}
        </Card>

        <Muted style={{ textAlign: 'center' }}>
          Read-only portal · expires {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'in 90 days'}
        </Muted>
      </Shell>
    </Page>
  );
}
