'use client';

import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidates } from '@/hooks/useCandidates';
import { useAuth } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateFormSchema, type CandidateFormData } from '@/lib/validation';
import { api } from '@/lib/api';
import { useDropzone } from 'react-dropzone';
import { 
  candidateResponseToListItem, 
  getStatusColor 
} from '@/types/candidate';
import { 
  Users, 
  Search, 
  Plus,
  X,
  Upload,
  Linkedin,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  Eye,
  Edit,
  MoreHorizontal,
  Grid3X3,
  List,
  Save,
  Filter,
  Star,
  MessageSquare,
  Calendar,
  Tag,
  Building
} from 'lucide-react';

// Form default values
const formDefaultValues: CandidateFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: undefined,
  linkedinUrl: '',
  portfolioUrl: '',
  githubUrl: '',
  currentLocation: undefined,
  nationality: undefined,
  timezone: undefined,
  currentTitle: undefined,
  professionalHeadline: undefined,
  summary: undefined,
  seniorityLevel: undefined,
  primaryIndustry: undefined,
  functionalDomain: undefined,
  experienceYears: undefined,
  companies: undefined,
  technicalSkills: [],
  softSkills: [],
  toolsAndPlatforms: [],
  frameworks: [],
  programmingLanguages: [],
  spokenLanguages: [],
  methodologies: [],
  notableProjects: [],
  freelancer: false,
  degrees: [],
  certifications: [],
  universities: [],
  graduationYear: undefined,
  educationLevel: undefined,
  availableFrom: undefined,
  preferredContractType: undefined,
  expectedSalary: undefined,
  relocationWillingness: false,
  remotePreference: undefined,
  workPermitType: undefined,
  matchingScore: undefined,
  tags: [],
  archived: false,
  source: 'Manual Entry',
  recruiterNotes: [],
  interviewScores: undefined,
  videoInterviewUrl: '',
  culturalFitScore: undefined,
  motivationalFitNotes: undefined,
  referees: undefined,
  conversionStatus: undefined,
};

