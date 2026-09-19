import { Router } from 'express';
import { validateRequest } from '../middlewares/validateRequest.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { crearProductoRules, actualizarProductoRules } from '../validators/productoValidator.js';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../controllers/productoController.js';

const router = Router();

router.get('/', listarProductos);
router.get('/:id', obtenerProducto);
router.post('/', authenticate, authorize('productor'), crearProductoRules, validateRequest, crearProducto);
router.patch('/:id', authenticate, authorize('productor'), actualizarProductoRules, validateRequest, actualizarProducto);
router.delete('/:id', authenticate, authorize('productor'), eliminarProducto);

export default router;