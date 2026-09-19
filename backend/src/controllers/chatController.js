import { matchedData } from 'express-validator';
import { Chat } from '../models/Chat.js';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';

export const listarChats = async (req, res, next) => {
  try {
    const { productor_id, comprador_id } = req.query;

    const where = {};
    if (productor_id) {
      where.productor_id = productor_id;
    }
    if (comprador_id) {
      where.comprador_id = comprador_id;
    }

    const mensajes = await Chat.findAll({
      where,
      include: [
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
      ],
      order: [['fecha', 'ASC']]
    });

    return res.status(200).json({
      ok: true,
      message: 'Mensajes de negociación.',
      data: mensajes
    });
  } catch (error) {
    next(error);
  }
};

export const conversacionEntre = async (req, res, next) => {
  try {
    const { productor_id, comprador_id } = req.params;

    const mensajes = await Chat.findAll({
      where: {
        productor_id,
        comprador_id
      },
      include: [
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
      ],
      order: [['fecha', 'ASC']]
    });

    return res.status(200).json({
      ok: true,
      message: 'Conversación obtenida.',
      data: mensajes
    });
  } catch (error) {
    next(error);
  }
};

export const enviarMensaje = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const { productor_id, comprador_id } = req.params;

    const [productor, comprador] = await Promise.all([
      Productor.findByPk(productor_id),
      Comprador.findByPk(comprador_id)
    ]);

    if (!productor || !comprador) {
      return res.status(404).json({
        ok: false,
        message: 'Productor o comprador no encontrado.'
      });
    }

    const deProductor = req.usuario.rol === 'productor'
      ? Number(req.usuario.id) === Number(productor_id)
      : false;
    const deComprador = req.usuario.rol === 'comprador'
      ? Number(req.usuario.id) === Number(comprador_id)
      : false;

    if (!deProductor && !deComprador) {
      return res.status(403).json({
        ok: false,
        message: 'Solo los participantes de la conversación pueden enviar mensajes.'
      });
    }

    const mensaje = await Chat.create({
      productor_id,
      comprador_id,
      mensaje: data.mensaje,
      precio_oferta: data.precio_oferta || null
    });

    const mensajeCompleto = await Chat.findByPk(mensaje.id, {
      include: [
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

    return res.status(201).json({
      ok: true,
      message: 'Mensaje enviado correctamente.',
      data: mensajeCompleto
    });
  } catch (error) {
    next(error);
  }
};