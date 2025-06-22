'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { PipelineKanban } from '@/components/jobs/PipelineKanban';
import { CandidateDrawer } from '@/components/jobs/CandidateDrawer';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import { AddCandidateDropdown } from '@/components/jobs/AddCandidateDropdown';
import { AddExistingCandidateModal } from '@/components/jobs/AddExistingCandidateModal';
import {
  ArrowLeft,
  Edit,
  Share2,
  MoreHorizontal,
  Users,
  Calendar,
  MapPin,
  Building2,
  Clock,
  Target,
  Star,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Settings,
  Eye,
  UserPlus
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [showExistingCandidateModal, setShowExistingCandidateModal] = useState(false);

  // Mock pipeline stages
  const pipelineStages = [
    { id: 'sourced', name: 'Sourced', color: 'bg-gray-100', count: 8, description: 'Initial candidates identified' },
    { id: 'screened', name: 'Screened', color: 'bg-blue-100', count: 5, description: 'Phone/video screening completed' },
    { id: 'interviewing', name: 'Interviewing', color: 'bg-yellow-100', count: 3, description: 'Technical/panel interviews in progress' },
    { id: 'submitted', name: 'Submitted', color: 'bg-purple-100', count: 2, description: 'Submitted to client for review' },
    { id: 'offer', name: 'Offer', color: 'bg-orange-100', count: 1, description: 'Offer extended to candidate' },
    { id: 'hired', name: 'Hired', color: 'bg-green-100', count: 0, description: 'Successfully placed' }
  ];

  // Fetch real candidates from the database
  const fetchCandidates = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/candidates`);
      if (response.ok) {
        const candidateData = await response.json();
        setCandidates(candidateData);
      } else {
        console.error('Failed to fetch candidates');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    }
  };

  // Pipeline handlers
  const handleCandidateMove = (candidateId: string, newStage: string) => {
    setCandidates((prev: any[]) => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              stage: newStage,
              timeline: [
                { 
                  date: new Date().toISOString().split('T')[0], 
                  action: `Moved to ${pipelineStages.find(s => s.id === newStage)?.name}`, 
                  type: 'stage_change' 
                },
                ...candidate.timeline
              ]
            }
          : candidate
      )
    );
  };

  const handleCandidateSelect = (candidate: any) => {
    setSelectedCandidate(candidate);
  };

  const handleAddExistingCandidate = () => {
    setShowExistingCandidateModal(true);
  };

  const handleCreateNewCandidate = () => {
    setShowCreateCandidateModal(true);
  };

  const handleCandidateAdded = (candidate: any) => {
    // Refresh the candidates list
    fetchCandidates();
  };

  // Fetch job data from API
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const jobData = await response.json();
          setJob({
            id: jobData.id,
            title: jobData.title,
            company: 'Emineon ATS', // Default company
            location: jobData.location,
            contractType: jobData.employmentType?.[0] || 'Permanent',
            workMode: jobData.isRemote ? 'Remote' : 'Hybrid',
            status: jobData.status === 'ACTIVE' ? 'Active' : jobData.status === 'DRAFT' ? 'Draft' : jobData.status,
            priority: 'High', // Default priority
            candidates: jobData._count?.applications || 0,
            applications: jobData._count?.applications || 0,
            daysToFill: Math.floor((new Date().getTime() - new Date(jobData.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            slaProgress: 75, // Default progress
            skills: jobData.requirements?.filter((req: string) => req.startsWith('Skill:')).map((req: string) => req.replace('Skill: ', '')) || [],
            salary: jobData.salaryMin && jobData.salaryMax 
              ? `${jobData.salaryCurrency} ${(jobData.salaryMin / 1000).toFixed(0)}k - ${(jobData.salaryMax / 1000).toFixed(0)}k`
              : jobData.salaryMin 
                ? `${jobData.salaryCurrency} ${(jobData.salaryMin / 1000).toFixed(0)}k+`
                : 'Salary not specified',
            posted: new Date(jobData.createdAt).toLocaleDateString(),
            owner: 'David V', // Default owner
            description: jobData.description || 'No description available',
          });
        } else {
          setError('Failed to fetch job details');
        }
      } catch (err) {
        setError('Error fetching job details');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
      fetchCandidates();
    }
  }, [jobId]);

  // Default job data for loading state
  const defaultJob = {
    id: jobId,
    title: 'Senior Software Engineer',
    company: 'Credit Suisse',
    location: 'Zurich, Switzerland',
    contractType: 'Permanent',
    workMode: 'Hybrid',
    status: 'Active',
    priority: 'High',
    candidates: 24,
    applications: 156,
    daysToFill: 12,
    slaProgress: 75,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL'],
    salary: 'CHF 120,000 - 150,000',
    posted: '2 days ago',
    owner: 'Sarah Chen',
    description: `We are looking for a Senior Software Engineer to join our dynamic team at Credit Suisse. You will be responsible for developing and maintaining high-quality software solutions that support our financial services.

Key Responsibilities:
• Design and develop scalable web applications using React and TypeScript
• Collaborate with cross-functional teams to deliver high-quality software
• Participate in code reviews and maintain coding standards
• Optimize applications for maximum speed and scalability
• Stay up-to-date with emerging technologies and industry trends

Requirements:
• 5+ years of experience in software development
• Strong proficiency in React, TypeScript, and Node.js
• Experience with cloud platforms (AWS preferred)
• Knowledge of containerization technologies (Docker, Kubernetes)
• Excellent problem-solving and communication skills
• Bachelor's degree in Computer Science or related field`,
    pipeline: {
      applied: 156,
      screening: 24,
      interview: 8,
      offer: 2
    }
  };

  const tabs = [
    { id: 'pipeline', label: 'Pipeline', icon: Users },
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'candidates', label: 'Candidates', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pipeline':
        return (
          <PipelineKanban 
            candidates={candidates}
            stages={pipelineStages}
            onCandidateMove={handleCandidateMove}
            onCandidateSelect={handleCandidateSelect}
            onAddCandidate={handleCreateNewCandidate}
            AddCandidateComponent={() => (
              <AddCandidateDropdown
                onAddExisting={handleAddExistingCandidate}
                onCreateNew={handleCreateNewCandidate}
              />
            )}
          />
        );
      
      case 'overview':
        return (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Job Description</h3>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                    {job.description}
                  </pre>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Job Description</h3>
                  <div className="prose prose-sm text-gray-600 mb-6">
                    <p>{displayJob.description}</p>
                  </div>
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {displayJob?.skills?.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Job Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Salary Range</span>
                      <span className="font-medium">{displayJob.salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Contract Type</span>
                      <span className="font-medium">{displayJob.contractType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Work Mode</span>
                      <span className="font-medium">{displayJob.workMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Posted</span>
                      <span className="font-medium">{displayJob.posted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      case 'candidates':
        return (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate Management</h3>
            <p className="text-gray-500 mb-6">
              Detailed candidate list and management coming soon
            </p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Settings</h3>
            <p className="text-gray-500 mb-6">
              Job configuration and settings coming soon
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Use job state or default job for display
  const displayJob = job || defaultJob;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Job Header Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{displayJob.title}</h1>
                <Star className={`h-5 w-5 ${getPriorityColor(displayJob.priority)}`} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayJob.status)}`}>
                  {displayJob.status}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{displayJob.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{displayJob.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted {displayJob.posted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{displayJob.applications}</div>
              <div className="text-sm text-gray-500">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{displayJob.candidates}</div>
              <div className="text-sm text-gray-500">In Pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{displayJob.daysToFill}</div>
              <div className="text-sm text-gray-500">Days Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{displayJob.slaProgress}%</div>
              <div className="text-sm text-gray-500">SLA Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>

      {/* Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedCandidate}
        stages={pipelineStages}
        onClose={() => setSelectedCandidate(null)}
        onStageChange={(candidateId: string, newStage: string) => {
          handleCandidateMove(candidateId, newStage);
          if (selectedCandidate?.id === candidateId) {
            setSelectedCandidate((prev: any) => ({ ...prev, stage: newStage }));
          }
        }}
        onRatingChange={(candidateId: string, newRating: number) => {
          setCandidates((prev: any[]) => 
            prev.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, rating: newRating }
                : candidate
            )
          );
          if (selectedCandidate?.id === candidateId) {
            setSelectedCandidate((prev: any) => ({ ...prev, rating: newRating }));
          }
        }}
        onNotesUpdate={(candidateId: string, notes: string) => {
          setCandidates((prev: any[]) => 
            prev.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, notes }
                : candidate
            )
          );
          if (selectedCandidate?.id === candidateId) {
            setSelectedCandidate((prev: any) => ({ ...prev, notes }));
          }
        }}
      />

      {/* Create Candidate Modal */}
      <CreateCandidateModal
        open={showCreateCandidateModal}
        onClose={() => setShowCreateCandidateModal(false)}
        jobId={jobId}
        onCandidateCreated={(candidate) => {
          // Refresh candidates list
          fetchCandidates();
          setShowCreateCandidateModal(false);
        }}
      />

      {/* Add Existing Candidate Modal */}
      <AddExistingCandidateModal
        open={showExistingCandidateModal}
        onClose={() => setShowExistingCandidateModal(false)}
        jobId={jobId}
        onCandidateAdded={handleCandidateAdded}
      />
    </Layout>
  );
} 