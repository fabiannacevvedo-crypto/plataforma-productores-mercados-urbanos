import { matchedData } from 'express-validator';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';
import { Producto } from '../models/Producto.js';
import { Transaccion } from '../models/Transaccion.js';
import { Chat } from '../models/Chat.js';

export const listarProductores = async (req, res, next) => {
  try {
    const productores = await Productor.findAll({
      attributes: { exclude: ['password'] }
    });

    return res.status(200).json({
      ok: true,
      message: 'Listado de productores.',
      data: productores,
      total: productores.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerProductor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productor = await Productor.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Producto,
          as: 'productos',
          attributes: ['id', 'nombre', 'descripcion', 'precio', 'stock']
        }
      ]
    });

    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Productor no encontrado.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Productor obtenido.',
      data: productor
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarProductor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Productor no encontrado.'
      });
    }

    if (req.usuario.rol === 'productor' && Number(req.usuario.id) !== productor.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes modificar tu propio perfil.'
      });
    }

    await productor.update(data);

    return res.status(200).json({
      ok: true,
      message: 'Productor actualizado correctamente.',
      data: {
        id: productor.id,
        nombre: productor.nombre,
        email: productor.email,
        ubicacion: productor.ubicacion,
        tipo_productos: productor.tipo_productos,
        suscripcion: productor.suscripcion
      }
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarProductor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Productor no encontrado.'
      });
    }

    if (req.usuario.rol === 'productor' && Number(req.usuario.id) !== productor.id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo puedes eliminar tu propio perfil.'
      });
    }

    await productor.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Productor eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerEstadisticas = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productor = await Productor.findByPk(id);
    if (!productor) {
      return res.status(404).json({
        ok: false,
        message: 'Productor no encontrado.'
      });
    }

    const [productos, transacciones, chats] = await Promise.all([
      Producto.count({ where: { productor_id: id } }),
      Transaccion.count({ where: { productor_id: id } }),
      Chat.count({ where: { productor_id: id } })
    ]);

    return res.status(200).json({
      ok: true,
      message: 'Estadísticas del productor.',
      data: { productos, transacciones, chats }
    });
  } catch (error) {
    next(error);
  }
};

export const listaCompradoresVinculados = async (req, res, next) => {
  try {
    const { id } = req.params;

    const compradores = await Comprador.findAll({
      attributes: ['id', 'nombre', 'email', 'tipo', 'ubicacion'],
      include: [
        {
          model: Productor,
          as: 'productores',
          where: { id },
          attributes: []
        }
      ]
    });

    return res.status(200).json({
      ok: true,
      message: 'Compradores conectados al productor por transacciones.',
      data: compradores
    });
  } catch (error) {
    next(error);
  }
};