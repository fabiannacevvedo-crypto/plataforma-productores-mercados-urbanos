import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'No se proporcionó un token de autenticación.'
    });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.usuario = {
      id: payload.id,
      rol: payload.rol,
      email: payload.email
    };
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes permisos para realizar esta acción.'
      });
    }
    next();
  };
};