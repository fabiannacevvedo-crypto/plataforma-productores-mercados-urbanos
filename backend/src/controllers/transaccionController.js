import { matchedData } from 'express-validator';
import { Op } from 'sequelize';
import { Transaccion } from '../models/Transaccion.js';
import { Producto } from '../models/Producto.js';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';
import { Chat } from '../models/Chat.js';

export const listarTransacciones = async (req, res, next) => {
  try {
    const { estado, productor_id, comprador_id } = req.query;

    const where = {};
    if (estado) {
      where.estado = estado;
    }
    if (productor_id) {
      where.productor_id = productor_id;
    }
    if (comprador_id) {
      where.comprador_id = comprador_id;
    }

    const transacciones = await Transaccion.findAll({
      where,
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'precio']
        },
        {
          model: Productor,
          as: 'productor',
          attributes: ['id', 'nombre']
        },
        {
          model: Comprador,
          as: 'comprador',
          attributes: ['id', 'nombre', 'tipo']
        }
      ],
      order: [['fecha', 'DESC']]
    });

    return res.status(200).json({
      ok: true,
      message: 'Listado de transacciones.',
      data: transacciones,
      total: transacciones.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerTransaccion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaccion = await Transaccion.findByPk(id, {
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'descripcion', 'precio']
        },
        {
          model: Productor,
          as: 'productor',
          attributes: ['id', 'nombre']
        },
        {
          model: Comprador,
          as: 'comprador',
          attributes: ['id', 'nombre', 'tipo']
        }
      ]
    });

    if (!transaccion) {
      return res.status(404).json({
        ok: false,
        message: 'Transacción no encontrada.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Transacción obtenida.',
      data: transaccion
    });
  } catch (error) {
    next(error);
  }
};

export const crearTransaccion = async (req, res, next) => {
  try {
    const data = matchedData(req);

    const producto = await Producto.findByPk(data.producto_id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'El producto de la transacción no existe.'
      });
    }

    if (data.cantidad > producto.stock) {
      return res.status(400).json({
        ok: false,
        message: `No se puede crear el pedido: stock insuficiente (disponible: ${producto.stock}).`
      });
    }

    const transaccion = await Transaccion.create({
      producto_id: producto.id,
      productor_id: producto.productor_id,
      comprador_id: req.usuario.id,
      cantidad: data.cantidad,
      precio_negociado: data.precio_negociado,
      estado: 'pendiente'
    });

    return res.status(201).json({
      ok: true,
      message: 'Transacción creada en estado pendiente.',
      data: transaccion
    });
  } catch (error) {
    next(error);
  }
};

export const confirmarTransaccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const transaccion = await Transaccion.findByPk(id, {
      include: [
        {
          model: Producto,
          as: 'producto',
          attributes: ['id', 'nombre', 'stock', 'precio']
        },
        {
          model: Productor,
          as: 'productor',
          attributes: ['id', 'nombre']
        },
        {
          model: Comprador,
          as: 'comprador',
          attributes: ['id', 'nombre']
        }
      ]
    });

    if (!transaccion) {
      return res.status(404).json({
        ok: false,
        message: 'Transacción no encontrada.'
      });
    }

    if (data.estado === 'confirmado') {
      if (req.usuario.rol !== 'productor') {
        return res.status(403).json({
          ok: false,
          message: 'Solo el productor puede confirmar un pedido.'
        });
      }

      if (Number(req.usuario.id) !== transaccion.productor_id) {
        return res.status(403).json({
          ok: false,
          message: 'Solo el productor de la transacción puede confirmarla.'
        });
      }

      if (transaccion.estado !== 'pendiente') {
        return res.status(409).json({
          ok: false,
          message: 'Solo se pueden confirmar transacciones en estado pendiente.'
        });
      }

      if (transaccion.cantidad > transaccion.producto.stock) {
        return res.status(400).json({
          ok: false,
          message: `No se puede confirmar el pedido: stock insuficiente (disponible: ${transaccion.producto.stock}).`
        });
      }

      const ofertaValidada = await Chat.findOne({
        where: {
          productor_id: transaccion.productor_id,
          comprador_id: transaccion.comprador_id,
          precio_oferta: transaccion.precio_negociado
        }
      });

      if (!ofertaValidada) {
        return res.status(400).json({
          ok: false,
          message: 'El precio negociado debe coincidir con una oferta realizada en el chat.'
        });
      }

      await transaccion.producto.decrement('stock', { by: transaccion.cantidad });
      await transaccion.update({ estado: 'confirmado' });

      return res.status(200).json({
        ok: true,
        message: 'Transacción confirmada y stock actualizado.',
        data: transaccion
      });
    }

    if (data.estado === 'entregado') {
      if (req.usuario.rol !== 'comprador') {
        return res.status(403).json({
          ok: false,
          message: 'Solo el comprador puede marcar un pedido como entregado.'
        });
      }

      if (Number(req.usuario.id) !== transaccion.comprador_id) {
        return res.status(403).json({
          ok: false,
          message: 'Solo el comprador de la transacción puede marcarla como entregada.'
        });
      }

      if (transaccion.estado !== 'confirmado') {
        return res.status(409).json({
          ok: false,
          message: 'Solo se pueden entregar transacciones confirmadas.'
        });
      }

      await transaccion.update({ estado: 'entregado' });

      return res.status(200).json({
        ok: true,
        message: 'Transacción marcada como entregada.',
        data: transaccion
      });
    }
  } catch (error) {
    next(error);
  }
};