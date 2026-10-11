// HU14: datos del usuario que inició sesión (se leen de la API con el token)
import { useEffect, useState } from 'react';
import { api, formatoFecha } from '../api';
import { Aviso } from '../components/Layout';

export default function Perfil({ usuario, cerrarSesion }) {
  const [datos, setDatos] = useState(usuario);
  const [error, setError] = useState('');

  useEffect(() => {
    api.perfil().then(setDatos).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="panel">
      <div>
        <h1 className="titulo">Mi perfil</h1>
        <p className="subtitulo">Estos son los datos de tu cuenta.</p>
      </div>
      {error && <Aviso tipo="error">{error}</Aviso>}
      <div className="tarjeta tarjeta--grande datos">
        <div className="dato"><span className="dato__etq">Nombres</span><span className="dato__val">{datos.nombres}</span></div>
        <div className="dato"><span className="dato__etq">Apellidos</span><span className="dato__val">{datos.apellidos}</span></div>
        <div className="dato"><span className="dato__etq">Correo</span><span className="dato__val">{datos.email}</span></div>
        <div className="dato"><span className="dato__etq">Teléfono</span><span className="dato__val">{datos.telefono || '—'}</span></div>
        <div className="dato"><span className="dato__etq">Fecha de nacimiento</span><span className="dato__val">{datos.fecha_nacimiento ? formatoFecha(datos.fecha_nacimiento) : '—'}</span></div>
        <div className="dato"><span className="dato__etq">Rol</span><span className="dato__val">{datos.rol === 'admin' ? 'Administrador' : 'Usuario'}</span></div>
      </div>
      <button type="button" className="btn btn--contorno btn--auto" onClick={cerrarSesion}>Cerrar sesión</button>
    </div>
  );
}
