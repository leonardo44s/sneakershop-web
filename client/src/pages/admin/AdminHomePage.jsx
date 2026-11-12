import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api.js';
import { getAuth, logout } from '../../services/auth.js';
import '../../styles/admin.css';

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState(getAuth()?.user?.nombre || '');

  useEffect(() => {
    apiGet('/admin/me', getAuth()?.token)
      .then((data) => setNombre(data.user.nombre))
      .catch(() => {
        logout();
        navigate('/admin/login', { replace: true });
      });
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <span className="admin__logo">SneakerShop · Admin</span>
        <div className="admin__user">
          <span>{nombre}</span>
          <button type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="admin__main">
        <h1>Panel de administración</h1>
        <p>
          Bienvenido. En el Sprint 3 aquí se gestionarán el catálogo, el stock por talla y los
          pedidos.
        </p>
      </main>
    </div>
  );
}