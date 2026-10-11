// Conexión a MySQL con un "pool": reutiliza conexiones en lugar de abrir una por cada petición.
const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  dateStrings: true, // fechas como texto 'AAAA-MM-DD' para evitar corrimientos de zona horaria
});

module.exports = pool;
