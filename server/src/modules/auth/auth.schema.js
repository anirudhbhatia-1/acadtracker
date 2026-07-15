const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    })
    .refine((data) => data.name !== undefined || data.password !== undefined, {
      message: 'At least name or password must be provided to update profile',
      path: ['name'],
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
