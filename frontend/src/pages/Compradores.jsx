import { useEffect, useState } from 'react';
import { listarCompradores } from '../services/mercadoService.js';
import Spinner from '../components/Spinner.jsx';

const badgeTipo = {
  comercio: 'bg-indigo-100 text-indigo-700',
  restaurante: 'bg-rose-100 text-rose-700',
  mayorista: 'bg-violet-100 text-violet-700'
};

export default function Compradores() {
  const [compradores, setCompradores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await listarCompradores();
        setCompradores(data.data);
      } catch {
        setCompradores([]);
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
        <h1 className="text-2xl font-bold text-verde-800">Compradores urbanos</h1>
        <p className="text-gray-500 text-sm">Comercios, restaurantes y mayoristas buscando producción local.</p>
      </div>

      {compradores.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          Todavía no hay compradores registrados.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Ubicación</th>
                <th className="px-5 py-3 font-semibold">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {compradores.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{c.nombre}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${badgeTipo[c.tipo]}`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{c.ubicacion}</td>
                  <td className="px-5 py-3 text-gray-500">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}