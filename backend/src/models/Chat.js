import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Chat = sequelize.define(
  'Chat',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    precio_oferta: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0.01
      }
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'chats',
    paranoid: true
  }
);