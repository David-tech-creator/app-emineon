import { z } from 'zod';

// Enums
export const JobStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED']);
export const LanguageEnum = z.enum(['EN', 'ES', 'FR', 'DE', 'PT', 'IT', 'NL', 'PL', 'RU', 'ZH', 'JA', 'KO']);
export const ApplicationStatusEnum = z.enum(['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN']);
export const InterviewTypeEnum = z.enum(['PHONE_SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'FINAL', 'VIDEO_ONE_WAY']);
export const InterviewStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']);

// Candidate schemas
export const candidateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  skills: z.array(z.string()).default([]),
  experience: z.number().min(0).max(50),
  assessmentScore: z.number().min(0).max(100).optional(),
  assessmentComments: z.string().optional(),
});

export const updateCandidateSchema = candidateSchema.partial();

// Job schemas
export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  language: LanguageEnum.default('EN'),
  status: JobStatusEnum.default('DRAFT'),
});

export const updateJobSchema = jobSchema.partial();

// Application schemas
export const applicationSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  coverLetter: z.string().optional(),
  cvUrl: z.string().url().optional(),
  referralCode: z.string().optional(),
  status: ApplicationStatusEnum.default('PENDING'),
});

export const publicApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  jobId: z.string(),
  coverLetter: z.string().optional(),
  referralCode: z.string().optional(),
});

// Referral schemas
export const referralSchema = z.object({
  candidateId: z.string(),
  referrerName: z.string().min(1, 'Referrer name is required'),
});

// Evaluation schemas
export const evaluationSchema = z.object({
  candidateId: z.string(),
  rating: z.number().min(1).max(5),
  notes: z.string().optional(),
  criteria: z.record(z.any()).optional(),
});

// Interview schemas
export const interviewSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  type: InterviewTypeEnum,
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 minutes to 8 hours
  location: z.string().optional(),
  videoInterviewUrl: z.string().url().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const scheduleInterviewSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
  interviewerIds: z.array(z.string()),
  type: InterviewTypeEnum,
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480),
  location: z.string().optional(),
});

// AI schemas
export const aiJobDescriptionSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  keyRequirements: z.array(z.string()).optional(),
  experience: z.string().optional(),
});

export const aiEmailTemplateSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  companyName: z.string().min(1, 'Company name is required'),
  tone: z.enum(['professional', 'friendly', 'casual']).default('professional'),
  purpose: z.enum(['outreach', 'interview_invite', 'rejection', 'offer']),
});

// Workflow schemas
export const workflowRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  trigger: z.string().min(1, 'Trigger is required'),
  conditions: z.record(z.any()),
  actions: z.record(z.any()),
  isActive: z.boolean().default(true),
});

// Legacy function for backward compatibility
export function transformCandidateFormData(data: any) {
  return candidateSchema.parse(data);
}

// Type exports
export type CandidateInput = z.infer<typeof candidateSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
export type PublicApplicationInput = z.infer<typeof publicApplicationSchema>;
export type ReferralInput = z.infer<typeof referralSchema>;
export type EvaluationInput = z.infer<typeof evaluationSchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type AIJobDescriptionInput = z.infer<typeof aiJobDescriptionSchema>;
export type AIEmailTemplateInput = z.infer<typeof aiEmailTemplateSchema>;
export type WorkflowRuleInput = z.infer<typeof workflowRuleSchema>; 