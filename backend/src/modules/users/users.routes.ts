import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  createUserController,
  getUserByIdController,
  getUsersController,
  updateUserController,
  updateUserStatusController,
} from './users.controller';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from './users.validators';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/', getUsersController);
router.get('/:id', getUserByIdController);
router.post('/', validate(createUserSchema), createUserController);
router.put('/:id', validate(updateUserSchema), updateUserController);
router.patch(
  '/:id/estado',
  validate(updateUserStatusSchema),
  updateUserStatusController
);

export default router;
