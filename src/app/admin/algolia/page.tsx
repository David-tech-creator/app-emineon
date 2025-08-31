'use client';

import { Layout } from '@/components/layout/Layout';
import { AlgoliaInitializer } from '@/components/admin/AlgoliaInitializer';
import { Search } from 'lucide-react';

export default function AlgoliaAdminPage() {
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
      </div>
    </Layout>
  );
}
