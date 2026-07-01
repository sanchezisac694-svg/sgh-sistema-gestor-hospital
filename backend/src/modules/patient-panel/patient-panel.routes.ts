import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  cancelMyPatientAppointmentController,
  getMyPatientAppointmentsController,
} from '../appointments/appointments.controller';
import { cancelAppointmentSchema } from '../appointments/appointments.validators';
import { getMyPatientProfileController } from '../patients/patients.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('PACIENTE'));

router.get(
  '/me/perfil',
  getMyPatientProfileController
);

router.get('/me/citas', getMyPatientAppointmentsController);
router.patch(
  '/me/citas/:id/cancelar',
  validate(cancelAppointmentSchema),
  cancelMyPatientAppointmentController
);

export default router;
