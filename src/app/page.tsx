'use client';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { useUser, useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Brain, 
  Workflow, 
  TrendingUp,
  ArrowUpRight,
  Target,
  Zap,
  Shield,
  Globe,
  BarChart3,
  UserCheck,
  Calendar,
  MessageSquare,
  FileText,
  Video,
  ClipboardList,
  Mail,
  Search,
  Settings,
  Quote,
  Sparkles,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  Eye,
  Send,
  ArrowRight,
  Filter,
  MapPin,
  Star,
  Play,
  MoreHorizontal,
  TrendingDown,
  Plus,
  Phone,
  AtSign
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DailyQuote {
  text: string;
  author: string;
  date: string;
}

interface Task {
  id: string;
  title: string;
  type: 'interview' | 'review' | 'follow-up' | 'assessment';
  priority: 'high' | 'medium' | 'low';
  dueTime: string;
  candidate?: string;
  job?: string;
}

interface JobPipeline {
  id: string;
  title: string;
  company: string;
  stages: {
    name: string;
    count: number;
    isBottleneck?: boolean;
  }[];
  totalCandidates: number;
}

interface AICandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  matchPercentage: number;
  skills: string[];
  location: string;
  avatar?: string;
}

// Fallback quotes for when API is unavailable
const fallbackQuotes: DailyQuote[] = [
  {
    text: "The best way to predict the future is to create it.",
    author: "Peter Drucker",
    date: "fallback"
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    date: "fallback"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    date: "fallback"
  },
  {
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    date: "fallback"
  },
  {
    text: "Your network is your net worth.",
    author: "Porter Gale",
    date: "fallback"
  },
  {
    text: "Talent wins games, but teamwork and intelligence win championships.",
    author: "Michael Jordan",
    date: "fallback"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    date: "fallback"
  }
];

