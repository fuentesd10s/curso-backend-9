import { servicesDao } from '../dao/services.dao.js';

class ServicesRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll(filters) {
    return this.dao.getAll(filters);
  }

  paginate(filters, options) {
    return this.dao.paginate(filters, options);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    return this.dao.create(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  delete(id) {
    return this.dao.delete(id);
  }
}

export const servicesRepository = new ServicesRepository(servicesDao);