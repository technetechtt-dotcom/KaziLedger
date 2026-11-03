import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { 
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX
} from 'react-icons/fi';
import { useAppointment } from '../context/AppointmentContext';
import { useCustomer } from '../context/CustomerContext';
import { useFinancialData } from '../context/FinancialDataContext';

const AppointmentsContainer = styled.div`
  padding: 1rem;
  max-width: 480px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 0 0.5rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #1e293b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const CalendarSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MonthYear = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const DaysOfWeek = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DayHeader = styled.div`
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem 0;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const DayButton = styled.button`
  aspect-ratio: 1;
  border: none;
  background: ${props => props.selected ? '#14b8a6' : 'transparent'};
  color: ${props => props.selected ? 'white' : props.inactive ? '#d1d5db' : '#1e293b'};
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.selected ? '#14b8a6' : '#f1f5f9'};
  }
`;

const ScheduleSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
`;

const ScheduleTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
`;

const AppointmentCard = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const AppointmentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #f0fdfa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #14b8a6;
  font-size: 1.25rem;
`;

const AppointmentContent = styled.div`
  flex: 1;
`;

const AppointmentTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
`;

const AppointmentTime = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
`;

const AppointmentActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const IconBtn = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
  }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 100px;
  right: 1rem;
  width: 56px;
  height: 56px;
  background: #14b8a6;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    background: #0d9488;
  }
  
  @media (min-width: 768px) {
    bottom: 2rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 0.85rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.35rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 70px;
`;

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const emptyForm = {
  title: '',
  customerId: '',
  serviceId: '',
  appointmentDate: '',
  appointmentTime: '09:00',
  notes: ''
};

