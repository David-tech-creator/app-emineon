'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import { CandidateProfileDrawer } from '@/components/candidates/CandidateProfileDrawer';
import { CandidateProfileModal } from '@/components/candidates/CandidateProfileModal';
import { AdvancedFilterDrawer, CandidateFilters } from '@/components/candidates/AdvancedFilterDrawer';
import { useCandidates } from '@/hooks/useCandidates';
import { useAuth } from '@clerk/nextjs';
import { AlgoliaSearchBox } from '@/components/search/AlgoliaSearchBox';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Star,
  MapPin,
  Briefcase,
  ChevronDown,
  Eye,
  Mail,
  Phone,
  Building,
  Plus,
  MoreHorizontal,
  FileText,
  Calendar,
  MessageSquare,
  Grid3X3,
  List,
  Brain,
  Edit3,
  Trash2,
  ChevronRight
} from 'lucide-react';

// Candidate interface
interface Candidate {
  id: number;
  databaseId?: string;
  name: string;
  location: string;
  experience: string;
  currentRole: string;
  score: string;
  status: string;
  avatar: string;
  skills: string[];
  rating: number;
  email: string;
  phone: string;
  company: string;
  summary: string;
  education: string;
  languages: string[];
  availability: string;
  expectedSalary: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  lastInteraction: string;
  source: string;
  workExperience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  timeline: Array<{
    date: string;
    action: string;
    type: string;
    details?: string;
  }>;
  // CV file information
  originalCvUrl?: string;
  originalCvFileName?: string;
  originalCvUploadedAt?: string;
  // AI Matching information
  jobMatches?: any[];
  averageMatchScore?: number;
  topMatchingJob?: any;
  _editMode?: boolean;
}

