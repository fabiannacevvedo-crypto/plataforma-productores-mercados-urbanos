import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Comprador = sequelize.define(
  'Comprador',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    tipo: {
      type: DataTypes.ENUM('comercio', 'restaurante', 'mayorista'),
      allowNull: false
    },
    ubicacion: {
      type: DataTypes.STRING(150),
      allowNull: false
    }
  },
  {
    tableName: 'compradores',
    paranoid: true
  }
);