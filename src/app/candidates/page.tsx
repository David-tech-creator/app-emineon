'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CreateCandidateModal } from '@/components/candidates/CreateCandidateModal';
import { useCandidates } from '@/hooks/useCandidates';
import { useAuth } from '@clerk/nextjs';
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
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const { candidates, isLoading, error } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
    };
    fetchToken();
  }, [getToken]);

  const mockCandidates = [
    {
      id: 1,
      name: 'Marilyn Garcia',
      location: 'Sydney, Australia',
      experience: 'Medical Science Liaison at Pfizer (2015 - 2023)',
      score: 'Very strong',
      status: 'Active',
      avatar: 'MG',
      skills: ['Clinical Research', 'Medical Affairs', 'Regulatory'],
      rating: 4.8
    },
    {
      id: 2,
      name: 'Frances Jimenez',
      location: 'Melbourne, Australia',
      experience: 'Clinical Research Associate at Pfizer (2019 - 2023)',
      score: 'Very strong',
      status: 'Interview Scheduled',
      avatar: 'FJ',
      skills: ['Clinical Trials', 'GCP', 'Data Analysis'],
      rating: 4.6
    },
    {
      id: 3,
      name: 'Angela Walker',
      location: 'San Jose, United States',
      experience: 'Medical Science Liaison at Gilead Sciences (2019 - 2023)',
      score: 'Very strong',
      status: 'Under Review',
      avatar: 'AW',
      skills: ['Medical Communications', 'KOL Management', 'Clinical Research'],
      rating: 4.9
    },
    {
      id: 4,
      name: 'Zachary Carter',
      location: 'Breda, Netherlands',
      experience: 'Medical Science Liaison at AbbVie (2018 - 2023)',
      score: 'Strong',
      status: 'Long List',
      avatar: 'ZC',
      skills: ['Medical Affairs', 'Scientific Communication', 'Clinical Data'],
      rating: 4.4
    }
  ];

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
    if (selectedCandidates.length === mockCandidates.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(mockCandidates.map(c => c.id));
    }
  };

  const handleBulkCompetenceFiles = () => {
    // Navigate to competence files page with selected candidates
    const selectedNames = mockCandidates
      .filter(c => selectedCandidates.includes(c.id))
      .map(c => c.name)
      .join(',');
    window.location.href = `/competence-files?candidates=${encodeURIComponent(selectedNames)}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Candidates</h1>
            <p className="text-secondary-600 mt-1">
              Manage your talent pipeline with advanced scoring and insights
            </p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Candidate</span>
          </button>
        </div>

        {/* LinkedIn Recruiter-Style Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-primary-600">{mockCandidates.length}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockCandidates.filter(c => c.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockCandidates.filter(c => c.status === 'Interview Scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Interviews</div>
          </Card>
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockCandidates.filter(c => c.score === 'Very strong').length}
            </div>
            <div className="text-sm text-gray-600">Top Matches</div>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card variant="elevated">
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, title, skills, company, location, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-primary-600" />
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Candidates</option>
                    <option value="available">Available</option>
                    <option value="very-strong">Very Strong Match</option>
                    <option value="strong">Strong Match</option>
                    <option value="active">Active</option>
                    <option value="interview">Interview Scheduled</option>
                    <option value="senior">Senior Level</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="border border-neutral-300 rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-neutral-500" />
                  <select className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Experience Level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-5 years)</option>
                    <option value="senior">Senior Level (6-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-neutral-500" />
                  <select className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Industry</option>
                    <option value="tech">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="consulting">Consulting</option>
                    <option value="ecommerce">E-commerce</option>
                  </select>
                </div>
                
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>More Filters</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedCandidates.length > 0 && (
          <Card variant="elevated" className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setSelectedCandidates([])}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBulkCompetenceFiles}
                    className="btn-primary flex items-center space-x-2 text-sm"
                  >
                    <span>Create Competence Files</span>
                  </button>
                  <button className="bg-white border border-primary-300 text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium">
                    Add to Job
                  </button>
                  <button className="bg-white border border-primary-300 text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-medium">
                    Send Message
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Select All Option */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedCandidates.length === mockCandidates.length && mockCandidates.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
              Select all candidates
            </label>
          </div>
          <span className="text-sm text-gray-500">
            {mockCandidates.length} candidate{mockCandidates.length > 1 ? 's' : ''} found
          </span>
        </div>

        {/* LinkedIn Recruiter-Style Candidates List */}
        <div className="space-y-4">
          {mockCandidates.map((candidate) => (
            <Card key={candidate.id} variant="elevated" className={`hover:shadow-xl transition-all duration-300 border-l-4 group cursor-pointer ${
              selectedCandidates.includes(candidate.id) ? 'border-l-blue-500 bg-blue-50' : 'border-l-primary-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(candidate.id)}
                        onChange={() => handleSelectCandidate(candidate.id)}
                        className="mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {candidate.avatar}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{candidate.name}</h3>
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
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-primary-500" />
                          <span className="font-medium">{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4 text-primary-500" />
                          <span>8+ years experience</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-3 text-base">{candidate.experience}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {candidate.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full font-medium border border-primary-200 hover:bg-primary-100 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      {/* LinkedIn Recruiter-Style Quick Actions */}
                      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
                          <span>Add to Job</span>
                        </button>
                        <button 
                          onClick={() => window.location.href = '/competence-files'}
                          className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1"
                        >
                          <span>Create Competence File</span>
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
                          <span>Schedule Interview</span>
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
                          <span>Send Message</span>
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
                          <span>Add Note</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200">
                        <Mail className="h-5 w-5" />
                      </button>
                      <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200">
                        <Phone className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center space-x-2 shadow-md">
                      <span>View Profile</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading/Error States */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-secondary-600">Loading candidates...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-error-600">Error loading candidates: {error.message || String(error)}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && candidates.length === 0 && (
          <Card variant="elevated">
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">No candidates yet</h3>
                <p className="text-secondary-600 mb-6">
                  Start building your talent pipeline by adding your first candidate.
                </p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add First Candidate</span>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advanced Features Preview */}
        <Card variant="outlined">
          <CardHeader title="Advanced Features">
            <div></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">AI-Powered Scoring</h4>
                <p className="text-sm text-gray-600">Intelligent candidate scoring coming soon</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Smart Filtering</h4>
                <p className="text-sm text-gray-600">Advanced search and filtering coming soon</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Bulk Operations</h4>
                <p className="text-sm text-gray-600">Batch actions and workflows coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Candidate Modal */}
      <CreateCandidateModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </Layout>
  );
} 