import { bookingsRepository } from '../repositories/bookings.repository.js';
import { servicesService } from './services.service.js';
import { AppError } from '../errors/AppError.js';

class BookingsService {
  // Los datos llegan validados por el middleware de Zod (src/validations).
  async createBooking(data) {
    return bookingsRepository.create({
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      date: data.date,
      time: data.time,
      status: data.status || 'pending',
      services: [],
    });
  }

  async getBookings() {
    return bookingsRepository.getAll();
  }

  async getBookingById(id) {
    const booking = await bookingsRepository.getById(id);
    if (!booking) {
      throw new AppError(`No existe una reserva con id ${id}`, 404);
    }
    return booking;
  }

  async addServiceToBooking(bookingId, serviceId) {
    const booking = await this.getBookingById(bookingId);
    await servicesService.getServiceById(serviceId);

    // La reserva viene con los servicios populados. Se vuelve a dejar solo el ObjectId
    // y se descartan los que quedaron en null porque el servicio fue eliminado.
    const services = booking.services
      .filter((s) => s.service)
      .map((s) => ({ service: s.service._id, quantity: s.quantity }));

    const item = services.find((s) => s.service.toString() === serviceId);

    if (item) {
      item.quantity += 1;
    } else {
      services.push({ service: serviceId, quantity: 1 });
    }

    return bookingsRepository.update(bookingId, { services });
  }
}

export const bookingsService = new BookingsService();