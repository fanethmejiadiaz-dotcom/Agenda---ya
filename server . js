import express from 'express';
import fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const DB = './citas.json';

function leer(){
  try {
    return JSON.parse(fs.readFileSync(DB, 'utf8'));
  } catch {
    return [];
  }
}

function guardar(data){
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// Ver que horas estan ocupadas
app.get('/api/ocupadas', (req, res) => {
  const fecha = req.query.fecha;
  const citas = leer().filter(c => c.fecha === fecha);
  res.json(citas.map(c => c.hora));
});

// Agendar
app.post('/api/agendar', (req, res) => {
  const nueva = req.body;
  let citas = leer();
  const existe = citas.find(c => c.fecha === nueva.fecha && c.hora === nueva.hora);
  if(existe){
    return res.status(400).json({error: 'Hora ocupada'});
  }
  citas.push({ id: Date.now(), ...nueva });
  guardar(citas);
  res.json({ok: true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Nivel 2 listo en puerto ' + PORT));
