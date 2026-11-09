import { Link, NavLink } from 'react-router-dom';

export default function Header() {
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
        </nav>
      </div>
    </header>
  );
}
