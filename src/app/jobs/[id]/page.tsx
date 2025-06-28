'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { PipelineKanban } from '@/components/jobs/PipelineKanban';
import { CandidateDrawer } from '@/components/jobs/CandidateDrawer';
import { AddCandidateDropdown } from '@/components/jobs/AddCandidateDropdown';
import { AddExistingCandidateModal } from '@/components/jobs/AddExistingCandidateModal';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import {
  ArrowLeft,
  Edit,
  Share2,
  MoreHorizontal,
  Users,
  Calendar,
  MapPin,
  Building2,
  Star,
  Eye,
  UserPlus,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  contractType: string;
  workMode: string;
  status: string;
  priority: string;
  candidates: number;
  applications: number;
  daysToFill: number;
  slaProgress: number;
  skills: string[];
  salary: string;
  posted: string;
  owner: string;
  description: string;
}

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string;
  stage: string;
  rating: number;
  avatar?: string;
  lastInteraction: string;
  availability: string;
  source: string;
  skills: string[];
  experience: string;
  currentRole: string;
  notes: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  tags: string[];
  timeline: Array<{
    date: string;
    action: string;
    type: string;
  }>;
  // Additional fields for compatibility
  name?: string;
  title?: string;
  location?: string;
  matchScore?: number;
  status?: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  
  const jobId = params?.id as string;
  const [activeTab, setActiveTab] = useState('pipeline');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Candidate management modals
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);

  // Wait for Clerk to be fully loaded before making API calls
  const isFullyLoaded = userLoaded && authLoaded;

  // Mock pipeline stages - safe fallback data
  const pipelineStages = [
    { id: 'sourced', name: 'Sourced', color: 'bg-gray-100', count: 0, description: 'Initial candidates identified' },
    { id: 'screened', name: 'Screened', color: 'bg-blue-100', count: 0, description: 'Phone/video screening completed' },
    { id: 'interviewing', name: 'Interviewing', color: 'bg-yellow-100', count: 0, description: 'Technical interviews in progress' },
    { id: 'submitted', name: 'Submitted', color: 'bg-purple-100', count: 0, description: 'Submitted to client' },
    { id: 'offer', name: 'Offer', color: 'bg-orange-100', count: 0, description: 'Offer extended' },
    { id: 'hired', name: 'Hired', color: 'bg-green-100', count: 0, description: 'Successfully hired' }
  ];

  // Fetch real job data when authentication is ready
  useEffect(() => {
    if (!isFullyLoaded || !user || !jobId) {
      return;
    }

    const fetchJobData = async (retryCount = 0) => {
      const maxRetries = 3;
      
      try {
        setLoading(true);
        setError(null);
        setApiError(null);

        // Get authentication token with retry
        let token = await getToken();
        
        // If no token on first try, wait a bit and retry
        if (!token && retryCount < maxRetries) {
          console.log(`🔄 No token available, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          token = await getToken();
        }
        
        if (!token) {
          console.error('❌ No authentication token available after retries');
          setError('Authentication failed. Please refresh the page.');
          return;
        }

        console.log('🔍 Fetching job data for:', jobId);

        // Fetch job details with retry logic
        const jobResponse = await fetch(`/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!jobResponse.ok) {
          const errorData = await jobResponse.json().catch(() => ({}));
          console.error('❌ Job API error:', errorData);
          
          // Retry on 401 errors (token might be stale)
          if (jobResponse.status === 401 && retryCount < maxRetries) {
            console.log(`🔄 Auth error, retrying... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchJobData(retryCount + 1);
          }
          
          if (jobResponse.status === 401) {
            setError('Authentication failed. Please refresh the page.');
          } else if (jobResponse.status === 404) {
            setError('Job not found.');
          } else {
            setError(errorData.error || 'Failed to load job data.');
          }
          return;
        }

        const jobData = await jobResponse.json();
        console.log('✅ Job data fetched:', jobData);

        // Transform API data to match UI expectations
        const transformedJob: Job = {
          id: jobData.id || jobId,
          title: jobData.title || 'Unknown Job',
          company: jobData.company || 'Company Name',
          location: jobData.location || 'Location Not Specified',
          contractType: jobData.employmentType?.[0] || 'Permanent',
          workMode: jobData.isRemote ? 'Remote' : 'Hybrid',
          status: jobData.status === 'ACTIVE' ? 'Active' : (jobData.status || 'Draft'),
          priority: 'Medium', // Default priority
          candidates: jobData._count?.applications || 0,
          applications: jobData._count?.applications || 0,
          daysToFill: jobData.createdAt 
            ? Math.floor((new Date().getTime() - new Date(jobData.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0,
          slaProgress: 50, // Default progress
          skills: jobData.requirements?.filter((req: string) => req?.startsWith?.('Skill:')).map((req: string) => req.replace('Skill: ', '')) || [],
          salary: jobData.salaryMin && jobData.salaryMax 
            ? `${jobData.salaryCurrency || 'CHF'} ${(jobData.salaryMin / 1000).toFixed(0)}k - ${(jobData.salaryMax / 1000).toFixed(0)}k`
            : jobData.salaryMin 
              ? `${jobData.salaryCurrency || 'CHF'} ${(jobData.salaryMin / 1000).toFixed(0)}k+`
              : 'Salary not specified',
          posted: jobData.createdAt ? new Date(jobData.createdAt).toLocaleDateString() : 'Unknown',
          owner: 'David V', // Default owner
          description: jobData.description || 'No description available.'
        };

        setJob(transformedJob);

                 // Transform candidates from applications
         const transformedCandidates: Candidate[] = (jobData.applications || []).map((app: any) => {
           const candidate = app.candidate || {};
           return {
             id: candidate.id || `candidate-${Math.random()}`,
             firstName: candidate.firstName || 'Unknown',
             lastName: candidate.lastName || 'Candidate',
             email: candidate.email || 'email@example.com',
             phone: candidate.phone || 'Phone not provided',
             currentLocation: candidate.currentLocation || 'Location not specified',
             stage: app.stage || 'sourced',
             rating: 4.0, // Default rating
             avatar: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1494790108755-2616b612b47c' : '1507003211169-0a1dd7228f2d'}?w=150&h=150&fit=crop&crop=face`,
             lastInteraction: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently',
             availability: 'Available',
             source: 'Application',
             skills: candidate.technicalSkills || [],
             experience: candidate.experienceYears ? `${candidate.experienceYears} years` : '0 years',
             currentRole: candidate.currentTitle || 'Professional',
             notes: `Applied for ${transformedJob.title}`,
             tags: candidate.technicalSkills?.slice(0, 3) || [],
             timeline: [
               { 
                 date: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], 
                 action: 'Applied to position', 
                 type: 'application' 
               }
             ],
             // Additional fields for compatibility
             name: `${candidate.firstName || 'Unknown'} ${candidate.lastName || 'Candidate'}`,
             title: candidate.currentTitle || 'Professional',
             location: candidate.currentLocation || 'Location not specified',
             matchScore: 85, // Default match score
             status: candidate.status || 'ACTIVE'
           };
         });

        setCandidates(transformedCandidates);

      } catch (fetchError) {
        console.error('💥 Error fetching job data:', fetchError);
        
        // Retry on network errors
        if (retryCount < maxRetries) {
          console.log(`🔄 Network error, retrying... (${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return fetchJobData(retryCount + 1);
        }
        
        setError('Failed to load job data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [isFullyLoaded, user, jobId, getToken]);

  // Pipeline handlers with safe checks
  const handleCandidateMove = async (candidateId: string, newStage: string) => {
    if (!candidateId || !newStage) return;
    
    // Optimistically update the UI
    setCandidates((prev: Candidate[]) => 
      prev.map(candidate => 
        candidate.id === candidateId 
          ? { 
              ...candidate, 
              stage: newStage,
              timeline: [
                { 
                  date: new Date().toISOString().split('T')[0], 
                  action: `Moved to ${pipelineStages.find(s => s.id === newStage)?.name || newStage}`, 
                  type: 'stage_change' 
                },
                ...candidate.timeline
              ]
            }
          : candidate
      )
    );

    // TODO: Update backend when candidate stage API is available
    // try {
    //   const token = await getToken();
    //   await fetch(`/api/candidates/${candidateId}/stage`, {
    //     method: 'PUT',
    //     headers: {
    //       'Authorization': `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ stage: newStage })
    //   });
    // } catch (error) {
    //   console.error('Failed to update candidate stage:', error);
    //   // Revert optimistic update on error
    // }
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    if (candidate) {
      setSelectedCandidate(candidate);
    }
  };

  // Handle candidate addition callbacks
  const handleCandidateAdded = (newCandidate: any) => {
    // Refresh candidates list or add to local state
    console.log('Candidate added to job:', newCandidate);
    
    // Convert to local candidate format and add to state
    const candidateForState: Candidate = {
      id: newCandidate.id,
      firstName: newCandidate.firstName || '',
      lastName: newCandidate.lastName || '',
      email: newCandidate.email || '',
      phone: newCandidate.phone || '',
      currentLocation: newCandidate.currentLocation || '',
      stage: 'sourced', // Default stage for newly added candidates
      rating: 0,
      lastInteraction: new Date().toISOString(),
      availability: 'Available',
      source: 'Manual',
      skills: newCandidate.technicalSkills || [],
      experience: `${newCandidate.experienceYears || 0} years`,
      currentRole: newCandidate.currentTitle || '',
      notes: '',
      tags: [],
      timeline: [{
        date: new Date().toISOString(),
        action: 'Added to job',
        type: 'system'
      }]
    };

    setCandidates(prev => [...prev, candidateForState]);
    
    // Update job candidate count
    setJob(prev => prev ? { ...prev, candidates: prev.candidates + 1, applications: prev.applications + 1 } : null);
  };

  const handleCandidateCreated = (newCandidate: any) => {
    console.log('New candidate created:', newCandidate);
    handleCandidateAdded(newCandidate);
  };

  // Handle candidate removal
  const handleCandidateRemove = async (candidateId: string) => {
    if (!candidateId || !jobId) return;

    try {
      console.log(`🗑️ Removing candidate ${candidateId} from job ${jobId}`);
      
      // Optimistically remove from UI
      const candidateToRemove = candidates.find(c => c.id === candidateId);
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
      
      // Update job counts
      setJob(prev => prev ? { 
        ...prev, 
        candidates: Math.max(0, prev.candidates - 1), 
        applications: Math.max(0, prev.applications - 1) 
      } : null);

      // Call API to remove candidate from job
      const token = await getToken();
      const response = await fetch(`/api/jobs/${jobId}/candidates`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ candidateId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove candidate');
      }

      const result = await response.json();
      console.log('✅ Candidate removed successfully:', result);

    } catch (error) {
      console.error('💥 Error removing candidate:', error);
      
      // Revert optimistic update on error
      const candidateToRestore = candidates.find(c => c.id === candidateId);
      if (candidateToRestore) {
        setCandidates(prev => [...prev, candidateToRestore]);
        setJob(prev => prev ? { 
          ...prev, 
          candidates: prev.candidates + 1, 
          applications: prev.applications + 1 
        } : null);
      }
      
      alert('Failed to remove candidate. Please try again.');
    }
  };

  const tabs = [
    { id: 'pipeline', label: 'Pipeline', icon: Users },
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'candidates', label: 'Candidates', icon: UserPlus },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'text-gray-600';
    
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const renderTabContent = () => {
    if (!job) return null;

    switch (activeTab) {
      case 'pipeline':
        return (
          <div className="space-y-6">
            {/* Pipeline Header - No Add Candidate button here */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Candidate Pipeline</h3>
              <p className="text-sm text-gray-600">Manage candidates through your hiring process</p>
            </div>

            <PipelineKanban 
              candidates={candidates}
              stages={pipelineStages}
              onCandidateMove={handleCandidateMove}
              onCandidateSelect={handleCandidateSelect}
              onAddCandidate={() => setShowAddExistingModal(true)}
              onCandidateRemove={handleCandidateRemove}
              AddCandidateComponent={() => (
                <AddCandidateDropdown
                  onAddExisting={() => setShowAddExistingModal(true)}
                  onCreateNew={() => setShowCreateCandidateModal(true)}
                />
              )}
            />
          </div>
        );
      
      case 'candidates':
        return (
          <div className="space-y-6">
            {/* Candidates List Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">All Candidates</h3>
                <p className="text-sm text-gray-600">{candidates.length} candidates in this job</p>
              </div>
              <AddCandidateDropdown
                onAddExisting={() => setShowAddExistingModal(true)}
                onCreateNew={() => setShowCreateCandidateModal(true)}
              />
            </div>

            {/* Candidates Table/List */}
            <Card>
              <CardContent className="p-0">
                {candidates.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates yet</h3>
                    <p className="text-gray-500 mb-4">Start building your candidate pipeline</p>
                    <AddCandidateDropdown
                      onAddExisting={() => setShowAddExistingModal(true)}
                      onCreateNew={() => setShowCreateCandidateModal(true)}
                    />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {candidate.firstName?.[0] || '?'}{candidate.lastName?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {candidate.firstName} {candidate.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">{candidate.currentRole}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              candidate.stage === 'hired' ? 'bg-green-100 text-green-800' :
                              candidate.stage === 'offer' ? 'bg-orange-100 text-orange-800' :
                              candidate.stage === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                              candidate.stage === 'screened' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
                  <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {job.skills?.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {skill}
                        </span>
                      )) || <span className="text-gray-500">No skills specified</span>}
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
                      <span className="font-medium">{job.salary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Contract Type</span>
                      <span className="font-medium">{job.contractType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Work Mode</span>
                      <span className="font-medium">{job.workMode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Posted</span>
                      <span className="font-medium">{job.posted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">This feature is under development</p>
          </div>
        );
    }
  };

  // Loading state
  if (!isFullyLoaded || loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading job details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorBoundary>
        <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Error Loading Job</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    // Trigger refetch by updating a dependency
                    window.location.reload();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
                <Button onClick={() => window.history.back()} variant="outline">
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
      </ErrorBoundary>
    );
  }

  // Safe guard - if no job data, show error
  if (!job) {
    return (
      <ErrorBoundary>
        <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold mb-2">Job Not Found</h1>
              <p className="text-gray-600 mb-4">The requested job could not be found.</p>
              <Button onClick={() => window.history.back()} variant="outline">
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
                <h1 className="text-2xl font-bold text-gray-900">{job!.title}</h1>
                <Star className={`h-5 w-5 ${getPriorityColor(job!.priority)}`} />
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job!.status)}`}>
                  {job!.status}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  <span>{job!.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{job!.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Posted {job!.posted}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{job!.applications || 0}</div>
              <div className="text-sm text-gray-500">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{job!.candidates || 0}</div>
              <div className="text-sm text-gray-500">In Pipeline</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{job!.daysToFill || 0}</div>
              <div className="text-sm text-gray-500">Days Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{job!.slaProgress || 0}%</div>
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
            setSelectedCandidate((prev: Candidate | null) => 
              prev ? { ...prev, stage: newStage } : null
            );
          }
        }}
        onRatingChange={(candidateId: string, newRating: number) => {
          setCandidates((prev: Candidate[]) => 
            prev.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, rating: newRating }
                : candidate
            )
          );
        }}
        onNotesUpdate={(candidateId: string, newNotes: string) => {
          setCandidates((prev: Candidate[]) => 
            prev.map(candidate => 
              candidate.id === candidateId 
                ? { ...candidate, notes: newNotes }
                : candidate
            )
          );
        }}
      />

      {/* Add Existing Candidate Modal */}
      <AddExistingCandidateModal
        open={showAddExistingModal}
        onClose={() => setShowAddExistingModal(false)}
        jobId={jobId}
        onCandidateAdded={handleCandidateAdded}
      />

      {/* Create New Candidate Modal */}
      <CreateCandidateModal
        open={showCreateCandidateModal}
        onClose={() => setShowCreateCandidateModal(false)}
        jobId={jobId}
        onCandidateCreated={handleCandidateCreated}
      />
    </Layout>
    </ErrorBoundary>
  );
} 