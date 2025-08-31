'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AlgoliaInitializer } from '@/components/admin/AlgoliaInitializer';
import { UniversalAlgoliaSearch } from '@/components/search/UniversalAlgoliaSearch';
import { Search, TestTube, Users, Briefcase } from 'lucide-react';

export default function AlgoliaAdminPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testLoading, setTestLoading] = useState(false);
  const [testType, setTestType] = useState<'candidates' | 'jobs'>('candidates');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Search className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Algolia Search Management</h1>
            <p className="text-secondary-600 mt-1">
              Configure and manage search functionality powered by Algolia
            </p>
          </div>
        </div>

        {/* Algolia Initializer */}
        <AlgoliaInitializer />

        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <div className="text-sm text-gray-600">Active Indices</div>
            <div className="text-xs text-gray-500 mt-1">candidates, jobs</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-gray-600">Search Endpoints</div>
            <div className="text-xs text-gray-500 mt-1">Live & Ready</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">Auto</div>
            <div className="text-sm text-gray-600">Sync Mode</div>
            <div className="text-xs text-gray-500 mt-1">Real-time indexing</div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Application ID:</span>
              <p className="text-gray-600 font-mono">9U680JAGZW</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Search API Key:</span>
              <p className="text-gray-600 font-mono">907f511c...d7dde55</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Candidates Index:</span>
              <p className="text-gray-600 font-mono">candidates</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Jobs Index:</span>
              <p className="text-gray-600 font-mono">jobs</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">API Version:</span>
              <p className="text-gray-600 font-mono">v5.36.0</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <p className="text-green-600 font-medium">✅ Active & Ready</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Candidate Search</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Full-text search across all candidate fields</li>
                <li>• Filter by skills, experience, location</li>
                <li>• Faceted search with real-time filters</li>
                <li>• Typo tolerance and synonym support</li>
                <li>• Instant search as you type</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Job Search</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Search job titles, descriptions, requirements</li>
                <li>• Filter by department, location, type</li>
                <li>• Sort by relevance, date, priority</li>
                <li>• Highlighted search results</li>
                <li>• Advanced filtering capabilities</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Test Search */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TestTube className="h-5 w-5 text-green-600" />
            <span>Test Search Functionality</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Test Type:</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'candidates' | 'jobs')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="candidates">Candidates</option>
                <option value="jobs">Jobs</option>
              </select>
            </div>

            <UniversalAlgoliaSearch
              onResults={setTestResults}
              onLoading={setTestLoading}
              placeholder={`Test search ${testType}...`}
              searchType={testType}
              className="w-full"
            />

            {testResults.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                  {testType === 'candidates' ? <Users className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                  <span>Search Results ({testResults.length})</span>
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {testResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-gray-200 text-sm">
                      <div className="font-medium text-gray-900">
                        {testType === 'candidates' 
                          ? result.fullName || `${result.firstName} ${result.lastName}`
                          : result.title
                        }
                      </div>
                      <div className="text-gray-600">
                        {testType === 'candidates' 
                          ? `${result.currentTitle} • ${result.currentLocation}`
                          : `${result.company} • ${result.location}`
                        }
                      </div>
                    </div>
                  ))}
                  {testResults.length > 5 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      ... and {testResults.length - 5} more results
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
