export async function getAppointmentsByWorkerAndDate(db, workerId, date) {
  const [rows] = await db.promise().query(
    `SELECT start_time, end_time FROM appointments 
     WHERE worker_id = ? AND date = ?`, 
    [workerId, date]
  );
  return rows;
}

export async function getAppointmentById(db, appointmentId) {
  const [rows] = await db.promise().query(
    `SELECT * FROM appointments WHERE id = ?`,
    [appointmentId]
  );
  return rows[0];
}

export async function updateAppointmentStatus(db, appointmentId, status) {
  const [result] = await db.promise().query(
    `UPDATE appointments SET status = ? WHERE id = ?`,
    [status, appointmentId]
  );
  return result.affectedRows;
}

export async function deleteAppointment(db, appointmentId) {
  const [result] = await db.promise().query(
    `DELETE FROM appointments WHERE id = ?`,
    [appointmentId]
  );
  return result.affectedRows;
}

export async function createAppointment(db, {
  client_name,
  client_phone,
  message,
  service_id,
  worker_id,
  date,
  start_time
}) {
  // Fetch service duration
  const [[{ duration_minutes }]] = await db.promise().query(
    `SELECT duration_minutes FROM services WHERE id = ?`,
    [service_id]
  );

  // Convert start time to 24-hour format
  const startTime24 = convertTo24Hour(start_time);

  const [result] = await db.promise().query(
    `INSERT INTO appointments 
      (client_name, client_phone, message, service_id, worker_id, date, start_time, end_time, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ADDTIME(?, SEC_TO_TIME(? * 60)), 'booked', NOW())`,
    [
      client_name,
      client_phone,
      message,
      service_id,
      worker_id,
      date,
      startTime24,
      startTime24,
      duration_minutes
    ]
  );

  return result.insertId;
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (modifier === 'PM' && hours !== '12') hours = String(+hours + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';

  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}
