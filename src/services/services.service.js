import { servicesRepository } from '../repositories/services.repository.js';
import { AppError } from '../errors/AppError.js';

class ServicesService {
  // Listado con filtros, paginación y ordenamiento (los parámetros llegan validados por Zod).
  async getServices({ category, available, page = 1, limit = 10, sortBy, order = 'asc' } = {}) {
    const filters = {};
    if (category !== undefined) filters.category = category;
    if (available !== undefined) filters.available = available;

    // Sin sortBy se mantiene el orden de creación. `_id` desempata para que las páginas sean estables.
    const sort = sortBy ? { [sortBy]: order === 'desc' ? -1 : 1, _id: 1 } : { _id: 1 };

    const { docs, total } = await servicesRepository.paginate(filters, { page, limit, sort });
    const totalPages = Math.ceil(total / limit);

    return {
      payload: docs,
      totalDocs: total,
      page,
      limit,
      totalPages,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  }

  // Todos los servicios, sin paginar. Lo usan las vistas y los avisos en tiempo real.
  async getAllServices() {
    return servicesRepository.getAll();
  }

  async getServiceById(id) {
    const service = await servicesRepository.getById(id);
    if (!service) {
      throw new AppError(`No existe un servicio con id ${id}`, 404);
    }
    return service;
  }

  // Los datos llegan validados por el middleware de Zod (src/validations).
  async createService(data) {
    return servicesRepository.create({
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
      category: data.category,
      available: data.available,
    });
  }

  async updateService(id, data) {
    const { id: _ignoredId, _id: _ignoredMongoId, ...safeData } = data;

    const updated = await servicesRepository.update(id, safeData);
    if (!updated) {
      throw new AppError(`No existe un servicio con id ${id}`, 404);
    }
    return updated;
  }

  async deleteService(id) {
    const deleted = await servicesRepository.delete(id);
    if (!deleted) {
      throw new AppError(`No existe un servicio con id ${id}`, 404);
    }
    return deleted;
  }
}

export const servicesService = new ServicesService();