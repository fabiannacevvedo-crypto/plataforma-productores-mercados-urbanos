export default function Alerta({ tipo = 'error', mensajes = [] }) {
  const lista = Array.isArray(mensajes) ? mensajes : [mensajes];

  if (lista.length === 0 || !lista.some((m) => m)) return null;

  const estilos =
    tipo === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-green-50 text-green-700 border-green-200';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${estilos}`}>
      {lista.map((mensaje, i) => mensaje ? <p key={i}>{mensaje}</p> : null)}
    </div>
  );
}