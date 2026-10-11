// Raíz de la app: maneja la sesión (incremento 2) y qué pantalla se muestra (con useState)
import { useEffect, useState } from 'react';
import { sesion } from './sesion';
import Layout from './components/Layout';
import InicioSesion from './pages/InicioSesion';
import Registro from './pages/Registro';
import Inicio from './pages/Inicio';
import BuscarServicio from './pages/BuscarServicio';
import AgendarCita from './pages/AgendarCita';
import MisCitas from './pages/MisCitas';
import Perfil from './pages/Perfil';

export default function App() {
  const [usuario, setUsuario] = useState(() => sesion.usuario()); // si ya había sesión guardada, entra directo
  const [vista, setVista] = useState('inicio');
  const [parametros, setParametros] = useState({}); // datos que una pantalla le pasa a otra (servicio elegido, texto buscado)
  const [mensajeAcceso, setMensajeAcceso] = useState('');

  // Si la API responde 401 (token vencido), se vuelve al inicio de sesión
  useEffect(() => {
    const vencida = () => {
      setUsuario(null);
      setMensajeAcceso('Tu sesión venció. Inicia sesión de nuevo.');
    };
    window.addEventListener('sesion-vencida', vencida);
    return () => window.removeEventListener('sesion-vencida', vencida);
  }, []);

  function ir(nuevaVista, datos = {}) {
    setParametros(datos);
    setVista(nuevaVista);
    window.scrollTo(0, 0);
  }

  function entrar(datos, recordarme) {
    sesion.guardar(datos, recordarme);
    setUsuario(datos.usuario);
    setMensajeAcceso('');
    ir('inicio');
  }

  function cerrarSesion() {
    sesion.cerrar();
    setUsuario(null);
    setMensajeAcceso('Cerraste la sesión. ¡Hasta pronto!');
    ir('inicio');
  }

  // ---------- Sin sesión: inicio de sesión o registro ----------
  if (!usuario) {
    return vista === 'registro' ? (
      <Registro alEntrar={entrar} irAInicioSesion={() => ir('inicio')} />
    ) : (
      <InicioSesion alEntrar={entrar} irARegistro={() => ir('registro')} mensajeInicial={mensajeAcceso} />
    );
  }

  // ---------- Con sesión: pantallas de la app ----------
  let pantalla;
  switch (vista) {
    case 'buscar':
      pantalla = <BuscarServicio key={parametros.q || ''} ir={ir} qInicial={parametros.q || ''} />;
      break;
    case 'agendar':
      pantalla = <AgendarCita key={parametros.servicio?.id_servicio || 'nuevo'} servicioInicial={parametros.servicio || null} alTerminar={() => ir('miscitas')} ir={ir} />;
      break;
    case 'miscitas':
      pantalla = <MisCitas />;
      break;
    case 'perfil':
      pantalla = <Perfil usuario={usuario} cerrarSesion={cerrarSesion} />;
      break;
    default:
      pantalla = <Inicio usuario={usuario} ir={ir} />;
  }

  return (
    <Layout usuario={usuario} vista={vista} ir={ir} cerrarSesion={cerrarSesion} buscador={vista === 'inicio'}>
      {pantalla}
    </Layout>
  );
}
