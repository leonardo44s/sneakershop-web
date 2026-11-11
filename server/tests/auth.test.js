const { describe, test, expect, afterAll } = require('@jest/globals');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/login', () => {
  test('rechaza una contraseña incorrecta con 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@sneakershop.com', contrasena: 'incorrecta' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Correo o contraseña incorrectos');
  });

  test('acepta al administrador del seed y devuelve un token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@sneakershop.com', contrasena: process.env.ADMIN_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.rol).toBe('admin');
  });
});

describe('Rutas /api/admin', () => {
  test('sin token responde 401', async () => {
    const res = await request(app).get('/api/admin/me');
    expect(res.status).toBe(401);
  });

  test('con token de cliente responde 403', async () => {
    const token = jwt.sign({ id: 999, nombre: 'Cliente', rol: 'cliente' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    const res = await request(app).get('/api/admin/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('con token de administrador responde 200', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ correo: 'admin@sneakershop.com', contrasena: process.env.ADMIN_PASSWORD });
    const res = await request(app)
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.rol).toBe('admin');
  });
});