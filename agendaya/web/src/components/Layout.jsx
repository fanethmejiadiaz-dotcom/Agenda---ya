// Estructura de las pantallas con sesión iniciada: menú lateral + barra superior + contenido
import { Icono, Logo } from './Iconos';

const MENU = [
  { vista: 'inicio', texto: 'Inicio', icono: 'casa' },
  { vista: 'buscar', texto: 'Buscar servicios', icono: 'buscar' },
  { vista: 'miscitas', texto: 'Mis citas', icono: 'calendario' },
  { vista: 'perfil', texto: 'Perfil', icono: 'usuario' },
];

export function Aviso({ tipo = 'info', children }) {
  const icono = tipo === 'ok' ? 'check' : tipo === 'error' ? 'alerta' : 'info';
  return (
    <div className={`aviso aviso--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono nombre={icono} />
      <span>{children}</span>
    </div>
  );
}

export function Chip({ estado }) {
  const textos = { pendiente: 'Pendiente', confirmada: 'Confirmada', cancelada: 'Cancelada', atendida: 'Atendida' };
  return <span className={`chip chip--${estado}`}>{textos[estado] || estado}</span>;
}

export default function Layout({ usuario, vista, ir, cerrarSesion, buscador = false, children }) {
  const iniciales = `${usuario?.nombres?.[0] || ''}${usuario?.apellidos?.[0] || ''}`.toUpperCase();
  const vistaMenu = vista === 'agendar' ? 'buscar' : vista;

  function buscarDesdeBarra(e) {
    e.preventDefault();
    ir('buscar', { q: e.target.elements.q.value.trim() });
  }

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Menú principal">
        <Logo oscuro alPulsar={() => ir('inicio')} />
        {MENU.map((item) => (
          <button
            key={item.vista}
            type="button"
            className={`nav-item ${vistaMenu === item.vista ? 'activo' : ''}`}
            aria-current={vistaMenu === item.vista ? 'page' : undefined}
            onClick={() => ir(item.vista)}
          >
            <Icono nombre={item.icono} />
            {item.texto}
          </button>
        ))}
        <div className="sidebar__fin">
          <button type="button" className="nav-item" onClick={cerrarSesion}>
            <Icono nombre="salir" />
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="contenido">
        <header className={`topbar ${buscador ? '' : 'topbar--derecha'}`}>
          {buscador && (
            <form className="buscador" onSubmit={buscarDesdeBarra} role="search">
              <Icono nombre="buscar" />
              <input name="q" type="search" placeholder="Buscar servicios, profesionales..." aria-label="Buscar servicios o profesionales" />
            </form>
          )}
          <div className="topbar__acciones">
            <button type="button" className="avatar" onClick={() => ir('perfil')} aria-label={`Cuenta de ${usuario?.nombres || ''}`}>
              <span className="avatar__ini">{iniciales || 'AY'}</span>
              <Icono nombre="abajo" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
