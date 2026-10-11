// HU1: registro de usuario. Al crear la cuenta la API devuelve el token y la app entra directamente.
import { useState } from 'react';
import { api } from '../api';
import { APP } from '../config';
import { Icono, Logo } from '../components/Iconos';
import { Aviso } from '../components/Layout';

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Registro({ alEntrar, irAInicioSesion }) {
  const [datos, setDatos] = useState({ nombres: '', apellidos: '', email: '', telefono: '', fecha_nacimiento: '', clave: '', confirmar: '' });
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  function validar() {
    if (!datos.nombres.trim() || !datos.apellidos.trim()) return 'Escribe tus nombres y apellidos.';
    if (!CORREO_VALIDO.test(datos.email.trim())) return 'El correo no tiene un formato válido.';
    if (datos.clave.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (datos.clave !== datos.confirmar) return 'Las contraseñas no coinciden.';
    return '';
  }

  async function enviar(e) {
    e.preventDefault();
    const problema = validar();
    setError(problema);
    if (problema) return;
    setEnviando(true);
    try {
      const { confirmar: _confirmar, ...cuerpo } = datos; // "confirmar" no se envía a la API
      const respuesta = await api.registro({
        ...cuerpo,
        telefono: cuerpo.telefono.trim() || null,
        fecha_nacimiento: cuerpo.fecha_nacimiento || null,
      });
      alEntrar(respuesta, false);
    } catch (err) {
      setError(err.message); // por ejemplo: "Ya existe una cuenta con ese correo."
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

      <form className="tarjeta tarjeta--grande acceso__tarjeta acceso__tarjeta--ancha formulario" onSubmit={enviar} noValidate>
        <h1 className="acceso__titulo">Crear cuenta</h1>
        {error && <Aviso tipo="error">{error}</Aviso>}

        <div className="dos-columnas">
          <div className="campo">
            <label htmlFor="nombres">Nombres</label>
            <div className="entrada"><Icono nombre="usuario" /><input id="nombres" autoComplete="given-name" value={datos.nombres} onChange={cambiar('nombres')} /></div>
          </div>
          <div className="campo">
            <label htmlFor="apellidos">Apellidos</label>
            <div className="entrada"><Icono nombre="usuario" /><input id="apellidos" autoComplete="family-name" value={datos.apellidos} onChange={cambiar('apellidos')} /></div>
          </div>
        </div>

        <div className="campo">
          <label htmlFor="email">Correo electrónico</label>
          <div className="entrada"><Icono nombre="correo" /><input id="email" type="email" placeholder="nombre@correo.com" autoComplete="email" value={datos.email} onChange={cambiar('email')} /></div>
        </div>

        <div className="dos-columnas">
          <div className="campo">
            <label htmlFor="telefono">Teléfono <span className="campo__ayuda">(opcional)</span></label>
            <div className="entrada"><Icono nombre="telefono" /><input id="telefono" type="tel" autoComplete="tel" value={datos.telefono} onChange={cambiar('telefono')} /></div>
          </div>
          <div className="campo">
            <label htmlFor="nacimiento">Fecha de nacimiento <span className="campo__ayuda">(opcional)</span></label>
            <div className="entrada"><Icono nombre="calendario" /><input id="nacimiento" type="date" autoComplete="bday" value={datos.fecha_nacimiento} onChange={cambiar('fecha_nacimiento')} /></div>
          </div>
        </div>

        <div className="dos-columnas">
          <div className="campo">
            <label htmlFor="clave">Contraseña</label>
            <div className="entrada entrada--ojo">
              <Icono nombre="candado" />
              <input id="clave" type={verClave ? 'text' : 'password'} autoComplete="new-password" value={datos.clave} onChange={cambiar('clave')} />
              <button type="button" className="ojo" onClick={() => setVerClave((v) => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                <Icono nombre={verClave ? 'ojoCerrado' : 'ojo'} />
              </button>
            </div>
            <span className="campo__ayuda">Mínimo 8 caracteres.</span>
          </div>
          <div className="campo">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <div className="entrada"><Icono nombre="candado" /><input id="confirmar" type={verClave ? 'text' : 'password'} autoComplete="new-password" value={datos.confirmar} onChange={cambiar('confirmar')} /></div>
          </div>
        </div>

        <button type="submit" className="btn" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>

        <p className="centrado">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="enlace" onClick={irAInicioSesion}>Inicia sesión</button>
        </p>
      </form>
    </main>
  );
}
