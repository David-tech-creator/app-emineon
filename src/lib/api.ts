// Use Next.js API routes instead of external API
const API_BASE = '/api';

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

  // For Next.js API routes, we don't need to manually add Authorization header
  // as Clerk handles authentication automatically

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as ApiResponse<T>;
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// API functions
export const api = {
  // Health check
  health: () => apiRequest('/health'),

  // Candidates
  candidates: {
    list: (token?: string) => apiRequest<Candidate[]>('/candidates'),
    get: (id: string, token?: string) => apiRequest<Candidate>(`/candidates/${id}`),
    create: (data: CreateCandidateData, token?: string) =>
      apiRequest<Candidate>('/candidates', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (id: string, token?: string) =>
      apiRequest(`/candidates/${id}`, {
        method: 'DELETE',
      }),
  },
}; 