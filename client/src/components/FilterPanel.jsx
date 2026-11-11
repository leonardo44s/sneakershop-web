import { useEffect, useState } from 'react';
import { apiGet } from '../services/api.js';

export default function FilterPanel({ marcas, talla, onChange, onClear }) {
  const [opciones, setOpciones] = useState({ marcas: [], tallas: [] });

  useEffect(() => {
    Promise.all([apiGet('/brands'), apiGet('/sizes')])
      .then(([listaMarcas, listaTallas]) => {
        setOpciones({ marcas: listaMarcas, tallas: listaTallas });
      })
      .catch(() => {
        setOpciones({ marcas: [], tallas: [] });
      });
  }, []);

  const seleccionadas = marcas ? marcas.split(',') : [];
  const hayFiltros = seleccionadas.length > 0 || Boolean(talla);

  function toggleMarca(id) {
    const clave = String(id);
    const nuevas = seleccionadas.includes(clave)
      ? seleccionadas.filter((m) => m !== clave)
      : [...seleccionadas, clave];
    onChange({ marcas: nuevas.join(',') });
  }

  function toggleTalla(valor) {
    onChange({ talla: talla === valor ? '' : valor });
  }

  return (
    <aside className="filters" aria-label="Filtros del catálogo">
      <div className="filters__group">
        <p className="filters__title">Marca</p>
        <div className="filters__chips">
          {opciones.marcas.map((m) => {
            const activa = seleccionadas.includes(String(m.id));
            return (
              <button
                key={m.id}
                type="button"
                className={`chip${activa ? ' is-active' : ''}`}
                aria-pressed={activa}
                onClick={() => toggleMarca(m.id)}
              >
                {m.nombre}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filters__group">
        <p className="filters__title">Talla</p>
        <div className="filters__chips">
          {opciones.tallas.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${talla === t ? ' is-active' : ''}`}
              aria-pressed={talla === t}
              onClick={() => toggleTalla(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {hayFiltros && (
        <button type="button" className="filters__clear" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}