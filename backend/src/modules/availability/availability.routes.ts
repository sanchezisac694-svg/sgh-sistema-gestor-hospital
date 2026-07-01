import { Router } from 'express';
import { getDoctorAvailabilityController } from './availability.controller';

const router = Router();

router.get('/doctores/:doctorId', getDoctorAvailabilityController);

export default router;
