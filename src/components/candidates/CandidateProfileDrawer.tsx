'use client';

import { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  Calendar, 
  MessageSquare, 
  Download, 
  Send, 
  UserPlus, 
  CalendarPlus,
  Edit3,
  ExternalLink,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  DollarSign,
  Globe,
  Building,
  Languages,
  Eye,
  MoreHorizontal,
  Paperclip,
  Smile,
  MessageCircle,
  Reply,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

interface CommunicationMessage {
  id: string;
  type: 'email' | 'linkedin' | 'whatsapp' | 'phone' | 'sms';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content: string;
  timestamp: string;
  sender: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
  attachments?: Array<{
    name: string;
    type: string;
    size: string;
  }>;
  threadId?: string;
}

interface SwissCandidate {
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
  communications?: CommunicationMessage[];
}

interface CandidateProfileDrawerProps {
  candidate: SwissCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateProfileDrawer({ 
  candidate, 
  isOpen, 
  onClose 
}: CandidateProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showAddToJobModal, setShowAddToJobModal] = useState(false);
  const [showCreateCompetenceModal, setShowCreateCompetenceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [communicationFilter, setCommunicationFilter] = useState<'all' | 'email' | 'linkedin' | 'whatsapp' | 'phone' | 'sms'>('all');
  const [communicationSearch, setCommunicationSearch] = useState('');

  if (!isOpen) return null;

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'application': return FileText;
      case 'interview': return MessageSquare;
      case 'scheduling': return Calendar;
      case 'email': return Mail;
      case 'call': return Phone;
      case 'stage_change': return TrendingUp;
      default: return Clock;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'application': return 'bg-blue-500';
      case 'interview': return 'bg-green-500';
      case 'scheduling': return 'bg-purple-500';
      case 'email': return 'bg-orange-500';
      case 'call': return 'bg-indigo-500';
      case 'stage_change': return 'bg-teal-500';
      default: return 'bg-gray-500';
    }
  };

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

  const getCommunicationIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'linkedin': return LinkIcon;
      case 'whatsapp': return MessageSquare;
      case 'phone': return Phone;
      case 'sms': return MessageCircle;
      default: return MessageSquare;
    }
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'linkedin': return 'bg-blue-700';
      case 'whatsapp': return 'bg-green-500';
      case 'phone': return 'bg-purple-500';
      case 'sms': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return Send;
      case 'delivered': return CheckCircle2;
      case 'read': return Eye;
      case 'replied': return Reply;
      default: return Clock;
    }
  };

  // Mock communication data - in real app this would come from API
  const mockCommunications: CommunicationMessage[] = [
    {
      id: '1',
      type: 'email',
      direction: 'outbound',
      subject: 'Senior Frontend Developer Position - Zurich',
      content: 'Hi Zachary, I hope this email finds you well. I came across your profile and was impressed by your experience in React and TypeScript. We have an exciting opportunity for a Senior Frontend Developer position at our Zurich office that I believe would be a perfect fit for your skills...',
      timestamp: '2024-01-15T10:30:00Z',
      sender: 'recruiter@emineon.com',
      recipient: candidate.email,
      status: 'read'
    },
    {
      id: '2',
      type: 'email',
      direction: 'inbound',
      subject: 'Re: Senior Frontend Developer Position - Zurich',
      content: 'Thank you for reaching out! I\'m definitely interested in learning more about this opportunity. The role sounds very exciting and aligns well with my career goals. I\'d love to schedule a call to discuss this further. I\'m available this week for a conversation.',
      timestamp: '2024-01-15T14:45:00Z',
      sender: candidate.email,
      recipient: 'recruiter@emineon.com',
      status: 'replied'
    },
    {
      id: '3',
      type: 'linkedin',
      direction: 'outbound',
      content: 'Hi Zachary, I noticed your impressive background in frontend development. We have some exciting opportunities that might interest you. Would you be open to a brief conversation?',
      timestamp: '2024-01-10T09:15:00Z',
      sender: 'LinkedIn Recruiter',
      recipient: candidate.name,
      status: 'read'
    },
    {
      id: '4',
      type: 'whatsapp',
      direction: 'inbound',
      content: 'Hi! Just wanted to confirm our interview scheduled for tomorrow at 2 PM. Looking forward to speaking with you!',
      timestamp: '2024-01-16T16:20:00Z',
      sender: candidate.name,
      recipient: 'Recruiter',
      status: 'delivered'
    },
    {
      id: '5',
      type: 'phone',
      direction: 'outbound',
      content: 'Phone call - Initial screening discussion (Duration: 25 minutes)',
      timestamp: '2024-01-12T11:00:00Z',
      sender: 'Recruiter',
      recipient: candidate.name,
      status: 'delivered'
    }
  ];

  const filteredCommunications = mockCommunications.filter(comm => {
    const matchesFilter = communicationFilter === 'all' || comm.type === communicationFilter;
    const matchesSearch = communicationSearch === '' || 
      comm.content.toLowerCase().includes(communicationSearch.toLowerCase()) ||
      comm.subject?.toLowerCase().includes(communicationSearch.toLowerCase()) ||
      comm.sender.toLowerCase().includes(communicationSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageCircle },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'documents', label: 'Documents', icon: Download },
    { id: 'notes', label: 'Notes', icon: Edit3 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-large transform transition-transform duration-300 ease-in-out rounded-l-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 via-primary-600 to-primary-800 rounded-tl-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-xl shadow-medium">
                {candidate.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {candidate.name}
                </h2>
                <p className="text-blue-100 font-medium">{candidate.currentRole}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < candidate.rating ? 'text-yellow-300 fill-current' : 'text-white/40'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-white/90">({candidate.rating}/5)</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white ${getScoreColor(candidate.score)}`}>
                    {candidate.score}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white transition-colors rounded-lg hover:bg-white/10 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-neutral-50 to-neutral-100">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <button 
                onClick={() => setShowCreateCompetenceModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Competence File
              </button>
              <button 
                onClick={() => setShowAddToJobModal(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Job
              </button>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Interview
              </button>
              <button 
                onClick={() => setShowEmailModal(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button 
                onClick={() => window.open(`tel:${candidate.phone}`, '_self')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 px-6 border-b border-gray-200 bg-white">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-neutral-50 to-neutral-100">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-primary-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <a href={`mailto:${candidate.email}`} className="text-primary-600 hover:text-primary-700 font-medium">
                          {candidate.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        <a href={`tel:${candidate.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">
                          {candidate.phone}
                        </a>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        {candidate.location}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {candidate.linkedinUrl && (
                        <div className="flex items-center text-sm">
                          <LinkIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center font-medium">
                            LinkedIn Profile
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {candidate.portfolioUrl && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-3 text-gray-400" />
                          <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center font-medium">
                            Portfolio
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-3 text-gray-400" />
                        {candidate.company}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                    Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Current Role</label>
                        <p className="text-sm text-gray-600">{candidate.currentRole}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-sm text-gray-600">{candidate.availability}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                        <p className="text-sm text-gray-600">{candidate.expectedSalary}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Source</label>
                        <p className="text-sm text-gray-600">{candidate.source}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Interaction</label>
                        <p className="text-sm text-gray-600">{candidate.lastInteraction}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Education</label>
                        <p className="text-sm text-gray-600">{candidate.education}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Languages */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary-600" />
                    Skills & Languages
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Technical Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 shadow-soft"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
                        <Languages className="h-4 w-4 mr-1" />
                        Languages
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {candidate.languages.map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-teal-100 to-teal-200 text-teal-800 shadow-soft"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {candidate.workExperience.map((job, index) => (
                      <div key={index} className="border-l-2 border-primary-200 pl-4 hover:border-l-primary-400 transition-colors duration-200">
                        <h4 className="font-medium text-gray-900">{job.role}</h4>
                        <p className="text-sm text-gray-600">{job.company} • {job.duration}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <div className="p-6 space-y-6">
                {/* Communication Filters and Search */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-primary-600" />
                      Communication History
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          value={communicationSearch}
                          onChange={(e) => setCommunicationSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm w-full sm:w-64"
                        />
                      </div>
                      
                      {/* Filter */}
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <select
                          value={communicationFilter}
                          onChange={(e) => setCommunicationFilter(e.target.value as any)}
                          className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm appearance-none bg-white"
                        >
                          <option value="all">All Channels</option>
                          <option value="email">Email</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="phone">Phone</option>
                          <option value="sms">SMS</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Communication Stats - Clickable Tabs */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                    {[
                      { type: 'email', count: mockCommunications.filter(c => c.type === 'email').length, color: 'bg-blue-500', icon: Mail },
                      { type: 'linkedin', count: mockCommunications.filter(c => c.type === 'linkedin').length, color: 'bg-blue-700', icon: LinkIcon },
                      { type: 'whatsapp', count: mockCommunications.filter(c => c.type === 'whatsapp').length, color: 'bg-green-500', icon: MessageSquare },
                      { type: 'phone', count: mockCommunications.filter(c => c.type === 'phone').length, color: 'bg-purple-500', icon: Phone },
                      { type: 'sms', count: mockCommunications.filter(c => c.type === 'sms').length, color: 'bg-gray-500', icon: MessageCircle }
                    ].map((stat) => {
                      const IconComponent = stat.icon;
                      return (
                        <button
                          key={stat.type}
                          onClick={() => setCommunicationFilter(stat.type as any)}
                          className={`text-center p-2 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg hover:shadow-md transition-all duration-200 ${
                            communicationFilter === stat.type ? 'ring-2 ring-primary-500' : ''
                          }`}
                        >
                          <div className={`w-6 h-6 ${stat.color} rounded-md flex items-center justify-center mx-auto mb-1`}>
                            <IconComponent className="h-3 w-3 text-white" />
                          </div>
                          <div className="text-sm font-bold text-gray-900">{stat.count}</div>
                          <div className="text-xs text-gray-600 capitalize">{stat.type}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Communication Timeline */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft">
                  <div className="space-y-4">
                    {filteredCommunications.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No communications found matching your criteria.</p>
                      </div>
                    ) : (
                      filteredCommunications
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((comm) => {
                          const IconComponent = getCommunicationIcon(comm.type);
                          const StatusIconComponent = getStatusIcon(comm.status);
                          const colorClass = getCommunicationColor(comm.type);
                          
                          return (
                            <div key={comm.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200">
                              <div className="flex items-start space-x-3">
                                {/* Channel Icon */}
                                <div className={`p-1.5 rounded-md ${colorClass} shadow-soft flex-shrink-0`}>
                                  <IconComponent className="h-3 w-3 text-white" />
                                </div>
                                
                                {/* Message Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        comm.direction === 'inbound' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      }`}>
                                        {comm.direction === 'inbound' ? '← Received' : '→ Sent'}
                                      </span>
                                      <span className="text-xs text-gray-500 capitalize">{comm.type}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <StatusIconComponent className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">
                                        {new Date(comm.timestamp).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {comm.subject && (
                                    <h4 className="font-medium text-gray-900 text-sm mb-1">{comm.subject}</h4>
                                  )}
                                  
                                  <div className="text-sm text-gray-700 mb-2">
                                    <p className="line-clamp-2">{comm.content}</p>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                      <span className="font-medium">From:</span> {comm.sender} 
                                      <span className="mx-2">•</span>
                                      <span className="font-medium">To:</span> {comm.recipient}
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {comm.attachments && comm.attachments.length > 0 && (
                                        <span className="inline-flex items-center text-xs text-gray-500">
                                          <Paperclip className="h-3 w-3 mr-1" />
                                          {comm.attachments.length} attachment{comm.attachments.length > 1 ? 's' : ''}
                                        </span>
                                      )}
                                      
                                      <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center">
                                        Reply
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Quick Actions for Communication */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-soft">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button 
                      onClick={() => setShowEmailModal(true)}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
                    >
                      <Mail className="h-3 w-3 mr-2" />
                      Send Email
                    </button>
                    
                    <button 
                      onClick={() => window.open(candidate.linkedinUrl, '_blank')}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-lg hover:from-blue-800 hover:to-blue-900 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
                    >
                      <LinkIcon className="h-3 w-3 mr-2" />
                      LinkedIn
                    </button>
                    
                    <button 
                      onClick={() => window.open(`https://wa.me/${candidate.phone.replace(/\D/g, '')}`, '_blank')}
                      className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-soft hover:shadow-medium transform hover:-translate-y-0.5"
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-4">
                    {candidate.timeline.map((event, index) => {
                      const IconComponent = getTimelineIcon(event.type);
                      const colorClass = getTimelineColor(event.type);
                      
                      return (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl hover:from-neutral-100 hover:to-neutral-200 transition-all duration-200">
                          <div className={`p-2 rounded-lg ${colorClass} shadow-soft`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{event.action}</h4>
                              <span className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            {event.details && (
                              <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary-600" />
                    Documents & Files
                  </h3>
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-soft">
                      <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No documents uploaded yet</p>
                    <button className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-2 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-soft hover:shadow-medium transform hover:-translate-y-0.5">
                      Upload Document
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Edit3 className="h-5 w-5 mr-2 text-primary-600" />
                    Notes & Comments
                  </h3>
                  
                  {/* Add New Note */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        AD
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note about this candidate..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                          rows={3}
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <Paperclip className="h-4 w-4" />
                            </button>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <Smile className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setNewNote('')}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                // Add note logic here
                                setNewNote('');
                              }}
                              className="px-4 py-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-soft"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Existing Notes */}
                  <div className="space-y-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-soft">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">John Doe</h4>
                            <span className="text-xs text-gray-500">2 hours ago</span>
                          </div>
                          <p className="text-gray-700 text-sm">Excellent technical skills and great communication. Would be a perfect fit for the senior developer role.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-soft">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          MS
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">Maria Schmidt</h4>
                            <span className="text-xs text-gray-500">1 day ago</span>
                          </div>
                          <p className="text-gray-700 text-sm">Initial phone screening completed. Candidate shows strong interest and has relevant experience.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add to Job Modal */}
      {showAddToJobModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowAddToJobModal(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add to Job</h3>
                <button onClick={() => setShowAddToJobModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Job Position</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Choose a job...</option>
                    <option value="1">Senior Frontend Developer - Zurich</option>
                    <option value="2">UX Designer - Geneva</option>
                    <option value="3">Product Manager - Basel</option>
                    <option value="4">DevOps Engineer - Bern</option>
                    <option value="5">Data Scientist - Lugano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={3}
                    placeholder="Add any notes about why this candidate is a good fit..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowAddToJobModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddToJobModal(false);
                      // Add success notification logic here
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add to Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Competence File Modal */}
      {showCreateCompetenceModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateCompetenceModal(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Competence File</h3>
                <button onClick={() => setShowCreateCompetenceModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="cv">CV/Resume</option>
                    <option value="cover-letter">Cover Letter</option>
                    <option value="portfolio">Portfolio Summary</option>
                    <option value="competence-profile">Competence Profile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="modern">Modern Professional</option>
                    <option value="classic">Classic Corporate</option>
                    <option value="creative">Creative Design</option>
                    <option value="swiss">Swiss Style</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowCreateCompetenceModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowCreateCompetenceModal(false);
                      // Navigate to competence file creation with candidate data
                      window.open('/competence-files?candidate=' + candidate.id, '_blank');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                  >
                    Create Document
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowScheduleModal(false)} />
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="phone">Phone Screening</option>
                    <option value="video">Video Interview</option>
                    <option value="in-person">In-Person Interview</option>
                    <option value="technical">Technical Assessment</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input 
                      type="time" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowScheduleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowScheduleModal(false);
                      // Add calendar integration logic here
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowEmailModal(false)} />
            <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <input 
                    type="email" 
                    value={candidate.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="">Select a template...</option>
                    <option value="interview-invitation">Interview Invitation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="rejection">Rejection (Kind)</option>
                    <option value="offer">Job Offer</option>
                    <option value="custom">Custom Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Email subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={6}
                    placeholder="Type your message here..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      setShowEmailModal(false);
                      // Add email sending logic here
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 