'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useAlgoliaCandidateSearch } from '@/hooks/useAlgoliaSearch';

interface AlgoliaSearchBoxProps {
  onResults: (results: any[]) => void;
  onLoading: (loading: boolean) => void;
  placeholder?: string;
  filters?: Record<string, any>;
  className?: string;
}

export function AlgoliaSearchBox({ 
  onResults, 
  onLoading, 
  placeholder = "Search candidates...", 
  filters = {},
  className = ""
}: AlgoliaSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchOptions = useMemo(() => ({
    query: debouncedQuery,
    filters,
    page: 0,
    limit: 50,
  }), [debouncedQuery, filters]);

  const { results, isLoading, error } = useAlgoliaCandidateSearch(searchOptions);

  // Update parent component with results
  useEffect(() => {
    if (results?.hits) {
      onResults(results.hits);
    } else if (!isLoading && debouncedQuery === '') {
      // Empty search - let parent handle showing all candidates
      onResults([]);
    }
  }, [results, isLoading, debouncedQuery, onResults]);

  // Update parent component with loading state
  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search stats */}
      {results && debouncedQuery && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>
            {results.nbHits} result{results.nbHits !== 1 ? 's' : ''} found 
            {results.processingTimeMS && ` in ${results.processingTimeMS}ms`}
          </span>
          {debouncedQuery && (
            <span>for "{debouncedQuery}"</span>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          Search error: {error}
        </div>
      )}
    </div>
  );
}

interface AlgoliaJobSearchBoxProps {
  onResults: (results: any[]) => void;
  onLoading: (loading: boolean) => void;
  placeholder?: string;
  filters?: Record<string, any>;
  className?: string;
}

export function AlgoliaJobSearchBox({ 
  onResults, 
  onLoading, 
  placeholder = "Search jobs...", 
  filters = {},
  className = ""
}: AlgoliaJobSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchOptions = useMemo(() => ({
    query: debouncedQuery,
    filters,
    page: 0,
    limit: 50,
  }), [debouncedQuery, filters]);

  // For jobs, we'll use the API endpoint since the hook is for candidates
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: '50',
          ...Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [key, String(value)])
          )
        });

        const response = await fetch(`/api/search/jobs?${params}`);
        const data = await response.json();

        if (data.success) {
          setResults(data);
        } else {
          setError(data.error || 'Search failed');
        }
      } catch (err) {
        console.error('Job search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, filters]);

  // Update parent component with results
  useEffect(() => {
    if (results?.data) {
      onResults(results.data);
    } else if (!isLoading && debouncedQuery === '') {
      onResults([]);
    }
  }, [results, isLoading, debouncedQuery, onResults]);

  // Update parent component with loading state
  useEffect(() => {
    onLoading(isLoading);
  }, [isLoading, onLoading]);

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-3 w-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search stats */}
      {results && debouncedQuery && (
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>
            {results.meta?.total || 0} result{(results.meta?.total || 0) !== 1 ? 's' : ''} found 
            {results.meta?.processingTime && ` in ${results.meta.processingTime}ms`}
          </span>
          {debouncedQuery && (
            <span>for "{debouncedQuery}"</span>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
          Search error: {error}
        </div>
      )}
    </div>
  );
}
