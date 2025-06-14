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
  MessageSquare
} from 'lucide-react';

// Candidate interface
interface Candidate {
  id: number;
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
}

export default function CandidatesPage() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const { candidates, isLoading, error } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CandidateFilters | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const authToken = await getToken();
      setToken(authToken);
    };
    fetchToken();
  }, [getToken]);

  // Mock candidates
  const allCandidates: Candidate[] = [
    {
      id: 1,
      name: 'Stefan Müller',
      location: 'Zurich, Switzerland',
      experience: 'Senior Software Engineer at Google Switzerland (2019 - 2024)',
      currentRole: 'Senior Software Engineer',
      score: 'Very strong',
      status: 'Active',
      avatar: 'SM',
      skills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'AWS', 'Kubernetes'],
      rating: 4.8,
      email: 'stefan.mueller@email.ch',
      phone: '+41 79 123 4567',
      company: 'Google Switzerland',
      summary: 'Experienced software engineer with expertise in building scalable systems and leading cross-functional teams. Fluent in German, French, and English.',
      education: 'Master of Computer Science, ETH Zurich (2019)',
      languages: ['German (Native)', 'English (Fluent)', 'French (Fluent)'],
      availability: 'Available in 3 months',
      expectedSalary: 'CHF 120,000 - 140,000',
      linkedinUrl: 'https://linkedin.com/in/stefanmueller',
      lastInteraction: '2 days ago',
      source: 'LinkedIn',
      workExperience: [
        {
          company: 'Google Switzerland',
          role: 'Senior Software Engineer',
          duration: '2019 - 2024',
          description: 'Led development of cloud infrastructure solutions, mentored junior developers, implemented microservices architecture'
        },
        {
          company: 'Credit Suisse',
          role: 'Software Developer',
          duration: '2017 - 2019',
          description: 'Developed trading platform components, worked with financial data processing systems'
        }
      ],
      timeline: [
        { date: '2024-01-15', action: 'Applied to Senior Backend Engineer position', type: 'application' },
        { date: '2024-01-16', action: 'Phone screening completed', type: 'call', details: 'Strong technical background, good culture fit' },
        { date: '2024-01-18', action: 'Technical interview scheduled', type: 'scheduling' }
      ]
    },
    {
      id: 2,
      name: 'Marie Dubois',
      location: 'Geneva, Switzerland',
      experience: 'Product Manager at Nestlé (2020 - 2024)',
      currentRole: 'Senior Product Manager',
      score: 'Very strong',
      status: 'Interview Scheduled',
      avatar: 'MD',
      skills: ['Product Strategy', 'Agile', 'Data Analysis', 'UX Research', 'Stakeholder Management'],
      rating: 4.9,
      email: 'marie.dubois@email.ch',
      phone: '+41 22 789 0123',
      company: 'Nestlé',
      summary: 'Strategic product manager with experience in FMCG and digital transformation. Strong background in international markets and consumer insights.',
      education: 'MBA, IMD Business School (2020)',
      languages: ['French (Native)', 'English (Fluent)', 'German (Conversational)'],
      availability: 'Available immediately',
      expectedSalary: 'CHF 130,000 - 150,000',
      linkedinUrl: 'https://linkedin.com/in/mariedubois',
      lastInteraction: '1 day ago',
      source: 'Referral',
      workExperience: [
        {
          company: 'Nestlé',
          role: 'Senior Product Manager',
          duration: '2020 - 2024',
          description: 'Led product strategy for digital health products, managed international product launches, coordinated with R&D teams'
        },
        {
          company: 'Procter & Gamble',
          role: 'Product Manager',
          duration: '2018 - 2020',
          description: 'Managed consumer goods portfolio, conducted market research, developed go-to-market strategies'
        }
      ],
      timeline: [
        { date: '2024-01-14', action: 'Referred by current employee', type: 'application' },
        { date: '2024-01-15', action: 'Initial screening call', type: 'call' },
        { date: '2024-01-17', action: 'Panel interview scheduled for tomorrow', type: 'scheduling', details: 'Meeting with PM team and engineering leads' }
      ]
    },
    {
      id: 3,
      name: 'Andreas Weber',
      location: 'Basel, Switzerland',
      experience: 'Data Scientist at Roche (2018 - 2024)',
      currentRole: 'Senior Data Scientist',
      score: 'Strong',
      status: 'Under Review',
      avatar: 'AW',
      skills: ['Python', 'Machine Learning', 'R', 'SQL', 'TensorFlow', 'Clinical Data'],
      rating: 4.6,
      email: 'andreas.weber@email.ch',
      phone: '+41 61 456 7890',
      company: 'Roche',
      summary: 'Data scientist specializing in pharmaceutical research and clinical trial analysis. Expert in machine learning applications for drug discovery.',
      education: 'PhD in Biostatistics, University of Basel (2018)',
      languages: ['German (Native)', 'English (Fluent)', 'Italian (Basic)'],
      availability: 'Available in 2 months',
      expectedSalary: 'CHF 110,000 - 130,000',
      linkedinUrl: 'https://linkedin.com/in/andreasweber',
      lastInteraction: '3 days ago',
      source: 'Direct Application',
      workExperience: [
        {
          company: 'Roche',
          role: 'Senior Data Scientist',
          duration: '2018 - 2024',
          description: 'Developed ML models for drug discovery, analyzed clinical trial data, collaborated with research teams globally'
        },
        {
          company: 'Novartis',
          role: 'Biostatistician',
          duration: '2016 - 2018',
          description: 'Statistical analysis of clinical trials, regulatory submission support, method development'
        }
      ],
      timeline: [
        { date: '2024-01-12', action: 'Application submitted', type: 'application' },
        { date: '2024-01-13', action: 'Resume reviewed by hiring manager', type: 'stage_change' },
        { date: '2024-01-16', action: 'Additional references requested', type: 'email' }
      ]
    },
    {
      id: 4,
      name: 'Claudia Zimmermann',
      location: 'Bern, Switzerland',
      experience: 'UX Designer at SIX Group (2019 - 2024)',
      currentRole: 'Senior UX Designer',
      score: 'Strong',
      status: 'Long List',
      avatar: 'CZ',
      skills: ['UI/UX Design', 'Figma', 'User Research', 'Design Systems', 'Prototyping'],
      rating: 4.7,
      email: 'claudia.zimmermann@email.ch',
      phone: '+41 31 234 5678',
      company: 'SIX Group',
      summary: 'Creative UX designer with fintech expertise. Passionate about creating intuitive financial applications and improving user experiences.',
      education: 'Bachelor of Design, Zurich University of the Arts (2019)',
      languages: ['German (Native)', 'English (Fluent)', 'French (Conversational)'],
      availability: 'Available in 6 weeks',
      expectedSalary: 'CHF 95,000 - 115,000',
      linkedinUrl: 'https://linkedin.com/in/claudiazimmermann',
      portfolioUrl: 'https://claudiadesigns.ch',
      lastInteraction: '5 days ago',
      source: 'Job Board',
      workExperience: [
        {
          company: 'SIX Group',
          role: 'Senior UX Designer',
          duration: '2019 - 2024',
          description: 'Designed financial trading interfaces, conducted user research, maintained design system for banking applications'
        },
        {
          company: 'PostFinance',
          role: 'UX Designer',
          duration: '2017 - 2019',
          description: 'Mobile banking app design, customer journey mapping, usability testing coordination'
        }
      ],
      timeline: [
        { date: '2024-01-10', action: 'Applied via company website', type: 'application' },
        { date: '2024-01-11', action: 'Portfolio review completed', type: 'stage_change' },
        { date: '2024-01-14', action: 'Added to talent pool', type: 'stage_change' }
      ]
    },
    {
      id: 5,
      name: 'Luca Bianchi',
      location: 'Lugano, Switzerland',
      experience: 'DevOps Engineer at ABB (2020 - 2024)',
      currentRole: 'DevOps Engineer',
      score: 'Strong',
      status: 'Active',
      avatar: 'LB',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins', 'Python'],
      rating: 4.5,
      email: 'luca.bianchi@email.ch',
      phone: '+41 91 345 6789',
      company: 'ABB',
      summary: 'DevOps engineer with industrial automation background. Expertise in cloud infrastructure and CI/CD pipelines for manufacturing systems.',
      education: 'Master of Engineering, University of Applied Sciences Southern Switzerland (2020)',
      languages: ['Italian (Native)', 'German (Fluent)', 'English (Fluent)', 'French (Basic)'],
      availability: 'Available in 1 month',
      expectedSalary: 'CHF 105,000 - 125,000',
      linkedinUrl: 'https://linkedin.com/in/lucabianchi',
      lastInteraction: '1 week ago',
      source: 'Employee Referral',
      workExperience: [
        {
          company: 'ABB',
          role: 'DevOps Engineer',
          duration: '2020 - 2024',
          description: 'Automated deployment pipelines for industrial IoT solutions, managed cloud infrastructure, implemented monitoring systems'
        },
        {
          company: 'CERN',
          role: 'Systems Administrator',
          duration: '2018 - 2020',
          description: 'Maintained high-performance computing infrastructure, automated system deployments, supported research teams'
        }
      ],
      timeline: [
        { date: '2024-01-08', action: 'Referred by DevOps team lead', type: 'application' },
        { date: '2024-01-09', action: 'Technical screening completed', type: 'call' },
        { date: '2024-01-12', action: 'Moved to active candidates', type: 'stage_change' }
      ]
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
    setSelectedCandidate(candidate);
    if (openModal) {
      setShowModal(true);
    } else {
      setShowDrawer(true);
    }
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
    // Here you would typically apply the filters to your candidate search/query
    console.log('Applied filters:', filters);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Talent Pipeline</h1>
            <p className="text-secondary-600 mt-1">
              Manage your candidates with AI-powered insights and intelligent filtering
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

        {/* Swiss Market Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card variant="elevated" className="text-center p-4">
            <div className="text-2xl font-bold text-primary-600">{allCandidates.length}</div>
            <div className="text-sm text-gray-600">Total Candidates</div>
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
            <div className="text-sm text-gray-600">Top Matches</div>
          </Card>
        </div>

        {/* Enhanced Search & Filter Bar */}
        <Card variant="elevated" className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              {/* Main Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, title, skills, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3.5 w-full border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200 text-base bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              
                             {/* Filter Button */}
               <div className="flex items-center">
                 <button
                   onClick={() => setShowFilters(true)}
                   className={`flex items-center space-x-2 px-6 py-3.5 border rounded-xl font-medium transition-all duration-200 ${
                     appliedFilters ? 
                     'bg-primary-100 border-primary-300 text-primary-700 hover:bg-primary-200' :
                     'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                   }`}
                 >
                   <Filter className="h-5 w-5" />
                   <span>All filters</span>
                   {appliedFilters && (
                     <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                       Active
                     </span>
                   )}
                 </button>
               </div>
            </div>
            
            {/* Active Filters Display */}
            {appliedFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  <div className="flex flex-wrap gap-2">
                    {appliedFilters.location.countries.map(country => (
                      <span key={country} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        📍 {country}
                        <button
                          onClick={() => {
                            const newFilters = { ...appliedFilters };
                            newFilters.location.countries = newFilters.location.countries.filter(c => c !== country);
                            setAppliedFilters(newFilters);
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {appliedFilters.skills.programmingLanguages.map(skill => (
                      <span key={skill} className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        💻 {skill}
                        <button
                          onClick={() => {
                            const newFilters = { ...appliedFilters };
                            newFilters.skills.programmingLanguages = newFilters.skills.programmingLanguages.filter(s => s !== skill);
                            setAppliedFilters(newFilters);
                          }}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => setAppliedFilters(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              </div>
            )}
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
              checked={selectedCandidates.length === allCandidates.length && allCandidates.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
              Select all candidates
            </label>
          </div>
          <span className="text-sm text-gray-500">
            {allCandidates.length} candidate{allCandidates.length > 1 ? 's' : ''} found
          </span>
        </div>

        {/* Swiss Candidates List */}
        <div className="space-y-4">
          {allCandidates.map((candidate: Candidate) => (
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
                          <span>{candidate.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">🇨🇭 Swiss Resident</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 font-medium mb-3 text-base">{candidate.experience}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {candidate.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full font-medium border border-primary-200 hover:bg-primary-100 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">
                            +{candidate.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Language Skills */}
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-sm text-gray-600 font-medium">Languages:</span>
                        {candidate.languages.slice(0, 3).map((lang, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                            {lang}
                          </span>
                        ))}
                      </div>
                      
                      {/* Quick Actions */}
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
                          <Calendar className="h-4 w-4" />
                          <span>Schedule Interview</span>
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>Send Message</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewProfile(candidate, true)}
                        className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200"
                        title="Open in Modal"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                      <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200">
                        <Mail className="h-5 w-5" />
                      </button>
                      <button className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200">
                        <Phone className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewProfile(candidate)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center space-x-2 shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                    </div>
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

        {/* Talent Insights */}
        <Card variant="outlined">
          <CardHeader title="Talent Insights">
            <div></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">AI-Powered Matching</h4>
                <p className="text-sm text-gray-600">Advanced algorithms to find the best talent matches</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Filter className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Smart Filtering</h4>
                <p className="text-sm text-gray-600">LinkedIn Recruiter-style filters for precise candidate search</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Global Network</h4>
                <p className="text-sm text-gray-600">Connect with top talent from leading companies worldwide</p>
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
        />
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