export default function CandidatesPage() {
  const { getToken } = useAuth();
  const { candidates = [], isLoading, error, mutate } = useCandidates();
  
  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    availability: [] as string[],
    location: '',
    skills: [] as string[],
    source: [] as string[]
  });
  
  const [viewState, setViewState] = useState({
    layout: 'list' as 'list' | 'grid',
    selectedCandidate: null as any,
    showAddDrawer: false,
    showFilters: true
  });

  // Add candidate form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CandidateFormData>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: formDefaultValues,
  });

  // Drag and drop for CV upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      parseCV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Parse CV function
  const parseCV = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    
    try {
      const formData = new FormData();
      formData.append('cv', file);
      
      const token = await getToken();
      const response = await fetch('/api/candidates/parse-cv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse CV');
      }

      const data = await response.json();
      
      // Fill form with parsed data
      if (data.firstName) setValue('firstName', data.firstName);
      if (data.lastName) setValue('lastName', data.lastName);
      if (data.email) setValue('email', data.email);
      if (data.phone) setValue('phone', data.phone);
      if (data.currentTitle) setValue('currentTitle', data.currentTitle);
      if (data.summary) setValue('summary', data.summary);
      if (data.experienceYears) setValue('experienceYears', data.experienceYears);
      if (data.skills) {
        setValue('technicalSkills', data.skills);
        setSkillsInput(data.skills.join(', '));
      }
      
    } catch (error) {
      setParseError('Failed to parse CV. Please try again or enter details manually.');
    } finally {
      setIsParsing(false);
    }
  };

  // Submit form
  const onSubmit = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    
    try {
      const token = await getToken();
      const response = await api.candidates.create(data, token || undefined);
      
      // Reset form and close drawer
      reset(formDefaultValues);
      setUploadedFile(null);
      setLinkedinUrl('');
      setSkillsInput('');
      setTagsInput('');
      setViewState(prev => ({ ...prev, showAddDrawer: false }));
      
      // Refresh candidates list
      mutate();
      
    } catch (error) {
      console.error('Failed to create candidate:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skills input
  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(Boolean);
    setValue('technicalSkills', skillsArray);
  };

  // Handle tags input
  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setValue('tags', tagsArray);
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const candidateItem = candidateResponseToListItem(candidate);
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchMatch = 
        candidateItem.name.toLowerCase().includes(searchLower) ||
        candidateItem.email.toLowerCase().includes(searchLower) ||
        (candidateItem.currentTitle || '').toLowerCase().includes(searchLower) ||
        (candidateItem.company || '').toLowerCase().includes(searchLower) ||
        candidateItem.skills.some(skill => skill.toLowerCase().includes(searchLower));
      
      if (!searchMatch) return false;
    }
    
    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(candidateItem.status)) {
      return false;
    }
    
    return true;
  });

  // Get stats
  const stats = {
    total: candidates.length,
    active: candidates.filter(c => !['Rejected', 'Withdrawn'].includes(candidateResponseToListItem(c).status)).length,
    inInterview: candidates.filter(c => candidateResponseToListItem(c).status === 'Interview').length,
    positioned: candidates.filter(c => candidateResponseToListItem(c).status === 'Positioned').length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary-600" />
                <h1 className="text-2xl font-bold text-neutral-900">Candidates</h1>
              </div>
              
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <div className="text-center">
                  <div className="text-lg font-bold text-neutral-900">{stats.total}</div>
                  <div className="text-xs text-neutral-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-success-600">{stats.active}</div>
                  <div className="text-xs text-neutral-500">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-warning-600">{stats.inInterview}</div>
                  <div className="text-xs text-neutral-500">Interview</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-600">{stats.positioned}</div>
                  <div className="text-xs text-neutral-500">Positioned</div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-80 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setViewState(prev => ({ ...prev, layout: 'list' }))}
                  className={`p-2 rounded-md transition-colors ${
                    viewState.layout === 'list' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewState(prev => ({ ...prev, layout: 'grid' }))}
                  className={`p-2 rounded-md transition-colors ${
                    viewState.layout === 'grid' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              {/* Add Candidate Button */}
              <Button
                onClick={() => setViewState(prev => ({ ...prev, showAddDrawer: true }))}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Candidate
              </Button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Sidebar - Filters */}
          {viewState.showFilters && (
            <div className="w-80 bg-white border-r border-neutral-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Quick Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-neutral-900">Quick Filters</h3>
                    <button
                      onClick={() => setViewState(prev => ({ ...prev, showFilters: false }))}
                      className="p-1 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                      🔥 Hot Candidates
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                      📅 Available ASAP
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                      🎯 High Match Score
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                      💼 Senior Level
                    </button>
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Status
                  </label>
                  <div className="space-y-2">
                    {['Applied', 'Screening', 'Interview', 'Positioned', 'Hired'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                            } else {
                              setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                            }
                          }}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Availability
                  </label>
                  <div className="space-y-2">
                    {['ASAP', '1 month', '3+ months'].map(availability => (
                      <label key={availability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.availability.includes(availability)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, availability: [...prev.availability, availability] }));
                            } else {
                              setFilters(prev => ({ ...prev, availability: prev.availability.filter(a => a !== availability) }));
                            }
                          }}
                          className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-neutral-700">{availability}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Center - Main Content */}
          <div className="flex-1 overflow-y-auto">
            {!viewState.showFilters && (
              <div className="p-4 border-b border-neutral-200 bg-white">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewState(prev => ({ ...prev, showFilters: true }))}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Show Filters
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-neutral-600">Loading candidates...</p>
                </div>
              </div>
            ) : filteredCandidates.length === 0 ? (
              // Empty State
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {candidates.length === 0 ? "No candidates yet" : "No candidates match your filters"}
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    {candidates.length === 0 
                      ? "Start building your talent pipeline by adding your first candidate."
                      : "Try adjusting your search criteria or filters to find candidates."
                    }
                  </p>
                  {candidates.length === 0 && (
                    <Button
                      onClick={() => setViewState(prev => ({ ...prev, showAddDrawer: true }))}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Candidate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Candidates List/Grid
              <div className="p-6">
                {viewState.layout === 'list' ? (
                  // List View
                  <div className="space-y-3">
                    {filteredCandidates.map((candidate) => {
                      const candidateItem = candidateResponseToListItem(candidate);
                      return (
                        <div
                          key={candidate.id}
                          className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer group"
                          onClick={() => setViewState(prev => ({ ...prev, selectedCandidate: candidate }))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {candidateItem.initials}
                              </div>
                              <div>
                                <h3 className="font-semibold text-neutral-900">{candidateItem.name}</h3>
                                <p className="text-sm text-neutral-600">{candidateItem.currentTitle || 'No title'}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <div className="flex items-center text-xs text-neutral-500">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {candidateItem.location || 'No location'}
                                  </div>
                                  <div className="flex items-center text-xs text-neutral-500">
                                    <Briefcase className="h-3 w-3 mr-1" />
                                    {candidateItem.experience}+ years
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidateItem.status)}`}>
                                  {candidateItem.status}
                                </div>
                                <p className="text-xs text-neutral-500 mt-1">{candidateItem.source}</p>
                              </div>
                              
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle view action
                                  }}
                                  className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                                  title="View Profile"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle message action
                                  }}
                                  className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                                  title="Send Message"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle tag action
                                  }}
                                  className="p-2 text-neutral-400 hover:text-primary-600 transition-colors"
                                  title="Add Tag"
                                >
                                  <Tag className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle more actions
                                  }}
                                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {candidateItem.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {candidateItem.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidateItem.skills.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-md">
                                  +{candidateItem.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCandidates.map((candidate) => {
                      const candidateItem = candidateResponseToListItem(candidate);
                      return (
                        <Card
                          key={candidate.id}
                          className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => setViewState(prev => ({ ...prev, selectedCandidate: candidate }))}
                        >
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold">
                                {candidateItem.initials}
                              </div>
                              <h3 className="font-semibold text-neutral-900">{candidateItem.name}</h3>
                              <p className="text-sm text-neutral-600">{candidateItem.currentTitle || 'No title'}</p>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-xs text-neutral-500">
                                <MapPin className="h-3 w-3 mr-1" />
                                {candidateItem.location || 'No location'}
                              </div>
                              <div className="flex items-center text-xs text-neutral-500">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {candidateItem.experience}+ years experience
                              </div>
                            </div>
                            
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-full justify-center ${getStatusColor(candidateItem.status)}`}>
                              {candidateItem.status}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Candidate Details Drawer */}
          {viewState.selectedCandidate && (
            <div className="w-96 bg-white border-l border-neutral-200 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Candidate Profile</h2>
                  <button
                    onClick={() => setViewState(prev => ({ ...prev, selectedCandidate: null }))}
                    className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Building className="h-3 w-3 mr-1" />
                    Submit
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Candidate details content */}
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                      {candidateResponseToListItem(viewState.selectedCandidate).initials}
                    </div>
                    <h3 className="font-semibold text-neutral-900 text-lg">
                      {candidateResponseToListItem(viewState.selectedCandidate).name}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {candidateResponseToListItem(viewState.selectedCandidate).currentTitle || 'No title'}
                    </p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(candidateResponseToListItem(viewState.selectedCandidate).status)}`}>
                      {candidateResponseToListItem(viewState.selectedCandidate).status}
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-900">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                        <span className="text-neutral-600">{candidateResponseToListItem(viewState.selectedCandidate).email}</span>
                      </div>
                      {candidateResponseToListItem(viewState.selectedCandidate).phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                          <span className="text-neutral-600">{candidateResponseToListItem(viewState.selectedCandidate).phone}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-neutral-400 mr-2" />
                        <span className="text-neutral-600">{candidateResponseToListItem(viewState.selectedCandidate).location || 'No location'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {candidateResponseToListItem(viewState.selectedCandidate).skills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900">Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {candidateResponseToListItem(viewState.selectedCandidate).skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-neutral-900">Experience</h4>
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 text-neutral-400 mr-2" />
                      <span className="text-neutral-600">{candidateResponseToListItem(viewState.selectedCandidate).experience}+ years of experience</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {candidateResponseToListItem(viewState.selectedCandidate).tags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-neutral-900">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {candidateResponseToListItem(viewState.selectedCandidate).tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Candidate Drawer */}
        {viewState.showAddDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setViewState(prev => ({ ...prev, showAddDrawer: false }))} />
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Add New Candidate</h2>
                    <p className="text-sm text-neutral-600">Add a candidate manually or import from CV/LinkedIn</p>
                  </div>
                  <button
                    onClick={() => setViewState(prev => ({ ...prev, showAddDrawer: false }))}
                    className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Import Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* CV Upload */}
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive 
                            ? 'border-primary-400 bg-primary-50' 
                            : 'border-neutral-300 hover:border-primary-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700">Upload CV</p>
                        <p className="text-xs text-neutral-500">PDF, DOC, DOCX up to 10MB</p>
                        {uploadedFile && (
                          <p className="text-xs text-primary-600 mt-2">{uploadedFile.name}</p>
                        )}
                      </div>

                      {/* LinkedIn Import */}
                      <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6">
                        <Linkedin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700 mb-2">Import from LinkedIn</p>
                        <input
                          type="url"
                          placeholder="LinkedIn profile URL"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <Button
                          type="button"
                          disabled={!linkedinUrl || isParsing}
                          size="sm"
                          className="w-full mt-2"
                        >
                          {isParsing ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                          Import
                        </Button>
                      </div>
                    </div>

                    {/* Parse Error */}
                    {parseError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                          <p className="text-sm text-red-700">{parseError}</p>
                        </div>
                      </div>
                    )}

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-900">Basic Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            First Name *
                          </label>
                          <input
                            {...register('firstName')}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {errors.firstName && (
                            <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            {...register('lastName')}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          {errors.lastName && (
                            <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          {...register('email')}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        {errors.email && (
                          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Current Title
                        </label>
                        <input
                          {...register('currentTitle')}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Location
                        </label>
                        <input
                          {...register('currentLocation')}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Technical Skills
                        </label>
                        <input
                          value={skillsInput}
                          onChange={(e) => handleSkillsChange(e.target.value)}
                          placeholder="React, Node.js, Python, etc. (comma separated)"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Summary
                        </label>
                        <textarea
                          {...register('summary')}
                          rows={3}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Tags
                        </label>
                        <input
                          value={tagsInput}
                          onChange={(e) => handleTagsChange(e.target.value)}
                          placeholder="senior, frontend, remote, etc. (comma separated)"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-200 p-6">
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setViewState(prev => ({ ...prev, showAddDrawer: false }))}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Candidate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
