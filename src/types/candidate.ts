// Extended candidate data schema that builds on existing API structure
// This maintains backward compatibility while adding comprehensive data modeling

import { Candidate, CandidateStatus, SeniorityLevel, ConversionStatus, RemotePreference, ContractType, EducationLevel } from '@prisma/client';

// Core extensions to existing structure
export interface Location {
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  isRemote?: boolean;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  frequency: 'hourly' | 'monthly' | 'yearly';
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'industry' | 'language' | 'certification';
  proficiencyLevel: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
  yearsOfExperience?: number;
  verified?: boolean;
  source?: 'resume' | 'interview' | 'test' | 'self-reported';
}

export interface Language {
  code: string; // ISO 639-1 codes (en, es, fr, etc.)
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
  certified?: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string[];
  isOngoing: boolean;
  location?: Location;
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  isCurrentRole: boolean;
  description: string;
  achievements: string[];
  skills: string[];
  location?: Location;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  uploadDate: Date;
  uploadedBy: string;
  isActive: boolean;
  version: number;
  tags: string[];
}

export interface Note {
  id: string;
  content: string;
  createdBy: string;
  createdDate: Date;
  isPrivate: boolean;
  tags: string[];
  type: 'general' | 'interview' | 'call' | 'email' | 'meeting';
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'skill' | 'priority' | 'status' | 'source' | 'custom';
  createdBy: string;
  createdDate: Date;
}

export interface JobAssignment {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  assignedDate: Date;
  status: 'applied' | 'screening' | 'interview' | 'presented' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  stage?: string;
  assignedBy: string;
  matchScore?: number;
  notes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  appliedDate: Date;
  source: string;
  status: CandidateStatus;
  coverLetter?: string;
  customResponses?: Record<string, string>;
}

export interface Interview {
  id: string;
  jobId?: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'cultural' | 'client';
  scheduledDate: Date;
  duration: number; // minutes
  interviewers: string[];
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  feedback?: InterviewFeedback;
  recordingUrl?: string;
  notes?: string;
}

export interface InterviewFeedback {
  id: string;
  interviewId: string;
  interviewer: string;
  rating: number; // 1-5 scale
  feedback: string;
  strengths: string[];
  concerns: string[];
  recommendation: 'strong-hire' | 'hire' | 'no-hire' | 'strong-no-hire';
  submittedDate: Date;
}

export interface Communication {
  id: string;
  type: 'email' | 'call' | 'sms' | 'linkedin' | 'whatsapp' | 'meeting';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: Date;
  participants: string[];
  attachments?: Document[];
  linkedJobId?: string;
  status: 'sent' | 'delivered' | 'read' | 'replied' | 'bounced';
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: 'manager' | 'colleague' | 'direct-report' | 'client' | 'other';
  contactDate?: Date;
  feedback?: string;
  rating?: number;
  verified: boolean;
}

export interface SocialProfile {
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'behance' | 'dribbble';
  url: string;
  username?: string;
  verified?: boolean;
}

// Enums for standardized values (extending existing validation.ts enums)
export type InterviewStage = 
  | 'phone-screening'
  | 'video-interview'
  | 'technical-interview'
  | 'cultural-interview'
  | 'panel-interview'
  | 'client-interview'
  | 'final-interview';

export type SourceType = 
  | 'linkedin'
  | 'job-board'
  | 'referral'
  | 'company-website'
  | 'github'
  | 'direct-application'
  | 'recruitment-agency'
  | 'social-media'
  | 'networking-event'
  | 'cold-communication'
  | 'internal-database';

export type WorkAuthStatus = 
  | 'citizen'
  | 'permanent-resident'
  | 'work-visa'
  | 'student-visa'
  | 'requires-sponsorship'
  | 'no-authorization';

export type AvailabilityStatus = 
  | 'immediately'
  | 'within-2-weeks'
  | 'within-month'
  | 'within-3-months'
  | 'not-looking'
  | 'passive';

// Base candidate type from Prisma
export type CandidateType = Candidate;

