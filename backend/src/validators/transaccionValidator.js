import { check } from 'express-validator';

export const crearTransaccionRules = [
  check('producto_id').notEmpty().withMessage('El producto es obligatorio.').isInt({ min: 1 }).withMessage('El producto debe ser un número entero positivo.'),
  check('cantidad').notEmpty().withMessage('La cantidad es obligatoria.').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0.'),
  check('precio_negociado').notEmpty().withMessage('El precio negociado es obligatorio.').isFloat({ gt: 0 }).withMessage('El precio negociado debe ser un número mayor a 0.')
];

export const confirmarTransaccionRules = [
  check('estado').custom((value) => {
    const permitidos = ['confirmado', 'entregado'];
    if (!permitidos.includes(value)) {
      throw new Error('El estado debe ser "confirmado" o "entregado".');
    }
    return true;
  })
];