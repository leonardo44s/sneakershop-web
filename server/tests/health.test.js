const { describe, test, expect } = require('@jest/globals');
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  test('responde API OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('API OK');
  });
});
