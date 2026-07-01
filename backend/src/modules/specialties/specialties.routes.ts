import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createSpecialtyController,
  getSpecialtiesController,
  getSpecialtyByIdController,
  updateSpecialtyController,
  updateSpecialtyStatusController,
} from './specialties.controller';
import {
  createSpecialtySchema,
  updateSpecialtySchema,
  updateSpecialtyStatusSchema,
} from './specialties.validators';

const router = Router();

router.get('/', getSpecialtiesController);
router.get('/:id', getSpecialtyByIdController);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(createSpecialtySchema),
  createSpecialtyController
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateSpecialtySchema),
  updateSpecialtyController
);

router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('ADMIN'),
  validate(updateSpecialtyStatusSchema),
  updateSpecialtyStatusController
);

export default router;
