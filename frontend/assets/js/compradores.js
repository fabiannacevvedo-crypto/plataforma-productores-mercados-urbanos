import { api, sesion, cargarComponentes, protegerPagina, mostrarSpinner, mostrarAlerta } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const rol = sesion.rol();
const usuario = sesion.usuario();

if (rol === 'comprador') {
  document.getElementById('boton-mi-perfil').classList.remove('d-none');
}

const area = document.getElementById('area-compradores');
let compradores = [];

const cargar = async () => {
  mostrarSpinner();
  const { estado, cuerpo } = await api.get('/compradores');
  compradores = estado === 200 ? cuerpo.data : [];
  renderizar();
};

const renderizar = () => {
  if (compradores.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-shop" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">Aún no hay compradores registrados.</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="row g-4">
    ${compradores
      .map((c) => {
        const esPropio = String(c.id) === String(usuario?.id);
        return `
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-sm h-100 card-entidad">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title mb-0">${c.nombre} ${esPropio ? '<i class="bi bi-patch-check-fill text-primary" title="Tu perfil"></i>' : ''}</h5>
                <span class="etiqueta-estado etiqueta-estandar text-capitalize">${c.tipo || 'comercio'}</span>
              </div>
              <p class="card-text small text-body-secondary mb-2">
                <i class="bi bi-geo-alt"></i> ${c.ubicacion || '—'}
              </p>
              ${esPropio && rol === 'comprador' ? `
                <button class="btn btn-outline-secondary btn-sm" data-accion="vinculados">
                  <i class="bi bi-link-45deg"></i> Ver productores con los que opero
                </button>` : ''}
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

  const modal = new bootstrap.Modal(document.getElementById('modal-vinculados'));
  document.getElementById('cuerpo-vinculados').innerHTML = `
    <div class="text-center py-4">
      <div class="spinner-border text-success" role="status"></div>
    </div>`;
  modal.show();

  const { estado, cuerpo } = await api.get(`/compradores/${usuario.id}/productores`);

  const vinculados = estado === 200 ? cuerpo.data : [];

  document.getElementById('cuerpo-vinculados').innerHTML =
    vinculados.length === 0
      ? '<p class="text-body-secondary small mb-0">Todavía no operás con ningún productor.</p>'
      : `<ul class="list-group list-group-flush">
          ${vinculados
            .map(
              (p) => `<li class="list-group-item d-flex justify-content-between align-items-center px-0">
                <div>
                  <div class="fw-medium">${p.nombre}</div>
                  <div class="small text-body-secondary">${p.ubicacion || ''} · ${p.tipo_productos || ''}</div>
                </div>
                <a class="btn btn-outline-secondary btn-sm" href="/chats.html?productor=${p.id}">
                  <i class="bi bi-chat-dots"></i>
                </a>
              </li>`
            )
            .join('')}
        </ul>`;
});

document.getElementById('form-perfil').addEventListener('submit', async (e) => {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('per-nombre').value.trim(),
    ubicacion: document.getElementById('per-ubicacion').value.trim(),
    tipo: document.getElementById('per-tipo').value
  };

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.ubicacion) errores.push('La ubicación es obligatoria.');

  if (errores.length) {
    mostrarAlerta(errores, 'error', 'alerta-perfil');
    return;
  }

  const { estado, cuerpo } = await api.patch(`/compradores/${usuario.id}`, datos);

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
  document.getElementById('per-tipo').value = usuario.tipo || 'comercio';
  mostrarAlerta([], 'error', 'alerta-perfil');
});

cargar();
cargarComponentes('compradores');