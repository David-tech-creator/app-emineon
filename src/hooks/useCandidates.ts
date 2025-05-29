'use client';

import useSWR from 'swr';
import { api, Candidate, ApiResponse } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';

export function useCandidates() {
  const { getToken } = useAuth();

  const fetcher = async (): Promise<Candidate[]> => {
    const token = await getToken();
    const response = await api.candidates.list(token || undefined);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch candidates');
    }
    
    return response.data || [];
  };

  const { data, error, isLoading, mutate } = useSWR<Candidate[]>(
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

export function useCandidate(id: string) {
  const { getToken } = useAuth();

  const fetcher = async (): Promise<Candidate> => {
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

  const { data, error, isLoading, mutate } = useSWR<Candidate>(
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