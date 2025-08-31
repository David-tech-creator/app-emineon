'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { CreateJobModal } from '@/components/jobs/CreateJobModal';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import { AddCandidateDropdown } from '@/components/jobs/AddCandidateDropdown';
import { AddExistingCandidateModal } from '@/components/jobs/AddExistingCandidateModal';
import { AlgoliaJobSearchBox } from '@/components/search/AlgoliaSearchBox';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  MoreHorizontal,
  MapPin,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Building2,
  Briefcase,
  Target,
  Eye,
  UserPlus,
  Share2,
  ChevronDown,
  Star,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateCandidateModal, setShowCreateCandidateModal] = useState(false);
  const [showAddExistingModal, setShowAddExistingModal] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  
  // Algolia search is now the default
  const [algoliaResults, setAlgoliaResults] = useState<any[]>([]);
  const [algoliaLoading, setAlgoliaLoading] = useState(false);
  const [hasSearchQuery, setHasSearchQuery] = useState(false);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const data = await response.json();
          // Handle both old array format and new paginated format
          const jobsData = Array.isArray(data) ? data : data.jobs || [];
          setJobs(jobsData);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (err) {
        setError('Error fetching jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Transform API data to match UI expectations
  const transformJob = (job: any) => ({
    id: job.id,
    title: job.title,
    company: 'Emineon ATS', // Default company for now
    location: job.location,
    contractType: job.employmentType?.[0] || 'Permanent',
    workMode: job.isRemote ? 'Remote' : 'Hybrid',
    status: job.status === 'ACTIVE' ? 'Active' : job.status === 'DRAFT' ? 'Draft' : job.status,
    priority: 'Medium', // Default priority
    candidates: job._count?.applications || 0,
    applications: job._count?.applications || 0,
    daysToFill: Math.floor((new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    slaProgress: 50, // Default progress
    skills: job.requirements?.filter((req: string) => req.startsWith('Skill:')).map((req: string) => req.replace('Skill: ', '')) || [],
    salary: job.salaryMin && job.salaryMax 
      ? `${job.salaryCurrency} ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k`
      : job.salaryMin 
        ? `${job.salaryCurrency} ${(job.salaryMin / 1000).toFixed(0)}k+`
        : 'Salary not specified',
    posted: new Date(job.createdAt).toLocaleDateString(),
    owner: 'David V', // Default owner
    pipeline: {
      applied: job._count?.applications || 0,
      screening: 0,
      interview: 0,
      offer: 0
    }
  });

  // Mock stats data with clickable filters
  const stats = [
    { label: 'Active', value: '32', change: '+8%', icon: CheckCircle2, filter: 'active', action: 'filter' },
    { label: 'SLA Risk', value: '8', change: '+2 this week', icon: AlertCircle, filter: 'sla-risk', action: 'filter' },
    { label: 'Candidates', value: '1,247', change: '+23%', icon: Users, filter: null, action: 'navigate', path: '/candidates' },
    { label: 'Avg. Days to Fill', value: '18', change: '-2 days', icon: Clock, filter: null, action: 'navigate', path: '/analytics' }
  ];

  const handleStatClick = (stat: any) => {
    if (stat.action === 'filter' && stat.filter) {
      setSelectedFilter(stat.filter);
    } else if (stat.action === 'navigate' && stat.path) {
      router.push(stat.path);
    }
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleAddExistingCandidate = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowAddExistingModal(true);
  };

  const handleCreateNewCandidate = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowCreateCandidateModal(true);
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingJobId(jobId);
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove job from local state
        setJobs(prev => prev.filter(job => job.id !== jobId));
        alert('Job deleted successfully');
      } else {
        const errorData = await response.json();
        alert(`Error deleting job: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    } finally {
      setDeletingJobId(null);
      setOpenDropdown(null);
    }
  };

  const handleDuplicateJob = (job: any) => {
    // Create a copy of the job data for the create modal
    const duplicateData = {
      title: `${job.title} (Copy)`,
      company: job.company,
      location: job.location,
      contractType: job.contractType,
      workMode: job.workMode,
      description: job.description,
      skills: job.skills,
      salary: job.salary,
      department: job.department,
      status: 'draft', // Always start as draft
    };
    
    // You could set this data in the create modal if it supports pre-filling
    setShowCreateModal(true);
    setOpenDropdown(null);
  };

  const toggleDropdown = (jobId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDropdown(openDropdown === jobId ? null : jobId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const transformedJobs = jobs.map(transformJob);
  
  // Use Algolia results when searching, otherwise show all jobs from API
  const displayJobs = hasSearchQuery && algoliaResults.length > 0 
    ? algoliaResults.map((hit, index) => ({
        id: hit.objectID,
        title: hit.title,
        company: hit.company || 'Emineon ATS',
        location: hit.location,
        contractType: hit.employmentType || 'Permanent',
        workMode: hit.remote ? 'Remote' : 'Hybrid',
        status: hit.status,
        priority: hit.urgent ? 'High' : 'Medium',
        candidates: 0, // Will be populated from actual data if needed
        applications: 0,
        daysToFill: Math.floor((new Date().getTime() - new Date(hit.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        slaProgress: 50,
        skills: hit.skills || [],
        salary: hit.salaryRange || 'Not specified',
        posted: new Date(hit.createdAt).toLocaleDateString(),
        owner: 'Admin',
        description: hit.description,
        _highlightResult: hit._highlightResult,
      }))
    : transformedJobs;
  
  const filteredJobs = displayJobs.filter((job: any) => {
    let matchesFilter = true;
    
    switch (selectedFilter) {
      case 'all':
        matchesFilter = true;
        break;
      case 'active':
        matchesFilter = job.status.toLowerCase() === 'active';
        break;
      case 'sla-risk':
        // Jobs that are at risk of missing SLA (active jobs with low progress)
        matchesFilter = job.status === 'Active' && job.slaProgress < 70;
        break;
      case 'draft':
        matchesFilter = job.status.toLowerCase() === 'draft';
        break;
      default:
        matchesFilter = job.status.toLowerCase() === selectedFilter.toLowerCase();
    }
    
    return matchesFilter;
  });

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

  return (
    <Layout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your job postings and track hiring progress
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg cursor-pointer hover:scale-105 ${
              stat.filter && selectedFilter === stat.filter ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-200' : 'border-gray-200'
            }`}
            onClick={() => handleStatClick(stat)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-xs mt-1 ${
                    stat.label === 'SLA Risk' ? 'text-orange-600' : 'text-green-600'
                  }`}>{stat.change}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  stat.label === 'SLA Risk' ? 'bg-orange-50' : 'bg-primary-50'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.label === 'SLA Risk' ? 'text-orange-600' : 'text-primary-600'
                  }`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <AlgoliaJobSearchBox
                onResults={(results) => {
                  setAlgoliaResults(results);
                  setHasSearchQuery(results.length > 0);
                }}
                onLoading={setAlgoliaLoading}
                placeholder="Search jobs, companies, locations, or any other criteria..."
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Jobs</option>
                <option value="active">Active</option>
                <option value="sla-risk">SLA Risk</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>

              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

              {/* Loading State */}
        {(loading || algoliaLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {algoliaLoading ? 'Searching jobs...' : 'Loading jobs...'}
              </p>
            </div>
          </div>
        )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !algoliaLoading && !error && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-6">
            {hasSearchQuery 
              ? "No jobs match your search criteria. Try adjusting your search terms." 
              : jobs.length === 0 
                ? "Get started by creating your first job posting." 
                : "Try adjusting your filters."}
          </p>
          {jobs.length === 0 && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Job
            </Button>
          )}
        </div>
      )}

      {/* Jobs List */}
      {!loading && !algoliaLoading && !error && filteredJobs.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredJobs.map((job) => (
          <Card key={job.id} className={`bg-white shadow-sm hover:shadow-md transition-shadow ${viewMode === 'grid' ? 'h-fit' : ''}`}>
            <CardContent className={viewMode === 'grid' ? 'p-5' : 'p-6'}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold text-gray-900 truncate ${viewMode === 'grid' ? 'text-base' : 'text-lg'}`}>
                      {job.title}
                    </h3>
                    <Star className={`h-4 w-4 flex-shrink-0 ${getPriorityColor(job.priority)}`} />
                  </div>
                  <div className={`${viewMode === 'grid' ? 'space-y-1' : 'flex items-center space-x-4'} text-sm text-gray-600 mb-3`}>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                  <div className="relative">
                    <button 
                      className="p-1 hover:bg-gray-100 rounded"
                      onClick={(e) => toggleDropdown(job.id, e)}
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openDropdown === job.id && (
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleEditJob(job)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Job
                        </button>
                        <button
                          onClick={() => handleDuplicateJob(job)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Job
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deletingJobId === job.id}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {deletingJobId === job.id ? 'Deleting...' : 'Delete Job'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SLA Progress */}
              {job.status === 'Active' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">SLA Progress</span>
                    <span className="font-medium">{job.slaProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        job.slaProgress >= 80 ? 'bg-green-500' : 
                        job.slaProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${job.slaProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Pipeline Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Pipeline</span>
                  <span className="text-gray-500">{job.applications} applications</span>
                </div>
                
                {viewMode === 'grid' ? (
                  // Simplified pipeline for grid view
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Applied: {job.pipeline.applied}</span>
                      <span>Screening: {job.pipeline.screening}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Interview: {job.pipeline.interview}</span>
                      <span>Offer: {job.pipeline.offer}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 via-yellow-500 via-orange-500 to-green-500 rounded-full"
                        style={{ width: `${(job.pipeline.offer / job.pipeline.applied) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  // Detailed pipeline for list view
                  <div className="space-y-2">
                    <div className="flex space-x-1 mb-2">
                      <div className="flex-1 bg-blue-100 rounded h-2 relative">
                        <div className="absolute inset-0 bg-blue-500 rounded" style={{ width: '100%' }} />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                          {job.pipeline.applied}
                        </span>
                      </div>
                      <div className="flex-1 bg-yellow-100 rounded h-2 relative">
                        <div className="absolute inset-0 bg-yellow-500 rounded" 
                             style={{ width: `${(job.pipeline.screening / job.pipeline.applied) * 100}%` }} />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                          {job.pipeline.screening}
                        </span>
                      </div>
                      <div className="flex-1 bg-orange-100 rounded h-2 relative">
                        <div className="absolute inset-0 bg-orange-500 rounded" 
                             style={{ width: `${(job.pipeline.interview / job.pipeline.applied) * 100}%` }} />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                          {job.pipeline.interview}
                        </span>
                      </div>
                      <div className="flex-1 bg-green-100 rounded h-2 relative">
                        <div className="absolute inset-0 bg-green-500 rounded" 
                             style={{ width: `${(job.pipeline.offer / job.pipeline.applied) * 100}%` }} />
                        <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                          {job.pipeline.offer}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                                              {job.skills.slice(0, viewMode === 'grid' ? 2 : 3).map((skill: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > (viewMode === 'grid' ? 2 : 3) && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{job.skills.length - (viewMode === 'grid' ? 2 : 3)} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={`pt-4 border-t border-gray-100 ${viewMode === 'grid' ? 'space-y-2' : 'flex items-center justify-between'}`}>
                {viewMode === 'grid' ? (
                  // Simplified actions for grid view
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 mr-2"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <AddCandidateDropdown
                      onAddExisting={() => handleAddExistingCandidate(job.id)}
                      onCreateNew={() => handleCreateNewCandidate(job.id)}
                      className="flex-1"
                    />
                  </div>
                ) : (
                  // Full actions for list view
                  <>
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewJob(job.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <AddCandidateDropdown
                        onAddExisting={() => handleAddExistingCandidate(job.id)}
                        onCreateNew={() => handleCreateNewCandidate(job.id)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Create Job Modal */}
      <CreateJobModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {/* Edit Job Modal */}
      <CreateJobModal 
        open={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setEditingJob(null);
        }}
        editingJob={editingJob}
      />

      {/* Create New Candidate Modal */}
      <CreateCandidateModal 
        open={showCreateCandidateModal} 
        onClose={() => setShowCreateCandidateModal(false)}
        jobId={selectedJobId || undefined}
      />

      {/* Add Existing Candidate Modal */}
      <AddExistingCandidateModal 
        open={showAddExistingModal} 
        onClose={() => setShowAddExistingModal(false)}
        jobId={selectedJobId || ''}
        onCandidateAdded={() => {
          setShowAddExistingModal(false);
          // Optionally refresh jobs or show success message
        }}
      />


    </Layout>
  );
}
