import { z } from 'zod';

// Candidate validation schema
export const candidateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  skills: z
    .array(z.string().min(1, 'Skill cannot be empty'))
    .min(1, 'At least one skill is required')
    .max(20, 'Maximum 20 skills allowed'),
  experience: z
    .number()
    .min(0, 'Experience must be a non-negative number')
    .max(50, 'Experience cannot exceed 50 years'),
});

// Form data schema (for string inputs)
export const candidateFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  skills: z
    .string()
    .min(1, 'Skills are required')
    .transform((val) => val.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0))
    .refine((skills) => skills.length > 0, 'At least one skill is required')
    .refine((skills) => skills.length <= 20, 'Maximum 20 skills allowed'),
  experience: z
    .string()
    .min(1, 'Experience is required')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), 'Experience must be a number')
    .refine((val) => val >= 0, 'Experience must be a non-negative number')
    .refine((val) => val <= 50, 'Experience cannot exceed 50 years'),
});

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
export type CandidateData = z.infer<typeof candidateSchema>; 