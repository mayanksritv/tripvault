import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_MAX_BYTES = 72;

function safeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

function issueToken(user) {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'tripvault-api',
      audience: 'tripvault-client'
    }
  );
}

// POST /api/auth/register — creates an account and stores only a password hash.
router.post('/register', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({ message: 'Please enter a name between 2 and 80 characters.' });
    }
    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
      return res.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 UTF-8 bytes.' });
    }

    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: passwordHash });

    return res.status(201).json({
      message: 'Account created successfully. You can now sign in.',
      user: safeUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });
    }
    return next(error);
  }
});

// POST /api/auth/login — validates the password and returns a signed JWT.
router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!EMAIL_PATTERN.test(email) || !password) {
      return res.status(400).json({ message: 'Enter a valid email address and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }

    return res.json({
      message: 'Welcome back to TripVault.',
      token: issueToken(user),
      user: safeUser(user)
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/auth/me — protected profile endpoint.
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId).select('name email createdAt');
    if (!user) {
      return res.status(401).json({ message: 'This account is no longer available. Please sign in again.' });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
