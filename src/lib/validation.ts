import { z } from 'zod';

// Enums
export const JobStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED']);
export const LanguageEnum = z.enum(['EN', 'ES', 'FR', 'DE', 'PT', 'IT', 'NL', 'PL', 'RU', 'ZH', 'JA', 'KO']);
export const ApplicationStatusEnum = z.enum(['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN']);
export const InterviewTypeEnum = z.enum(['PHONE_SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'FINAL', 'VIDEO_ONE_WAY']);
export const InterviewStatusEnum = z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']);
export const CandidateStatusEnum = z.enum(['NEW', 'ACTIVE', 'PASSIVE', 'DO_NOT_CONTACT', 'BLACKLISTED']);
export const EmploymentTypeEnum = z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY']);
export const NoticePeriodEnum = z.enum(['IMMEDIATE', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'TWO_MONTHS', 'THREE_MONTHS', 'SIX_MONTHS', 'OTHER']);
export const SalaryTypeEnum = z.enum(['ANNUAL', 'MONTHLY', 'DAILY', 'HOURLY']);
export const EducationLevelEnum = z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'CERTIFICATION', 'BOOTCAMP', 'SELF_TAUGHT']);

// Comprehensive candidate schema
export const candidateSchema = z.object({
  // Basic Information (Mandatory)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  
  // Location Information
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  timezone: z.string().optional(),
  
  // Professional Information
  currentTitle: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).default([]),
  experience: z.number().min(0).max(50),
  
  // Employment Details
  currentCompany: z.string().optional(),
  currentSalary: z.number().positive().optional(),
  currentSalaryType: SalaryTypeEnum.optional(),
  expectedSalary: z.number().positive().optional(),
  expectedSalaryType: SalaryTypeEnum.optional(),
  currency: z.string().default('USD'),
  noticePeriod: NoticePeriodEnum.optional(),
  
  // Availability & Preferences
  status: CandidateStatusEnum.default('NEW'),
  availableStartDate: z.string().datetime().optional(),
  preferredEmployment: z.array(EmploymentTypeEnum).default([]),
  willingToRelocate: z.boolean().default(false),
  remoteWork: z.boolean().default(false),
  
  // Education
  highestEducation: EducationLevelEnum.optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().min(1950).max(2030).optional(),
  
  // Documents & Links
  resumeUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  
  // Assessment & Scoring
  assessmentScore: z.number().min(0).max(100).optional(),
  assessmentComments: z.string().optional(),
  techScore: z.number().min(0).max(100).optional(),
  communicationScore: z.number().min(0).max(100).optional(),
  culturalFitScore: z.number().min(0).max(100).optional(),
  
  // Source & Attribution
  source: z.string().optional(),
  referredBy: z.string().optional(),
  recruiterNotes: z.string().optional(),
});

// Form schema for CV/LinkedIn parsing input
export const candidateParsingSchema = z.object({
  // Manual input fields (these will be auto-filled from parsing)
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  summary: z.string().optional(),
  experience: z.number().min(0).max(50),
  skills: z.string().optional(), // Will be converted to array
  
  // Location
  city: z.string().optional(),
  country: z.string().optional(),
  
  // Education
  highestEducation: EducationLevelEnum.optional(),
  university: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().min(1950).max(2030).optional(),
  
  // Preferences
  expectedSalary: z.string().optional(), // Will be converted to number
  currency: z.string().default('USD'),
  noticePeriod: NoticePeriodEnum.optional(),
  preferredEmployment: z.array(EmploymentTypeEnum).default([]),
  remoteWork: z.boolean().default(false),
  willingToRelocate: z.boolean().default(false),
  
  // Links
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  
  // Internal
  source: z.string().default('Manual Entry'),
  recruiterNotes: z.string().optional(),
});

// LinkedIn profile parsing schema
export const linkedinParsingSchema = z.object({
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL'),
});

// CV parsing response schema
export const cvParsingResponseSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  summary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().optional(),
  education: z.array(z.object({
    degree: z.string().optional(),
    university: z.string().optional(),
    year: z.number().optional(),
  })).optional(),
  workHistory: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
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

// Helper function to transform form data
export function transformCandidateFormData(data: any) {
  const transformed = { ...data };
  
  // Convert skills string to array
  if (typeof data.skills === 'string') {
    transformed.skills = data.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean);
  }
  
  // Convert salary strings to numbers
  if (data.expectedSalary && typeof data.expectedSalary === 'string') {
    const salary = parseFloat(data.expectedSalary.replace(/[^\d.]/g, ''));
    transformed.expectedSalary = isNaN(salary) ? undefined : salary;
  }
  
  if (data.currentSalary && typeof data.currentSalary === 'string') {
    const salary = parseFloat(data.currentSalary.replace(/[^\d.]/g, ''));
    transformed.currentSalary = isNaN(salary) ? undefined : salary;
  }
  
  // Convert empty strings to undefined for optional URL fields
  ['portfolioUrl', 'githubUrl', 'websiteUrl', 'linkedinUrl'].forEach(field => {
    if (transformed[field] === '') {
      transformed[field] = undefined;
    }
  });
  
  return candidateSchema.parse(transformed);
}

// Type exports
export type CandidateInput = z.infer<typeof candidateSchema>;
export type CandidateParsingInput = z.infer<typeof candidateParsingSchema>;
export type LinkedinParsingInput = z.infer<typeof linkedinParsingSchema>;
export type CVParsingResponse = z.infer<typeof cvParsingResponseSchema>;
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