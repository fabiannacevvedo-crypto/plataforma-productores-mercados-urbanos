import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registrarProductorRules,
  loginRules,
  actualizarProductorRules
} from '../validators/productorValidator.js';
import {
  registrarProductor,
  login
} from '../controllers/authController.js';

const router = Router();

router.post('/productores/registro', registrarProductorRules, validateRequest, registrarProductor);
router.post('/login', loginRules, validateRequest, login);

export default router;