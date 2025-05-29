'use client';

import { Layout } from '@/components/layout/Layout';
import { useUser, useOrganization } from '@clerk/nextjs';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Brain, 
  Workflow, 
  TrendingUp,
  Plus,
  ChevronRight,
  UserPlus,
  FileText,
  Video,
  ClipboardList,
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="mt-2 text-lg text-secondary-600">
            Your comprehensive recruitment management platform
          </p>
          {organization && (
            <p className="text-sm text-primary-600 mt-2">
              Organization: <span className="font-medium">{organization.name}</span>
            </p>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Active Candidates
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  247
                </p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +12%
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Open Positions
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  18
                </p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +3
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  Clients
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  32
                </p>
              </div>
              <div className="text-sm font-medium text-secondary-500">
                0%
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">
                  This Month Placements
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  8
                </p>
              </div>
              <div className="text-sm font-medium text-green-600">
                +2
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div>
          <h2 className="text-xl font-semibold text-secondary-900 mb-6">
            Navigate by Category
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Talent Management */}
            <div className="bg-blue-50 border-blue-200 border rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <div className="h-5 w-5 text-white">👥</div>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-blue-700">
                    Talent Management
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Manage candidates, assessments, and interviews
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/candidates" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">View Candidates</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/candidates/new" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Add Candidate</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/assessments" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Assessments</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/video-interviews" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Video Interviews</span>
                  <span className="text-secondary-400">→</span>
                </Link>
              </div>
            </div>

            {/* Job Management */}
            <div className="bg-green-50 border-green-200 border rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-2 rounded-lg">
                  <div className="h-5 w-5 text-white">💼</div>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-green-700">
                    Job Management
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Create, distribute, and manage job postings
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/jobs" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">View Jobs</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/job-distribution" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Job Distribution</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/ai-tools" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">AI Tools</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/outreach" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Smart Outreach</span>
                  <span className="text-secondary-400">→</span>
                </Link>
              </div>
            </div>

            {/* Client Relations */}
            <div className="bg-purple-50 border-purple-200 border rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <div className="h-5 w-5 text-white">🏢</div>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-purple-700">
                    Client Relations
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Manage clients and maintain relationships
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/clients" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">View Clients</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/notes" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Client Notes</span>
                  <span className="text-secondary-400">→</span>
                </Link>
              </div>
            </div>

            {/* Automation */}
            <div className="bg-orange-50 border-orange-200 border rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <div className="h-5 w-5 text-white">⚙️</div>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-orange-700">
                    Automation
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Streamline processes with workflows
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/workflows" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Workflows</span>
                  <span className="text-secondary-400">→</span>
                </Link>
              </div>
            </div>

            {/* Analytics & Insights */}
            <div className="bg-indigo-50 border-indigo-200 border rounded-lg p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-500 p-2 rounded-lg">
                  <div className="h-5 w-5 text-white">📊</div>
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-indigo-700">
                    Analytics & Insights
                  </h3>
                  <p className="text-sm text-secondary-600">
                    Track performance and generate reports
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Link href="/reports" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">AI Reports</span>
                  <span className="text-secondary-400">→</span>
                </Link>
                <Link href="/analytics" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                  <span className="text-sm font-medium text-secondary-700">Analytics</span>
                  <span className="text-secondary-400">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/candidates/new"
              className="flex items-center p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <UserPlus className="h-5 w-5 text-primary-600 mr-3" />
              <span className="font-medium text-secondary-900">Add Candidate</span>
              <ChevronRight className="h-4 w-4 text-secondary-400 ml-auto group-hover:text-primary-600 transition-colors" />
            </Link>
            
            <Link
              href="/jobs"
              className="flex items-center p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <Plus className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-secondary-900">Create Job</span>
              <ChevronRight className="h-4 w-4 text-secondary-400 ml-auto group-hover:text-green-600 transition-colors" />
            </Link>
            
            <Link
              href="/ai-tools"
              className="flex items-center p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <Brain className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium text-secondary-900">AI Tools</span>
              <ChevronRight className="h-4 w-4 text-secondary-400 ml-auto group-hover:text-purple-600 transition-colors" />
            </Link>
            
            <Link
              href="/reports"
              className="flex items-center p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-all duration-200 group"
            >
              <FileText className="h-5 w-5 text-orange-600 mr-3" />
              <span className="font-medium text-secondary-900">Generate Report</span>
              <ChevronRight className="h-4 w-4 text-secondary-400 ml-auto group-hover:text-orange-600 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-secondary-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  New candidate added: Sarah Chen
                </p>
                <p className="text-xs text-secondary-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  Job posted: Senior Frontend Developer
                </p>
                <p className="text-xs text-secondary-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-secondary-900">
                  AI report generated for TechCorp client
                </p>
                <p className="text-xs text-secondary-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 