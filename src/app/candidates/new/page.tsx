'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { candidateParsingSchema, transformCandidateFormData, type CandidateParsingInput } from '@/lib/validation';
import { api } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Upload, 
  FileText, 
  Linkedin, 
  User, 
  MapPin, 
  Briefcase,
  GraduationCap,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  X,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';

interface ParsedData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  summary?: string;
  skills?: string[];
  experience?: number;
  education?: any[];
  workHistory?: any[];
  location?: {
    city?: string;
    country?: string;
  };
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

// Fix the form schema to make experience required with default
const formDefaultValues: Partial<CandidateParsingInput> = {
  firstName: '',
  lastName: '',
  email: '',
  experience: 0,
  preferredEmployment: [],
  remoteWork: false,
  willingToRelocate: false,
  currency: 'USD',
  source: 'Manual Entry',
};

export default function NewCandidatePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMethod, setParseMethod] = useState<'none' | 'cv' | 'linkedin'>('none');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CandidateParsingInput>({
    resolver: zodResolver(candidateParsingSchema),
    defaultValues: formDefaultValues,
  });

  // Drag and drop for CV upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setParseMethod('cv');
      setParseError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  const parseCV = async () => {
    if (!uploadedFile) return;
    
    setIsParsing(true);
    setParseError(null);
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('cv', uploadedFile);
      
      const response = await fetch('/api/candidates/parse-cv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        fillFormWithParsedData(result.data);
        setParseSuccess(true);
        setTimeout(() => setParseSuccess(false), 3000);
      } else {
        setParseError(result.error || 'Failed to parse CV');
      }
    } catch (error) {
      console.error('CV parsing error:', error);
      setParseError('Failed to parse CV. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const parseLinkedIn = async () => {
    if (!linkedinUrl.trim()) return;
    
    setIsParsing(true);
    setParseError(null);
    
    try {
      const token = await getToken();
      const response = await fetch('/api/candidates/parse-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkedinUrl }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        fillFormWithParsedData(result.data);
        setParseSuccess(true);
        setTimeout(() => setParseSuccess(false), 3000);
      } else {
        setParseError(result.error || 'Failed to parse LinkedIn profile');
      }
    } catch (error) {
      console.error('LinkedIn parsing error:', error);
      setParseError('Failed to parse LinkedIn profile. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const fillFormWithParsedData = (data: ParsedData) => {
    // Fill basic information
    if (data.firstName) setValue('firstName', data.firstName);
    if (data.lastName) setValue('lastName', data.lastName);
    if (data.email) setValue('email', data.email);
    if (data.phone) setValue('phone', data.phone);
    
    // Professional information
    if (data.currentTitle) setValue('currentTitle', data.currentTitle);
    if (data.currentCompany) setValue('currentCompany', data.currentCompany);
    if (data.summary) setValue('summary', data.summary);
    if (data.experience) setValue('experience', data.experience);
    
    // Skills
    if (data.skills && data.skills.length > 0) {
      setValue('skills', data.skills.join(', '));
    }
    
    // Location
    if (data.location?.city) setValue('city', data.location.city);
    if (data.location?.country) setValue('country', data.location.country);
    
    // Education (use first education entry)
    if (data.education && data.education.length > 0) {
      const edu = data.education[0];
      if (edu.degree) setValue('degree', edu.degree);
      if (edu.university) setValue('university', edu.university);
      if (edu.year) setValue('graduationYear', edu.year);
    }
    
    // URLs
    if (data.linkedinUrl) setValue('linkedinUrl', data.linkedinUrl);
    if (data.portfolioUrl) setValue('portfolioUrl', data.portfolioUrl);
    if (data.githubUrl) setValue('githubUrl', data.githubUrl);
    
    // Set source
    setValue('source', parseMethod === 'linkedin' ? 'LinkedIn' : 'CV Upload');
  };

  const onSubmit = async (data: CandidateParsingInput) => {
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      // Transform the form data to match API expectations
      const candidateData = transformCandidateFormData(data);

      const response = await api.candidates.create(candidateData, token || undefined);
      
      if (response.success) {
        router.push('/candidates');
      } else {
        throw new Error(response.error || 'Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      alert('Failed to create candidate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearParseData = () => {
    setParseMethod('none');
    setUploadedFile(null);
    setLinkedinUrl('');
    setParseError(null);
    setParseSuccess(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link 
            href="/candidates" 
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-secondary-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary-900">Add New Candidate</h1>
            <p className="text-secondary-600 mt-1">
              Upload a CV, paste a LinkedIn URL, or enter candidate information manually
            </p>
          </div>
        </div>

        {/* Parsing Methods */}
        <Card variant="elevated">
          <CardHeader title="Import Candidate Information">
            <div></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Method Selection */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setParseMethod('cv')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    parseMethod === 'cv' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Upload CV/Resume</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setParseMethod('linkedin')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    parseMethod === 'linkedin' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Linkedin className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">LinkedIn URL</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setParseMethod('none')}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    parseMethod === 'none' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <User className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Manual Entry</div>
                </button>
              </div>

              {/* CV Upload */}
              {parseMethod === 'cv' && (
                <div className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                      isDragActive
                        ? 'border-blue-400 bg-blue-50'
                        : isDragReject
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    {uploadedFile ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {isDragActive ? 'Drop your CV here' : 'Drag & drop your CV here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          or click to browse (PDF, DOC, DOCX, TXT • Max 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {uploadedFile && (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={parseCV}
                        disabled={isParsing}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Parsing CV...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            <span>Parse CV</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <X className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn URL */}
              {parseMethod === 'linkedin' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="flex-1 input-field"
                      />
                      <button
                        type="button"
                        onClick={parseLinkedIn}
                        disabled={isParsing || !linkedinUrl.trim()}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Parsing...</span>
                          </>
                        ) : (
                          <>
                            <Linkedin className="h-4 w-4" />
                            <span>Parse</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Parse Status */}
              {parseError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <X className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{parseError}</p>
                    </div>
                  </div>
                </div>
              )}

              {parseSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        Candidate information parsed successfully! Review and edit the form below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(parseMethod !== 'none' && (uploadedFile || linkedinUrl)) && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearParseData}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear and start manual entry
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Candidate Information Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card variant="elevated">
            <CardHeader title="Basic Information">
              <User className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700 mb-2">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    id="firstName"
                    className="input-field"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    id="lastName"
                    className="input-field"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-secondary-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card variant="elevated">
            <CardHeader title="Location">
              <MapPin className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-secondary-700 mb-2">
                    City
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    id="city"
                    className="input-field"
                    placeholder="San Francisco"
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-secondary-700 mb-2">
                    Country
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    id="country"
                    className="input-field"
                    placeholder="United States"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card variant="elevated">
            <CardHeader title="Professional Information">
              <Briefcase className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="currentTitle" className="block text-sm font-medium text-secondary-700 mb-2">
                      Current Title
                    </label>
                    <input
                      {...register('currentTitle')}
                      type="text"
                      id="currentTitle"
                      className="input-field"
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div>
                    <label htmlFor="currentCompany" className="block text-sm font-medium text-secondary-700 mb-2">
                      Current Company
                    </label>
                    <input
                      {...register('currentCompany')}
                      type="text"
                      id="currentCompany"
                      className="input-field"
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-secondary-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    {...register('summary')}
                    id="summary"
                    rows={4}
                    className="input-field"
                    placeholder="Brief professional summary highlighting key experiences and achievements..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-secondary-700 mb-2">
                      Years of Experience *
                    </label>
                    <input
                      {...register('experience', { valueAsNumber: true })}
                      type="number"
                      id="experience"
                      min="0"
                      max="50"
                      className="input-field"
                      placeholder="5"
                    />
                    {errors.experience && (
                      <p className="mt-1 text-sm text-error-600">{errors.experience.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-secondary-700 mb-2">
                      Skills
                    </label>
                    <input
                      {...register('skills')}
                      type="text"
                      id="skills"
                      className="input-field"
                      placeholder="JavaScript, React, Node.js, TypeScript"
                    />
                    <p className="mt-1 text-xs text-secondary-500">
                      Separate skills with commas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card variant="elevated">
            <CardHeader title="Education">
              <GraduationCap className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-secondary-700 mb-2">
                    Degree
                  </label>
                  <input
                    {...register('degree')}
                    type="text"
                    id="degree"
                    className="input-field"
                    placeholder="Bachelor of Computer Science"
                  />
                </div>

                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-secondary-700 mb-2">
                    University
                  </label>
                  <input
                    {...register('university')}
                    type="text"
                    id="university"
                    className="input-field"
                    placeholder="Stanford University"
                  />
                </div>

                <div>
                  <label htmlFor="graduationYear" className="block text-sm font-medium text-secondary-700 mb-2">
                    Graduation Year
                  </label>
                  <input
                    {...register('graduationYear', { valueAsNumber: true })}
                    type="number"
                    id="graduationYear"
                    min="1950"
                    max="2030"
                    className="input-field"
                    placeholder="2020"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences & Compensation */}
          <Card variant="elevated">
            <CardHeader title="Preferences & Compensation">
              <DollarSign className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="expectedSalary" className="block text-sm font-medium text-secondary-700 mb-2">
                      Expected Salary
                    </label>
                    <input
                      {...register('expectedSalary')}
                      type="text"
                      id="expectedSalary"
                      className="input-field"
                      placeholder="100000"
                    />
                  </div>

                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-secondary-700 mb-2">
                      Currency
                    </label>
                    <select
                      {...register('currency')}
                      id="currency"
                      className="input-field"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <input
                      {...register('remoteWork')}
                      type="checkbox"
                      id="remoteWork"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remoteWork" className="text-sm text-secondary-700">
                      Open to remote work
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      {...register('willingToRelocate')}
                      type="checkbox"
                      id="willingToRelocate"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="willingToRelocate" className="text-sm text-secondary-700">
                      Willing to relocate
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links & URLs */}
          <Card variant="elevated">
            <CardHeader title="Links & URLs">
              <LinkIcon className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-secondary-700 mb-2">
                    Portfolio URL
                  </label>
                  <input
                    {...register('portfolioUrl')}
                    type="url"
                    id="portfolioUrl"
                    className="input-field"
                    placeholder="https://johndoe.dev"
                  />
                </div>

                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-secondary-700 mb-2">
                    GitHub URL
                  </label>
                  <input
                    {...register('githubUrl')}
                    type="url"
                    id="githubUrl"
                    className="input-field"
                    placeholder="https://github.com/johndoe"
                  />
                </div>

                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-secondary-700 mb-2">
                    Website URL
                  </label>
                  <input
                    {...register('websiteUrl')}
                    type="url"
                    id="websiteUrl"
                    className="input-field"
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card variant="elevated">
            <CardHeader title="Internal Notes">
              <FileText className="h-5 w-5 text-secondary-600" />
            </CardHeader>
            <CardContent>
              <div>
                <label htmlFor="recruiterNotes" className="block text-sm font-medium text-secondary-700 mb-2">
                  Recruiter Notes
                </label>
                <textarea
                  {...register('recruiterNotes')}
                  id="recruiterNotes"
                  rows={3}
                  className="input-field"
                  placeholder="Internal notes about the candidate..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <Link 
              href="/candidates" 
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Candidate</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 