// Página principal: saludo, botón "Agendar cita" y las próximas citas del usuario (HU9)
import { useEffect, useState } from 'react';
import { api, yaPaso } from '../api';
import { Icono } from '../components/Iconos';
import { Aviso } from '../components/Layout';
import TarjetaCita from '../components/TarjetaCita';

export default function Inicio({ usuario, ir }) {
  const [citas, setCitas] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.misCitas().then(setCitas).catch((e) => setError(e.message));
  }, []);

  const proximas = (citas || [])
    .filter((c) => (c.estado === 'pendiente' || c.estado === 'confirmada') && !yaPaso(c.fecha, c.hora_inicio))
    .slice(0, 3);

  return (
    <div className="panel">
      <div>
        <h1 className="titulo">¡Hola, {usuario.nombres.split(' ')[0]}!</h1>
        <p className="subtitulo">Aquí puedes agendar tus citas de forma rápida y segura.</p>
      </div>

      <button type="button" className="btn btn--grande" onClick={() => ir('buscar')}>
        <Icono nombre="calendario" />
        Agendar cita
      </button>

      <div className="fila-titulo">
        <h2 className="h2">Tus próximas citas</h2>
        <button type="button" className="enlace" onClick={() => ir('miscitas')}>Ver todas ›</button>
      </div>

      {error && <Aviso tipo="error">{error}</Aviso>}
      {citas === null && !error && <p className="cargando">Cargando tus citas…</p>}

      {citas !== null && (
        proximas.length === 0 ? (
          <div className="tarjeta vacio">Aún no tienes citas próximas. Toca “Agendar cita” para reservar la primera.</div>
        ) : (
          <div className="lista">
            {proximas.map((c) => (
              <TarjetaCita key={c.id_cita} cita={c} alAbrir={() => ir('miscitas')} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
