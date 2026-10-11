# Guion del video · Tercer avance (máximo 10 minutos)

Antes de grabar: ejecuta `agendaya_bd.sql`, deja encendidos MySQL, la API (`npm run dev` en `api/`) y la web (`npm run dev` en `web/`), y abre Workbench con la consulta `SELECT * FROM citas;` lista. Graba la pantalla completa y habla con tus palabras.

| Min | Qué muestras | Qué dices |
| --- | --- | --- |
| 0:00 | Portada: tablero de marca (o la pantalla de inicio de sesión) | "Soy Faneth Mejía, ficha 2879633. Este es el tercer avance de AgendaYa: la app ya guarda en MySQL. La identidad de marca parte de la propuesta base del instructor; sobre ella construí el registro, el inicio de sesión, el agendamiento y mis citas." |
| 0:45 | Workbench: tablas `usuarios`, `servicios`, `horarios`, `citas` (vacía) | "La base de datos tiene cinco tablas. Cada fila de horarios es una franja con estado; la cita solo guarda el id del horario, así no hay datos repetidos." |
| 1:30 | Navegador: *Crear cuenta* → llenas tus datos → entras | "Registro: la contraseña se guarda cifrada con bcrypt. Al crear la cuenta la API devuelve un token y entro directo." Muestra en Workbench la fila nueva en `usuarios` con `clave_hash`. |
| 2:30 | *Cerrar sesión* → *Iniciar sesión* con la cuenta creada; prueba una contraseña mala | "Si la contraseña no coincide, la API responde 401 y la app muestra el mensaje." |
| 3:15 | *Agendar cita* → *Buscar servicio*: toca una categoría y escribe en el buscador | "La búsqueda consulta `GET /api/servicios` con filtro por categoría y texto; solo salen los servicios activos (HU6)." |
| 4:00 | Paso 2: elige fecha y hora; paso 3: notas y *Confirmar cita* | "Solo aparecen fechas y horas disponibles (HU13). Al confirmar, la API abre una transacción, bloquea la franja con `FOR UPDATE`, inserta la cita y marca el horario como reservado (HU8)." |
| 5:15 | Workbench: `SELECT * FROM citas;` y el horario en `reservado` | "Aquí está la cita guardada con mi id de usuario, el id del horario, el estado pendiente y las observaciones." |
| 5:45 | Thunder Client (o la app con dos pestañas): intenta reservar la misma franja otra vez | "La segunda reserva responde 409: ese horario ya no está disponible. Es la protección contra la doble reserva." |
| 6:30 | *Mis citas*: pestaña Próximas, luego *Cancelar cita* → primero responde "No", luego "Sí" | "Mis citas muestra servicio, lugar, fecha, hora y estado (HU9). Cancelar pide confirmación; si digo que no, nada cambia; si acepto, la cita pasa a cancelada y la hora vuelve a estar disponible (HU11)." |
| 7:30 | Workbench: la cita en `cancelada` y el horario en `disponible` de nuevo | "La transacción de cancelar cambia las dos filas juntas." |
| 8:00 | Terminal: `npm test` en `api/` | "Trece pruebas automáticas en verde: inicio de sesión, registro, catálogo, doble reserva, mis citas y cancelación." |
| 8:45 | Repositorio en GitHub: README y commits | "El código está en GitHub con el README: cómo crear la base de datos, arrancar la API y el frontend, y los usuarios de prueba. El `.env` no se sube." |
| 9:15 | Cierre | "Pendientes para el siguiente incremento: reprogramar cita, editar perfil y el panel del administrador." |

Consejos: ten el flujo ensayado una vez antes de grabar; si te equivocas, sigue y corrige en voz alta (también es evidencia de que sabes qué pasa).
