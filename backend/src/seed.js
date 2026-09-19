import bcrypt from 'bcryptjs';
import { sequelize } from './config/db.js';
import { Productor } from './models/Productor.js';
import { Producto } from './models/Producto.js';
import { Comprador } from './models/Comprador.js';
import { Transaccion } from './models/Transaccion.js';
import { Chat } from './models/Chat.js';
import './models/index.js';

const limpiar = async () => {
  await Transaccion.destroy({ where: {}, force: true });
  await Chat.destroy({ where: {}, force: true });
  await Producto.destroy({ where: {}, force: true });
  await Productor.destroy({ where: {}, force: true });
  await Comprador.destroy({ where: {}, force: true });
};

const crearDatos = async () => {
  const hash = await bcrypt.hash('123456', 10);

  const productor1 = await Productor.create({
    nombre: 'Juan Pérez',
    email: 'juan@productor.com',
    password: hash,
    ubicacion: 'Formosa Capital',
    tipo_productos: 'Hortalizas',
    suscripcion: 'premium'
  });

  const productor2 = await Productor.create({
    nombre: 'María López',
    email: 'maria@productor.com',
    password: hash,
    ubicacion: 'Clorinda',
    tipo_productos: 'Frutas tropicales',
    suscripcion: 'estandar'
  });

  const comprador1 = await Comprador.create({
    nombre: 'Restaurante Sabores',
    email: 'comprar@restaurante.com',
    password: hash,
    tipo: 'restaurante',
    ubicacion: 'Ciudad de Formosa'
  });

  const comprador2 = await Comprador.create({
    nombre: 'Mayorista Central',
    email: 'ventas@mayorista.com',
    password: hash,
    tipo: 'mayorista',
    ubicacion: 'Resistencia'
  });

  const producto1 = await Producto.create({
    nombre: 'Tomate perita',
    descripcion: 'Tomate perita de estación, producción libre de agroquímicos.',
    precio: 2500,
    stock: 100,
    productor_id: productor1.id
  });

  const producto2 = await Producto.create({
    nombre: 'Mango',
    descripcion: 'Mango fresco cosechado en Clorinda.',
    precio: 4500,
    stock: 50,
    productor_id: productor2.id
  });

  const chat1 = await Chat.create({
    productor_id: productor1.id,
    comprador_id: comprador1.id,
    mensaje: 'Buenos días, ¿en cuánto me dejaría el tomate si pido 50 kg?',
    precio_oferta: 2300
  });

  await Chat.create({
    productor_id: productor1.id,
    comprador_id: comprador1.id,
    mensaje: 'Puedo venderle el kilo a $2400 si retira en el día.',
    precio_oferta: 2400
  });

  await Transaccion.create({
    producto_id: producto1.id,
    productor_id: productor1.id,
    comprador_id: comprador1.id,
    cantidad: 50,
    precio_negociado: 2400,
    estado: 'pendiente'
  });

  await Transaccion.create({
    producto_id: producto2.id,
    productor_id: productor2.id,
    comprador_id: comprador2.id,
    cantidad: 20,
    precio_negociado: 4300,
    estado: 'confirmado'
  });

  console.log('Base de datos sembrada correctamente.');
  console.log('Usuarios de prueba (password: 123456):');
  console.log('  Productor: juan@productor.com / maria@productor.com');
  console.log('  Comprador: comprar@restaurante.com / ventas@mayorista.com');
};

const ejecutar = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await limpiar();
    await crearDatos();
  } catch (error) {
    console.error('Error al sembrar la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

ejecutar();