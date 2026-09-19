import { check } from 'express-validator';

export const registrarProductorRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.').isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  check('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria.'),
  check('tipo_productos').trim().notEmpty().withMessage('El tipo de productos es obligatorio.'),
  check('suscripcion').optional().isIn(['premium', 'estandar']).withMessage('La suscripción debe ser "premium" o "estandar".')
];

export const loginRules = [
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.')
];

export const actualizarProductorRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('ubicacion').optional().trim().notEmpty().withMessage('La ubicación no puede estar vacía.'),
  check('tipo_productos').optional().trim().notEmpty().withMessage('El tipo de productos no puede estar vacío.'),
  check('suscripcion').optional().isIn(['premium', 'estandar']).withMessage('La suscripción debe ser "premium" o "estandar".'),
  check('password').optional().trim().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];