export default function Appointments() {
  const {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    loading
  } = useAppointment();
  const { customers } = useCustomer();
  const { products } = useFinancialData();

  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
      days.push({ day: i, inactive: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const selected =
        selectedDate.getFullYear() === year &&
        selectedDate.getMonth() === month &&
        selectedDate.getDate() === i;
      days.push({ day: i, inactive: false, selected });
    }
    return days;
  }, [year, month, selectedDate]);

  const services = products.filter(
    p => p.itemType === 'service' || p.itemType === 'consultation'
  );

  const dayAppointments = getAppointmentsByDate(selectedDate);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      appointmentDate: selectedDate.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEdit = (appointment) => {
    setEditing(appointment);
    const d = new Date(appointment.appointmentDate || appointment.date);
    setForm({
      title: appointment.title || '',
      customerId: appointment.customerId || '',
      serviceId: appointment.serviceId || '',
      appointmentDate: Number.isNaN(d.getTime())
        ? selectedDate.toISOString().split('T')[0]
        : d.toISOString().split('T')[0],
      appointmentTime: appointment.appointmentTime || appointment.time || '09:00',
      notes: appointment.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.appointmentDate) {
      alert('Please enter a title and date');
      return;
    }

    const customer = customers.find(c => c.id === form.customerId);
    const service = products.find(p => p.id === form.serviceId);
    const payload = {
      title: form.title,
      customerId: form.customerId || null,
      customerName: customer?.name || '',
      serviceId: form.serviceId || null,
      serviceName: service?.name || '',
      appointmentDate: form.appointmentDate,
      appointmentTime: form.appointmentTime,
      time: form.appointmentTime,
      notes: form.notes || '',
      status: 'scheduled'
    };

    const result = editing
      ? await updateAppointment(editing.id, payload)
      : await addAppointment(payload);

    if (result.success) {
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
    } else {
      alert('Failed to save appointment: ' + (result.error || 'Unknown error'));
    }
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm(`Delete appointment "${appointment.title}"?`)) return;
    const result = await deleteAppointment(appointment.id);
    if (!result.success) {
      alert('Failed to delete: ' + result.error);
    }
  };

  const monthLabel = viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const scheduleLabel = selectedDate.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <AppointmentsContainer>
      <TopBar>
        <BackButton onClick={() => window.history.back()}>
          <FiArrowLeft />
        </BackButton>
        <Title>Appointments</Title>
        <IconBtn onClick={openCreate} title="Add appointment">
          <FiPlus />
        </IconBtn>
      </TopBar>

      <CalendarSection>
        <CalendarHeader>
          <NavButton onClick={() => setViewDate(new Date(year, month - 1, 1))}>
            <FiChevronLeft />
          </NavButton>
          <MonthYear>{monthLabel}</MonthYear>
          <NavButton onClick={() => setViewDate(new Date(year, month + 1, 1))}>
            <FiChevronRight />
          </NavButton>
        </CalendarHeader>

        <DaysOfWeek>
          {daysOfWeek.map((day, index) => (
            <DayHeader key={index}>{day}</DayHeader>
          ))}
        </DaysOfWeek>

        <CalendarGrid>
          {calendarDays.map((dayData, index) => (
            <DayButton
              key={index}
              selected={dayData.selected}
              inactive={dayData.inactive}
              onClick={() => {
                if (dayData.inactive) return;
                setSelectedDate(new Date(year, month, dayData.day));
              }}
            >
              {dayData.day}
            </DayButton>
          ))}
        </CalendarGrid>
      </CalendarSection>

      <ScheduleSection>
        <ScheduleTitle>{scheduleLabel}</ScheduleTitle>
        {loading && <AppointmentTime>Loading…</AppointmentTime>}
        {!loading && dayAppointments.length === 0 && (
          <AppointmentTime>No appointments for this day</AppointmentTime>
        )}
        {dayAppointments.map((appointment) => (
          <AppointmentCard key={appointment.id}>
            <AppointmentIcon>
              <FiCalendar />
            </AppointmentIcon>
            <AppointmentContent>
              <AppointmentTitle>{appointment.title}</AppointmentTitle>
              <AppointmentTime>
                {appointment.appointmentTime || appointment.time || '—'}
                {appointment.customerName ? ` · ${appointment.customerName}` : ''}
                {appointment.serviceName ? ` · ${appointment.serviceName}` : ''}
              </AppointmentTime>
            </AppointmentContent>
            <AppointmentActions>
              <IconBtn onClick={() => openEdit(appointment)} title="Edit">
                <FiEdit2 />
              </IconBtn>
              <IconBtn onClick={() => handleDelete(appointment)} title="Delete">
                <FiTrash2 />
              </IconBtn>
            </AppointmentActions>
          </AppointmentCard>
        ))}
      </ScheduleSection>

      <FloatingActionButton onClick={openCreate} title="Add appointment">
        <FiPlus />
      </FloatingActionButton>

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <Title style={{ fontSize: '1.125rem' }}>{editing ? 'Edit Appointment' : 'New Appointment'}</Title>
              <IconBtn onClick={() => setShowModal(false)}><FiX /></IconBtn>
            </div>
            <form onSubmit={handleSave}>
              <FormGroup>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Customer</Label>
                <Select
                  value={form.customerId}
                  onChange={(e) => setForm(prev => ({ ...prev, customerId: e.target.value }))}
                >
                  <option value="">Optional</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Service / Consultation</Label>
                <Select
                  value={form.serviceId}
                  onChange={(e) => {
                    const service = products.find(p => p.id === e.target.value);
                    setForm(prev => ({
                      ...prev,
                      serviceId: e.target.value,
                      title: prev.title || service?.name || ''
                    }));
                  }}
                >
                  <option value="">Optional</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.itemType})
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) => setForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.appointmentTime}
                  onChange={(e) => setForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                />
              </FormGroup>
              <FormGroup>
                <Label>Notes</Label>
                <TextArea
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </FormGroup>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <IconBtn type="button" onClick={() => setShowModal(false)}>Cancel</IconBtn>
                <button
                  type="submit"
                  style={{
                    background: '#14b8a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}
    </AppointmentsContainer>
  );
}
