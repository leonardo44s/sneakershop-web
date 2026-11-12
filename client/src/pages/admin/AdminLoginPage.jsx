import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { isAdmin, login, logout } from '../../services/auth.js';
import '../../styles/admin.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (isAdmin()) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!correo || !contrasena) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }

    setEnviando(true);
    try {
      const user = await login(correo, contrasena);
      if (user.rol !== 'admin') {
        logout();
        setError('Esta cuenta no tiene acceso al panel de administración.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err.status === 401
          ? 'Correo o contraseña incorrectos'
          : 'No se pudo iniciar sesión. Intenta de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit} noValidate>
        <h1>SneakerShop</h1>
        <p className="admin-login__subtitle">Panel de administración</p>

        <label htmlFor="correo">Correo</label>
        <input
          id="correo"
          type="email"
          autoComplete="username"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          id="contrasena"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />

        {error && (
          <p className="admin-login__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}