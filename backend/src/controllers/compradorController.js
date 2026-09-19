import { matchedData } from 'express-validator';
import { Comprador } from '../models/Comprador.js';
import { Productor } from '../models/Productor.js';
import { Transaccion } from '../models/Transaccion.js';
import { Chat } from '../models/Chat.js';

export const listarCompradores = async (req, res, next) => {
  try {
    const compradores = await Comprador.findAll({
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      ok: true,
      message: 'Listado de compradores.',
      data: compradores,
      total: compradores.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerComprador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comprador = await Comprador.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Transaccion,
          as: 'pedidos',
          attributes: { exclude: ['comprador_id'] }
        }
      ]
    });

    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Comprador no encontrado.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Comprador obtenido.',
      data: comprador
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarComprador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const comprador = await Comprador.findByPk(id);
    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Comprador no encontrado.'
      });
    }

    if (req.usuario.rol === 'comprador' && Number(req.usuario.id) !== comprador.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes modificar tu propio perfil.'
      });
    }

    await comprador.update(data);

    return res.status(200).json({
      ok: true,
      message: 'Comprador actualizado correctamente.',
      data: {
        id: comprador.id,
        nombre: comprador.nombre,
        email: comprador.email,
        tipo: comprador.tipo,
        ubicacion: comprador.ubicacion
      }
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarComprador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comprador = await Comprador.findByPk(id);
    if (!comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Comprador no encontrado.'
      });
    }

    if (req.usuario.rol === 'comprador' && Number(req.usuario.id) !== comprador.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes eliminar tu propio perfil.'
      });
    }

    await comprador.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Comprador eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};

export const listaProductoresVinculados = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productores = await Productor.findAll({
      attributes: ['id', 'nombre', 'email', 'ubicacion', 'suscripcion'],
      include: [
        {
          model: Comprador,
          as: 'compradores',
          where: { id },
          attributes: []
        }
      ]
    });

    return res.status(200).json({
      ok: true,
      message: 'Productores conectados al comprador por transacciones.',
      data: productores
    });
  } catch (error) {
    next(error);
  }
};