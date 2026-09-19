import { api, sesion, cargarComponentes, protegerPagina, mostrarSpinner, mostrarAlerta, formatearPrecio } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const rol = sesion.rol();
const usuario = sesion.usuario();

document.querySelector('[data-texto-rol]').textContent =
  rol === 'productor'
    ? 'Publicá y gestioná tus productos.'
    : 'Explorá y realizá pedidos directos a los productores.';

if (rol === 'productor') {
  document.getElementById('boton-nuevo-producto').classList.remove('d-none');
}

const area = document.getElementById('area-productos');
let productos = [];
let editandoId = null;
let eliminandoId = null;
let pedidoActual = null;

const cargar = async () => {
  mostrarSpinner();
  const { estado, cuerpo } = await api.get('/productos');
  productos = estado === 200 ? cuerpo.data : [];
  renderizar();
};

const renderizar = () => {
  if (productos.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-box-seam" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">Aún no hay productos publicados.</p>
          <p class="small mb-0">Los productores pueden publicar desde esta sección.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">
    ${productos
      .map((p) => {
        const esPropio = rol === 'productor' && p.productor?.id === usuario?.id;
        return `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 card-producto">
            <div class="card-header bg-verde-claro d-flex justify-content-between align-items-center">
              <span class="fw-semibold text-verde">${p.nombre}</span>
              <span class="precio-badge">${formatearPrecio(p.precio)}</span>
            </div>
            <div class="card-body">
              <p class="text-body-secondary small mb-2">${p.descripcion}</p>
              <div class="d-flex justify-content-between small text-body-secondary">
                <span><i class="bi bi-box"></i> Stock: ${p.stock} u</span>
                <span><i class="bi bi-person"></i> ${p.productor?.nombre || '—'}</span>
              </div>
            </div>
            <div class="card-footer bg-white d-flex gap-2">
              ${rol === 'comprador' ? `
                <button class="btn btn-naranja btn-sm flex-fill" data-accion="pedir" data-id="${p.id}">
                  <i class="bi bi-cart-plus"></i> Pedir
                </button>
                <a class="btn btn-outline-secondary btn-sm flex-fill" href="/chats.html?productor=${p.productor?.id}">
                  <i class="bi bi-chat-dots"></i> Negociar
                </a>` : ''}
              ${esPropio ? `
                <button class="btn btn-outline-secondary btn-sm flex-fill" data-accion="editar" data-id="${p.id}">
                  <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-outline-danger btn-sm flex-fill" data-accion="eliminar" data-id="${p.id}">
                  <i class="bi bi-trash"></i> Eliminar
                </button>` : ''}
            </div>
          </div>
        </div>`;
      })
      .join('')}
  </div>`;
};

area.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const { accion, id } = boton.dataset;
  const producto = productos.find((p) => String(p.id) === id);

  if (accion === 'editar') abrirEditar(producto);
  if (accion === 'eliminar') abrirConfirmar(producto);
  if (accion === 'pedir') abrirPedido(producto);
});

const formProducto = document.getElementById('form-producto');
const tituloProducto = document.getElementById('titulo-producto');
const botonGuardar = document.getElementById('boton-guardar-producto');

const abrirNuevo = () => {
  editandoId = null;
  tituloProducto.textContent = 'Publicar producto';
  botonGuardar.textContent = 'Publicar';
  formProducto.reset();
  mostrarAlerta([], 'error', 'alerta-producto');
};

document.getElementById('boton-nuevo-producto').addEventListener('click', abrirNuevo);

const abrirEditar = (producto) => {
  editandoId = producto.id;
  tituloProducto.textContent = 'Editar producto';
  botonGuardar.textContent = 'Guardar cambios';
  document.getElementById('p-nombre').value = producto.nombre;
  document.getElementById('p-descripcion').value = producto.descripcion;
  document.getElementById('p-precio').value = producto.precio;
  document.getElementById('p-stock').value = producto.stock;
  mostrarAlerta([], 'error', 'alerta-producto');
  new bootstrap.Modal(document.getElementById('modal-producto')).show();
};

formProducto.addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('p-nombre').value.trim(),
    descripcion: document.getElementById('p-descripcion').value.trim(),
    precio: Number(document.getElementById('p-precio').value),
    stock: Number(document.getElementById('p-stock').value)
  };

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.descripcion) errores.push('La descripción es obligatoria.');
  if (!datos.precio || datos.precio <= 0) errores.push('El precio debe ser mayor a 0.');
  if (datos.stock === '' || datos.stock < 0) errores.push('El stock debe ser mayor o igual a 0.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-producto');
    return;
  }

  botonGuardar.disabled = true;
  const resultado = editandoId
    ? await api.patch(`/productos/${editandoId}`, datos)
    : await api.post('/productos', datos);

  if (resultado.estado === 200 || resultado.estado === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-producto')).hide();
    mostrarAlerta(resultado.cuerpo?.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(resultado.cuerpo?.message, 'error', 'alerta-producto');
  }
  botonGuardar.disabled = false;
});

const abrirConfirmar = (producto) => {
  eliminandoId = producto.id;
  document.getElementById('texto-confirmar').textContent = `¿Deseás eliminar "${producto.nombre}"? Esta acción realiza un borrado lógico (soft delete).`;
  new bootstrap.Modal(document.getElementById('modal-confirmar')).show();
};

document.getElementById('boton-eliminar-confirmado').addEventListener('click', async () => {
  const boton = document.getElementById('boton-eliminar-confirmado');
  boton.disabled = true;
  const { estado, cuerpo } = await api.delete(`/productos/${eliminandoId}`);

  if (estado === 200) {
    bootstrap.Modal.getInstance(document.getElementById('modal-confirmar')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message);
  }
  boton.disabled = false;
});

const abrirPedido = (producto) => {
  pedidoActual = producto;
  document.getElementById('titulo-pedido').textContent = `Pedido · ${producto.nombre}`;
  document.getElementById('info-pedido').textContent = `Productor: ${producto.productor?.nombre} · Stock disponible: ${producto.stock} u`;
  document.getElementById('ped-cantidad').value = 1;
  document.getElementById('ped-precio').value = producto.precio;
  mostrarAlerta([], 'error', 'alerta-pedido');
  new bootstrap.Modal(document.getElementById('modal-pedido')).show();
};

document.getElementById('form-pedido').addEventListener('submit', async (e) => {
  e.preventDefault();

  const cantidad = Number(document.getElementById('ped-cantidad').value);
  const precioNegociado = Number(document.getElementById('ped-precio').value);

  const errores = [];
  if (!cantidad || cantidad < 1) errores.push('La cantidad debe ser mayor a 0.');
  if (!precioNegociado || precioNegociado <= 0) errores.push('El precio negociado debe ser mayor a 0.');
  if (cantidad > pedidoActual.stock) errores.push(`Stock insuficiente. Disponible: ${pedidoActual.stock} u.`);

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-pedido');
    return;
  }

  const { estado, cuerpo } = await api.post('/transacciones', {
    producto_id: pedidoActual.id,
    cantidad,
    precio_negociado: precioNegociado
  });

  if (estado === 201) {
    bootstrap.Modal.getInstance(document.getElementById('modal-pedido')).hide();
    mostrarAlerta(`Pedido #${cuerpo.data.id} creado en estado pendiente.`, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message, 'error', 'alerta-pedido');
  }
});

cargar();
cargarComponentes('productos');