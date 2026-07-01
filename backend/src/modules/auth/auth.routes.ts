import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import {
  loginController,
  logoutController,
  meController,
  registerPacienteController,
} from './auth.controller';
import {
  loginSchema,
  registerPacienteSchema,
} from './auth.validators';

const router = Router();

router.post('/login', validate(loginSchema), loginController);
router.post(
  '/register-paciente',
  validate(registerPacienteSchema),
  registerPacienteController
);
router.get('/me', authMiddleware, meController);
router.post('/logout', authMiddleware, logoutController);

export default router;
