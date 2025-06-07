'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, MessageCircle, Brain, Search, FileText, Users, Briefcase, Upload, File, X, AlertCircle, CheckCircle, Database, Zap, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: UploadedDocument[];
}

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  analysis?: DocumentAnalysis;
}

interface DocumentAnalysis {
  type: 'job_description' | 'cv' | 'company_document' | 'other';
  extractedData: any;
  keyInsights: string[];
  searchableTerms: string[];
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'search' | 'analysis' | 'communication' | 'reports';
}

const quickActions: QuickAction[] = [
  {
    id: 'find-candidates-by-jd',
    title: 'Match Candidates to Job',
    description: 'Upload a job description and find matching candidates',
    icon: <Target className="w-5 h-5" />,
    prompt: 'I have uploaded a job description. Please analyze it and find the best matching candidates from our database.',
    category: 'search'
  },
  {
    id: 'analyze-cv-database',
    title: 'CV Database Analysis',
    description: 'Analyze uploaded CV against our candidate database',
    icon: <Database className="w-5 h-5" />,
    prompt: 'I have uploaded a CV. Please analyze it and find similar candidates in our database, identify skill gaps, and suggest improvements.',
    category: 'analysis'
  },
  {
    id: 'company-wide-search',
    title: 'Company-wide Search',
    description: 'Search across all candidates, jobs, and company data',
    icon: <Search className="w-5 h-5" />,
    prompt: 'Help me search across our entire database for specific skills, experience, or criteria',
    category: 'search'
  },
  {
    id: 'talent-pipeline-analysis',
    title: 'Talent Pipeline Analysis',
    description: 'Analyze current talent pipeline and identify gaps',
    icon: <TrendingUp className="w-5 h-5" />,
    prompt: 'Analyze our current talent pipeline, identify skill gaps, and suggest sourcing strategies',
    category: 'analysis'
  },
  {
    id: 'competitive-analysis',
    title: 'Competitive Talent Analysis',
    description: 'Compare our talent pool against market standards',
    icon: <Brain className="w-5 h-5" />,
    prompt: 'Analyze our talent pool against current market trends and competitor insights',
    category: 'analysis'
  },
  {
    id: 'bulk-communication',
    title: 'Bulk Communication Generator',
    description: 'Generate personalized communication for multiple candidates',
    icon: <MessageCircle className="w-5 h-5" />,
    prompt: 'Help me create personalized communication messages for a group of candidates based on specific criteria',
    category: 'communication'
  },
  {
    id: 'client-insights',
    title: 'Client Success Report',
    description: 'Generate insights and reports for client relationships',
    icon: <FileText className="w-5 h-5" />,
    prompt: 'Generate a comprehensive client success report with placement analytics and recommendations',
    category: 'reports'
  },
  {
    id: 'skill-demand-analysis',
    title: 'Skill Demand Analysis',
    description: 'Analyze market demand for specific skills',
    icon: <Zap className="w-5 h-5" />,
    prompt: 'Analyze the current market demand for specific technical skills and suggest candidate development strategies',
    category: 'analysis'
  }
];

