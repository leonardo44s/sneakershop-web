import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/useCart.js';
import { useAuth } from '../context/useAuth.js';
import '../styles/cart.css';
import '../styles/header.css';

export default function Header() {
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

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
          {isLoggedIn ? (
            <div className="header__user">
              <span className="header__name">Hola, {user.nombre.split(' ')[0]}</span>
              <button type="button" className="header__logout" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <NavLink to="/login">Ingresar</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
