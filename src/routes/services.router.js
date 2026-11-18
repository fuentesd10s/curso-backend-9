import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/services.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
  servicesQuerySchema,
} from '../validations/services.validation.js';

const router = Router();

router.get('/', validate(servicesQuerySchema, 'query'), getServices);
router.get('/:sid', validate(serviceIdSchema, 'params'), getServiceById);
router.post('/', validate(createServiceSchema), createService);
router.put('/:sid', validate(serviceIdSchema, 'params'), validate(updateServiceSchema), updateService);
router.delete('/:sid', validate(serviceIdSchema, 'params'), deleteService);

export default router;