// Extended candidate with computed fields
export interface ExtendedCandidate extends Candidate {
  displayName: string; // Computed from firstName + lastName
  initials: string;
  experienceLabel: string;
  locationLabel: string;
  skillsCount: number;
  isActive: boolean;
  isHotlist: boolean;
  lastActivity?: Date;
  // Additional fields for UI compatibility
  currentCompany?: string;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
  structuredLocation?: {
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
  };
}

// Candidate summary for lists and cards
export interface CandidateSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentTitle?: string | null;
  professionalHeadline?: string | null;
  currentLocation?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  experienceYears?: number | null;
  technicalSkills: string[];
  primaryIndustry?: string | null;
  seniorityLevel?: SeniorityLevel | null;
  expectedSalary?: string | null;
  remotePreference?: RemotePreference | null;
  tags: string[];
  status: CandidateStatus;
  conversionStatus?: ConversionStatus | null;
  matchingScore?: number | null;
  source?: string | null;
  createdAt: Date;
  lastUpdated: Date;
}

// Candidate form data for creation/editing
export interface CandidateFormData {
  // 🧱 Identification & Contact (10 fields)
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  currentLocation?: string;
  nationality?: string;
  timezone?: string;
  
  // 🧠 Professional Summary (6 fields)
  currentTitle?: string;
  professionalHeadline?: string;
  summary?: string;
  seniorityLevel?: SeniorityLevel;
  primaryIndustry?: string;
  functionalDomain?: string;
  
  // 🛠 Skills & Technologies (7 fields)
  technicalSkills: string[];
  softSkills: string[];
  toolsAndPlatforms: string[];
  frameworks: string[];
  programmingLanguages: string[];
  spokenLanguages: string[];
  methodologies: string[];
  
  // 💼 Work Experience (4 fields - removed managementExperience, consultantType)
  experienceYears?: number;
  companies?: any; // JSON field
  notableProjects: string[];
  freelancer: boolean;
  
  // 🎓 Education & Certifications (5 fields - removed ongoingTraining)
  degrees: string[];
  certifications: string[];
  universities: string[];
  graduationYear?: number;
  educationLevel?: EducationLevel;
  
  // ⚙️ Logistics & Preferences (6 fields)
  availableFrom?: Date;
  preferredContractType?: ContractType;
  expectedSalary?: string;
  relocationWillingness: boolean;
  remotePreference?: RemotePreference;
  workPermitType?: string;
  
  // 🤖 AI/ATS Specific (3 fields)
  matchingScore?: number;
  tags: string[];
  archived: boolean;
  
  // 💡 Meta Fields (8 fields)
  source?: string;
  recruiterNotes: string[];
  interviewScores?: any; // JSON field
  videoInterviewUrl?: string;
  culturalFitScore?: number;
  motivationalFitNotes?: string;
  referees?: any; // JSON field
  conversionStatus?: ConversionStatus;
}

// Legacy candidate form data for backward compatibility
export interface LegacyCandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  experienceYears?: number;
  technicalSkills: string[];
  summary?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentLocation?: string;
  expectedSalary?: string;
  remotePreference?: RemotePreference;
  tags: string[];
}

// Candidate search filters
export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus;
  tags?: string[];
  seniorityLevel?: SeniorityLevel;
  primaryIndustry?: string;
  remotePreference?: RemotePreference;
  experienceYears?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  location?: string;
  source?: string;
  conversionStatus?: ConversionStatus;
}

// Candidate search result
export interface CandidateSearchResult {
  candidates: CandidateSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: CandidateFilters;
}

// Candidate analytics
export interface CandidateAnalytics {
  totalCandidates: number;
  newThisMonth: number;
  activeApplications: number;
  placedCandidates: number;
  averageMatchingScore: number;
  topSkills: Array<{ skill: string; count: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  statusBreakdown: Array<{ status: CandidateStatus; count: number }>;
  conversionRates: {
    applicationToInterview: number;
    interviewToOffer: number;
    offerToHire: number;
  };
}

// Candidate matching result
export interface CandidateMatch {
  candidate: CandidateSummary;
  score: number;
  reasoning: string;
  factors: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    availabilityMatch: number;
  };
}

