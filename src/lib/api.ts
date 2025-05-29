const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://app-emineon.vercel.app'
  : 'http://localhost:3000';

export interface CreateCandidateData {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Location Information
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  timezone?: string;
  
  // Professional Information
  currentTitle?: string;
  summary?: string;
  skills: string[];
  experience: number;
  
  // Employment Details
  currentCompany?: string;
  currentSalary?: number;
  currentSalaryType?: string;
  expectedSalary?: number;
  expectedSalaryType?: string;
  currency?: string;
  noticePeriod?: string;
  
  // Availability & Preferences
  status?: string;
  availableStartDate?: string;
  preferredEmployment?: string[];
  willingToRelocate?: boolean;
  remoteWork?: boolean;
  
  // Education
  highestEducation?: string;
  university?: string;
  degree?: string;
  graduationYear?: number;
  
  // Documents & Links
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  
  // Assessment & Scoring
  assessmentScore?: number;
  assessmentComments?: string;
  techScore?: number;
  communicationScore?: number;
  culturalFitScore?: number;
  
  // Source & Attribution
  source?: string;
  referredBy?: string;
  recruiterNotes?: string;
}

export interface Candidate extends CreateCandidateData {
  id: string;
  profileToken?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  authenticated?: boolean;
  user?: any;
}

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}, token?: string) {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    return { ...data, status: response.status };
  }

  candidates = {
    list: async (token?: string) => {
      return this.request('/api/candidates', {}, token);
    },

    create: async (candidateData: CreateCandidateData, token?: string) => {
      return this.request('/api/candidates', {
        method: 'POST',
        body: JSON.stringify(candidateData),
      }, token);
    },

    get: async (id: string, token?: string) => {
      return this.request(`/api/candidates/${id}`, {}, token);
    },

    update: async (id: string, candidateData: Partial<CreateCandidateData>, token?: string) => {
      return this.request(`/api/candidates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(candidateData),
      }, token);
    },

    delete: async (id: string, token?: string) => {
      return this.request(`/api/candidates/${id}`, {
        method: 'DELETE',
      }, token);
    },
  };
}

export const api = new ApiClient(); 