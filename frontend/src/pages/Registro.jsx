import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrarProductor, registrarComprador } from '../services/authService.js';
import Alerta from '../components/Alerta.jsx';

export default function Registro() {
  const navigate = useNavigate();
  const [rol, setRol] = useState('productor');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    ubicacion: '',
    tipo_productos: '',
    tipo: 'comercio',
    suscripcion: 'estandar'
  });
  const [errores, setErrores] = useState([]);
  const [exito, setExito] = useState('');

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrores([]);
    setExito('');

    const nuevos = [];
    if (!form.nombre.trim()) nuevos.push('El nombre es obligatorio.');
    if (!form.email.trim()) nuevos.push('El email es obligatorio.');
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nuevos.push('El email no es válido.');
    if (!form.password.trim()) nuevos.push('La contraseña es obligatoria.');
    else if (form.password.length < 6) nuevos.push('La contraseña debe tener al menos 6 caracteres.');
    if (!form.ubicacion.trim()) nuevos.push('La ubicación es obligatoria.');
    if (rol === 'productor' && !form.tipo_productos.trim()) nuevos.push('El tipo de productos es obligatorio.');
    if (nuevos.length) {
      setErrores(nuevos);
      return;
    }

    try {
      const datos =
        rol === 'productor'
          ? {
              nombre: form.nombre,
              email: form.email,
              password: form.password,
              ubicacion: form.ubicacion,
              tipo_productos: form.tipo_productos,
              suscripcion: form.suscripcion
            }
          : {
              nombre: form.nombre,
              email: form.email,
              password: form.password,
              ubicacion: form.ubicacion,
              tipo: form.tipo
            };

      if (rol === 'productor') {
        const { data } = await registrarProductor(datos);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('rol', 'productor');
      } else {
        const { data } = await registrarComprador(datos);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('rol', 'comprador');
      }

      setExito('Registro exitoso. Redirigiendo...');
      setTimeout(() => navigate('/'), 1200);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo completar el registro.';
      setErrores([mensaje]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-verde-800 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-verde-800">Crear cuenta</h1>
          <p className="text-gray-500 mt-1">Unite a la plataforma</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {['productor', 'comprador'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRol(r);
                setErrores([]);
              }}
              className={`py-2 rounded-lg font-medium capitalize transition ${
                rol === r ? 'bg-verde-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r === 'productor' ? 'Productor' : 'Comprador'}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={cambiar}
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              name="ubicacion"
              value={form.ubicacion}
              onChange={cambiar}
              placeholder="Ej: Formosa Capital, Clorinda..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
            />
          </div>

          {rol === 'productor' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de productos</label>
                <input
                  name="tipo_productos"
                  value={form.tipo_productos}
                  onChange={cambiar}
                  placeholder="Ej: Hortalizas, frutas, lácteos"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-verde-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suscripción</label>
                <select
                  name="suscripcion"
                  value={form.suscripcion}
                  onChange={cambiar}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="estandar">Estándar</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de comprador</label>
              <select
                name="tipo"
                value={form.tipo}
                onChange={cambiar}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="comercio">Comercio</option>
                <option value="restaurante">Restaurante</option>
                <option value="mayorista">Mayorista</option>
              </select>
            </div>
          )}

          <Alerta tipo="error" mensajes={errores} />
          <Alerta tipo="exito" mensajes={[exito]} />

          <button
            type="submit"
            className="w-full bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2.5 rounded-lg"
          >
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="text-verde-700 font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}