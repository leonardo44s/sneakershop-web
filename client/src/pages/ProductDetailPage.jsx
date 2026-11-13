import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiGet } from '../services/api.js';
import { formatPrice } from '../utils/format.js';
import { useCart } from '../context/useCart.js';
import SizeSelector from '../components/SizeSelector.jsx';
import '../styles/detail.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  // La "key" reinicia la página cuando se cambia de zapatilla
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }) {
  const { addItem } = useCart();
  const [data, setData] = useState({ status: 'loading', product: null });
  const [talla, setTalla] = useState('');
  const [aviso, setAviso] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    let active = true;

    apiGet(`/products/${id}`)
      .then((product) => {
        if (active) setData({ status: 'ok', product });
      })
      .catch((error) => {
        if (active) {
          setData({ status: error.status === 404 ? 'notfound' : 'error', product: null });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (data.status === 'loading') {
    return (
      <div className="detail__layout">
        <div className="detail__image skeleton" />
        <div className="detail__info">
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      </div>
    );
  }

  if (data.status === 'notfound') {
    return (
      <section className="not-found">
        <h1>404</h1>
        <p>Esta zapatilla no existe o ya no está disponible.</p>
        <Link to="/" className="btn">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  if (data.status === 'error') {
    return (
      <p className="detail__error">No pudimos cargar el producto. Intenta de nuevo más tarde.</p>
    );
  }

  const { product } = data;
  const agotado = product.tallas.every((t) => t.stock === 0);
  const imagenes = product.imagenes.length > 0 ? product.imagenes : [null];

  function handleSelect(nuevaTalla) {
    setTalla(nuevaTalla);
    setAviso(null);
  }

  function handleAgregar() {
    const seleccion = product.tallas.find((t) => t.talla === talla);
    const resultado = addItem({
      productId: product.id,
      nombre: product.nombre,
      marca: product.marca,
      imagen: product.imagenes[0] || null,
      precio: product.precio,
      talla,
      stock: seleccion.stock,
    });
    setAviso({ tipo: resultado.ok ? 'ok' : 'error', texto: resultado.mensaje });
  }

  return (
    <article className="detail">
      <Link to="/" className="detail__back">
        ← Volver al catálogo
      </Link>

      <div className="detail__layout">
        <div className="detail__gallery">
          <div className="detail__image">
            {imagenes[imagenActiva] ? (
              <img src={imagenes[imagenActiva]} alt={`${product.marca} ${product.nombre}`} />
            ) : (
              <span>Sin imagen</span>
            )}
          </div>
          {imagenes.length > 1 && (
            <div className="detail__thumbs">
              {imagenes.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === imagenActiva ? 'is-active' : ''}
                  onClick={() => setImagenActiva(i)}
                >
                  <img src={src} alt={`Vista ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail__info">
          <span className="detail__brand">{product.marca}</span>
          <h1 className="detail__name">{product.nombre}</h1>
          <p className="detail__price">{formatPrice(product.precio)}</p>
          {agotado && <p className="detail__badge">Agotado</p>}
          {product.descripcion && <p className="detail__description">{product.descripcion}</p>}

          <SizeSelector tallas={product.tallas} seleccionada={talla} onSelect={handleSelect} />

          <button
            type="button"
            className="detail__add"
            disabled={!talla || agotado}
            onClick={handleAgregar}
          >
            Agregar al carrito
          </button>

          {!talla && !agotado && (
            <p className="detail__hint">Selecciona una talla para agregar al carrito.</p>
          )}
          {aviso && (
            <p
              className={`detail__notice${aviso.tipo === 'error' ? ' detail__notice--error' : ''}`}
              role="status"
            >
              {aviso.texto}
              {aviso.tipo === 'ok' && <Link to="/carrito">Ver carrito</Link>}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