export default function Dashboard() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const [dailyQuote, setDailyQuote] = useState<DailyQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);

  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const today = new Date().toDateString();
        const cachedQuote = localStorage.getItem('dailyQuote');
        const cachedDate = localStorage.getItem('dailyQuoteDate');

        // Check if we have a cached quote for today
        if (cachedQuote && cachedDate === today) {
          setDailyQuote(JSON.parse(cachedQuote));
          setIsLoadingQuote(false);
          return;
        }

        // Try to fetch from API
        const response = await fetch('/api/daily-quote');
        if (response.ok) {
          const quote = await response.json();
          setDailyQuote(quote);
          localStorage.setItem('dailyQuote', JSON.stringify(quote));
          localStorage.setItem('dailyQuoteDate', today);
        } else {
          throw new Error('API unavailable');
        }
      } catch (error) {
        console.log('Using fallback quote');
        // Use fallback quote based on day of year for consistency
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const fallbackQuote = fallbackQuotes[dayOfYear % fallbackQuotes.length];
        setDailyQuote(fallbackQuote);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    fetchDailyQuote();
  }, []);

  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Sample data - in real app, this would come from APIs
  const alerts = [
    { id: 1, type: 'interview', message: '3 interviews scheduled today', priority: 'high' },
    { id: 2, type: 'review', message: '5 pending candidate reviews', priority: 'medium' },
    { id: 3, type: 'follow-up', message: '8 follow-ups due', priority: 'medium' }
  ];

  const kpiData = [
    {
      title: 'Average Time to Hire',
      value: '18 days',
      change: '-2 days',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'teal'
    },
    {
      title: 'New Applicants (24h)',
      value: '47',
      change: '+23%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Outreach Response Rate',
      value: '34%',
      change: '+8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
      color: 'accent'
    },
    {
      title: 'AI-Suggested Candidates',
      value: '127',
      change: '+15',
      changeType: 'positive' as const,
      icon: Brain,
      color: 'secondary'
    }
  ];

  const jobPipelines: JobPipeline[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechCorp',
      totalCandidates: 34,
      stages: [
        { name: 'Applied', count: 12 },
        { name: 'Screening', count: 8, isBottleneck: true },
        { name: 'Interview', count: 6 },
        { name: 'Final', count: 3 },
        { name: 'Offer', count: 1 }
      ]
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupCo',
      totalCandidates: 28,
      stages: [
        { name: 'Applied', count: 15 },
        { name: 'Screening', count: 7 },
        { name: 'Interview', count: 4 },
        { name: 'Final', count: 2 },
        { name: 'Offer', count: 0 }
      ]
    },
    {
      id: '3',
      title: 'Data Scientist',
      company: 'DataTech',
      totalCandidates: 19,
      stages: [
        { name: 'Applied', count: 8 },
        { name: 'Screening', count: 5 },
        { name: 'Interview', count: 4 },
        { name: 'Final', count: 2 },
        { name: 'Offer', count: 0 }
      ]
    }
  ];

  const todaysTasks: Task[] = [
    {
      id: '1',
      title: 'Interview with Sarah Chen',
      type: 'interview',
      priority: 'high',
      dueTime: '10:00 AM',
      candidate: 'Sarah Chen',
      job: 'Senior React Developer'
    },
    {
      id: '2',
      title: 'Review assessment results',
      type: 'review',
      priority: 'medium',
      dueTime: '2:00 PM',
      candidate: 'Michael Rodriguez'
    },
    {
      id: '3',
      title: 'Follow up with TechCorp',
      type: 'follow-up',
      priority: 'medium',
      dueTime: '4:00 PM',
      job: 'Senior React Developer'
    },
    {
      id: '4',
      title: 'Technical assessment review',
      type: 'assessment',
      priority: 'low',
      dueTime: '5:00 PM',
      candidate: 'Emily Watson'
    }
  ];

  const aiSuggestions: AICandidate[] = [
    {
      id: '1',
      name: 'Alex Thompson',
      title: 'Senior Frontend Developer',
      company: 'Google',
      matchPercentage: 94,
      skills: ['React', 'TypeScript', 'Node.js'],
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Maria Gonzalez',
      title: 'Product Manager',
      company: 'Meta',
      matchPercentage: 89,
      skills: ['Product Strategy', 'Analytics', 'Leadership'],
      location: 'New York, NY'
    },
    {
      id: '3',
      name: 'James Wilson',
      title: 'Data Scientist',
      company: 'Netflix',
      matchPercentage: 87,
      skills: ['Python', 'Machine Learning', 'SQL'],
      location: 'Los Angeles, CA'
    }
  ];

  const outreachData = [
    { day: 'Mon', sent: 45, responses: 12 },
    { day: 'Tue', sent: 38, responses: 15 },
    { day: 'Wed', sent: 52, responses: 18 },
    { day: 'Thu', sent: 41, responses: 14 },
    { day: 'Fri', sent: 48, responses: 19 },
    { day: 'Sat', sent: 23, responses: 8 },
    { day: 'Sun', sent: 15, responses: 5 }
  ];

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'interview': return Video;
      case 'review': return ClipboardList;
      case 'follow-up': return Phone;
      case 'assessment': return FileText;
      default: return CheckCircle;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-teal-600 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-8 right-40 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {/* Date and Welcome Message */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-2" />
                      {currentDate}
                    </div>
                    {alerts.length > 0 && (
                      <div className="inline-flex items-center px-3 py-2 bg-red-500/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        <Bell className="h-4 w-4 mr-2" />
                        {alerts.length} alerts
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                    Welcome back, {user?.firstName || 'User'}
                  </h1>
                  
                  {/* Daily Quote */}
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    {isLoadingQuote ? (
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-5 h-5 text-blue-200 animate-pulse" />
                        <span className="text-blue-100">Loading today's inspiration...</span>
                      </div>
                    ) : dailyQuote ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <Quote className="w-5 h-5 text-blue-200 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-blue-50 italic text-lg leading-relaxed">
                              "{dailyQuote.text}"
                            </p>
                            <p className="text-blue-200 text-sm mt-2">
                              — {dailyQuote.author}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Quote className="w-5 h-5 text-blue-200" />
                        <span className="text-blue-100">Quote unavailable today</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Organization Info */}
                {organization && (
                  <div className="inline-flex items-center px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl text-white text-sm font-medium border border-white/20">
                    <Building2 className="h-4 w-4 mr-2" />
                    {organization.name}
                  </div>
                )}
              </div>
              
              {/* Right Side - Large Logo/Graphic */}
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="relative w-25 h-25">
                    <Image
                      src="/images/logos/Emineon logo_tree_white.png"
                      alt="Emineon Intelligence"
                      width={100}
                      height={100}
                      className="object-contain opacity-90"
                      onError={(e) => {
                        e.currentTarget.src = "/images/logos/Emineon logo_no background.png";
                      }}
                    />
                  </div>
                  {/* Glowing Animation Ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white rounded-2xl p-4 shadow-soft border border-neutral-200 hover:shadow-medium transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      alert.priority === 'high' ? 'bg-red-50 text-red-600' :
                      alert.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {alert.type === 'interview' && <Video className="h-4 w-4" />}
                      {alert.type === 'review' && <ClipboardList className="h-4 w-4" />}
                      {alert.type === 'follow-up' && <Phone className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{alert.message}</p>
                      <p className="text-xs text-neutral-500 capitalize">{alert.priority} priority</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${kpi.color}-50`}>
                  <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  kpi.changeType === 'positive' ? 'bg-success-50 text-success-700' :
                  kpi.changeType === 'negative' ? 'bg-error-50 text-error-700' :
                  'bg-neutral-100 text-neutral-600'
                }`}>
                  {kpi.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {kpi.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Job Pipelines Overview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Active Job Pipelines</h3>
                  <p className="text-sm text-neutral-600">Top 3 jobs with candidate flow</p>
                </div>
                <Link href="/jobs">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {jobPipelines.map((job) => (
                <div key={job.id} className="border border-neutral-100 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-neutral-900">{job.title}</h4>
                      <p className="text-sm text-neutral-600">{job.company} • {job.totalCandidates} total candidates</p>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                  <div className="flex space-x-2">
                    {job.stages.map((stage, idx) => (
                      <div key={idx} className="flex-1">
                        <div className={`text-center p-3 rounded-lg border ${
                          stage.isBottleneck ? 'bg-red-50 border-red-200' : 'bg-neutral-50 border-neutral-200'
                        }`}>
                          <div className={`text-lg font-bold ${
                            stage.isBottleneck ? 'text-red-600' : 'text-neutral-900'
                          }`}>
                            {stage.count}
                          </div>
                          <div className={`text-xs ${
                            stage.isBottleneck ? 'text-red-600' : 'text-neutral-600'
                          }`}>
                            {stage.name}
                            {stage.isBottleneck && (
                              <AlertTriangle className="h-3 w-3 inline ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Today's Tasks</h3>
                  <p className="text-sm text-neutral-600">{todaysTasks.length} items pending</p>
                </div>
                <Link href="/tasks">
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {todaysTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.type);
                  return (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <TaskIcon className="h-4 w-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-neutral-900 truncate">{task.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">{task.dueTime}</p>
                        {task.candidate && (
                          <p className="text-xs text-neutral-500 mt-1">{task.candidate}</p>
                        )}
                      </div>
                      <button className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Link href="/tasks">
                  <Button variant="outline" fullWidth>
                    View All Tasks
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Outreach Summary & AI Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Outreach Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Outreach Summary</h3>
                  <p className="text-sm text-neutral-600">Last 7 days performance</p>
                </div>
                <Link href="/outreach">
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Launch Campaign
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {/* Mini Sparkline Chart */}
              <div className="mb-4">
                <div className="flex items-end space-x-1 h-16">
                  {outreachData.map((day, index) => (
                    <div key={day.day} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-primary-500 rounded-t-sm relative"
                        style={{ height: `${(day.responses / 20) * 100}%` }}
                      >
                        <div 
                          className="bg-primary-200 rounded-t-sm absolute bottom-0 w-full"
                          style={{ height: `${(day.sent / 60) * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-neutral-600 text-center mt-1">
                        {day.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">34%</div>
                  <div className="text-sm text-neutral-600">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neutral-900">262</div>
                  <div className="text-sm text-neutral-600">Messages Sent</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 bg-primary-500 rounded"></div>
                  <span className="text-neutral-600">Responses</span>
                  <div className="w-3 h-3 bg-primary-200 rounded ml-4"></div>
                  <span className="text-neutral-600">Sent</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">AI Candidate Suggestions</h3>
                  <p className="text-sm text-neutral-600">High-match candidates for active roles</p>
                </div>
                <Link href="/ai-tools">
                  <Button>
                    <Brain className="h-4 w-4 mr-2" />
                    AI Tools
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {aiSuggestions.map((candidate) => (
                  <div key={candidate.id} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-neutral-900 truncate">{candidate.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm font-bold text-success-600">{candidate.matchPercentage}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600 mb-1">{candidate.title} at {candidate.company}</p>
                      <div className="flex items-center space-x-2 text-xs text-neutral-500">
                        <MapPin className="h-3 w-3" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {candidate.skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <span className="text-xs text-neutral-500">+{candidate.skills.length - 2} more</span>
                        )}
                      </div>
                    </div>
                    <Link href={`/candidates/${candidate.id}`}>
                      <button className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <Link href="/ai-tools">
                  <Button variant="outline" fullWidth>
                    <Search className="h-4 w-4 mr-2" />
                    Explore More Suggestions
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Module Navigation (Existing) */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Quick Access</h3>
            <p className="text-sm text-neutral-600">Jump to any module in your platform</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Candidates', href: '/candidates', icon: Users, color: 'teal' },
                { label: 'Jobs', href: '/jobs', icon: Briefcase, color: 'primary' },
                { label: 'Clients', href: '/clients', icon: Building2, color: 'accent' },
                { label: 'Analytics', href: '/analytics', icon: BarChart3, color: 'secondary' },
                { label: 'AI Tools', href: '/ai-tools', icon: Brain, color: 'primary' },
                { label: 'Reports', href: '/reports', icon: FileText, color: 'teal' }
              ].map((item, index) => (
                <Link key={index} href={item.href}>
                  <div className="flex flex-col items-center p-4 rounded-xl hover:bg-neutral-50 transition-all duration-200 group text-center">
                    <div className={`p-3 rounded-xl bg-${item.color}-50 group-hover:bg-${item.color}-100 transition-colors mb-2`}>
                      <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 group-hover:text-neutral-900 transition-colors">
                      {item.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 