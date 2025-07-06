'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Target,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Star,
  Building2,
  Brain,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  LineChart,
  PieChart,
  AlertTriangle,
  Award
} from 'lucide-react';

export default function AnalyticsPage() {
  const keyMetrics = [
    { label: 'Total Revenue', value: '$2.4M', change: '+12%', icon: DollarSign, color: 'primary', trend: 'up' },
    { label: 'Placements', value: '247', change: '+8%', icon: Users, color: 'teal', trend: 'up' },
    { label: 'Avg Time to Fill', value: '18 days', change: '-15%', icon: Clock, color: 'accent', trend: 'down' },
    { label: 'Client Satisfaction', value: '4.8/5', change: '+3%', icon: Star, color: 'secondary', trend: 'up' }
  ];

  const performanceAreas = [
    {
      title: 'Recruitment Efficiency',
      score: 94,
      icon: Target,
      color: 'primary',
      insights: ['Fast placement times', 'High success rate', 'Quality matches'],
      trend: '+5% this month'
    },
    {
      title: 'Client Relations',
      score: 87,
      icon: Building2,
      color: 'teal',
      insights: ['Strong retention', 'Regular feedback', 'Repeat business'],
      trend: '+2% this month'
    },
    {
      title: 'Candidate Experience',
      score: 92,
      icon: Users,
      color: 'accent',
      insights: ['High engagement', 'Positive reviews', 'Smooth process'],
      trend: '+7% this month'
    },
    {
      title: 'Business Growth',
      score: 89,
      icon: TrendingUp,
      color: 'secondary',
      insights: ['Revenue increase', 'Market expansion', 'Team scaling'],
      trend: '+12% this month'
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
                    <Brain className="h-4 w-4 mr-2" />
                    Business Intelligence
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    AI-Powered Insights
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Target className="h-4 w-4 mr-2" />
                    Predictive Analytics
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                  Advanced Analytics Hub
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Unlock actionable insights that drive recruitment excellence and business growth
                </p>
                
                <div className="grid grid-cols-4 gap-6 pt-4">
                  {keyMetrics.map((metric, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center text-2xl font-bold text-white">
                        {metric.change && (
                          <span className={`text-sm mr-1 ${metric.change.startsWith('+') ? 'text-green-300' : 'text-red-300'}`}>
                            {metric.change}
                          </span>
                        )}
                        {metric.value}
                      </div>
                      <div className="text-sm text-blue-200">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="relative w-20 h-20">
                    <Activity className="h-20 w-20 text-white opacity-80" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 hover:shadow-medium transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-50`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
                <div className={`flex items-center space-x-1 ${
                  metric.trend === 'up' ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                <p className="text-sm text-neutral-600">{metric.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Performance Dashboard</h2>
              <p className="text-neutral-600">Comprehensive view of your recruitment performance across key areas</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {performanceAreas.map((area, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-medium transition-all duration-300">
                {/* Area Header */}
                <div className="bg-primary-800 px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <area.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{area.title}</h3>
                        <p className="text-white/80 text-sm">{area.trend}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{area.score}</div>
                      <div className="text-white/80 text-sm">Score</div>
                    </div>
                  </div>
                </div>

                {/* Area Content */}
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {area.insights.map((insight, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success-500" />
                        <span className="text-sm text-neutral-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
                    <div 
                      className={`bg-${area.color}-500 h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${area.score}%` }}
                    ></div>
                  </div>
                  
                  <Button variant="outline" fullWidth>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Revenue Trend</h3>
                  <p className="text-sm text-neutral-600">Monthly revenue performance over time</p>
                </div>
                <LineChart className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gradient-to-t from-primary-50 to-transparent rounded-xl flex items-end justify-center">
                <div className="text-center text-neutral-500">
                  <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Interactive chart would appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Placement Distribution */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Placement Distribution</h3>
                  <p className="text-sm text-neutral-600">Breakdown by industry and role type</p>
                </div>
                <PieChart className="h-5 w-5 text-teal-600" />
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { label: 'Technology', value: 45, color: 'primary' },
                  { label: 'Finance', value: 28, color: 'teal' },
                  { label: 'Healthcare', value: 18, color: 'accent' },
                  { label: 'Other', value: 9, color: 'secondary' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                      <span className="text-sm text-neutral-700">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`bg-${item.color}-500 h-2 rounded-full`}
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-8">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft mb-8">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">AI-Powered Insights</h3>
                <p className="text-sm text-neutral-600">Smart recommendations to optimize your performance</p>
              </div>
              <Brain className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                {
                  type: 'Opportunity',
                  title: 'Expand Healthcare Vertical',
                  description: 'Healthcare placements show 22% higher margins. Consider increasing focus in this sector.',
                  impact: 'High',
                  icon: TrendingUp,
                  color: 'success'
                },
                {
                  type: 'Alert',
                  title: 'Client Satisfaction Dip',
                  description: 'TechCorp satisfaction dropped to 4.2/5. Schedule a check-in call this week.',
                  impact: 'Medium',
                  icon: AlertTriangle,
                  color: 'warning'
                },
                {
                  type: 'Achievement',
                  title: 'Record Month Performance',
                  description: 'This month achieved highest placement rate (94%) in company history.',
                  impact: 'Positive',
                  icon: Award,
                  color: 'primary'
                }
              ].map((insight, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-neutral-50 transition-colors border border-neutral-100">
                  <div className={`p-2 rounded-lg bg-${insight.color}-50`}>
                    <insight.icon className={`h-5 w-5 text-${insight.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-neutral-900">{insight.title}</h4>
                        <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                          {insight.type}
                        </span>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 p-1 rounded-lg hover:bg-neutral-50 transition-colors">
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full border border-neutral-200">
                        Impact: {insight.impact}
                      </span>
                      <Button variant="outline" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Tools */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-soft">
          <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900">Analytics Tools</h3>
            <p className="text-sm text-neutral-600">Advanced tools for deeper insights and custom reporting</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Custom Reports', description: 'Build tailored reports for stakeholders', icon: BarChart3 },
                { title: 'Predictive Analytics', description: 'Forecast trends and performance', icon: Brain },
                { title: 'Competitive Analysis', description: 'Benchmark against industry standards', icon: Target },
                { title: 'ROI Calculator', description: 'Measure return on recruitment investment', icon: DollarSign }
              ].map((tool, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-3">
                    <tool.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h4 className="font-semibold text-neutral-900 mb-2">{tool.title}</h4>
                  <p className="text-sm text-neutral-600">{tool.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 