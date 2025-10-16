import { Router } from 'express';
import { prisma } from '../db.js';
import { listDTOs } from '../services/userService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const users = await listDTOs();
    const friendships = await prisma.friendship.findMany();
    const edges = friendships.map(f => ({ id: f.id, source: f.userAId, target: f.userBId }));
    res.json({ nodes: users, edges });
  } catch (e) { next(e); }
});

export default router;


