import { z } from 'zod';

export const createCandidateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  skills: z.array(z.string().min(1, 'Skill cannot be empty')).min(1, 'At least one skill is required'),
  experience: z.number().int().min(0, 'Experience must be a non-negative integer').max(50, 'Experience cannot exceed 50 years')
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>; 