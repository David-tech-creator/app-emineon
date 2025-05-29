'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
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
  Phone
} from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const { candidates, isLoading, error } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

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
          <Link href="/candidates/new" className="btn-primary flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Add Candidate</span>
          </Link>
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
                    placeholder="Search candidates by name, skills, or experience..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Candidates</option>
                  <option value="very-strong">Very Strong</option>
                  <option value="strong">Strong</option>
                  <option value="active">Active</option>
                  <option value="interview">Interview Scheduled</option>
                </select>
              </div>
              
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Advanced Filters Coming Soon
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 gap-6">
          {mockCandidates.map((candidate) => (
            <Card key={candidate.id} variant="elevated" className="hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate.avatar}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{candidate.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{candidate.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{candidate.experience}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {candidate.skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(candidate.score)}`}>
                          {candidate.score}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(candidate.status)}`}>
                          {candidate.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Mail className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="h-4 w-4" />
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
            <p className="text-error-600">Error loading candidates: {error}</p>
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
                <Link href="/candidates/new" className="btn-primary inline-flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add First Candidate</span>
                </Link>
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
    </Layout>
  );
} 