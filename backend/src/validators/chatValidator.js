import { check } from 'express-validator';

export const enviarMensajeRules = [
  check('mensaje').trim().notEmpty().withMessage('El mensaje es obligatorio.'),
  check('precio_oferta').optional({ values: 'falsy' }).isFloat({ gt: 0 }).withMessage('La oferta de precio debe ser un número mayor a 0.')
];