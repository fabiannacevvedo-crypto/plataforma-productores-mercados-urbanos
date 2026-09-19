import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Producto = sequelize.define(
  'Producto',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    productor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productores',
        key: 'id'
      }
    }
  },
  {
    tableName: 'productos',
    paranoid: true
  }
);