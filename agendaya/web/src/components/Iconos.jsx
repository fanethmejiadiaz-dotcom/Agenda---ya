// Íconos de la marca en SVG (trazos de 2 px, puntas redondeadas), sin librerías externas.
const TRAZOS = {
  logo: (
    <>
      <rect x="3" y="5" width="17" height="15" rx="3" />
      <path d="M3 10h17" /><path d="M8 3v4" /><path d="M15 3v4" />
      <path d="M7.5 14.5l3 3 5-5" />
      <circle cx="18.5" cy="18.5" r="4.5" fill="var(--logo-bg, #fff)" />
      <path d="M18.5 16.4v2.3l1.5 1" />
    </>
  ),
  usuario: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  candado: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  correo: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  telefono: (<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />),
  ojo: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  ojoCerrado: (
    <>
      <path d="M3 3l18 18" /><path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
      <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.4-1.4" />
    </>
  ),
  casa: (<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  buscar: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  calendario: (<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18" /><path d="M8 3v4" /><path d="M16 3v4" /></>),
  campana: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>),
  salir: (<><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" /><path d="M14 16l4-4-4-4" /><path d="M9 12h9" /></>),
  abajo: (<path d="M6 9l6 6 6-6" />),
  derecha: (<path d="M9 6l6 6-6 6" />),
  izquierda: (<><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></>),
  reloj: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  info: (<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>),
  alerta: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" /></>),
  check: (<path d="M5 12l4 4 10-10" />),
  estetoscopio: (<><path d="M5 4v4a6 6 0 0 0 12 0V4" /><path d="M11 14v3a4 4 0 0 0 8 0v-1" /><circle cx="19" cy="13" r="2.5" /></>),
  tijeras: (<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.1 15.9" /><path d="M14.5 14.5L20 20" /><path d="M8.1 8.1L12 12" /></>),
  pesa: (<><path d="M6 7v10" /><path d="M3 9v6" /><path d="M18 7v10" /><path d="M21 9v6" /><path d="M6 12h12" /></>),
  diente: (<path d="M7 4c-2 0-3.5 1.6-3.5 3.8 0 1.6.7 2.6 1.2 4 .6 1.7.8 3.6 1 5.6.1 1.4.7 2.6 1.6 2.6s1.3-1.2 1.6-2.4c.4-1.4.9-2.6 2.1-2.6s1.7 1.2 2.1 2.6c.3 1.2.7 2.4 1.6 2.4s1.5-1.2 1.6-2.6c.2-2 .4-3.9 1-5.6.5-1.4 1.2-2.4 1.2-4C20.5 5.6 19 4 17 4c-1.6 0-2.6.9-5 .9S8.6 4 7 4z" />),
  pata: (
    <>
      <circle cx="7" cy="9" r="2" /><circle cx="17" cy="9" r="2" /><circle cx="4.5" cy="14" r="1.8" /><circle cx="19.5" cy="14" r="1.8" />
      <path d="M12 12c-3 0-5.5 3-5.5 5.5 0 1.7 1.3 2.5 2.5 2.5 1 0 2-.5 3-.5s2 .5 3 .5c1.2 0 2.5-.8 2.5-2.5C17.5 15 15 12 12 12z" />
    </>
  ),
};

export function Icono({ nombre, className = '' }) {
  return (
    <svg className={`ic ${className}`} viewBox="0 0 24 24" aria-hidden="true">
      {TRAZOS[nombre] || TRAZOS.calendario}
    </svg>
  );
}

// Cada categoría tiene su ícono y su color (coinciden con el tablero de marca)
const CATEGORIAS = {
  'médicos': { icono: 'estetoscopio', clase: 'icono--medicos' },
  'belleza': { icono: 'tijeras', clase: 'icono--belleza' },
  'deportes': { icono: 'pesa', clase: 'icono--deportes' },
  'odontología': { icono: 'diente', clase: 'icono--odontologia' },
  'veterinaria': { icono: 'pata', clase: 'icono--veterinaria' },
};

export function IconoCategoria({ categoria, cuadro = false }) {
  const c = CATEGORIAS[(categoria || '').toLowerCase()] || { icono: 'calendario', clase: 'icono--otro' };
  return (
    <span className={`icono ${cuadro ? 'icono--cuadro' : ''} ${c.clase}`}>
      <Icono nombre={c.icono} />
    </span>
  );
}

export function Logo({ oscuro = false, grande = false, alPulsar }) {
  const clase = `logo ${oscuro ? 'logo--oscuro' : ''} ${grande ? 'logo--grande' : ''}`;
  const contenido = (
    <>
      <Icono nombre="logo" />
      <span className="logo__texto">Agenda<b>Ya</b></span>
    </>
  );
  return alPulsar ? (
    <button type="button" className={clase} onClick={alPulsar} aria-label="AgendaYa, ir al inicio">{contenido}</button>
  ) : (
    <span className={clase}>{contenido}</span>
  );
}
