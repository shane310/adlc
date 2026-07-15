import { z } from 'zod';
import { SystemRole } from '@prisma/client';

const PASSWORD_RULES = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .regex(PASSWORD_RULES, 'Password must include upper, lower, digit and special character');

export const emailSchema = z.string().email().max(320).transform((v) => v.toLowerCase().trim());

export const createUserSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    companyName: z.string().max(200).optional().nullable(),
    phone: z
      .string()
      .max(30)
      .regex(/^[+\d][\d\s\-().]{5,}$/, 'Phone number is invalid')
      .optional()
      .nullable(),
    roleId: z.string().cuid(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  companyName: z.string().max(200).nullable().optional(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d][\d\s\-().]{5,}$/, 'Phone number is invalid')
    .nullable()
    .optional(),
  roleId: z.string().cuid().optional(),
  isActive: z.boolean().optional(),
});

export const usersQuerySchema = z.object({
  search: z.string().max(200).optional(),
  role: z.nativeEnum(SystemRole).optional(),
  active: z.enum(['all', 'true', 'false']).default('all'),
  mfa: z.enum(['all', 'true', 'false']).default('all'),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const rolePermissionUpdateSchema = z.object({
  add: z.array(z.string().cuid()).default([]),
  remove: z.array(z.string().cuid()).default([]),
});

export const settingsUpdateSchema = z.object({
  key: z.string().min(1).max(120),
  value: z.unknown(),
  category: z.string().min(1).max(60),
  description: z.string().max(300).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UsersQuery = z.infer<typeof usersQuerySchema>;
