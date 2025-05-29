'use client';

import { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Calendar, 
  Users, 
  Target,
  Play,
  Pause,
  Settings,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Send,
  Zap
} from 'lucide-react';

interface OutreachSequence {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  prospects: number;
  opened: number;
  replied: number;
  steps: OutreachStep[];
  performance: {
    openRate: number;
    replyRate: number;
    clickRate: number;
  };
}

interface OutreachStep {
  id: string;
  type: 'email' | 'linkedin' | 'whatsapp' | 'call';
  delay: number;
  condition?: 'opened' | 'not_opened' | 'replied' | 'clicked';
  subject?: string;
  content: string;
}

export default function OutreachPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedSequence, setSelectedSequence] = useState<string | null>(null);

  const sequences: OutreachSequence[] = [
    {
      id: '1',
      name: 'Senior Developer Outreach',
      status: 'active',
      prospects: 145,
      opened: 89,
      replied: 23,
      steps: [
        {
          id: 's1',
          type: 'email',
          delay: 0,
          subject: 'Exciting Senior Developer Opportunity',
          content: 'Hi {{first_name}}, I came across your profile and was impressed by your experience at {{company}}...'
        },
        {
          id: 's2',
          type: 'linkedin',
          delay: 3,
          condition: 'not_opened',
          content: 'Hi {{first_name}}, I sent you an email about an exciting opportunity. Would love to connect!'
        },
        {
          id: 's3',
          type: 'email',
          delay: 7,
          condition: 'opened',
          subject: 'Following up on the Senior Developer role',
          content: 'Hi {{first_name}}, I wanted to follow up on my previous email about the senior developer position...'
        }
      ],
      performance: {
        openRate: 61.4,
        replyRate: 15.9,
        clickRate: 8.2
      }
    },
    {
      id: '2',
      name: 'Product Manager Pipeline',
      status: 'active',
      prospects: 78,
      opened: 52,
      replied: 18,
      steps: [
        {
          id: 's1',
          type: 'email',
          delay: 0,
          subject: 'Product Management Leadership Role',
          content: 'Hello {{first_name}}, your product management experience at {{company}} caught my attention...'
        },
        {
          id: 's2',
          type: 'whatsapp',
          delay: 5,
          condition: 'not_opened',
          content: 'Hi {{first_name}}, quick message about a Product Manager opportunity that might interest you.'
        }
      ],
      performance: {
        openRate: 66.7,
        replyRate: 23.1,
        clickRate: 12.8
      }
    },
    {
      id: '3',
      name: 'Client Business Development',
      status: 'paused',
      prospects: 32,
      opened: 15,
      replied: 4,
      steps: [
        {
          id: 's1',
          type: 'email',
          delay: 0,
          subject: 'Partnership Opportunity with Emineon',
          content: 'Dear {{company}} team, I\'d love to discuss how Emineon can help with your hiring needs...'
        }
      ],
      performance: {
        openRate: 46.9,
        replyRate: 12.5,
        clickRate: 6.3
      }
    }
  ];

  const communications = [
    {
      id: '1',
      candidate: 'Emily Chen',
      type: 'email',
      subject: 'Re: Senior Backend Developer Opportunity',
      preview: 'Thanks for reaching out! I\'m definitely interested in learning more about this role...',
      timestamp: '2 hours ago',
      status: 'replied'
    },
    {
      id: '2',
      candidate: 'Michael Rodriguez',
      type: 'linkedin',
      subject: 'Connection Request Accepted',
      preview: 'Hi Sarah, thanks for connecting! I saw your message about the opportunity...',
      timestamp: '4 hours ago',
      status: 'opened'
    },
    {
      id: '3',
      candidate: 'Sarah Johnson',
      type: 'whatsapp',
      subject: 'Product Manager Role',
      preview: 'Hi! Yes, I\'m interested in hearing more about the PM position. When can we chat?',
      timestamp: '1 day ago',
      status: 'replied'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'linkedin':
        return <Users className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
          <Send className="h-8 w-8 text-primary-600 mr-3" />
          Smart Outreach
        </h1>
        <p className="mt-2 text-lg text-secondary-600">
          Multi-channel campaigns that adapt to prospect behavior
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'communications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Communications
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-secondary-900">
                Outreach Campaigns
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {sequences.length} campaigns
              </span>
            </div>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sequences.map((sequence) => (
              <div
                key={sequence.id}
                className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedSequence(sequence.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {sequence.name}
                      </h3>
                      {getStatusIcon(sequence.status)}
                    </div>
                    <p className="text-sm text-secondary-600">
                      {sequence.prospects} prospects • {sequence.steps.length} steps
                    </p>
                  </div>
                  <button className="p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-50">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-900">
                      {sequence.performance.openRate}%
                    </div>
                    <div className="text-xs text-secondary-600">Open Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-900">
                      {sequence.performance.replyRate}%
                    </div>
                    <div className="text-xs text-secondary-600">Reply Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-900">
                      {sequence.performance.clickRate}%
                    </div>
                    <div className="text-xs text-secondary-600">Click Rate</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-600">Progress</span>
                    <span className="text-secondary-900 font-medium">
                      {sequence.replied}/{sequence.prospects} replied
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(sequence.replied / sequence.prospects) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Steps Preview */}
                <div className="mt-4 pt-4 border-t border-secondary-100">
                  <div className="flex items-center space-x-2">
                    {sequence.steps.slice(0, 4).map((step, index) => (
                      <div key={step.id} className="flex items-center">
                        <div className="flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-600 rounded-full">
                          {getTypeIcon(step.type)}
                        </div>
                        {index < Math.min(sequence.steps.length - 1, 3) && (
                          <div className="w-3 h-px bg-secondary-300 mx-1"></div>
                        )}
                      </div>
                    ))}
                    {sequence.steps.length > 4 && (
                      <span className="text-xs text-secondary-500">+{sequence.steps.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communications Tab */}
      {activeTab === 'communications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">
              All Communications
            </h2>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-2 border border-secondary-200 rounded-lg text-sm">
                <option>All Types</option>
                <option>Email</option>
                <option>LinkedIn</option>
                <option>WhatsApp</option>
              </select>
              <select className="px-3 py-2 border border-secondary-200 rounded-lg text-sm">
                <option>All Status</option>
                <option>Replied</option>
                <option>Opened</option>
                <option>Sent</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-secondary-200 rounded-lg">
            {communications.map((comm, index) => (
              <div
                key={comm.id}
                className={`p-4 hover:bg-secondary-50 transition-colors ${
                  index !== communications.length - 1 ? 'border-b border-secondary-100' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(comm.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-secondary-900">
                        {comm.candidate}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comm.status === 'replied' ? 'bg-green-100 text-green-800' :
                        comm.status === 'opened' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 mb-1">{comm.subject}</p>
                    <p className="text-sm text-secondary-500 truncate">{comm.preview}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-secondary-500">{comm.timestamp}</p>
                    <button className="mt-1 text-primary-600 hover:text-primary-800 text-sm">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Outreach Analytics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Total Prospects</p>
                  <p className="text-2xl font-bold text-secondary-900">255</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2 text-sm text-green-600">+18% from last month</div>
            </div>
            
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Avg Open Rate</p>
                  <p className="text-2xl font-bold text-secondary-900">58.3%</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2 text-sm text-green-600">+5.2% from last month</div>
            </div>
            
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Avg Reply Rate</p>
                  <p className="text-2xl font-bold text-secondary-900">17.1%</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2 text-sm text-green-600">+2.8% from last month</div>
            </div>
            
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-secondary-900">3</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div className="mt-2 text-sm text-secondary-600">2 pending review</div>
            </div>
          </div>

          <div className="bg-white border border-secondary-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Performance Trends
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">Email Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">LinkedIn Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">62%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-600">WhatsApp Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-secondary-900">83%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 