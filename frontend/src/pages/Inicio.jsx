import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { listarProductos } from '../services/productoService.js';
import { listarTransacciones } from '../services/mercadoService.js';
import Spinner from '../components/Spinner.jsx';

export default function Inicio() {
  const { usuario, rol } = useAuth();
  const [productos, setProductos] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resProductos, resTransacciones] = await Promise.all([
          listarProductos(),
          listarTransacciones()
        ]);
        setProductos(resProductos.data.data);
        setTransacciones(resTransacciones.data.data);
      } catch {
        setProductos([]);
        setTransacciones([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <Spinner />;

  const pendientes = transacciones.filter((t) => t.estado === 'pendiente').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-verde-700 to-verde-800 rounded-2xl text-white p-8 mb-8">
        <h1 className="text-3xl font-bold">
          Hola, {usuario?.nombre} 👋
        </h1>
        <p className="mt-2 text-green-200">
          {rol === 'productor'
            ? 'Publicá tus productos, negociá precios en el chat y gestioná tus pedidos.'
            : 'Encontrá productores rurales de Formosa y el NEA, negociá y realizá pedidos directos.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Productos publicados</p>
          <p className="text-3xl font-bold text-verde-700 mt-2">{productos.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Transacciones totales</p>
          <p className="text-3xl font-bold text-verde-700 mt-2">{transacciones.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pedidos pendientes</p>
          <p className="text-3xl font-bold text-naranja-600 mt-2">{pendientes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-verde-800 mb-4">Últimos productos</h2>
          {productos.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay productos publicados.</p>
          ) : (
            <ul className="divide-y">
              {productos.slice(0, 5).map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span>{p.nombre}</span>
                  <span className="text-gray-600 font-medium">${Number(p.precio).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-verde-800 mb-4">Últimas transacciones</h2>
          {transacciones.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay transacciones.</p>
          ) : (
            <ul className="divide-y">
              {transacciones.slice(0, 5).map((t) => (
                <li key={t.id} className="py-2 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">
                      {t.producto?.nombre} <span className="text-gray-500">· {t.cantidad} u</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.productor?.nombre} → {t.comprador?.nombre}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full capitalize ${
                      t.estado === 'confirmado'
                        ? 'bg-green-100 text-green-700'
                        : t.estado === 'entregado'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {t.estado}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}