import React, { useEffect, useMemo, useState, useContext } from 'react';
import api from '../../../lib/api';
import './Dashboard.css';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isSameDay,
  differenceInMinutes,
  parse,
} from 'date-fns';
import { AuthContext } from '../../../context/AuthContext';

const times = Array.from({ length: 18 }, (_, i) => {
  const hour = 9 + Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [appointments, setAppointments] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Derived stats for the current week
  const weekStats = useMemo(() => {
    const countsByStatus = appointments.reduce((acc, appt) => {
      const key = (appt.status || 'unknown').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // pending = not completed and not cancelled
    const pendingCount = appointments.filter(appt => {
      const s = (appt.status || '').toLowerCase();
      return s !== 'completed' && s !== 'cancelled' && s !== 'canceled';
    }).length;

    return {
      total: appointments.length,
      pending: pendingCount,
      completed: countsByStatus['completed'] || 0,
      cancelled: countsByStatus['cancelled'] || countsByStatus['canceled'] || 0,
    };
  }, [appointments]);

  const fetchAppointments = async (controller) => {
    try {
      setLoading(true);
      setError('');
      const startDate = format(weekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(weekStart, 6), 'yyyy-MM-dd');

      const { data } = await api.get(
        `/api/appointments/week`,
        {
          params: { worker_id: user.id, start_date: startDate, end_date: endDate },
          signal: controller.signal,
        }
      );
      setAppointments(data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Failed to fetch appointments:', err);
        setError('Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    fetchAppointments(controller);
    return () => controller.abort();
  }, [weekStart, user?.id]);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  // Return the appointment that starts at this time
  const getAppointmentStartingAt = (day, time) => {
    return appointments.find(appt => {
      const apptDate = new Date(appt.date);
      const apptTime = appt.start_time.slice(0, 5); // HH:MM
      return isSameDay(apptDate, day) && apptTime === time;
    });
  };

  // Check if the time is inside an existing appointment's time range (but not the start)
  const isTimeInsideAppointment = (day, time) => {
    const timeDate = parse(time, 'HH:mm', new Date());

    return appointments.some(appt => {
      const apptDate = new Date(appt.date);
      if (!isSameDay(apptDate, day)) return false;

      const start = parse(appt.start_time.slice(0, 5), 'HH:mm', new Date());
      const end = parse(appt.end_time.slice(0, 5), 'HH:mm', new Date());

      return timeDate > start && timeDate < end;
    });
  };

  const getRowSpanForAppointment = (start, end) => {
    const startTime = parse(start.slice(0, 5), 'HH:mm', new Date());
    const endTime = parse(end.slice(0, 5), 'HH:mm', new Date());
    const minutes = differenceInMinutes(endTime, startTime);
    return Math.ceil(minutes / 30);
  };

  const handleCellClick = (day, time, appt) => {
    setSelectedCell({ day, time, appt });
  };

  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    setSelectedStatus(selectedCell?.appt?.status || 'booked');
  }, [selectedCell]);

  const handleSaveStatus = async () => {
    if (!selectedCell?.appt?.id) return;
    try {
      setLoading(true);
      await api.put(`/api/appointments/${selectedCell.appt.id}`, { status: selectedStatus });
      // refresh appointments
      const controller = new AbortController();
      await fetchAppointments(controller);
      setSelectedCell(null);
    } catch (err) {
      console.error('Failed to update status', err);
      setError('Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedCell?.appt?.id) return;
    const confirm = window.confirm('Are you sure you want to cancel this appointment? This will delete the appointment and remove the unavailable time.');
    if (!confirm) return;

    try {
      setLoading(true);
      await api.delete(`/api/appointments/${selectedCell.appt.id}`);
      // refresh appointments
      const controller = new AbortController();
      await fetchAppointments(controller);
      // reload the page to ensure full refresh
      window.location.reload();
      setSelectedCell(null);
    } catch (err) {
      console.error('Failed to delete appointment', err);
      setError('Failed to delete appointment');
    } finally {
      setLoading(false);
    }
  };

  const closeCanvas = () => {
    setSelectedCell(null);
  };

  if (!user || !user.id) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard-container-1">
      <div className="dashboard-header-1 week-of-header">
        <button className="nav-btn prev" onClick={() => setWeekStart(subWeeks(weekStart, 1))}>
          <span className="icon" aria-hidden>‹</span>
          <span className="label">Previous Week</span>
        </button>

        <div className="week-title">
          <div className="title">Week of</div>
          <div className="subtitle">{format(weekStart, 'MMM dd')} - {format(addDays(weekStart, 6), 'MMM dd')}</div>
        </div>

        <button className="nav-btn next" onClick={() => setWeekStart(addWeeks(weekStart, 1))}>
          <span className="label">Next Week</span>
          <span className="icon" aria-hidden>›</span>
        </button>
      </div>

      {/** Summary bar */}
      <div className="summary-bar">
        <div className="stat-card">
          <div className="stat-value">{weekStats.total}</div>
          <div className="stat-label">Appointments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekStats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekStats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{weekStats.cancelled}</div>
          <div className="stat-label">Cancelled</div>
        </div>
      </div>

      <div className="calendar-wrapper">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="time-col-header">Time</div>
            {days.map(day => (
              <div className={`day-col-header ${isSameDay(day, new Date()) ? 'today' : ''}`} key={format(day, 'yyyy-MM-dd')}>
                <strong>{format(day, 'EEEE')}</strong>
                <div>{format(day, 'MMM dd')}</div>
              </div>
            ))}
          </div>

          <div className="calendar-body">
            {times.map((time, rowIndex) => (
              <div className="calendar-row" key={time}>
                <div className="time-col">{format(parse(time, 'HH:mm', new Date()), 'h:mm a')}</div>

                {days.map(day => {
                  const appt = getAppointmentStartingAt(day, time);
                  const isInsideOther = isTimeInsideAppointment(day, time);
                  const isToday = isSameDay(day, new Date());

                  if (appt) {
                    const span = getRowSpanForAppointment(appt.start_time, appt.end_time);
                    return (
                      <div
                        key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                        className={`calendar-cell booked ${isToday ? 'today-col' : ''}`}
                        style={{ gridRow: `span ${span}` }}
                        onClick={() => handleCellClick(day, time, appt)}
                      >
                        <div className="appt-content">
                          <strong>{appt.client_name}</strong>
                          <div className="small-text">{appt.service_name}</div>
                          <div className="small-text appt-time">
                            {format(parse(appt.start_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm a')} - {format(parse(appt.end_time.slice(0, 5), 'HH:mm', new Date()), 'h:mm a')}
                          </div>
                          <div className={`status-badge status-${(appt.status || 'unknown').toLowerCase()}`}>{appt.status}</div>
                        </div>
                      </div>
                    );
                  } else if (isInsideOther) {
                    // Render an empty placeholder to hold spacing
                    return (
                      <div
                        key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                        className={`calendar-cell booked continuation ${isToday ? 'today-col' : ''}`}
                        style={{ backgroundColor: '#ffecec' }}
                      />
                    );
                  } else {
                    return (
                      <div
                        key={`${format(day, 'yyyy-MM-dd')}-${time}`}
                        className={`calendar-cell ${isToday ? 'today-col' : ''}`}
                        onClick={() => handleCellClick(day, time, null)}
                      />
                    );
                  }
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && <div style={{ padding: '0.5rem' }}>Loading...</div>}
      {error && <div style={{ color: 'red', padding: '0.5rem' }}>{error}</div>}
      {selectedCell && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeCanvas}>×</button>
            <h3>{selectedCell.appt ? 'Appointment Details' : 'Set Unavailable Time'}</h3>
            <p><strong>Date:</strong> {format(selectedCell.day, 'yyyy-MM-dd')}</p>
            <p><strong>Time:</strong> {selectedCell.time}</p>
            {selectedCell.appt ? (
              <>
                <p><strong>Client:</strong> {selectedCell.appt.client_name}</p>
                <p><strong>Phone:</strong> {selectedCell.appt.client_phone}</p>
                <p><strong>Message:</strong> {selectedCell.appt.message}</p>
                <p>
                  <strong>Status:</strong>
                  <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ marginLeft: '0.5rem' }}>
                    <option value="booked">Booked</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed ✅</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-danger" onClick={handleDeleteAppointment}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveStatus}>Save</button>
                </div>
              </>
            ) : (
              <p>You can set this time as unavailable (coming soon...)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
