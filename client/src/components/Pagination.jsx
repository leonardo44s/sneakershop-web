export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Paginación del catálogo">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1}>
        Anterior
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          className={n === page ? 'is-active' : ''}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        Siguiente
      </button>
    </nav>
  );
}
