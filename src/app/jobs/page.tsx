'use client';

import { Layout } from '@/components/layout/Layout';

export default function JobsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-900">Jobs</h1>
          <p className="text-secondary-600 mt-1">Manage your job openings and recruitment campaigns</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Active Job Postings</h3>
            <p className="text-gray-600 text-sm mb-4">Create and manage job openings</p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Application Tracking</h3>
            <p className="text-gray-600 text-sm mb-4">Monitor applications and candidate progress</p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">Job Board Integration</h3>
            <p className="text-gray-600 text-sm mb-4">Sync with external job boards</p>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Coming Soon</button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 