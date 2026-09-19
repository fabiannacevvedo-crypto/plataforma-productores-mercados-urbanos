import api from './api.js';

export const listarProductos = (params) => api.get('/productos', { params });

export const obtenerProducto = (id) => api.get(`/productos/${id}`);

export const crearProducto = (datos) => api.post('/productos', datos);

export const actualizarProducto = (id, datos) => api.patch(`/productos/${id}`, datos);

export const eliminarProducto = (id) => api.delete(`/productos/${id}`);