import { z } from 'zod';
import { requiredError, text, objectId } from './common.validation.js';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

// Si el formato está mal, ya lo informa el regex: acá solo se revisa que la fecha exista (no 2026-02-30).
const isRealDate = (value) => {
  if (!DATE_FORMAT.test(value)) return true;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const createBookingSchema = z.object({
  clientName: text('clientName'),
  clientEmail: z
    .string(requiredError('clientEmail', 'texto'))
    .trim()
    .pipe(z.email('clientEmail no es un email válido')),
  date: z
    .string(requiredError('date', 'texto'))
    .regex(DATE_FORMAT, 'date debe tener el formato AAAA-MM-DD')
    .refine(isRealDate, 'date no es una fecha válida'),
  time: z
    .string(requiredError('time', 'texto'))
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'time debe tener el formato HH:MM (24 horas)'),
  status: z.enum(BOOKING_STATUSES, `status debe ser uno de: ${BOOKING_STATUSES.join(', ')}`).optional(),
});

export const bookingIdSchema = z.object({
  bid: objectId('bid'),
});

export const addServiceToBookingSchema = z.object({
  bid: objectId('bid'),
  sid: objectId('sid'),
});
