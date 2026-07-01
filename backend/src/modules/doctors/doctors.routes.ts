import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createDoctorController,
  getDoctorByIdController,
  getDoctorsBySpecialtyController,
  getDoctorsController,
  updateDoctorController,
  updateDoctorStatusController,
} from './doctors.controller';
import {
  createDoctorSchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
} from './doctors.validators';

const router = Router();

router.get('/', getDoctorsController);
router.get('/especialidad/:especialidadId', getDoctorsBySpecialtyController);
router.get('/:id', getDoctorByIdController);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(createDoctorSchema),
  createDoctorController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateDoctorSchema),
  updateDoctorController
);

router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateDoctorStatusSchema),
  updateDoctorStatusController
);

export default router;
