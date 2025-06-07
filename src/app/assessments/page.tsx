'use client';

import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { 
  ClipboardList, 
  Plus, 
  Brain, 
  Users, 
  Code, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  Settings,
  Zap,
  Target,
  MessageSquare
} from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  type: 'technical' | 'personality' | 'cognitive';
  description: string;
  duration: number;
  questions: number;
  status: 'draft' | 'active' | 'completed';
  candidates: number;
  averageScore: number;
  createdAt: string;
  aiGenerated?: boolean;
}

interface AssessmentConfig {
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionTypes: string[];
  focusAreas: string[];
  includeCodeChallenges: boolean;
  adaptiveDifficulty: boolean;
  timePerQuestion: number;
  passingScore: number;
  aiAssisted: boolean;
}

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([
    {
      id: '1',
      title: 'JavaScript Fundamentals',
      type: 'technical',
      description: 'Test understanding of core JavaScript concepts',
      duration: 60,
      questions: 25,
      status: 'active',
      candidates: 15,
      averageScore: 78,
      createdAt: '2024-01-15',
      aiGenerated: true
    },
    {
      id: '2',
      title: 'Personality Assessment',
      type: 'personality',
      description: 'Evaluate personality traits and work style',
      duration: 30,
      questions: 40,
      status: 'active',
      candidates: 23,
      averageScore: 85,
      createdAt: '2024-01-12'
    },
    {
      id: '3',
      title: 'Logical Reasoning',
      type: 'cognitive',
      description: 'Test problem-solving and analytical skills',
      duration: 45,
      questions: 20,
      status: 'draft',
      candidates: 0,
      averageScore: 0,
      createdAt: '2024-01-18'
    }
  ]);

  const [newAssessment, setNewAssessment] = useState({
    title: '',
    type: 'technical' as 'technical' | 'personality' | 'cognitive',
    description: '',
    duration: 60,
    questions: [] as string[],
    jobRole: '',
    skillLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    aiAssisted: true
  });

  const [assessmentConfig, setAssessmentConfig] = useState<AssessmentConfig>({
    difficulty: 'intermediate',
    questionTypes: ['multiple_choice', 'coding'],
    focusAreas: [],
    includeCodeChallenges: true,
    adaptiveDifficulty: false,
    timePerQuestion: 3,
    passingScore: 70,
    aiAssisted: true
  });

  const generateAIAssessment = async () => {
    setIsGeneratingAI(true);
    
    try {
      // In a real implementation, you would call the assessment service
      const { assessmentService } = await import('@/lib/services/assessment');
      
      const aiInput = {
        jobTitle: newAssessment.jobRole || 'General Position',
        jobDescription: newAssessment.description,
        assessmentType: newAssessment.type,
        skillLevel: newAssessment.skillLevel,
        duration: newAssessment.duration,
        focusAreas: [], // Could be derived from job description
        includeCodeChallenges: assessmentConfig.includeCodeChallenges
      };
      
      const aiQuestions = await assessmentService.generateAIAssessment(aiInput);
      
      setNewAssessment(prev => ({
        ...prev,
        description: `AI-generated ${prev.type} assessment for ${prev.jobRole || 'general'} role. This assessment evaluates key competencies and skills relevant to the position, automatically tailored to ${assessmentConfig.difficulty} difficulty level.`,
        questions: aiQuestions.map(q => q.question)
      }));
      
    } catch (error) {
      console.error('Error generating AI assessment:', error);
      
      // Fallback to mock generation
      setTimeout(() => {
        const aiGeneratedQuestions = [
          "What is the difference between let, const, and var in JavaScript?",
          "Explain how closures work in JavaScript with an example.",
          "What is the purpose of the 'this' keyword in JavaScript?",
          "How do you handle asynchronous operations in JavaScript?",
          "What are the key differences between == and === operators?"
        ];
        
        setNewAssessment(prev => ({
          ...prev,
          description: `AI-generated ${prev.type} assessment for ${prev.jobRole || 'general'} role. This assessment evaluates key competencies and skills relevant to the position, automatically tailored to ${assessmentConfig.difficulty} difficulty level.`,
          questions: aiGeneratedQuestions
        }));
        
        setIsGeneratingAI(false);
      }, 1000);
      return;
    }
    
    setIsGeneratingAI(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical':
        return <Code className="h-5 w-5 text-blue-600" />;
      case 'personality':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'cognitive':
        return <Brain className="h-5 w-5 text-purple-600" />;
      default:
        return <ClipboardList className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const createAssessment = async () => {
    // Here you would call the assessment service
    console.log('Creating assessment:', newAssessment);
    // Reset form
    setNewAssessment({
      title: '',
      type: 'technical',
      description: '',
      duration: 60,
      questions: [],
      jobRole: '',
      skillLevel: 'intermediate',
      aiAssisted: true
    });
    setActiveTab('overview');
  };

  const tabs = [
    { id: 'overview', label: 'All Assessments', icon: ClipboardList },
    { id: 'create', label: 'Create Assessment', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-primary-600 to-primary-800 rounded-3xl">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 right-20 w-24 h-24 border border-white rounded-full"></div>
            <div className="absolute bottom-8 right-40 w-16 h-16 border border-white rounded-full"></div>
          </div>
          
          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-white leading-tight mb-2">
                    Advanced Assessment Hub
                  </h1>
                  <p className="text-xl text-blue-100">
                    Create, manage and analyze candidate assessments with AI-powered intelligence
                  </p>
                </div>
                
                {/* Features Badges */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Brain className="h-4 w-4 mr-2" />
                    AI-Generated Questions
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Target className="h-4 w-4 mr-2" />
                    Smart Analytics
                  </div>
                  <div className="inline-flex items-center px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Grading
                  </div>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 text-white">
                  <div>
                    <p className="text-2xl font-bold">{assessments.length}</p>
                    <p className="text-blue-200 text-sm">Total Assessments</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{assessments.filter(a => a.status === 'active').length}</p>
                    <p className="text-blue-200 text-sm">Active Tests</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{assessments.reduce((sum, a) => sum + a.candidates, 0)}</p>
                    <p className="text-blue-200 text-sm">Candidates Tested</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length)}%</p>
                    <p className="text-blue-200 text-sm">Average Score</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Large Icon */}
              <div className="hidden lg:block ml-8">
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <ClipboardList className="w-16 h-16 text-white opacity-80" />
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                      <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.filter(a => a.status === 'active').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {assessments.reduce((sum, a) => sum + a.candidates, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Score</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(assessments.reduce((sum, a) => sum + a.averageScore, 0) / assessments.length)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id} variant="elevated">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(assessment.type)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
                            {assessment.aiGenerated && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{assessment.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(assessment.status)}
                        <span className="text-xs text-gray-500 capitalize">{assessment.status}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{assessment.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{assessment.duration} min</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Questions</p>
                        <p className="font-medium">{assessment.questions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Candidates</p>
                        <p className="font-medium">{assessment.candidates}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg Score</p>
                        <p className="font-medium">{assessment.averageScore}%</p>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <Card>
            <CardHeader title="Create New Assessment">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Build assessments manually or with AI assistance</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* AI Assistant Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Assessment Generator</h3>
                        <p className="text-sm text-gray-600">
                          Generate tailored questions automatically based on job requirements
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNewAssessment(prev => ({ ...prev, aiAssisted: !prev.aiAssisted }))}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        newAssessment.aiAssisted
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-purple-600 border border-purple-600'
                      }`}
                    >
                      {newAssessment.aiAssisted ? 'AI Enabled' : 'Enable AI'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Assessment Title"
                    value={newAssessment.title}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., React Developer Assessment"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                    <select
                      value={newAssessment.type}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="technical">Technical Assessment</option>
                      <option value="personality">Personality Assessment</option>
                      <option value="cognitive">Cognitive Assessment</option>
                    </select>
                  </div>
                </div>

                {newAssessment.aiAssisted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Target Job Role"
                      value={newAssessment.jobRole}
                      onChange={(e) => setNewAssessment(prev => ({ ...prev, jobRole: e.target.value }))}
                      placeholder="e.g., Senior Frontend Developer, Product Manager"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                      <select
                        value={newAssessment.skillLevel}
                        onChange={(e) => setNewAssessment(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="advanced">Advanced (5+ years)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <Textarea
                    label={newAssessment.aiAssisted ? "Job Description (AI will analyze this)" : "Description"}
                    value={newAssessment.description}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={newAssessment.aiAssisted 
                      ? "Paste the job description here and AI will generate relevant assessment questions..."
                      : "Describe what this assessment evaluates..."
                    }
                    rows={4}
                  />

                  {newAssessment.aiAssisted && newAssessment.description && (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={generateAIAssessment}
                        disabled={isGeneratingAI}
                        className="flex items-center"
                        variant="outline"
                      >
                        {isGeneratingAI ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                            Generating Questions...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Questions
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    value={newAssessment.duration.toString()}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    placeholder="60"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                    <select
                      value={assessmentConfig.difficulty}
                      onChange={(e) => setAssessmentConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Passing Score (%)"
                    type="number"
                    value={assessmentConfig.passingScore.toString()}
                    onChange={(e) => setAssessmentConfig(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    placeholder="70"
                    min="0"
                    max="100"
                  />
                </div>

                {/* Advanced Configuration */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Advanced Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Include Code Challenges</label>
                        <button
                          onClick={() => setAssessmentConfig(prev => ({ ...prev, includeCodeChallenges: !prev.includeCodeChallenges }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            assessmentConfig.includeCodeChallenges ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            assessmentConfig.includeCodeChallenges ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Adaptive Difficulty</label>
                        <button
                          onClick={() => setAssessmentConfig(prev => ({ ...prev, adaptiveDifficulty: !prev.adaptiveDifficulty }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            assessmentConfig.adaptiveDifficulty ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            assessmentConfig.adaptiveDifficulty ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Input
                        label="Time per Question (minutes)"
                        type="number"
                        value={assessmentConfig.timePerQuestion.toString()}
                        onChange={(e) => setAssessmentConfig(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) || 3 }))}
                        placeholder="3"
                        min="1"
                        max="15"
                      />
                    </div>
                  </div>
                </div>

                {/* Assessment Preview */}
                {newAssessment.questions.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      AI Generated Questions Preview
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {newAssessment.questions.slice(0, 3).map((question, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="text-sm font-medium text-gray-500 mt-1">{index + 1}.</span>
                          <p className="text-sm text-gray-700">{question}</p>
                        </div>
                      ))}
                      {newAssessment.questions.length > 3 && (
                        <p className="text-sm text-gray-500 italic">
                          +{newAssessment.questions.length - 3} more questions...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Type-specific features */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Features</h3>
                  
                  {newAssessment.type === 'technical' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Code className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">Technical Assessment Features</h4>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• {newAssessment.aiAssisted ? 'AI-generated' : 'Manual'} code challenges and programming questions</li>
                        <li>• Algorithm and data structure problems</li>
                        <li>• Technology-specific questions tailored to {newAssessment.jobRole || 'role'}</li>
                        <li>• Automated code evaluation and syntax checking</li>
                        <li>• Real-time IDE environment for coding challenges</li>
                      </ul>
                    </div>
                  )}

                  {newAssessment.type === 'personality' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Users className="h-5 w-5 text-green-600 mr-2" />
                        <h4 className="font-medium text-green-900">Personality Assessment Features</h4>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Big Five personality traits evaluation</li>
                        <li>• Work style and communication preferences</li>
                        <li>• Team collaboration and leadership assessment</li>
                        <li>• Cultural fit evaluation for your organization</li>
                        <li>• Behavioral pattern analysis</li>
                      </ul>
                    </div>
                  )}

                  {newAssessment.type === 'cognitive' && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <Brain className="h-5 w-5 text-purple-600 mr-2" />
                        <h4 className="font-medium text-purple-900">Cognitive Assessment Features</h4>
                      </div>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Logical reasoning and pattern recognition</li>
                        <li>• Problem-solving scenarios and case studies</li>
                        <li>• Critical thinking and analytical skills</li>
                        <li>• Memory and attention span evaluation</li>
                        <li>• Decision-making under pressure scenarios</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button onClick={createAssessment} className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Create Assessment
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('overview')} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Assessment Analytics">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-primary-800 p-6 rounded-lg text-white">
                    <h3 className="text-lg font-medium">Total Assessments</h3>
                    <p className="text-3xl font-bold mt-2">1,247</p>
                    <p className="text-sm mt-2 text-blue-100">+12% this month</p>
                  </div>
                  
                  <div className="bg-primary-800 p-6 rounded-lg text-white">
                    <h3 className="text-lg font-medium">Completion Rate</h3>
                    <p className="text-3xl font-bold mt-2">89%</p>
                    <p className="text-sm mt-2 text-blue-100">+5% from last month</p>
                  </div>
                  
                  <div className="bg-primary-800 p-6 rounded-lg text-white">
                    <h3 className="text-lg font-medium">Avg Duration</h3>
                    <p className="text-3xl font-bold mt-2">42min</p>
                    <p className="text-purple-100 text-sm">Time to complete</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Assessment Performance</h4>
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <div key={assessment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getTypeIcon(assessment.type)}
                            <div>
                              <h5 className="font-medium text-gray-900">{assessment.title}</h5>
                              <p className="text-sm text-gray-600">{assessment.candidates} candidates</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{assessment.averageScore}%</p>
                            <p className="text-sm text-gray-600">Average Score</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
} 