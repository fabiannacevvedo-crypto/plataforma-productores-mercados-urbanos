import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Transaccion = sequelize.define(
  'Transaccion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    producto_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'id'
      }
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productores',
        key: 'id'
      }
    },
    comprador_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'compradores',
        key: 'id'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    precio_negociado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmado', 'entregado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'transacciones',
    paranoid: true
  }
);