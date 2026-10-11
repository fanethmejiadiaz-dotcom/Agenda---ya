# Pruebas de aceptación · Tercer avance

Fecha de la prueba: 07/10/2026 · Base de datos: `agendaya_bd.sql` recién ejecutado · API en `http://localhost:3000` · Web en `http://localhost:5173`.

| HU | Criterio de aceptación | Cómo se probó | Resultado |
| --- | --- | --- | --- |
| HU1 | El usuario puede crear su cuenta | *Crear cuenta* con nombres, apellidos, correo y contraseña; queda en la tabla `usuarios` con `clave_hash` cifrada y entra directo a la app | ✅ Cumple |
| HU1 | No se repiten correos | Registrar dos veces el mismo correo: la segunda responde 409 "Ya existe una cuenta con ese correo" | ✅ Cumple |
| HU3 | Solo entra quien tiene usuario y contraseña correctos | Contraseña incorrecta → 401 "Correo o contraseña incorrectos"; sin token, `GET /api/citas/mias` → 401 | ✅ Cumple |
| HU6 | Solo se muestran servicios disponibles | `UPDATE servicios SET activo = 0 WHERE id_servicio = 2;` y recargar *Buscar servicio*: "Corte de cabello" no aparece. Se volvió a poner `activo = 1` | ✅ Cumple |
| HU6 | Filtro por categoría y texto | Tocar *Médicos* deja solo "Consulta médica"; escribir "patitas" deja solo "Control veterinario" | ✅ Cumple |
| HU13 | Solo aparecen horarios disponibles | Reservar una hora del 8 oct (8:00 a. m. en la prueba automática, 10:00 a. m. en el navegador) y volver a esa fecha: la hora ya no aparece; al cancelar vuelve a aparecer | ✅ Cumple |
| HU8 | Solo se pueden seleccionar horarios disponibles | Enviar dos veces el mismo `POST /api/citas`: la segunda responde 409 "Ese horario ya no está disponible" | ✅ Cumple |
| HU8 | La cita queda asociada al usuario y al servicio | En Workbench: `SELECT * FROM citas` muestra `id_usuario`, `id_horario`, `estado = pendiente` y las observaciones; el horario queda `reservado` | ✅ Cumple |
| HU9 | Las citas muestran información suficiente | *Mis citas* muestra servicio, profesional, establecimiento, fecha, hora, duración, notas y estado | ✅ Cumple |
| HU11 | La cancelación pide confirmación | Al tocar *Cancelar cita* aparece la pregunta; al responder "Cancelar" (no) la cita sigue pendiente; al aceptar pasa a *Historial* como cancelada y la hora se libera | ✅ Cumple |
| — | Validación de formato de fecha | `GET /api/servicios/1/disponibilidad?fecha=05-10-2026` → 400 "La fecha debe tener el formato AAAA-MM-DD" | ✅ Cumple |
| — | Pruebas automáticas | `npm test` en `api/`: 13 pruebas, 13 en verde | ✅ Cumple |

## Peticiones de la tabla del paso 6 de la guía (Thunder Client)

| Petición | Respuesta obtenida |
| --- | --- |
| `GET /api/servicios` | 200, lista de 5 servicios con su categoría |
| `GET /api/servicios/1/fechas` | 200, 10 fechas de lunes a viernes desde el 08/10/2026 |
| `GET /api/servicios/1/disponibilidad?fecha=2026-10-08` | 200, 7 franjas (8:00, 9:00, 10:00, 11:00, 14:00, 15:00 y 16:00) |
| `POST /api/citas` con `{"id_horario": 1}` y token | 201 `{"id_cita": 1, "mensaje": "Cita agendada."}` |
| El mismo `POST` otra vez | 409 "Ese horario ya no está disponible. Elige otro." |
| `GET /api/citas/mias` | 200, la cita en estado `pendiente` |
| `PATCH /api/citas/1/cancelar` | 200 "Cita cancelada. La hora vuelve a estar disponible." y la franja 1 vuelve a salir en disponibilidad |
| `GET …/disponibilidad?fecha=05-10-2026` | 400 "La fecha debe tener el formato AAAA-MM-DD." |
