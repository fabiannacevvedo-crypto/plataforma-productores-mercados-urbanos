export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    ok: false,
    message: `La ruta ${req.method} ${req.originalUrl} no existe.`
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} ->`, err.message);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      ok: false,
      message: 'Ya existe un registro con ese valor único.'
    });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      ok: false,
      message: 'Error de validación en la base de datos.',
      errors: err.errors.map((e) => ({ campo: e.path, mensaje: e.message }))
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      ok: false,
      message: 'Token inválido o expirado.'
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      ok: false,
      message: err.message
    });
  }

  return res.status(500).json({
    ok: false,
    message: 'Ocurrió un error interno del servidor.',
    error: err.message
  });
};