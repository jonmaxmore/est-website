import { z } from 'zod';

export const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  platform: z.enum(['ios', 'android', 'pc'], {
    message: 'Platform must be ios, android, or pc',
  }),
  region: z.enum(['th', 'sea', 'global'], {
    message: 'Invalid region',
  }),
  referredBy: z.string().optional(),
  locale: z.enum(['th', 'en']).default('th'),
  recaptchaToken: z.string().min(1, 'reCAPTCHA token required'),
});

export const referralTrackSchema = z.object({
  referralCode: z.string().min(1),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  locale: z.enum(['th', 'en']).default('th'),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
