// HU6: buscar servicios por texto y por categoría. Desde aquí se elige el servicio para agendar.
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Icono, IconoCategoria } from '../components/Iconos';
import { Aviso } from '../components/Layout';

export default function BuscarServicio({ ir, qInicial = '' }) {
  const [q, setQ] = useState(qInicial);
  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState(null); // id de la categoría elegida
  const [servicios, setServicios] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.categorias().then(setCategorias).catch((e) => setError(e.message));
  }, []);

  // Cada vez que cambia la categoría o el texto buscado, se consulta la API
  useEffect(() => {
    api
      .servicios({ categoria, q: q.trim() })
      .then((lista) => { setServicios(lista); setError(''); })
      .catch((e) => setError(e.message));
  }, [categoria, q]);

  return (
    <div className="panel panel--ancho">
      <div>
        <h1 className="titulo">Buscar servicio</h1>
        <p className="subtitulo">Encuentra el servicio que necesitas y agenda tu cita.</p>
      </div>

      <label className="buscar-campo">
        <Icono nombre="buscar" />
        <input
          type="search"
          placeholder="Buscar servicio, profesional o establecimiento..."
          aria-label="Buscar servicio, profesional o establecimiento"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>

      <div className="bloque">
        <h2 className="h2 h2--indigo">Categorías</h2>
        <div className="categorias">
          {categorias.map((c) => (
            <button
              key={c.id_categoria}
              type="button"
              className="categoria"
              aria-pressed={categoria === c.id_categoria}
              onClick={() => setCategoria((actual) => (actual === c.id_categoria ? null : c.id_categoria))}
            >
              <IconoCategoria categoria={c.nombre} cuadro />
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="bloque">
        <h2 className="h2 h2--indigo">
          Servicios disponibles {servicios && <span className="texto-gris">({servicios.length})</span>}
        </h2>
        {error && <Aviso tipo="error">{error}</Aviso>}
        {servicios === null && !error && <p className="cargando">Buscando servicios…</p>}
        {servicios && servicios.length === 0 && (
          <div className="tarjeta vacio">No encontramos servicios con esa búsqueda. Prueba con otra palabra o categoría.</div>
        )}
        {servicios && servicios.length > 0 && (
          <div className="lista">
            {servicios.map((s) => (
              <article key={s.id_servicio} className="tarjeta servicio-card">
                <IconoCategoria categoria={s.categoria} />
                <div className="cita__info">
                  <div className="cita__nombre">{s.nombre}</div>
                  <div className="cita__detalle">{[s.profesional, s.establecimiento].filter(Boolean).join(' · ')}</div>
                  <div className="cita__detalle">{s.categoria} · {s.duracion_min} min{s.descripcion ? ` · ${s.descripcion}` : ''}</div>
                </div>
                <button type="button" className="btn btn--sm" onClick={() => ir('agendar', { servicio: s })}>
                  Agendar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
