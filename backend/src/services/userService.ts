import { prisma } from '../db.js';
import { UserCreateInput, UserUpdateInput } from '../validation.js';

function sortPair(a: string, b: string): { a: string; b: string } {
  return a < b ? { a, b } : { a: b, b: a };
}

function serializeHobbies(hobbies: string[]): string { return JSON.stringify(hobbies); }
function parseHobbies(raw: string): string[] { try { return JSON.parse(raw) ?? []; } catch { return []; } }

export async function createUser(input: UserCreateInput) {
  const user = await prisma.user.create({ data: { username: input.username, age: input.age, hobbiesRaw: serializeHobbies(input.hobbies) } });
  return user;
}

export async function listUsers() {
  return prisma.user.findMany({ include: { friendshipsA: true, friendshipsB: true } });
}

export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id }, include: { friendshipsA: true, friendshipsB: true } });
}

export async function updateUser(id: string, input: UserUpdateInput) {
  const data: any = { ...input };
  if (input.hobbies) { delete data.hobbies; data.hobbiesRaw = serializeHobbies(input.hobbies); }
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string) {
  const rels = await prisma.friendship.findFirst({ where: { OR: [{ userAId: id }, { userBId: id }] } });
  if (rels) {
    const err: any = new Error('Unlink friendships before deleting user');
    err.status = 409;
    throw err;
  }
  return prisma.user.delete({ where: { id } });
}

export async function linkUsers(aId: string, bId: string) {
  if (aId === bId) {
    const err: any = new Error('Cannot friend self');
    err.status = 400;
    throw err;
  }
  const a = await prisma.user.findUnique({ where: { id: aId } });
  const b = await prisma.user.findUnique({ where: { id: bId } });
  if (!a || !b) {
    const err: any = new Error('User not found');
    err.status = 404;
    throw err;
  }
  const p = sortPair(aId, bId);
  try {
    await prisma.friendship.create({ data: { userAId: p.a, userBId: p.b } });
  } catch (e: any) {
    const err: any = new Error('Relationship already exists');
    err.status = 409;
    throw err;
  }
}

export async function unlinkUsers(aId: string, bId: string) {
  const p = sortPair(aId, bId);
  const existing = await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId: p.a, userBId: p.b } } });
  if (!existing) {
    const err: any = new Error('Relationship not found');
    err.status = 404;
    throw err;
  }
  await prisma.friendship.delete({ where: { userAId_userBId: { userAId: p.a, userBId: p.b } } });
}

export function computePopularityScore(user: { hobbies: string[] }, friendHobbiesList: string[][]): number {
  const uniqueFriends = friendHobbiesList.length;
  let shared = 0;
  const userSet = new Set(user.hobbies);
  for (const fh of friendHobbiesList) {
    for (const h of fh) if (userSet.has(h)) shared += 1;
  }
  return uniqueFriends + shared * 0.5;
}

export async function toDTO(userId: string) {
  const user = await getUser(userId);
  if (!user) return null;
  const friendIds = new Set<string>();
  for (const f of user.friendshipsA) friendIds.add(f.userBId);
  for (const f of user.friendshipsB) friendIds.add(f.userAId);
  const friends = Array.from(friendIds);
  const friendsData = await prisma.user.findMany({ where: { id: { in: friends } } });
  const score = computePopularityScore({ hobbies: parseHobbies(user.hobbiesRaw) }, friendsData.map(f => parseHobbies(f.hobbiesRaw)));
  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: parseHobbies(user.hobbiesRaw),
    friends,
    createdAt: user.createdAt.toISOString(),
    popularityScore: score
  };
}

export async function listDTOs() {
  const users = await listUsers();
  const dtos = await Promise.all(users.map(u => toDTO(u.id)));
  return dtos.filter(Boolean);
}


