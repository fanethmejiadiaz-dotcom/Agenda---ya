const express = require('express');
const cors = require('cors');
const auth = require('./routes/auth.routes');
const catalogo = require('./routes/catalogo.routes');
const citas = require('./routes/citas.routes');
const autenticar = require('./middlewares/autenticar');

const app = express();
app.use(cors({ origin: process.env.ORIGEN_WEB || 'http://localhost:5173' })); // solo el frontend de Vite en desarrollo
app.use(express.json());

app.get('/api', (req, res) => res.json({ nombre: 'API de AgendaYa', estado: 'ok' }));
app.use('/api/auth', auth);              // registro, inicio de sesión y perfil (público / con token)
app.use('/api', catalogo);               // categorías, servicios y disponibilidad (público)
app.use('/api/citas', autenticar, citas); // citas: solo con sesión iniciada

// Ruta que no existe
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada.' }));

// Manejador de errores: no muestra detalles internos al usuario
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la petición debe ser JSON válido.' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Ocurrió un error en el servidor. Intenta de nuevo.' });
});

module.exports = app;
