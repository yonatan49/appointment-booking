export async function getWorkersByService(req, res) {
  const serviceId = req.query.serviceId;
  if (!serviceId) return res.status(400).json({ error: 'serviceId is required' });

  // Return each worker, whether they are qualified for the selected service,
  // and a comma-delimited list of all services they provide (for display).
  // Use joins + GROUP_CONCAT to be resilient across SQL modes.
  const sql = `
    SELECT
      u.id,
      u.name,
      u.image_url,
      CASE WHEN SUM(CASE WHEN us_match.service_id IS NOT NULL THEN 1 ELSE 0 END) > 0 THEN 1 ELSE 0 END AS qualified,
      COALESCE(GROUP_CONCAT(DISTINCT s.title ORDER BY s.title SEPARATOR ', '), '') AS service_names
    FROM users u
    LEFT JOIN user_services us_all ON us_all.user_id = u.id
    LEFT JOIN services s ON s.id = us_all.service_id
    LEFT JOIN user_services us_match ON us_match.user_id = u.id AND us_match.service_id = ?
    WHERE u.is_admin = 0
    GROUP BY u.id, u.name, u.image_url
    ORDER BY u.name ASC
  `;

  try {
    const [rows] = await req.db.promise().query(sql, [serviceId]);
    // Normalize to ensure consistent types for frontend
    const normalized = rows.map(row => {
      const serviceNamesStr = row.service_names || '';
      const serviceNameList = serviceNamesStr
        ? serviceNamesStr.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      return {
        id: row.id,
        name: row.name,
        image_url: row.image_url,
        qualified: !!row.qualified,
        service_names: serviceNamesStr,
        // Also provide an array of objects for convenience on the frontend
        services: serviceNameList.map(title => ({ title })),
      };
    });
    res.json(normalized);
  } catch (err) {
    console.error('getWorkersByService error:', err);
    res.status(500).json({ error: 'DB error' });
  }
}

export async function getUserById(req, res) {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ message: 'id is required' });

  try {
    const [rows] = await req.db.promise().query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
}