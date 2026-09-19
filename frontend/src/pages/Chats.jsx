import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { listarProductores } from '../services/authService.js';
import { listarCompradores } from '../services/mercadoService.js';
import { obtenerConversacion, enviarMensaje } from '../services/mercadoService.js';
import Spinner from '../components/Spinner.jsx';
import Alerta from '../components/Alerta.jsx';

export default function Chats() {
  const { usuario, rol } = useAuth();
  const [searchParams] = useSearchParams();
  const [partners, setPartners] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargandoPartners, setCargandoPartners] = useState(true);
  const [cargandoChat, setCargandoChat] = useState(false);
  const [texto, setTexto] = useState('');
  const [precioOferta, setPrecioOferta] = useState('');
  const [error, setError] = useState('');
  const finalRef = useRef(null);

  const cargarPartners = async () => {
    setCargandoPartners(true);
    try {
      if (rol === 'comprador') {
        const { data } = await listarProductores();
        setPartners(data.data);
        const inicial = searchParams.get('productor');
        if (inicial) {
          const encontrado = data.data.find((p) => String(p.id) === inicial);
          if (encontrado) setSeleccionado(encontrado);
        }
      } else {
        const { data } = await listarCompradores();
        setPartners(data.data);
      }
    } catch {
      setPartners([]);
    } finally {
      setCargandoPartners(false);
    }
  };

  useEffect(() => {
    cargarPartners();
  }, []);

  useEffect(() => {
    if (!seleccionado) return;
    const cargarChat = async () => {
      setCargandoChat(true);
      setError('');
      try {
        const ids =
          rol === 'comprador'
            ? { productor_id: seleccionado.id, comprador_id: usuario.id }
            : { productor_id: usuario.id, comprador_id: seleccionado.id };
        const { data } = await obtenerConversacion(ids.productor_id, ids.comprador_id);
        setMensajes(data.data);
      } catch {
        setMensajes([]);
        setError('No se pudo cargar la conversación.');
      } finally {
        setCargandoChat(false);
      }
    };
    cargarChat();
  }, [seleccionado?.id]);

  useEffect(() => {
    finalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async (e) => {
    e.preventDefault();
    setError('');
    if (!texto.trim()) return;

    try {
      const ids =
        rol === 'comprador'
          ? { productor_id: seleccionado.id, comprador_id: usuario.id }
          : { productor_id: usuario.id, comprador_id: seleccionado.id };

      const { data } = await enviarMensaje(ids.productor_id, ids.comprador_id, {
        mensaje: texto,
        precio_oferta: precioOferta ? Number(precioOferta) : null
      });
      setMensajes((prev) => [...prev, data.data]);
      setTexto('');
      setPrecioOferta('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el mensaje.');
    }
  };

  const formatearFecha = (f) => {
    const d = new Date(f);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-verde-800 mb-1">Negociación</h1>
      <p className="text-gray-500 text-sm mb-6">
        Chateá y acordá precios. Para confirmar un pedido, el precio negociado debe coincidir con una oferta del chat.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white rounded-xl shadow overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 font-semibold text-gray-700 text-sm">
            {rol === 'comprador' ? 'Productores' : 'Compradores'}
          </div>
          {cargandoPartners ? (
            <div className="p-4 text-sm text-gray-500">Cargando...</div>
          ) : partners.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Sin contactos disponibles.</div>
          ) : (
            <ul className="divide-y max-h-[500px] overflow-y-auto">
              {partners.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => setSeleccionado(p)}
                    className={`w-full text-left px-4 py-3 hover:bg-verde-50 transition ${
                      seleccionado?.id === p.id ? 'bg-verde-100' : ''
                    }`}
                  >
                    <p className="font-medium text-sm text-verde-800">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.ubicacion}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-3 bg-white rounded-xl shadow flex flex-col">
          <div className="px-5 py-3 bg-verde-700 text-white font-semibold rounded-t-xl">
            {seleccionado ? `Conversación con ${seleccionado.nombre}` : 'Seleccioná un contacto'}
          </div>

          <div className="flex-1 p-5 space-y-3 max-h-[400px] overflow-y-auto bg-gray-50">
            {!seleccionado ? (
              <p className="text-center text-gray-400 py-10">
                Elegí un contacto para iniciar la negociación.
              </p>
            ) : cargandoChat ? (
              <p className="text-center text-gray-400 py-10">Cargando conversación...</p>
            ) : mensajes.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                Sin mensajes todavía. Iniciá la negociación.
              </p>
            ) : (
              mensajes.map((m) => {
                const propio =
                  (rol === 'comprador' && m.comprador?.id === usuario.id) ||
                  (rol === 'productor' && m.productor?.id === usuario.id);
                return (
                  <div key={m.id} className={`flex ${propio ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-xl px-4 py-2 ${
                        propio ? 'bg-verde-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-xs font-semibold mb-0.5 opacity-80">
                        {propio ? 'Vos' : m.comprador?.nombre || m.productor?.nombre}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{m.mensaje}</p>
                      {m.precio_oferta && (
                        <p
                          className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                            propio ? 'bg-verde-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Oferta: ${Number(m.precio_oferta).toLocaleString('es-AR')}
                        </p>
                      )}
                      <p className={`text-[10px] mt-1 ${propio ? 'text-green-200' : 'text-gray-400'}`}>
                        {formatearFecha(m.fecha)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={finalRef} />
          </div>

          {seleccionado && (
            <form onSubmit={enviar} className="p-4 border-t space-y-3">
              <Alerta tipo="error" mensajes={[error]} />
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Escribí tu mensaje..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={precioOferta}
                  onChange={(e) => setPrecioOferta(e.target.value)}
                  placeholder="Oferta $"
                  className="md:w-40 border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  className="bg-verde-600 hover:bg-verde-700 text-white font-semibold px-5 py-2 rounded-lg"
                >
                  Enviar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}