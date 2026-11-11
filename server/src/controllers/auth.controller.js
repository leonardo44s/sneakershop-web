const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body || {};

    if (!correo || !contrasena) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    const user = await prisma.user.findUnique({
      where: { correo: String(correo).trim().toLowerCase() },
    });

    const valida = user ? await bcrypt.compare(String(contrasena), user.contrasena) : false;

    if (!valida) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login };