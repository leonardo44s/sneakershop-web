const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

const correo = `test_pedido_${Date.now()}@correo.com`;
const contrasena = 'clave1234';
const entrega = { telefono: '3001234567', direccion: 'Calle 10 # 20-30', ciudad: 'Cali' };

let token;
let adminToken;
let talla; // una talla con stock para hacer las pruebas

beforeAll(async () => {
  await prisma.user.create({
    data: {
      nombre: 'Cliente Pedido',
      correo,
      contrasena: await bcrypt.hash(contrasena, 10),
      rol: 'cliente',
    },
  });
  const cliente = await request(app).post('/api/auth/login').send({ correo, contrasena });
  token = cliente.body.token;

  const admin = await request(app)
    .post('/api/auth/login')
    .send({ correo: 'admin@sneakershop.com', contrasena: process.env.ADMIN_PASSWORD });
  adminToken = admin.body.token;

  talla = await prisma.productSize.findFirst({
    where: { stock: { gte: 2 }, product: { activo: true } },
    orderBy: { id: 'asc' },
  });
});

afterAll(async () => {
  // Deja el stock como estaba y borra los datos de prueba
  await prisma.productSize.update({ where: { id: talla.id }, data: { stock: talla.stock } });
  const user = await prisma.user.findUnique({ where: { correo } });
  if (user) {
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.$disconnect();
});

function pedir(items, auth = token, datos = entrega) {
  const peticion = request(app).post('/api/orders').send({ ...datos, items });
  return auth ? peticion.set('Authorization', `Bearer ${auth}`) : peticion;
}

function unaUnidad() {
  return [{ productId: talla.productId, talla: talla.talla, cantidad: 1 }];
}

async function stockActual() {
  const fila = await prisma.productSize.findUnique({ where: { id: talla.id } });
  return fila.stock;
}

describe('POST /api/orders', () => {
  test('crea el pedido en estado Pendiente y descuenta el stock', async () => {
    const antes = await stockActual();
    const res = await pedir(unaUnidad());
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('Pendiente');
    expect(res.body.codigo).toMatch(/^SS-/);
    expect(await stockActual()).toBe(antes - 1);
  });

  test('sin sesión responde 401', async () => {
    const res = await pedir(unaUnidad(), null);
    expect(res.status).toBe(401);
  });

  test('un administrador no puede hacer pedidos (403)', async () => {
    const res = await pedir(unaUnidad(), adminToken);
    expect(res.status).toBe(403);
  });

  test('rechaza más unidades que el stock con 409 y no descuenta nada', async () => {
    const antes = await stockActual();
    const res = await pedir([{ productId: talla.productId, talla: talla.talla, cantidad: antes + 1 }]);
    expect(res.status).toBe(409);
    expect(await stockActual()).toBe(antes);
  });

  test('rechaza un carrito vacío con 400', async () => {
    const res = await pedir([]);
    expect(res.status).toBe(400);
    expect(res.body.errores.items).toBeTruthy();
  });

  test('rechaza datos de entrega inválidos con 400', async () => {
    const res = await pedir(unaUnidad(), token, { telefono: 'abc', direccion: '', ciudad: '' });
    expect(res.status).toBe(400);
    expect(res.body.errores.telefono).toBeTruthy();
  });

  test('dos compras simultáneas del último par: solo una se confirma', async () => {
    await prisma.productSize.update({ where: { id: talla.id }, data: { stock: 1 } });
    const [a, b] = await Promise.all([pedir(unaUnidad()), pedir(unaUnidad())]);
    expect([a.status, b.status].sort()).toEqual([201, 409]);
    expect(await stockActual()).toBe(0);
  });
});

describe('GET /api/orders/:codigo', () => {
  test('el cliente puede consultar su pedido por código', async () => {
    await prisma.productSize.update({ where: { id: talla.id }, data: { stock: 5 } });
    const creado = await pedir(unaUnidad());
    const res = await request(app)
      .get(`/api/orders/${creado.body.codigo}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.codigo).toBe(creado.body.codigo);
    expect(res.body.items).toHaveLength(1);
  });
});