const { describe, test, expect, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

afterAll(async () => {
  await prisma.$disconnect();
});

async function idDe(nombre) {
  const product = await prisma.product.findFirst({ where: { nombre } });
  return product.id;
}

describe('GET /api/products/:id', () => {
  test('devuelve el detalle con marca y 7 tallas', async () => {
    const id = await idDe('Air Max 90');
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.marca).toBe('Nike');
    expect(res.body.tallas).toHaveLength(7);
  });

  test('las tallas de Speedcat están todas agotadas', async () => {
    const id = await idDe('Speedcat');
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.tallas.every((t) => t.stock === 0)).toBe(true);
  });

  test('un producto desactivado responde 404', async () => {
    const id = await idDe('One Star');
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(404);
  });

  test('un id que no existe responde 404', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.status).toBe(404);
  });

  test('un id inválido responde 404', async () => {
    const res = await request(app).get('/api/products/abc');
    expect(res.status).toBe(404);
  });
});
