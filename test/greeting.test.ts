import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app';

describe('greeting endpoints', () => {
  it('GET /hello defaults to World', async () => {
    const res = await request(app).get('/hello');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello, World!' });
  });

  it('GET /hello uses the provided name', async () => {
    const res = await request(app).get('/hello').query({ name: 'Ada' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello, Ada!' });
  });

  it('GET /health reports ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