export default function CandidatesPage() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const { candidates, isLoading, error, mutate } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFilters | null>(null);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [compactCards, setCompactCards] = useState<Set<number>>(new Set());
  // Algolia search is now the default - no toggle needed
  const [algoliaResults, setAlgoliaResults] = useState<any[]>([]);
  const [algoliaLoading, setAlgoliaLoading] = useState(false);
  const [hasSearchQuery, setHasSearchQuery] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
    };
    fetchToken();
  }, [getToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Use Algolia results when searching, otherwise show all candidates from API
  const allCandidates = hasSearchQuery && algoliaResults.length > 0 
    ? algoliaResults.map((hit, index) => ({
        id: index + 1,
        databaseId: hit.objectID,
        name: hit.fullName || `${hit.firstName || ''} ${hit.lastName || ''}`.trim(),
        location: hit.currentLocation || 'Not specified',
        experience: `${hit.experienceYears || 0} years`,
        currentRole: hit.currentTitle || 'Not specified',
        score: 'Strong',
        status: hit.status || 'NEW',
        avatar: (hit.firstName?.charAt(0) || 'U') + (hit.lastName?.charAt(0) || 'U'),
        skills: hit.technicalSkills || [],
        rating: 4.5, // Default rating
        email: hit.email || 'no-email@example.com',
        phone: '',
        company: 'Not specified',
        summary: hit.summary || 'No summary available',
        education: hit.degrees?.join(', ') || 'Not specified',
        languages: hit.spokenLanguages || [],
        availability: 'Available',
        expectedSalary: hit.expectedSalary || 'Not specified',
        linkedinUrl: undefined,
        portfolioUrl: undefined,
        lastInteraction: hit.createdAt || new Date().toISOString(),
        source: hit.source || 'database',
        workExperience: [],
        timeline: [],
        // Highlight matched terms
        _highlightResult: hit._highlightResult,
      }))
    : candidates || [];

  const getScoreColor = (score: string) => {
    switch (score.toLowerCase()) {
      case 'very strong':
        return 'bg-green-100 text-green-800';
      case 'strong':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'interview scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'long list':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectCandidate = (candidateId: number) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCandidates.length === allCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(allCandidates.map((c: Candidate) => c.id));
    }
  };

  const handleBulkCompetenceFiles = () => {
    const selectedNames = allCandidates
      .filter((c: Candidate) => selectedCandidates.includes(c.id))
      .map((c: Candidate) => c.name)
      .join(',');
    window.location.href = `/competence-files?candidates=${encodeURIComponent(selectedNames)}`;
  };

  const handleViewProfile = (candidate: Candidate, openModal = false) => {
    console.log('handleViewProfile called:', candidate.name, 'openModal:', openModal);
    setSelectedCandidate(candidate);
    if (openModal) {
      console.log('Setting showModal to true');
      setShowModal(true);
    } else {
      console.log('Setting showDrawer to true');
      setShowDrawer(true);
    }
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setSelectedCandidate({ ...candidate, _editMode: true });
    setShowModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteCandidate = (candidateId: number) => {
    setShowDeleteConfirm(candidateId);
    setOpenDropdown(null);
  };

  const confirmDeleteCandidate = async (candidateId: number) => {
    setIsDeleting(candidateId);
    try {
      const candidate = allCandidates.find(c => c.id === candidateId);
      if (!candidate?.databaseId) {
        throw new Error('Database ID not found');
      }

      const response = await fetch(`/api/candidates/${candidate.databaseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }

      // Refresh the candidates list
      mutate();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Delete candidate error:', error);
      alert('Failed to delete candidate. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleDropdown = (candidateId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdown(openDropdown === candidateId ? null : candidateId);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedCandidate(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  const handleApplyFilters = (filters: CandidateFilters) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
  };

  const toggleCardView = (candidateId: number) => {
    setCompactCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(candidateId)) {
        newSet.delete(candidateId);
      } else {
        newSet.add(candidateId);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Error loading candidates</div>
            <div className="text-gray-600">{error.message}</div>
            <button 
              onClick={() => mutate()} 
              className="mt-4 btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-primary-900">Candidates</h1>
              <p className="text-secondary-600 mt-1">
                Manage your talent pipeline and candidate relationships
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Candidate</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1 relative w-full">
                <AlgoliaSearchBox
                  onResults={(results) => {
                    setAlgoliaResults(results);
                    setHasSearchQuery(results.length > 0);
                  }}
                  onLoading={setAlgoliaLoading}
                  placeholder="Search candidates by name, skills, location, or any other criteria..."
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2 shrink-0">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="review">Under Review</option>
                  <option value="longlist">Long List</option>
                </select>
                
                <button
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <Filter className="h-4 w-4" />
                  <span>Advanced Filters</span>
                </button>
                
                {/* View Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('detailed')}
                    className={`px-3 py-2.5 text-sm font-medium transition-colors flex items-center space-x-1 ${
                      viewMode === 'detailed' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Detailed View"
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Detailed</span>
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-2.5 text-sm font-medium transition-colors flex items-center space-x-1 ${
                      viewMode === 'compact' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Compact View"
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-primary-600">{allCandidates.length}</div>
            <div className="text-sm text-gray-600">Pipeline Candidates</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {allCandidates.filter((c: Candidate) => c.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {allCandidates.filter((c: Candidate) => c.status === 'Interview Scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Interviews</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {allCandidates.filter((c: Candidate) => c.score === 'Very strong').length}
            </div>
            <div className="text-sm text-gray-600">Top Candidates</div>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleBulkCompetenceFiles}
                    className="btn-primary text-sm"
                  >
                    Create Competence Files
                  </button>
                  <button className="btn-secondary text-sm">
                    Export Selected
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(isLoading || algoliaLoading) && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {useAlgoliaSearch ? 'Searching candidates...' : 'Loading candidates...'}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !algoliaLoading && allCandidates.length === 0 && (
          <Card variant="elevated">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {hasSearchQuery ? 'No candidates match your search criteria. Try adjusting your search terms.' : 'Start building your talent pipeline by adding your first candidate.'}
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add First Candidate</span>
              </button>
            </CardContent>
          </Card>
        )}

        {/* Candidates List */}
        {!isLoading && !algoliaLoading && allCandidates.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedCandidates.length === allCandidates.length && allCandidates.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                    Select All
                  </label>
                </div>
                <span className="text-sm text-gray-500">
                  {allCandidates.length} candidate{allCandidates.length > 1 ? 's' : ''} found
                  {hasSearchQuery && ' (filtered by search)'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allCandidates.map((candidate: Candidate) => {
                  const isCompact = compactCards.has(candidate.id);
                  return isCompact ? (
                    // Compact View
                    <div key={candidate.id} className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 group cursor-pointer ${
                      selectedCandidates.includes(candidate.id) ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => handleSelectCandidate(candidate.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {candidate.avatar}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs font-medium text-yellow-700">{candidate.rating}</span>
                              </div>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getScoreColor(candidate.score)}`}>
                                {candidate.score}
                              </span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                                {candidate.status}
                              </span>
                              {candidate.averageMatchScore && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center space-x-1 ${
                                  candidate.averageMatchScore >= 80 ? 'bg-green-100 text-green-800' :
                                  candidate.averageMatchScore >= 60 ? 'bg-blue-100 text-blue-800' :
                                  candidate.averageMatchScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  <Brain className="h-3 w-3" />
                                  <span>{Math.round(candidate.averageMatchScore)}%</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {candidate.currentRole}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {candidate.location}
                              </span>
                              <span>{candidate.experience}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          <button
                            onClick={() => handleViewProfile(candidate, true)}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => toggleCardView(candidate.id)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                            title="Switch to Detailed View"
                          >
                            <List className="h-4 w-4" />
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(candidate.id, e)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                            
                            {openDropdown === candidate.id && (
                              <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                  onClick={() => handleEditCandidate(candidate)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  <span>Edit Candidate</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete Candidate</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Detailed View (Original)
                    <Card key={candidate.id} variant="elevated" className={`hover:shadow-xl transition-all duration-300 border-l-4 group cursor-pointer ${
                      selectedCandidates.includes(candidate.id) ? 'border-l-blue-500 bg-blue-50' : 'border-l-primary-500'
                    }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => handleSelectCandidate(candidate.id)}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          
                          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {candidate.avatar}
                          </div>
                          
                          <div className="flex-1">
                            {/* Header with name and badges */}
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{candidate.name}</h3>
                              <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold text-yellow-700">{candidate.rating}</span>
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.score)}`}>
                                {candidate.score}
                              </span>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                                {candidate.status}
                              </span>
                              {candidate.averageMatchScore && (
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${
                                  candidate.averageMatchScore >= 80 ? 'bg-green-100 text-green-800' :
                                  candidate.averageMatchScore >= 60 ? 'bg-blue-100 text-blue-800' :
                                  candidate.averageMatchScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  <Brain className="h-3 w-3" />
                                  <span>{Math.round(candidate.averageMatchScore)}% AI Match</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Professional info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <div className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-1">
                                  <Briefcase className="h-5 w-5 text-gray-500" />
                                  <span>{candidate.currentRole}</span>
                                </div>
                                <p className="text-gray-600 text-sm">{candidate.experience} • {candidate.company}</p>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">{candidate.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Mail className="h-4 w-4" />
                                  <span>{candidate.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Summary */}
                            {candidate.summary && (
                              <div className="mb-4">
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                                  {candidate.summary}
                                </p>
                              </div>
                            )}
                            
                            {/* Skills */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Technical Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {candidate.skills.slice(0, 6).map((skill, index) => (
                                  <span 
                                    key={index}
                                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {candidate.skills.length > 6 && (
                                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                    +{candidate.skills.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Additional details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Availability:</span>
                                <p className="text-gray-600">{candidate.availability}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Expected Salary:</span>
                                <p className="text-gray-600">{candidate.expectedSalary}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Source:</span>
                                <p className="text-gray-600">{candidate.source}</p>
                              </div>
                            </div>
                            
                            {/* Languages */}
                            {candidate.languages.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {candidate.languages.slice(0, 4).map((lang, index) => (
                                    <span 
                                      key={index}
                                      className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200"
                                    >
                                      {lang}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewProfile(candidate, true)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                          
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Call"
                          >
                            <Phone className="h-5 w-5" />
                          </button>

                          <button
                            onClick={() => toggleCardView(candidate.id)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Switch to Compact View"
                          >
                            <Grid3X3 className="h-5 w-5" />
                          </button>
                          
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(candidate.id, e)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="More actions"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            
                            {openDropdown === candidate.id && (
                              <div className="absolute right-0 top-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                  onClick={() => handleEditCandidate(candidate)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Edit3 className="h-4 w-4" />
                                  <span>Edit Candidate</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete Candidate</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Candidate Modal */}
      <CreateCandidateModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onRefreshCandidates={() => mutate()}
        onViewCandidate={(candidateId) => {
          // Find the candidate by ID and open the candidate profile modal
          const candidate = candidates?.find(c => c.id === candidateId);
          if (candidate) {
            setSelectedCandidate(candidate);
            setShowModal(true);
          }
        }}
      />

      {/* Candidate Profile Drawer */}
      {selectedCandidate && (
        <CandidateProfileDrawer
          candidate={selectedCandidate}
          isOpen={showDrawer}
          onClose={handleCloseDrawer}
        />
      )}

      {/* Candidate Profile Modal */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          isOpen={showModal}
          onClose={handleCloseModal}
          initialEditMode={(selectedCandidate as any)._editMode || false}
          onRefresh={() => mutate()}
        />
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs rounded">
          Modal: {showModal ? 'OPEN' : 'CLOSED'} | Selected: {selectedCandidate?.name || 'NONE'}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Candidate</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this candidate? They will be archived and no longer appear in your candidate list.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={isDeleting === showDeleteConfirm}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteCandidate(showDeleteConfirm)}
                disabled={isDeleting === showDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isDeleting === showDeleteConfirm ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Drawer */}
      <AdvancedFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
      />
    </Layout>
  );
}