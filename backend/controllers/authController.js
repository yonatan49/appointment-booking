import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { findUserByEmail } from '../models/userModel.js';

dotenv.config();

export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await findUserByEmail(req.db, email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, admin: Boolean(user.is_admin) },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, email: user.email });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
