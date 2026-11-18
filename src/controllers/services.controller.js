import { servicesService } from '../services/services.service.js';
import { notifyServicesUpdated, notifyBookingsUpdated } from '../sockets/notifier.js';

// Un cambio en un servicio también se ve en las reservas que lo incluyen.
const notifyChanges = () => Promise.all([notifyServicesUpdated(), notifyBookingsUpdated()]);

export const getServices = async (req, res, next) => {
  try {
    res.status(200).json(await servicesService.getServices(req.validated.query));
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    res.status(200).json(await servicesService.getServiceById(req.params.sid));
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await servicesService.createService(req.validated.body);
    res.status(201).json(service);
    await notifyServicesUpdated();
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await servicesService.updateService(req.params.sid, req.validated.body);
    res.status(200).json(service);
    await notifyChanges();
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const deleted = await servicesService.deleteService(req.params.sid);
    res.status(200).json({ message: 'Servicio eliminado', service: deleted });
    await notifyChanges();
  } catch (error) {
    next(error);
  }
};