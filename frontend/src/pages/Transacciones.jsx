import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { listarTransacciones, actualizarEstadoTransaccion } from '../services/mercadoService.js';
import Spinner from '../components/Spinner.jsx';
import Alerta from '../components/Alerta.jsx';

const badges = {
  pendiente: 'bg-amber-100 text-amber-700',
  confirmado: 'bg-green-100 text-green-700',
  entregado: 'bg-blue-100 text-blue-700'
};

export default function Transacciones() {
  const { usuario, rol } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const params = {};
      if (rol === 'productor') {
        params.productor_id = usuario.id;
      } else if (rol === 'comprador') {
        params.comprador_id = usuario.id;
      }
      const { data } = await listarTransacciones(params);
      setTransacciones(data.data);
    } catch {
      setTransacciones([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cambiarEstado = async (t, estado) => {
    setError('');
    setMensaje('');
    try {
      const { data } = await actualizarEstadoTransaccion(t.id, estado);
      setMensaje(data.message);
      cargar();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el estado.');
    }
  };

  if (cargando) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-verde-800">Órdenes y pedidos</h1>
        <p className="text-gray-500 text-sm">Seguimiento del estado de cada transacción negociada.</p>
      </div>

      <Alerta tipo="exito" mensajes={[mensaje]} />
      <Alerta tipo="error" mensajes={[error]} />

      {transacciones.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          <p className="text-lg">No hay transacciones {rol === 'productor' ? 'de tus productos' : 'a tu nombre'}.</p>
          <p className="text-sm mt-1">
            {rol === 'comprador'
              ? 'Realizá pedidos desde la sección Productos o negociá en el chat.'
              : 'Los pedidos aparecerán acá cuando un comprador los genere.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">#</th>
                <th className="px-5 py-3 font-semibold">Producto</th>
                <th className="px-5 py-3 font-semibold">Productor</th>
                <th className="px-5 py-3 font-semibold">Comprador</th>
                <th className="px-5 py-3 font-semibold">Cant.</th>
                <th className="px-5 py-3 font-semibold">Precio negociado</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transacciones.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-400">{t.id}</td>
                  <td className="px-5 py-3 font-medium">{t.producto?.nombre}</td>
                  <td className="px-5 py-3">{t.productor?.nombre}</td>
                  <td className="px-5 py-3">{t.comprador?.nombre}</td>
                  <td className="px-5 py-3">{t.cantidad}</td>
                  <td className="px-5 py-3 font-semibold text-verde-700">
                    ${Number(t.precio_negociado).toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${badges[t.estado]}`}>
                      {t.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {rol === 'productor' && t.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(t, 'confirmado')}
                        className="bg-verde-600 hover:bg-verde-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Confirmar
                      </button>
                    )}
                    {rol === 'comprador' && t.estado === 'confirmado' && (
                      <button
                        onClick={() => cambiarEstado(t, 'entregado')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        Marcar entregado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}