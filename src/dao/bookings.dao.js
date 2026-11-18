import mongoose from 'mongoose';
import { BookingModel } from '../models/booking.model.js';

const isValidId = (id) => mongoose.isValidObjectId(id);

class BookingsDao {
  async getAll() {
    return BookingModel.find().sort({ date: 1, time: 1 }).populate('services.service');
  }

  async getById(id) {
    if (!isValidId(id)) return null;
    return BookingModel.findById(id).populate('services.service');
  }

  async create(data) {
    return BookingModel.create(data);
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    return BookingModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('services.service');
  }
}

export const bookingsDao = new BookingsDao();
