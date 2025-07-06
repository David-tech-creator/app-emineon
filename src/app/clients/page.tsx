'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, Search, Filter, MoreVertical, 
  Building, Star, TrendingUp, ArrowLeft, 
  FileText, Mail, Phone, MapPin, Globe, 
  Settings, Users2, Briefcase
} from 'lucide-react';

export default function ClientsPage() {
  const clientMetrics = [
    { label: 'Active Clients', value: '48', icon: Building, color: 'primary' },
    { label: 'Open Positions', value: '127', icon: Briefcase, color: 'teal' },
    { label: 'Avg Client Value', value: '$85k', icon: DollarSign, color: 'accent' },
    { label: 'Satisfaction Rate', value: '96%', icon: Star, color: 'secondary' }
  ];

  const clientCategories = [
    {
      title: 'Technology',
      count: 18,
      icon: Brain,
      color: 'primary',
      avgValue: '$120k',
      growth: '+15%',
      positions: ['Engineering', 'Product', 'Data']
    },
    {
      title: 'Financial Services',
      count: 12,
      icon: PieChart,
      color: 'teal',
      avgValue: '$95k',
      growth: '+8%',
      positions: ['Finance', 'Risk', 'Compliance']
    },
    {
      title: 'Healthcare',
      count: 8,
      icon: Handshake,
      color: 'accent',
      avgValue: '$75k',
      growth: '+22%',
      positions: ['Clinical', 'Research', 'Operations']
    },
    {
      title: 'Consulting',
      count: 10,
      icon: Target,
      color: 'secondary',
      avgValue: '$110k',
      growth: '+12%',
      positions: ['Strategy', 'Management', 'Operations']
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
                    Secure Data Handling
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Globe className="h-4 w-4 mr-2" />
                    Global Reach
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Brain className="h-4 w-4 mr-2" />
                    Smart Insights
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  Strategic Client Portal
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Build and nurture lasting partnerships with comprehensive client relationship management
                </p>
                
                <div className="grid grid-cols-4 gap-6 pt-4">
                  {clientMetrics.map((metric, index) => (
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
                    <Building className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {clientMetrics.map((metric, index) => (
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
                  placeholder="Search clients by company name, industry, or contact..."
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
                Add Client
              </Button>
            </div>
          </div>
        </div>

        {/* Client Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Client Portfolio</h2>
              <p className="text-neutral-600">Overview of your client base by industry vertical</p>
            </div>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Portfolio Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {clientCategories.map((category, index) => (
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
                        <p className="text-white/80 text-sm">{category.count} active clients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/90 text-sm">Growth</div>
                      <div className="text-white font-bold">{category.growth}</div>
                    </div>
                  </div>
                </div>

                {/* Category Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-neutral-600">Avg Value</div>
                    <div className="text-lg font-bold text-neutral-900">{category.avgValue}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-neutral-600 mb-2">Key Positions</div>
                    <div className="flex flex-wrap gap-2">
                      {category.positions.map((position, idx) => (
                        <span key={idx} className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="outline" fullWidth>
                    View Clients
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Active Clients</h3>
                <p className="text-sm text-neutral-600">Current engagements and relationship status</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Client
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { 
                  company: 'TechCorp Industries', 
                  industry: 'Technology',
                  contact: 'Sarah Johnson, VP HR',
                  location: 'San Francisco, CA',
                  value: '$240k',
                  positions: 8,
                  status: 'Active',
                  lastContact: '2 days ago'
                },
                { 
                  company: 'Global Finance Group', 
                  industry: 'Financial Services',
                  contact: 'Michael Chen, Director',
                  location: 'New York, NY',
                  value: '$180k',
                  positions: 5,
                  status: 'Proposal Pending',
                  lastContact: '1 week ago'
                },
                { 
                  company: 'HealthTech Solutions', 
                  industry: 'Healthcare',
                  contact: 'Emily Rodriguez, CHRO',
                  location: 'Boston, MA',
                  value: '$150k',
                  positions: 3,
                  status: 'Active',
                  lastContact: '4 days ago'
                },
                { 
                  company: 'Strategy Partners LLC', 
                  industry: 'Consulting',
                  contact: 'David Kim, Managing Partner',
                  location: 'Chicago, IL',
                  value: '$320k',
                  positions: 12,
                  status: 'High Priority',
                  lastContact: '1 day ago'
                }
              ].map((client, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {client.company.split(' ').map(word => word[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{client.company}</h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {client.industry}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          <MapPin className="h-3 w-3 mr-1" />
                          {client.location}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {client.contact}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 bg-success-100 text-success-700 text-sm rounded-full border border-success-200">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {client.value} value
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {client.positions} positions
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          Last contact: {client.lastContact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === 'High Priority' ? 'bg-accent-100 text-accent-700 border border-accent-200' : 
                      client.status === 'Proposal Pending' ? 'bg-warning-100 text-warning-700 border border-warning-200' :
                      'bg-success-100 text-success-700 border border-success-200'
                    }`}>
                      {client.status}
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <Phone className="h-4 w-4" />
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
              title: 'Relationship Mapping', 
              description: 'Visualize and track client relationships and touchpoints',
              icon: Activity,
              color: 'primary',
              action: 'View Map'
            },
            { 
              title: 'Proposal Generator', 
              description: 'Create professional proposals with AI assistance',
              icon: FileText,
              color: 'teal',
              action: 'Generate Proposal'
            },
            { 
              title: 'Performance Reports', 
              description: 'Detailed analytics on client satisfaction and retention',
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
              <Button variant="outline" fullWidth>
                {action.action}
              </Button>
            </div>
          ))}
        </div>

        {/* AI Features */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Client Intelligence</h3>
            <p className="text-sm text-neutral-600">AI-powered insights to strengthen client relationships and drive growth</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Engagement Scoring', description: 'AI-powered client health and satisfaction metrics', icon: Target },
                { title: 'Opportunity Detection', description: 'Identify upselling and expansion opportunities', icon: TrendingUp },
                { title: 'Communication Insights', description: 'Optimize touchpoints and relationship building', icon: MessageSquare },
                { title: 'Retention Prediction', description: 'Early warning system for client risk assessment', icon: Shield }
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