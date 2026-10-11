// INCREMENTO 2: reemplaza al "usuarioDemo" del incremento 1.
// Lee el token JWT que envía el frontend en la cabecera "Authorization: Bearer <token>",
// comprueba que sea válido y deja en req.usuario quién es y qué rol tiene (HU3).
const jwt = require('jsonwebtoken');

module.exports = function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null;

  if (!token) {
    return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRETO);
    req.usuario = { id_usuario: datos.id_usuario, rol: datos.rol, nombres: datos.nombres };
    next();
  } catch {
    // Token vencido o manipulado: el usuario debe volver a iniciar sesión
    return res.status(401).json({ mensaje: 'Tu sesión venció. Inicia sesión de nuevo.' });
  }
};

// Permite una ruta solo a un rol (se usará en el incremento 3 para el panel del administrador)
module.exports.soloRol = (rol) => (req, res, next) => {
  if (req.usuario?.rol !== rol) {
    return res.status(403).json({ mensaje: 'No tienes permiso para esta acción.' });
  }
  next();
};
