import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import FormField from '../components/FormField.jsx';
import '../styles/forms.css';

// Solo se permite volver a páginas internas de la tienda (que empiezan con "/")
function destinoSeguro(valor) {
  return valor && valor.startsWith('/') && !valor.startsWith('//') ? valor : '/';
}

export default function LoginPage() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const destino = destinoSeguro(redirect);

  const [datos, setDatos] = useState({ correo: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (isLoggedIn) {
    return <Navigate to={destino} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorGeneral('');

    const encontrados = {};
    if (!datos.correo.trim()) encontrados.correo = 'Ingresa tu correo';
    if (!datos.contrasena) encontrados.contrasena = 'Ingresa tu contraseña';
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      await login(datos.correo, datos.contrasena);
      navigate(destino, { replace: true });
    } catch (error) {
      setErrorGeneral(
        error.status === 401
          ? 'Correo o contraseña incorrectos'
          : 'No se pudo iniciar sesión. Intenta de nuevo.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Iniciar sesión</h1>
        <p className="form-card__subtitle">Ingresa con tu cuenta de SneakerShop.</p>

        {redirect === '/checkout' && (
          <p className="form-alert form-alert--success">
            Inicia sesión para finalizar tu compra. Tu carrito se mantiene.
          </p>
        )}

        <FormField
          id="correo"
          label="Correo"
          type="email"
          value={datos.correo}
          onChange={handleChange}
          error={errores.correo}
          autoComplete="email"
        />
        <FormField
          id="contrasena"
          label="Contraseña"
          type="password"
          value={datos.contrasena}
          onChange={handleChange}
          error={errores.contrasena}
          autoComplete="current-password"
        />

        {errorGeneral && (
          <p className="form-alert form-alert--error" role="alert">
            {errorGeneral}
          </p>
        )}

        <button type="submit" className="form-submit" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <p className="form-footer">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
