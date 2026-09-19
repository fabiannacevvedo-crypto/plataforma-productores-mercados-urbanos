import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/auth.js';
import { crearTransaccionRules, confirmarTransaccionRules } from '../validators/transaccionValidator.js';
import {
  listarTransacciones,
  obtenerTransaccion,
  crearTransaccion,
  confirmarTransaccion
} from '../controllers/transaccionController.js';

const router = Router();

router.get('/', listarTransacciones);
router.get('/:id', authenticate, obtenerTransaccion);
router.post('/', authenticate, crearTransaccionRules, validateRequest, crearTransaccion);
router.patch('/:id/estado', authenticate, confirmarTransaccionRules, validateRequest, confirmarTransaccion);

export default router;