// Pruebas automáticas de la API (Jest + Supertest). Corren contra la base de datos real del .env:
// ejecuta antes agendaya_bd.sql para empezar con datos limpios.
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

const USUARIO_PRUEBA = { email: 'usuario@agendaya.test', clave: 'AgendaYa2026*' };
let token;      // token del usuario de prueba del script
let franja;     // una franja disponible del servicio 1
let fecha;      // la fecha de esa franja

beforeAll(async () => {
  const login = await request(app).post('/api/auth/login').send(USUARIO_PRUEBA);
  token = login.body.token;

  const fechas = await request(app).get('/api/servicios/1/fechas');
  fecha = fechas.body[0];
  const disponibilidad = await request(app).get(`/api/servicios/1/disponibilidad?fecha=${fecha}`);
  franja = disponibilidad.body[0];
});

afterAll(() => pool.end());

const conToken = (req) => req.set('Authorization', `Bearer ${token}`);

describe('Inicio de sesión y registro (HU1, HU3)', () => {
  test('el usuario de prueba del script inicia sesión y recibe un token', async () => {
    const res = await request(app).post('/api/auth/login').send(USUARIO_PRUEBA);
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe(USUARIO_PRUEBA.email);
    expect(res.body.usuario.clave_hash).toBeUndefined(); // nunca se devuelve la clave
  });

  test('rechaza una contraseña incorrecta con 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: USUARIO_PRUEBA.email, clave: 'otra' });
    expect(res.status).toBe(401);
  });

  test('registra una cuenta nueva y no permite repetir el correo', async () => {
    const email = `prueba${Date.now()}@agendaya.test`;
    const datos = { nombres: 'Prueba', apellidos: 'Automática', email, clave: 'Prueba2026*' };
    const nuevo = await request(app).post('/api/auth/registro').send(datos);
    expect(nuevo.status).toBe(201);
    expect(nuevo.body.token).toBeDefined();

    const repetido = await request(app).post('/api/auth/registro').send(datos);
    expect(repetido.status).toBe(409);
  });

  test('las rutas de citas exigen sesión iniciada', async () => {
    const res = await request(app).get('/api/citas/mias');
    expect(res.status).toBe(401);
  });
});

describe('Catálogo y disponibilidad (HU6, HU13)', () => {
  test('lista los servicios activos con su categoría', async () => {
    const res = await request(app).get('/api/servicios');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('categoria');
  });

  test('filtra los servicios por categoría', async () => {
    const res = await request(app).get('/api/servicios?categoria=1');
    expect(res.status).toBe(200);
    expect(res.body.every((s) => s.id_categoria === 1)).toBe(true);
  });

  test('devuelve fechas con el formato AAAA-MM-DD', async () => {
    expect(fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(franja).toHaveProperty('id_horario');
  });

  test('rechaza una fecha con formato inválido con 400', async () => {
    const res = await request(app).get('/api/servicios/1/disponibilidad?fecha=05-10-2026');
    expect(res.status).toBe(400);
  });
});

describe('Agendar, consultar y cancelar (HU8, HU9, HU11)', () => {
  let id_cita;

  test('agenda una cita y no permite reservar dos veces el mismo horario', async () => {
    const ok = await conToken(request(app).post('/api/citas')).send({ id_horario: franja.id_horario });
    expect(ok.status).toBe(201);
    id_cita = ok.body.id_cita;

    const repetida = await conToken(request(app).post('/api/citas')).send({ id_horario: franja.id_horario });
    expect(repetida.status).toBe(409);
  });

  test('la franja reservada deja de aparecer como disponible', async () => {
    const res = await request(app).get(`/api/servicios/1/disponibilidad?fecha=${fecha}`);
    expect(res.body.some((h) => h.id_horario === franja.id_horario)).toBe(false);
  });

  test('mis citas muestra la cita en estado pendiente con servicio, lugar, fecha y hora', async () => {
    const res = await conToken(request(app).get('/api/citas/mias'));
    expect(res.status).toBe(200);
    const cita = res.body.find((c) => c.id_cita === id_cita);
    expect(cita.estado).toBe('pendiente');
    expect(cita.servicio).toBe('Consulta médica');
    expect(cita.establecimiento).toBeDefined();
    expect(cita.fecha).toBe(fecha);
    expect(cita.hora_inicio).toBe(franja.hora_inicio);
  });

  test('cancela la cita y la hora vuelve a estar disponible', async () => {
    const res = await conToken(request(app).patch(`/api/citas/${id_cita}/cancelar`));
    expect(res.status).toBe(200);

    const disponibilidad = await request(app).get(`/api/servicios/1/disponibilidad?fecha=${fecha}`);
    expect(disponibilidad.body.some((h) => h.id_horario === franja.id_horario)).toBe(true);

    const otraVez = await conToken(request(app).patch(`/api/citas/${id_cita}/cancelar`));
    expect(otraVez.status).toBe(404); // ya estaba cancelada
  });

  test('rechaza agendar sin horario con 400', async () => {
    const res = await conToken(request(app).post('/api/citas')).send({});
    expect(res.status).toBe(400);
  });
});
