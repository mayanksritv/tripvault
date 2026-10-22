import { Router } from 'express';
import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

function validateTrip(body, partial = false) {
  const errors = {};
  const fields = ['title', 'destination', 'startDate', 'endDate', 'description', 'rating'];
  for (const key of Object.keys(body || {})) {
    if (!fields.includes(key)) errors[key] = 'This field is not allowed.';
  }
  if (!partial || Object.hasOwn(body, 'title')) {
    if (typeof body.title !== 'string' || !body.title.trim()) errors.title = 'Trip title is required.';
    else if (body.title.trim().length > 120) errors.title = 'Title must be 120 characters or fewer.';
  }
  if (!partial || Object.hasOwn(body, 'destination')) {
    if (typeof body.destination !== 'string' || !body.destination.trim()) errors.destination = 'Destination is required.';
    else if (body.destination.trim().length > 160) errors.destination = 'Destination must be 160 characters or fewer.';
  }
  for (const key of ['startDate', 'endDate']) {
    if (Object.hasOwn(body || {}, key) && body[key] !== '' && body[key] != null && Number.isNaN(Date.parse(body[key]))) {
      errors[key] = 'Enter a valid date.';
    }
  }
  const start = body.startDate ? new Date(body.startDate) : null;
  const end = body.endDate ? new Date(body.endDate) : null;
  if (start && end && end < start) errors.endDate = 'End date must be on or after the start date.';
  if (Object.hasOwn(body || {}, 'rating') && body.rating !== '' && body.rating != null) {
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Rating must be a whole number from 1 to 5.';
  }
  if (Object.hasOwn(body || {}, 'description') && typeof body.description !== 'string') errors.description = 'Description must be text.';
  if ((body.description || '').length > 3000) errors.description = 'Description must be 3000 characters or fewer.';
  return errors;
}

function cleanPayload(body) {
  const result = {};
  for (const key of ['title', 'destination', 'description']) {
    if (Object.hasOwn(body, key)) result[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }
  for (const key of ['startDate', 'endDate']) {
    if (Object.hasOwn(body, key)) result[key] = body[key] ? new Date(body[key]) : null;
  }
  if (Object.hasOwn(body, 'rating')) result.rating = body.rating === '' || body.rating == null ? undefined : Number(body.rating);
  return result;
}

router.post('/', async (req, res, next) => {
  try {
    const errors = validateTrip(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please check the trip details.', errors });
    const trip = await Trip.create({ ...cleanPayload(req.body), user: req.auth.userId });
    return res.status(201).json({ message: 'Trip created successfully.', trip });
  } catch (error) { return next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.auth.userId }).sort({ startDate: -1, createdAt: -1 }).lean();
    return res.json({ trips });
  } catch (error) { return next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid trip ID.' });
    const trip = await Trip.findOne({ _id: req.params.id, user: req.auth.userId }).lean();
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.json({ trip });
  } catch (error) { return next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid trip ID.' });
    const errors = validateTrip(req.body, true);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Please check the trip details.', errors });
    const trip = await Trip.findOne({ _id: req.params.id, user: req.auth.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    Object.assign(trip, cleanPayload(req.body));
    await trip.save();
    return res.json({ message: 'Trip updated successfully.', trip });
  } catch (error) { return next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid trip ID.' });
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.auth.userId });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });
    return res.json({ message: 'Trip deleted successfully.' });
  } catch (error) { return next(error); }
});

export default router;
