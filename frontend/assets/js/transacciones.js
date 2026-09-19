import { api, sesion, cargarComponentes, protegerPagina, mostrarSpinner, mostrarAlerta, formatearPrecio, formatearFecha, badgeEstado } from './app.js';

if (!protegerPagina()) {
  throw new Error('redirección');
}

const rol = sesion.rol();
const usuario = sesion.usuario();
const area = document.getElementById('area-transacciones');

let filtro = '';

const cargar = async () => {
  mostrarSpinner();
  const ruta = filtro ? `/transacciones?estado=${filtro}` : '/transacciones';
  const { estado, cuerpo } = await api.get(ruta);
  const transacciones = estado === 200 ? cuerpo.data : [];
  renderizar(transacciones);
};

const renderizar = (transacciones) => {
  if (transacciones.length === 0) {
    area.innerHTML = `
      <div class="card shadow-sm">
        <div class="card-body text-center py-5 text-body-secondary">
          <i class="bi bi-receipt" style="font-size: 2rem;"></i>
          <p class="mb-0 mt-2">${filtro ? `No hay transacciones en estado "${filtro}".` : 'Todavía no hay transacciones.'}</p>
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `<div class="card shadow-sm">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th class="d-none d-md-table-cell">Productor</th>
            <th>Comprador</th>
            <th class="text-end">Cant.</th>
            <th class="text-end d-none d-md-table-cell">Precio negociado</th>
            <th>Estado</th>
            <th class="text-end d-none d-lg-table-cell">Fecha</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${transacciones
            .map((t) => {
              const soyProductor = rol === 'productor' && String(t.productor_id) === String(usuario.id);
              const soyComprador = rol === 'comprador' && String(t.comprador_id) === String(usuario.id);
              const puedeConfirmar = soyProductor && t.estado === 'pendiente';
              const puedeEntregar = soyComprador && t.estado === 'confirmado';
              return `
              <tr>
                <td class="text-body-secondary">${t.id}</td>
                <td class="fw-medium">${t.producto?.nombre || '—'}</td>
                <td class="d-none d-md-table-cell">${t.productor?.nombre || '—'}</td>
                <td>${t.comprador?.nombre || '—'}</td>
                <td class="text-end">${t.cantidad}</td>
                <td class="text-end d-none d-md-table-cell">${formatearPrecio(t.precio_negociado)}</td>
                <td>${badgeEstado(t.estado)}</td>
                <td class="text-end text-body-secondary small d-none d-lg-table-cell">${formatearFecha(t.fecha)}</td>
                <td class="text-end">
                  ${puedeConfirmar ? `
                    <button class="btn btn-success btn-sm" data-accion="confirmar" data-id="${t.id}" title="Confirmar pedido (requiere oferta en el chat)">
                      Confirmar
                    </button>` : ''}
                  ${puedeEntregar ? `
                    <button class="btn btn-outline-primary btn-sm" data-accion="entregar" data-id="${t.id}" title="Marcar como entregado">
                      Entregar
                    </button>` : ''}
                  ${!puedeConfirmar && !puedeEntregar ? '<span class="text-body-secondary small">—</span>' : ''}
                </td>
              </tr>`;
            })
            .join('')}
        </tbody>
      </table>
    </div>
  </div>`;
};

area.addEventListener('click', async (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;

  const { accion, id } = boton.dataset;
  boton.disabled = true;

  let resultado;
  if (accion === 'confirmar') {
    resultado = await api.patch(`/transacciones/${id}/estado`, { estado: 'confirmado' });
  } else {
    resultado = await api.patch(`/transacciones/${id}/estado`, { estado: 'entregado' });
  }

  if (resultado.estado === 200) {
    mostrarAlerta(resultado.cuerpo.message, 'exito');
    cargar();
  } else {
    mostrarAlerta(resultado.cuerpo?.message);
    boton.disabled = false;
  }
});

document.querySelectorAll('.filtro-estado').forEach((boton) => {
  boton.addEventListener('click', () => {
    document.querySelectorAll('.filtro-estado').forEach((b) => b.classList.remove('activo'));
    boton.classList.add('activo');
    filtro = boton.dataset.estado;
    cargar();
  });
});

cargar();
cargarComponentes('transacciones');