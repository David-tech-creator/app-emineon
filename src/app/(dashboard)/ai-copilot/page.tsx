'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Sparkles, MessageCircle, Brain, Search, FileText, Users, Briefcase, Upload, File, X, AlertCircle, CheckCircle, Database, Zap, Target, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Layout } from '@/components/layout/Layout';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';

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
  fileId?: string; // OpenAI file ID
  purpose?: string;
  status?: 'uploading' | 'completed' | 'error';
  uploadProgress?: number;
}



interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  category: 'search' | 'analysis' | 'outreach' | 'reports';
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
    id: 'bulk-outreach',
    title: 'Bulk Outreach Generator',
    description: 'Generate personalized outreach for multiple candidates',
    icon: <MessageCircle className="w-5 h-5" />,
    prompt: 'Help me create personalized outreach messages for a group of candidates based on specific criteria',
    category: 'outreach'
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
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "👋 Welcome to your AI Co-pilot! I can help you with intelligent candidate searches, document analysis, and company-wide insights.\n\n🔹 **Drag & drop documents** (job descriptions, CVs, company docs) for instant analysis\n🔹 **Ask questions** about your candidate database, market trends, or talent insights\n🔹 **Get recommendations** for candidate matching, outreach strategies, and pipeline optimization\n\nWhat would you like to explore today?",
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

  // Handle initial message from URL parameter
  useEffect(() => {
    const initialMessage = searchParams.get('message');
    if (initialMessage && inputValue === '') {
      setInputValue(initialMessage);
      // Auto-send the message after a short delay
      setTimeout(() => {
        handleSendMessage(initialMessage);
        // Clear the input field after sending to prevent double sending
        setInputValue('');
      }, 500);
    }
  }, [searchParams]);

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

  // Document upload functionality using Vercel Blob
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsAnalyzing(true);
    
    for (const file of acceptedFiles) {
      const newDoc: UploadedDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'uploading',
        uploadProgress: 0,
      };

      setUploadedDocuments(prev => [...prev, newDoc]);

      try {
        // Upload to Vercel Blob and extract content
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const uploadResult = await response.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Update document with results
        const updatedDoc: UploadedDocument = {
          ...newDoc,
          status: 'completed',
          fileId: uploadResult.data.fileId,
          purpose: uploadResult.data.purpose
        };

        setUploadedDocuments(prev => 
          prev.map(doc => doc.id === newDoc.id ? updatedDoc : doc)
        );
        
        // Add system message about uploaded document
        const systemMessage: Message = {
          id: Date.now().toString() + 'sys',
          type: 'system',
          content: `📄 **Document uploaded:** ${file.name}\n\n**File ID:** ${uploadResult.data.fileId}\n**Size:** ${(uploadResult.data.size / 1024 / 1024).toFixed(2)} MB\n\nYou can now ask questions about this document or request candidate matching.`,
          timestamp: new Date(),
          attachments: [updatedDoc]
        };
        
        setMessages(prev => [...prev, systemMessage]);
      } catch (error) {
        console.error('Error processing file:', error);
        
        // Update document status to error
        setUploadedDocuments(prev => 
          prev.map(doc => doc.id === newDoc.id ? { ...doc, status: 'error' } : doc)
        );
        
        const errorMessage: Message = {
          id: Date.now().toString() + 'err',
          type: 'system',
          content: `❌ **Error processing ${file.name}:** Upload failed. Please try again.`,
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
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

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
      attachments: uploadedDocuments.filter(doc => doc.status === 'completed').length > 0 ? uploadedDocuments.filter(doc => doc.status === 'completed') : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      let response;
      
      // Use the chat endpoint with document context if available
      const requestBody: any = {
        message: content.trim(),
        context: {
          candidateCount: candidates.length
        }
      };

      // If there are uploaded documents, include their file IDs
      const completedDocs = uploadedDocuments.filter(doc => doc.status === 'completed' && doc.fileId);
      if (completedDocs.length > 0) {
        requestBody.fileIds = completedDocs.map(doc => doc.fileId);
      }

      response = await fetch('/api/ai-copilot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      let responseContent = data.message || data.response;

      // If the response includes candidate data, format it nicely
      if (data.candidates && data.candidates.length > 0) {
        responseContent += '\n\n**📋 Matching Candidates:**\n\n';
        data.candidates.forEach((candidate: any, index: number) => {
          responseContent += `**${index + 1}. ${candidate.name}**\n`;
          responseContent += `• **Skills:** ${candidate.skills?.join(', ') || 'Not specified'}\n`;
          responseContent += `• **Experience:** ${candidate.experience || 'Not specified'}\n`;
          responseContent += `• **Location:** ${candidate.location || 'Not specified'}\n`;
          if (candidate.email) {
            responseContent += `• **Contact:** ${candidate.email}\n`;
          }
          responseContent += '\n';
        });
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + 'ai',
        type: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + 'error',
        type: 'system',
        content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    setInputValue(action.prompt);
    inputRef.current?.focus();
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
              <Image 
                src="/emineon-logo.png" 
                alt="Emineon Logo" 
                width={32} 
                height={32} 
                className="w-8 h-8 object-contain"
              />
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
                  Drag & drop job descriptions, CVs, or company documents (PDF, DOC, DOCX, TXT • Max 10MB each)
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
                  {doc.status === 'completed' && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Uploaded
                    </span>
                  )}
                  {doc.status === 'uploading' && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                      Uploading...
                    </span>
                  )}
                  {doc.status === 'error' && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                      Error
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
                {['all', 'search', 'analysis', 'outreach', 'reports'].map((category) => (
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
                          <Image 
                            src="/emineon-logo.png" 
                            alt="Emineon Logo" 
                            width={16} 
                            height={16} 
                            className="w-4 h-4 object-contain"
                          />
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
                      <Image 
                        src="/emineon-logo.png" 
                        alt="Emineon Logo" 
                        width={16} 
                        height={16} 
                        className="w-4 h-4 object-contain"
                      />
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