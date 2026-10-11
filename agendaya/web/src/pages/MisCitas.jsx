// HU9: mis citas con su estado. HU11: cancelar con confirmación (la hora vuelve a quedar libre).
import { useEffect, useState } from 'react';
import { api, formatoFecha, formatoHora, yaPaso } from '../api';
import { Aviso } from '../components/Layout';
import TarjetaCita from '../components/TarjetaCita';

export default function MisCitas() {
  const [citas, setCitas] = useState(null);
  const [pestana, setPestana] = useState('proximas');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cancelando, setCancelando] = useState(null); // id de la cita que se está cancelando

  function cargar() {
    return api.misCitas().then(setCitas).catch((e) => setError(e.message));
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cancelar(cita) {
    const seguro = window.confirm(
      `¿Seguro que quieres cancelar la cita de ${cita.servicio} el ${formatoFecha(cita.fecha)} a las ${formatoHora(cita.hora_inicio)}?`
    );
    if (!seguro) return; // si dice que no, no cambia nada (criterio de aceptación de HU11)

    setError('');
    setMensaje('');
    setCancelando(cita.id_cita);
    try {
      const r = await api.cancelar(cita.id_cita);
      setMensaje(r.mensaje);
      await cargar();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelando(null);
    }
  }

  const esProxima = (c) => (c.estado === 'pendiente' || c.estado === 'confirmada') && !yaPaso(c.fecha, c.hora_inicio);
  const proximas = (citas || []).filter(esProxima);
  const historial = (citas || []).filter((c) => !esProxima(c)).slice().reverse(); // las más recientes primero
  const visibles = pestana === 'proximas' ? proximas : historial;

  return (
    <div className="panel">
      <div>
        <h1 className="titulo">Mis citas</h1>
        <p className="subtitulo">Aquí puedes ver y cancelar tus citas.</p>
      </div>

      <div className="tabs" role="tablist" aria-label="Mis citas">
        <button type="button" role="tab" className="tab" aria-selected={pestana === 'proximas'} onClick={() => setPestana('proximas')}>
          Próximas {citas && `(${proximas.length})`}
        </button>
        <button type="button" role="tab" className="tab" aria-selected={pestana === 'historial'} onClick={() => setPestana('historial')}>
          Historial {citas && `(${historial.length})`}
        </button>
      </div>

      {mensaje && <Aviso tipo="ok">{mensaje}</Aviso>}
      {error && <Aviso tipo="error">{error}</Aviso>}
      {citas === null && !error && <p className="cargando">Cargando tus citas…</p>}

      {citas !== null && (
        visibles.length === 0 ? (
          <div className="tarjeta vacio">
            {pestana === 'proximas' ? 'No tienes citas próximas.' : 'Tu historial está vacío: aquí verás las citas atendidas y canceladas.'}
          </div>
        ) : (
          <div className="lista" role="tabpanel">
            {visibles.map((c) => (
              <TarjetaCita
                key={c.id_cita}
                cita={c}
                alCancelar={pestana === 'proximas' ? cancelar : undefined}
                cancelando={cancelando === c.id_cita}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
