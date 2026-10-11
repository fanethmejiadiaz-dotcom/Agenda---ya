// Todas las llamadas al backend pasan por aquí
import { sesion } from './sesion';

const URL_API = import.meta.env.VITE_URL_API || 'http://localhost:3000/api';

async function pedir(ruta, opciones = {}) {
  const cabeceras = { 'Content-Type': 'application/json' };
  const token = sesion.token();
  if (token) cabeceras.Authorization = `Bearer ${token}`; // así la API sabe quién pide (HU3)

  let res;
  try {
    res = await fetch(URL_API + ruta, { headers: cabeceras, ...opciones });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que la API esté encendida.');
  }

  const datos = await res.json().catch(() => ({}));
  if (res.status === 401 && token) {
    // Token vencido o inválido: se cierra la sesión y la app vuelve al inicio de sesión
    sesion.cerrar();
    window.dispatchEvent(new Event('sesion-vencida'));
  }
  if (!res.ok) throw new Error(datos.mensaje || 'Error inesperado');
  return datos;
}

export const api = {
  // Incremento 2: cuentas
  registro: (datos) => pedir('/auth/registro', { method: 'POST', body: JSON.stringify(datos) }),
  login: (email, clave) => pedir('/auth/login', { method: 'POST', body: JSON.stringify({ email, clave }) }),
  perfil: () => pedir('/auth/perfil'),
  // HU6 y HU13: catálogo
  categorias: () => pedir('/categorias'),
  servicios: ({ categoria, q } = {}) => {
    const p = new URLSearchParams();
    if (categoria) p.set('categoria', categoria);
    if (q) p.set('q', q);
    const qs = p.toString();
    return pedir('/servicios' + (qs ? `?${qs}` : ''));
  },
  servicio: (idServicio) => pedir(`/servicios/${idServicio}`),
  fechas: (idServicio) => pedir(`/servicios/${idServicio}/fechas`),
  disponibilidad: (idServicio, fecha) => pedir(`/servicios/${idServicio}/disponibilidad?fecha=${fecha}`),
  // HU8, HU9 y HU11: citas
  agendar: (id_horario, observaciones) =>
    pedir('/citas', { method: 'POST', body: JSON.stringify({ id_horario, observaciones }) }),
  misCitas: () => pedir('/citas/mias'),
  cancelar: (idCita) => pedir(`/citas/${idCita}/cancelar`, { method: 'PATCH' }),
};

// Formatos para mostrar fechas y horas en español de Colombia
export const formatoFecha = (f) =>
  new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatoFechaLarga = (f) => {
  const texto = new Date(f + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

export const formatoHora = (h) =>
  new Date('2000-01-01T' + h).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });

// ¿La cita ya pasó? (para separar "Próximas" de "Historial")
export const yaPaso = (fecha, hora) => new Date(`${fecha}T${hora}`) < new Date();
