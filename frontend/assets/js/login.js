import { api, sesion, mostrarAlerta } from './app.js';

if (sesion.activa()) {
  window.location.href = '/inicio.html';
}

const form = document.getElementById('form-login');
const boton = document.getElementById('boton-ingresar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  const errores = [];
  if (!email) errores.push('El email es obligatorio.');
  if (!password) errores.push('La contraseña es obligatoria.');

  if (errores.length) {
    mostrarAlerta(errores);
    return;
  }

  boton.disabled = true;
  boton.textContent = 'Ingresando...';

  const { estado, cuerpo } = await api.post('/auth/login', { email, password });

  if (estado === 200 && cuerpo.ok) {
    sesion.guardar(cuerpo);
    window.location.href = '/inicio.html';
    return;
  }

  boton.disabled = false;
  boton.textContent = 'Ingresar';
  mostrarAlerta(cuerpo?.message || 'No se pudo iniciar sesión.');
});