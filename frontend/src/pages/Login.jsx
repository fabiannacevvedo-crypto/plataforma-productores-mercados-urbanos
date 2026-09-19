import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alerta from '../components/Alerta.jsx';
import Spinner from '../components/Spinner.jsx';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrores([]);

    const nuevos = [];
    if (!form.email.trim()) nuevos.push('El email es obligatorio.');
    if (!form.password.trim()) nuevos.push('La contraseña es obligatoria.');
    if (nuevos.length) {
      setErrores(nuevos);
      return;
    }

    setCargando(true);
    try {
      await iniciarSesion(form);
      navigate('/');
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo iniciar sesión.';
      setErrores([mensaje]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-verde-800 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-verde-800">Productores & Mercados Urbanos</h1>
          <p className="text-gray-500 mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={cambiar}
              placeholder="usuario@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={cambiar}
              placeholder="••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          <Alerta tipo="error" mensajes={errores} />

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Sin cuenta?{' '}
          <Link to="/registro" className="text-verde-700 font-semibold hover:underline">
            Registrate como productor o comprador
          </Link>
        </div>
      </div>
    </div>
  );
}