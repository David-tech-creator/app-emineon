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
  Globe
} from 'lucide-react';
import { CreateCompetenceFileModal } from '@/components/competence-files/CreateCompetenceFileModal';
import { AddToJobModal } from './AddToJobModal';

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
  linkedinUrl?: string;
  portfolioUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  tags: string[];
  timeline: Array<{
    date: string;
    action: string;
    type: string;
    details?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  workHistory?: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface CandidateDrawerProps {
  candidate: Candidate | null;
  stages: PipelineStage[];
  onClose: () => void;
  onStageChange: (candidateId: string, newStage: string) => void;
  onRatingChange: (candidateId: string, newRating: number) => void;
  onNotesUpdate: (candidateId: string, notes: string) => void;
}

export function CandidateDrawer({ 
  candidate, 
  stages, 
  onClose, 
  onStageChange, 
  onRatingChange, 
  onNotesUpdate 
}: CandidateDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isCompetenceFileModalOpen, setIsCompetenceFileModalOpen] = useState(false);
  const [isAddToJobModalOpen, setIsAddToJobModalOpen] = useState(false);

  if (!candidate) return null;

  // Convert candidate data for competence file modal
  const competenceFileCandidate = candidate ? {
    id: candidate.id,
    fullName: `${candidate.firstName} ${candidate.lastName}`,
    currentTitle: candidate.currentRole,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.currentLocation,
    yearsOfExperience: parseInt(candidate.experience) || 5,
    skills: candidate.skills,
    certifications: [],
    experience: candidate.workHistory?.map(job => ({
      company: job.company,
      title: job.role,
      startDate: '2020-01', // Mock data
      endDate: job.duration.includes('Present') ? 'Present' : '2023-12',
      responsibilities: job.description
    })) || [],
    education: candidate.education?.map(edu => edu.degree) || [],
    languages: ['English (Professional)', 'German (Intermediate)'], // Mock data
    summary: candidate.notes || `Experienced ${candidate.currentRole} with strong technical skills`
  } : null;

  // Convert candidate data for Add to Job modal
  const addToJobCandidate = candidate ? {
    id: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    currentRole: candidate.currentRole,
    skills: candidate.skills
  } : null;

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

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = candidate.notes ? `${candidate.notes}\n\n${newNote}` : newNote;
      onNotesUpdate(candidate.id, updatedNotes);
      setNewNote('');
    }
  };

  const handleCreateCompetenceFile = (fileData: any) => {
    console.log('Competence file created:', fileData);
    // Handle competence file creation
    setIsCompetenceFileModalOpen(false);
  };

  const handleAddToJob = async (jobId: string, candidateId: string) => {
    console.log('Adding candidate to job:', { jobId, candidateId });
    // Handle adding candidate to job
    // This would typically call an API to add the candidate to the job pipeline
    
    // Mock success
    alert(`Successfully added ${candidate.firstName} ${candidate.lastName} to the selected job!`);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'documents', label: 'Documents', icon: Download },
    { id: 'notes', label: 'Notes', icon: Edit3 }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-100">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {candidate.firstName} {candidate.lastName}
                </h2>
                <p className="text-gray-600 font-medium">{candidate.currentRole}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => onRatingChange(candidate.id, i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-4 w-4 cursor-pointer transition-colors ${
                            i < candidate.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({candidate.rating}/5)</span>
                  </div>
                  <select
                    value={candidate.stage}
                    onChange={(e) => onStageChange(candidate.id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
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
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <button 
                onClick={() => setIsCompetenceFileModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Competence File
              </button>
              <button 
                onClick={() => setIsAddToJobModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add to Job
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <Send className="h-4 w-4 mr-2" />
                Submit to Client
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <CalendarPlus className="h-4 w-4 mr-2" />
                Schedule Interview
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
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
                        {candidate.currentLocation}
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
                        <Briefcase className="h-4 w-4 mr-3 text-gray-400" />
                        {candidate.source}
                      </div>
                    </div>
                  </div>
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
                        <label className="text-sm font-medium text-gray-700">Experience</label>
                        <p className="text-sm text-gray-600">{candidate.experience}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Availability</label>
                        <p className="text-sm text-gray-600">{candidate.availability}</p>
                      </div>
                      {candidate.expectedSalary && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                          <p className="text-sm text-gray-600">{candidate.expectedSalary}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      {candidate.noticePeriod && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Notice Period</label>
                          <p className="text-sm text-gray-600">{candidate.noticePeriod}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Interaction</label>
                        <p className="text-sm text-gray-600">{candidate.lastInteraction}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Tags */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gray-400" />
                    Skills & Tags
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Technical Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    {candidate.tags.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {candidate.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Work History */}
                {candidate.workHistory && candidate.workHistory.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-gray-400" />
                      Work History
                    </h3>
                    <div className="space-y-4">
                      {candidate.workHistory.map((job, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-medium text-gray-900">{job.role}</h4>
                          <p className="text-sm text-gray-600">{job.company} • {job.duration}</p>
                          <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {candidate.education && candidate.education.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-gray-400" />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                  <div className="space-y-4">
                    {candidate.resumeUrl && (
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">Resume.pdf</p>
                            <p className="text-sm text-gray-500">Uploaded 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <a
                            href={candidate.resumeUrl}
                            download
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No additional documents uploaded</p>
                      <button className="mt-2 text-sm text-primary-600 hover:text-primary-700">
                        Upload document
                      </button>
                    </div>
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
                  
                  {/* Existing Notes */}
                  {candidate.notes && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Previous Notes</h4>
                        <button
                          onClick={() => setIsEditingNotes(!isEditingNotes)}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          {isEditingNotes ? 'Cancel' : 'Edit'}
                        </button>
                      </div>
                      {isEditingNotes ? (
                        <div className="space-y-3">
                          <textarea
                            defaultValue={candidate.notes}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            rows={4}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Handle save
                                setIsEditingNotes(false);
                              }}
                              className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingNotes(false)}
                              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{candidate.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Add New Note */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Add New Note</label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add your notes about this candidate..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      rows={4}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <CreateCompetenceFileModal
        isOpen={isCompetenceFileModalOpen}
        onClose={() => setIsCompetenceFileModalOpen(false)}
        onSuccess={handleCreateCompetenceFile}
        preselectedCandidate={competenceFileCandidate}
      />
      
      <AddToJobModal
        isOpen={isAddToJobModalOpen}
        candidate={addToJobCandidate}
        onClose={() => setIsAddToJobModalOpen(false)}
        onAddToJob={handleAddToJob}
      />
    </div>
  );
} 