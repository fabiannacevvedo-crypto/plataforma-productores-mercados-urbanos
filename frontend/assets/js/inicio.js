import { api, sesion, cargarComponentes, protegerPagina, mostrarSpinner, formatearPrecio, badgeEstado } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const usuario = sesion.usuario();
const rol = sesion.rol();

document.getElementById('saludo').textContent = `Hola, ${usuario?.nombre || ''}`;
document.getElementById('saludo-descripcion').textContent =
  rol === 'productor'
    ? 'Publicá tus productos, negociá precios en el chat y gestioná tus pedidos.'
    : 'Encontrá productores rurales de Formosa y el NEA, negociá y realizá pedidos directos.';

const cargar = async () => {
  mostrarSpinner('area-estadisticas');

  const [resProductos, resTransacciones] = await Promise.all([
    api.get('/productos'),
    api.get('/transacciones')
  ]);

  const productos = resProductos.estado === 200 ? resProductos.cuerpo.data : [];
  const transacciones = resTransacciones.estado === 200 ? resTransacciones.cuerpo.data : [];

  const pendientes = transacciones.filter((t) => t.estado === 'pendiente').length;

  document.getElementById('area-estadisticas').innerHTML = `
    <div class="col-md-4">
      <div class="card shadow-sm text-center py-3">
        <div class="text-body-secondary small">Productos publicados</div>
        <div class="h3 fw-bold text-verde mb-0">${productos.length}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm text-center py-3">
        <div class="text-body-secondary small">Transacciones totales</div>
        <div class="h3 fw-bold text-verde mb-0">${transacciones.length}</div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm text-center py-3">
        <div class="text-body-secondary small">Pedidos pendientes</div>
        <div class="h3 fw-bold text-naranja mb-0">${pendientes}</div>
      </div>
    </div>`;

  const areaProductos = document.getElementById('area-productos');
  if (productos.length === 0) {
    areaProductos.innerHTML = '<p class="text-body-secondary mb-0">Todavía no hay productos publicados.</p>';
  } else {
    areaProductos.innerHTML = `<ul class="list-group list-group-flush">
      ${productos
        .slice(0, 5)
        .map(
          (p) => `<li class="list-group-item d-flex justify-content-between px-0">
            <span>${p.nombre}</span>
            <span class="fw-medium text-body-secondary">${formatearPrecio(p.precio)}</span>
          </li>`
        )
        .join('')}
    </ul>`;
  }

  const areaTransacciones = document.getElementById('area-transacciones');
  if (transacciones.length === 0) {
    areaTransacciones.innerHTML = '<p class="text-body-secondary mb-0">Todavía no hay transacciones.</p>';
  } else {
    areaTransacciones.innerHTML = `<ul class="list-group list-group-flush">
      ${transacciones
        .slice(0, 5)
        .map(
          (t) => `<li class="list-group-item px-0">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-medium small">${t.producto?.nombre || 'Producto'} · ${t.cantidad} u</div>
                <div class="small text-body-secondary">${t.productor?.nombre || ''} → ${t.comprador?.nombre || ''}</div>
              </div>
              ${badgeEstado(t.estado)}
            </div>
          </li>`
        )
        .join('')}
    </ul>`;
  }
};

cargarComponentes('inicio');
cargar();