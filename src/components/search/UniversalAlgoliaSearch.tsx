'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface UniversalAlgoliaSearchProps {
  onResults: (results: any[]) => void;
  onLoading: (loading: boolean) => void;
  placeholder?: string;
  filters?: Record<string, any>;
  className?: string;
  searchType: 'candidates' | 'jobs' | 'projects' | 'competence-files';
  showStats?: boolean;
}

export function UniversalAlgoliaSearch({ 
  onResults, 
  onLoading, 
  placeholder = "Search...", 
  filters = {},
  className = "",
  searchType,
  showStats = true
}: UniversalAlgoliaSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Get the correct API endpoint based on search type
  const getSearchEndpoint = (type: string) => {
    switch (type) {
      case 'candidates':
        return '/api/search/candidates';
      case 'jobs':
        return '/api/search/jobs';
      case 'projects':
        return '/api/search/projects'; // Will need to create this
      case 'competence-files':
        return '/api/search/competence-files'; // Will need to create this
      default:
        return '/api/search/candidates';
    }
  };

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults(null);
        onResults([]);
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

        const endpoint = getSearchEndpoint(searchType);
        const response = await fetch(`${endpoint}?${params}`);
        const data = await response.json();

        if (data.success) {
          setResults(data);
          onResults(data.data || []);
        } else {
          setError(data.error || 'Search failed');
          onResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
        onResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, filters, searchType, onResults]);

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
      {showStats && results && debouncedQuery && (
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
