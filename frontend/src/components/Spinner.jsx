export default function Spinner({ mensaje = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-verde-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-3 text-gray-500 text-sm">{mensaje}</p>
    </div>
  );
}