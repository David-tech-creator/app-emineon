'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Briefcase,
  TrendingUp,
  Star,
  Clock,
  Target,
  Brain,
  Sparkles,
  Presentation,
  Mail,
  Share,
  Filter,
  Plus,
  Eye,
  Edit,
  ArrowUpRight,
  Globe,
  Shield,
  Zap,
  Activity,
  CheckCircle
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: 'client' | 'candidate' | 'performance' | 'market';
  status: 'draft' | 'ready' | 'shared';
  createdDate: string;
  lastModified: string;
  recipients?: string[];
  metrics: {
    pages: number;
    insights: number;
    recommendations: number;
  };
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReportType, setSelectedReportType] = useState('client');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const reports: Report[] = [
    {
      id: '1',
      title: 'Q4 2024 Recruitment Performance',
      type: 'performance',
      status: 'ready',
      createdDate: '2024-01-15',
      lastModified: '2024-01-20',
      recipients: ['client@company.com', 'hr@company.com'],
      metrics: {
        pages: 12,
        insights: 8,
        recommendations: 5
      }
    },
    {
      id: '2',
      title: 'Tech Talent Market Analysis',
      type: 'market',
      status: 'ready',
      createdDate: '2024-01-10',
      lastModified: '2024-01-18',
      recipients: ['leadership@company.com'],
      metrics: {
        pages: 15,
        insights: 12,
        recommendations: 7
      }
    },
    {
      id: '3',
      title: 'Monthly Client Update - TechCorp',
      type: 'client',
      status: 'draft',
      createdDate: '2024-01-22',
      lastModified: '2024-01-22',
      metrics: {
        pages: 8,
        insights: 6,
        recommendations: 4
      }
    }
  ];

  const generateAIReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedReport({
        title: 'AI-Generated Client Report',
        summary: 'This month we successfully placed 8 candidates across 5 different roles, with an average time-to-fill of 18 days - 15% faster than industry standard.',
        keyMetrics: {
          placements: 8,
          timeToFill: 18,
          clientSatisfaction: 4.7,
          candidateQuality: 92
        },
        insights: [
          'Senior developer roles showing 40% increase in demand',
          'Remote positions attracting 3x more qualified candidates',
          'Technical assessment scores improved by 23% this quarter'
        ],
        recommendations: [
          'Expand remote job offerings to capture wider talent pool',
          'Implement technical pre-screening for faster placement',
          'Focus on senior-level positions for higher margins'
        ]
      });
      setIsGenerating(false);
    }, 3000);
  };

  const reportMetrics = [
    { label: 'Reports Generated', value: '1.8k', icon: FileText, color: 'teal' },
    { label: 'Client Presentations', value: '127', icon: Presentation, color: 'primary' },
    { label: 'Time Saved', value: '240hrs', icon: Clock, color: 'accent' },
    { label: 'Avg Rating', value: '4.9', icon: Star, color: 'secondary' }
  ];

  const reportTemplates = [
    {
      title: 'Executive Summary',
      description: 'High-level overview for C-suite stakeholders',
      icon: Briefcase,
      color: 'primary',
      usage: '45%',
      features: ['Key metrics', 'Strategic insights', 'Market analysis', 'ROI summary']
    },
    {
      title: 'Candidate Presentation',
      description: 'Detailed profiles for client consideration',
      icon: Users,
      color: 'teal',
      usage: '38%',
      features: ['Skills assessment', 'Cultural fit', 'Interview insights', 'References']
    },
    {
      title: 'Market Intelligence',
      description: 'Industry trends and competitive landscape',
      icon: TrendingUp,
      color: 'accent',
      usage: '25%',
      features: ['Salary benchmarks', 'Skill trends', 'Hiring patterns', 'Forecasting']
    },
    {
      title: 'Performance Analytics',
      description: 'Recruitment efficiency and KPI tracking',
      icon: BarChart3,
      color: 'secondary',
      usage: '32%',
      features: ['Time-to-fill', 'Quality metrics', 'Cost analysis', 'Success rates']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-success-100 text-success-700 border border-success-200';
      case 'draft':
        return 'bg-warning-100 text-warning-700 border border-warning-200';
      case 'shared':
        return 'bg-primary-100 text-primary-700 border border-primary-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border border-neutral-200';
    }
  };

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
                    <Brain className="h-4 w-4 mr-2" />
                    AI-Powered Intelligence
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    Professional Templates
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    One-Click Export
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  Intelligent Report Generator
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Create compelling, data-driven reports that showcase your recruitment impact
                </p>
                
                <div className="grid grid-cols-4 gap-6 pt-4">
                  {reportMetrics.map((metric, index) => (
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
                    <BarChart3 className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {reportMetrics.map((metric, index) => (
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

        {/* Report Templates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Report Templates</h2>
              <p className="text-neutral-600">Professional templates optimized for different stakeholders</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {reportTemplates.map((template, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-medium transition-all duration-300 group">
                {/* Template Header */}
                <div className="bg-primary-800 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <template.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{template.title}</h3>
                        <p className="text-white/80 text-sm">{template.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/90 text-sm">Usage</div>
                      <div className="text-white font-bold">{template.usage}</div>
                    </div>
                  </div>
                </div>

                {/* Template Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {template.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" fullWidth>
                      Use Template
                    </Button>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Recent Reports</h3>
                <p className="text-sm text-neutral-600">Your latest generated reports and presentations</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { title: 'Q4 Talent Market Analysis', type: 'Market Intelligence', created: '2 hours ago', status: 'ready', downloads: 12 },
                { title: 'Senior Developer Shortlist', type: 'Candidate Presentation', created: '5 hours ago', status: 'ready', downloads: 8 },
                { title: 'TechCorp Recruitment Summary', type: 'Executive Summary', created: '1 day ago', status: 'ready', downloads: 15 },
                { title: 'Monthly Performance Review', type: 'Performance Analytics', created: '2 days ago', status: 'generating', downloads: 0 }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900 mb-2">{report.title}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full border border-primary-200">
                          {report.type}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {report.created}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          <Download className="h-3 w-3 mr-1" />
                          {report.downloads} downloads
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      report.status === 'ready' ? 'bg-success-100 text-success-700 border border-success-200' : 'bg-warning-100 text-warning-700 border border-warning-200'
                    }`}>
                      {report.status === 'ready' ? 'Ready' : 'Generating...'}
                    </div>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                      <Share className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">AI-Powered Features</h3>
            <p className="text-sm text-neutral-600">Advanced capabilities that enhance your reporting workflow</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Smart Insights', description: 'AI identifies key trends and patterns in your data', icon: Brain },
                { title: 'Auto-Formatting', description: 'Professional layouts generated automatically', icon: Sparkles },
                { title: 'Data Visualization', description: 'Interactive charts and graphs created instantly', icon: BarChart3 },
                { title: 'Narrative Generation', description: 'AI writes compelling report narratives', icon: FileText }
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