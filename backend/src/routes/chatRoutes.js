import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/auth.js';
import { enviarMensajeRules } from '../validators/chatValidator.js';
import {
  listarChats,
  conversacionEntre,
  enviarMensaje
} from '../controllers/chatController.js';

const router = Router();

router.get('/', authenticate, listarChats);
router.get('/productor/:productor_id/comprador/:comprador_id', authenticate, conversacionEntre);
router.post(
  '/productor/:productor_id/comprador/:comprador_id',
  authenticate,
  enviarMensajeRules,
  validateRequest,
  enviarMensaje
);

export default router;