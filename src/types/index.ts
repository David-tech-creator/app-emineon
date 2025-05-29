export interface CreateCandidateRequest {
  name: string;
  email: string;
  skills: string[];
  experience: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  authenticated?: boolean;
  user?: any;
  createdBy?: string;
  deletedBy?: string;
  [key: string]: any; // Allow additional properties
} 