'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidate } from '@/hooks/useCandidates';
import { ExtendedCandidate, extendCandidate, getStatusColor } from '@/types/candidate';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Star,
  FileText,
  MessageSquare,
  Award,
  Globe,
  Linkedin,
  Github,
  Building,
  Target,
  Clock,
  DollarSign,
  GraduationCap,
  Languages,
  Tag,
  Archive,
  Eye,
  Download,
  Send,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  User,
  Loader2,
  ExternalLink,
  Badge,
  Flame,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function CandidatePage() {
  const params = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const candidateId = params.id as string;
  
  const { candidate: apiCandidate, isLoading, error, mutate } = useCandidate(candidateId);
  const [candidate, setCandidate] = useState<ExtendedCandidate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<ExtendedCandidate | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'documents' | 'interviews'>('overview');

  // Convert API candidate to extended format
  useEffect(() => {
    if (apiCandidate) {
      const extended = extendCandidate(apiCandidate as any);
      setCandidate(extended);
      setEditedCandidate(extended);
    }
  }, [apiCandidate]);

  const startEditing = () => setIsEditing(true);
  const cancelEditing = () => {
    setEditedCandidate(candidate);
    setIsEditing(false);
  };
  
  const saveChanges = async () => {
    if (!editedCandidate || !candidate) return;
    
    setIsSaving(true);
    try {
      const token = await getToken();
      const updateData = {
        firstName: editedCandidate.firstName,
        lastName: editedCandidate.lastName,
        email: editedCandidate.email,
        phone: editedCandidate.phone || undefined,
        currentTitle: editedCandidate.currentTitle || undefined,
        currentLocation: editedCandidate.currentLocation || undefined,
        summary: editedCandidate.summary || undefined,
        technicalSkills: editedCandidate.technicalSkills || [],
        experienceYears: editedCandidate.experienceYears || undefined,
        expectedSalary: editedCandidate.expectedSalary || undefined,
        linkedinUrl: editedCandidate.linkedinUrl || undefined,
        portfolioUrl: editedCandidate.portfolioUrl || undefined,
        githubUrl: editedCandidate.githubUrl || undefined,
        recruiterNotes: editedCandidate.recruiterNotes || [],
      };

      const response = await api.candidates.update(candidateId, updateData, token || undefined);
      
      if (response.success) {
        setCandidate(editedCandidate);
        setIsEditing(false);
        mutate(); // Refresh data
      } else {
        throw new Error(response.error || 'Failed to update candidate');
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      alert('Failed to update candidate. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditedCandidate(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateLocationField = (field: string, value: string) => {
    setEditedCandidate(prev => prev ? {
      ...prev,
      structuredLocation: {
        ...(prev as any).structuredLocation,
        [field]: value
      }
    } : null);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            <span className="text-lg text-neutral-600">Loading candidate...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !candidate) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Candidate Not Found</h2>
            <p className="text-neutral-600 mb-4">
              {typeof error === 'string' ? error : error?.message || 'The candidate you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
            </p>
            <Link href="/candidates">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const displayCandidate = isEditing ? editedCandidate! : candidate;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/candidates">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Candidates
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {displayCandidate.initials}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={editedCandidate?.firstName || ''}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            className="text-2xl font-bold text-neutral-900 border border-neutral-300 rounded px-2 py-1"
                            placeholder="First name"
                          />
                          <input
                            type="text"
                            value={editedCandidate?.lastName || ''}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            className="text-2xl font-bold text-neutral-900 border border-neutral-300 rounded px-2 py-1"
                            placeholder="Last name"
                          />
                        </div>
                      ) : (
                        <h1 className="text-2xl font-bold text-neutral-900">{displayCandidate.displayName}</h1>
                      )}
                      {displayCandidate.isHotlist && (
                        <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center">
                          <Flame className="h-4 w-4 mr-1" />
                          Hotlist
                        </div>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editedCandidate?.currentTitle || ''}
                          onChange={(e) => updateField('currentTitle', e.target.value)}
                          className="text-neutral-600 border border-neutral-300 rounded px-2 py-1"
                          placeholder="Job Title"
                        />
                      </div>
                    ) : (
                      <p className="text-neutral-600">
                        {displayCandidate.currentTitle || 'No Title'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(displayCandidate.status || 'new')}`}>
                  {displayCandidate.status || 'new'}
                </span>
                {displayCandidate.matchingScore && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{displayCandidate.matchingScore}% match</span>
                  </div>
                )}
                
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={cancelEditing} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveChanges} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="mt-6 border-b border-neutral-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'activity', label: 'Activity', icon: Clock },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'interviews', label: 'Interviews', icon: MessageSquare },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Contact Information</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-neutral-400" />
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedCandidate?.email || ''}
                              onChange={(e) => updateField('email', e.target.value)}
                              className="border border-neutral-300 rounded px-3 py-2 flex-1"
                            />
                          ) : (
                            <span className="text-neutral-700">{displayCandidate.email}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-neutral-400" />
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editedCandidate?.phone || ''}
                              onChange={(e) => updateField('phone', e.target.value)}
                              className="border border-neutral-300 rounded px-3 py-2 flex-1"
                              placeholder="Phone number"
                            />
                          ) : (
                            <span className="text-neutral-700">{displayCandidate.phone || 'No phone'}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-neutral-400" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedCandidate?.currentLocation || ''}
                              onChange={(e) => updateField('currentLocation', e.target.value)}
                              className="border border-neutral-300 rounded px-3 py-2 flex-1"
                              placeholder="Current location"
                            />
                          ) : (
                            <span className="text-neutral-700">{displayCandidate.currentLocation || 'No location'}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-neutral-400" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedCandidate?.currentCompany || ''}
                              onChange={(e) => updateField('currentCompany', e.target.value)}
                              className="border border-neutral-300 rounded px-3 py-2 flex-1"
                              placeholder="Current company"
                            />
                          ) : (
                            <span className="text-neutral-700">{displayCandidate.currentCompany || 'No company'}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Briefcase className="h-5 w-5 text-neutral-400" />
                          <div>
                            <span className="text-sm text-neutral-500">Experience</span>
                            <p className="text-neutral-700 font-medium">
                              {displayCandidate.experienceYears || 0} years
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Target className="h-5 w-5 text-neutral-400" />
                          <div>
                            <span className="text-sm text-neutral-500">Seniority Level</span>
                            <p className="text-neutral-700 font-medium">
                              {displayCandidate.seniorityLevel || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-5 w-5 text-neutral-400" />
                          <div>
                            <span className="text-sm text-neutral-500">Expected Salary</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editedCandidate?.expectedSalary || ''}
                                onChange={(e) => updateField('expectedSalary', e.target.value)}
                                className="border border-neutral-300 rounded px-2 py-1 w-full"
                                placeholder="Expected salary"
                              />
                            ) : (
                              <p className="text-neutral-700 font-medium">
                                {displayCandidate.expectedSalary || 'Not specified'}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-neutral-400" />
                          <div>
                            <span className="text-sm text-neutral-500">Remote Preference</span>
                            <p className="text-neutral-700 font-medium">
                              {displayCandidate.remotePreference || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Summary */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Professional Summary</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-neutral-700 mb-2">Experience</h4>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedCandidate?.experienceYears || 0}
                            onChange={(e) => updateField('experienceYears', parseInt(e.target.value) || 0)}
                            className="border border-neutral-300 rounded px-3 py-2 w-full"
                            min="0"
                            max="50"
                          />
                        ) : (
                          <p className="text-neutral-600">{displayCandidate.experienceYears || 0} years</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-700 mb-2">Primary Industry</h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedCandidate?.primaryIndustry || ''}
                            onChange={(e) => updateField('primaryIndustry', e.target.value)}
                            className="border border-neutral-300 rounded px-3 py-2 w-full"
                            placeholder="Primary industry"
                          />
                        ) : (
                          <p className="text-neutral-600">{displayCandidate.primaryIndustry || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Professional Headline */}
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-700 mb-2">Professional Headline</h4>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedCandidate?.professionalHeadline || ''}
                          onChange={(e) => updateField('professionalHeadline', e.target.value)}
                          className="border border-neutral-300 rounded px-3 py-2 w-full"
                          placeholder="Professional headline..."
                        />
                      ) : (
                        <p className="text-neutral-600">{displayCandidate.professionalHeadline || 'No headline available'}</p>
                      )}
                    </div>
                    
                    {/* Summary */}
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-700 mb-2">Summary</h4>
                      {isEditing ? (
                        <textarea
                          value={editedCandidate?.summary || ''}
                          onChange={(e) => updateField('summary', e.target.value)}
                          className="border border-neutral-300 rounded px-3 py-2 w-full h-24"
                          placeholder="Professional summary..."
                        />
                      ) : (
                        <p className="text-neutral-600">{displayCandidate.summary || 'No summary available'}</p>
                      )}
                    </div>
                    
                    {/* Technical Skills */}
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-700 mb-3">Technical Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(displayCandidate.technicalSkills || []).map((skill: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {(!displayCandidate.technicalSkills || displayCandidate.technicalSkills.length === 0) && (
                          <span className="text-neutral-400 text-sm">No technical skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Soft Skills */}
                    <div className="mb-6">
                      <h4 className="font-medium text-neutral-700 mb-3">Soft Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(displayCandidate.softSkills || []).map((skill: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                        {(!displayCandidate.softSkills || displayCandidate.softSkills.length === 0) && (
                          <span className="text-neutral-400 text-sm">No soft skills listed</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Programming Languages */}
                    {displayCandidate.programmingLanguages && displayCandidate.programmingLanguages.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-neutral-700 mb-3">Programming Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {displayCandidate.programmingLanguages.map((lang: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Frameworks */}
                    {displayCandidate.frameworks && displayCandidate.frameworks.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-neutral-700 mb-3">Frameworks & Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {displayCandidate.frameworks.map((framework: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                              {framework}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Education */}
                    {displayCandidate.degrees && displayCandidate.degrees.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-neutral-700 mb-3">Education</h4>
                        <div className="space-y-2">
                          {displayCandidate.degrees.map((degree: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 text-neutral-400" />
                              <span className="text-neutral-600">{degree}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Certifications */}
                    {displayCandidate.certifications && displayCandidate.certifications.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-neutral-700 mb-3">Certifications</h4>
                        <div className="space-y-2">
                          {displayCandidate.certifications.map((cert: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-neutral-400" />
                              <span className="text-neutral-600">{cert}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Spoken Languages */}
                    {displayCandidate.spokenLanguages && displayCandidate.spokenLanguages.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-neutral-700 mb-3">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {displayCandidate.spokenLanguages.map((language: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                              <Languages className="h-3 w-3 mr-1" />
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-neutral-700 mb-3">Professional Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* LinkedIn */}
                        <div className="flex items-center space-x-2">
                          <Linkedin className="h-4 w-4 text-blue-600" />
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedCandidate?.linkedinUrl || ''}
                              onChange={(e) => updateField('linkedinUrl', e.target.value)}
                              className="border border-neutral-300 rounded px-2 py-1 flex-1 text-sm"
                              placeholder="LinkedIn URL"
                            />
                          ) : displayCandidate.linkedinUrl ? (
                            <a 
                              href={displayCandidate.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm flex items-center"
                            >
                              LinkedIn
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-sm">No LinkedIn</span>
                          )}
                        </div>
                        
                        {/* GitHub */}
                        <div className="flex items-center space-x-2">
                          <Github className="h-4 w-4 text-gray-900" />
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedCandidate?.githubUrl || ''}
                              onChange={(e) => updateField('githubUrl', e.target.value)}
                              className="border border-neutral-300 rounded px-2 py-1 flex-1 text-sm"
                              placeholder="GitHub URL"
                            />
                          ) : displayCandidate.githubUrl ? (
                            <a 
                              href={displayCandidate.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-gray-900 hover:underline text-sm flex items-center"
                            >
                              GitHub
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-sm">No GitHub</span>
                          )}
                        </div>
                        
                        {/* Portfolio */}
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-green-600" />
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedCandidate?.portfolioUrl || ''}
                              onChange={(e) => updateField('portfolioUrl', e.target.value)}
                              className="border border-neutral-300 rounded px-2 py-1 flex-1 text-sm"
                              placeholder="Portfolio URL"
                            />
                          ) : displayCandidate.portfolioUrl ? (
                            <a 
                              href={displayCandidate.portfolioUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline text-sm flex items-center"
                            >
                              Portfolio
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ) : (
                            <span className="text-neutral-400 text-sm">No Portfolio</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Recruiter Notes</h3>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <textarea
                        value={editedCandidate?.recruiterNotes || ''}
                        onChange={(e) => updateField('recruiterNotes', e.target.value)}
                        className="border border-neutral-300 rounded px-3 py-2 w-full h-32"
                        placeholder="Add your notes about this candidate..."
                      />
                    ) : (
                      <div className="p-4 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-700">
                          {displayCandidate.recruiterNotes || 'No notes available'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Quick Actions</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Schedule Call
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Interview
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Assign to Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Candidate Stats */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Candidate Stats</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Profile Views</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Last Activity</span>
                        <span className="font-medium text-sm">
                          {displayCandidate.lastActivity?.toLocaleDateString() || 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Source</span>
                        <span className="font-medium">{displayCandidate.source || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-600">Conversion Status</span>
                        <span className="font-medium">
                          {displayCandidate.conversionStatus || 'In Pipeline'}
                        </span>
                      </div>
                      {displayCandidate.matchingScore && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-600">Matching Score</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{displayCandidate.matchingScore}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                {displayCandidate.tags && displayCandidate.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-neutral-900">Tags</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {displayCandidate.tags.map((tag: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Source Info */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-neutral-900">Source Information</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-neutral-600">Added by:</span>
                        <p className="font-medium">System</p>
                      </div>
                      <div>
                        <span className="text-sm text-neutral-600">Date added:</span>
                        <p className="font-medium">{new Date(displayCandidate.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm text-neutral-600">Last updated:</span>
                        <p className="font-medium">{new Date(displayCandidate.lastUpdated).toLocaleDateString()}</p>
                      </div>
                      {displayCandidate.profileToken && (
                        <div>
                          <span className="text-sm text-neutral-600">Profile Token:</span>
                          <p className="font-mono text-xs text-neutral-500 break-all">
                            {displayCandidate.profileToken}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-neutral-900">Activity Timeline</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No activity recorded yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'documents' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-neutral-900">Documents</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No documents uploaded yet.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'interviews' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-neutral-900">Interview History</h3>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">No interviews scheduled yet.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
} 