// Pantalla principal del PMV: servicio → fecha y hora → confirmación (HU6, HU13, HU8)
import { useEffect, useState } from 'react';
import { api, formatoFecha, formatoFechaLarga, formatoHora } from '../api';
import { Icono, IconoCategoria } from '../components/Iconos';
import { Aviso } from '../components/Layout';

const PASOS = ['Servicio', 'Fecha y hora', 'Confirmación'];

export default function AgendarCita({ servicioInicial = null, alTerminar, ir }) {
  const [paso, setPaso] = useState(servicioInicial ? 2 : 1);
  const [servicios, setServicios] = useState([]);
  const [servicio, setServicio] = useState(servicioInicial);
  const [fechas, setFechas] = useState([]);
  const [fecha, setFecha] = useState(null);
  const [franjas, setFranjas] = useState(null);
  const [franja, setFranja] = useState(null);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  // 1. Al abrir la pantalla, carga los servicios disponibles
  useEffect(() => {
    api.servicios().then(setServicios).catch((e) => setError(e.message));
  }, []);

  // 2. Al elegir un servicio, carga las fechas que tienen franjas libres
  useEffect(() => {
    if (!servicio) return;
    api.fechas(servicio.id_servicio).then(setFechas).catch((e) => setError(e.message));
  }, [servicio]);

  // 3. Al elegir una fecha, carga las horas disponibles de ese día
  useEffect(() => {
    if (!servicio || !fecha) return;
    api.disponibilidad(servicio.id_servicio, fecha).then(setFranjas).catch((e) => setError(e.message));
  }, [servicio, fecha]);

  // Al cambiar de servicio o de fecha se limpia lo que se había elegido después
  function elegirServicio(s) {
    setServicio(s);
    setFecha(null);
    setFranja(null);
    setFranjas(null);
  }
  function elegirFecha(f) {
    setFecha(f);
    setFranja(null);
    setFranjas(null);
  }

  async function confirmar() {
    setError('');
    setEnviando(true);
    try {
      await api.agendar(franja.id_horario, notas.trim() || null);
      setListo(true);
    } catch (e) {
      setError(e.message); // por ejemplo: "Ese horario ya no está disponible"
      setPaso(2);
      setFranja(null);
      setFranjas(await api.disponibilidad(servicio.id_servicio, fecha).catch(() => []));
    } finally {
      setEnviando(false);
    }
  }

  // ---------- Vista de éxito ----------
  if (listo) {
    return (
      <div className="panel panel--centrado">
        <div className="exito" aria-hidden="true">
          <span className="confeti" style={{ left: 14, top: 6, background: '#DB2777', transform: 'rotate(30deg)' }} />
          <span className="confeti" style={{ right: 10, top: 0, background: '#4F46E5', transform: 'rotate(-30deg)' }} />
          <span className="confeti confeti--punto" style={{ left: 4, top: 50, background: '#0284C7' }} />
          <span className="confeti confeti--punto" style={{ right: 0, top: 46, background: '#DB2777' }} />
          <span className="confeti" style={{ left: 12, bottom: 6, background: '#16A34A', transform: 'rotate(-40deg)' }} />
          <span className="confeti" style={{ right: 6, bottom: 8, background: '#4F46E5', transform: 'rotate(40deg)' }} />
          <div className="exito__circulo"><Icono nombre="check" /></div>
        </div>
        <div>
          <h1 className="titulo">¡Cita agendada!</h1>
          <p className="subtitulo subtitulo--md">Tu cita quedó registrada en estado pendiente.</p>
        </div>
        <ResumenCita servicio={servicio} fecha={fecha} franja={franja} notas={notas} />
        <button type="button" className="btn" onClick={alTerminar}>Ver mis citas</button>
        <button type="button" className="btn btn--contorno" onClick={() => ir('inicio')}>Volver al inicio</button>
        <div className="nota-info">
          <Icono nombre="info" />
          Llega 10 minutos antes. Si no puedes asistir, cancélala desde “Mis citas”.
        </div>
      </div>
    );
  }

  return (
    <div className="panel panel--centro">
      <div className="volver">
        <button type="button" className="volver__btn" onClick={() => (paso > 1 ? setPaso(paso - 1) : ir('buscar'))} aria-label="Volver">
          <Icono nombre="izquierda" />
        </button>
        <h1 className="titulo titulo--md">Agendar cita</h1>
      </div>

      <div className="pasos" aria-label="Pasos para agendar">
        {PASOS.map((nombre, i) => {
          const n = i + 1;
          const clase = n === paso ? 'paso--activo' : n < paso ? 'paso--hecho' : '';
          return (
            <div key={nombre} style={{ display: 'contents' }}>
              {i > 0 && <div className="pasos__linea" />}
              <div className={`paso ${clase}`} aria-current={n === paso ? 'step' : undefined}>
                <span className="paso__num">{n < paso ? '✓' : n}</span>
                <span className="paso__txt">{nombre}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}

      {/* ---------- Paso 1: servicio ---------- */}
      {paso === 1 && (
        <section className="bloque bloque--14">
          <h2 className="seccion-titulo"><Icono nombre="buscar" />Elige el servicio</h2>
          {servicios.length === 0 && !error && <p className="cargando">Cargando servicios…</p>}
          <div className="lista">
            {servicios.map((s) => (
              <button
                key={s.id_servicio}
                type="button"
                className="opcion-servicio"
                aria-pressed={servicio?.id_servicio === s.id_servicio}
                onClick={() => elegirServicio(s)}
              >
                <IconoCategoria categoria={s.categoria} />
                <span className="cita__info">
                  <span className="cita__nombre">{s.nombre}</span>
                  <span className="cita__detalle">{[s.profesional, s.establecimiento].filter(Boolean).join(' · ')}</span>
                  <span className="cita__detalle">{s.categoria} · {s.duracion_min} min</span>
                </span>
              </button>
            ))}
          </div>
          <div className="acciones">
            <button type="button" className="btn btn--contorno" onClick={() => ir('buscar')}>Buscar</button>
            <button type="button" className="btn" disabled={!servicio} onClick={() => setPaso(2)}>Siguiente</button>
          </div>
        </section>
      )}

      {/* ---------- Paso 2: fecha y hora ---------- */}
      {paso === 2 && (
        <section className="bloque bloque--14">
          <div className="tarjeta servicio">
            <IconoCategoria categoria={servicio.categoria} />
            <div className="cita__info">
              <div className="cita__nombre cita__nombre--lg">{servicio.nombre}</div>
              <div className="cita__detalle">{[servicio.profesional, servicio.establecimiento].filter(Boolean).join(' · ')}</div>
            </div>
            <button type="button" className="enlace" onClick={() => setPaso(1)}>Cambiar servicio</button>
          </div>

          <h2 className="seccion-titulo"><Icono nombre="calendario" />Elige la fecha</h2>
          {fechas.length === 0 && <p className="texto-gris">Este servicio no tiene fechas disponibles por ahora.</p>}
          <div className="opciones">
            {fechas.map((f) => (
              <button key={f} type="button" className="opcion" aria-pressed={fecha === f} onClick={() => elegirFecha(f)}>
                {formatoFecha(f)}
              </button>
            ))}
          </div>

          {fecha && (
            <>
              <h2 className="seccion-titulo"><Icono nombre="reloj" />Elige la hora</h2>
              {franjas === null && <p className="cargando">Buscando horas libres…</p>}
              {franjas && franjas.length === 0 && <p className="texto-gris">No hay horas disponibles ese día.</p>}
              {franjas && franjas.length > 0 && (
                <div className="opciones">
                  {franjas.map((h) => (
                    <button
                      key={h.id_horario}
                      type="button"
                      className="opcion"
                      aria-pressed={franja?.id_horario === h.id_horario}
                      onClick={() => setFranja(h)}
                    >
                      {formatoHora(h.hora_inicio)}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="acciones">
            <button type="button" className="btn btn--contorno" onClick={() => setPaso(1)}>Atrás</button>
            <button type="button" className="btn" disabled={!franja} onClick={() => setPaso(3)}>Siguiente</button>
          </div>
        </section>
      )}

      {/* ---------- Paso 3: confirmación ---------- */}
      {paso === 3 && (
        <section className="bloque bloque--14">
          <h2 className="seccion-titulo"><Icono nombre="check" />Revisa y confirma</h2>
          <ResumenCita servicio={servicio} fecha={fecha} franja={franja} />
          <div className="campo">
            <label htmlFor="notas" className="etiqueta etiqueta--md">Notas (opcional)</label>
            <textarea
              id="notas"
              className="area"
              rows="3"
              maxLength="500"
              placeholder="Escribe alguna observación adicional..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
            <span className="campo__ayuda">{notas.length}/500</span>
          </div>
          <div className="acciones">
            <button type="button" className="btn btn--contorno" onClick={() => setPaso(2)}>Atrás</button>
            <button type="button" className="btn" disabled={enviando} onClick={confirmar}>
              {enviando ? 'Guardando…' : 'Confirmar cita'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ResumenCita({ servicio, fecha, franja, notas }) {
  return (
    <div className="tarjeta resumen">
      <div className="cita">
        <IconoCategoria categoria={servicio.categoria} />
        <div className="cita__info">
          <div className="cita__nombre cita__nombre--lg">{servicio.nombre}</div>
          <div className="cita__detalle">{[servicio.profesional, servicio.establecimiento].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      <div className="resumen__lineas">
        <div className="resumen__linea"><Icono nombre="calendario" /><span>{formatoFechaLarga(fecha)}</span></div>
        <div className="resumen__linea">
          <Icono nombre="reloj" />
          <span>{formatoHora(franja.hora_inicio)} a {formatoHora(franja.hora_fin)} ({servicio.duracion_min} min)</span>
        </div>
        {notas && <div className="resumen__linea"><Icono nombre="info" /><span style={{ fontWeight: 500 }}>{notas}</span></div>}
      </div>
    </div>
  );
}
