import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiPost } from '../services/api.js';
import FormField from '../components/FormField.jsx';
import '../styles/forms.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(datos) {
  const errores = {};
  if (datos.nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres';
  }
  if (!EMAIL_REGEX.test(datos.correo.trim())) {
    errores.correo = 'Ingresa un correo válido';
  }
  if (datos.contrasena.length < 8) {
    errores.contrasena = 'La contraseña debe tener mínimo 8 caracteres';
  }
  if (datos.confirmar !== datos.contrasena) {
    errores.confirmar = 'Las contraseñas no coinciden';
  }
  return errores;
}

export default function RegisterPage() {
  const [datos, setDatos] = useState({ nombre: '', correo: '', contrasena: '', confirmar: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState(null);

  function handleChange(event) {
    const { name, value } = event.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorGeneral('');

    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const { user } = await apiPost('/auth/register', {
        nombre: datos.nombre,
        correo: datos.correo,
        contrasena: datos.contrasena,
      });
      setCuentaCreada(user);
    } catch (error) {
      if (error.status === 409) {
        setErrores({ correo: 'Ya existe una cuenta con ese correo' });
      } else if (error.status === 400) {
        setErrorGeneral('Revisa los datos del formulario.');
      } else {
        setErrorGeneral('No se pudo crear la cuenta. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  if (cuentaCreada) {
    return (
      <div className="form-page">
        <div className="form-card">
          <h1>¡Cuenta creada!</h1>
          <p className="form-alert form-alert--success">
            Bienvenido, {cuentaCreada.nombre}. Tu cuenta {cuentaCreada.correo} quedó lista.
          </p>
          <Link to="/login" className="form-submit">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <h1>Crear cuenta</h1>
        <p className="form-card__subtitle">Regístrate para comprar en SneakerShop.</p>

        <FormField
          id="nombre"
          label="Nombre"
          value={datos.nombre}
          onChange={handleChange}
          error={errores.nombre}
          autoComplete="name"
        />
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
          label="Contraseña (mínimo 8 caracteres)"
          type="password"
          value={datos.contrasena}
          onChange={handleChange}
          error={errores.contrasena}
          autoComplete="new-password"
        />
        <FormField
          id="confirmar"
          label="Confirmar contraseña"
          type="password"
          value={datos.confirmar}
          onChange={handleChange}
          error={errores.confirmar}
          autoComplete="new-password"
        />

        {errorGeneral && (
          <p className="form-alert form-alert--error" role="alert">
            {errorGeneral}
          </p>
        )}

        <button type="submit" className="form-submit" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="form-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}