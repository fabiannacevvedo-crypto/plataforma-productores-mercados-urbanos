import api from './api.js';

export const listarCompradores = () => api.get('/compradores');

export const obtenerComprador = (id) => api.get(`/compradores/${id}`);

export const actualizarComprador = (id, datos) => api.patch(`/compradores/${id}`, datos);

export const eliminarComprador = (id) => api.delete(`/compradores/${id}`);

export const listarTransacciones = (params) => api.get('/transacciones', { params });

export const crearTransaccion = (datos) => api.post('/transacciones', datos);

export const actualizarEstadoTransaccion = (id, estado) => api.patch(`/transacciones/${id}/estado`, { estado });

export const listarChats = (params) => api.get('/chats', { params });

export const obtenerConversacion = (productorId, compradorId) =>
  api.get(`/chats/productor/${productorId}/comprador/${compradorId}`);

export const enviarMensaje = (productorId, compradorId, datos) =>
  api.post(`/chats/productor/${productorId}/comprador/${compradorId}`, datos);