// Guarda la sesión en el navegador. Con "Recordarme" queda en localStorage (sobrevive al cerrar
// el navegador); sin marcar, en sessionStorage (se borra al cerrar la pestaña).
const CLAVE = 'agendaya.sesion';

function leer() {
  try {
    const texto = localStorage.getItem(CLAVE) || sessionStorage.getItem(CLAVE);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

export const sesion = {
  actual: () => leer(),
  token: () => leer()?.token || null,
  usuario: () => leer()?.usuario || null,
  guardar(datos, recordarme) {
    const texto = JSON.stringify({ token: datos.token, usuario: datos.usuario });
    try {
      sessionStorage.removeItem(CLAVE);
      localStorage.removeItem(CLAVE);
      (recordarme ? localStorage : sessionStorage).setItem(CLAVE, texto);
    } catch {
      /* navegador en modo privado: la sesión dura mientras no se recargue la página */
    }
  },
  cerrar() {
    try {
      localStorage.removeItem(CLAVE);
      sessionStorage.removeItem(CLAVE);
    } catch {
      /* nada */
    }
  },
};
