import { api, sesion, mostrarAlerta } from './app.js';

if (sesion.activa()) {
  window.location.href = '/inicio.html';
}

const radios = document.querySelectorAll('input[name="rol"]');
const campoProductos = document.getElementById('campo-tipo-productos');
const campoSuscripcion = document.getElementById('campo-suscripcion');
const campoTipo = document.getElementById('campo-tipo');
const boton = document.getElementById('boton-registrar');

const actualizarCampos = () => {
  const rol = document.querySelector('input[name="rol"]:checked').value;
  const esProductor = rol === 'productor';

  campoProductos.classList.toggle('d-none', !esProductor);
  campoSuscripcion.classList.toggle('d-none', !esProductor);
  campoTipo.classList.toggle('d-none', esProductor);
};

radios.forEach((r) => r.addEventListener('change', () => {
  actualizarCampos();
  mostrarAlerta([], 'error');
}));

actualizarCampos();

const recoger = () => {
  const rol = document.querySelector('input[name="rol"]:checked').value;
  const base = {
    nombre: document.getElementById('nombre').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value.trim(),
    ubicacion: document.getElementById('ubicacion').value.trim()
  };

  if (rol === 'productor') {
    return {
      ...base,
      tipo_productos: document.getElementById('tipo_productos').value.trim(),
      suscripcion: document.getElementById('suscripcion').value
    };
  }

  return {
    ...base,
    tipo: document.getElementById('tipo').value
  };
};

document.getElementById('form-registro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const rol = document.querySelector('input[name="rol"]:checked').value;
  const datos = recoger();

  const errores = [];
  if (!datos.nombre) errores.push('El nombre es obligatorio.');
  if (!datos.email) errores.push('El email es obligatorio.');
  else if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.push('El email no es válido.');
  if (!datos.password) errores.push('La contraseña es obligatoria.');
  else if (datos.password.length < 6) errores.push('La contraseña debe tener al menos 6 caracteres.');
  if (!datos.ubicacion) errores.push('La ubicación es obligatoria.');
  if (rol === 'productor' && !datos.tipo_productos) errores.push('El tipo de productos es obligatorio.');

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Registrando...';

  const ruta = rol === 'productor' ? '/auth/productores/registro' : '/compradores/registro';
  const { estado, cuerpo } = await api.post(ruta, datos);

  if (estado === 201 && cuerpo.ok) {
    sesion.guardar(cuerpo, rol);
    mostrarAlerta('Registro exitoso. Redirigiendo...', 'exito');
    setTimeout(() => (window.location.href = '/inicio.html'), 1200);
    return;
  }

  boton.disabled = false;
  boton.textContent = 'Registrarse';
  mostrarAlerta(cuerpo?.message || 'No se pudo completar el registro.');
});