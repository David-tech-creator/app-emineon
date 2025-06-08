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
  MoreHorizontal
} from 'lucide-react';

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'documents', label: 'Documents', icon: Download },
    { id: 'notes', label: 'Notes', icon: Edit3 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {candidate.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {candidate.name}
                </h2>
                <p className="text-gray-600 font-medium">{candidate.currentRole}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({candidate.rating}/5)</span>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.score)}`}>
                    {candidate.score}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowCreateCompetenceModal(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Competence File
              </button>
              <button 
                onClick={() => setShowAddToJobModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Job
              </button>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Interview
              </button>
              <button 
                onClick={() => setShowEmailModal(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button 
                onClick={() => window.open(`tel:${candidate.phone}`, '_self')}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 px-6 border-b border-gray-200">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-gray-400" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-3 text-gray-400" />
                        <a href={`mailto:${candidate.email}`} className="text-primary-600 hover:text-primary-700">
                          {candidate.email}
                        </a>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        <a href={`tel:${candidate.phone}`} className="text-primary-600 hover:text-primary-700">
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
                          <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center">
                            LinkedIn Profile
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {candidate.portfolioUrl && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-4 w-4 mr-3 text-gray-400" />
                          <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center">
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
                </div>

                {/* Professional Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gray-400" />
                    Skills & Languages
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Technical Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
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
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {candidate.workExperience.map((job, index) => (
                      <div key={index} className="border-l-2 border-primary-200 pl-4">
                        <h4 className="font-medium text-gray-900">{job.role}</h4>
                        <p className="text-sm text-gray-600">{job.company} • {job.duration}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    Activity Timeline
                  </h3>
                  <div className="space-y-4">
                    {candidate.timeline.map((item, index) => {
                      const TimelineIcon = getTimelineIcon(item.type);
                      const colorClass = getTimelineColor(item.type);
                      
                      return (
                        <div key={index} className="flex items-start space-x-4">
                          <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <TimelineIcon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{item.action}</p>
                            {item.details && (
                              <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{item.date}</p>
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
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-gray-400" />
                    Documents & Files
                  </h3>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No documents uploaded yet</p>
                    <button className="mt-2 text-sm text-primary-600 hover:text-primary-700">
                      Upload document
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <Edit3 className="h-5 w-5 mr-2 text-gray-400" />
                    Notes & Comments
                  </h3>
                  
                  {/* Add New Note */}
                  <div className="mb-6">
                    <textarea
                      placeholder="Add a note about this candidate..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          setNewNote('');
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No notes yet</p>
                    <p className="text-xs text-gray-400">Add notes to track important information</p>
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