import { getAppointmentsByWorkerAndDate, getAppointmentById, updateAppointmentStatus, deleteAppointment } from '../models/appointmentModel.js';
import { getUnavailableTimes, blockUnavailableTime, deleteUnavailableTime } from '../models/unavailableModel.js';

export async function fetchAvailability(req, res) {
  const { worker_id, date } = req.query;
  if (!worker_id || !date) {
    return res.status(400).json({ error: 'Missing worker_id or date' });
  }

  try {
    const [appointments, blocks] = await Promise.all([
      getAppointmentsByWorkerAndDate(req.db, worker_id, date),
      getUnavailableTimes(req.db, worker_id, date),
    ]);

    res.json({ appointments, blocks });
  } catch (e) {
    console.error('Error fetching availability:', e);
    res.status(500).json({ error: 'Server error' });
  }
}

export async function bookAppointment(req, res) {
  const {
    client_name,
    client_phone,
    message,
    service_id,
    worker_id,
    date,
    start_time,
  } = req.body;

  try {
    // Get service duration
    const [[service]] = await req.db.promise().query(
      `SELECT duration_minutes FROM services WHERE id = ?`,
      [service_id]
    );

    if (!service) {
      return res.status(400).json({ error: 'Invalid service selected' });
    }

    const duration = service.duration_minutes;

    // Convert start_time string (e.g., "2:00 PM") to minutes
    const toMinutes = (time) => {
      const [timePart, ampm] = time.split(' ');
      let [hour, minute] = timePart.split(':').map(Number);
      if (ampm === 'PM' && hour !== 12) hour += 12;
      if (ampm === 'AM' && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    // Convert minutes back to HH:MM format
    const fromMinutes = (total) => {
      const h = Math.floor(total / 60);
      const m = total % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const startMinutes = toMinutes(start_time);
    const endMinutes = startMinutes + duration;

    const start_time_mysql = fromMinutes(startMinutes);
    const end_time_mysql = fromMinutes(endMinutes);

    // Insert appointment
    const [result] = await req.db.promise().query(
      `INSERT INTO appointments 
        (client_name, client_phone, message, service_id, worker_id, date, start_time, end_time, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'booked', NOW())`,
      [
        client_name,
        client_phone,
        message,
        service_id,
        worker_id,
        date,
        start_time_mysql,
        end_time_mysql,
      ]
    );

    // Add to unavailable_times
    await blockUnavailableTime(req.db, {
      workerId: worker_id,
      date,
      startTime: start_time_mysql,
      endTime: end_time_mysql,
      reason: 'Auto-blocked by appointment',
    });

    res.json({ success: true, appointmentId: result.insertId });
  } catch (error) {
    console.error('Booking failed:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
}

export async function fetchAppointmentsForWeek(req, res) {
  const { worker_id, start_date, end_date } = req.query;

  if (!worker_id || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing worker_id, start_date, or end_date' });
  }

  try {
    const [appointments] = await req.db.promise().query(
      `SELECT a.id, a.date, a.start_time, a.end_time, a.status, 
              a.client_name, a.client_phone, a.message, 
              s.title AS service_name 
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.worker_id = ? AND a.date BETWEEN ? AND ?
       ORDER BY a.date, a.start_time`,
      [worker_id, start_date, end_date]
    );

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching weekly appointments:', err);
    res.status(500).json({ error: 'Server error while fetching weekly appointments' });
  }
}

export async function updateAppointment(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!id || !status) return res.status(400).json({ error: 'id and status required' });

  try {
    const affected = await updateAppointmentStatus(req.db, id, status);
    if (!affected) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
}

export async function removeAppointment(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    // Fetch appointment to know the worker/date/time to remove unavailable_time
    const appt = await getAppointmentById(req.db, id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });

    // Delete appointment
    const deleted = await deleteAppointment(req.db, id);
    if (!deleted) return res.status(500).json({ error: 'Failed to delete appointment' });

    // Try to delete corresponding unavailable_time entry (best-effort)
    try {
      await deleteUnavailableTime(req.db, {
        workerId: appt.worker_id,
        date: appt.date,
        startTime: appt.start_time.slice(0,5),
        endTime: appt.end_time.slice(0,5),
      });
    } catch (e) {
      console.warn('Failed to delete unavailable_time for appointment', e);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
}


