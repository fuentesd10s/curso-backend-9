import { Router } from 'express';
import {
  createBooking,
  getBookingById,
  addServiceToBooking,
} from '../controllers/bookings.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createBookingSchema,
  bookingIdSchema,
  addServiceToBookingSchema,
} from '../validations/bookings.validation.js';

const router = Router();

router.post('/', validate(createBookingSchema), createBooking);
router.get('/:bid', validate(bookingIdSchema, 'params'), getBookingById);
router.post('/:bid/services/:sid', validate(addServiceToBookingSchema, 'params'), addServiceToBooking);

export default router;
