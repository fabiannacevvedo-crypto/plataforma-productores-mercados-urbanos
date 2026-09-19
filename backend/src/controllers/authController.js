import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { matchedData } from 'express-validator';
import { Productor } from '../models/Productor.js';
import { Comprador } from '../models/Comprador.js';
import { env } from '../config/env.js';

const generarToken = (usuario, rol) => {
  return jwt.sign(
    { id: usuario.id, rol, email: usuario.email },
    env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

export const registrarProductor = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const [existeProductor, existeComprador] = await Promise.all([
      Productor.findOne({ where: { email } }),
      Comprador.findOne({ where: { email } })
    ]);

    if (existeProductor || existeComprador) {
      return res.status(409).json({
        ok: false,
        message: 'El email ya se encuentra registrado.'
      });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const productor = await Productor.create({
      nombre: data.nombre,
      email,
      password: hash,
      ubicacion: data.ubicacion,
      tipo_productos: data.tipo_productos,
      suscripcion: data.suscripcion || 'estandar'
    });

    const token = generarToken(productor, 'productor');

    return res.status(201).json({
      ok: true,
      message: 'Productor registrado correctamente.',
      token,
      usuario: {
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

export const registrarComprador = async (req, res, next) => {
  try {
    const data = matchedData(req);
    const email = data.email.toLowerCase();

    const [existeComprador, existeProductor] = await Promise.all([
      Comprador.findOne({ where: { email } }),
      Productor.findOne({ where: { email } })
    ]);

    if (existeComprador || existeProductor) {
      return res.status(409).json({
        ok: false,
        message: 'El email ya se encuentra registrado.'
      });
    }

    const hash = await bcrypt.hash(data.password, 10);
    const comprador = await Comprador.create({
      nombre: data.nombre,
      email,
      password: hash,
      tipo: data.tipo,
      ubicacion: data.ubicacion
    });

    const token = generarToken(comprador, 'comprador');

    return res.status(201).json({
      ok: true,
      message: 'Comprador registrado correctamente.',
      token,
      usuario: {
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

export const login = async (req, res, next) => {
  try {
    const { email } = matchedData(req);
    const { password } = matchedData(req);
    const emailNormalizado = email.toLowerCase();

    const [productor, comprador] = await Promise.all([
      Productor.findOne({ where: { email: emailNormalizado } }),
      Comprador.findOne({ where: { email: emailNormalizado } })
    ]);

    if (productor && (await bcrypt.compare(password, productor.password))) {
      const token = generarToken(productor, 'productor');
      return res.status(200).json({
        ok: true,
        message: 'Inicio de sesión correcto.',
        token,
        rol: 'productor',
        usuario: {
          id: productor.id,
          nombre: productor.nombre,
          email: productor.email,
          ubicacion: productor.ubicacion,
          tipo_productos: productor.tipo_productos,
          suscripcion: productor.suscripcion
        }
      });
    }

    if (comprador && (await bcrypt.compare(password, comprador.password))) {
      const token = generarToken(comprador, 'comprador');
      return res.status(200).json({
        ok: true,
        message: 'Inicio de sesión correcto.',
        token,
        rol: 'comprador',
        usuario: {
          id: comprador.id,
          nombre: comprador.nombre,
          email: comprador.email,
          tipo: comprador.tipo,
          ubicacion: comprador.ubicacion
        }
      });
    }

    return res.status(401).json({
      ok: false,
      message: 'Credenciales inválidas.'
    });
  } catch (error) {
    next(error);
  }
};