'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  VideoIcon, Calendar, Users, Settings, BarChart3, 
  UserCheck, Clock, Globe, Brain, Star, Award, 
  MessageSquare, Shield, Plus, CheckCircle, Filter,
  Eye, Download, Sparkles, Target, Play, Search, MoreVertical, User, Badge
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
  const [isLoading] = useState(false);
  const [searchTerm] = useState('');
  const [interviews] = useState([]);

  const interviewMetrics = [
    { label: 'Interviews Conducted', value: '1.2k', icon: VideoIcon, color: 'primary' },
    { label: 'AI Assessments', value: '892', icon: Brain, color: 'teal' },
    { label: 'Avg Rating', value: '4.7', icon: Star, color: 'accent' },
    { label: 'Time Saved', value: '180hrs', icon: Clock, color: 'secondary' }
  ];

  const interviewTemplates = [
    {
      title: 'Technical Assessment',
      description: 'Comprehensive evaluation for technical roles',
      icon: Brain,
      color: 'primary',
      duration: '45-60 min',
      features: ['Code review', 'Problem solving', 'Technical depth', 'System design']
    },
    {
      title: 'Cultural Fit Interview',
      description: 'Assess alignment with company values',
      icon: Users,
      color: 'teal',
      duration: '30-45 min',
      features: ['Values alignment', 'Team dynamics', 'Communication style', 'Growth mindset']
    },
    {
      title: 'Leadership Evaluation',
      description: 'Executive and management role assessment',
      icon: Award,
      color: 'accent',
      duration: '60-90 min',
      features: ['Strategic thinking', 'Team leadership', 'Decision making', 'Vision casting']
    },
    {
      title: 'Behavioral Interview',
      description: 'STAR method competency evaluation',
      icon: MessageSquare,
      color: 'secondary',
      duration: '30-45 min',
      features: ['Past experience', 'Conflict resolution', 'Achievement stories', 'Adaptability']
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
                    GDPR Compliant
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Globe className="h-4 w-4 mr-2" />
                    Global Accessibility
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Brain className="h-4 w-4 mr-2" />
                    Real-time Analysis
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  AI-Enhanced Video Interviews
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Conduct intelligent interviews with real-time AI insights and automated analysis
                </p>
                
                <div className="grid grid-cols-4 gap-6 pt-4">
                  {interviewMetrics.map((metric, index) => (
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
                    <VideoIcon className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {interviewMetrics.map((metric, index) => (
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

        {/* Interview Templates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Interview Templates</h2>
              <p className="text-neutral-600">Structured frameworks for consistent and effective interviews</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {interviewTemplates.map((template, index) => (
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
                      <div className="text-white/90 text-sm">Duration</div>
                      <div className="text-white font-bold">{template.duration}</div>
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
                    <Button variant="outline" className="flex-1">
                      Use Template
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Upcoming Interviews</h3>
                <p className="text-sm text-neutral-600">Scheduled interviews and their current status</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { 
                  candidate: 'Sarah Chen', 
                  position: 'Senior React Developer', 
                  time: 'Today, 2:00 PM', 
                  type: 'Technical Assessment', 
                  status: 'confirmed',
                  interviewer: 'David Kim'
                },
                { 
                  candidate: 'Marcus Johnson', 
                  position: 'Product Manager', 
                  time: 'Tomorrow, 10:30 AM', 
                  type: 'Cultural Fit Interview', 
                  status: 'pending',
                  interviewer: 'Emily Rodriguez'
                },
                { 
                  candidate: 'Lisa Wang', 
                  position: 'Engineering Director', 
                  time: 'Thursday, 3:00 PM', 
                  type: 'Leadership Evaluation', 
                  status: 'confirmed',
                  interviewer: 'Michael Chen'
                },
                { 
                  candidate: 'Ahmed Hassan', 
                  position: 'UX Designer', 
                  time: 'Friday, 11:00 AM', 
                  type: 'Behavioral Interview', 
                  status: 'rescheduled',
                  interviewer: 'Jennifer Smith'
                }
              ].map((interview, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <UserCheck className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900">{interview.candidate}</h4>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500">
                        <span>{interview.position}</span>
                        <span>•</span>
                        <span>{interview.type}</span>
                        <span>•</span>
                        <span>with {interview.interviewer}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-neutral-900">{interview.time}</div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        interview.status === 'confirmed' ? 'bg-success-100 text-success-700' : 
                        interview.status === 'pending' ? 'bg-warning-100 text-warning-700' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {interview.status}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <VideoIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Recent Interviews</h3>
                <p className="text-sm text-neutral-600">Completed interviews with AI analysis results</p>
              </div>
              <Button>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {[
                { 
                  candidate: 'Alex Thompson', 
                  position: 'Frontend Developer', 
                  completed: '2 hours ago', 
                  score: 8.7, 
                  recommendation: 'Strong Hire',
                  highlights: ['Excellent problem solving', 'Strong React knowledge', 'Good communication']
                },
                { 
                  candidate: 'Maria Gonzalez', 
                  position: 'Data Scientist', 
                  completed: '1 day ago', 
                  score: 9.2, 
                  recommendation: 'Hire',
                  highlights: ['Deep ML expertise', 'Clear explanations', 'Strategic thinking']
                },
                { 
                  candidate: 'Robert Kim', 
                  position: 'DevOps Engineer', 
                  completed: '2 days ago', 
                  score: 7.8, 
                  recommendation: 'Consider',
                  highlights: ['Good technical skills', 'Limited cloud experience', 'Positive attitude']
                }
              ].map((interview, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-success-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">{interview.candidate}</h4>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-2">
                        <span>{interview.position}</span>
                        <span>•</span>
                        <span>{interview.completed}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {interview.highlights.map((highlight, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-neutral-900">{interview.score}/10</div>
                      <div className={`text-sm font-medium ${
                        interview.recommendation === 'Hire' || interview.recommendation === 'Strong Hire' 
                          ? 'text-success-600' : 'text-warning-600'
                      }`}>
                        {interview.recommendation}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-50">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">AI-Powered Features</h3>
            <p className="text-sm text-neutral-600">Advanced capabilities that enhance your interview process</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Real-time Analysis', description: 'AI evaluates responses as they happen', icon: Brain },
                { title: 'Sentiment Detection', description: 'Understand candidate emotions and engagement', icon: Sparkles },
                { title: 'Question Optimization', description: 'AI suggests follow-up questions dynamically', icon: MessageSquare },
                { title: 'Performance Scoring', description: 'Automated scoring with detailed explanations', icon: Target }
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