import { z } from 'zod';

const emailSchema = z
  .string()
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format');

export const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain uppercase')
    .refine((val) => /[0-9]/.test(val), 'Password must contain number')
    .refine((val) => /[!@#$%^&*]/.test(val), 'Password must contain special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;