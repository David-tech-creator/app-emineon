'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Brain, Search, FileText, Users, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'search-candidates',
    title: 'Find Candidates',
    description: 'Search for candidates matching specific criteria',
    icon: <Search className="w-5 h-5" />,
    prompt: 'Help me find candidates for a senior React developer position at a fintech startup'
  },
  {
    id: 'analyze-pipeline',
    title: 'Pipeline Analysis',
    description: 'Get insights on your recruitment pipeline',
    icon: <Brain className="w-5 h-5" />,
    prompt: 'Analyze my current recruitment pipeline and suggest improvements'
  },
  {
    id: 'draft-outreach',
    title: 'Draft Outreach',
    description: 'Create personalized candidate outreach messages',
    icon: <MessageCircle className="w-5 h-5" />,
    prompt: 'Help me draft a personalized LinkedIn message for a senior software engineer'
  },
  {
    id: 'client-report',
    title: 'Client Report',
    description: 'Generate client update reports',
    icon: <FileText className="w-5 h-5" />,
    prompt: 'Create a weekly client report for our tech startup clients'
  },
  {
    id: 'market-insights',
    title: 'Market Insights',
    description: 'Get current market trends and salary data',
    icon: <Briefcase className="w-5 h-5" />,
    prompt: 'What are the current market trends for software engineering roles?'
  },
  {
    id: 'candidate-match',
    title: 'Candidate Matching',
    description: 'Match candidates to specific job requirements',
    icon: <Users className="w-5 h-5" />,
    prompt: 'Match my top candidates to the new product manager role at TechCorp'
  }
];

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI recruitment co-pilot. I can help you with candidate searches, pipeline analysis, outreach drafting, market insights, and much more. What would you like to work on today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(content.trim()),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('find') || input.includes('search') || input.includes('candidate')) {
      return `I can help you find candidates! Based on your request, I'm searching through our database of 2,800+ candidates. Here are some relevant matches:

**Top Candidates:**
• **Sarah Chen** - Senior React Developer, 6 years exp, currently at TechFlow
• **Michael Rodriguez** - Full-Stack Engineer, React/Node.js, fintech background
• **Alex Kim** - Frontend Lead, startup experience, remote-friendly

**Search Insights:**
- 47 candidates match your React + fintech criteria
- Average salary range: $120k - $160k
- 68% are open to new opportunities
- Best outreach time: Tuesday-Thursday, 10-11 AM

Would you like me to draft personalized outreach messages for any of these candidates?`;
    }
    
    if (input.includes('pipeline') || input.includes('analysis') || input.includes('insights')) {
      return `Here's your current pipeline analysis:

**Pipeline Health Score: 87/100** ✅

**Stage Breakdown:**
• **Source**: 2,800 candidates (↑12% this month)
• **Engage**: 68% response rate (↑5% vs last month)
• **Interview**: 18 scheduled this week
• **Present**: 12 candidates positioned with clients

**Key Insights:**
- Your LinkedIn outreach has 23% higher response rates
- Tuesday mornings show best engagement (47% open rate)
- Tech roles are filling 15% faster than average
- Client satisfaction score: 96%

**Recommendations:**
1. Focus more outreach on Tuesday-Thursday
2. Leverage your high-performing LinkedIn templates
3. Consider expanding your React developer pipeline`;
    }
    
    if (input.includes('outreach') || input.includes('message') || input.includes('linkedin')) {
      return `I'll help you craft a personalized outreach message. Here's a template based on best practices:

**Subject: Exciting Senior Engineering Opportunity**

Hi [Candidate Name],

I came across your profile and was impressed by your experience with React and your background at [Current Company]. 

I'm working with a fast-growing fintech startup that's looking for a Senior Software Engineer to join their core platform team. The role offers:

• Technical leadership opportunities
• Equity package + competitive salary ($140-160k)
• Remote-first culture with quarterly team meetups
• Direct impact on financial technology innovation

Given your expertise in React and fintech domain knowledge, I think this could be a great fit. Would you be open to a brief conversation this week?

Best regards,
[Your Name]

**Performance Prediction:** 73% response rate based on similar messages
**Best Send Time:** Tuesday 10:30 AM

Would you like me to customize this further for a specific candidate?`;
    }
    
    if (input.includes('report') || input.includes('client') || input.includes('update')) {
      return `I'll generate your client report. Here's this week's summary:

**Weekly Client Report - Tech Sector**
*Week of ${new Date().toLocaleDateString()}*

**Pipeline Progress:**
• 23 new candidates sourced
• 18 interviews scheduled
• 12 candidates presented to clients
• 4 offers extended

**Key Highlights:**
• **TechCorp Product Manager Role**: 3 final-round candidates
• **StartupXYZ Senior Engineer**: Offer accepted, start date confirmed
• **FinanceApp Frontend Lead**: 2 strong candidates in pipeline

**Market Intelligence:**
• React developer demand up 18%
• Average salary increase: 8% vs Q3
• Remote work preference: 89% of candidates

**Next Week Focus:**
• Follow up on pending offers
• Source for 2 new UX designer roles
• Client check-ins scheduled

Would you like me to expand on any specific section or format this for a particular client?`;
    }
    
    if (input.includes('market') || input.includes('trends') || input.includes('salary')) {
      return `Here are the current market trends for software engineering:

**Market Overview - Q4 2024**

**Salary Trends:**
• Senior Engineers: $140-180k (↑8% YoY)
• React Specialists: $130-170k (high demand)
• Full-Stack: $120-160k (stable)
• Engineering Managers: $180-220k (↑12% YoY)

**In-Demand Skills:**
1. React/TypeScript (↑25% job postings)
2. AWS/Cloud (↑18% demand)
3. Python/AI (↑35% growth)
4. DevOps/Kubernetes (↑22% increase)

**Market Dynamics:**
• 73% of engineers prefer remote/hybrid
• Average interview process: 3.2 rounds
• Time to hire: 18 days (down from 24)
• Offer acceptance rate: 78%

**Industry Hotspots:**
• Fintech: Highest salary premiums
• AI/ML: Fastest growing sector
• Healthcare Tech: Emerging opportunities

**Recruitment Strategy:**
Focus on remote-friendly roles and emphasize growth opportunities to attract top talent.`;
    }
    
    return `I understand you're looking for help with recruitment tasks. I can assist you with:

• **Candidate Search & Matching** - Find the perfect candidates for your roles
• **Pipeline Analysis** - Get insights on your recruitment performance  
• **Outreach Optimization** - Craft personalized, high-converting messages
• **Market Intelligence** - Current trends, salary data, and insights
• **Client Reporting** - Generate professional updates and summaries
• **Interview Preparation** - Question suggestions and candidate briefings

What specific area would you like to focus on? You can also try one of the quick actions below for common tasks.`;
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">AI Co-pilot</h1>
              <p className="text-neutral-600">Your personal recruitment assistant powered by AI</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-primary-600 mt-1" />
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">What I Can Help You With</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-700">
                  <div>• Find and match candidates to roles</div>
                  <div>• Analyze your recruitment pipeline</div>
                  <div>• Draft personalized outreach messages</div>
                  <div>• Generate client reports and updates</div>
                  <div>• Provide market insights and trends</div>
                  <div>• Optimize your recruitment strategy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="w-full text-left p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 group-hover:text-primary-700">
                        {action.icon}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 text-sm">{action.title}</div>
                        <div className="text-xs text-neutral-600 mt-1">{action.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.type === 'assistant' && (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-primary-100' : 'text-neutral-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-neutral-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="bg-neutral-100 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-neutral-200 p-4">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about recruitment..."
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-4 py-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-neutral-500 mt-2">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 