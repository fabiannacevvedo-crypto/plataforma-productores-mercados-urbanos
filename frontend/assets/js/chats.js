import { api, sesion, cargarComponentes, protegerPagina, mostrarAlerta, formatearPrecio, formatearFecha } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const rol = sesion.rol();
const usuario = sesion.usuario();

document.getElementById('enlace-nuevo').href = rol === 'comprador' ? '/productores.html' : '/compradores.html';

const areaContactos = document.getElementById('area-contactos');
const areaMensajes = document.getElementById('area-mensajes');

let contactos = [];
let activo = null;

const esMio = (mensaje) => {
  if (rol === 'productor') return String(mensaje.productor_id) === String(usuario.id);
  return String(mensaje.comprador_id) === String(usuario.id);
};

const normalizarContacto = (mensajes) => {
  const mapa = new Map();

  mensajes.forEach((m) => {
    if (rol === 'productor' && String(m.productor_id) === String(usuario.id)) {
      const id = String(m.comprador_id);
      if (!mapa.has(id)) {
        mapa.set(id, { id: m.comprador_id, nombre: m.comprador?.nombre || 'Comprador' });
      }
    }
    if (rol === 'comprador' && String(m.comprador_id) === String(usuario.id)) {
      const id = String(m.productor_id);
      if (!mapa.has(id)) {
        mapa.set(id, { id: m.productor_id, nombre: m.productor?.nombre || 'Productor' });
      }
    }
  });

  return [...mapa.values()];
};

const cargarContactos = async () => {
  areaContactos.innerHTML = 'Cargando contactos...';

  const [resChats, resCatalogo] = await Promise.all([
    api.get('/chats'),
    api.get(rol === 'comprador' ? '/productores' : '/compradores')
  ]);

  const mensajes = resChats.estado === 200 ? resChats.cuerpo.data : [];
  const catalogo = resCatalogo.estado === 200 ? resCatalogo.cuerpo.data : [];

  const conConversacion = normalizarContacto(mensajes);
  const idsConversacion = new Set(conConversacion.map((c) => String(c.id)));

  if (rol === 'comprador') {
    catalogo.forEach((p) => {
      if (!idsConversacion.has(String(p.id))) {
        conConversacion.push({ id: p.id, nombre: p.nombre });
      }
    });
  } else {
    catalogo.forEach((c) => {
      if (!idsConversacion.has(String(c.id))) {
        conConversacion.push({ id: c.id, nombre: c.nombre });
      }
    });
  }

  contactos = conConversacion;
  renderizarContactos();
  autoSeleccionar();
};

const renderizarContactos = () => {
  if (contactos.length === 0) {
    areaContactos.innerHTML = '<div class="p-3 text-body-secondary small">Sin contactos. Explorá el catálogo para negociar.</div>';
    return;
  }

  areaContactos.innerHTML = contactos
    .map(
      (c) => `
      <div class="px-3 py-2 contacto border-bottom ${activo && String(activo.id) === String(c.id) ? 'activo' : ''}" data-contacto="${c.id}">
        <div class="fw-medium small">${c.nombre}</div>
        <div class="text-body-secondary small">${rol === 'comprador' ? 'Productor' : 'Comprador'}</div>
      </div>`
    )
    .join('');
};

const autoSeleccionar = () => {
  const params = new URLSearchParams(window.location.search);
  const productorId = params.get('productor');

  if (rol === 'comprador' && productorId && contactos.length) {
    const candidato = contactos.find((c) => String(c.id) === productorId);
    if (candidato) {
      seleccionar(candidato);
      return;
    }
  }

  if (contactos.length && !activo) {
    seleccionar(contactos[0]);
  }
};

areaContactos.addEventListener('click', (e) => {
  const item = e.target.closest('[data-contacto]');
  if (!item) return;

  const contacto = contactos.find((c) => String(c.id) === item.dataset.contacto);
  if (contacto) {
    seleccionar(contacto);
  } else {
    seleccionar({ id: Number(item.dataset.contacto), nombre: item.textContent.trim() });
  }
});

const seleccionar = (contacto) => {
  activo = contacto;

  const esProductor = rol === 'productor';
  document.getElementById('chat-titulo').textContent = contacto.nombre;
  document.getElementById('chat-subtitulo').textContent = esProductor
    ? `Comprador (id ${contacto.id})`
    : `Productor (id ${contacto.id})`;

  renderizarContactos();
  cargarConversacion();
};

const cargarConversacion = async () => {
  areaMensajes.innerHTML = `
    <div class="text-center py-5">
      <div class="spinner-border text-success" role="status"></div>
    </div>`;

  const ruta =
    rol === 'productor'
      ? `/chats/productor/${usuario.id}/comprador/${activo.id}`
      : `/chats/productor/${activo.id}/comprador/${usuario.id}`;

  const { estado, cuerpo } = await api.get(ruta);
  const mensajes = estado === 200 ? cuerpo.data : [];

  if (mensajes.length === 0) {
    areaMensajes.innerHTML = `
      <div class="text-center text-body-secondary small py-5">
        Iniciá la negociación. Si acuerdan un precio, cargalo en el campo "Precio oferta" para poder confirmar el pedido.
      </div>`;
    return;
  }

  areaMensajes.innerHTML = mensajes
    .map(
      (m) => `
      <div class="d-flex flex-column gap-1 mb-3">
        <div class="burbuja ${esMio(m) ? 'burbuja-propia' : 'burbuja-ajena'}">
          <div class="small">${m.mensaje}</div>
          ${m.precio_oferta ? `<span class="burbuja-oferta">Oferta: ${formatearPrecio(m.precio_oferta)}</span>` : ''}
          <div class="small opacity-75" style="font-size: 0.7rem;">${formatearFecha(m.fecha)}</div>
        </div>
      </div>`
    )
    .join('');

  areaMensajes.scrollTop = areaMensajes.scrollHeight;
};

document.getElementById('form-mensaje').addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!activo) {
    mostrarAlerta('Seleccioná un contacto para negociar.');
    return;
  }

  const texto = document.getElementById('texto-mensaje').value.trim();
  const ofertaCampo = document.getElementById('precio-oferta').value;

  const errores = [];
  if (!texto && !ofertaCampo) errores.push('Escribí un mensaje o cargá una oferta.');
  if (ofertaCampo && Number(ofertaCampo) <= 0) errores.push('La oferta debe ser mayor a 0.');

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  const datos = { mensaje: texto };
  if (ofertaCampo) {
    datos.precio_oferta = Number(ofertaCampo);
  }

  const ruta =
    rol === 'productor'
      ? `/chats/productor/${usuario.id}/comprador/${activo.id}`
      : `/chats/productor/${activo.id}/comprador/${usuario.id}`;

  const { estado, cuerpo } = await api.post(ruta, datos);

  if (estado === 201) {
    document.getElementById('texto-mensaje').value = '';
    document.getElementById('precio-oferta').value = '';
    mostrarAlerta([], 'error');
    cargarConversacion();
  } else {
    mostrarAlerta(cuerpo?.message);
  }
});

cargarContactos();
cargarComponentes('chats');