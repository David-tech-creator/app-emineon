'use client';

import { useState, useEffect, useMemo } from 'react';
import { searchClient, CANDIDATES_INDEX, JOBS_INDEX } from '@/lib/algolia';

export interface AlgoliaSearchOptions {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  facets?: string[];
}

export interface AlgoliaSearchResult {
  hits: any[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  facets?: Record<string, Record<string, number>>;
}

export function useAlgoliaCandidateSearch(options: AlgoliaSearchOptions) {
  const [results, setResults] = useState<AlgoliaSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOptions = useMemo(() => ({
    hitsPerPage: options.limit || 20,
    page: options.page || 0,
    filters: options.filters ? Object.entries(options.filters)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${key}:"${v}"`).join(' OR ');
        }
        return `${key}:"${value}"`;
      })
      .join(' AND ') : '',
    attributesToHighlight: ['fullName', 'currentTitle', 'currentLocation', 'technicalSkills', 'summary'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    facets: options.facets || ['status', 'seniorityLevel', 'technicalSkills', 'primaryIndustry'],
    maxValuesPerFacet: 100,
  }), [options]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchClient) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await searchClient.search({
          requests: [{
            indexName: CANDIDATES_INDEX,
            query: options.query,
            ...searchOptions
          }]
        });
        setResults(result.results[0]);
      } catch (err) {
        console.error('Algolia search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [options.query, searchOptions]);

  return {
    results,
    isLoading,
    error,
    refetch: () => {
      const performSearch = async () => {
        if (!searchClient) return;
        
        setIsLoading(true);
        setError(null);

        try {
          const result = await searchClient.search({
            requests: [{
              indexName: CANDIDATES_INDEX,
              query: options.query,
              ...searchOptions
            }]
          });
          setResults(result.results[0]);
        } catch (err) {
          console.error('Algolia search error:', err);
          setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
          setIsLoading(false);
        }
      };

      performSearch();
    }
  };
}

export function useAlgoliaJobSearch(options: AlgoliaSearchOptions) {
  const [results, setResults] = useState<AlgoliaSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchOptions = useMemo(() => ({
    hitsPerPage: options.limit || 20,
    page: options.page || 0,
    filters: options.filters ? Object.entries(options.filters)
      .filter(([_, value]) => value !== undefined && value !== '' && value !== null)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(v => `${key}:"${v}"`).join(' OR ');
        }
        return `${key}:"${value}"`;
      })
      .join(' AND ') : '',
    attributesToHighlight: ['title', 'company', 'location', 'description', 'skills'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    facets: options.facets || ['status', 'employmentType', 'experienceLevel', 'department', 'skills'],
    maxValuesPerFacet: 100,
  }), [options]);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchClient) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const result = await searchClient.search({
          requests: [{
            indexName: JOBS_INDEX,
            query: options.query,
            ...searchOptions
          }]
        });
        setResults(result.results[0]);
      } catch (err) {
        console.error('Algolia search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [options.query, searchOptions]);

  return {
    results,
    isLoading,
    error,
    refetch: () => {
      const performSearch = async () => {
        if (!searchClient) return;
        
        setIsLoading(true);
        setError(null);

        try {
          const result = await searchClient.search({
            requests: [{
              indexName: JOBS_INDEX,
              query: options.query,
              ...searchOptions
            }]
          });
          setResults(result.results[0]);
        } catch (err) {
          console.error('Algolia search error:', err);
          setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
          setIsLoading(false);
        }
      };

      performSearch();
    }
  };
}

// Server-side search functions (for API endpoints)
export async function searchCandidatesServer(query: string, filters?: any, options?: any) {
  try {
    const searchOptions = {
      hitsPerPage: options?.limit || 20,
      page: options?.page || 0,
      filters: filters ? Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}:"${value}"`)
        .join(' AND ') : '',
      ...options
    };

    const result = await searchClient.search({
      requests: [{
        indexName: CANDIDATES_INDEX,
        query,
        ...searchOptions
      }]
    });
    return result.results[0];
  } catch (error) {
    console.error('Server-side candidate search error:', error);
    throw error;
  }
}

export async function searchJobsServer(query: string, filters?: any, options?: any) {
  try {
    const searchOptions = {
      hitsPerPage: options?.limit || 20,
      page: options?.page || 0,
      filters: filters ? Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '')
        .map(([key, value]) => `${key}:"${value}"`)
        .join(' AND ') : '',
      ...options
    };

    const result = await searchClient.search({
      requests: [{
        indexName: JOBS_INDEX,
        query,
        ...searchOptions
      }]
    });
    return result.results[0];
  } catch (error) {
    console.error('Server-side job search error:', error);
    throw error;
  }
}
