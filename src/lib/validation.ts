import { z } from 'zod';

// Candidate data schema (for API)
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

// Form input schema (raw form inputs)
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
    .min(1, 'Skills are required'),
  experience: z
    .string()
    .min(1, 'Experience is required')
    .refine((val) => !isNaN(parseInt(val, 10)), 'Experience must be a number')
    .refine((val) => parseInt(val, 10) >= 0, 'Experience must be a non-negative number')
    .refine((val) => parseInt(val, 10) <= 50, 'Experience cannot exceed 50 years'),
});

// Transform function to convert form data to API data
export const transformCandidateFormData = (formData: CandidateFormData): CandidateData => {
  return {
    name: formData.name,
    email: formData.email,
    skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
    experience: parseInt(formData.experience, 10),
  };
};

export type CandidateFormData = z.infer<typeof candidateFormSchema>;
export type CandidateData = z.infer<typeof candidateSchema>; 