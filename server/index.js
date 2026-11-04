import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import userRoutes from './routes/users.js';
import User from './models/User.js';
import multer from 'multer';

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);

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
  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Image must be 5 MB or smaller.'
      : 'The image upload could not be processed.';
    return res.status(status).json({ message });
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error('[TripVault API]', error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});


async function backfillUsernames() {
  // Week 1/2 accounts were created before usernames existed. Give those accounts
  // a stable username so their existing credentials continue to work in Week 3.
  const legacyUsers = await User.find({
    $or: [{ username: { $exists: false } }, { username: null }, { username: '' }]
  }).select('_id name').lean();

  for (const user of legacyUsers) {
    const base = (user.name || 'traveler')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 16) || 'traveler';
    const username = `${base}_${user._id.toString().slice(-6)}`.slice(0, 24);
    await User.collection.updateOne(
      { _id: user._id, $or: [{ username: { $exists: false } }, { username: null }, { username: '' }] },
      { $set: { username, bio: '' } }
    );
  }
  await User.syncIndexes();
  if (legacyUsers.length) console.log(`[TripVault] Added usernames to ${legacyUsers.length} existing account(s).`);
}

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
    await backfillUsernames();
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
