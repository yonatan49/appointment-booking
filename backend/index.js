import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import db from './config/db.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// CORS configuration (dev-friendly). In production, set CORS_ORIGINS to explicit domains.
const allowedOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or curl
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: false, // we're using Authorization header, not cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// Explicitly handle preflight for all routes
app.options(/.*/, cors(corsOptions));

// Base middlewares
app.use(express.json({ limit: '1mb' }));

// Attach DB connection pool to each request
app.use((req, _res, next) => {
  req.db = db;
  next();
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await req.db.promise().query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (e) {
    res.status(500).json({ status: 'error' });
  }
});

// Routes
app.use('/api/admin', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);

// Default route
app.get('/', (_req, res) => res.send('Welcome to the Appointment Booking API'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server after verifying DB connectivity once
async function start() {
  try {
    await db.promise().query('SELECT 1');
    console.log('✅ Connected to MySQL');
  } catch (err) {
    console.error('❌ Database connection failed:', err?.message || err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start();