const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/lib/prisma');

let nike;
let adidas;

beforeAll(async () => {
  nike = await prisma.brand.findUnique({ where: { nombre: 'Nike' } });
  adidas = await prisma.brand.findUnique({ where: { nombre: 'Adidas' } });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Listas para los filtros', () => {
  test('GET /api/brands devuelve las 5 marcas en orden alfabético', async () => {
    const res = await request(app).get('/api/brands');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].nombre).toBe('Adidas');
  });

  test('GET /api/sizes devuelve las tallas', async () => {
    const res = await request(app).get('/api/sizes');
    expect(res.body).toEqual(['37', '38', '39', '40', '41', '42', '43']);
  });
});

describe('GET /api/products con filtros', () => {
  test('filtra por una marca', async () => {
    const res = await request(app).get(`/api/products?marcas=${nike.id}&limit=50`);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p) => p.marca === 'Nike')).toBe(true);
  });

  test('filtra por varias marcas', async () => {
    const res = await request(app).get(`/api/products?marcas=${nike.id},${adidas.id}&limit=50`);
    expect(res.body.total).toBe(8);
  });

  test('filtra por talla con stock', async () => {
    const res = await request(app).get('/api/products?talla=40&limit=50');
    const nombres = res.body.data.map((p) => p.nombre);
    expect(res.body.total).toBeGreaterThan(0);
    expect(nombres).not.toContain('Speedcat');
  });

  test('combina marca y talla', async () => {
    const res = await request(app).get(`/api/products?marcas=${nike.id}&talla=40&limit=50`);
    expect(res.body.data.every((p) => p.marca === 'Nike')).toBe(true);
  });

  test('ignora marcas inválidas', async () => {
    const res = await request(app).get('/api/products?marcas=abc');
    expect(res.body.total).toBe(19);
  });
});