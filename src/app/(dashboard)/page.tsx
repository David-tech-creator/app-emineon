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
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';

const megaCategories = [
  {
    name: 'Talent Management',
    description: 'Manage candidates, assessments, and interviews',
    icon: Users,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    items: [
      { name: 'View Candidates', href: '/candidates', icon: Users },
      { name: 'Add Candidate', href: '/candidates/new', icon: UserPlus },
      { name: 'Assessments', href: '/assessments', icon: ClipboardList },
      { name: 'Video Interviews', href: '/video-interviews', icon: Video },
    ]
  },
  {
    name: 'Job Management',
    description: 'Create, distribute, and manage job postings',
    icon: Briefcase,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    items: [
      { name: 'View Jobs', href: '/jobs', icon: Briefcase },
      { name: 'Job Distribution', href: '/job-distribution', icon: Brain },
      { name: 'AI Tools', href: '/ai-tools', icon: Brain },
    ]
  },
  {
    name: 'Client Relations',
    description: 'Manage clients and maintain relationships',
    icon: Building2,
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    items: [
      { name: 'View Clients', href: '/clients', icon: Building2 },
      { name: 'Client Notes', href: '/notes', icon: FileText },
    ]
  },
  {
    name: 'Automation',
    description: 'Streamline processes with workflows',
    icon: Workflow,
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    items: [
      { name: 'Workflows', href: '/workflows', icon: Workflow },
    ]
  },
  {
    name: 'Analytics & Insights',
    description: 'Track performance and generate reports',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    items: [
      { name: 'Reports', href: '/reports', icon: FileText },
      { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    ]
  },
];

const quickStats = [
  { name: 'Active Candidates', value: '247', change: '+12%', trend: 'up' },
  { name: 'Open Positions', value: '18', change: '+3', trend: 'up' },
  { name: 'Clients', value: '32', change: '0%', trend: 'neutral' },
  { name: 'This Month Placements', value: '8', change: '+2', trend: 'up' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          Welcome to Emineon ATS
        </h1>
        <p className="mt-2 text-lg text-secondary-600">
          Your comprehensive recruitment management platform
        </p>
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
              <a href="/candidates" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">View Candidates</span>
                <span className="text-secondary-400">→</span>
              </a>
              <a href="/candidates/new" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">Add Candidate</span>
                <span className="text-secondary-400">→</span>
              </a>
              <a href="/assessments" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">Assessments</span>
                <span className="text-secondary-400">→</span>
              </a>
              <a href="/video-interviews" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">Video Interviews</span>
                <span className="text-secondary-400">→</span>
              </a>
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
              <a href="/jobs" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">View Jobs</span>
                <span className="text-secondary-400">→</span>
              </a>
              <a href="/job-distribution" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">Job Distribution</span>
                <span className="text-secondary-400">→</span>
              </a>
              <a href="/ai-tools" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">AI Tools</span>
                <span className="text-secondary-400">→</span>
              </a>
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
              <a href="/workflows" className="flex items-center justify-between p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group">
                <span className="text-sm font-medium text-secondary-700">Workflows</span>
                <span className="text-secondary-400">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm text-secondary-700">
                New candidate "Sarah Johnson" added to Software Engineer role
              </span>
            </div>
            <span className="text-xs text-secondary-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-sm text-secondary-700">
                Interview scheduled with Mike Chen for Product Manager position
              </span>
            </div>
            <span className="text-xs text-secondary-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-sm text-secondary-700">
                Technical assessment completed by Alex Rodriguez
              </span>
            </div>
            <span className="text-xs text-secondary-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
} 