'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { 
  Send, Grid, List, Code, Brain, Award, 
  X, ChevronDown, ClipboardList, Edit, Shield, Copy, ArrowRight,
  UserPlus, UserCheck, Calendar, Plus, Settings, Search, Clock, Users, 
  FileText, CheckCircle, AlertCircle, Eye, Download, 
  Filter, Star, Building, Phone, Mail, MapPin, 
  Globe, Zap, Activity, TrendingUp, Briefcase, ArrowUpRight, ArrowLeft, Play,
  BarChart3, MoreVertical
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

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
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'invited' | 'started' | 'completed' | 'expired';
  score?: number;
  invitedAt: string;
  startedAt?: string;
  completedAt?: string;
  tags?: string[];
  // Additional fields for detailed view
  rank?: number;
  duration?: string;
  points?: number;
  maxPoints?: number;
  percentage?: number;
  skills?: {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  history?: {
    action: string;
    timestamp: string;
    location?: string;
  }[];
  country?: string;
}

export default function AssessmentsPage() {
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType] = useState('all');
  const [selectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'candidates' | 'score'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'details' | 'questions' | 'settings'>('list');
  const [settingsTab, setSettingsTab] = useState<'general' | 'communication'>('general');
  
  // Candidate drawer states
  const [showCandidateDrawer, setShowCandidateDrawer] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candidateDrawerTab, setCandidateDrawerTab] = useState<'report' | 'candidate'>('report');
  
  // Create Assessment Modal States
  const [createStep, setCreateStep] = useState<'role' | 'experience' | 'skills' | 'ready'>('role');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<'junior' | 'senior' | 'expert'>('senior');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  
  // Available roles
  const roles = [
    'Front-end', 'Back-end', 'Full-stack',
    'Mobile', 'Data engineer', 'Data scientist',
    'SRE / DevOps', 'Cybersecurity', 'Embedded',
    'Other'
  ];
  
  // Available skills (this would typically come from an API)
  const availableSkills = [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Git', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
    'REST APIs', 'GraphQL', 'Microservices', 'WebSockets',
    'Jest', 'Cypress', 'Selenium', 'Unit Testing',
    'Agile', 'Scrum', 'Kanban', 'Project Management',
    'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
    'Cybersecurity', 'Penetration Testing', 'Network Security',
    'Bash', 'PowerShell', 'Linux', 'Windows Server'
  ];
  
  const filteredSkills = availableSkills.filter(skill =>
    skill.toLowerCase().includes(skillSearchQuery.toLowerCase()) &&
    !selectedSkills.includes(skill)
  );
  
  // Invite modal state
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    tags: '',
    customMessage: '',
    emailSubject: 'Technical assessment',
    introTitle: 'Welcome. You\'ve been invited to take a test.',
    introText: 'Thank you for your interest in our company. We would like to invite you to take a technical assessment.',
    endTitle: 'Your test has been successfully submitted',
    endText: 'Thank you for completing the assessment. We will review your results and get back to you soon.'
  });

  const [inviteStep, setInviteStep] = useState<'form' | 'preview' | 'settings'>('form');
  const [inviteSettings, setInviteSettings] = useState({
    testName: '',
    languages: {
      english: true,
      french: false,
      spanish: false
    },
    invitationExpiry: 30,
    simplifiedReport: true,
    timerType: 'per-question',
    noTimeLimit: false,
    testIntegrity: {
      unusualActivity: true,
      copyPasteBlocking: true,
      followUpQuestions: false,
      webcamProctoring: false,
      fullScreenMode: false
    },
    customBranding: true,
    logoFile: null as File | null
  });

  const [testCandidates, setTestCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Achille BRAHIRI',
      email: 'abrahiri@gmail.com',
      status: 'expired',
      invitedAt: '2024-06-13T15:41:00Z',
      history: [
        { action: 'Invitation expired', timestamp: '2024-06-13T15:41:00Z' },
        { action: 'Test sent', timestamp: '2024-05-14T15:41:00Z', location: 'By LEFEBVRE' }
      ]
    },
    {
      id: '2',
      name: 'Naoufal BENHMIMOU',
      email: 'Naoufal.ben@gmail.com',
      status: 'completed',
      score: 52,
      rank: 3,
      duration: '1 h 2 min',
      points: 1520,
      maxPoints: 2100,
      percentage: 72,
      invitedAt: '2024-05-15T08:38:00Z',
      completedAt: '2024-05-15T10:15:00Z',
      startedAt: '2024-05-15T07:36:00Z',
      country: 'France',
      skills: [
        { name: 'Language knowledge', score: 120, maxScore: 180, percentage: 67 },
        { name: 'Problem solving', score: 260, maxScore: 390, percentage: 67 },
        { name: 'Reliability', score: 60, maxScore: 60, percentage: 100 }
      ],
      history: [
        { action: 'Test completed', timestamp: '2024-05-15T08:38:00Z', location: 'France' },
        { action: 'Test started', timestamp: '2024-05-15T07:36:00Z', location: 'France' },
        { action: 'Test opened', timestamp: '2024-05-15T04:06:00Z', location: 'France' },
        { action: 'Test sent', timestamp: '2024-05-14T15:41:00Z', location: 'By LEFEBVRE' }
      ]
    },
    {
      id: '3',
      name: 'Killian Lucas',
      email: 'contact.killian.lucas@gmail.com',
      status: 'expired',
      invitedAt: '2024-04-06T09:58:00Z',
      history: [
        { action: 'Invitation expired', timestamp: '2024-04-06T09:58:00Z' },
        { action: 'Test sent', timestamp: '2024-03-07T09:58:00Z', location: 'By LEFEBVRE' }
      ]
    },
    {
      id: '4',
      name: 'John ALLOU',
      email: 'bjohnalloupro@gmail.com',
      status: 'expired',
      invitedAt: '2024-03-13T11:04:00Z',
      tags: ['Genève'],
      history: [
        { action: 'Invitation expired', timestamp: '2024-03-13T11:04:00Z' },
        { action: 'Test sent', timestamp: '2024-02-13T11:04:00Z', location: 'By LEFEBVRE' }
      ]
    }
  ]);

  // Filter and sort assessments
  const filteredAssessments = testCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || candidate.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || candidate.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
      'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
      'invited': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Invited' },
      'started': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Started' },
      'expired': { bg: 'bg-red-100', text: 'text-red-800', label: 'Expired' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleInviteCandidate = () => {
    if (inviteForm.name && inviteForm.email && selectedAssessment) {
      const newCandidate: Candidate = {
        id: Date.now().toString(),
        name: inviteForm.name,
        email: inviteForm.email,
        status: 'invited',
        invitedAt: new Date().toISOString(),
        tags: inviteForm.tags ? inviteForm.tags.split(',').map(t => t.trim()) : undefined
      };
      
      setTestCandidates([...testCandidates, newCandidate]);
      setInviteForm({ 
        name: '', 
        email: '', 
        tags: '',
        customMessage: '',
        emailSubject: 'Technical assessment',
        introTitle: 'Welcome. You\'ve been invited to take a test.',
        introText: 'Thank you for your interest in our company. We would like to invite you to take a technical assessment.',
        endTitle: 'Your test has been successfully submitted',
        endText: 'Thank you for completing the assessment. We will review your results and get back to you soon.'
      });
      setShowInviteModal(false);
      setInviteStep('form');
      
      // Update assessment candidates count
      setTestCandidates(prev => prev.map(a => 
        a.id === selectedAssessment.id 
          ? { ...a, candidates: a.candidates + 1 }
          : a
      ));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateAssessment = () => {
    // Generate test name based on selections
    const testName = `${selectedRole} - ${selectedSkills.slice(0, 3).join(', ')} - ${selectedExperience.charAt(0).toUpperCase() + selectedExperience.slice(1)}`;
    
    // Create new assessment
    const newAssessment: Assessment = {
      id: Date.now().toString(),
      title: testName,
      type: 'technical',
      description: `${selectedExperience.charAt(0).toUpperCase() + selectedExperience.slice(1)}-level assessment for ${selectedRole} developers`,
      duration: selectedExperience === 'junior' ? 60 : selectedExperience === 'senior' ? 90 : 120,
      questions: selectedExperience === 'junior' ? 15 : selectedExperience === 'senior' ? 20 : 25,
      status: 'draft',
      candidates: 0,
      averageScore: 0,
      createdAt: new Date().toISOString().split('T')[0],
      tags: selectedSkills,
      difficulty: selectedExperience === 'junior' ? 'beginner' : selectedExperience === 'senior' ? 'intermediate' : 'advanced'
    };
    
    setTestCandidates(prev => [newAssessment, ...prev]);
    
    // Reset modal state
    setCreateStep('role');
    setSelectedRole('');
    setSelectedExperience('senior');
    setSelectedSkills([]);
    setSkillSearchQuery('');
    setShowCreateModal(false);
    
    // Navigate to the new assessment
    router.push(`/assessments/${newAssessment.id}`);
  };

  const resetCreateModal = () => {
    setCreateStep('role');
    setSelectedRole('');
    setSelectedExperience('senior');
    setSelectedSkills([]);
    setSkillSearchQuery('');
  };

  const handleCloseCreateModal = () => {
    resetCreateModal();
    setShowCreateModal(false);
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  if (currentView === 'questions' && selectedAssessment) {
    return (
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentView('list')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h1>
                <p className="text-gray-600 mt-1">{selectedAssessment.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button className="btn-primary">
                Save
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('details')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <Users className="h-4 w-4 inline mr-2" />
                Candidates
              </button>
              <button
                onClick={() => setCurrentView('questions')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Questions
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Insights
              </button>
            </nav>
          </div>

          {/* Test Overview */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Spring Framework</p>
                  <p className="text-xs text-purple-700">~6 questions</p>
                </div>
                <div className="text-purple-600">
                  <span className="text-lg font-bold">-160 pts</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-700">3 to 5 min</div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">React</p>
                  <p className="text-xs text-blue-700">~5 questions</p>
                </div>
                <div className="text-blue-600">
                  <span className="text-lg font-bold">-490 pts</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-700">17 to 33 min</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900">Java</p>
                  <p className="text-xs text-purple-700">~5 questions</p>
                </div>
                <div className="text-purple-600">
                  <span className="text-lg font-bold">-640 pts</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-purple-700">17 to 34 min</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900">JavaScript</p>
                  <p className="text-xs text-green-700">~9 questions</p>
                </div>
                <div className="text-green-600">
                  <span className="text-lg font-bold">-910 pts</span>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-700">17 to 33 min</div>
            </div>
          </div>

          {/* Test Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Total points: ~2200</p>
                  <p className="text-xs text-gray-600">Total questions: ~25</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total time: 53 to 105 min</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">Expected average score</span>
                              <span className="text-2xl font-bold text-blue-600">69%</span>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Your test section */}
          <div className="bg-gray-800 text-white p-6 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                <span className="font-medium">Your test</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="text-white border-white hover:bg-gray-700">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-gray-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button className="bg-gray-700 hover:bg-gray-600 text-white justify-center">
                Add a question
              </Button>
              <Button className="bg-gray-700 hover:bg-gray-600 text-white justify-center">
                Add a random block
              </Button>
            </div>

            {/* Question Blocks */}
            <div className="space-y-4">
              {/* Spring Framework Block */}
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      SPRING FRAMEWORK
                    </span>
                    <span className="text-gray-800 text-sm">Quiz Spring Framework (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">05:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* React Block */}
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      REACT
                    </span>
                    <span className="text-gray-800 text-sm">Quiz React (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">04:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* React Coding Exercise */}
              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      REACT
                    </span>
                    <span className="text-gray-800 text-sm">Coding exercises React (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Play className="h-4 w-4 mr-1" />
                    <span className="text-sm">29:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Java Quiz */}
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      JAVA
                    </span>
                    <span className="text-gray-800 text-sm">Quiz Java (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">05:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Java Coding Exercise */}
              <div className="bg-purple-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      JAVA
                    </span>
                    <span className="text-gray-800 text-sm">Coding exercises Java (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Play className="h-4 w-4 mr-1" />
                    <span className="text-sm">29:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* JavaScript Quiz */}
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      JAVASCRIPT
                    </span>
                    <span className="text-gray-800 text-sm">Quiz JavaScript (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">04:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* JavaScript Coding Exercise */}
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium mr-3">
                      JAVASCRIPT
                    </span>
                    <span className="text-gray-800 text-sm">Coding exercises JavaScript (Random questions)</span>
                    <div className="flex ml-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Play className="h-4 w-4 mr-1" />
                    <span className="text-sm">29:00</span>
                    <Button variant="outline" size="sm" className="ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tip Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Here is the test you created</h3>
            <p className="text-gray-600 mb-4">You can customize it!</p>
            <p className="text-sm text-gray-500">
              <strong>Tip:</strong> Make your test more relevant to the job you're hiring for by adding your own questions.
            </p>
            <Button className="btn-primary mt-4">
              Save
            </Button>
          </div>
        </div>
      </Layout>
    );
  } else if (currentView === 'settings' && selectedAssessment) {
    return (
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentView('list')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h1>
                <p className="text-gray-600 mt-1">{selectedAssessment.description}</p>
              </div>
            </div>
            <Button className="btn-primary">
              Save
            </Button>
          </div>

          {/* Main Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('details')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <Users className="h-4 w-4 inline mr-2" />
                Candidates
              </button>
              <button
                onClick={() => setCurrentView('questions')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Questions
              </button>
              <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Insights
              </button>
            </nav>
          </div>

          {/* Settings Sub-tabs */}
          <div className="bg-gray-50 border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSettingsTab('general')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  settingsTab === 'general'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                GENERAL
              </button>
              <button
                onClick={() => setSettingsTab('communication')}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  settingsTab === 'communication'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                COMMUNICATION
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="bg-white">
            {settingsTab === 'general' && (
              <div className="p-6 space-y-8">
                {/* Test Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name your test
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedAssessment.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    In which language should questions be asked to the candidates?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">English</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">French</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Spanish</span>
                    </label>
                  </div>
                </div>

                {/* Invitation Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of days after which invitations expire
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Simplified Report */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you want to send candidates a simplified report at the end of their test?
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="simplified-report"
                        defaultChecked
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="simplified-report"
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {/* Timer Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you like to time the candidate?
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Timer per Question */}
                    <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="timer-type"
                          defaultChecked
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 font-medium text-gray-900">TIMER PER QUESTION</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Each question is timed. When the timer for a question ends, the candidate automatically moves to the next question.
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Candidates can't revisit previous questions, even if they didn't use the full time allotted for that question.
                      </p>
                      <p className="text-sm text-blue-600 font-medium">(recommended)</p>
                    </div>

                    {/* Global Timer */}
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="timer-type"
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 font-medium text-gray-900">GLOBAL TIMER</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Candidates have a set amount of time to complete the entire test and can pace themselves as they wish.
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Candidates can revisit previous questions to check or update answers before submitting the test.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Allotted time (minutes)
                        </label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                          />
                          <span className="text-sm text-gray-600">No time limit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Integrity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Test integrity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Unusual activity alerts</h4>
                        <p className="text-sm text-gray-600">
                          Candidate reports will include alerts if suspicious activity is detected when analyzing the candidate's code.
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Copy/paste blocking</h4>
                        <p className="text-sm text-gray-600">
                          Candidates can't paste text from outside the environment.
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Follow-up questions</h4>
                        <p className="text-sm text-gray-600">
                          Candidates will sometimes answer follow-up questions after coding exercises. These questions are generated by ChatGPT and let you check candidates understand the code they provided.{' '}
                          <a href="#" className="text-blue-600 hover:underline">Find out more</a>
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Webcam proctoring</h4>
                        <p className="text-sm text-gray-600">
                          Candidates must activate their webcam before starting the test. Periodic snapshots will be taken.{' '}
                          <a href="#" className="text-blue-600 hover:underline">Find out more</a>
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Full-screen mode</h4>
                        <p className="text-sm text-gray-600">
                          Candidates must enter full-screen mode before starting the test. Exiting full-screen mode or switching to another monitor will trigger an alert.
                        </p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none">
                        <input
                          type="checkbox"
                          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'communication' && (
              <div className="p-6 space-y-8">
                {/* Test Communication and Branding */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Test communication and branding</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Choose which version to use for the logo, invitation email, and test start and end messages.
                  </p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="branding-version"
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Default version</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="branding-version"
                        defaultChecked
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Custom version for this test</span>
                    </label>
                  </div>
                </div>

                {/* Logo */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Logo</h4>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png"
                          alt="Emineon Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">4MB max • 500x500px • JPG, PNG, GIF</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Upload</Button>
                          <Button variant="outline" size="sm">Delete</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email subject
                  </label>
                  <input
                    type="text"
                    defaultValue="Technical assessment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Email Body */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email body
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center space-x-2">
                      <Button variant="outline" size="sm">B</Button>
                      <Button variant="outline" size="sm">I</Button>
                      <Button variant="outline" size="sm">≡</Button>
                      <Button variant="outline" size="sm">•</Button>
                      <Button variant="outline" size="sm">🔗</Button>
                      <Button variant="outline" size="sm">🖼</Button>
                      <Button variant="outline" size="sm">✏️</Button>
                      <span className="text-sm text-gray-600">[[LINK]]</span>
                      <span className="text-sm text-gray-600">[[NAME]]</span>
                      <div className="ml-auto">
                        <label className="flex items-center text-sm text-gray-600">
                          <input type="checkbox" className="mr-2" />
                          Source
                        </label>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-900 mb-2">Bonjour Mourchidi,</p>
                      <p className="text-sm text-gray-900 mb-2">
                        Comme convenu, vous trouverez ci-dessous le lien vers le test technique pour le poste de développeur full-stack chez notre client, Salt Mobile :
                      </p>
                      <p className="text-sm text-blue-600 underline mb-2">Open the test</p>
                      <p className="text-sm text-gray-900">
                        Nous vous souhaitons bonne chance pour votre candidature à Salt Mobile.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Introduction Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction title
                  </label>
                  <input
                    type="text"
                    defaultValue="Welcome. You've been invited to take a test."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Introduction Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Introduction text
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center space-x-2">
                      <select className="text-sm border-none bg-transparent">
                        <option>Paragraph</option>
                      </select>
                      <Button variant="outline" size="sm">B</Button>
                      <Button variant="outline" size="sm">I</Button>
                      <Button variant="outline" size="sm">≡</Button>
                      <Button variant="outline" size="sm">•</Button>
                      <Button variant="outline" size="sm">🔗</Button>
                      <Button variant="outline" size="sm">🖼</Button>
                      <Button variant="outline" size="sm">✏️</Button>
                      <div className="ml-auto">
                        <label className="flex items-center text-sm text-gray-600">
                          <input type="checkbox" className="mr-2" />
                          Source
                        </label>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-900 mb-2">
                        You can take our tutorial first so you feel comfortable and perform your best.
                      </p>
                      <p className="text-sm text-gray-900 font-bold">
                        You must complete this test on your own.
                      </p>
                    </div>
                  </div>
                </div>

                {/* End Page Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title of your test's end page
                  </label>
                  <input
                    type="text"
                    defaultValue="Your test has been successfully submitted"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Page Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text for your test's end page
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex items-center space-x-2">
                      <select className="text-sm border-none bg-transparent">
                        <option>Paragraph</option>
                      </select>
                      <Button variant="outline" size="sm">B</Button>
                      <Button variant="outline" size="sm">I</Button>
                      <Button variant="outline" size="sm">≡</Button>
                      <Button variant="outline" size="sm">•</Button>
                      <Button variant="outline" size="sm">🔗</Button>
                      <Button variant="outline" size="sm">🖼</Button>
                      <Button variant="outline" size="sm">✏️</Button>
                      <div className="ml-auto">
                        <label className="flex items-center text-sm text-gray-600">
                          <input type="checkbox" className="mr-2" />
                          Source
                        </label>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-900 mb-2">Thank you for completing the test.</p>
                      <p className="text-sm text-gray-900">The recruiter has received your results.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  } else if (currentView === 'details' && selectedAssessment) {
    return (
      <Layout>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setCurrentView('list')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedAssessment.title}</h1>
                <p className="text-gray-600 mt-1">{selectedAssessment.description}</p>
              </div>
            </div>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send test
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setCurrentView('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Candidates
              </button>
              <button
                onClick={() => setCurrentView('questions')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                Questions
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm"
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Settings
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Insights
              </button>
            </nav>
          </div>

          {/* Status Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium bg-white rounded-md shadow-sm text-gray-900">
                <Users className="h-4 w-4 inline mr-2" />
                All (8)
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                To review (8) <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Rejected (0)
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Passed (0)
              </button>
            </div>
            
            <div className="flex items-center space-x-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or tag"
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Java
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      JavaScript
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      React
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testCandidates.map((candidate) => (
                    <tr 
                      key={candidate.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowCandidateDrawer(true);
                        setCandidateDrawerTab('report');
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(candidate.invitedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {candidate.status === 'completed' && candidate.score ? (
                          <span className="text-sm font-medium text-gray-900">{candidate.score}%</span>
                        ) : (
                          getStatusBadge(candidate.status)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInviteModal(true);
                            setInviteStep('form');
                          }}
                        >
                          Invite
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Enhanced Invite Modal */}
        {showInviteModal && (selectedAssessment || currentView === 'details') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {inviteStep === 'form' && 'Invite candidates'}
                    {inviteStep === 'preview' && 'Preview invitation'}
                    {inviteStep === 'settings' && 'Test settings'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Test: {selectedAssessment?.title || 'Assessment'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteStep('form');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setInviteStep('form')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      inviteStep === 'form'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <UserPlus className="h-4 w-4 inline mr-2" />
                    Invite
                  </button>
                  <button
                    onClick={() => setInviteStep('preview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      inviteStep === 'preview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Eye className="h-4 w-4 inline mr-2" />
                    Preview
                  </button>
                  <button
                    onClick={() => setInviteStep('settings')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      inviteStep === 'settings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Settings className="h-4 w-4 inline mr-2" />
                    Settings
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {inviteStep === 'form' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                          placeholder="Ada Lovelace"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          placeholder="ada@example.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <input
                        type="text"
                        value={inviteForm.tags}
                        onChange={(e) => setInviteForm({...inviteForm, tags: e.target.value})}
                        placeholder="Location, contract type, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                      <input
                        type="text"
                        value={inviteForm.emailSubject}
                        onChange={(e) => setInviteForm({...inviteForm, emailSubject: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
                      <textarea
                        value={inviteForm.customMessage}
                        onChange={(e) => setInviteForm({...inviteForm, customMessage: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {inviteStep === 'preview' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-4">Email Preview</h4>
                      <div className="bg-white p-6 rounded border">
                        <div className="border-b pb-4 mb-4">
                          <p className="text-sm text-gray-600">Subject: {inviteForm.emailSubject}</p>
                          <p className="text-sm text-gray-600">To: {inviteForm.email}</p>
                        </div>
                        
                        {inviteSettings.customBranding && (
                          <div className="mb-6">
                            <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded text-sm font-bold">
                              Emineon
                            </div>
                          </div>
                        )}

                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{inviteForm.introTitle}</h3>
                        <p className="text-gray-700 mb-4">{inviteForm.introText}</p>
                        
                        {inviteForm.customMessage && (
                          <div className="bg-blue-50 p-4 rounded mb-4">
                            <p className="text-gray-700">{inviteForm.customMessage}</p>
                          </div>
                        )}

                        <div className="bg-gray-50 p-4 rounded mb-6">
                          <h4 className="font-medium text-gray-900 mb-2">Assessment Details</h4>
                          <p className="text-sm text-gray-600">Test: {selectedAssessment?.title || 'Assessment'}</p>
                          <p className="text-sm text-gray-600">Duration: {selectedAssessment?.duration || 0} minutes</p>
                          <p className="text-sm text-gray-600">Questions: {selectedAssessment?.questions || 0}</p>
                        </div>

                        <div className="text-center">
                          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
                            Start Assessment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {inviteStep === 'settings' && (
                  <div className="space-y-8">
                    {/* General Settings */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">General Settings</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Test name</label>
                          <input
                            type="text"
                            value={inviteSettings.testName}
                            onChange={(e) => setInviteSettings({...inviteSettings, testName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Languages</label>
                          <div className="space-y-2">
                            {Object.entries(inviteSettings.languages).map(([lang, checked]) => (
                              <label key={lang} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => setInviteSettings({
                                    ...inviteSettings,
                                    languages: { ...inviteSettings.languages, [lang]: e.target.checked }
                                  })}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 capitalize">{lang}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Invitation expiry (days)</label>
                          <input
                            type="number"
                            value={inviteSettings.invitationExpiry}
                            onChange={(e) => setInviteSettings({...inviteSettings, invitationExpiry: parseInt(e.target.value)})}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Timer Options</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div 
                              className={`p-4 border-2 rounded-lg cursor-pointer ${
                                inviteSettings.timerType === 'per-question' 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setInviteSettings({...inviteSettings, timerType: 'per-question'})}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-900">Timer per Question</h5>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Recommended</span>
                              </div>
                              <p className="text-sm text-gray-600">Each question has its own time limit</p>
                            </div>
                            
                            <div 
                              className={`p-4 border-2 rounded-lg cursor-pointer ${
                                inviteSettings.timerType === 'global' 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setInviteSettings({...inviteSettings, timerType: 'global'})}
                            >
                              <h5 className="font-medium text-gray-900 mb-2">Global Timer</h5>
                              <p className="text-sm text-gray-600">One timer for the entire test</p>
                              {inviteSettings.timerType === 'global' && (
                                <label className="flex items-center mt-3">
                                  <input
                                    type="checkbox"
                                    checked={inviteSettings.noTimeLimit}
                                    onChange={(e) => setInviteSettings({...inviteSettings, noTimeLimit: e.target.checked})}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">No time limit</span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Test Integrity */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Test Integrity</h4>
                      <div className="space-y-4">
                        {Object.entries(inviteSettings.testIntegrity).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {key === 'unusualActivity' && 'Get notified of suspicious behavior'}
                                {key === 'copyPasteBlocking' && 'Prevent copy/paste in the test'}
                                {key === 'followUpQuestions' && 'Ask additional questions based on answers'}
                                {key === 'webcamProctoring' && 'Record candidate during the test'}
                                {key === 'fullScreenMode' && 'Force full-screen mode during test'}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <button
                                onClick={() => setInviteSettings({
                                  ...inviteSettings,
                                  testIntegrity: { ...inviteSettings.testIntegrity, [key]: !value }
                                })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  value ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              {(key === 'followUpQuestions' || key === 'webcamProctoring') && (
                                <button className="ml-3 text-xs text-blue-600 hover:text-blue-800">
                                  Find out more
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Communication & Branding */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Communication & Branding</h4>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Version</label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="branding"
                                checked={!inviteSettings.customBranding}
                                onChange={() => setInviteSettings({...inviteSettings, customBranding: false})}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Default</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="branding"
                                checked={inviteSettings.customBranding}
                                onChange={() => setInviteSettings({...inviteSettings, customBranding: true})}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Custom</span>
                            </label>
                          </div>
                        </div>

                        {inviteSettings.customBranding && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">Logo</label>
                              <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                  <img 
                                    src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Emineon_logo_tree_k8n5vj.png"
                                    alt="Emineon Logo"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-2">4MB max • 500x500px • JPG, PNG, GIF</p>
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Upload</Button>
                                    <Button variant="outline" size="sm">Delete</Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Introduction title</label>
                              <input
                                type="text"
                                value={inviteForm.introTitle}
                                onChange={(e) => setInviteForm({...inviteForm, introTitle: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Introduction text</label>
                              <textarea
                                value={inviteForm.introText}
                                onChange={(e) => setInviteForm({...inviteForm, introText: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">End page title</label>
                              <input
                                type="text"
                                value={inviteForm.endTitle}
                                onChange={(e) => setInviteForm({...inviteForm, endTitle: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">End page text</label>
                              <textarea
                                value={inviteForm.endText}
                                onChange={(e) => setInviteForm({...inviteForm, endText: e.target.value})}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteStep('form');
                  }}
                >
                  Cancel
                </Button>
                <div className="flex space-x-3">
                  {inviteStep === 'preview' && (
                    <Button 
                      variant="outline"
                      onClick={() => setInviteStep('form')}
                    >
                      Back to Form
                    </Button>
                  )}
                  {inviteStep === 'settings' && (
                    <Button 
                      variant="outline"
                      onClick={() => setInviteStep('form')}
                    >
                      Back to Form
                    </Button>
                  )}
                  {inviteStep === 'form' && (
                    <>
                      <Button 
                        variant="outline"
                        onClick={() => setInviteStep('settings')}
                      >
                        Settings
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setInviteStep('preview')}
                        disabled={!inviteForm.email}
                      >
                        Preview
                      </Button>
                    </>
                  )}
                  <Button 
                    onClick={handleInviteCandidate}
                    className="btn-primary"
                    disabled={!inviteForm.email}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600 mt-1">Create and manage technical assessments for candidates</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              className="border-primary-500 text-primary-600 hover:bg-primary-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Assessment</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by test name, domain, or candidate"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tests Display - Grid or List View */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                      Tests
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Candidates
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Domains
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Last activity
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Timeline
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-4 min-w-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 mt-1">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <Code className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <button
                              onClick={() => {
                                router.push(`/assessments/${assessment.id}`);
                              }}
                              className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block truncate max-w-xs"
                              title={assessment.title}
                            >
                              <span className="line-clamp-2 leading-tight">
                                {assessment.title}
                              </span>
                            </button>
                            <div className="text-sm text-gray-500 truncate max-w-xs" title={assessment.description}>
                              {assessment.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assessment.candidates}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {assessment.tags?.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {assessment.tags && assessment.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{assessment.tags.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(assessment.createdAt)}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.duration} min
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssessment(assessment);
                            setInviteSettings(prev => ({ ...prev, testName: assessment.title }));
                            setShowInviteModal(true);
                            setInviteStep('form');
                          }}
                        >
                          Invite
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow cursor-pointer h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Code className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setCurrentView('details');
                          }}
                          className="text-sm font-semibold text-gray-900 hover:text-blue-600 text-left block w-full"
                          title={assessment.title}
                        >
                          <span className="line-clamp-2 leading-tight">
                            {assessment.title}
                          </span>
                        </button>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{assessment.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {assessment.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    {assessment.tags?.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-20"
                        title={tag}
                      >
                        {tag}
                      </span>
                    ))}
                    {assessment.tags && assessment.tags.length > 2 && (
                      <span className="text-xs text-gray-500">+{assessment.tags.length - 2}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="font-medium text-sm">{assessment.duration} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Questions</p>
                      <p className="font-medium text-sm">{assessment.questions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Candidates</p>
                      <p className="font-medium text-sm">{assessment.candidates}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Avg Score</p>
                      <p className="font-medium text-sm">{assessment.averageScore}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 min-w-0 flex-1">
                      {getStatusBadge(assessment.status)}
                      {assessment.aiGenerated && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Brain className="h-3 w-3 mr-1" />
                          AI
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 h-7 flex-shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAssessment(assessment);
                        setInviteSettings(prev => ({ ...prev, testName: assessment.title }));
                        setShowInviteModal(true);
                        setInviteStep('form');
                      }}
                    >
                      Invite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Drawer */}
      {showCandidateDrawer && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedCandidate.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCandidateDrawer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setCandidateDrawerTab('report')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    candidateDrawerTab === 'report'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Report
                </button>
                <button
                  onClick={() => setCandidateDrawerTab('candidate')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    candidateDrawerTab === 'candidate'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Candidate
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-full">
              {candidateDrawerTab === 'report' && (
                <div className="space-y-6">
                  {selectedCandidate.status === 'completed' ? (
                    <>
                      {/* Score Summary */}
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">Better than</h4>
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-600">Rank</span>
                          </div>
                        </div>
                        <div className="flex items-end space-x-4">
                          <div className="text-4xl font-bold text-yellow-600">{selectedCandidate.percentage}%</div>
                          <div className="text-lg text-gray-600 mb-1">of professionals</div>
                          <div className="ml-auto text-right">
                            <div className="text-2xl font-bold text-gray-900">{selectedCandidate.rank}/4</div>
                            <div className="text-sm text-gray-500">Rank</div>
                          </div>
                        </div>
                      </div>

                      {/* Test Details */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-semibold text-gray-900">{selectedCandidate.duration}</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <CheckCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">Points</div>
                          <div className="font-semibold text-gray-900">
                            {selectedCandidate.points} / {selectedCandidate.maxPoints} ({selectedCandidate.percentage}%)
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-2">
                            <TrendingUp className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">Score</div>
                          <div className="font-semibold text-gray-900">{selectedCandidate.score}%</div>
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills Assessment</h4>
                        <div className="space-y-4">
                          {selectedCandidate.skills?.map((skill, index) => (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                <span className="text-sm text-gray-500">
                                  Better than {skill.percentage}% of professionals
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${skill.percentage}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{skill.score} / {skill.maxScore}pts</span>
                                <span>{skill.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Update Status */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Update status</h4>
                        <div className="flex space-x-3">
                          <button className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                            <Users className="h-4 w-4 inline mr-2" />
                            To review
                          </button>
                          <button className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors">
                            <X className="h-4 w-4 inline mr-2" />
                            Rejected
                          </button>
                          <button className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors">
                            <CheckCircle className="h-4 w-4 inline mr-2" />
                            Passed
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                          Actions
                          <ChevronDown className="h-4 w-4 inline ml-2" />
                        </button>
                        <button className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                          View detailed report
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Non-completed status */}
                      <div className="text-center py-12">
                        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          {selectedCandidate.status === 'expired' ? (
                            <AlertCircle className="h-8 w-8 text-red-500" />
                          ) : selectedCandidate.status === 'invited' ? (
                            <Mail className="h-8 w-8 text-blue-500" />
                          ) : (
                            <Clock className="h-8 w-8 text-yellow-500" />
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedCandidate.status === 'expired' && 'Test Expired'}
                          {selectedCandidate.status === 'invited' && 'Invitation Sent'}
                          {selectedCandidate.status === 'started' && 'Test In Progress'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {selectedCandidate.status === 'expired' && 'This candidate\'s test invitation has expired.'}
                          {selectedCandidate.status === 'invited' && 'Waiting for the candidate to start the test.'}
                          {selectedCandidate.status === 'started' && 'The candidate is currently taking the test.'}
                        </p>
                        
                        {selectedCandidate.status === 'expired' && (
                          <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                            Invite again
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {candidateDrawerTab === 'candidate' && (
                <div className="space-y-6">
                  {/* History */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <h4 className="text-lg font-semibold text-gray-900">History</h4>
                    </div>
                    <div className="space-y-4">
                      {selectedCandidate.history?.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                              {event.action.includes('completed') && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {event.action.includes('started') && <Play className="h-4 w-4 text-blue-600" />}
                              {event.action.includes('opened') && <Eye className="h-4 w-4 text-blue-600" />}
                              {event.action.includes('sent') && <Send className="h-4 w-4 text-gray-600" />}
                              {event.action.includes('expired') && <AlertCircle className="h-4 w-4 text-red-600" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">{event.action}</p>
                              <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-500">{event.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Update Status */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Update status</h4>
                    <div className="flex space-x-3">
                      <button className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors">
                        <Users className="h-4 w-4 inline mr-2" />
                        To review
                      </button>
                      <button className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors">
                        <X className="h-4 w-4 inline mr-2" />
                        Rejected
                      </button>
                      <button className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition-colors">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Passed
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                      Actions
                      <ChevronDown className="h-4 w-4 inline ml-2" />
                    </button>
                    {selectedCandidate.status === 'completed' && (
                      <button className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                        View detailed report
                      </button>
                    )}
                    {selectedCandidate.status === 'expired' && (
                      <button className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                        Invite again
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary-900">Create a new test</h2>
                  <p className="text-primary-700">
                    {createStep === 'role' && 'Which role do you want to test?'}
                    {createStep === 'experience' && 'What is the required experience?'}
                    {createStep === 'skills' && 'Which skills do you want to test?'}
                    {createStep === 'ready' && 'Send it to a candidate or edit the selected questions.'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseCreateModal}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {createStep === 'role' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Which role do you want to test?</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`p-4 text-left border-2 rounded-lg transition-all ${
                            selectedRole === role
                              ? 'border-primary-400 bg-primary-50 text-primary-800'
                              : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {role === 'Other' && (
                            <div className="flex items-center">
                              <Edit className="h-4 w-4 mr-2 text-primary-600" />
                              <span className="font-medium">{role}</span>
                            </div>
                          )}
                          {role !== 'Other' && (
                            <span className="font-medium">{role}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {createStep === 'experience' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">2. What is the required experience?</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'junior', label: 'Junior', description: '1-3 years' },
                        { value: 'senior', label: 'Senior', description: '3-5 years' },
                        { value: 'expert', label: 'Expert', description: '5+ years' }
                      ].map((level) => (
                        <label
                          key={level.value}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedExperience === level.value
                              ? 'border-primary-400 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="experience"
                            value={level.value}
                            checked={selectedExperience === level.value}
                            onChange={(e) => setSelectedExperience(e.target.value as 'junior' | 'senior' | 'expert')}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedExperience === level.value
                              ? 'border-primary-400 bg-primary-400'
                              : 'border-gray-300'
                          }`}>
                            {selectedExperience === level.value && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{level.label}</div>
                            <div className="text-sm text-gray-500">{level.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {createStep === 'skills' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      3. Which skills do you want to test? ({selectedSkills.length} selected)
                    </h3>
                    
                    {/* Selected Skills */}
                    {selectedSkills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-primary-600 hover:text-primary-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search for a language, framework, or technical skill"
                        value={skillSearchQuery}
                        onChange={(e) => setSkillSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    {/* Available Skills */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => addSkill(skill)}
                          className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {createStep === 'ready' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-primary-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Your test is ready!</h3>
                      <p className="text-gray-600">Send it to a candidate or edit the selected questions.</p>
                    </div>

                    {/* Test Details */}
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-6">
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900 mb-2">Test name:</h4>
                        <p className="text-gray-700 mb-4">
                          {selectedRole} - {selectedExperience.charAt(0).toUpperCase() + selectedExperience.slice(1)}
                          <button className="ml-2 text-primary-600 hover:text-primary-700">
                            <Edit className="h-4 w-4 inline" />
                          </button>
                        </p>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Clock className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="text-sm text-gray-500">Duration</div>
                            <div className="font-semibold text-gray-900">
                              {selectedExperience === 'junior' ? '3-5 min' : selectedExperience === 'senior' ? '3-5 min' : '3-5 min'} 
                              ({selectedExperience === 'junior' ? '~7' : selectedExperience === 'senior' ? '~7' : '~7'} questions)
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Globe className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="text-sm text-gray-500">Language</div>
                            <div className="font-semibold text-gray-900">English</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Shield className="h-5 w-5 text-primary-500" />
                            </div>
                            <div className="text-sm text-gray-500">Anti-cheating</div>
                            <div className="font-semibold text-gray-900">Default options</div>
                          </div>
                        </div>

                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Edit settings
                        </button>
                      </div>
                    </div>

                    {/* Test Structure */}
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 mb-4">Test structure:</h4>
                      <div className="bg-white border border-primary-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            <span className="font-medium text-gray-900">{selectedRole}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedExperience === 'junior' ? '3-5 min' : selectedExperience === 'senior' ? '3-5 min' : '3-5 min'} 
                            ({selectedExperience === 'junior' ? '~7' : selectedExperience === 'senior' ? '~7' : '~7'} questions)
                          </div>
                          <div className="text-sm text-gray-500 capitalize">{selectedExperience}</div>
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-400 hover:text-primary-600">
                              <FileText className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-primary-600">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-primary-50">
              <div className="flex items-center space-x-4">
                {createStep !== 'role' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (createStep === 'experience') setCreateStep('role');
                      else if (createStep === 'skills') setCreateStep('experience');
                      else if (createStep === 'ready') setCreateStep('skills');
                    }}
                    className="border-primary-300 text-primary-700 hover:bg-primary-100"
                  >
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {createStep === 'ready' && (
                  <Button variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
                    See questions
                  </Button>
                )}
                
                {createStep !== 'ready' ? (
                  <Button 
                    onClick={() => {
                      if (createStep === 'role' && selectedRole) setCreateStep('experience');
                      else if (createStep === 'experience') setCreateStep('skills');
                      else if (createStep === 'skills' && selectedSkills.length > 0) setCreateStep('ready');
                    }}
                    disabled={
                      (createStep === 'role' && !selectedRole) ||
                      (createStep === 'skills' && selectedSkills.length === 0)
                    }
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {createStep === 'role' && 'Next step: choose skills'}
                    {createStep === 'experience' && 'Next step: choose skills'}
                    {createStep === 'skills' && 'Create my test'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateAssessment}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Invite candidates
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}