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
  AtSign,
  UserPlus,
  CalendarDays,
  Timer,
  Flame,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee,
  Handshake,
  DollarSign,
  Gauge,
  Activity,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardChatbox } from '@/components/dashboard/DashboardChatbox';

interface DailyQuote {
  text: string;
  author: string;
  date: string;
}

interface UrgentItem {
  id: string;
  type: 'sla_breach' | 'interview_today' | 'follow_up_overdue' | 'candidate_waiting' | 'client_deadline';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  dueTime?: string;
  candidate?: string;
  client?: string;
  job?: string;
  action: string;
  href: string;
}

interface PriorityJob {
  id: string;
  title: string;
  client: string;
  status: 'urgent' | 'at_risk' | 'on_track' | 'stalled';
  daysToSLA: number;
  candidatesInPipeline: number;
  lastActivity: string;
  bottleneck?: string;
  nextAction: string;
}

interface RecentActivity {
  id: string;
  type: 'candidate_applied' | 'interview_completed' | 'offer_sent' | 'client_feedback' | 'assessment_submitted';
  title: string;
  description: string;
  time: string;
  candidate?: string;
  job?: string;
  client?: string;
  href: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
  href?: string;
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
          const apiResponse = await response.json();
          // Extract the quote from the nested API response structure
          const quoteData = {
            text: apiResponse.data.quote.text,
            author: apiResponse.data.quote.author,
            date: apiResponse.data.date
          };
          setDailyQuote(quoteData);
          localStorage.setItem('dailyQuote', JSON.stringify(quoteData));
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

  // Sample urgent items that need immediate attention
  const urgentItems: UrgentItem[] = [
    {
      id: '1',
      type: 'sla_breach',
      title: 'SLA Breach Alert',
      description: 'Senior React Developer role is 3 days overdue',
      priority: 'critical',
      client: 'TechCorp',
      job: 'Senior React Developer',
      action: 'Review pipeline',
      href: '/jobs/1'
    },
    {
      id: '2',
      type: 'interview_today',
      title: 'Interview in 2 hours',
      description: 'Sarah Chen - Technical Interview',
      priority: 'high',
      dueTime: '2:00 PM',
      candidate: 'Sarah Chen',
      job: 'Frontend Developer',
      action: 'Prepare interview',
      href: '/interviews/1'
    },
    {
      id: '3',
      type: 'candidate_waiting',
      title: 'Candidate awaiting feedback',
      description: 'Michael Rodriguez completed assessment 3 days ago',
      priority: 'high',
      candidate: 'Michael Rodriguez',
      job: 'Product Manager',
      action: 'Provide feedback',
      href: '/candidates/2'
    },
    {
      id: '4',
      type: 'follow_up_overdue',
      title: 'Client follow-up overdue',
      description: 'DataTech - Final decision pending for 5 days',
      priority: 'medium',
      client: 'DataTech',
      job: 'Data Scientist',
      action: 'Contact client',
      href: '/clients/3'
    }
  ];

