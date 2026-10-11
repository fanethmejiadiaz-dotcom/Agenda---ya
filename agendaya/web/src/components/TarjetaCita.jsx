// Tarjeta de una cita: se usa en "Inicio" (resumen) y en "Mis citas" (con acciones)
import { formatoFecha, formatoHora } from '../api';
import { Icono, IconoCategoria } from './Iconos';
import { Chip } from './Layout';

export default function TarjetaCita({ cita, alAbrir, alCancelar, cancelando = false }) {
  const puedeCancelar = alCancelar && (cita.estado === 'pendiente' || cita.estado === 'confirmada');
  const lugar = [cita.profesional, cita.establecimiento].filter(Boolean).join(' · ');

  return (
    <article className={`tarjeta ${cita.estado === 'cancelada' ? 'cita--cancelada' : ''}`}>
      <div className={`cita ${puedeCancelar ? 'cita--arriba' : ''}`}>
        <IconoCategoria categoria={cita.categoria} />
        <div className="cita__info">
          <div className="cita__nombre">{cita.servicio}</div>
          <div className="cita__detalle">{lugar}</div>
          <div className="cita__detalle">
            {formatoFecha(cita.fecha)} · {formatoHora(cita.hora_inicio)}
          </div>
          {cita.observaciones && <div className="cita__notas">“{cita.observaciones}”</div>}
        </div>
        <Chip estado={cita.estado} />
        {alAbrir && (
          <button type="button" className="cita__ir" onClick={alAbrir} aria-label={`Ver ${cita.servicio} en mis citas`}>
            <Icono nombre="derecha" />
          </button>
        )}
      </div>
      {puedeCancelar && (
        <div className="cita-acciones">
          <span className="texto-gris" style={{ alignSelf: 'center' }}>
            Dura {cita.duracion_min} min · termina {formatoHora(cita.hora_fin)}
          </span>
          <button type="button" className="btn btn--peligro btn--sm" disabled={cancelando} onClick={() => alCancelar(cita)}>
            {cancelando ? 'Cancelando…' : 'Cancelar cita'}
          </button>
        </div>
      )}
    </article>
  );
}
