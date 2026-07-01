import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createScheduleController,
  getScheduleByIdController,
  getSchedulesByDoctorController,
  getSchedulesController,
  updateScheduleController,
  updateScheduleStatusController,
} from './schedules.controller';
import {
  createScheduleSchema,
  updateScheduleSchema,
  updateScheduleStatusSchema,
} from './schedules.validators';

const router = Router();

router.get('/doctor/:doctorId', getSchedulesByDoctorController);

router.get('/', authMiddleware, roleMiddleware('ADMIN'), getSchedulesController);
router.get('/:id', authMiddleware, roleMiddleware('ADMIN'), getScheduleByIdController);
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(createScheduleSchema),
  createScheduleController
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateScheduleSchema),
  updateScheduleController
);
router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateScheduleStatusSchema),
  updateScheduleStatusController
);

export default router;
