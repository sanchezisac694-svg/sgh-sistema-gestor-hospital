import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { roleMiddleware } from '../../middlewares/role.middleware';
import { successResponse } from '../../utils/response';

const router = Router();

router.get('/admin', authMiddleware, roleMiddleware('ADMIN'), (_req, res) => {
  return successResponse(res, 'Acceso permitido para ADMIN', null);
});

router.get('/doctor', authMiddleware, roleMiddleware('DOCTOR'), (_req, res) => {
  return successResponse(res, 'Acceso permitido para DOCTOR', null);
});

router.get(
  '/paciente',
  authMiddleware,
  roleMiddleware('PACIENTE'),
  (_req, res) => {
    return successResponse(res, 'Acceso permitido para PACIENTE', null);
  }
);

router.get(
  '/admin-recepcion',
  authMiddleware,
  roleMiddleware('ADMIN', 'RECEPCIONISTA'),
  (_req, res) => {
    return successResponse(res, 'Acceso permitido para ADMIN o RECEPCIONISTA', null);
  }
);

export default router;
