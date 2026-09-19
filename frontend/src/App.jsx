import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Inicio from './pages/Inicio.jsx';
import Productos from './pages/Productos.jsx';
import Productores from './pages/Productores.jsx';
import Compradores from './pages/Compradores.jsx';
import Transacciones from './pages/Transacciones.jsx';
import Chats from './pages/Chats.jsx';

export default function App() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {token && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/registro"
            element={token ? <Navigate to="/" replace /> : <Registro />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productos"
            element={
              <ProtectedRoute>
                <Productos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/productores"
            element={
              <ProtectedRoute>
                <Productores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compradores"
            element={
              <ProtectedRoute>
                <Compradores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transacciones"
            element={
              <ProtectedRoute>
                <Transacciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}