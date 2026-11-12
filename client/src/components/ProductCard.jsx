import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format.js';

export default function ProductCard({ product }) {
  return (
    <Link to={`/producto/${product.id}`} className="product-card">
      <div className="product-card__image">
        {product.imagen ? (
          <img src={product.imagen} alt={`${product.marca} ${product.nombre}`} loading="lazy" />
        ) : (
          <span>Sin imagen</span>
        )}
      </div>
      <div className="product-card__body">
        <span className="product-card__brand">{product.marca}</span>
        <h2 className="product-card__name">{product.nombre}</h2>
        <span className="product-card__price">{formatPrice(product.precio)}</span>
      </div>
    </Link>
  );
}
