export async function getAllServices(req, res) {
  try {
    const [rows] = await req.db.promise().query('SELECT * FROM services');
    res.json(rows);
  } catch (err) {
    console.error('Service fetch error:', err?.message || err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
}