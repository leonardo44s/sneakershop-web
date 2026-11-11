const { describe, test, expect, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/products', () => {
  test('devuelve la primera página con máximo 12 productos activos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
    expect(res.body.data.length).toBeLessThanOrEqual(12);
    expect(res.body.total).toBe(19);
  });

  test('no incluye productos desactivados', async () => {
    const res = await request(app).get('/api/products?limit=50');
    const nombres = res.body.data.map((p) => p.nombre);
    expect(nombres).not.toContain('One Star');
  });

  test('respeta page y limit', async () => {
    const res = await request(app).get('/api/products?page=2&limit=5');
    expect(res.body.page).toBe(2);
    expect(res.body.data.length).toBe(5);
    expect(res.body.totalPages).toBe(4);
  });
});
