import { useEffect, useState } from 'react';
import { listarProductores } from '../services/authService.js';
import { estadisticasProductor } from '../services/authService.js';
import Spinner from '../components/Spinner.jsx';

const badge = {
  premium: 'bg-amber-100 text-amber-700',
  estandar: 'bg-gray-100 text-gray-600'
};

export default function Productores() {
  const [productores, setProductores] = useState([]);
  const [stats, setStats] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await listarProductores();
        setProductores(data.data);
        const promesas = data.data.map(async (p) => {
          try {
            const res = await estadisticasProductor(p.id);
            return { [p.id]: res.data.data };
          } catch {
            return { [p.id]: { productos: 0, transacciones: 0, chats: 0 } };
          }
        });
        const resultados = await Promise.all(promesas);
        setStats(Object.assign({}, ...resultados));
      } catch {
        setProductores([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-verde-800">Productores rurales</h1>
        <p className="text-gray-500 text-sm">Formosa y el NEA, conectados directo con el mercado urbano.</p>
      </div>

      {productores.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          Todavía no hay productores registrados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productores.map((p) => {
            const s = stats[p.id] || {};
            return (
              <div key={p.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-verde-800">{p.nombre}</h3>
                    <p className="text-gray-500 text-sm">{p.ubicacion}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${badge[p.suscripcion]}`}>
                    {p.suscripcion}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  <span className="font-medium">Productos:</span> {p.tipo_productos}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-verde-50 rounded-lg py-2">
                    <p className="font-bold text-verde-700">{s.productos ?? '—'}</p>
                    <p className="text-xs text-gray-500">Productos</p>
                  </div>
                  <div className="bg-verde-50 rounded-lg py-2">
                    <p className="font-bold text-verde-700">{s.transacciones ?? '—'}</p>
                    <p className="text-xs text-gray-500">Ventas</p>
                  </div>
                  <div className="bg-verde-50 rounded-lg py-2">
                    <p className="font-bold text-verde-700">{s.chats ?? '—'}</p>
                    <p className="text-xs text-gray-500">Chats</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}