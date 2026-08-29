export async function findUserByEmail(db, email) {
  const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}