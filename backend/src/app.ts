import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorMiddleware } from './middlewares/error.middleware';
import availabilityRoutes from './modules/availability/availability.routes';
import appointmentsRoutes from './modules/appointments/appointments.routes';
import authRoutes from './modules/auth/auth.routes';
import doctorPanelRoutes from './modules/doctor-panel/doctor-panel.routes';
import doctorsRoutes from './modules/doctors/doctors.routes';
import observationsRoutes from './modules/observations/observations.routes';
import patientPanelRoutes from './modules/patient-panel/patient-panel.routes';
import patientsRoutes from './modules/patients/patients.routes';
import reportsRoutes from './modules/reports/reports.routes';
import schedulesRoutes from './modules/schedules/schedules.routes';
import specialtiesRoutes from './modules/specialties/specialties.routes';
import testRoutes from './modules/test/test.routes';
import usersRoutes from './modules/users/users.routes';
import { errorResponse, successResponse } from './utils/response';

export const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  env.frontendUrl,
].filter((origin, index, list): origin is string => Boolean(origin) && list.indexOf(origin) === index);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/citas', appointmentsRoutes);
app.use('/api/doctor', doctorPanelRoutes);
app.use('/api/especialidades', specialtiesRoutes);
app.use('/api/doctores', doctorsRoutes);
app.use('/api/horarios', schedulesRoutes);
app.use('/api/disponibilidad', availabilityRoutes);
app.use('/api/observaciones', observationsRoutes);
app.use('/api/pacientes', patientsRoutes);
app.use('/api/paciente', patientPanelRoutes);
app.use('/api/reportes', reportsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/usuarios', usersRoutes);

app.get('/api/health', (_req, res) => {
  return successResponse(res, 'Servidor SGH funcionando correctamente', {
    status: 'OK',
  });
});

app.use((_req, res) => {
  return errorResponse(res, 'Ruta no encontrada.', [], 404);
});

app.use(errorMiddleware);
