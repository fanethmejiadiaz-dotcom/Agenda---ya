# AgendaYa · Tu tiempo, en buenas manos

Plataforma web para buscar servicios y agendar citas en línea con médicos, salones de belleza, centros deportivos, odontólogos y veterinarias. Producto mínimo viable (PMV) del proyecto productivo del **Tecnólogo en Análisis y Desarrollo de Software · Ficha 2879633**.

**Autora:** Faneth del Carmen Mejía Díaz.
**Créditos:** la identidad de marca (nombre, eslogan, paleta, tipografía Plus Jakarta Sans, estilos de botones e íconos de categoría) parte de la **propuesta base del instructor técnico del proyecto (02/10/2026)**, igual que el script `agendaya_bd.sql` y la estructura de la API de la guía del tercer avance. Lo que se construyó sobre esa base está en la sección [Qué se agregó sobre la propuesta base](#qué-se-agregó-sobre-la-propuesta-base).

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Base de datos | MySQL 8 (o MariaDB 10.6+ si usas XAMPP), motor InnoDB |
| Backend (API) | Node.js LTS + Express 5 + mysql2 (consultas con parámetros `?`) |
| Seguridad | bcryptjs (contraseñas cifradas) + JSON Web Token (sesión) |
| Frontend | React 19 + Vite |
| Pruebas | Jest + Supertest (automáticas) y Thunder Client (manuales) |

```
Navegador (React, puerto 5173) → peticiones HTTP con JSON → API Express (puerto 3000) → MySQL (puerto 3306)
```

## Estructura del repositorio

```
agendaya/
├─ bd/agendaya_bd.sql        script completo de la base de datos (tablas + datos de prueba)
├─ api/                      backend
│  ├─ .env.ejemplo           copia como .env y pon tus claves (el .env no se sube a GitHub)
│  ├─ src/db.js              pool de conexiones a MySQL
│  ├─ src/app.js             Express: CORS, JSON, rutas y manejador de errores
│  ├─ src/server.js          arranca la API
│  ├─ src/middlewares/autenticar.js   verifica el token JWT (reemplaza al usuarioDemo del incremento 1)
│  ├─ src/routes/auth.routes.js       registro, inicio de sesión y perfil
│  ├─ src/routes/catalogo.routes.js   categorías, servicios, fechas y disponibilidad
│  ├─ src/routes/citas.routes.js      agendar (transacción), mis citas y cancelar
│  └─ tests/citas.test.js    13 pruebas automáticas
├─ web/                      frontend
│  ├─ src/api.js             todas las llamadas al backend + formatos de fecha y hora
│  ├─ src/sesion.js          guarda el token en el navegador
│  ├─ src/App.jsx            sesión y cambio de pantallas (useState)
│  ├─ src/index.css          variables de la marca y estilos
│  ├─ src/components/        Iconos, Layout (menú lateral), TarjetaCita
│  └─ src/pages/             InicioSesion, Registro, Inicio, BuscarServicio, AgendarCita, MisCitas, Perfil
└─ docs/                     pruebas de aceptación y guion del video
```

## 1. Crear la base de datos

1. Abre `bd/agendaya_bd.sql` en MySQL Workbench (o phpMyAdmin → Importar) y ejecútalo completo. Crea la base `agendaya` con las tablas `usuarios`, `categorias`, `servicios`, `horarios` y `citas`, 2 usuarios de prueba, 5 categorías, 5 servicios y franjas de lunes a viernes para los próximos 14 días.
2. Al final verás cuántas franjas disponibles tiene cada servicio. Si ves los cinco servicios, quedó bien.
3. Recomendado: crea el usuario de MySQL para la aplicación con el bloque que está al final del script (`agendaya_app`).

> Las franjas se generan desde el día en que ejecutas el script. Si pasan los 14 días o quieres datos limpios, vuelve a ejecutarlo (borra y recrea las tablas).

## 2. Arrancar la API

```bash
cd api
npm install
copy .env.ejemplo .env      # en Windows (en Linux/macOS: cp .env.ejemplo .env)
# edita .env: DB_USER, DB_PASSWORD y JWT_SECRETO
npm run dev                 # API en http://localhost:3000/api
npm test                    # pruebas automáticas (con MySQL encendido)
```

Rutas de la API:

| Método y ruta | Qué hace | HU | Necesita token |
| --- | --- | --- | --- |
| `POST /api/auth/registro` | Crea la cuenta (contraseña cifrada con bcrypt) y devuelve el token | HU1 | No |
| `POST /api/auth/login` | Inicia sesión y devuelve el token | HU3 | No |
| `GET /api/auth/perfil` | Datos del usuario con sesión | HU14 | Sí |
| `GET /api/categorias` | Categorías ordenadas por nombre | HU6 | No |
| `GET /api/servicios?categoria=&q=` | Servicios activos, con filtro por categoría y texto | HU6 | No |
| `GET /api/servicios/:id/fechas` | Fechas con franjas libres desde hoy (máximo 14) | HU13 | No |
| `GET /api/servicios/:id/disponibilidad?fecha=AAAA-MM-DD` | Horas libres de ese día | HU13 | No |
| `POST /api/citas` `{ id_horario, observaciones }` | Agenda sin doble reserva (transacción + `FOR UPDATE`) | HU8 | Sí |
| `GET /api/citas/mias` | Mis citas con servicio, lugar, fecha, hora y estado | HU9 | Sí |
| `PATCH /api/citas/:id/cancelar` | Cancela la cita y libera la hora | HU11 | Sí |

El token va en la cabecera `Authorization: Bearer <token>`. En Thunder Client: primero `POST /api/auth/login`, copia el `token` de la respuesta y pégalo en la pestaña *Auth → Bearer* de las peticiones de citas.

## 3. Arrancar el frontend

```bash
cd web
npm install
npm run dev                 # abre http://localhost:5173
```

Si la API no está en `http://localhost:3000/api`, copia `web/.env.ejemplo` como `web/.env` y cambia `VITE_URL_API`.

## Usuarios de prueba (del script)

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `usuario@agendaya.test` | `AgendaYa2026*` | usuario |
| `admin@agendaya.test` | `AgendaYa2026*` | admin |

También puedes crear tu propia cuenta desde **Crear cuenta**.

## Historias de usuario que cumple este avance

| HU | Qué hace | Dónde |
| --- | --- | --- |
| HU1 | Registro de usuario | Pantalla *Crear cuenta* |
| HU3 | Inicio y cierre de sesión (acceso según el rol con JWT) | *Iniciar sesión*, menú lateral |
| HU6 | Consultar servicios por categoría y texto | *Buscar servicio* |
| HU13 | Consultar disponibilidad (solo fechas y horas libres) | *Agendar cita*, paso 2 |
| HU8 | Agendar cita sin doble reserva | *Agendar cita*, paso 3 |
| HU9 | Consultar mis citas con su estado (Próximas / Historial) | *Mis citas* |
| HU11 | Cancelar cita con confirmación; la hora vuelve a quedar libre | *Mis citas* |
| HU14 | Consultar el perfil | *Perfil* |

Pendientes para los siguientes incrementos: reprogramar cita (HU10), editar perfil (HU15) y el panel del administrador (HU4, HU5, HU7, HU12).

## Cómo funciona la transacción de "Agendar cita" (paso 5 de la guía)

1. Se abre una transacción y se busca el horario con `SELECT … FOR UPDATE`: la fila queda **bloqueada** hasta que la transacción termine.
2. Si el horario ya no está `disponible` (o la hora ya pasó) se hace `ROLLBACK` y la API responde **409 "Ese horario ya no está disponible"**.
3. Si está libre, se inserta la cita (`estado = pendiente`) y se cambia el horario a `reservado`.
4. `COMMIT` libera el bloqueo. Si dos personas intentan la misma franja a la vez, la segunda espera a que termine la primera, encuentra el horario reservado y recibe el 409. Cancelar usa el mismo patrón al revés: cita → `cancelada`, horario → `disponible`.

## Qué se agregó sobre la propuesta base

La propuesta base del instructor incluía el tablero de marca, el prototipo navegable (solo diseño, sin guardar datos), el script SQL y los fragmentos de la guía. Sobre eso, este repositorio agrega:

- **Registro, inicio y cierre de sesión reales** (`auth.routes.js`, `autenticar.js`, `sesion.js`): contraseñas cifradas, token JWT con vencimiento, opción "Recordarme" y cierre automático cuando el token vence.
- **Las rutas marcadas "Tu turno" en la guía**: `GET /api/categorias`, `GET /api/servicios/:id/fechas`, `GET /api/citas/mias`, `PATCH /api/citas/:id/cancelar`, más `GET /api/servicios/:id` y la búsqueda por profesional.
- **Pantallas completas en React conectadas a la API**: inicio con próximas citas, búsqueda por texto y categoría con resultados reales, agendar en tres pasos con mensajes de error (por ejemplo el 409 de doble reserva vuelve al paso 2 y recarga las horas), confirmación con resumen, *Mis citas* con pestañas Próximas/Historial y cancelación con `window.confirm`, y perfil.
- **Validaciones** en la API y en el frontend (correo, contraseña mínima de 8 caracteres, formato de fecha, notas de máximo 500 caracteres) con mensajes en español.
- **13 pruebas automáticas** (la guía pedía una) que cubren inicio de sesión, registro, catálogo, doble reserva, mis citas y cancelación.
- Diseño adaptable a celular (el menú lateral se acomoda arriba).

En el prototipo base los filtros *Ciudad / Fecha / Horario* de "Buscar servicio" no hacían nada; aquí se reemplazaron por la búsqueda por texto y categoría que sí consulta la base de datos. El botón "Modificar" (reprogramar, HU10) se dejó para el siguiente incremento en lugar de mostrarlo sin función.

## Evidencias

- `docs/pruebas_aceptacion.md`: tabla de pruebas de aceptación diligenciada.
- `docs/guion_video.md`: guion del video (máximo 10 minutos) del flujo registrarse → buscar → agendar → ver y cancelar.
- Capturas con fecha: carpeta `docs/capturas/` (tómalas en tu computador, incluyendo la tabla `citas` en Workbench y `npm test` en verde).
