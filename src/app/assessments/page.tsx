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
  Trash2
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
}

export default function AssessmentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
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
      createdAt: '2024-01-15'
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
    questions: []
  });

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
      questions: []
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assessment Framework</h1>
            <p className="text-gray-600">Create and manage candidate assessments</p>
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
                          <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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

                <Textarea
                  label="Description"
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this assessment evaluates..."
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    value={newAssessment.duration.toString()}
                    onChange={(e) => setNewAssessment(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    placeholder="60"
                  />
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Configuration</h3>
                  
                  {newAssessment.type === 'technical' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Technical Assessment Features</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Code challenges and programming questions</li>
                        <li>• Algorithm and data structure problems</li>
                        <li>• Technology-specific questions</li>
                        <li>• Automated code evaluation</li>
                      </ul>
                    </div>
                  )}

                  {newAssessment.type === 'personality' && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">Personality Assessment Features</h4>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Big Five personality traits</li>
                        <li>• Work style preferences</li>
                        <li>• Team collaboration assessment</li>
                        <li>• Cultural fit evaluation</li>
                      </ul>
                    </div>
                  )}

                  {newAssessment.type === 'cognitive' && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900">Cognitive Assessment Features</h4>
                      <ul className="text-sm text-purple-700 mt-2 space-y-1">
                        <li>• Logical reasoning tests</li>
                        <li>• Pattern recognition</li>
                        <li>• Problem-solving scenarios</li>
                        <li>• Critical thinking evaluation</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button onClick={createAssessment} className="flex-1">
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
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <h3 className="text-lg font-medium">Success Rate</h3>
                    <p className="text-3xl font-bold mt-2">73%</p>
                    <p className="text-blue-100 text-sm">Candidates passing assessments</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <h3 className="text-lg font-medium">Completion Rate</h3>
                    <p className="text-3xl font-bold mt-2">89%</p>
                    <p className="text-green-100 text-sm">Assessments completed</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
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