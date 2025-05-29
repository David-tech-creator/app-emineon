'use client';

import { useState } from 'react';
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
  Edit
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

  const reportTemplates = [
    {
      id: 'client-update',
      name: 'Client Update Report',
      description: 'Monthly/quarterly updates for clients with placements, metrics, and market insights',
      icon: Users,
      estimatedTime: '5 minutes'
    },
    {
      id: 'candidate-presentation',
      name: 'Candidate Presentation',
      description: 'Professional candidate profiles with skills assessment and cultural fit analysis',
      icon: FileText,
      estimatedTime: '3 minutes'
    },
    {
      id: 'market-analysis',
      name: 'Market Analysis',
      description: 'Industry trends, salary benchmarks, and talent availability reports',
      icon: TrendingUp,
      estimatedTime: '8 minutes'
    },
    {
      id: 'performance-review',
      name: 'Performance Review',
      description: 'Internal performance metrics, ROI analysis, and process optimization',
      icon: BarChart3,
      estimatedTime: '6 minutes'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'shared':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
          <BarChart3 className="h-8 w-8 text-primary-600 mr-3" />
          AI Report Generator
        </h1>
        <p className="mt-2 text-lg text-secondary-600">
          Create professional reports and presentations in minutes with AI
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Reports Generated</p>
              <p className="text-2xl font-bold text-secondary-900">47</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">+12 this month</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Time Saved</p>
              <p className="text-2xl font-bold text-secondary-900">38h</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">vs manual creation</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Client Satisfaction</p>
              <p className="text-2xl font-bold text-secondary-900">4.8</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">Avg rating</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Shared Reports</p>
              <p className="text-2xl font-bold text-secondary-900">31</p>
            </div>
            <Share className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-blue-600">This quarter</div>
        </div>
      </div>

      {/* AI Report Generator */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">AI Report Generator</h2>
              <p className="text-sm text-secondary-600">
                Generate professional reports automatically using your recruitment data
              </p>
            </div>
          </div>
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {reportTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedReportType(template.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedReportType === template.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <template.icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-secondary-900 text-sm">
                  {template.name}
                </h3>
              </div>
              <p className="text-xs text-secondary-600 mb-2">{template.description}</p>
              <div className="flex items-center text-xs text-blue-600">
                <Clock className="h-3 w-3 mr-1" />
                {template.estimatedTime}
              </div>
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={generateAIReport}
            disabled={isGenerating}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Report...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </button>
          <p className="text-sm text-secondary-600">
            AI will analyze your data and create a professional report in minutes
          </p>
        </div>
      </div>

      {/* Generated Report Preview */}
      {generatedReport && (
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-secondary-900">
              Generated Report Preview
            </h2>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Send to Client
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">Executive Summary</h3>
              <p className="text-secondary-700">{generatedReport.summary}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{generatedReport.keyMetrics.placements}</div>
                <div className="text-sm text-blue-600">Placements</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{generatedReport.keyMetrics.timeToFill}</div>
                <div className="text-sm text-green-600">Avg Days to Fill</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{generatedReport.keyMetrics.clientSatisfaction}</div>
                <div className="text-sm text-yellow-600">Client Satisfaction</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{generatedReport.keyMetrics.candidateQuality}%</div>
                <div className="text-sm text-purple-600">Quality Score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold text-secondary-900 mb-3">Key Insights</h4>
                <ul className="space-y-2">
                  {generatedReport.insights.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-secondary-700">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-secondary-900 mb-3">Recommendations</h4>
                <ul className="space-y-2">
                  {generatedReport.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start text-sm text-secondary-700">
                      <Target className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing Reports */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-secondary-900">Recent Reports</h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-secondary-200 rounded-lg text-sm hover:bg-secondary-50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                    {report.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-secondary-600">
                <div>Created: {report.createdDate}</div>
                <div>Modified: {report.lastModified}</div>
                {report.recipients && (
                  <div>Recipients: {report.recipients.length}</div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-secondary-900">{report.metrics.pages}</div>
                  <div className="text-xs text-secondary-600">Pages</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-secondary-900">{report.metrics.insights}</div>
                  <div className="text-xs text-secondary-600">Insights</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-secondary-900">{report.metrics.recommendations}</div>
                  <div className="text-xs text-secondary-600">Actions</div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </button>
                <button className="flex items-center px-3 py-2 border border-secondary-200 text-secondary-700 text-sm rounded hover:bg-secondary-50 transition-colors">
                  <Download className="h-4 w-4" />
                </button>
                <button className="flex items-center px-3 py-2 border border-secondary-200 text-secondary-700 text-sm rounded hover:bg-secondary-50 transition-colors">
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 