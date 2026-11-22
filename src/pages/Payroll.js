import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  FiArrowLeft,
  FiPlus,
  FiTrash2,
  FiDownload,
  FiMail,
  FiClock,
  FiPlay,
  FiSquare
} from 'react-icons/fi';
import { useAccountingExtensions } from '../context/AccountingExtensionsContext';
import { useFinancialData } from '../context/FinancialDataContext';
import { useFirebaseBusiness } from '../context/FirebaseBusinessContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'react-toastify';
import { downloadExcel, stamp } from '../utils/downloadExport';
import { downloadPayslipPdf, generatePayslipPdf } from '../utils/payslipPdf';

const Page = styled.div`padding: 1rem; max-width: 1100px; margin: 0 auto; padding-bottom: 4rem;`;
const Card = styled.div`background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;`;
const Input = styled.input`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%;`;
const Select = styled.select`padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 100%; background: white;`;
const Button = styled.button`
  background: ${p => (p.$secondary ? 'white' : '#14b8a6')};
  color: ${p => (p.$secondary ? '#334155' : 'white')};
  border: 1px solid ${p => (p.$secondary ? '#e2e8f0' : '#14b8a6')};
  border-radius: 6px; padding: 0.6rem 1rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.35rem;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const Label = styled.label`font-size: 0.8rem; font-weight: 500; display: block; margin-bottom: 0.25rem;`;
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 0.875rem; th, td { padding: 0.5rem; border-bottom: 1px solid #e2e8f0; text-align: left; }`;
const Row = styled.div`display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: end;`;

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function Payroll() {
  const {
    employees,
    payRuns,
    timeEntries,
    addEmployee,
    deleteEmployee,
    runPayroll,
    clockIn,
    clockOut,
    addTimeEntry,
    deleteTimeEntry,
    getHoursForEmployee
  } = useAccountingExtensions();
  const { addExpense } = useFinancialData();
  const { business, user } = useFirebaseBusiness();
  const { formatCurrency } = useCurrency();

  const [form, setForm] = useState({ name: '', role: '', salary: '', email: '' });
  const [period, setPeriod] = useState({
    periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    periodEnd: new Date().toISOString().split('T')[0]
  });
  const [manualTime, setManualTime] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '08:00',
    clockOut: '17:00',
    notes: ''
  });

  const sortedTime = useMemo(
    () => [...timeEntries].sort((a, b) => new Date(b.clockIn || b.date || 0) - new Date(a.clockIn || a.date || 0)),
    [timeEntries]
  );

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
      sourceId: result.id,
      skipGl: true
    });

    toast.success(`Pay run posted. Gross ${formatCurrency(result.totals.gross)}`);
  };

  const exportEmployees = () => {
    downloadExcel(
      `Payroll_Employees_${stamp()}.xlsx`,
      employees.map((e) => ({
        Name: e.name,
        Role: e.role || '',
        Email: e.email || '',
        Salary: e.salary || 0,
        Status: e.status || 'active'
      })),
      'Employees'
    );
    toast.success('Employees Excel downloaded');
  };

  const exportPayRuns = () => {
    const rows = [];
    payRuns.forEach((run) => {
      (run.lines || []).forEach((line) => {
        rows.push({
          PeriodStart: run.periodStart,
          PeriodEnd: run.periodEnd,
          Employee: line.employeeName,
          Gross: line.gross,
          Tax: line.tax,
          UIF: line.uif,
          Net: line.net,
          Hours: getHoursForEmployee(line.employeeId, run.periodStart, run.periodEnd)
        });
      });
    });
    downloadExcel(`Payroll_PayRuns_${stamp()}.xlsx`, rows, 'PayRuns');
    toast.success('Pay runs Excel downloaded');
  };

  const exportTimesheets = () => {
    downloadExcel(
      `Payroll_Timesheets_${stamp()}.xlsx`,
      sortedTime.map((t) => ({
        Employee: t.employeeName,
        Date: t.date,
        ClockIn: t.clockIn ? new Date(t.clockIn).toLocaleString() : '',
        ClockOut: t.clockOut ? new Date(t.clockOut).toLocaleString() : '',
        Hours: t.hours || 0,
        Status: t.status,
        Notes: t.notes || ''
      })),
      'Timesheets'
    );
    toast.success('Timesheets Excel downloaded');
  };

  const buildPayslip = (run, line) => {
    const employee = employees.find((e) => e.id === line.employeeId) || {
      name: line.employeeName,
      email: '',
      role: ''
    };
    const hours = getHoursForEmployee(line.employeeId, run.periodStart, run.periodEnd);
    return generatePayslipPdf({
      businessName: business?.name || business?.businessName || 'KaziLedger',
      businessEmail: business?.email || business?.businessEmail || user?.email || '',
      employee,
      periodStart: run.periodStart,
      periodEnd: run.periodEnd,
      line,
      hoursWorked: hours || null
    });
  };

  const downloadPayslip = (run, line) => {
    const pdf = buildPayslip(run, line);
    downloadPayslipPdf(pdf, `Payslip_${(line.employeeName || 'employee').replace(/\s+/g, '_')}_${run.periodEnd}.pdf`);
    toast.success('Payslip downloaded');
  };

  const sendPayslip = (run, line) => {
    const employee = employees.find((e) => e.id === line.employeeId);
    const email = employee?.email || '';
    downloadPayslip(run, line);
    if (!email) {
      toast.info('Payslip downloaded. Add an employee email to send.');
      return;
    }
    const subject = encodeURIComponent(`Payslip ${run.periodStart} to ${run.periodEnd}`);
    const body = encodeURIComponent(
      `Hi ${line.employeeName},\n\nPlease find your payslip for ${run.periodStart} to ${run.periodEnd}.\n` +
      `Gross: R${Number(line.gross || 0).toFixed(2)}\n` +
      `Net: R${Number(line.net || 0).toFixed(2)}\n\n` +
      `The PDF was downloaded — attach it to this email before sending.\n\nRegards,\n${business?.name || 'Payroll'}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleManualTime = async (e) => {
    e.preventDefault();
    if (!manualTime.employeeId) return alert('Select an employee');
    const clockIn = `${manualTime.date}T${manualTime.clockIn}:00`;
    const clockOut = `${manualTime.date}T${manualTime.clockOut}:00`;
    const result = await addTimeEntry({
      employeeId: manualTime.employeeId,
      date: manualTime.date,
      clockIn,
      clockOut,
      notes: manualTime.notes
    });
    if (result.success) {
      toast.success('Time entry saved');
      setManualTime((p) => ({ ...p, notes: '' }));
    } else alert(result.error);
  };

  return (
    <Page>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={() => window.history.back()} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <FiArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0 }}>Payroll</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Employees, timesheets, payslips, and pay runs</p>
          </div>
        </div>
        <Row>
          <Button type="button" $secondary onClick={exportEmployees}><FiDownload /> Employees</Button>
          <Button type="button" $secondary onClick={exportPayRuns}><FiDownload /> Pay runs</Button>
          <Button type="button" $secondary onClick={exportTimesheets}><FiDownload /> Timesheets</Button>
        </Row>
      </div>

      <Card>
        <h3 style={{ marginTop: 0 }}>Add employee</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.5rem' }}>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label>Role</Label><Input value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} /></div>
          <div><Label>Monthly salary</Label><Input type="number" step="0.01" value={form.salary} onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))} required /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="for payslip send" /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add</Button></div>
        </form>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Employees</h3>
        <Table>
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Salary</th><th>Email</th><th>Time</th><th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const open = timeEntries.some((t) => t.employeeId === emp.id && t.status === 'open');
              return (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>{emp.role || '—'}</td>
                  <td>{formatCurrency(emp.salary || 0)}</td>
                  <td>{emp.email || '—'}</td>
                  <td>
                    {open ? (
                      <Button type="button" $secondary onClick={async () => {
                        const r = await clockOut(emp.id);
                        if (r.success) toast.success(`Clocked out (${r.hours}h)`);
                        else alert(r.error);
                      }}>
                        <FiSquare /> Clock out
                      </Button>
                    ) : (
                      <Button type="button" onClick={async () => {
                        const r = await clockIn(emp.id);
                        if (r.success) toast.success('Clocked in');
                        else alert(r.error);
                      }}>
                        <FiPlay /> Clock in
                      </Button>
                    )}
                  </td>
                  <td>
                    <button type="button" onClick={() => deleteEmployee(emp.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {employees.length === 0 && <p style={{ color: '#64748b' }}>No employees yet</p>}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}><FiClock /> Time & date capture</h3>
        <form onSubmit={handleManualTime} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <Label>Employee</Label>
            <Select value={manualTime.employeeId} onChange={(e) => setManualTime((p) => ({ ...p, employeeId: e.target.value }))} required>
              <option value="">Select…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Select>
          </div>
          <div><Label>Date</Label><Input type="date" value={manualTime.date} onChange={(e) => setManualTime((p) => ({ ...p, date: e.target.value }))} required /></div>
          <div><Label>Clock in</Label><Input type="time" value={manualTime.clockIn} onChange={(e) => setManualTime((p) => ({ ...p, clockIn: e.target.value }))} required /></div>
          <div><Label>Clock out</Label><Input type="time" value={manualTime.clockOut} onChange={(e) => setManualTime((p) => ({ ...p, clockOut: e.target.value }))} required /></div>
          <div><Label>Notes</Label><Input value={manualTime.notes} onChange={(e) => setManualTime((p) => ({ ...p, notes: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="submit"><FiPlus /> Add entry</Button></div>
        </form>
        <Table>
          <thead>
            <tr><th>Employee</th><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {sortedTime.slice(0, 40).map((t) => (
              <tr key={t.id}>
                <td>{t.employeeName}</td>
                <td>{t.date}</td>
                <td>{formatDateTime(t.clockIn)}</td>
                <td>{formatDateTime(t.clockOut)}</td>
                <td>{Number(t.hours || 0).toFixed(2)}</td>
                <td>{t.status}</td>
                <td>
                  <button type="button" onClick={() => deleteTimeEntry(t.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {sortedTime.length === 0 && <p style={{ color: '#64748b' }}>No time entries yet — use Clock in or add a manual entry.</p>}
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Run payroll</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <div><Label>Period start</Label><Input type="date" value={period.periodStart} onChange={(e) => setPeriod((p) => ({ ...p, periodStart: e.target.value }))} /></div>
          <div><Label>Period end</Label><Input type="date" value={period.periodEnd} onChange={(e) => setPeriod((p) => ({ ...p, periodEnd: e.target.value }))} /></div>
          <div style={{ alignSelf: 'end' }}><Button type="button" onClick={handleRun}>Post pay run</Button></div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Uses SARS 2025/26 PAYE brackets + primary rebate, and 1% UIF (capped). Posts GL journal. Payslips include captured hours.
        </p>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>SARS payroll filing checklist</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          After each pay run, complete these declarations on SARS eFiling / e@syFile. Figures below are from your latest posted run.
        </p>
        {payRuns[0] ? (
          <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Latest run {payRuns[0].periodStart} → {payRuns[0].periodEnd}: PAYE {formatCurrency(payRuns[0].totals?.tax || 0)} · UIF {formatCurrency(payRuns[0].totals?.uif || 0)} · Net {formatCurrency(payRuns[0].totals?.net || 0)}
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>Post a pay run to populate EMP201 amounts.</p>
        )}
        <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
          <li>EMP201 — declare PAYE / UIF / SDL for the month</li>
          <li>Pay over deductions to SARS by the due date</li>
          <li>Issue payslips to employees (use Download / Send above)</li>
          <li>IRP5 / IT3(a) — annual employees&apos; tax certificates</li>
          <li>Reconcile payroll GL (5200 / 2200 / 2100) to EMP201</li>
        </ul>
        <a href="https://www.sarsefiling.co.za/" target="_blank" rel="noopener noreferrer" style={{ color: '#0f766e', fontSize: '0.875rem' }}>
          Open SARS eFiling →
        </a>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0 }}>Pay runs & payslips</h3>
        {payRuns.map((run) => (
          <div key={run.id} style={{ padding: '0.85rem 0', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{run.periodStart} → {run.periodEnd}</strong>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Gross {formatCurrency(run.totals?.gross || 0)} · Tax {formatCurrency(run.totals?.tax || 0)} · Net {formatCurrency(run.totals?.net || 0)}
            </div>
            <Table>
              <thead>
                <tr><th>Employee</th><th>Gross</th><th>Net</th><th>Hours</th><th>Payslip</th></tr>
              </thead>
              <tbody>
                {(run.lines || []).map((line) => (
                  <tr key={`${run.id}-${line.employeeId}`}>
                    <td>{line.employeeName}</td>
                    <td>{formatCurrency(line.gross || 0)}</td>
                    <td>{formatCurrency(line.net || 0)}</td>
                    <td>{getHoursForEmployee(line.employeeId, run.periodStart, run.periodEnd).toFixed(2)}</td>
                    <td>
                      <Row>
                        <Button type="button" $secondary onClick={() => downloadPayslip(run, line)}>
                          <FiDownload /> PDF
                        </Button>
                        <Button type="button" onClick={() => sendPayslip(run, line)}>
                          <FiMail /> Send
                        </Button>
                      </Row>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ))}
        {payRuns.length === 0 && <p style={{ color: '#64748b' }}>No pay runs yet</p>}
      </Card>
    </Page>
  );
}
