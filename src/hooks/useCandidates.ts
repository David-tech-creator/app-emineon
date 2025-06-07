'use client';

import useSWR from 'swr';
import { api, CandidateResponse } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export function useCandidates() {
  const { getToken } = useAuth();

  const fetcher = async (): Promise<CandidateResponse[]> => {
    const token = await getToken();
    const response = await api.candidates.list(token || undefined);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch candidates');
    }
    
    return response.data || [];
  };

  const { data, error, isLoading, mutate } = useSWR<CandidateResponse[]>(
    'candidates',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    candidates: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useCandidatesWithSearch(searchParams?: {
  search?: string;
  status?: string;
  skills?: string;
  location?: string;
  source?: string;
}) {
  const { getToken } = useAuth();

  const fetcher = async (): Promise<CandidateResponse[]> => {
    const token = await getToken();
    const response = await api.candidates.list(token || undefined, searchParams);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch candidates');
    }
    
    return response.data || [];
  };

  // Create a cache key that includes search parameters
  const cacheKey = searchParams 
    ? `candidates-${JSON.stringify(searchParams)}`
    : 'candidates';

  const { data, error, isLoading, mutate } = useSWR<CandidateResponse[]>(
    cacheKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    candidates: data || [],
    isLoading,
    error,
    mutate,
  };
}

export function useCandidate(id: string) {
  const { getToken } = useAuth();

  const fetcher = async (): Promise<CandidateResponse> => {
    if (!id) throw new Error('No candidate ID provided');
    
    const token = await getToken();
    const response = await api.candidates.get(id, token || undefined);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch candidate');
    }
    
    if (!response.data) {
      throw new Error('Candidate not found');
    }
    
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<CandidateResponse>(
    id ? `candidate-${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    candidate: data,
    isLoading,
    error,
    mutate,
  };
} 