import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { apiGet } from '../services/api.js';
import { useAuth } from '../context/useAuth.js';
import { formatPrice } from '../utils/format.js';
import '../styles/checkout.css';

export default function OrderConfirmationPage() {
  const { codigo } = useParams();
  const location = useLocation();
  const { token, isLoggedIn } = useAuth();

  const desdeCheckout =
    location.state?.pedido?.codigo === codigo ? location.state.pedido : null;
  const [consulta, setConsulta] = useState({ codigo: null, pedido: null, error: '' });

  useEffect(() => {
    if (desdeCheckout || !isLoggedIn) return undefined;
    let active = true;

    apiGet(`/orders/${encodeURIComponent(codigo)}`, token)
      .then((pedido) => {
        if (active) setConsulta({ codigo, pedido, error: '' });
      })
      .catch(() => {
        if (active) {
          setConsulta({ codigo, pedido: null, error: 'No encontramos este pedido en tu cuenta.' });
        }
      });

    return () => {
      active = false;
    };
  }, [codigo, desdeCheckout, isLoggedIn, token]);

  if (!desdeCheckout && !isLoggedIn) {
    return (
      <section className="checkout-empty">
        <h1>Inicia sesión para ver tu pedido</h1>
        <Link to={`/login?redirect=/pedido/${codigo}`} className="btn">
          Iniciar sesión
        </Link>
      </section>
    );
  }

  const pedido = desdeCheckout || (consulta.codigo === codigo ? consulta.pedido : null);

  if (!pedido && consulta.codigo === codigo && consulta.error) {
    return (
      <section className="checkout-empty">
        <h1>Pedido no encontrado</h1>
        <p>{consulta.error}</p>
        <Link to="/" className="btn">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  if (!pedido) {
    return <p className="checkout-loading">Cargando pedido…</p>;
  }

  return (
    <section className="order">
      <div className="order__header">
        <h1>¡Pedido confirmado!</h1>
        <p>Guarda este código para cualquier consulta:</p>
        <p className="order__code">{pedido.codigo}</p>
        <span className="order__status">{pedido.estado}</span>
      </div>

      <div className="order__card">
        <h2>Productos</h2>
        <ul className="checkout__items">
          {pedido.items.map((item, i) => (
            <li key={i}>
              <span>
                {item.marca} {item.nombre} · Talla {item.talla} · x{item.cantidad}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="checkout__total">
          <span>Total</span>
          <span>{formatPrice(pedido.total)}</span>
        </div>
      </div>

      <div className="order__card">
        <h2>Entrega</h2>
        <p>
          {pedido.entrega.direccion}, {pedido.entrega.ciudad}
        </p>
        <p>Teléfono: {pedido.entrega.telefono}</p>
        <p>
          <strong>Pago contra entrega:</strong> pagas cuando recibas tus zapatillas.
        </p>
      </div>

      <Link to="/" className="btn order__continue">
        Seguir comprando
      </Link>
    </section>
  );
}