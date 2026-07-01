import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import {
  getActiveStaffReportController,
  getAppointmentsByDoctorReportController,
  getAppointmentsBySpecialtyReportController,
  getAppointmentsByStatusReportController,
  getDashboardReportController,
  getPatientsReportController,
} from './reports.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/dashboard', getDashboardReportController);
router.get('/citas-por-estado', getAppointmentsByStatusReportController);
router.get('/citas-por-doctor', getAppointmentsByDoctorReportController);
router.get('/citas-por-especialidad', getAppointmentsBySpecialtyReportController);
router.get('/personal-activo', getActiveStaffReportController);
router.get('/pacientes', getPatientsReportController);

export default router;
