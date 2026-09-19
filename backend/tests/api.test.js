import { app } from '../app.js';
import { sequelize } from '../src/config/db.js';
import '../src/models/index.js';

const PUERTO = 4100;
const base = `http://127.0.0.1:${PUERTO}/api/v1`;

let fallos = 0;
const ok = (nombre, condicion, detalle = '') => {
  if (condicion) {
    console.log(`  PASS - ${nombre}`);
  } else {
    console.log(`  FAIL - ${nombre} ${detalle}`);
    fallos++;
  }
};

const api = async (path, options = {}) => {
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
};

const tokenComprador = async (email) => {
  const r = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: '123456' })
  });
  return r.json.token;
};

const inicio = async () => {
  await sequelize.sync({ force: true });

  const hashBcrypt = (await import('bcryptjs')).default;
  const hash = await hashBcrypt.hash('123456', 10);
  const { Productor } = await import('../src/models/Productor.js');
  const { Comprador } = await import('../src/models/Comprador.js');

  await Productor.create({ nombre: 'Juan', email: 'juan@test.com', password: hash, ubicacion: 'FSA', tipo_productos: 'Hortalizas', suscripcion: 'premium' });
  await Comprador.create({ nombre: 'Resto', email: 'resto@test.com', password: hash, tipo: 'restaurante', ubicacion: 'FSA' });

  await new Promise((resolve) => app.listen(PUERTO, resolve));
  console.log('Servidor de prueba iniciado en', base);
};

const ejecutar = async () => {
  await inicio();
  let r;

  console.log('\n1) Reglas de unicidad de email');
  r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: 'juan@test.com', password: '123456' }) });
  ok('Login productor correcto', r.status === 200 && r.json.rol === 'productor', `status=${r.status}`);
  const tProd = r.json.token;

  r = await api('/compradores/registro', { method: 'POST', body: JSON.stringify({ nombre: 'Otro', email: 'juan@test.com', password: '123456', tipo: 'comercio', ubicacion: 'QQQ' }) });
  ok('Email repetido entre productor y comprador -> 409', r.status === 409, `status=${r.status} msg=${r.json?.message}`);

  console.log('\n2) Publicar producto y regla productor obligatorio');
  r = await api('/productos', { method: 'POST', body: JSON.stringify({ nombre: 'Tomate', descripcion: 'Perita', precio: 100, stock: 10 }) });
  ok('Crear producto sin token -> 401', r.status === 401, `status=${r.status}`);

  r = await api('/productos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tProd}` },
    body: JSON.stringify({ nombre: 'Tomate perita', descripcion: 'Caja 20kg', precio: 100, stock: 10 })
  });
  if (r.status !== 201) {
    console.log('    DEBUG errores:', JSON.stringify(r.json.errors));
  }
  ok('Productor publica producto -> 201', r.status === 201, `status=${r.status} msg=${r.json?.message}`);
  const productoId = r.json.data.id;

  r = await api(`/productos/${productoId}`);
  ok('Producto expuesto públicamente -> 200', r.status === 200 && r.json.data.productor.nombre === 'Juan', `status=${r.status}`);

  console.log('\n3) Transacciones y validación en chat');
  const tComp = await tokenComprador('resto@test.com');
  ok('Token comprador obtenido', !!tComp);

  r = await api('/transacciones', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tComp}` },
    body: JSON.stringify({ producto_id: productoId, cantidad: 5, precio_negociado: 90 })
  });
  ok('Comprador crea pedido pendiente -> 201', r.status === 201 && r.json.data.estado === 'pendiente', `status=${r.status}`);
  const transaccionId = r.json.data.id;

  r = await api('/chats/productor/1/comprador/1', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tComp}` },
    body: JSON.stringify({ mensaje: 'Te ofrezco $90 el kg', precio_oferta: 90 })
  });
  ok('Comprador envía oferta en chat -> 201', r.status === 201, `status=${r.status}`);

  r = await api(`/transacciones/${transaccionId}/estado`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tProd}` },
    body: JSON.stringify({ estado: 'confirmado' })
  });
  ok('Productor confirma con precio validado en chat -> 200', r.status === 200 && r.json.data.estado === 'confirmado', `status=${r.status} msg=${r.json?.message}`);

  r = await api(`/productos/${productoId}`);
  ok('Stock decrementado tras confirmar (10 -> 5)', Number(r.json.data.stock) === 5, `stock=${r.json?.data?.stock}`);

  const tComp2 = await tokenComprador('resto@test.com');
  r = await api('/transacciones', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tComp2}` },
    body: JSON.stringify({ producto_id: productoId, cantidad: 5, precio_negociado: 85 })
  });
  const transaccionSinOferta = r.json.data.id;
  r = await api(`/transacciones/${transaccionSinOferta}/estado`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tProd}` },
    body: JSON.stringify({ estado: 'confirmado' })
  });
  ok('Confirmar sin oferta en chat -> 400', r.status === 400, `status=${r.status} msg=${r.json?.message}`);

  r = await api('/transacciones', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tComp2}` },
    body: JSON.stringify({ producto_id: productoId, cantidad: 999, precio_negociado: 90 })
  });
  ok('Pedido con stock insuficiente -> 400', r.status === 400, `status=${r.status} msg=${r.json?.message}`);

  r = await api('/transacciones', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tComp2}` },
    body: JSON.stringify({ producto_id: productoId, cantidad: 1, precio_negociado: 0 })
  });
  ok('Precio negociado igual a 0 -> 400', r.status === 400, `status=${r.status}`);

  console.log('\n4) Soft delete y respeto de permisos');
  r = await api(`/productos/${productoId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tProd}` } });
  ok('Productor elimina su producto -> 200', r.status === 200, `status=${r.status}`);

  r = await api(`/productos/${productoId}`);
  ok('Producto eliminado no aparece (soft delete) -> 404', r.status === 404, `status=${r.status}`);

  r = await api('/productos');
  ok('Listado no incluye el producto borrado', !r.json.data.some((p) => p.id === productoId));

  const { Producto } = await import('../src/models/Producto.js');
  const filaEnBd = await Producto.findByPk(productoId, { paranoid: false });
  ok('Registro eliminado sigue en BD con deleted_at', filaEnBd && filaEnBd.deletedAt !== null, `deletedAt=${filaEnBd?.deletedAt}`);

  r = await api(`/productos/${productoId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tComp}` } });
  ok('Comprador no puede eliminar producto ajeno -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n5) Validaciones de entrada');
  r = await api('/productos', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tProd}` },
    body: JSON.stringify({ nombre: 'X', descripcion: '', precio: -5, stock: -1 })
  });
  ok('Datos inválidos rechazados -> 400', r.status === 400 && Array.isArray(r.json.errors), `status=${r.status}`);

  r = await api('/ruta/inexistente');
  ok('Ruta inexistente -> 404', r.status === 404, `status=${r.status}`);

  await sequelize.close();
  console.log(`\nRESULTADO FINAL: ${fallos === 0 ? 'TODAS LAS PRUEBAS PASARON' : `${fallos} PRUEBA(S) FALLARON`}`);
  process.exit(fallos === 0 ? 0 : 1);
};

ejecutar().catch((e) => {
  console.error('Error fatal en las pruebas:', e);
  process.exit(1);
});
