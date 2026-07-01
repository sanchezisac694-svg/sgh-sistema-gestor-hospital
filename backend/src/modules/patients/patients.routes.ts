import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createPatientController,
  getPatientAppointmentsController,
  getPatientByIdController,
  getPatientsController,
  updatePatientController,
  updatePatientStatusController,
} from './patients.controller';
import {
  createPatientSchema,
  updatePatientSchema,
  updatePatientStatusSchema,
} from './patients.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN', 'RECEPCIONISTA'), getPatientsController);
router.post(
  '/',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  validate(createPatientSchema),
  createPatientController
);
router.get(
  '/:id/citas',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  getPatientAppointmentsController
);
router.get('/:id', roleMiddleware('ADMIN', 'RECEPCIONISTA'), getPatientByIdController);
router.put(
  '/:id',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  validate(updatePatientSchema),
  updatePatientController
);
router.patch(
  '/:id/estado',
  roleMiddleware('ADMIN'),
  validate(updatePatientStatusSchema),
  updatePatientStatusController
);

export default router;
