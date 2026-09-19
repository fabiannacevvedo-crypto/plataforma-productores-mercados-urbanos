import { check } from 'express-validator';

export const registrarCompradorRules = [
  check('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.').isLength({ max: 100 }).withMessage('El nombre no puede superar los 100 caracteres.'),
  check('email').trim().notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Debe ser un email válido.'),
  check('password').trim().notEmpty().withMessage('La contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  check('tipo').trim().notEmpty().withMessage('El tipo de comprador es obligatorio.').isIn(['comercio', 'restaurante', 'mayorista']).withMessage('El tipo debe ser "comercio", "restaurante" o "mayorista".'),
  check('ubicacion').trim().notEmpty().withMessage('La ubicación es obligatoria.')
];

export const actualizarCompradorRules = [
  check('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío.'),
  check('tipo').optional().isIn(['comercio', 'restaurante', 'mayorista']).withMessage('El tipo debe ser "comercio", "restaurante" o "mayorista".'),
  check('ubicacion').optional().trim().notEmpty().withMessage('La ubicación no puede estar vacía.'),
  check('password').optional().trim().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.')
];