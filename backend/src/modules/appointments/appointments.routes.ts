import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  attendAppointmentController,
  cancelAppointmentController,
  confirmAppointmentController,
  createAppointmentController,
  getAppointmentByIdController,
  getAppointmentsController,
  markNoShowAppointmentController,
  rescheduleAppointmentController,
  updateAppointmentController,
} from './appointments.controller';
import {
  attendAppointmentSchema,
  cancelAppointmentSchema,
  confirmAppointmentSchema,
  createAppointmentSchema,
  noShowAppointmentSchema,
  rescheduleAppointmentSchema,
  updateAppointmentSchema,
} from './appointments.validators';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('ADMIN', 'RECEPCIONISTA'), getAppointmentsController);
router.post(
  '/',
  roleMiddleware('ADMIN', 'RECEPCIONISTA', 'PACIENTE'),
  validate(createAppointmentSchema),
  createAppointmentController
);
router.get('/:id', getAppointmentByIdController);
router.put(
  '/:id',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  validate(updateAppointmentSchema),
  updateAppointmentController
);
router.patch(
  '/:id/confirmar',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  validate(confirmAppointmentSchema),
  confirmAppointmentController
);
router.patch(
  '/:id/cancelar',
  roleMiddleware('ADMIN', 'RECEPCIONISTA', 'PACIENTE'),
  validate(cancelAppointmentSchema),
  cancelAppointmentController
);
router.patch(
  '/:id/reprogramar',
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  validate(rescheduleAppointmentSchema),
  rescheduleAppointmentController
);
router.patch(
  '/:id/atendida',
  roleMiddleware('DOCTOR'),
  validate(attendAppointmentSchema),
  attendAppointmentController
);
router.patch(
  '/:id/no-asistio',
  roleMiddleware('DOCTOR'),
  validate(noShowAppointmentSchema),
  markNoShowAppointmentController
);

export default router;
