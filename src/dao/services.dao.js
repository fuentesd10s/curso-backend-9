import mongoose from 'mongoose';
import { ServiceModel } from '../models/service.model.js';

// Un id con formato inválido no puede existir en la base: se trata como "no encontrado".
const isValidId = (id) => mongoose.isValidObjectId(id);

// strength 2: ignora mayúsculas pero respeta tildes ("Estética" = "estética").
// Se usa para filtrar y también para ordenar por texto.
const COLLATION = { locale: 'es', strength: 2 };

const buildQuery = (filters = {}) => {
  const query = {};
  if (filters.category !== undefined) query.category = filters.category;
  if (filters.available !== undefined) query.available = filters.available;
  return query;
};

class ServicesDao {
  async getAll(filters = {}) {
    return ServiceModel.find(buildQuery(filters)).collation(COLLATION);
  }

  // Devuelve una página de resultados y el total de documentos que cumplen los filtros.
  async paginate(filters, { page, limit, sort }) {
    const query = buildQuery(filters);

    const [docs, total] = await Promise.all([
      ServiceModel.find(query)
        .collation(COLLATION)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      ServiceModel.countDocuments(query).collation(COLLATION),
    ]);

    return { docs, total };
  }

  async getById(id) {
    if (!isValidId(id)) return null;
    return ServiceModel.findById(id);
  }

  async create(data) {
    return ServiceModel.create(data);
  }

  async update(id, data) {
    if (!isValidId(id)) return null;
    return ServiceModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    if (!isValidId(id)) return null;
    return ServiceModel.findByIdAndDelete(id);
  }
}

export const servicesDao = new ServicesDao();
