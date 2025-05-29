'use client';

import { useState } from 'react';
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
  ChevronRight,
  Star,
  Clock,
  CheckCircle
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
  const [activeTab, setActiveTab] = useState('search');

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

  const generateSpecCV = (candidate: Candidate) => {
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

  const tools = [
    {
      id: 'search',
      name: 'AI Candidate Search',
      description: 'Find candidates using natural language - no Boolean operators needed',
      icon: Search,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'spec-cv',
      name: 'Spec CV Generator',
      description: 'Generate personalized candidate introductions for business development',
      icon: FileText,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'outreach',
      name: 'Smart Outreach',
      description: 'AI-powered email sequences that adapt to prospect behavior',
      icon: Mail,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'proposals',
      name: 'Proposal Generator',
      description: 'Create compelling proposals with relevant case studies',
      icon: Target,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      id: 'timing',
      name: 'Perfect Timing AI',
      description: 'Know exactly when to reach out to prospects and clients',
      icon: Clock,
      color: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'insights',
      name: 'Business Intelligence',
      description: 'Track company events, funding, and hiring signals',
      icon: TrendingUp,
      color: 'bg-pink-500',
      gradient: 'from-pink-500 to-pink-600'
    }
  ];

  const businessSignals = [
    {
      company: 'TechCorp',
      signal: 'Series B Funding Raised',
      amount: '$50M',
      timing: '2 days ago',
      probability: 'High',
      action: 'Reach out for expansion hiring'
    },
    {
      company: 'StartupXYZ',
      signal: 'New CTO Hired',
      timing: '1 week ago',
      probability: 'Medium',
      action: 'Engineering team expansion likely'
    },
    {
      company: 'GrowthCo',
      signal: 'Multiple Job Postings',
      timing: '3 days ago',
      probability: 'High',
      action: 'Active hiring across departments'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 flex items-center">
          <Brain className="h-8 w-8 text-primary-600 mr-3" />
          AI-Powered Tools
        </h1>
        <p className="mt-2 text-lg text-secondary-600">
          Leverage advanced AI to supercharge your recruitment process
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTab(tool.id)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
              activeTab === tool.id
                ? 'border-primary-300 bg-primary-50'
                : 'border-secondary-200 hover:border-secondary-300 bg-white hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.gradient} flex items-center justify-center mb-4`}>
              <tool.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              {tool.name}
            </h3>
            <p className="text-sm text-secondary-600">
              {tool.description}
            </p>
          </button>
        ))}
      </div>

      {/* Active Tool Interface */}
      <div className="bg-white border border-secondary-200 rounded-lg p-6">
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                Natural Language Candidate Search
              </h2>
              <Sparkles className="h-5 w-5 text-primary-600" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Describe who you're looking for
                </label>
                <div className="relative">
                  <textarea
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., Senior frontend engineer with React experience who has led a team and worked at a startup"
                    className="w-full px-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              </div>
              
              <button
                onClick={handleNaturalSearch}
                disabled={!searchQuery.trim() || isGenerating}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Candidates
                  </>
                )}
              </button>
            </div>

            {candidateMatches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">
                  Top Matches ({candidateMatches.length})
                </h3>
                <div className="space-y-4">
                  {candidateMatches.map((candidate, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-secondary-900">{candidate.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              candidate.match >= 90 ? 'bg-green-100 text-green-800' :
                              candidate.match >= 80 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {candidate.match}% Match
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600 mb-3">
                            {candidate.title} • {candidate.company} • {candidate.location}
                          </p>
                          <div className="space-y-1 mb-3">
                            {candidate.highlights.map((highlight, idx) => (
                              <p key={idx} className="text-sm text-secondary-700 flex items-start">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {highlight}
                              </p>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => generateSpecCV(candidate)}
                            className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Generate Spec CV
                          </button>
                          <button className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Contact
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                Perfect Timing Intelligence
              </h2>
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">
                  Business Signals Detected
                </h3>
                <div className="space-y-3">
                  {businessSignals.map((signal, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-secondary-900">{signal.company}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              signal.probability === 'High' ? 'bg-green-100 text-green-800' :
                              signal.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {signal.probability}
                            </span>
                          </div>
                          <p className="text-sm text-secondary-600 mb-2">
                            {signal.signal} {signal.amount && `- ${signal.amount}`}
                          </p>
                          <p className="text-xs text-secondary-500 mb-2">{signal.timing}</p>
                          <p className="text-sm text-blue-600">{signal.action}</p>
                        </div>
                        <button className="flex items-center px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors">
                          <Send className="h-3 w-3 mr-1" />
                          Reach Out
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-secondary-900 mb-4">
                  Engagement Signals
                </h3>
                <div className="space-y-3">
                  <div className="border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-2">Website Visitors</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">TechCorp - 5 visits this week</span>
                        <span className="text-green-600">Hot</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">StartupXYZ - 2 visits today</span>
                        <span className="text-yellow-600">Warm</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-secondary-200 rounded-lg p-4">
                    <h4 className="font-medium text-secondary-900 mb-2">Email Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">John Smith - Opened 3 emails</span>
                        <span className="text-green-600">Ready</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-600">Sarah Chen - Clicked links</span>
                        <span className="text-green-600">Interested</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spec-cv' && generatedContent && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-900">
                Generated Spec CV Email
              </h2>
              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Copy
                </button>
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </button>
              </div>
            </div>
            
            <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-secondary-700 font-mono">
                {isGenerating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Generating personalized spec CV email...
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
  );
} 