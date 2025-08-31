'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Search, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function AlgoliaInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isIndexingCandidates, setIsIndexingCandidates] = useState(false);
  const [isIndexingJobs, setIsIndexingJobs] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [candidatesStatus, setCandidatesStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jobsStatus, setJobsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    setIsInitializing(true);
    setInitStatus('idle');
    setMessage('');

    try {
      const response = await fetch('/api/algolia/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setInitStatus('success');
        setMessage('Algolia initialized successfully!');
      } else {
        setInitStatus('error');
        setMessage(data.error || 'Failed to initialize Algolia');
      }
    } catch (error) {
      setInitStatus('error');
      setMessage('Network error occurred');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleIndexCandidates = async () => {
    setIsIndexingCandidates(true);
    setCandidatesStatus('idle');

    try {
      const response = await fetch('/api/algolia/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'index_all',
          type: 'candidates'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCandidatesStatus('success');
      } else {
        setCandidatesStatus('error');
      }
    } catch (error) {
      setCandidatesStatus('error');
    } finally {
      setIsIndexingCandidates(false);
    }
  };

  const handleIndexJobs = async () => {
    setIsIndexingJobs(true);
    setJobsStatus('idle');

    try {
      const response = await fetch('/api/algolia/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'index_all',
          type: 'jobs'
        })
      });

      const data = await response.json();

      if (data.success) {
        setJobsStatus('success');
      } else {
        setJobsStatus('error');
      }
    } catch (error) {
      setJobsStatus('error');
    } finally {
      setIsIndexingJobs(false);
    }
  };

  const getStatusIcon = (status: 'idle' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Search className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Algolia Search Setup</h3>
            <p className="text-sm text-gray-600">Initialize and configure Algolia search indices</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Initialization */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">Initialize Indices</h4>
              <p className="text-sm text-gray-600">Set up search configuration</p>
            </div>
            {getStatusIcon(initStatus)}
          </div>
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isInitializing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Initialize</span>
              </>
            )}
          </button>
        </div>

        {/* Index Candidates */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">Index Candidates</h4>
              <p className="text-sm text-gray-600">Upload all candidate data to Algolia</p>
            </div>
            {getStatusIcon(candidatesStatus)}
          </div>
          <button
            onClick={handleIndexCandidates}
            disabled={isIndexingCandidates}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isIndexingCandidates ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Indexing...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Index Candidates</span>
              </>
            )}
          </button>
        </div>

        {/* Index Jobs */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">Index Jobs</h4>
              <p className="text-sm text-gray-600">Upload all job data to Algolia</p>
            </div>
            {getStatusIcon(jobsStatus)}
          </div>
          <button
            onClick={handleIndexJobs}
            disabled={isIndexingJobs}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isIndexingJobs ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Indexing...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Index Jobs</span>
              </>
            )}
          </button>
        </div>

        {/* Status message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            initStatus === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>First, click "Initialize" to set up the search indices</li>
            <li>Then, click "Index Candidates" to upload candidate data</li>
            <li>Finally, click "Index Jobs" to upload job data</li>
            <li>After setup, search will be powered by Algolia</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
