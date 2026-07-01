import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import {
  getDoctorDashboardController,
  getMyDoctorAppointmentByIdController,
  getMyDoctorAppointmentsController,
  getMyDoctorProfileController,
  getMyDoctorScheduleController,
  getTodayDoctorAppointmentsController,
} from './doctor-panel.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('DOCTOR'));

router.get('/me/dashboard', getDoctorDashboardController);
router.get('/me/citas', getMyDoctorAppointmentsController);
router.get('/me/citas/hoy', getTodayDoctorAppointmentsController);
router.get('/me/citas/:id', getMyDoctorAppointmentByIdController);
router.get('/me/horario', getMyDoctorScheduleController);
router.get('/me/perfil', getMyDoctorProfileController);

export default router;
