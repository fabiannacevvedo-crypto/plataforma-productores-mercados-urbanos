import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const ruta = `${window.location.pathname}${window.location.search}`;
      if (ruta !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;