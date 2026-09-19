import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} from '../services/productoService.js';
import { crearTransaccion } from '../services/mercadoService.js';
import Modal from '../components/Modal.jsx';
import Alerta from '../components/Alerta.jsx';
import Spinner from '../components/Spinner.jsx';

const formVacio = { nombre: '', descripcion: '', precio: '', stock: '' };

export default function Productos() {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [errores, setErrores] = useState([]);
  const [exito, setExito] = useState('');
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [cargandoEliminar, setCargandoEliminar] = useState(false);
  const [pedido, setPedido] = useState(null);
  const [formPedido, setFormPedido] = useState({ cantidad: '1', precio_negociado: '' });

  const cargar = async () => {
    setCargando(true);
    try {
      const { data } = await listarProductos();
      setProductos(data.data);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(formVacio);
    setErrores([]);
    setModalAbierto(true);
  };

  const abrirEditar = (producto) => {
    setEditando(producto);
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      stock: String(producto.stock)
    });
    setErrores([]);
    setModalAbierto(true);
  };

  const cambiar = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErrores([]);
    setExito('');

    const nuevos = [];
    if (!form.nombre.trim()) nuevos.push('El nombre es obligatorio.');
    if (!form.descripcion.trim()) nuevos.push('La descripción es obligatoria.');
    if (!form.precio || Number(form.precio) <= 0) nuevos.push('El precio debe ser mayor a 0.');
    if (form.stock === '' || Number(form.stock) < 0) nuevos.push('El stock debe ser mayor o igual a 0.');
    if (nuevos.length) {
      setErrores(nuevos);
      return;
    }

    try {
      const datos = {
        nombre: form.nombre,
        descripcion: form.descripcion,
        precio: Number(form.precio),
        stock: Number(form.stock)
      };
      if (editando) {
        await actualizarProducto(editando.id, datos);
        setExito('Producto actualizado correctamente.');
      } else {
        await crearProducto(datos);
        setExito('Producto publicado correctamente.');
      }
      setModalAbierto(false);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo guardar el producto.';
      setErrores([mensaje]);
    }
  };

  const confirmarEliminar = async () => {
    setCargandoEliminar(true);
    try {
      await eliminarProducto(productoAEliminar.id);
      setExito('Producto eliminado (soft delete).');
      setProductoAEliminar(null);
      cargar();
      setTimeout(() => setExito(''), 3000);
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo eliminar el producto.';
      setErrores([mensaje]);
    } finally {
      setCargandoEliminar(false);
    }
  };

  const abrirPedido = (producto) => {
    setPedido(producto);
    setFormPedido({ cantidad: '1', precio_negociado: String(producto.precio) });
    setErrores([]);
    setExito('');
  };

  const enviarPedido = async (e) => {
    e.preventDefault();
    setErrores([]);
    setExito('');

    const precioOferta = Number(formPedido.precio_negociado);
    const cantidad = Number(formPedido.cantidad);
    if (!cantidad || cantidad < 1) {
      setErrores(['La cantidad debe ser mayor a 0.']);
      return;
    }
    if (!precioOferta || precioOferta <= 0) {
      setErrores(['El precio negociado debe ser mayor a 0.']);
      return;
    }
    if (cantidad > pedido.stock) {
      setErrores([`Stock insuficiente. Disponible: ${pedido.stock}.`]);
      return;
    }

    try {
      const { data } = await crearTransaccion({
        producto_id: pedido.id,
        cantidad,
        precio_negociado: precioOferta
      });
      setExito(`Pedido #${data.data.id} creado en estado pendiente.`);
      setPedido(null);
      setTimeout(() => setExito(''), 4000);
    } catch (error) {
      setErrores([error.response?.data?.message || 'No se pudo crear el pedido.']);
    }
  };

  if (cargando) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-verde-800">Productos del campo</h1>
          <p className="text-gray-500 text-sm">
            {rol === 'productor'
              ? 'Publicá y gestioná tus productos.'
              : 'Explorá y realizá pedidos directos a los productores.'}
          </p>
        </div>
        {rol === 'productor' && (
          <button
            onClick={abrirNuevo}
            className="bg-verde-600 hover:bg-verde-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            + Publicar producto
          </button>
        )}
      </div>

      <Alerta tipo="exito" mensajes={[exito]} />
      <Alerta tipo="error" mensajes={errores} />

      {productos.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
          <p className="text-lg">Aún no hay productos publicados.</p>
          <p className="text-sm mt-1">Los productores pueden publicar sus productos desde esta sección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              <div className="bg-verde-100 px-5 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-verde-800">{p.nombre}</h3>
                <span className="bg-verde-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  ${Number(p.precio).toLocaleString('es-AR')}
                </span>
              </div>
              <div className="p-5 flex-1">
                <p className="text-gray-600 text-sm">{p.descripcion}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                  <span>Stock: {p.stock} u</span>
                  <span>Por {p.productor?.nombre || '—'}</span>
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-2">
                {rol === 'comprador' && (
                  <>
                    <button
                      onClick={() => abrirPedido(p)}
                      className="flex-1 bg-naranja-600 hover:bg-naranja-500 text-white text-sm font-semibold py-2 rounded-lg"
                    >
                      Pedir
                    </button>
                    <button
                      onClick={() => navigate(`/chats?productor=${p.productor?.id}`)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg"
                    >
                      Negociar
                    </button>
                  </>
                )}
                {rol === 'productor' && p.productor?.id === usuario?.id && (
                  <>
                    <button
                      onClick={() => abrirEditar(p)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 rounded-lg"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setProductoAEliminar(p);
                        setErrores([]);
                      }}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2 rounded-lg"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        abierto={modalAbierto}
        titulo={editando ? 'Editar producto' : 'Publicar producto'}
        onCerrar={() => setModalAbierto(false)}
      >
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={cambiar}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="precio"
                value={form.precio}
                onChange={cambiar}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                min="0"
                name="stock"
                value={form.stock}
                onChange={cambiar}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <Alerta tipo="error" mensajes={errores} />
          <button
            type="submit"
            className="w-full bg-verde-600 hover:bg-verde-700 text-white font-semibold py-2.5 rounded-lg"
          >
            {editando ? 'Guardar cambios' : 'Publicar'}
          </button>
        </form>
      </Modal>

      <Modal
        abierto={!!productoAEliminar}
        titulo="Confirmar eliminación"
        onCerrar={() => setProductoAEliminar(null)}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que querés eliminar <strong>{productoAEliminar?.nombre}</strong>? Esta acción
            realiza un borrado lógico (soft delete).
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setProductoAEliminar(null)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              disabled={cargandoEliminar}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
            >
              {cargandoEliminar ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        abierto={!!pedido}
        titulo={`Pedido · ${pedido?.nombre}`}
        onCerrar={() => setPedido(null)}
      >
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Productor: <strong>{pedido?.productor?.nombre}</strong> · Stock disponible:{' '}
            <strong>{pedido?.stock}</strong> u
          </p>
          <form onSubmit={enviarPedido} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                name="cantidad"
                value={formPedido.cantidad}
                onChange={(e) => setFormPedido({ ...formPedido, cantidad: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio negociado ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="precio_negociado"
                value={formPedido.precio_negociado}
                onChange={(e) => setFormPedido({ ...formPedido, precio_negociado: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Para confirmarse, este precio debe coincidir con una oferta enviada en el chat.
              </p>
            </div>
            <Alerta tipo="error" mensajes={errores} />
            <button
              type="submit"
              className="w-full bg-naranja-600 hover:bg-naranja-500 text-white font-semibold py-2.5 rounded-lg"
            >
              Crear pedido
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}