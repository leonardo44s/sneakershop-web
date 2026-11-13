const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { nombre, correo, contrasena } = req.body || {};
    const nombreLimpio = String(nombre || '').trim();
    const correoLimpio = String(correo || '').trim().toLowerCase();
    const clave = String(contrasena || '');

    const errores = {};
    if (nombreLimpio.length < 2) {
      errores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!EMAIL_REGEX.test(correoLimpio)) {
      errores.correo = 'Ingresa un correo válido';
    }
    if (clave.length < 8) {
      errores.contrasena = 'La contraseña debe tener mínimo 8 caracteres';
    }
    if (Object.keys(errores).length > 0) {
      return res.status(400).json({ message: 'Revisa los datos del formulario', errores });
    }

    const existe = await prisma.user.findUnique({ where: { correo: correoLimpio } });
    if (existe) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo' });
    }

    const hash = await bcrypt.hash(clave, 10);

    // El rol siempre es "cliente": nunca se toma de lo que envía el formulario
    const user = await prisma.user.create({
      data: { nombre: nombreLimpio, correo: correoLimpio, contrasena: hash, rol: 'cliente' },
    });

    return res.status(201).json({
      user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
    });
  } catch (error) {
    // P2002 = correo repetido (si dos personas se registran con el mismo correo a la vez)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese correo' });
    }
    return next(error);
  }
}

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

module.exports = { register, login };