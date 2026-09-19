import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate } from '../middlewares/auth.js';
import { actualizarProductorRules } from '../validators/productorValidator.js';
import {
  listarProductores,
  obtenerProductor,
  actualizarProductor,
  eliminarProductor,
  obtenerEstadisticas,
  listaCompradoresVinculados
} from '../controllers/productorController.js';

const router = Router();

router.get('/', listarProductores);
router.get('/:id/estadisticas', authenticate, obtenerEstadisticas);
router.get('/:id/compradores', authenticate, listaCompradoresVinculados);
router.get('/:id', obtenerProductor);
router.patch('/:id', authenticate, actualizarProductorRules, validateRequest, actualizarProductor);
router.delete('/:id', authenticate, eliminarProductor);

export default router;