import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGet } from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import '../styles/catalog.css';
import '../styles/filters.css';

const LIMIT = 12;

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get('page')) || 1, 1);
  const marcas = searchParams.get('marcas') || '';
  const talla = searchParams.get('talla') || '';

  const query = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (marcas) query.set('marcas', marcas);
  if (talla) query.set('talla', talla);
  const queryKey = query.toString();

  const [state, setState] = useState({ key: null, result: null, error: '' });

  useEffect(() => {
    let active = true;

    apiGet(`/products?${queryKey}`)
      .then((result) => {
        if (active) setState({ key: queryKey, result, error: '' });
      })
      .catch(() => {
        if (active) {
          setState({
            key: queryKey,
            result: null,
            error: 'No pudimos cargar el catálogo. Intenta de nuevo más tarde.',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  const loading = state.key !== queryKey;
  const products = state.result?.data ?? [];
  const hayFiltros = Boolean(marcas || talla);

  function updateParams(cambios) {
    const next = new URLSearchParams(searchParams);
    Object.entries(cambios).forEach(([clave, valor]) => {
      if (valor) next.set(clave, valor);
      else next.delete(clave);
    });
    setSearchParams(next);
  }

  function goToPage(newPage) {
    updateParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleFiltersChange(cambios) {
    // Al cambiar un filtro se vuelve a la página 1
    updateParams({ ...cambios, page: '' });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
  }

  return (
    <section>
      <h1 className="catalog__title">Catálogo</h1>

      <FilterPanel
        marcas={marcas}
        talla={talla}
        onChange={handleFiltersChange}
        onClear={clearFilters}
      />

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
        <div className="catalog__message">
          {hayFiltros ? (
            <>
              <p>No encontramos zapatillas con esos filtros.</p>
              <button type="button" className="btn" onClick={clearFilters}>
                Limpiar filtros
              </button>
            </>
          ) : (
            <p>Por ahora no hay zapatillas disponibles.</p>
          )}
        </div>
      )}

      {!loading && !state.error && products.length > 0 && (
        <>
          <p className="catalog__count">
            {state.result.total} {state.result.total === 1 ? 'zapatilla' : 'zapatillas'}
          </p>
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