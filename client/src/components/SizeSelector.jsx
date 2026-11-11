export default function SizeSelector({ tallas, seleccionada, onSelect }) {
  const actual = tallas.find((t) => t.talla === seleccionada);

  return (
    <div className="sizes">
      <p className="sizes__label">Talla</p>
      <div className="sizes__grid">
        {tallas.map(({ talla, stock }) => (
          <button
            key={talla}
            type="button"
            className={`sizes__option${seleccionada === talla ? ' is-active' : ''}`}
            disabled={stock === 0}
            aria-pressed={seleccionada === talla}
            title={stock === 0 ? 'Agotada' : `${stock} disponibles`}
            onClick={() => onSelect(talla)}
          >
            {talla}
          </button>
        ))}
      </div>
      {actual && actual.stock <= 2 && (
        <p className="sizes__low">¡Últimas {actual.stock} unidades en esta talla!</p>
      )}
    </div>
  );
}
