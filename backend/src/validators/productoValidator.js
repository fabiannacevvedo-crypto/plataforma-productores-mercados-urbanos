import { check } from 'express-validator';

export const crearProductoRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre del producto es obligatorio.').isLength({ max: 120 }).withMessage('El nombre no puede superar los 120 caracteres.'),
  check('descripcion').trim().notEmpty().withMessage('La descripción es obligatoria.'),
  check('precio').notEmpty().withMessage('El precio es obligatorio.').isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0.'),
  check('stock').notEmpty().withMessage('El stock es obligatorio.').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.')
];

export const actualizarProductoRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('descripcion').optional().trim().notEmpty().withMessage('La descripción no puede estar vacía.'),
  check('precio').optional().isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0.'),
  check('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.')
];