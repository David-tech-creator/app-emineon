'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { 
  Brain, 
  Search, 
  FileText, 
  Mail, 
  Users, 
  Target,
  Sparkles,
  Send,
  Download,
  Calendar,
  TrendingUp,
  Zap,
  MessageSquare,
  ArrowUpRight,
  Star,
  Clock,
  CheckCircle,
  Globe,
  Shield,
  BarChart3,
  Activity
} from 'lucide-react';

interface Candidate {
  name: string;
  title: string;
  company: string;
  location: string;
  match: number;
  highlights: string[];
  experience: string;
  skills: string[];
}

export default function AIToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidateMatches, setCandidateMatches] = useState<Candidate[]>([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);

  const handleNaturalSearch = async () => {
    setIsGenerating(true);
    // Simulate AI search - would integrate with actual AI service
    setTimeout(() => {
      setCandidateMatches([
        {
          name: 'Sarah Chen',
          title: 'Senior Search Engineer',
          company: 'Elastic',
          location: 'San Francisco, CA',
          match: 96,
          highlights: ['Built core search infra handling 1B+ daily queries', 'Led team of 12 search engineers', 'Reduced query latency by 40%'],
          experience: '8 years',
          skills: ['Elasticsearch', 'Machine Learning', 'Distributed Systems']
        },
        {
          name: 'Michael Rodriguez',
          title: 'Search Infrastructure Lead',
          company: 'Amazon',
          location: 'Seattle, WA',
          match: 89,
          highlights: ['Architected vector search platform serving 500M users', 'Scaled B2B search infrastructure 10x', 'Reduced infrastructure costs by 35%'],
          experience: '10 years',
          skills: ['AWS', 'Vector Search', 'Infrastructure']
        },
        {
          name: 'Emily Watson',
          title: 'Search Platform Architect',
          company: 'Google',
          location: 'New York, NY',
          match: 75,
          highlights: ['Developed semantic search algorithms', 'Improved search relevance by 25%', 'Strong in query optimization'],
          experience: '6 years',
          skills: ['Search Algorithms', 'Machine Learning', 'Python']
        }
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  const generateContent = (candidate: Candidate) => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`Subject: Exceptional ${candidate.title} - Available for Immediate Placement

Dear Hiring Manager,

I hope this email finds you well. I wanted to bring to your attention an exceptional ${candidate.title} who has recently become available and would be a perfect fit for your team.

**Candidate Highlights:**
• ${candidate.highlights.join('\n• ')}
• ${candidate.experience} of proven experience in the field
• Currently based in ${candidate.location}

**Why ${candidate.name} is Perfect for Your Team:**
${candidate.name} brings a unique combination of technical expertise and leadership experience that's rare in today's market. Their track record of ${candidate.highlights[0].toLowerCase()} demonstrates exactly the kind of impact they could bring to your organization.

**Key Technical Skills:**
${candidate.skills.map((skill: string) => `• ${skill}`).join('\n')}

I believe ${candidate.name} would be an exceptional addition to your team and would love to arrange a brief conversation to discuss how their background aligns with your current needs.

Would you be available for a 15-minute call this week to explore this opportunity further?

Best regards,
[Your Name]
Emineon Recruitment`);
      setIsGenerating(false);
    }, 1500);
  };

  const performAISearch = async () => {
    setIsSearching(true);
    // Simulate AI search - would integrate with actual AI service
    setTimeout(() => {
      setSearchResults([
        {
          name: 'Sarah Chen',
          title: 'Senior Search Engineer',
          company: 'Elastic',
          location: 'San Francisco, CA',
          match: 96,
          highlights: ['Built core search infra handling 1B+ daily queries', 'Led team of 12 search engineers', 'Reduced query latency by 40%'],
          experience: '8 years',
          skills: ['Elasticsearch', 'Machine Learning', 'Distributed Systems']
        },
        {
          name: 'Michael Rodriguez',
          title: 'Search Infrastructure Lead',
          company: 'Amazon',
          location: 'Seattle, WA',
          match: 89,
          highlights: ['Architected vector search platform serving 500M users', 'Scaled B2B search infrastructure 10x', 'Reduced infrastructure costs by 35%'],
          experience: '10 years',
          skills: ['AWS', 'Vector Search', 'Infrastructure']
        },
        {
          name: 'Emily Watson',
          title: 'Search Platform Architect',
          company: 'Google',
          location: 'New York, NY',
          match: 75,
          highlights: ['Developed semantic search algorithms', 'Improved search relevance by 25%', 'Strong in query optimization'],
          experience: '6 years',
          skills: ['Search Algorithms', 'Machine Learning', 'Python']
        }
      ]);
      setIsSearching(false);
    }, 2000);
  };

  const aiTools = [
    {
      id: 'content-generator',
      title: 'Content Generator',
      description: 'Generate compelling candidate introductions and business development materials',
      icon: FileText,
      color: 'primary',
      metrics: { generated: '15k+', satisfaction: '94%', timeReduction: '60%' },
      features: ['Personalized templates', 'Brand alignment', 'Multi-format export', 'Client customization']
    },
    {
      id: 'timing',
      title: 'Perfect Timing AI',
      description: 'Detect optimal engagement moments through business signals and behavior analysis',
      icon: Target,
      color: 'accent',
      metrics: { signals: '50k+', accuracy: '89%', engagement: '+23%' },
      features: ['Signal detection', 'Timing optimization', 'Engagement analytics', 'Behavior tracking']
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-primary-600 to-primary-800 rounded-3xl mb-8">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI-Powered Platform
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Intelligent Recruitment Tools
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Transform your talent acquisition with cutting-edge AI capabilities
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-white/90">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="text-sm">Enterprise-grade security</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Globe className="h-5 w-5 mr-2" />
                    <span className="text-sm">Global talent reach</span>
                  </div>
                  <div className="flex items-center text-white/90">
                    <Zap className="h-5 w-5 mr-2" />
                    <span className="text-sm">Real-time processing</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Brain className="h-16 w-16 text-white" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: 'Candidate Matches', value: '50k+', icon: Users, color: 'teal' },
            { label: 'Search Accuracy', value: '96%', icon: Target, color: 'primary' },
            { label: 'Time Saved', value: '75%', icon: Clock, color: 'accent' },
            { label: 'Client Satisfaction', value: '94%', icon: Star, color: 'secondary' }
          ].map((metric, index) => (
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

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
          {aiTools.map((tool) => (
            <div key={tool.id} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-medium transition-all duration-300 group">
              {/* Tool Header */}
              <div className="bg-primary-800 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                      <tool.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {tool.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Tool Content */}
              <div className="p-6">
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(tool.metrics).map(([key, value], index) => (
                    <div key={index} className="text-center">
                      <p className="text-lg font-bold text-neutral-900">{value}</p>
                      <p className="text-xs text-neutral-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-success-500" />
                      <span className="text-sm text-neutral-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => setActiveTab(tool.id)}
                  variant="outline"
                  fullWidth
                >
                  Explore Tool
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Active Tool Interface */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-medium">
            <div className="px-6 py-5 border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">
                    {aiTools.find(t => t.id === activeTab)?.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Advanced AI-powered recruitment intelligence
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab('overview')}
                  variant="outline"
                >
                  Back to Overview
                </Button>
              </div>
            </div>

            <div className="p-6">
              {/* Tool-specific content would go here */}
              {activeTab === 'content-generator' && generatedContent && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                      Generated Content
                    </h2>
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => {
                          // Implement email sending logic
                        }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-neutral-700 font-mono">
                      {isGenerating ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                          Generating personalized content...
                        </div>
                      ) : (
                        generatedContent
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 