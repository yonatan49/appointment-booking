export async function getUnavailableTimes(db, workerId, date) {
  const [rows] = await db.promise().query(
    `SELECT start_time, end_time FROM unavailable_times 
     WHERE worker_id = ? AND date = ?`,
    [workerId, date]
  );
  return rows;
}

export async function blockUnavailableTime(db, { workerId, date, startTime, endTime, reason }) {
  const [result] = await db.promise().query(
    `INSERT INTO unavailable_times (worker_id, date, start_time, end_time, reason, created_at)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [workerId, date, startTime, endTime, reason]
  );
  return result.insertId;
}

export async function deleteUnavailableTime(db, { workerId, date, startTime, endTime }) {
  const [result] = await db.promise().query(
    `DELETE FROM unavailable_times WHERE worker_id = ? AND date = ? AND start_time = ? AND end_time = ?`,
    [workerId, date, startTime, endTime]
  );
  return result.affectedRows;
}