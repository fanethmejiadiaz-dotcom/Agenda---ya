// AGENDA YA - Lógica del módulo agenda
console.log("Agenda Ya iniciado");

function agendarCita(nombre, fecha, hora){
  alert("Cita agendada para " + nombre + " el " + fecha + " a las " + hora);
  // Aquí se conecta con WhatsApp QR
  let mensaje = `Hola Agenda Ya, quiero agendar el ${fecha} a las ${hora}`;
  window.open(`https://wa.me/573001234567?text=${mensaje}`);
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Módulo agenda cargado - Proyecto Agenda Ya");
});