// Utility functions for candidate data
export const candidateUtils = {
  // Get display name
  getDisplayName: (candidate: Partial<CandidateType>): string => {
    return `${(candidate as any).firstName || ''} ${(candidate as any).lastName || ''}`.trim() || 'Unknown Professional';
  },

  // Get initials
  getInitials: (candidate: Partial<CandidateType>): string => {
    const firstName = (candidate as any).firstName || '';
    const lastName = (candidate as any).lastName || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  },

  // Get experience label
  getExperienceLabel: (experienceYears?: number | null): string => {
    if (!experienceYears) return 'Experience not specified';
    if (experienceYears === 1) return '1 year';
    return `${experienceYears} years`;
  },

  // Get location label
  getLocationLabel: (candidate: Partial<CandidateType>): string => {
    return (candidate as any).currentLocation || 'Location not specified';
  },

  // Get skills count
  getSkillsCount: (candidate: Partial<CandidateType>): number => {
    return ((candidate as any).technicalSkills?.length || 0) + 
           ((candidate as any).softSkills?.length || 0) + 
           ((candidate as any).frameworks?.length || 0);
  },

  // Check if candidate is active
  isActive: (candidate: Partial<CandidateType>): boolean => {
    return (candidate as any).status === 'ACTIVE' || (candidate as any).status === 'NEW';
  },

  // Transform legacy data to new format
  transformLegacyToExtended: (legacy: LegacyCandidateFormData): CandidateFormData => {
    return {
      // 🧱 Identification & Contact
      firstName: legacy.firstName,
      lastName: legacy.lastName,
      email: legacy.email,
      phone: legacy.phone,
      linkedinUrl: legacy.linkedinUrl,
      portfolioUrl: legacy.portfolioUrl,
      githubUrl: undefined,
      currentLocation: legacy.currentLocation,
      nationality: undefined,
      timezone: undefined,
      
      // 🧠 Professional Summary
      currentTitle: legacy.currentTitle,
      professionalHeadline: undefined,
      summary: legacy.summary,
      seniorityLevel: undefined,
      primaryIndustry: undefined,
      functionalDomain: undefined,
      
      // 🛠 Skills & Technologies
      technicalSkills: legacy.technicalSkills,
      softSkills: [],
      toolsAndPlatforms: [],
      frameworks: [],
      programmingLanguages: [],
      spokenLanguages: [],
      methodologies: [],
      
      // 💼 Work Experience
      experienceYears: legacy.experienceYears || 0,
      companies: undefined,
      notableProjects: [],
      freelancer: false,
      
      // 🎓 Education & Certifications
      degrees: [],
      certifications: [],
      universities: [],
      graduationYear: undefined,
      educationLevel: undefined,
      
      // ⚙️ Logistics & Preferences
      availableFrom: undefined,
      preferredContractType: undefined,
      expectedSalary: legacy.expectedSalary,
      relocationWillingness: false,
      remotePreference: legacy.remotePreference,
      workPermitType: undefined,
      
      // 🤖 AI/ATS Specific
      matchingScore: undefined,
      tags: legacy.tags,
      archived: false,
      
      // 💡 Meta Fields
      source: undefined,
      recruiterNotes: [],
      interviewScores: undefined,
      videoInterviewUrl: undefined,
      culturalFitScore: undefined,
      motivationalFitNotes: undefined,
      referees: undefined,
      conversionStatus: undefined,
    };
  },

  // Get candidate summary from full candidate
  getSummary: (candidate: CandidateType): CandidateSummary => {
    return {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      currentTitle: candidate.currentTitle || undefined,
      professionalHeadline: candidate.professionalHeadline || undefined,
      currentLocation: candidate.currentLocation || undefined,
      linkedinUrl: candidate.linkedinUrl,
      portfolioUrl: candidate.portfolioUrl,
      experienceYears: candidate.experienceYears,
      technicalSkills: candidate.technicalSkills,
      primaryIndustry: candidate.primaryIndustry || undefined,
      seniorityLevel: candidate.seniorityLevel,
      expectedSalary: candidate.expectedSalary,
      remotePreference: candidate.remotePreference,
      tags: candidate.tags,
      status: candidate.status,
      conversionStatus: candidate.conversionStatus,
      matchingScore: candidate.matchingScore,
      source: candidate.source,
      createdAt: candidate.createdAt,
      lastUpdated: candidate.lastUpdated,
    };
  },
};

