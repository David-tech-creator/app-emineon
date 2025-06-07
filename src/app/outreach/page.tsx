'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
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
  Zap,
  ArrowUpRight,
  BarChart3,
  Activity,
  Globe,
  Shield,
  Star,
  Sparkles
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

  const outreachMetrics = [
    { label: 'Active Campaigns', value: '12', icon: Activity, color: 'teal' },
    { label: 'Response Rate', value: '23%', icon: TrendingUp, color: 'primary' },
    { label: 'Messages Sent', value: '1.2k', icon: Send, color: 'accent' },
    { label: 'Meetings Booked', value: '47', icon: Calendar, color: 'secondary' }
  ];

  const campaignTemplates = [
    {
      name: 'Executive Outreach',
      description: 'High-touch sequences for C-level executives',
      channels: ['email', 'linkedin'],
      steps: 5,
      responseRate: '18%',
      color: 'primary'
    },
    {
      name: 'Technical Talent',
      description: 'Developer-focused messaging with technical depth',
      channels: ['email', 'github'],
      steps: 4,
      responseRate: '25%',
      color: 'teal'
    },
    {
      name: 'Passive Candidates',
      description: 'Gentle nurturing for passive talent',
      channels: ['email', 'linkedin', 'phone'],
      steps: 6,
      responseRate: '15%',
      color: 'accent'
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
                    <Globe className="h-4 w-4 mr-2" />
                    Multi-Channel Intelligence
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Shield className="h-4 w-4 mr-2" />
                    GDPR Compliant
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Global Delivery
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  Smart Outreach Platform
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Orchestrate personalized, multi-channel campaigns that convert prospects into conversations
                </p>
                
                <div className="grid grid-cols-3 gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">23%</div>
                    <div className="text-sm text-blue-200">Response Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">1.2k</div>
                    <div className="text-sm text-blue-200">Messages Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">47</div>
                    <div className="text-sm text-blue-200">Meetings Booked</div>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <Send className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {outreachMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
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

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="border-b border-neutral-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'campaigns', label: 'Active Campaigns', icon: Activity },
                { id: 'sequences', label: 'Sequence Builder', icon: Settings },
                { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
                { id: 'templates', label: 'Message Templates', icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'campaigns' && (
              <div className="space-y-6">
                {/* Campaign Templates */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">Campaign Templates</h3>
                      <p className="text-neutral-600">Pre-built sequences optimized for different scenarios</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {campaignTemplates.map((template, index) => (
                      <div key={index} className="border border-neutral-200 rounded-xl p-6 hover:shadow-medium transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-2 rounded-lg bg-${template.color}-50`}>
                            <Target className={`h-5 w-5 text-${template.color}-600`} />
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700`}>
                            {template.responseRate} response
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-neutral-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-neutral-600 mb-4">{template.description}</p>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-500">Steps:</span>
                            <span className="font-medium text-neutral-900">{template.steps}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-neutral-500 text-sm">Channels:</span>
                            <div className="flex space-x-1">
                              {template.channels.map((channel, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                                  {channel}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <button className="w-full py-2 px-4 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors group-hover:bg-primary-50 group-hover:text-primary-700">
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Campaigns */}
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-4">Active Campaigns</h3>
                  <div className="space-y-4">
                    {sequences.map((campaign) => (
                      <div key={campaign.id} className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${campaign.status === 'active' ? 'bg-success-50' : 'bg-neutral-100'}`}>
                              {campaign.status === 'active' ? (
                                <Play className="h-5 w-5 text-success-600" />
                              ) : (
                                <Pause className="h-5 w-5 text-neutral-600" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-neutral-900">{campaign.name}</h4>
                              <p className="text-sm text-neutral-600">{campaign.prospects} prospects • {campaign.steps.length} steps</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="text-sm font-medium text-neutral-900">{campaign.performance.replyRate}% response</p>
                              <p className="text-xs text-neutral-500">{campaign.replied} replied</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(campaign.replied / campaign.prospects) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-neutral-600">
                          <span>{campaign.replied} of {campaign.prospects} replied</span>
                          <span>Next send: {campaign.steps[0].delay} hours</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tab content would follow similar pattern */}
          </div>
        </div>

        {/* Intelligence Features */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Platform Intelligence</h3>
            <p className="text-sm text-neutral-600">Advanced features that make your outreach more effective</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Behavioral Triggers', description: 'Automatically adjust sequence based on prospect actions', icon: Zap },
                { title: 'Optimal Timing', description: 'AI determines the best time to send each message', icon: Clock },
                { title: 'Personalization at Scale', description: 'Dynamic content insertion for thousands of prospects', icon: Users },
                { title: 'Multi-Channel Sync', description: 'Coordinate across email, LinkedIn, and phone', icon: Globe }
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