import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCustomer } from '../context/CustomerContext';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 1100px; margin: 0 auto;`;
const Grid = styled.div`display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; @media (max-width: 900px) { grid-template-columns: 1fr; }`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem;`;
const ProductGrid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; max-height: 70vh; overflow: auto;`;
const ProductBtn = styled.button`
  border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; padding: 0.75rem; text-align: left; cursor: pointer;
  &:hover { border-color: #14b8a6; background: #f0fdfa; }
`;
const Button = styled.button`background: ${p => p.secondary ? '#64748b' : '#14b8a6'}; color: white; border: none; border-radius: 6px; padding: 0.75rem 1rem; cursor: pointer; width: 100%;`;
const Select = styled.select`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white; margin-bottom: 0.75rem;`;

export default function POS() {
  const { products, addInvoice, addIncome, updateProduct, addStockMovement } = useFinancialData();
  const { customers } = useCustomer();
  const { postJournal, convertAmount, fxRates, baseCurrency } = useAccountingExtensions();
  const { formatCurrency } = useCurrency();
  const [cart, setCart] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [currency, setCurrency] = useState(baseCurrency || 'ZAR');
  const [tendered, setTendered] = useState('');

  const sellable = useMemo(
    () => products.filter((p) => p.status !== 'inactive'),
    [products]
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price }
            : i
        );
      }
      const price = parseFloat(product.price ?? product.unitPrice ?? 0) || 0;
      return [...prev, {
        productId: product.id,
        name: product.name,
        itemType: product.itemType || 'product',
        quantity: 1,
        price,
        total: price
      }];
    });
  };

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const vatRate = 15;
  const vatAmount = +(subtotal * (vatRate / 100)).toFixed(2);
  const total = +(subtotal + vatAmount).toFixed(2);
  const totalInBase = convertAmount(total, currency, baseCurrency || 'ZAR');

  const checkout = async (markPaid) => {
    if (!cart.length) return alert('Cart is empty');
    const customer = customers.find((c) => c.id === customerId);
    const invoiceNumber = `POS-${Date.now().toString().slice(-6)}`;
    const invoiceData = {
      invoiceNumber,
      type: 'invoice',
      source: 'pos',
      customerId: customer?.id || null,
      clientName: customer?.name || 'Walk-in customer',
      clientEmail: customer?.email || '',
      currency,
      exchangeRate: convertAmount(1, currency, baseCurrency || 'ZAR'),
      items: cart,
      amount: totalInBase,
      total: totalInBase,
      foreignAmount: total,
      amountPaid: markPaid ? totalInBase : 0,
      balanceDue: markPaid ? 0 : totalInBase,
      payments: markPaid
        ? [{ id: `pay_${Date.now()}`, amount: totalInBase, date: new Date().toISOString().split('T')[0], method: 'pos', notes: 'POS sale' }]
        : [],
      vatRate,
      vatAmount: convertAmount(vatAmount, currency, baseCurrency || 'ZAR'),
      description: `POS sale ${invoiceNumber}`,
      status: markPaid ? 'paid' : 'pending',
      dueDate: new Date().toISOString().split('T')[0],
      invoiceDate: new Date().toISOString().split('T')[0]
    };

    const result = await addInvoice(invoiceData);
    if (!result.success) return alert(result.error);

    for (const item of cart) {
      if (item.itemType !== 'product') continue;
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const prevQty = product.quantity || product.currentStock || 0;
      const nextQty = Math.max(0, prevQty - item.quantity);
      await updateProduct(item.productId, { quantity: nextQty, currentStock: nextQty });
      await addStockMovement({
        productId: item.productId,
        productName: item.name,
        type: 'out',
        quantity: item.quantity,
        previousQuantity: prevQty,
        newQuantity: nextQty,
        reference: invoiceNumber,
        notes: 'POS sale'
      });
    }

    if (markPaid) {
      await addIncome({
        amount: totalInBase,
        date: new Date().toISOString().split('T')[0],
        category: 'POS Sales',
        product: customer?.name || 'Walk-in',
        notes: `POS ${invoiceNumber}`,
        source: 'pos',
        sourceId: result.id
      });
    }

    await postJournal({
      memo: `POS ${invoiceNumber}`,
      date: new Date().toISOString().split('T')[0],
      lines: markPaid
        ? [
            { accountCode: '1000', debit: totalInBase, credit: 0, memo: 'Cash/bank' },
            { accountCode: '4000', debit: 0, credit: convertAmount(subtotal, currency, baseCurrency || 'ZAR'), memo: 'Sales' },
            { accountCode: '2100', debit: 0, credit: convertAmount(vatAmount, currency, baseCurrency || 'ZAR'), memo: 'VAT' }
          ]
        : [
            { accountCode: '1100', debit: totalInBase, credit: 0, memo: 'AR' },
            { accountCode: '4000', debit: 0, credit: convertAmount(subtotal, currency, baseCurrency || 'ZAR'), memo: 'Sales' },
            { accountCode: '2100', debit: 0, credit: convertAmount(vatAmount, currency, baseCurrency || 'ZAR'), memo: 'VAT' }
          ]
    });

    toast.success(markPaid ? 'Sale completed (paid)' : 'Sale saved as unpaid invoice');
    setCart([]);
    setTendered('');
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Point of Sale</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Quick sales with stock, VAT, and GL posting</p>
        </div>
      </div>

      <Grid>
        <Card>
          <h3 style={{ marginTop: 0 }}>Products / Services</h3>
          <ProductGrid>
            {sellable.map((p) => (
              <ProductBtn key={p.id} type="button" onClick={() => addToCart(p)}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: '#0f766e' }}>{formatCurrency(p.price ?? p.unitPrice ?? 0)}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.itemType || 'product'}</div>
              </ProductBtn>
            ))}
          </ProductGrid>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}><FiShoppingCart /> Cart</h3>
          <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">Walk-in customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {(fxRates.length ? fxRates : [{ code: 'ZAR' }, { code: 'USD' }, { code: 'EUR' }, { code: 'GBP' }]).map((r) => (
              <option key={r.code} value={r.code}>{r.code}</option>
            ))}
          </Select>

          {cart.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '0.8rem' }}>
                  <button type="button" onClick={() => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1), total: Math.max(1, i.quantity - 1) * i.price } : i))}>-</button>
                  {' '}{item.quantity}{' '}
                  <button type="button" onClick={() => setCart((prev) => prev.map((i) => i.productId === item.productId ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i))}><FiPlus /></button>
                  {' '}× {formatCurrency(item.price)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{formatCurrency(item.total)}</div>
                <button type="button" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>VAT {vatRate}%</span><span>{formatCurrency(vatAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.35rem' }}>
              <span>Total ({currency})</span><span>{formatCurrency(total)}</span>
            </div>
            {currency !== (baseCurrency || 'ZAR') && (
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>≈ {formatCurrency(totalInBase)} {baseCurrency || 'ZAR'}</div>
            )}
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <label style={{ fontSize: '0.8rem' }}>Cash tendered (optional)</label>
            <input
              type="number"
              step="0.01"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', borderRadius: 6, border: '1px solid #d1d5db', marginTop: 4 }}
            />
            {tendered && (
              <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                Change: {formatCurrency(Math.max(0, parseFloat(tendered) - total))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
            <Button type="button" onClick={() => checkout(true)}>Charge / Mark paid</Button>
            <Button type="button" secondary onClick={() => checkout(false)}>Save as unpaid invoice</Button>
          </div>
        </Card>
      </Grid>
    </Page>
  );
}
