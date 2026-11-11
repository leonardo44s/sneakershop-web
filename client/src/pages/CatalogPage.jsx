import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import '../styles/catalog.css';

const LIMIT = 12;

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);

  const [state, setState] = useState({ page: null, result: null, error: '' });

  useEffect(() => {
    let active = true;

    apiGet(`/products?page=${page}&limit=${LIMIT}`)
      .then((result) => {
        if (active) setState({ page, result, error: '' });
      })
      .catch(() => {
        if (active) {
          setState({
            page,
            result: null,
            error: 'No pudimos cargar el catálogo. Intenta de nuevo más tarde.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [page]);

  const loading = state.page !== page;
  const products = state.result?.data ?? [];

  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section>
      <h1 className="catalog__title">Catálogo</h1>

      {loading && (
        <div className="catalog__grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="product-card product-card--skeleton" />
          ))}
        </div>
      )}

      {!loading && state.error && (
        <p className="catalog__message catalog__message--error">{state.error}</p>
      )}

      {!loading && !state.error && products.length === 0 && (
        <p className="catalog__message">Por ahora no hay zapatillas disponibles.</p>
      )}

      {!loading && !state.error && products.length > 0 && (
        <>
          <div className="catalog__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination
            page={state.result.page}
            totalPages={state.result.totalPages}
            onChange={goToPage}
          />
        </>
      )}
    </section>
  );
}
