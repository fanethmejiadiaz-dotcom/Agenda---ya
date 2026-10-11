// INCREMENTO 2: registro (HU1), inicio de sesión (HU3) y perfil (HU14).
// Las contraseñas se guardan cifradas con bcryptjs y la sesión se maneja con un JSON Web Token.
const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const autenticar = require('../middlewares/autenticar');

const router = Router();
const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Crea el token con los datos mínimos que la API necesita en cada petición
function crearToken(usuario) {
  return jwt.sign(
    { id_usuario: usuario.id_usuario, rol: usuario.rol, nombres: usuario.nombres },
    process.env.JWT_SECRETO,
    { expiresIn: process.env.JWT_DURACION || '8h' }
  );
}

// Datos del usuario que se devuelven al frontend (nunca la clave)
function datosPublicos(u) {
  return {
    id_usuario: u.id_usuario,
    nombres: u.nombres,
    apellidos: u.apellidos,
    email: u.email,
    telefono: u.telefono,
    fecha_nacimiento: u.fecha_nacimiento,
    rol: u.rol,
  };
}

// HU1: registro de usuario
router.post('/registro', async (req, res) => {
  const { nombres, apellidos, email, telefono = null, fecha_nacimiento = null, clave } = req.body;

  if (!nombres?.trim() || !apellidos?.trim() || !email?.trim() || !clave) {
    return res.status(400).json({ mensaje: 'Nombres, apellidos, correo y contraseña son obligatorios.' });
  }
  if (!CORREO_VALIDO.test(email.trim())) {
    return res.status(400).json({ mensaje: 'El correo no tiene un formato válido.' });
  }
  if (String(clave).length < 8) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (fecha_nacimiento && !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento)) {
    return res.status(400).json({ mensaje: 'La fecha de nacimiento debe tener el formato AAAA-MM-DD.' });
  }

  const correo = email.trim().toLowerCase();
  const [[existe]] = await pool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [correo]);
  if (existe) {
    return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo. Inicia sesión.' });
  }

  const clave_hash = await bcrypt.hash(String(clave), 10); // 10 "rondas": seguro y rápido para un PMV
  const [r] = await pool.query(
    `INSERT INTO usuarios (nombres, apellidos, email, telefono, fecha_nacimiento, clave_hash, rol)
     VALUES (?, ?, ?, ?, ?, ?, 'usuario')`,
    [nombres.trim(), apellidos.trim(), correo, telefono || null, fecha_nacimiento || null, clave_hash]
  );

  const [[usuario]] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [r.insertId]);
  res.status(201).json({ mensaje: 'Cuenta creada.', token: crearToken(usuario), usuario: datosPublicos(usuario) });
});

// HU3: inicio de sesión
router.post('/login', async (req, res) => {
  const { email, clave } = req.body;
  if (!email?.trim() || !clave) {
    return res.status(400).json({ mensaje: 'Escribe tu correo y tu contraseña.' });
  }

  const [[usuario]] = await pool.query(
    'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
    [email.trim().toLowerCase()]
  );
  // Se compara aunque el usuario no exista, para no revelar qué correos están registrados
  const coincide = usuario ? await bcrypt.compare(String(clave), usuario.clave_hash) : false;
  if (!coincide) {
    return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos.' });
  }

  res.json({ mensaje: 'Sesión iniciada.', token: crearToken(usuario), usuario: datosPublicos(usuario) });
});

// HU14: consultar el perfil del usuario que inició sesión
router.get('/perfil', autenticar, async (req, res) => {
  const [[usuario]] = await pool.query('SELECT * FROM usuarios WHERE id_usuario = ?', [req.usuario.id_usuario]);
  if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  res.json(datosPublicos(usuario));
});

module.exports = router;
