import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { prisma } from '../db.js';

describe('relationships API', () => {
  beforeAll(async () => {
    await prisma.$connect();
    await prisma.friendship.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('prevents deletion while linked and allows after unlink', async () => {
    const a = await request(app).post('/api/users').send({ username: 'a', age: 20, hobbies: ['x'] });
    const b = await request(app).post('/api/users').send({ username: 'b', age: 21, hobbies: ['x'] });
    const aId = a.body.id; const bId = b.body.id;
    await request(app).post(`/api/users/${aId}/link`).send({ targetId: bId }).expect(201);
    await request(app).delete(`/api/users/${aId}`).expect(409);
    await request(app).delete(`/api/users/${aId}/unlink`).send({ targetId: bId }).expect(200);
    await request(app).delete(`/api/users/${aId}`).expect(204);
  });

  it('prevents duplicate/circular friendships by unique pair constraint', async () => {
    const a = await request(app).post('/api/users').send({ username: 'c', age: 22, hobbies: [] });
    const b = await request(app).post('/api/users').send({ username: 'd', age: 23, hobbies: [] });
    const aId = a.body.id; const bId = b.body.id;
    await request(app).post(`/api/users/${aId}/link`).send({ targetId: bId }).expect(201);
    // attempt reverse link should conflict
    const r = await request(app).post(`/api/users/${bId}/link`).send({ targetId: aId });
    expect(r.status).toBe(409);
  });
});


