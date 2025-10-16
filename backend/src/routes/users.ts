import { Router } from 'express';
import { userCreateSchema, userUpdateSchema } from '../validation.js';
import { createUser, deleteUser, linkUsers, listDTOs, toDTO, unlinkUsers, updateUser } from '../services/userService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const users = await listDTOs();
    res.json(users);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const u = await createUser(parsed.data);
    const dto = await toDTO(u.id);
    res.status(201).json(dto);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const u = await updateUser(req.params.id, parsed.data);
    const dto = await toDTO(u.id);
    res.json(dto);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

router.post('/:id/link', async (req, res, next) => {
  try {
    const targetId = req.body?.targetId as string;
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    await linkUsers(req.params.id, targetId);
    const dto = await toDTO(req.params.id);
    res.status(201).json(dto);
  } catch (e) { next(e); }
});

router.delete('/:id/unlink', async (req, res, next) => {
  try {
    const targetId = req.body?.targetId as string;
    if (!targetId) return res.status(400).json({ error: 'targetId required' });
    await unlinkUsers(req.params.id, targetId);
    const dto = await toDTO(req.params.id);
    res.json(dto);
  } catch (e) { next(e); }
});

export default router;


