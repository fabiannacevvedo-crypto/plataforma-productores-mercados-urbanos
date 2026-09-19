import { Productor } from './Productor.js';
import { Producto } from './Producto.js';
import { Comprador } from './Comprador.js';
import { Transaccion } from './Transaccion.js';
import { Chat } from './Chat.js';
import { sequelize } from '../config/db.js';

Productor.hasMany(Producto, {
  foreignKey: 'productor_id',
  as: 'productos'
});
Producto.belongsTo(Productor, {
  foreignKey: 'productor_id',
  as: 'productor'
});

Comprador.hasMany(Transaccion, {
  foreignKey: 'comprador_id',
  as: 'pedidos'
});
Transaccion.belongsTo(Comprador, {
  foreignKey: 'comprador_id',
  as: 'comprador'
});

Producto.hasMany(Transaccion, {
  foreignKey: 'producto_id',
  as: 'transacciones'
});
Transaccion.belongsTo(Producto, {
  foreignKey: 'producto_id',
  as: 'producto'
});

Productor.belongsToMany(Comprador, {
  through: { model: Transaccion, unique: false },
  foreignKey: 'productor_id',
  otherKey: 'comprador_id',
  as: 'compradores'
});
Comprador.belongsToMany(Productor, {
  through: { model: Transaccion, unique: false },
  foreignKey: 'comprador_id',
  otherKey: 'productor_id',
  as: 'productores'
});

Productor.hasMany(Transaccion, {
  foreignKey: 'productor_id',
  as: 'transacciones'
});
Transaccion.belongsTo(Productor, {
  foreignKey: 'productor_id',
  as: 'productor'
});

Productor.hasMany(Chat, {
  foreignKey: 'productor_id',
  as: 'chats'
});
Chat.belongsTo(Productor, {
  foreignKey: 'productor_id',
  as: 'productor'
});

Comprador.hasMany(Chat, {
  foreignKey: 'comprador_id',
  as: 'chats'
});
Chat.belongsTo(Comprador, {
  foreignKey: 'comprador_id',
  as: 'comprador'
});

Productor.belongsToMany(Comprador, {
  through: { model: Chat, unique: false },
  foreignKey: 'productor_id',
  otherKey: 'comprador_id',
  as: 'compradoresChat'
});
Comprador.belongsToMany(Productor, {
  through: { model: Chat, unique: false },
  foreignKey: 'comprador_id',
  otherKey: 'productor_id',
  as: 'productoresChat'
});

export const db = {
  Productor,
  Producto,
  Comprador,
  Transaccion,
  Chat,
  sequelize
};