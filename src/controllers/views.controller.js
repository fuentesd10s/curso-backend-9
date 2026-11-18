import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

// Handlebars no permite leer documentos de Mongoose directamente:
// se convierten a objetos planos (con `id` en lugar de `_id`).
const toPlain = (docs) => docs.map((doc) => doc.toJSON());

export const renderServices = async (req, res, next) => {
  try {
    const services = toPlain(await servicesService.getAllServices());
    res.render('services', { title: 'Servicios', page: 'services', services });
  } catch (error) {
    next(error);
  }
};

export const renderBookings = async (req, res, next) => {
  try {
    const bookings = toPlain(await bookingsService.getBookings());
    res.render('bookings', { title: 'Reservas', page: 'bookings', bookings });
  } catch (error) {
    next(error);
  }
};
