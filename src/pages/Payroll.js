import React, { useState } from 'react';
import styled from 'styled-components';
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';

const Page = styled.div`padding: 1rem; max-width: 960px; margin: 0 auto;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Button = styled.button`background: #14b8a6; color: white; border: none; border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer;`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; display: block; margin-bottom: 0.25rem;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;

export default function Payroll() {
  const { employees, payRuns, addEmployee, deleteEmployee, runPayroll } = useAccountingExtensions();
  const { addExpense } = useFinancialData();
  const { formatCurrency } = useCurrency();
  const [form, setForm] = useState({ name: '', role: '', salary: '', email: '' });
  const [period, setPeriod] = useState({
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0]
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    const result = await addEmployee(form);
    if (result.success) {
      toast.success('Employee added');
      setForm({ name: '', role: '', salary: '', email: '' });
    } else alert(result.error);
  };

  const handleRun = async () => {
    const result = await runPayroll(period);
    if (!result.success) return alert(result.error);

    await addExpense({
      amount: result.totals.net,
      date: period.periodEnd,
      category: 'Payroll',
      vendor: 'Payroll run',
      notes: `Net salaries ${period.periodStart} to ${period.periodEnd}`,
      source: 'payroll',
      sourceId: result.id
    });

    toast.success(`Pay run posted. Gross ${formatCurrency(result.totals.gross)}`);
  };

  return (
    <Page>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <FiArrowLeft />
        </button>
        <div>
          <h1 style={{ margin: 0 }}>Payroll</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Employees, pay runs, and GL salary posting (simple PAYE/UIF estimate)</p>
        </div>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Add employee</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.5rem' }}>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} /></div>
          <div><Label>Monthly salary</Label><Input type="number" step="0.01" value={form.salary} onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add</Button></div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Employees</h3>
        <Table>
          <thead><tr><th>Name</th><th>Role</th><th>Salary</th><th></th></tr></thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.role || '—'}</td>
                <td>{formatCurrency(emp.salary || 0)}</td>
                <td>
                  <button type="button" onClick={() => deleteEmployee(emp.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {employees.length === 0 && <p style={{ color: '#64748b' }}>No employees yet</p>}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Run payroll</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div><Label>Period start</Label><Input type="date" value={period.periodStart} onChange={(e) => setPeriod((p) => ({ ...p, periodStart: e.target.value }))} /></div>
          <div><Label>Period end</Label><Input type="date" value={period.periodEnd} onChange={(e) => setPeriod((p) => ({ ...p, periodEnd: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="button" onClick={handleRun}>Post pay run</Button></div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Uses 18% PAYE estimate + 1% UIF on gross. Posts GL journal and creates a net payroll expense.
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Recent pay runs</h3>
        {payRuns.map((run) => (
          <div key={run.id} style={{ padding: '0.75rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{run.periodStart} → {run.periodEnd}</strong>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Gross {formatCurrency(run.totals?.gross || 0)} · Tax {formatCurrency(run.totals?.tax || 0)} · Net {formatCurrency(run.totals?.net || 0)}
            </div>
          </div>
        ))}
        {payRuns.length === 0 && <p style={{ color: '#64748b' }}>No pay runs yet</p>}
      </Card>
    </Page>
  );
}
