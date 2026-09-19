import api from './api.js';

export const login = (datos) => api.post('/auth/login', datos);

export const registrarProductor = (datos) => api.post('/auth/productores/registro', datos);

export const registrarComprador = (datos) => api.post('/compradores/registro', datos);

export const listarProductores = () => api.get('/productores');

export const obtenerProductor = (id) => api.get(`/productores/${id}`);

export const actualizarProductor = (id, datos) => api.patch(`/productores/${id}`, datos);

export const eliminarProductor = (id) => api.delete(`/productores/${id}`);

export const estadisticasProductor = (id) => api.get(`/productores/${id}/estadisticas`);