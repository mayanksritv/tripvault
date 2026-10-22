import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  destination: { type: String, required: true, trim: true, maxlength: 160 },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, trim: true, maxlength: 3000, default: '' },
  rating: { type: Number, min: 1, max: 5 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

tripSchema.index({ user: 1, startDate: -1 });
export default mongoose.model('Trip', tripSchema);
