const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Debes iniciar sesión' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Sesión inválida o expirada' });
  }
}

function verifyAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') {
    return res.status(403).json({ message: 'No tienes permiso para acceder a esta sección' });
  }
  return next();
}

function verifyCliente(req, res, next) {
  if (req.user?.rol !== 'cliente') {
    return res.status(403).json({ message: 'Solo las cuentas de cliente pueden hacer pedidos' });
  }
  return next();
}

module.exports = { verifyToken, verifyAdmin, verifyCliente };