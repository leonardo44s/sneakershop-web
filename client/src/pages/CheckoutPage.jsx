import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';
import { useCart } from '../context/useCart.js';
import { formatPrice } from '../utils/format.js';
import FormField from '../components/FormField.jsx';
import '../styles/forms.css';
import '../styles/checkout.css';

function validar(datos) {
  const errores = {};
  if (!/^\+?\d{7,15}$/.test(datos.telefono.replace(/[\s-]/g, ''))) {
    errores.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos)';
  }
  if (datos.direccion.trim().length < 5) {
    errores.direccion = 'Ingresa la dirección de entrega';
  }
  if (datos.ciudad.trim().length < 2) {
    errores.ciudad = 'Ingresa la ciudad';
  }
  return errores;
}

export default function CheckoutPage() {
  const { isLoggedIn, token, user, logout } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [datos, setDatos] = useState({ telefono: '', direccion: '', ciudad: '' });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [sinStock, setSinStock] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (!isLoggedIn) {
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  if (items.length === 0) {
    return (
      <section className="checkout-empty">
        <h1>No hay productos para comprar</h1>
        <p>Agrega zapatillas a tu carrito antes de finalizar la compra.</p>
        <Link to="/" className="btn">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorGeneral('');
    setSinStock(false);

    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    try {
      const pedido = await apiPost(
        '/orders',
        {
          ...datos,
          items: items.map(({ productId, talla, cantidad }) => ({ productId, talla, cantidad })),
        },
        token
      );
      navigate(`/pedido/${pedido.codigo}`, { replace: true, state: { pedido } });
      clearCart();
    } catch (error) {
      if (error.status === 401) {
        logout();
        navigate('/login?redirect=/checkout', { replace: true });
        return;
      }
      if (error.status === 409) {
        setSinStock(true);
        setErrorGeneral(error.message);
      } else if (error.status === 403) {
        setErrorGeneral('Esta cuenta no puede hacer pedidos. Inicia sesión con una cuenta de cliente.');
      } else if (error.status === 400) {
        setErrorGeneral('Revisa los datos de entrega.');
      } else {
        setErrorGeneral('No se pudo registrar el pedido. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="checkout">
      <h1>Finalizar compra</h1>

      <div className="checkout__layout">
        <form className="form-card checkout__form" onSubmit={handleSubmit} noValidate>
          <h2>Datos de entrega</h2>
          <p className="form-card__subtitle">Pedido a nombre de {user.nombre}.</p>

          <FormField
            id="telefono"
            label="Teléfono"
            type="tel"
            value={datos.telefono}
            onChange={handleChange}
            error={errores.telefono}
            autoComplete="tel"
          />
          <FormField
            id="direccion"
            label="Dirección"
            value={datos.direccion}
            onChange={handleChange}
            error={errores.direccion}
            autoComplete="street-address"
          />
          <FormField
            id="ciudad"
            label="Ciudad"
            value={datos.ciudad}
            onChange={handleChange}
            error={errores.ciudad}
            autoComplete="address-level2"
          />

          <p className="checkout__payment">
            <strong>Pago contra entrega:</strong> pagas cuando recibas tus zapatillas.
          </p>

          {errorGeneral && (
            <p className="form-alert form-alert--error" role="alert">
              {errorGeneral} {sinStock && <Link to="/carrito">Ir al carrito</Link>}
            </p>
          )}

          <button type="submit" className="form-submit" disabled={enviando}>
            {enviando ? 'Confirmando pedido…' : 'Confirmar pedido'}
          </button>
        </form>

        <aside className="checkout__summary">
          <h2>Tu pedido</h2>
          <ul className="checkout__items">
            {items.map((item) => (
              <li key={`${item.productId}-${item.talla}`}>
                <span>
                  {item.marca} {item.nombre} · Talla {item.talla} · x{item.cantidad}
                </span>
                <span>{formatPrice(item.precio * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="checkout__total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Link to="/carrito" className="checkout__edit">
            Modificar carrito
          </Link>
        </aside>
      </div>
    </section>
  );
}