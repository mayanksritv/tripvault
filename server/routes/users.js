import { Router } from 'express';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

// Public profile: explicitly select only fields intended for public viewing.
router.get('/:username/profile', async (req, res, next) => {
  try {
    const username = String(req.params.username || '').trim().toLowerCase();
    const user = await User.findOne({ username }).select('name username bio').lean();
    if (!user) return res.status(404).json({ message: 'Traveler profile not found.' });

    const trips = await Trip.find({ user: user._id })
      .select('title destination startDate endDate rating coverImage createdAt')
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    return res.json({
      profile: {
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        trips: trips.map((trip) => ({
          id: trip._id.toString(),
          title: trip.title,
          destination: trip.destination,
          startDate: trip.startDate,
          endDate: trip.endDate,
          rating: trip.rating,
          coverImage: trip.coverImage || ''
        }))
      }
    });
  } catch (error) {
    return next(error);
  }
});

// Update the current user's public profile. Email/password are never accepted here.
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const allowedKeys = ['username', 'bio'];
    const unknownKeys = Object.keys(req.body || {}).filter((key) => !allowedKeys.includes(key));
    if (unknownKeys.length) return res.status(400).json({ message: 'Only username and bio can be updated here.' });

    const updates = {};
    if (Object.hasOwn(req.body || {}, 'username')) {
      const username = typeof req.body.username === 'string' ? req.body.username.trim().toLowerCase() : '';
      if (!USERNAME_PATTERN.test(username)) {
        return res.status(400).json({ message: 'Username must be 3–24 characters and use lowercase letters, numbers, or underscores.' });
      }
      updates.username = username;
    }
    if (Object.hasOwn(req.body || {}, 'bio')) {
      if (typeof req.body.bio !== 'string' || req.body.bio.length > 280) {
        return res.status(400).json({ message: 'Bio must be text with 280 characters or fewer.' });
      }
      updates.bio = req.body.bio.trim();
    }
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide a username or bio to update.' });

    const user = await User.findByIdAndUpdate(req.auth.userId, { $set: updates }, {
      new: true,
      runValidators: true
    }).select('name username bio email');

    if (!user) return res.status(404).json({ message: 'Account not found.' });
    return res.json({
      message: 'Your profile was updated.',
      user: {
        id: user._id.toString(),
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        email: user.email
      }
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'That username is already taken. Try another one.' });
    return next(error);
  }
});

export default router;
