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
  ChevronLeft,
  ChevronRight
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

interface CandidateProfileModalProps {
  candidate: SwissCandidate;
  isOpen: boolean;
  onClose: () => void;
}

export function CandidateProfileModal({ 
  candidate, 
  isOpen, 
  onClose 
}: CandidateProfileModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
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
    { id: 'documents', label: 'Documents', icon: Download }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50" 
          onClick={onClose}
        />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block w-full max-w-6xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {candidate.avatar}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {candidate.name}
                </h2>
                <p className="text-gray-600 font-medium text-lg">{candidate.currentRole}</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600 font-medium">({candidate.rating}/5)</span>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getScoreColor(candidate.score)}`}>
                    {candidate.score}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                    {candidate.status}
                  </span>
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    🇨🇭 Swiss Resident
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-3">
              <button 
                onClick={() => setShowCreateCompetenceModal(true)}
                className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Send className="h-5 w-5 mr-2" />
                Create Competence File
              </button>
              <button 
                onClick={() => setShowAddToJobModal(true)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add to Job
              </button>
              <button 
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <CalendarPlus className="h-5 w-5 mr-2" />
                Schedule Interview
              </button>
              <button 
                onClick={() => setShowEmailModal(true)}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </button>
              <button 
                onClick={() => window.open(`tel:${candidate.phone}`, '_self')}
                className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center space-x-8 mb-6 border-b border-gray-200">
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
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact & Location */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-gray-400" />
                      Contact Information
                    </h3>
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
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-3 text-gray-400" />
                        {candidate.company}
                      </div>
                      {candidate.linkedinUrl && (
                        <div className="flex items-center text-sm">
                          <LinkIcon className="h-4 w-4 mr-3 text-gray-400" />
                          <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex items-center font-medium">
                            LinkedIn Profile
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Professional Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                      Professional Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-sm text-gray-600">{candidate.availability}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                        <p className="text-sm text-gray-600">{candidate.expectedSalary}</p>
                      </div>
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

                {/* Professional Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-400" />
                    Professional Summary
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
                </div>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-gray-400" />
                      Technical Skills
                    </h3>
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

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Languages className="h-5 w-5 mr-2 text-gray-400" />
                      Languages
                    </h3>
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

                {/* Work Experience */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                    Work Experience
                  </h3>
                  <div className="space-y-6">
                    {candidate.workExperience.map((job, index) => (
                      <div key={index} className="border-l-4 border-primary-200 pl-6">
                        <h4 className="font-semibold text-gray-900 text-lg">{job.role}</h4>
                        <p className="text-primary-600 font-medium">{job.company} • {job.duration}</p>
                        <p className="text-gray-600 mt-2 leading-relaxed">{job.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-400" />
                  Activity Timeline
                </h3>
                <div className="space-y-6">
                  {candidate.timeline.map((item, index) => {
                    const TimelineIcon = getTimelineIcon(item.type);
                    const colorClass = getTimelineColor(item.type);
                    
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <TimelineIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900">{item.action}</p>
                          {item.details && (
                            <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2 font-medium">{item.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Download className="h-5 w-5 mr-2 text-gray-400" />
                  Documents & Files
                </h3>
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No documents uploaded yet</p>
                  <p className="text-sm text-gray-400 mt-1">Documents will appear here when uploaded</p>
                  <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Upload Document
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
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