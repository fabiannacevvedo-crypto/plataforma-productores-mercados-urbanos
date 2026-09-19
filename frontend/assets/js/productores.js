import { api, sesion, cargarComponentes, protegerPagina, mostrarSpinner, mostrarAlerta, badgeSuscripcion } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const rol = sesion.rol();
const usuario = sesion.usuario();

if (rol === 'productor') {
  document.getElementById('boton-mi-perfil').classList.remove('d-none');
}

const area = document.getElementById('area-productores');
let productores = [];

const cargar = async () => {
  mostrarSpinner();
  const { estado, cuerpo } = await api.get('/productores');
  productores = estado === 200 ? cuerpo.data : [];
  renderizar();
};

const renderizar = () => {
  if (productores.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-people" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">Aún no hay productores registrados.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">
    ${productores
      .map((p) => {
        const esPropio = String(p.id) === String(usuario?.id);
        return `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 card-entidad">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0 text-verde">${p.nombre} ${esPropio ? '<i class="bi bi-patch-check-fill text-primary" title="Tu perfil"></i>' : ''}</h5>
                ${badgeSuscripcion(p.suscripcion || 'estandar')}
              </div>
              <p class="card-text small text-body-secondary mb-2">
                <i class="bi bi-geo-alt"></i> ${p.ubicacion || '—'}<br />
                <i class="bi bi-flower1"></i> ${p.tipo_productos || '—'}
              </p>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-success btn-sm" data-accion="estadisticas" data-id="${p.id}">
                  <i class="bi bi-bar-chart"></i> Estadísticas
                </button>
                ${rol === 'comprador' ? `
                  <a class="btn btn-outline-secondary btn-sm" href="/chats.html?productor=${p.id}">
                    <i class="bi bi-chat-dots"></i> Negociar
                  </a>` : ''}
              </div>
            </div>
          </div>
        </div>`;
      })
      .join('')}
  </div>`;
};

area.addEventListener('click', async (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;

  if (boton.dataset.accion === 'estadisticas') {
    await verEstadisticas(boton.dataset.id);
  }
});

const verEstadisticas = async (id) => {
  const productor = productores.find((p) => String(p.id) === id);
  const modal = new bootstrap.Modal(document.getElementById('modal-estadisticas'));
  document.getElementById('titulo-estadisticas').textContent = `Estadísticas de ${productor?.nombre || 'Productor'}`;
  document.getElementById('cuerpo-estadisticas').innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-success" role="status"></div>
    </div>`;
  modal.show();

  const [{ estado, cuerpo }, resVinculados] = await Promise.all([
    api.get(`/productores/${id}/estadisticas`),
    api.get(`/productores/${id}/compradores`)
  ]);

  const stats = estado === 200 ? cuerpo.data : { productos: 0, transacciones: 0, chats: 0 };
  const compradores = resVinculados.estado === 200 ? resVinculados.cuerpo.data : [];

  document.getElementById('cuerpo-estadisticas').innerHTML = `
    <div class="row g-3 text-center mb-3">
      <div class="col-4">
        <div class="mini-estadistica">
          <div class="text-body-secondary small">Productos</div>
          <div class="h4 fw-bold text-verde mb-0">${stats.productos}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="mini-estadistica">
          <div class="text-body-secondary small">Transacciones</div>
          <div class="h4 fw-bold text-verde mb-0">${stats.transacciones}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="mini-estadistica">
          <div class="text-body-secondary small">Mensajes</div>
          <div class="h4 fw-bold text-verde mb-0">${stats.chats}</div>
        </div>
      </div>
    </div>
    <h6 class="fw-semibold text-verde">Compradores vinculados</h6>
    ${compradores.length === 0
      ? '<p class="text-body-secondary small mb-0">Sin compradores vinculados aún.</p>'
      : `<ul class="list-group list-group-flush">
          ${compradores
            .map((c) => `<li class="list-group-item px-0">${c.nombre} <span class="text-body-secondary small text-capitalize">· ${c.tipo}</span> <span class="text-body-secondary small">· ${c.ubicacion}</span></li>`)
            .join('')}
        </ul>`}`;
};

document.getElementById('form-perfil').addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('per-nombre').value.trim(),
    ubicacion: document.getElementById('per-ubicacion').value.trim(),
    tipo_productos: document.getElementById('per-tipo-productos').value.trim(),
    suscripcion: document.getElementById('per-suscripcion').value
  };

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.ubicacion) errores.push('La ubicación es obligatoria.');
  if (!datos.tipo_productos) errores.push('El tipo de productos es obligatorio.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-perfil');
    return;
  }

  const { estado, cuerpo } = await api.patch(`/productores/${usuario.id}`, datos);

  if (estado === 200) {
    const actualizado = cuerpo.data;
    localStorage.setItem('usuario_plataforma', JSON.stringify({ ...usuario, ...actualizado }));
    bootstrap.Modal.getInstance(document.getElementById('modal-perfil')).hide();
    mostrarAlerta(cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(cuerpo?.message, 'error', 'alerta-perfil');
  }
});

document.getElementById('boton-mi-perfil').addEventListener('click', () => {
  document.getElementById('per-nombre').value = usuario.nombre || '';
  document.getElementById('per-ubicacion').value = usuario.ubicacion || '';
  document.getElementById('per-tipo-productos').value = usuario.tipo_productos || '';
  document.getElementById('per-suscripcion').value = usuario.suscripcion || 'estandar';
  mostrarAlerta([], 'error', 'alerta-perfil');
});

cargar();
cargarComponentes('productores');