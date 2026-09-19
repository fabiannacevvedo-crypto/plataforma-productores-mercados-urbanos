import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const enlaces = [
  { ruta: '/', etiqueta: 'Inicio' },
  { ruta: '/productos', etiqueta: 'Productos' },
  { ruta: '/productores', etiqueta: 'Productores' },
  { ruta: '/compradores', etiqueta: 'Compradores' },
  { ruta: '/transacciones', etiqueta: 'Transacciones' },
  { ruta: '/chats', etiqueta: 'Chats' }
];

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <nav className="bg-verde-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-naranja-500">•</span> Productores & Mercados Urbanos
        </Link>

        {usuario && (
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              {enlaces.map((e) => (
                <NavLink
                  key={e.ruta}
                  to={e.ruta}
                  className={({ isActive }) =>
                    isActive ? 'text-white font-semibold border-b-2 border-naranja-500' : 'text-green-100 hover:text-white'
                  }
                >
                  {e.etiqueta}
                </NavLink>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-right">
                <p className="font-semibold">{usuario.nombre}</p>
                <p className="text-green-200 capitalize text-xs">{localStorage.getItem('rol')}</p>
              </div>
              <button
                onClick={salir}
                className="bg-naranja-600 hover:bg-naranja-500 text-white text-sm px-3 py-1.5 rounded-lg"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}