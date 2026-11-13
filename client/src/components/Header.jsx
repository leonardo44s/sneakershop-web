import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import '../styles/cart.css';

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          SneakerShop
        </Link>
        <nav className="header__nav">
          <NavLink to="/" end>
            Catálogo
          </NavLink>
          <NavLink
            to="/carrito"
            className="header__cart"
            aria-label={`Carrito, ${totalItems} productos`}
          >
            Carrito
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