  // Priority jobs that need attention
  const priorityJobs: PriorityJob[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      client: 'TechCorp',
      status: 'urgent',
      daysToSLA: -3,
      candidatesInPipeline: 8,
      lastActivity: '2 days ago',
      bottleneck: 'Client feedback pending',
      nextAction: 'Follow up with client'
    },
    {
      id: '2',
      title: 'Product Manager',
      client: 'StartupCo',
      status: 'at_risk',
      daysToSLA: 2,
      candidatesInPipeline: 4,
      lastActivity: '1 day ago',
      bottleneck: 'Technical assessment',
      nextAction: 'Schedule assessments'
    },
    {
      id: '3',
      title: 'Data Scientist',
      client: 'DataTech',
      status: 'stalled',
      daysToSLA: 7,
      candidatesInPipeline: 2,
      lastActivity: '5 days ago',
      bottleneck: 'No new candidates',
      nextAction: 'Source candidates'
    },
    {
      id: '4',
      title: 'UX Designer',
      client: 'DesignCorp',
      status: 'on_track',
      daysToSLA: 12,
      candidatesInPipeline: 6,
      lastActivity: 'Today',
      nextAction: 'Review applications'
    }
  ];

  // Recent activity feed
  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'candidate_applied',
      title: 'New application received',
      description: 'Emma Wilson applied for UX Designer',
      time: '15 minutes ago',
      candidate: 'Emma Wilson',
      job: 'UX Designer',
      href: '/candidates/5'
    },
    {
      id: '2',
      type: 'interview_completed',
      title: 'Interview completed',
      description: 'Technical interview with Alex Thompson',
      time: '2 hours ago',
      candidate: 'Alex Thompson',
      job: 'Senior React Developer',
      href: '/interviews/2'
    },
    {
      id: '3',
      type: 'offer_sent',
      title: 'Offer sent',
      description: 'Job offer sent to Maria Gonzalez',
      time: '4 hours ago',
      candidate: 'Maria Gonzalez',
      job: 'Product Manager',
      href: '/offers/1'
    },
    {
      id: '4',
      type: 'client_feedback',
      title: 'Client feedback received',
      description: 'TechCorp provided feedback on 3 candidates',
      time: '6 hours ago',
      client: 'TechCorp',
      job: 'Senior React Developer',
      href: '/jobs/1'
    }
  ];

  // Performance metrics
  const performanceStats: QuickStat[] = [
    {
      label: 'Active Jobs',
      value: 12,
      change: '+3',
      changeType: 'positive',
      icon: Briefcase,
      color: 'blue',
      href: '/jobs'
    },
    {
      label: 'Candidates in Pipeline',
      value: 47,
      change: '+8',
      changeType: 'positive',
      icon: Users,
      color: 'green',
      href: '/candidates'
    },
    {
      label: 'Avg. Time to Fill',
      value: '18d',
      change: '-2d',
      changeType: 'positive',
      icon: Timer,
      color: 'purple',
      href: '/analytics'
    },
    {
      label: 'This Week Placements',
      value: 3,
      change: '+1',
      changeType: 'positive',
      icon: Handshake,
      color: 'orange',
      href: '/reports'
    }
  ];

  const getUrgentItemIcon = (type: UrgentItem['type']) => {
    switch (type) {
      case 'sla_breach': return AlertTriangle;
      case 'interview_today': return Video;
      case 'follow_up_overdue': return Clock;
      case 'candidate_waiting': return Hourglass;
      case 'client_deadline': return Calendar;
      default: return Bell;
    }
  };

  const getUrgentItemColor = (priority: UrgentItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getJobStatusColor = (status: PriorityJob['status']) => {
    switch (status) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'at_risk': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'stalled': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_track': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'candidate_applied': return UserPlus;
      case 'interview_completed': return Video;
      case 'offer_sent': return Send;
      case 'client_feedback': return MessageSquare;
      case 'assessment_submitted': return ClipboardList;
      default: return Activity;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-teal-600 rounded-2xl mb-6">
          <div className="relative px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-2" />
                      {currentDate}
                    </div>
                    {urgentItems.length > 0 && (
                    <div className="inline-flex items-center px-3 py-1 bg-red-500/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                        <Bell className="h-4 w-4 mr-2" />
                        {urgentItems.length} urgent items
                      </div>
                    )}
                  </div>
                  
                <h1 className="text-2xl font-bold text-white leading-tight mb-4">
                    Welcome back, {user?.firstName || 'User'}
                  </h1>
                  
                {/* Daily Quote in Header */}
                <div className="mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
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
                
                {organization && (
                  <div className="inline-flex items-center px-3 py-1 bg-white/15 backdrop-blur-sm rounded-lg text-white text-sm font-medium border border-white/20">
                    <Building2 className="h-4 w-4 mr-2" />
                    {organization.name}
                  </div>
                )}
              </div>
              
              {/* Right Side - Logo */}
              <div className="hidden lg:block ml-6">
                <div className="relative w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Image
                      src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_white_agxlqt.png"
                      alt="Emineon Intelligence"
                    width={48}
                    height={48}
                      className="object-contain opacity-95"
                      onError={(e) => {
                        console.error('Logo failed to load:', e);
                        e.currentTarget.src = "https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_white_agxlqt.png";
                      }}
                    />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Bubble */}
        <div className="mb-6">
          <DashboardChatbox />
        </div>

        {/* 🎯 URGENT ITEMS - Top Priority Section */}
        {urgentItems.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">Needs Immediate Attention</h2>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {urgentItems.filter(item => item.priority === 'critical').length} critical
                </span>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentItems.slice(0, 4).map((item) => {
                const Icon = getUrgentItemIcon(item.type);
                return (
                  <Link key={item.id} href={item.href}>
                    <div className={`p-4 rounded-xl border-2 hover:shadow-lg transition-all duration-200 cursor-pointer ${getUrgentItemColor(item.priority)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/50 rounded-lg">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{item.title}</h3>
                            <p className="text-xs opacity-80">{item.description}</p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 opacity-60" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs flex items-center space-x-3">
                          {item.candidate && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{item.candidate}</span>
                            </span>
                          )}
                          {item.client && (
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-3 w-3" />
                              <span>{item.client}</span>
                            </span>
                          )}
                          {item.dueTime && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{item.dueTime}</span>
                            </span>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                          {item.action}
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 📊 PERFORMANCE OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceStats.map((stat, index) => (
            <Link key={index} href={stat.href || '#'}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  {stat.change && (
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      stat.changeType === 'positive' ? 'bg-green-50 text-green-700' :
                      stat.changeType === 'negative' ? 'bg-red-50 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {stat.change}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 🎯 PRIORITY JOBS & 📈 RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Priority Jobs - Jobs that need attention */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Priority Jobs</h3>
                  <p className="text-sm text-gray-600">Jobs requiring your attention</p>
                </div>
                <Link href="/jobs">
                  <Button variant="outline" size="sm">
                    <Briefcase className="h-4 w-4 mr-2" />
                    All Jobs
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {priorityJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <div className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{job.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getJobStatusColor(job.status)}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{job.client}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${job.daysToSLA < 0 ? 'text-red-600' : job.daysToSLA <= 3 ? 'text-orange-600' : 'text-green-600'}`}>
                          {job.daysToSLA < 0 ? `${Math.abs(job.daysToSLA)}d overdue` : `${job.daysToSLA}d to SLA`}
                        </div>
                        <div className="text-xs text-gray-500">{job.candidatesInPipeline} candidates</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {job.bottleneck && (
                          <span className="flex items-center space-x-1 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{job.bottleneck}</span>
                          </span>
                        )}
                        {!job.bottleneck && <span>Last activity: {job.lastActivity}</span>}
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-6 px-2">
                        {job.nextAction}
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <p className="text-sm text-gray-600">Latest updates across your pipeline</p>
                </div>
                <Link href="/activity">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Link key={activity.id} href={activity.href}>
                    <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          {activity.candidate && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{activity.candidate}</span>
                            </span>
                          )}
                          {activity.client && (
                            <span className="flex items-center space-x-1">
                              <Building2 className="h-3 w-3" />
                              <span>{activity.client}</span>
                            </span>
                          )}
                          {activity.job && (
                            <span className="flex items-center space-x-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{activity.job}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🚀 QUICK ACTIONS - Fast access to common tasks */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">One-click access to your most common tasks</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'AI Copilot', href: '/ai-copilot', icon: Brain, color: 'indigo', description: 'Ask AI about your data' },
                { label: 'Add Candidate', href: '/candidates/new', icon: UserPlus, color: 'blue', description: 'Import or create new candidate' },
                { label: 'Post Job', href: '/jobs/new', icon: Plus, color: 'green', description: 'Create new job posting' },
                { label: 'Schedule Interview', href: '/interviews/new', icon: CalendarDays, color: 'purple', description: 'Book candidate interview' },
                { label: 'Send Email', href: '/communication', icon: Mail, color: 'orange', description: 'Email candidates or clients' },
                { label: 'View Reports', href: '/reports', icon: BarChart3, color: 'teal', description: 'Performance analytics' }
              ].map((action, index) => (
                <Link key={index} href={action.href}>
                  <div className="group flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 text-center border border-gray-100 hover:border-gray-200">
                    <div className={`p-3 rounded-xl bg-${action.color}-50 group-hover:bg-${action.color}-100 transition-colors mb-3`}>
                      <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors mb-1">
                      {action.label}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                      {action.description}
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