import mongoose from 'mongoose';
import { toJSONOptions } from './toJSON.js';

const bookingServiceSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    services: { type: [bookingServiceSchema], default: [] },
  },
  { toJSON: toJSONOptions }
);

export const BookingModel = mongoose.model('Booking', bookingSchema);
