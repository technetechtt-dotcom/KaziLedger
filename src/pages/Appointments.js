import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiMoreVertical,
  FiPlus
} from 'react-icons/fi';
import { useAppointment } from '../context/AppointmentContext';

const AppointmentsContainer = styled.div`
  padding: 1rem;
  max-width: 400px;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

const AppointmentActions = styled.button`
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
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &:hover {
    background: #0d9488;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;


// Appointments are now loaded from Firebase via the useAppointment hook

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Generate calendar days for May 2024
const generateCalendarDays = (selectedDay = 13) => {
  const days = [];
  const firstDay = new Date(2024, 4, 1).getDay(); // May 1, 2024
  const daysInMonth = 31;
  const daysInPrevMonth = 30; // April has 30 days
  
  // Add previous month's days (greyed out)
  for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
    days.push({ day: i, inactive: true });
  }
  
  // Add current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, inactive: false, selected: i === selectedDay });
  }
  
  return days;
};

export default function Appointments() {
  // eslint-disable-next-line no-unused-vars
  const { appointments, addAppointment, getAppointmentsByDate, loading } = useAppointment();
  const [selectedDate, setSelectedDate] = useState(13);
  const calendarDays = generateCalendarDays(selectedDate);

  const handleAddAppointment = () => {
    console.log('Add new appointment');
  };

  return (
    <AppointmentsContainer>
      <TopBar>
        <BackButton>
          <FiArrowLeft />
        </BackButton>
        <Title>Appointments</Title>
        <div></div>
      </TopBar>

      <CalendarSection>
        <CalendarHeader>
          <NavButton>
            <FiChevronLeft />
          </NavButton>
          <MonthYear>May 2024</MonthYear>
          <NavButton>
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
              onClick={() => !dayData.inactive && setSelectedDate(dayData.day)}
            >
              {dayData.day}
            </DayButton>
          ))}
        </CalendarGrid>
      </CalendarSection>

      <ScheduleSection>
        <ScheduleTitle>Today's Schedule</ScheduleTitle>
        {appointments.map((appointment) => (
          <AppointmentCard key={appointment.id}>
            <AppointmentIcon>
              <FiCalendar />
            </AppointmentIcon>
            <AppointmentContent>
              <AppointmentTitle>{appointment.title}</AppointmentTitle>
              <AppointmentTime>{appointment.time}</AppointmentTime>
            </AppointmentContent>
            <AppointmentActions>
              <FiMoreVertical />
            </AppointmentActions>
          </AppointmentCard>
        ))}
      </ScheduleSection>

      <FloatingActionButton onClick={handleAddAppointment}>
        <FiPlus />
      </FloatingActionButton>
    </AppointmentsContainer>
  );
}