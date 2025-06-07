'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Calendar,
  Building2,
  Brain,
  Shield,
  Globe,
  Zap,
  TrendingUp,
  Eye,
  Edit,
  Share,
  Settings,
  CheckCircle,
  Target,
  Star,
  Activity,
  BarChart3,
  Sparkles,
  Award,
  Timer,
  UserCheck,
  ArrowUpRight,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function JobsPage() {
  const jobMetrics = [
    { label: 'Active Jobs', value: '42', icon: Briefcase, color: 'primary' },
    { label: 'Candidates Applied', value: '1.3k', icon: Users, color: 'teal' },
    { label: 'Avg Time to Fill', value: '18 days', icon: Clock, color: 'accent' },
    { label: 'Fill Rate', value: '89%', icon: Target, color: 'secondary' }
  ];

  const jobCategories = [
    {
      title: 'Engineering',
      count: 18,
      icon: Brain,
      color: 'primary',
      avgSalary: '$140k',
      urgency: 'High',
      locations: ['SF', 'NYC', 'Remote']
    },
    {
      title: 'Product',
      count: 8,
      icon: Target,
      color: 'teal',
      avgSalary: '$130k',
      urgency: 'Medium',
      locations: ['SF', 'LA', 'Austin']
    },
    {
      title: 'Design',
      count: 6,
      icon: Sparkles,
      color: 'accent',
      avgSalary: '$110k',
      urgency: 'Low',
      locations: ['NYC', 'Portland', 'Remote']
    },
    {
      title: 'Marketing',
      count: 10,
      icon: TrendingUp,
      color: 'secondary',
      avgSalary: '$95k',
      urgency: 'Medium',
      locations: ['SF', 'Chicago', 'Remote']
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-primary-600 to-primary-800 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-8 right-40 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    Compliance Ready
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Globe className="h-4 w-4 mr-2" />
                    Multi-Platform Posting
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Brain className="h-4 w-4 mr-2" />
                    Auto-Optimization
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  Intelligent Job Board
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Create, distribute, and optimize job opportunities with AI-powered insights
                </p>
                
                <div className="grid grid-cols-4 gap-6 pt-4">
                  {jobMetrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-white">{metric.value}</div>
                      <div className="text-sm text-blue-200">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <Briefcase className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {jobMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-50`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                  <p className="text-sm text-neutral-600">{metric.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-8 shadow-soft">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Button>
            </div>
          </div>
        </div>

        {/* Job Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Job Categories</h2>
              <p className="text-neutral-600">Overview of your open positions by department</p>
            </div>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {jobCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-medium transition-all duration-300 group">
                {/* Category Header */}
                <div className="bg-primary-800 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{category.title}</h3>
                        <p className="text-white/80 text-sm">{category.count} open positions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/90 text-sm">Urgency</div>
                      <div className={`text-white font-bold px-2 py-1 rounded-full text-xs ${
                        category.urgency === 'High' ? 'bg-red-500/20' :
                        category.urgency === 'Medium' ? 'bg-yellow-500/20' :
                        'bg-green-500/20'
                      }`}>
                        {category.urgency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-neutral-600">Avg Salary</div>
                    <div className="text-lg font-bold text-neutral-900">{category.avgSalary}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-neutral-600 mb-2">Locations</div>
                    <div className="flex flex-wrap gap-2">
                      {category.locations.map((location, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View Jobs
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Active Job Postings</h3>
                <p className="text-sm text-neutral-600">Currently open positions and their performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Job
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { 
                  title: 'Senior React Developer', 
                  company: 'TechCorp Inc.',
                  location: 'San Francisco, CA',
                  salary: '$140k - $180k',
                  posted: '3 days ago',
                  applications: 47,
                  views: 1200,
                  status: 'Active'
                },
                { 
                  title: 'Product Manager', 
                  company: 'StartupX',
                  location: 'Remote',
                  salary: '$120k - $150k',
                  posted: '1 week ago',
                  applications: 89,
                  views: 2300,
                  status: 'Hot'
                },
                { 
                  title: 'UX Designer', 
                  company: 'Design Studio',
                  location: 'New York, NY',
                  salary: '$95k - $120k',
                  posted: '5 days ago',
                  applications: 34,
                  views: 890,
                  status: 'Active'
                },
                { 
                  title: 'Data Scientist', 
                  company: 'Analytics Pro',
                  location: 'Austin, TX',
                  salary: '$130k - $160k',
                  posted: '2 days ago',
                  applications: 23,
                  views: 450,
                  status: 'Urgent'
                }
              ].map((job, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{job.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-2">
                        <span className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          {job.company}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {job.salary}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-neutral-400">
                        <span>{job.applications} applications</span>
                        <span>•</span>
                        <span>{job.views} views</span>
                        <span>•</span>
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Hot' ? 'bg-accent-100 text-accent-700' : 
                      job.status === 'Urgent' ? 'bg-red-100 text-red-700' :
                      'bg-success-100 text-success-700'
                    }`}>
                      {job.status}
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <Share className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { 
              title: 'Job Templates', 
              description: 'Use pre-built templates for faster job creation',
              icon: Copy,
              color: 'primary',
              action: 'Browse Templates'
            },
            { 
              title: 'Multi-Platform Posting', 
              description: 'Post to LinkedIn, Indeed, and other job boards',
              icon: ExternalLink,
              color: 'teal',
              action: 'Configure Channels'
            },
            { 
              title: 'Performance Analytics', 
              description: 'Track application rates and optimization opportunities',
              icon: BarChart3,
              color: 'accent',
              action: 'View Reports'
            }
          ].map((action, index) => (
            <div key={index} className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-medium transition-all duration-300 group">
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-${action.color}-50 rounded-xl mb-4`}>
                <action.icon className={`h-6 w-6 text-${action.color}-600`} />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{action.title}</h3>
              <p className="text-sm text-neutral-600 mb-4">{action.description}</p>
              <Button variant="outline" className="w-full">
                {action.action}
              </Button>
            </div>
          ))}
        </div>

        {/* AI Features */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">AI-Powered Features</h3>
            <p className="text-sm text-neutral-600">Intelligent tools to optimize your job postings and hiring process</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Smart Job Writing', description: 'AI helps create compelling job descriptions', icon: Brain },
                { title: 'Salary Optimization', description: 'Get market-competitive salary recommendations', icon: DollarSign },
                { title: 'Application Scoring', description: 'AI ranks candidates automatically', icon: Star },
                { title: 'Performance Insights', description: 'Optimize postings based on data', icon: TrendingUp }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{feature.title}</h4>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 