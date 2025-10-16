import { z } from 'zod';

export const userCreateSchema = z.object({
  username: z.string().min(1),
  age: z.number().int().nonnegative(),
  hobbies: z.array(z.string()).default([])
});

export const userUpdateSchema = z.object({
  username: z.string().min(1).optional(),
  age: z.number().int().nonnegative().optional(),
  hobbies: z.array(z.string()).optional()
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;


