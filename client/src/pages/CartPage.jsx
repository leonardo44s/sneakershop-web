import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import { formatPrice } from '../utils/format.js';
import '../styles/cart.css';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="cart-empty">
        <h1>Tu carrito está vacío</h1>
        <p>Explora el catálogo y agrega tus zapatillas favoritas.</p>
        <Link to="/" className="btn">
          Ir al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="cart">
      <h1>Carrito</h1>

      <div className="cart__layout">
        <ul className="cart__list">
          {items.map((item) => (
            <li key={`${item.productId}-${item.talla}`} className="cart-item">
              <Link to={`/producto/${item.productId}`} className="cart-item__image">
                {item.imagen ? (
                  <img src={item.imagen} alt={`${item.marca} ${item.nombre}`} />
                ) : (
                  <span>Sin imagen</span>
                )}
              </Link>

              <div className="cart-item__info">
                <span className="cart-item__brand">{item.marca}</span>
                <Link to={`/producto/${item.productId}`} className="cart-item__name">
                  {item.nombre}
                </Link>
                <span className="cart-item__detail">Talla {item.talla}</span>
                <span className="cart-item__detail">{formatPrice(item.precio)} c/u</span>
              </div>

              <div className="cart-item__actions">
                <div
                  className="qty"
                  role="group"
                  aria-label={`Cantidad de ${item.nombre} talla ${item.talla}`}
                >
                  <button
                    type="button"
                    aria-label="Disminuir cantidad"
                    disabled={item.cantidad <= 1}
                    onClick={() => updateQuantity(item.productId, item.talla, item.cantidad - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.cantidad}</span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    disabled={item.cantidad >= item.stock}
                    onClick={() => updateQuantity(item.productId, item.talla, item.cantidad + 1)}
                  >
                    +
                  </button>
                </div>
                {item.cantidad >= item.stock && (
                  <span className="cart-item__max">Máximo disponible</span>
                )}
                <span className="cart-item__total">{formatPrice(item.precio * item.cantidad)}</span>
                <button
                  type="button"
                  className="cart-item__remove"
                  onClick={() => removeItem(item.productId, item.talla)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <h2>Resumen</h2>
          <div className="cart-summary__row">
            <span>Productos ({totalItems})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Pago</span>
            <span>Contra entrega</span>
          </div>
          <div className="cart-summary__row cart-summary__total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <button
            type="button"
            className="cart-summary__checkout"
            onClick={() => navigate('/checkout')}
          >
            Continuar con la compra
          </button>
          <Link to="/" className="cart-summary__continue">
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  );
}
