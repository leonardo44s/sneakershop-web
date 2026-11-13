const { describe, test, expect, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const correo = `test_${Date.now()}@correo.com`;

afterAll(async () => {
  await prisma.user.deleteMany({ where: { correo: { startsWith: 'test_' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  test('crea la cuenta con rol cliente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Cliente Prueba', correo, contrasena: 'clave1234' });
    expect(res.status).toBe(201);
    expect(res.body.user.rol).toBe('cliente');
    expect(res.body.user.contrasena).toBeUndefined();
  });

  test('ignora el rol admin si alguien lo envía', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Intruso',
        correo: `test_admin_${Date.now()}@correo.com`,
        contrasena: 'clave1234',
        rol: 'admin',
      });
    expect(res.status).toBe(201);
    expect(res.body.user.rol).toBe('cliente');
  });

  test('rechaza un correo repetido con 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Otra Persona', correo, contrasena: 'clave1234' });
    expect(res.status).toBe(409);
  });

  test('rechaza una contraseña de menos de 8 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Corta', correo: `test_corta_${Date.now()}@correo.com`, contrasena: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errores.contrasena).toBeTruthy();
  });

  test('rechaza un correo con formato inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Sin Arroba', correo: 'correo-invalido', contrasena: 'clave1234' });
    expect(res.status).toBe(400);
    expect(res.body.errores.correo).toBeTruthy();
  });

  test('el cliente recién creado puede iniciar sesión', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ correo, contrasena: 'clave1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.rol).toBe('cliente');
  });
});