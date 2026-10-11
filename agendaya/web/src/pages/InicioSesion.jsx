// HU3: inicio de sesión. Si los datos son correctos la API devuelve el token y la app entra al inicio.
import { useState } from 'react';
import { api } from '../api';
import { APP } from '../config';
import { Icono, Logo } from '../components/Iconos';
import { Aviso } from '../components/Layout';

export default function InicioSesion({ alEntrar, irARegistro, mensajeInicial = '' }) {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !clave) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }
    setEnviando(true);
    try {
      const datos = await api.login(email, clave);
      alEntrar(datos, recordarme);
    } catch (err) {
      setError(err.message); // por ejemplo: "Correo o contraseña incorrectos."
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="acceso">
      <div className="circulo circulo--a" aria-hidden="true" />
      <div className="circulo circulo--b" aria-hidden="true" />

      <div className="acceso__marca">
        <Logo grande />
        <div className="acceso__eslogan">{APP.eslogan}</div>
      </div>

      <form className="tarjeta tarjeta--grande acceso__tarjeta formulario" onSubmit={enviar} noValidate>
        <h1 className="acceso__titulo">Iniciar sesión</h1>

        {mensajeInicial && !error && <Aviso tipo="info">{mensajeInicial}</Aviso>}
        {error && <Aviso tipo="error">{error}</Aviso>}

        <div className="campo">
          <label htmlFor="correo">Correo electrónico</label>
          <div className="entrada">
            <Icono nombre="usuario" />
            <input id="correo" type="email" placeholder="nombre@correo.com" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <div className="entrada entrada--ojo">
            <Icono nombre="candado" />
            <input id="clave" type={verClave ? 'text' : 'password'} placeholder="Tu contraseña" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} />
            <button type="button" className="ojo" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              <Icono nombre={verClave ? 'ojoCerrado' : 'ojo'} />
            </button>
          </div>
        </div>

        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Iniciar sesión'}
        </button>

        <div className="acceso__fila">
          <label className="check">
            <input type="checkbox" checked={recordarme} onChange={(e) => setRecordarme(e.target.checked)} /> Recordarme
          </label>
        </div>

        <div className="separador">o</div>

        <button type="button" className="btn btn--contorno" onClick={irARegistro}>
          Crear cuenta
        </button>
      </form>

      <p className="acceso__pie">{APP.creditos}</p>
    </main>
  );
}
