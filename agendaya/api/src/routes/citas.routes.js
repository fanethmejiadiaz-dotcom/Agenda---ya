// Citas del usuario que inició sesión: agendar (HU8), consultar (HU9) y cancelar (HU11).
// Todas las rutas pasan antes por el middleware "autenticar", que deja en req.usuario quién es.
const { Router } = require('express');
const pool = require('../db');

const router = Router();

// HU8: agendar una cita. Usa una TRANSACCIÓN para que dos personas no reserven la misma franja.
router.post('/', async (req, res) => {
  const { id_horario, observaciones = null } = req.body;
  if (!Number.isInteger(id_horario)) {
    return res.status(400).json({ mensaje: 'Debes seleccionar un horario.' });
  }
  if (observaciones && String(observaciones).length > 500) {
    return res.status(400).json({ mensaje: 'Las observaciones no pueden pasar de 500 caracteres.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // FOR UPDATE bloquea la fila del horario hasta terminar la transacción:
    // si otra persona intenta reservar la misma franja, espera y luego la encuentra "reservada".
    const [[horario]] = await conn.query(
      `SELECT id_horario FROM horarios
        WHERE id_horario = ? AND estado = 'disponible' AND TIMESTAMP(fecha, hora_inicio) > NOW()
        FOR UPDATE`,
      [id_horario]
    );
    if (!horario) {
      await conn.rollback();
      return res.status(409).json({ mensaje: 'Ese horario ya no está disponible. Elige otro.' });
    }
    const [r] = await conn.query(
      'INSERT INTO citas (id_usuario, id_horario, observaciones) VALUES (?, ?, ?)',
      [req.usuario.id_usuario, id_horario, observaciones || null]
    );
    await conn.query("UPDATE horarios SET estado = 'reservado' WHERE id_horario = ?", [id_horario]);
    await conn.commit();
    res.status(201).json({ id_cita: r.insertId, mensaje: 'Cita agendada.' });
  } catch (err) {
    await conn.rollback();
    throw err; // Express 5 envía el error al manejador de errores de app.js
  } finally {
    conn.release();
  }
});

// HU9: mis citas con su estado. La fecha, la hora y el servicio se leen del horario (3FN).
router.get('/mias', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id_cita, c.estado, c.observaciones, c.creado_en,
            h.id_horario, h.fecha, h.hora_inicio, h.hora_fin,
            s.id_servicio, s.nombre AS servicio, s.profesional, s.establecimiento, s.duracion_min,
            cat.nombre AS categoria
       FROM citas c
       JOIN horarios h    ON h.id_horario = c.id_horario
       JOIN servicios s   ON s.id_servicio = h.id_servicio
       JOIN categorias cat ON cat.id_categoria = s.id_categoria
      WHERE c.id_usuario = ?
      ORDER BY h.fecha, h.hora_inicio`,
    [req.usuario.id_usuario]
  );
  res.json(rows);
});

// HU11: cancelar una cita propia (pendiente o confirmada) y liberar su horario.
router.patch('/:id/cancelar', async (req, res) => {
  const id_cita = Number(req.params.id);
  if (!Number.isInteger(id_cita)) {
    return res.status(400).json({ mensaje: 'El número de la cita no es válido.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Mismo patrón que al agendar: se bloquea la cita mientras se cambia su estado y el del horario
    const [[cita]] = await conn.query(
      `SELECT id_cita, id_horario FROM citas
        WHERE id_cita = ? AND id_usuario = ? AND estado IN ('pendiente', 'confirmada')
        FOR UPDATE`,
      [id_cita, req.usuario.id_usuario]
    );
    if (!cita) {
      await conn.rollback();
      return res.status(404).json({ mensaje: 'La cita no existe o ya no se puede cancelar.' });
    }
    await conn.query("UPDATE citas SET estado = 'cancelada' WHERE id_cita = ?", [cita.id_cita]);
    await conn.query("UPDATE horarios SET estado = 'disponible' WHERE id_horario = ?", [cita.id_horario]);
    await conn.commit();
    res.json({ id_cita: cita.id_cita, mensaje: 'Cita cancelada. La hora vuelve a estar disponible.' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

module.exports = router;
