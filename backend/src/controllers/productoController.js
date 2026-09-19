import { matchedData } from 'express-validator';
import { Op } from 'sequelize';
import { Producto } from '../models/Producto.js';
import { Productor } from '../models/Productor.js';

export const listarProductos = async (req, res, next) => {
  try {
    const { productor_id, en_stock } = req.query;

    const where = {};
    if (productor_id) {
      where.productor_id = productor_id;
    }
    if (en_stock === 'true') {
      where.stock = { [Op.gt]: 0 };
    }

    const productos = await Producto.findAll({
      where,
      include: [
        {
          model: Productor,
          as: 'productor',
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      ok: true,
      message: 'Listado de productos.',
      data: productos,
      total: productos.length
    });
  } catch (error) {
    next(error);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id, {
      include: [
        {
          model: Productor,
          as: 'productor',
          attributes: ['id', 'nombre', 'ubicacion']
        }
      ]
    });

    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Producto obtenido.',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    const data = matchedData(req);

    const productor = await Productor.findByPk(req.usuario.id);
    if (!productor) {
      return res.status(400).json({
        ok: false,
        message: 'No se puede publicar un producto sin un productor asignado.'
      });
    }

    const producto = await Producto.create({
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      stock: data.stock,
      productor_id: productor.id
    });

    return res.status(201).json({
      ok: true,
      message: 'Producto publicado correctamente.',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = matchedData(req);

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== producto.productor_id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo el productor dueño del producto puede modificarlo.'
      });
    }

    await producto.update(data);

    return res.status(200).json({
      ok: true,
      message: 'Producto actualizado correctamente.',
      data: producto
    });
  } catch (error) {
    next(error);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado.'
      });
    }

    if (Number(req.usuario.id) !== producto.productor_id) {
      return res.status(403).json({
        ok: false,
        message: 'Solo el productor dueño del producto puede eliminarlo.'
      });
    }

    await producto.destroy();

    return res.status(200).json({
      ok: true,
      message: 'Producto eliminado correctamente (soft delete).'
    });
  } catch (error) {
    next(error);
  }
};