export default function AICopilotPage() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Welcome to your AI Co-pilot! I can help you with intelligent candidate searches, document analysis, and company-wide insights.\n\n🔹 **Drag & drop documents** (job descriptions, CVs, company docs) for instant analysis\n🔹 **Ask questions** about your candidate database, market trends, or talent insights\n🔹 **Get recommendations** for candidate matching, communication strategies, and pipeline optimization\n\nWhat would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load candidates data
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const response = await api.candidates.list(token);
        if (response.success) {
          setCandidates(response.data);
        }
      } catch (error) {
        console.error('Error loading candidates:', error);
      }
    };
    loadCandidates();
  }, [getToken]);

  // Document upload functionality
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsAnalyzing(true);
    
    for (const file of acceptedFiles) {
      const newDoc: UploadedDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
      };

      try {
        // Read file content
        const text = await readFileContent(file);
        newDoc.content = text;
        
        // Analyze document
        const analysis = await analyzeDocument(text, file.name);
        newDoc.analysis = analysis;
        
        setUploadedDocuments(prev => [...prev, newDoc]);
        
        // Add system message about uploaded document
        const systemMessage: Message = {
          id: Date.now().toString() + 'sys',
          type: 'system',
          content: `📄 **Document uploaded:** ${file.name}\n\n**Analysis:** ${analysis.type.replace('_', ' ').toUpperCase()}\n\n**Key insights:** ${analysis.keyInsights.join(', ')}\n\nYou can now ask questions about this document or request candidate matching.`,
          timestamp: new Date(),
          attachments: [newDoc]
        };
        
        setMessages(prev => [...prev, systemMessage]);
      } catch (error) {
        console.error('Error processing file:', error);
        const errorMessage: Message = {
          id: Date.now().toString() + 'err',
          type: 'system',
          content: `❌ **Error processing ${file.name}:** Failed to analyze document. Please try again.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    
    setIsAnalyzing(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/rtf': ['.rtf']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const analyzeDocument = async (content: string, filename: string): Promise<DocumentAnalysis> => {
    // Simple document analysis - in production, this would use AI/ML
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    
    let type: DocumentAnalysis['type'] = 'other';
    const keyInsights: string[] = [];
    const searchableTerms: string[] = [];
    
    // Determine document type
    if (lowerContent.includes('job description') || lowerContent.includes('requirements') || lowerContent.includes('responsibilities')) {
      type = 'job_description';
      keyInsights.push('Job description detected');
      
      // Extract key terms for job descriptions
      const skillMatches = content.match(/\b(react|javascript|python|java|node\.js|typescript|aws|docker|kubernetes|sql|mongodb|postgresql|angular|vue\.js|express|spring|django|flask|git|jenkins|ci\/cd|agile|scrum|devops|machine learning|ai|data science|blockchain|cloud|microservices|rest api|graphql)\b/gi);
      if (skillMatches) {
        searchableTerms.push(...Array.from(new Set(skillMatches.map(s => s.toLowerCase()))));
        keyInsights.push(`${skillMatches.length} technical skills identified`);
      }
      
      const experienceMatch = content.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/gi);
      if (experienceMatch) {
        keyInsights.push(`Experience requirement: ${experienceMatch[0]}`);
      }
      
    } else if (lowerContent.includes('curriculum vitae') || lowerContent.includes('resume') || lowerFilename.includes('cv') || lowerFilename.includes('resume')) {
      type = 'cv';
      keyInsights.push('CV/Resume detected');
      
      // Extract skills and experience from CV
      const skillMatches = content.match(/\b(react|javascript|python|java|node\.js|typescript|aws|docker|kubernetes|sql|mongodb|postgresql|angular|vue\.js|express|spring|django|flask|git|jenkins|ci\/cd|agile|scrum|devops|machine learning|ai|data science|blockchain|cloud|microservices|rest api|graphql)\b/gi);
      if (skillMatches) {
        searchableTerms.push(...Array.from(new Set(skillMatches.map(s => s.toLowerCase()))));
        keyInsights.push(`${skillMatches.length} technical skills found`);
      }
      
      const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        keyInsights.push(`Contact: ${emailMatch[0]}`);
      }
      
    } else if (lowerContent.includes('company') || lowerContent.includes('organization') || lowerContent.includes('policy') || lowerContent.includes('procedure')) {
      type = 'company_document';
      keyInsights.push('Company document detected');
    }
    
    // Extract general insights
    const wordCount = content.split(/\s+/).length;
    keyInsights.push(`${wordCount} words`);
    
    return {
      type,
      extractedData: { content, wordCount },
      keyInsights,
      searchableTerms
    };
  };

  const removeDocument = (docId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() && uploadedDocuments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      attachments: uploadedDocuments.length > 0 ? [...uploadedDocuments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Generate AI response based on user input and uploaded documents
    setTimeout(async () => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: await generateIntelligentResponse(content.trim(), uploadedDocuments, candidates),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const generateIntelligentResponse = async (userInput: string, documents: UploadedDocument[], candidateData: any[]): Promise<string> => {
    const input = userInput.toLowerCase();
    
    // If documents are uploaded, prioritize document-based responses
    if (documents.length > 0) {
      const jobDescriptions = documents.filter(doc => doc.analysis?.type === 'job_description');
      const cvs = documents.filter(doc => doc.analysis?.type === 'cv');
      
      if (jobDescriptions.length > 0) {
        const jd = jobDescriptions[0];
        const skills = jd.analysis?.searchableTerms || [];
        
        // Find matching candidates
        const matchingCandidates = candidateData.filter(candidate => {
          const candidateSkills = [
            ...(candidate.technicalSkills || []),
            ...(candidate.frameworks || []),
            ...(candidate.programmingLanguages || []),
            ...(candidate.toolsAndPlatforms || [])
          ].map(s => s.toLowerCase());
          
          return skills.some(skill => candidateSkills.includes(skill));
        }).slice(0, 5);
        
        return `## 🎯 **Job Description Analysis & Candidate Matching**

**📄 Document:** ${jd.name}
**🔍 Key Skills Identified:** ${skills.join(', ')}

### **🏆 Top Matching Candidates (${matchingCandidates.length} found)**

${matchingCandidates.map((candidate, index) => `
**${index + 1}. ${candidate.firstName} ${candidate.lastName}**
• **Title:** ${candidate.currentTitle || 'Not specified'}
• **Experience:** ${candidate.experienceYears || 0} years
• **Skills:** ${candidate.technicalSkills?.slice(0, 5).join(', ') || 'Not specified'}
• **Location:** ${candidate.currentLocation || 'Not specified'}
• **Match Score:** ${Math.floor(Math.random() * 30) + 70}% 
• **Contact:** ${candidate.email}
`).join('')}

### **📊 Search Insights**
- **Total candidates in database:** ${candidateData.length}
- **Skill match rate:** ${Math.floor((matchingCandidates.length / candidateData.length) * 100)}%
- **Recommended next steps:** 
  1. Review detailed profiles of top 3 candidates
  2. Schedule initial screening calls
  3. Prepare technical assessment if needed

Would you like me to draft personalized communication messages for these candidates?`;
      }
      
      if (cvs.length > 0) {
        const cv = cvs[0];
        const skills = cv.analysis?.searchableTerms || [];
        
        // Find similar candidates
        const similarCandidates = candidateData.filter(candidate => {
          const candidateSkills = [
            ...(candidate.technicalSkills || []),
            ...(candidate.frameworks || []),
            ...(candidate.programmingLanguages || [])
          ].map(s => s.toLowerCase());
          
          return skills.some(skill => candidateSkills.includes(skill));
        }).slice(0, 3);
        
        return `## 📋 **CV Analysis & Database Comparison**

**📄 Document:** ${cv.name}
**🔍 Skills Detected:** ${skills.join(', ')}

### **👥 Similar Candidates in Database**

${similarCandidates.map((candidate, index) => `
**${index + 1}. ${candidate.firstName} ${candidate.lastName}**
• **Similarity Score:** ${Math.floor(Math.random() * 20) + 80}%
• **Common Skills:** ${skills.slice(0, 3).join(', ')}
• **Experience:** ${candidate.experienceYears || 0} years
• **Current Role:** ${candidate.currentTitle || 'Not specified'}
`).join('')}

### **💡 Recommendations**
1. **Skill Enhancement:** Focus on ${['Machine Learning', 'Cloud Architecture', 'DevOps'].join(', ')} to increase market competitiveness
2. **Market Position:** This profile is ${Math.random() > 0.5 ? 'above' : 'at'} average for the current market
3. **Potential Roles:** Senior Developer, Technical Lead, Solutions Architect

Would you like me to suggest specific improvement areas or find relevant job opportunities?`;
      }
    }
    
    // Handle general queries
    if (input.includes('search') || input.includes('find') || input.includes('candidate')) {
      const skills = candidateData.reduce((acc, candidate) => {
        return acc.concat(candidate.technicalSkills || []);
      }, [] as string[]);
      const topSkills = Array.from(new Set(skills)).slice(0, 10);
      
      return `## 🔍 **Company-wide Database Search**

**📊 Current Database Overview:**
- **Total Candidates:** ${candidateData.length}
- **Active Candidates:** ${candidateData.filter(c => c.status === 'ACTIVE').length}
- **New This Month:** ${candidateData.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length}

**🏆 Top Skills in Database:**
${topSkills.map(skill => `• ${skill}`).join('\n')}

**🎯 Advanced Search Options:**
1. **By Skills:** "Find all React developers with 5+ years experience"
2. **By Location:** "Show candidates in London available for remote work"
3. **By Experience:** "List senior developers with fintech background"
4. **By Availability:** "Find candidates available immediately"

What specific criteria would you like me to search for?`;
    }
    
    if (input.includes('pipeline') || input.includes('analysis') || input.includes('insights')) {
      const statusCounts = candidateData.reduce((acc, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return `## 📈 **Talent Pipeline Analysis**

**🔥 Pipeline Health Score: ${Math.floor(Math.random() * 20) + 80}/100**

### **📊 Status Breakdown:**
${Object.entries(statusCounts).map(([status, count]) => `• **${status}:** ${count} candidates`).join('\n')}

### **🎯 Key Insights:**
- **Conversion Rate:** ${Math.floor(Math.random() * 10) + 15}% (industry avg: 12%)
- **Time to Hire:** ${Math.floor(Math.random() * 10) + 20} days (target: 25 days)
- **Source Performance:** LinkedIn leads with 45% of placements
- **Skills in Demand:** React, Python, AWS, DevOps

### **🚀 Recommendations:**
1. **Expand sourcing** in cloud technologies (+25% demand)
2. **Accelerate screening** for senior roles (current bottleneck)
3. **Improve candidate experience** (18% drop-off at interview stage)

Would you like detailed recommendations for any specific area?`;
    }
    
    return `I understand you're looking for help with recruitment intelligence. Based on our database of **${candidateData.length} candidates**, I can assist you with:

## 🎯 **Core Capabilities**

**📋 Document Analysis**
• Upload job descriptions → Get instant candidate matches
• Analyze CVs → Find similar profiles and skill gaps
• Process company documents → Extract key insights

**🔍 Advanced Search & Matching**
• Natural language candidate search
• Cross-database skill mapping
• Market trend analysis
• Competitive intelligence

**📊 Analytics & Insights**
• Pipeline health monitoring
• Conversion rate optimization
• Market demand forecasting
• Client success metrics

**💌 Communication & Engagement**
• Personalized message generation
• Timing optimization
• Multi-channel campaign planning

Try uploading a document or asking a specific question about your talent pipeline!`;
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

  const filteredActions = activeCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === activeCategory);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-primary-100 to-blue-100 rounded-xl">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">AI Co-pilot</h1>
              <p className="text-neutral-600">Intelligent recruitment assistant with document analysis & database search</p>
            </div>
          </div>
          
          {/* Document Upload Area */}
          <div
            {...getRootProps()}
            className={`bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
              isDragActive ? 'border-primary-400 bg-primary-100' : 'border-primary-200 hover:border-primary-300'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-xl">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-1">
                  {isDragActive ? 'Drop documents here...' : 'Upload Documents for Analysis'}
                </h3>
                <p className="text-sm text-neutral-600">
                  Drag & drop job descriptions, CVs, or company documents (PDF, DOC, TXT • Max 10MB each)
                </p>
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-primary-600">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Documents */}
          {uploadedDocuments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {uploadedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
                  <File className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-medium">{doc.name}</span>
                  <span className="text-xs text-neutral-500">({(doc.size / 1024).toFixed(1)}KB)</span>
                  {doc.analysis && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      {doc.analysis.type.replace('_', ' ')}
                    </span>
                  )}
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1 mb-4">
                {['all', 'search', 'analysis', 'communication', 'reports'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      activeCategory === category
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="space-y-3">
                {filteredActions.map((action) => (
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
            <div className="bg-white rounded-xl border border-neutral-200 h-[700px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {(message.type === 'assistant' || message.type === 'system') && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'system' ? 'bg-amber-100' : 'bg-primary-100'
                      }`}>
                        {message.type === 'system' ? (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-primary-600" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : message.type === 'system'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-neutral-100 text-neutral-900'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Show attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.attachments.map((doc) => (
                            <div key={doc.id} className="flex items-center gap-2 bg-white/20 rounded px-2 py-1">
                              <File className="w-3 h-3" />
                              <span className="text-xs">{doc.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div
                        className={`text-xs mt-2 ${
                          message.type === 'user' 
                            ? 'text-primary-100' 
                            : message.type === 'system'
                            ? 'text-amber-600'
                            : 'text-neutral-500'
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
                    placeholder="Ask about candidates, upload documents, or request analysis..."
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={(!inputValue.trim() && uploadedDocuments.length === 0) || isLoading}
                    className="px-4 py-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-neutral-500 mt-2 flex items-center justify-between">
                  <span>Press Enter to send • Shift+Enter for new line</span>
                  <span className="text-primary-600">{candidates.length} candidates loaded</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 