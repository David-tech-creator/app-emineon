'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Search, Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function AlgoliaInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isIndexingCandidates, setIsIndexingCandidates] = useState(false);
  const [isIndexingJobs, setIsIndexingJobs] = useState(false);
  const [isIndexingAll, setIsIndexingAll] = useState(false);
  const [isClearingIndices, setIsClearingIndices] = useState(false);
  const [initStatus, setInitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [candidatesStatus, setCandidatesStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jobsStatus, setJobsStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [candidatesCount, setCandidatesCount] = useState<number | null>(null);
  const [jobsCount, setJobsCount] = useState<number | null>(null);

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
        if (data.data?.objectIDs) {
          setCandidatesCount(data.data.objectIDs.length);
        }
      } else {
        setCandidatesStatus('error');
        setMessage(data.error || 'Failed to index candidates');
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
        if (data.data?.objectIDs) {
          setJobsCount(data.data.objectIDs.length);
        }
      } else {
        setJobsStatus('error');
        setMessage(data.error || 'Failed to index jobs');
      }
    } catch (error) {
      setJobsStatus('error');
    } finally {
      setIsIndexingJobs(false);
    }
  };

  const handleIndexAll = async () => {
    setIsIndexingAll(true);
    setMessage('');

    try {
      const response = await fetch('/api/algolia/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'index_all',
          type: 'all'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCandidatesStatus('success');
        setJobsStatus('success');
        setMessage('All data indexed successfully!');
        if (data.data?.candidates?.objectIDs) {
          setCandidatesCount(data.data.candidates.objectIDs.length);
        }
        if (data.data?.jobs?.objectIDs) {
          setJobsCount(data.data.jobs.objectIDs.length);
        }
      } else {
        setCandidatesStatus('error');
        setJobsStatus('error');
        setMessage(data.error || 'Failed to index all data');
      }
    } catch (error) {
      setCandidatesStatus('error');
      setJobsStatus('error');
      setMessage('Network error occurred');
    } finally {
      setIsIndexingAll(false);
    }
  };

  const handleClearIndices = async () => {
    if (!confirm('Are you sure you want to clear all Algolia indices? This will remove all search data.')) {
      return;
    }

    setIsClearingIndices(true);
    setMessage('');

    try {
      const response = await fetch('/api/algolia/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear',
          type: 'all'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCandidatesStatus('idle');
        setJobsStatus('idle');
        setCandidatesCount(null);
        setJobsCount(null);
        setMessage('All indices cleared successfully!');
      } else {
        setMessage(data.error || 'Failed to clear indices');
      }
    } catch (error) {
      setMessage('Network error occurred');
    } finally {
      setIsClearingIndices(false);
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
              <p className="text-sm text-gray-600">
                Upload all candidate data to Algolia
                {candidatesCount !== null && ` (${candidatesCount} indexed)`}
              </p>
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
              <p className="text-sm text-gray-600">
                Upload all job data to Algolia
                {jobsCount !== null && ` (${jobsCount} indexed)`}
              </p>
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

        {/* Index All Data */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900">Index All Data</h4>
              <p className="text-sm text-gray-600">One-click setup: Initialize + Index candidates + Index jobs</p>
            </div>
          </div>
          <button
            onClick={handleIndexAll}
            disabled={isIndexingAll || isInitializing || isIndexingCandidates || isIndexingJobs}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isIndexingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                <span>Index All</span>
              </>
            )}
          </button>
        </div>

        {/* Clear Indices */}
        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-gray-900">Clear All Indices</h4>
              <p className="text-sm text-gray-600">Remove all data from Algolia (for testing/reset)</p>
            </div>
          </div>
          <button
            onClick={handleClearIndices}
            disabled={isClearingIndices}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isClearingIndices ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>Clear All</span>
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
          <div className="space-y-3">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-1">🚀 Quick Setup (Recommended)</h5>
              <p className="text-sm text-blue-800">Click "Index All" for one-click setup of everything</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-1">📋 Manual Setup</h5>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Click "Initialize" to set up search indices</li>
                <li>Click "Index Candidates" to upload candidate data</li>
                <li>Click "Index Jobs" to upload job data</li>
              </ol>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-1">🔄 Maintenance</h5>
              <p className="text-sm text-blue-800">Use "Clear All" to reset indices during testing</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
