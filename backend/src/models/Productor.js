import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Productor = sequelize.define(
  'Productor',
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
    ubicacion: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    tipo_productos: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    suscripcion: {
      type: DataTypes.ENUM('premium', 'estandar'),
      allowNull: false,
      defaultValue: 'estandar'
    }
  },
  {
    tableName: 'productores',
    paranoid: true
  }
);