import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest } from '../services/authService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario')) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) return;
    try {
      setUsuario(JSON.parse(usuarioGuardado));
    } catch {
      setUsuario(null);
    }
  }, []);

  const iniciarSesion = async (datos) => {
    const { data } = await loginRequest(datos);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    localStorage.setItem('rol', data.rol);
    setToken(data.token);
    setUsuario(data.usuario);
    return data;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    setToken(null);
    setUsuario(null);
  };

  const rol = localStorage.getItem('rol') || null;

  return (
    <AuthContext.Provider value={{ usuario, token, rol, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);