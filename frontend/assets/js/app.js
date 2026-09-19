const TOKEN_KEY = 'token_plataforma';
const USUARIO_KEY = 'usuario_plataforma';
const ROL_KEY = 'rol_plataforma';

export const api = {
  async peticion(ruta, metodo = 'GET', datos = null) {
    const opciones = {
      method: metodo,
      headers: { 'Content-Type': 'application/json' }
    };

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      opciones.headers.Authorization = `Bearer ${token}`;
    }

    if (datos !== null && datos !== undefined) {
      opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(`/api/v1${ruta}`, opciones);

    let cuerpo = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      cuerpo = null;
    }

    if (respuesta.status === 401 && !ruta.includes('/auth/login')) {
      cerrarSesion(true);
    }

    return { estado: respuesta.status, cuerpo };
  },

  get: (ruta) => api.peticion(ruta, 'GET'),
  post: (ruta, datos) => api.peticion(ruta, 'POST', datos),
  patch: (ruta, datos) => api.peticion(ruta, 'PATCH', datos),
  delete: (ruta) => api.peticion(ruta, 'DELETE')
};

export const sesion = {
  guardar(respuesta, rolExplicito = null) {
    if (respuesta.token) {
      localStorage.setItem(TOKEN_KEY, respuesta.token);
    }
    if (respuesta.usuario) {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(respuesta.usuario));
    }
    if (respuesta.rol) {
      localStorage.setItem(ROL_KEY, respuesta.rol);
    } else if (rolExplicito) {
      localStorage.setItem(ROL_KEY, rolExplicito);
    }
  },
  usuario() {
    try {
      return JSON.parse(localStorage.getItem(USUARIO_KEY)) || null;
    } catch {
      return null;
    }
  },
  rol() {
    return localStorage.getItem(ROL_KEY);
  },
  token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  activa() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }
};

export function cerrarSesion(redirigir = false) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
  localStorage.removeItem(ROL_KEY);
  if (redirigir) {
    window.location.href = '/index.html';
  }
}

export function formatearPrecio(valor) {
  return `$${Number(valor || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function badgeEstado(estado) {
  const clases = {
    pendiente: 'etiqueta-pendiente',
    confirmado: 'etiqueta-confirmado',
    entregado: 'etiqueta-entregado'
  };
  return `<span class="etiqueta-estado ${clases[estado] || ''}">${estado}</span>`;
}

export function badgeSuscripcion(suscripcion) {
  return `<span class="etiqueta-estado ${suscripcion === 'premium' ? 'etiqueta-premium' : 'etiqueta-estandar'}">${suscripcion}</span>`;
}

export function mostrarAlerta(mensajes, tipo = 'error', contenedorId = 'area-alerta') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const lista = Array.isArray(mensajes) ? mensajes : [mensajes];
  const visibles = lista.filter((m) => m);
  if (visibles.length === 0) {
    contenedor.innerHTML = '';
    return;
  }

  contenedor.innerHTML = `
    <div class="alert alert-${tipo === 'error' ? 'danger' : 'success'} py-2 small">
      ${visibles.map((m) => `<div>${m}</div>`).join('')}
    </div>`;
}

export function cargarComponentes(activo = '') {
  const cerrar = document.getElementById('boton-cerrar-sesion');
  if (cerrar) {
    cerrar.addEventListener('click', () => cerrarSesion(true));
  }

  const usuario = sesion.usuario();
  const nombre = document.getElementById('usuario-nombre');
  const rol = document.getElementById('usuario-rol');
  if (nombre) nombre.textContent = usuario?.nombre || '';
  if (rol) rol.textContent = sesion.rol() || '';

  const linkActivo = document.querySelector(`[data-pagina="${activo}"]`);
  if (linkActivo) linkActivo.classList.add('activo');
}

export function protegerPagina() {
  if (!sesion.activa()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

export function mostrarSpinner(contenedorId = 'area-contenido') {
  const contenedor = document.getElementById(contenedorId);
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="loading-overlay">
        <div class="spinner-border text-success" role="status"></div>
      </div>`;
  }
}