const express=require('express');const fs=require('fs');const path=require('path');const app=express();const PORT=process.env.PORT||3000;const DB=path.join(__dirname,'citas.json');const CLAVE="1234";
app.use(express.json());app.use(express.static(__dirname));
const leer=()=>{try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return[]}};const guardar=(c)=>fs.writeFileSync(DB,JSON.stringify(c,null,2));
app.get('/api/ocupadas',(req,res)=>res.json(leer().filter(c=>c.fecha==req.query.fecha).map(c=>c.hora)));
app.post('/api/agendar',(req,res)=>{let citas=leer();if(citas.find(c=>c.fecha==req.body.fecha&&c.hora==req.body.hora))return res.status(409).json({error:'Hora ocupada'});citas.push({id:Date.now(),...req.body});guardar(citas);res.json({ok:true})});
app.get('/api/citas',(req,res)=>{if(req.query.pass!=CLAVE)return res.status(401).json({error:'Clave mala'});let c=leer();if(req.query.fecha)c=c.filter(x=>x.fecha==req.query.fecha);res.json(c)});
app.post('/api/cancelar',(req,res)=>{if(req.body.pass!=CLAVE)return res.status(401).json({error:'Clave mala'});guardar(leer().filter(c=>c.id!=req.body.id));res.json({ok:true})});
app.listen(PORT,()=>console.log('listo'));
