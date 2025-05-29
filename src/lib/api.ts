const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateData {
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
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add any custom headers
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json() as ApiResponse<T>;
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
}

// API functions
export const api = {
  // Health check
  health: () => apiRequest('/health'),

  // Candidates
  candidates: {
    list: (token?: string) => apiRequest<Candidate[]>('/candidates', {}, token),
    get: (id: string, token?: string) => apiRequest<Candidate>(`/candidates/${id}`, {}, token),
    create: (data: CreateCandidateData, token?: string) =>
      apiRequest<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      }, token),
    delete: (id: string, token?: string) =>
      apiRequest(`/candidates/${id}`, {
        method: 'DELETE',
      }, token),
  },
}; 