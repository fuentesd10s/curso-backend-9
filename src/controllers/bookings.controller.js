import { bookingsService } from '../services/bookings.service.js';
import { notifyBookingsUpdated } from '../sockets/notifier.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingsService.createBooking(req.validated.body);
    res.status(201).json(booking);
    await notifyBookingsUpdated();
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    res.status(200).json(await bookingsService.getBookingById(req.params.bid));
  } catch (error) {
    next(error);
  }
};

export const addServiceToBooking = async (req, res, next) => {
  try {
    const { bid, sid } = req.params;
    const booking = await bookingsService.addServiceToBooking(bid, sid);
    res.status(200).json(booking);
    await notifyBookingsUpdated();
  } catch (error) {
    next(error);
  }
};