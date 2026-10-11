// Catálogo público: categorías, servicios y disponibilidad (HU6 y HU13)
const { Router } = require('express');
const pool = require('../db');

const router = Router();
const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

// Categorías para los botones de la pantalla "Buscar servicio"
router.get('/categorias', async (req, res) => {
  const [rows] = await pool.query('SELECT id_categoria, nombre FROM categorias ORDER BY nombre');
  res.json(rows);
});

// HU6: servicios disponibles, con filtro opcional por categoría y texto
router.get('/servicios', async (req, res) => {
  const categoria = req.query.categoria ? Number(req.query.categoria) : null;
  const q = req.query.q?.trim() || null;
  const [rows] = await pool.query(
    `SELECT s.id_servicio, s.nombre, s.descripcion, s.profesional, s.establecimiento, s.ciudad,
            s.duracion_min, s.precio, c.id_categoria, c.nombre AS categoria
       FROM servicios s
       JOIN categorias c ON c.id_categoria = s.id_categoria
      WHERE s.activo = 1
        AND (? IS NULL OR s.id_categoria = ?)
        AND (? IS NULL OR s.nombre LIKE ? OR s.establecimiento LIKE ? OR s.profesional LIKE ?)
      ORDER BY s.nombre`,
    [categoria, categoria, q, `%${q}%`, `%${q}%`, `%${q}%`] // los ? evitan la inyección SQL
  );
  res.json(rows);
});

// Un solo servicio (para mostrar el resumen al agendar)
router.get('/servicios/:id', async (req, res) => {
  const [[servicio]] = await pool.query(
    `SELECT s.id_servicio, s.nombre, s.descripcion, s.profesional, s.establecimiento, s.ciudad,
            s.duracion_min, s.precio, c.id_categoria, c.nombre AS categoria
       FROM servicios s
       JOIN categorias c ON c.id_categoria = s.id_categoria
      WHERE s.id_servicio = ? AND s.activo = 1`,
    [req.params.id]
  );
  if (!servicio) return res.status(404).json({ mensaje: 'El servicio no existe o no está disponible.' });
  res.json(servicio);
});

// HU13: fechas (sin repetir) que tienen franjas disponibles desde hoy
router.get('/servicios/:id/fechas', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT fecha FROM horarios
      WHERE id_servicio = ? AND estado = 'disponible'
        AND fecha >= CURDATE() AND TIMESTAMP(fecha, hora_inicio) > NOW()
      ORDER BY fecha
      LIMIT 14`,
    [req.params.id]
  );
  res.json(rows.map((r) => r.fecha));
});

// HU13: franjas disponibles de un servicio en una fecha
router.get('/servicios/:id/disponibilidad', async (req, res) => {
  const { fecha } = req.query;
  if (!FECHA_VALIDA.test(fecha || '')) {
    return res.status(400).json({ mensaje: 'La fecha debe tener el formato AAAA-MM-DD.' });
  }
  const [rows] = await pool.query(
    `SELECT id_horario, hora_inicio, hora_fin FROM horarios
      WHERE id_servicio = ? AND fecha = ? AND estado = 'disponible'
        AND TIMESTAMP(fecha, hora_inicio) > NOW()          -- no muestra horas que ya pasaron
      ORDER BY hora_inicio`,
    [req.params.id, fecha]
  );
  res.json(rows);
});

module.exports = router;
