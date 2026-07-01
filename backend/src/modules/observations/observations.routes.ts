import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import {
  getMyDoctorObservationsController,
  getObservationByAppointmentController,
  getObservationByIdController,
  getObservationsController,
} from './observations.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN'), getObservationsController);
router.get('/doctor/me', roleMiddleware('DOCTOR'), getMyDoctorObservationsController);
router.get(
  '/cita/:citaId',
  roleMiddleware('ADMIN', 'DOCTOR'),
  getObservationByAppointmentController
);
router.get(
  '/:id',
  roleMiddleware('ADMIN', 'DOCTOR'),
  getObservationByIdController
);

export default router;
