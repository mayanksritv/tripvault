import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server clients and local tools without an Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by the TripVault API.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'TripVault API',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  if (error?.message?.includes('origin is not allowed')) {
    return res.status(403).json({ message: 'This origin is not allowed to access TripVault.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  console.error('[TripVault API]', error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

async function startServer() {
  if (!process.env.MONGO_URI) {
    console.error('Startup blocked: set MONGO_URI in server/.env before starting TripVault.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('Startup blocked: JWT_SECRET must contain at least 32 characters.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[TripVault] MongoDB connected: ${mongoose.connection.name}`);
    app.listen(PORT, () => {
      console.log(`[TripVault] API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[TripVault] Could not connect to MongoDB. Check MONGO_URI and Atlas Network Access.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