// Helper function to convert existing candidate to extended format
export function extendCandidate(candidate: Candidate): ExtendedCandidate {
  // Handle both old and new schema formats
  const firstName = candidate.firstName || '';
  const lastName = candidate.lastName || '';
  const displayName = `${firstName} ${lastName}`.trim();
  
  return {
    ...candidate,
    displayName: displayName || 'Unknown Professional',
    initials: `${firstName[0] || ''}${lastName[0] || ''}`,
    experienceLabel: candidate.experienceYears ? `${candidate.experienceYears} years` : 'No experience',
    locationLabel: candidate.currentLocation || 'No location',
    skillsCount: (candidate.technicalSkills?.length || 0) + (candidate.softSkills?.length || 0),
    isActive: candidate.status === 'ACTIVE' || candidate.status === 'NEW',
    isHotlist: false,
    lastActivity: candidate.lastUpdated ? new Date(candidate.lastUpdated) : new Date(candidate.createdAt),
    structuredLocation: {
      city: undefined,
      state: undefined,
      country: undefined,
      timezone: candidate.timezone,
    },
  } as ExtendedCandidate;
}

// Helper function to get status color
export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'new':
    case 'applied': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'contacted':
    case 'screening': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'presented':
    case 'positioned': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'hired': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Search and filter types for the candidates table
export interface CandidateSearchFilters {
  query?: string;
  skills?: string[];
  location?: string;
  experienceRange?: { min: number; max: number };
  salaryRange?: { min: number; max: number };
  availability?: string[];
  status?: string[];
  source?: string[];
  tags?: string[];
  rating?: { min: number; max: number };
  isHotlist?: boolean;
  addedDateRange?: { start: Date; end: Date };
}

// List item interface for table display (backward compatible)
export interface CandidateListItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  currentTitle?: string;
  professionalHeadline?: string;
  primaryIndustry?: string;
  company?: string;
  location: string;
  skills: string[];
  experience: number;
  status: string;
  source: string;
  addedDate: string;
  lastContactDate?: string;
  matchScore?: number;
  isHotlist: boolean;
  tags: string[];
  assignedJobs: string[];
  rating?: number;
  initials: string;
}

// Convert existing candidate to list item format
export function candidateToListItem(candidate: Candidate): CandidateListItem {
  return {
    id: candidate.id,
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone || undefined,
    currentTitle: candidate.currentTitle || 'No Title',
    professionalHeadline: candidate.professionalHeadline || undefined,
    primaryIndustry: candidate.primaryIndustry || undefined,
    company: undefined, // Not in current schema
    location: candidate.currentLocation || 'No Location',
    skills: candidate.technicalSkills || [],
    experience: candidate.experienceYears || 0,
    status: candidate.status || 'NEW',
    source: candidate.source || 'direct-application',
    addedDate: candidate.createdAt.toISOString(),
    lastContactDate: undefined, // Not in current schema
    matchScore: candidate.matchingScore || undefined,
    isHotlist: false, // Default for existing candidates
    tags: candidate.tags || [],
    assignedJobs: [], // Default for existing candidates
    initials: `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`,
  };
}

// Convert API response candidate to list item format
export function candidateResponseToListItem(candidate: any): CandidateListItem {
  return {
    id: candidate.id,
    name: `${candidate.firstName} ${candidate.lastName}`,
    email: candidate.email,
    phone: candidate.phone || undefined,
    currentTitle: candidate.currentTitle || 'No Title',
    professionalHeadline: candidate.professionalHeadline || undefined,
    primaryIndustry: candidate.primaryIndustry || undefined,
    company: undefined, // Not in current schema
    location: candidate.currentLocation || 'No Location',
    skills: candidate.technicalSkills || [],
    experience: candidate.experienceYears || 0,
    status: candidate.status || 'NEW',
    source: candidate.source || 'direct-application',
    addedDate: candidate.createdAt,
    lastContactDate: undefined, // Not in current schema
    matchScore: candidate.matchingScore || undefined,
    isHotlist: false, // Default for existing candidates
    tags: candidate.tags || [],
    assignedJobs: [], // Default for existing candidates
    initials: `${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`,
  };
} 