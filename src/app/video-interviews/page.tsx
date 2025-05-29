'use client';

import { useState } from 'react';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Mic, 
  MicOff,
  Play, 
  Pause,
  Download,
  Edit,
  Star,
  Plus,
  Settings,
  Brain,
  Zap,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp
} from 'lucide-react';

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  rating?: number;
  hasRecording: boolean;
  hasTranscript: boolean;
  hasAINotes: boolean;
  aiSummary?: string;
  keyInsights?: string[];
  nextSteps?: string[];
  interviewer: string;
}

export default function VideoInterviewsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const interviews: Interview[] = [
    {
      id: '1',
      candidateName: 'Sarah Chen',
      candidateEmail: 'sarah.chen@email.com',
      jobTitle: 'Senior Frontend Developer',
      scheduledDate: 'Today, 2:00 PM',
      duration: 45,
      status: 'scheduled',
      hasRecording: false,
      hasTranscript: false,
      hasAINotes: false,
      interviewer: 'John Smith'
    },
    {
      id: '2',
      candidateName: 'Michael Rodriguez',
      candidateEmail: 'michael.r@email.com',
      jobTitle: 'Product Manager',
      scheduledDate: 'Yesterday, 3:30 PM',
      duration: 60,
      status: 'completed',
      rating: 4,
      hasRecording: true,
      hasTranscript: true,
      hasAINotes: true,
      aiSummary: 'Strong technical background with excellent communication skills. 8+ years experience in product management. Demonstrated leadership at previous roles.',
      keyInsights: [
        '8+ years React/TypeScript experience',
        'Led team of 12 engineers',
        'Excellent problem-solving skills',
        'Strong cultural fit'
      ],
      nextSteps: [
        'Schedule final interview with CTO',
        'Check references',
        'Prepare offer package'
      ],
      interviewer: 'Jane Doe'
    },
    {
      id: '3',
      candidateName: 'Emily Watson',
      candidateEmail: 'emily.watson@email.com',
      jobTitle: 'UX Designer',
      scheduledDate: 'Tomorrow, 10:00 AM',
      duration: 30,
      status: 'scheduled',
      hasRecording: false,
      hasTranscript: false,
      hasAINotes: false,
      interviewer: 'Alex Johnson'
    },
    {
      id: '4',
      candidateName: 'David Kim',
      candidateEmail: 'david.kim@email.com',
      jobTitle: 'Data Scientist',
      scheduledDate: 'Last Week',
      duration: 45,
      status: 'completed',
      rating: 5,
      hasRecording: true,
      hasTranscript: true,
      hasAINotes: true,
      aiSummary: 'Exceptional candidate with deep ML expertise. PhD in Computer Science. Published researcher with practical industry experience.',
      keyInsights: [
        'PhD in Machine Learning',
        '5+ papers published',
        'Experience with production ML systems',
        'Strong analytical thinking'
      ],
      nextSteps: [
        'Extend job offer',
        'Negotiate salary package',
        'Coordinate start date'
      ],
      interviewer: 'Sarah Wilson'
    }
  ];

  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateAINotes = (interviewId: string) => {
    // Simulate AI note generation
    console.log('Generating AI notes for interview:', interviewId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
          <Video className="h-8 w-8 text-primary-600 mr-3" />
          Interview Intelligence
        </h1>
        <p className="mt-2 text-lg text-secondary-600">
          AI-powered interview management with automatic note-taking
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">This Week</p>
              <p className="text-2xl font-bold text-secondary-900">8</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">+3 from last week</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Completion Rate</p>
              <p className="text-2xl font-bold text-secondary-900">94%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">+2% improvement</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Avg Rating</p>
              <p className="text-2xl font-bold text-secondary-900">4.2</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="mt-2 text-sm text-green-600">Above average</div>
        </div>
        
        <div className="bg-white border border-secondary-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">AI Notes Generated</p>
              <p className="text-2xl font-bold text-secondary-900">156</p>
            </div>
            <Brain className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-blue-600">100% automated</div>
        </div>
      </div>

      {/* AI Assistant Toggle */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">AI Interview Assistant</h3>
              <p className="text-sm text-secondary-600">
                Automatic note-taking, candidate insights, and smart recommendations
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showAIAssistant
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-600 border border-purple-600'
            }`}
          >
            {showAIAssistant ? 'Enabled' : 'Enable AI'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Upcoming ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
          >
            Completed ({completedInterviews.length})
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

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-secondary-900">
              Upcoming Interviews
            </h2>
            <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white border border-secondary-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {interview.candidateName}
                    </h3>
                    <p className="text-sm text-secondary-600">{interview.jobTitle}</p>
                    <p className="text-sm text-secondary-500">{interview.candidateEmail}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-secondary-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {interview.scheduledDate}
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {interview.duration} minutes
                  </div>
                  <div className="flex items-center text-sm text-secondary-600">
                    <User className="h-4 w-4 mr-2" />
                    Interviewer: {interview.interviewer}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors">
                    <Video className="h-4 w-4 mr-2" />
                    Join Interview
                  </button>
                  <button className="flex items-center px-3 py-2 border border-secondary-200 text-secondary-700 text-sm rounded hover:bg-secondary-50 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Completed Interviews
          </h2>

          <div className="space-y-4">
            {completedInterviews.map((interview) => (
              <div
                key={interview.id}
                className="bg-white border border-secondary-200 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">
                        {interview.candidateName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                      {interview.rating && (
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < interview.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-secondary-600 mb-1">{interview.jobTitle}</p>
                    <p className="text-sm text-secondary-500">{interview.scheduledDate} • {interview.duration} min</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {interview.hasRecording && (
                      <button className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors">
                        <Play className="h-4 w-4 mr-1" />
                        Recording
                      </button>
                    )}
                    {interview.hasTranscript && (
                      <button className="flex items-center px-3 py-2 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors">
                        <FileText className="h-4 w-4 mr-1" />
                        Transcript
                      </button>
                    )}
                    {interview.hasAINotes && (
                      <button className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 transition-colors">
                        <Brain className="h-4 w-4 mr-1" />
                        AI Notes
                      </button>
                    )}
                  </div>
                </div>

                {interview.aiSummary && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-purple-900 mb-2 flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      AI Summary
                    </h4>
                    <p className="text-sm text-purple-800">{interview.aiSummary}</p>
                  </div>
                )}

                {interview.keyInsights && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-secondary-900 mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {interview.keyInsights.map((insight, index) => (
                          <li key={index} className="text-sm text-secondary-700 flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {interview.nextSteps && (
                      <div>
                        <h4 className="text-sm font-semibold text-secondary-900 mb-2">Next Steps</h4>
                        <ul className="space-y-1">
                          {interview.nextSteps.map((step, index) => (
                            <li key={index} className="text-sm text-secondary-700 flex items-start">
                              <Zap className="h-3 w-3 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-secondary-900">
            Interview Analytics
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Performance Trends
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Show Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-secondary-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900">94%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Avg Duration</span>
                  <span className="text-sm font-medium text-secondary-900">48 min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Avg Rating</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-secondary-900">4.2</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-secondary-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                AI Features Usage
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Auto Note-taking</span>
                  <span className="text-sm font-medium text-green-600">100% adoption</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Transcript Generation</span>
                  <span className="text-sm font-medium text-green-600">98% success rate</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">AI Insights</span>
                  <span className="text-sm font-medium text-blue-600">156 generated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Time Saved</span>
                  <span className="text-sm font-medium text-purple-600">~2.5 hrs/week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 