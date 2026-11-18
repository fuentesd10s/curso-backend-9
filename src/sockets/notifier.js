import { emitEvent } from './socket.js';
import { servicesService } from '../services/services.service.js';
import { bookingsService } from '../services/bookings.service.js';

// Los datos se vuelven a pedir a través de los services (misma arquitectura en capas que la API).
// Si el aviso falla, la acción ya quedó guardada: solo se registra el error.

const toPlain = (docs) => docs.map((doc) => doc.toJSON());

export async function notifyServicesUpdated() {
  try {
    emitEvent('services:updated', toPlain(await servicesService.getAllServices()));
  } catch (error) {
    console.error(`No se pudo emitir services:updated: ${error.message}`);
  }
}

export async function notifyBookingsUpdated() {
  try {
    emitEvent('bookings:updated', toPlain(await bookingsService.getBookings()));
  } catch (error) {
    console.error(`No se pudo emitir bookings:updated: ${error.message}`);
  }
}
