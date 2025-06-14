'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, Linkedin, User, Brain, CheckCircle, UserPlus, Loader2, Paperclip, Mic, MicOff, Eye, EyeOff, Plus, Trash2, Tag, Briefcase, Users, Star, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateCandidateModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'intake' | 'parsing' | 'review' | 'assign';

interface ParsedCandidate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentTitle: string;
  currentLocation: string;
  summary: string;
  experienceYears: number;
  technicalSkills: string[];
  softSkills: string[];
  spokenLanguages: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  seniorityLevel: string;
  primaryIndustry: string;
  availability: string;
  expectedSalary: string;
  remotePreference: string;
  // Additional fields from Prisma schema
  professionalHeadline?: string;
  nationality?: string;
  timezone?: string;
  workPermitType?: string;
  availableFrom?: string;
  graduationYear?: number;
  educationLevel?: string;
  functionalDomain?: string;
  preferredContractType?: string;
  relocationWillingness?: boolean;
  freelancer?: boolean;
  programmingLanguages: string[];
  frameworks: string[];
  toolsAndPlatforms: string[];
  methodologies: string[];
  certifications: string[];
  degrees: string[];
  universities: string[];
  notableProjects: string[];
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    university: string;
    year: string;
  }>;
}

export function CreateCandidateModal({ open, onClose }: CreateCandidateModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('intake');
  const [inputMethod, setInputMethod] = useState<'upload' | 'linkedin' | 'manual' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCandidate, setParsedCandidate] = useState<ParsedCandidate | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [selectedTalentPools, setSelectedTalentPools] = useState<string[]>([]);
  const [candidateTags, setCandidateTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCandidate, setCreatedCandidate] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const quickStartTemplates = [
    {
      role: 'Software Engineer',
      preview: 'Full-stack developer with React, Node.js, and cloud experience.',
      text: `Experienced Software Engineer with 6+ years in full-stack development. Proficient in React, Node.js, and AWS. Strong background in building scalable web applications, collaborating in agile teams, and delivering high-quality code. Passionate about learning new technologies and mentoring junior developers.`
    },
    {
      role: 'Product Manager',
      preview: 'Leads cross-functional teams to deliver product vision.',
      text: `Results-driven Product Manager with a proven track record in SaaS and fintech. Skilled at defining product strategy, gathering requirements, and leading cross-functional teams from ideation to launch. Adept at stakeholder management and data-driven decision making.`
    },
    {
      role: 'UX Designer',
      preview: 'Designs intuitive, user-centered digital experiences.',
      text: `Creative UX Designer with 5+ years of experience designing web and mobile interfaces. Expert in user research, wireframing, prototyping, and usability testing. Strong portfolio of projects improving user satisfaction and engagement.`
    },
    {
      role: 'Data Scientist',
      preview: 'Builds predictive models and data-driven insights.',
      text: `Analytical Data Scientist with expertise in Python, machine learning, and data visualization. Experienced in building predictive models, analyzing large datasets, and communicating actionable insights to business stakeholders.`
    },
    {
      role: 'DevOps Engineer',
      preview: 'Automates CI/CD and cloud infrastructure.',
      text: `DevOps Engineer with hands-on experience in AWS, Docker, Kubernetes, and CI/CD pipelines. Skilled at automating deployments, monitoring systems, and ensuring high availability for mission-critical applications.`
    },
    {
      role: 'Business Analyst',
      preview: 'Bridges business needs and technical solutions.',
      text: `Business Analyst with strong analytical and communication skills. Experienced in requirements gathering, process mapping, and delivering actionable recommendations to improve business performance.`
    },
    {
      role: 'Project Manager',
      preview: 'Delivers projects on time and within budget.',
      text: `Certified Project Manager (PMP) with 8+ years leading cross-functional teams in IT and consulting. Adept at project planning, risk management, and stakeholder communication. Consistently delivers projects on time and within budget.`
    },
    {
      role: 'Sales Representative',
      preview: 'Drives revenue growth and client relationships.',
      text: `Dynamic Sales Representative with a strong record of exceeding targets in B2B environments. Skilled in lead generation, client relationship management, and closing deals. Excellent communication and negotiation abilities.`
    },
    {
      role: 'Accountant',
      preview: 'Manages financial records and reporting.',
      text: `Detail-oriented Accountant with expertise in financial reporting, budgeting, and compliance. Proficient in SAP and QuickBooks. Strong analytical skills and a commitment to accuracy and integrity.`
    },
    {
      role: 'Graphic Designer',
      preview: 'Creates compelling visual content and branding.',
      text: `Innovative Graphic Designer with 4+ years of experience in branding, digital, and print design. Proficient in Adobe Creative Suite. Strong portfolio of work for startups and established brands.`
    },
    {
      role: 'Marketing Specialist',
      preview: 'Executes campaigns and grows brand awareness.',
      text: `Marketing Specialist with a focus on digital marketing, content creation, and campaign analytics. Experienced in SEO, SEM, and social media strategy. Proven ability to increase brand engagement and lead generation.`
    },
    {
      role: 'HR Manager',
      preview: 'Leads talent acquisition and employee engagement.',
      text: `HR Manager with 7+ years in talent acquisition, employee relations, and HR policy development. Skilled at building positive workplace cultures and supporting organizational growth.`
    }
  ];

  if (!open) return null;

  const handleClose = () => {
    // Reset all state
    setCurrentStep('intake');
    setInputMethod(null);
    setUploadedFile(null);
    setLinkedinUrl('');
    setManualInput('');
    setIsRecording(false);
    setIsParsing(false);
    setParsedCandidate(null);
    setSelectedJobs([]);
    setSelectedTalentPools([]);
    setCandidateTags([]);
    setNotes('');
    setIsSubmitting(false);
    setCreatedCandidate(null);
    onClose();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setInputMethod('upload');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      setUploadedFile(file);
      setInputMethod('upload');
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const startRecording = () => {
    setIsRecording(true);
    // Implement voice recording logic here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Process recorded audio
  };

  const handleParse = async () => {
    setIsParsing(true);
    setCurrentStep('parsing');

    // Simulate AI parsing
    setTimeout(() => {
      const mockParsedData: ParsedCandidate = {
        firstName: 'David',
        lastName: 'Vinkenroye',
        email: 'david.vinkenroye@example.com',
        phone: '+41 79 123 4567',
        currentTitle: 'Senior IT Consultant',
        currentLocation: 'Zurich, Switzerland',
        summary: 'Experienced IT consultant with 8+ years in enterprise software development and digital transformation projects.',
        experienceYears: 8,
        technicalSkills: ['Java', 'Spring Boot', 'React', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
        softSkills: ['Leadership', 'Communication', 'Problem Solving', 'Team Management'],
        spokenLanguages: ['English', 'German', 'French'],
        linkedinUrl: 'https://linkedin.com/in/davidvinkenroye',
        seniorityLevel: 'Senior',
        primaryIndustry: 'Technology',
        availability: 'Available July 2025',
        expectedSalary: 'CHF 120,000 - 140,000',
        remotePreference: 'Hybrid',
        // Additional fields
        professionalHeadline: 'Senior IT Consultant specializing in Digital Transformation',
        nationality: 'Swiss',
        timezone: 'Europe/Zurich',
        workPermitType: 'EU Citizen',
        availableFrom: '2025-07-01',
        graduationYear: 2018,
        educationLevel: 'MASTERS',
        functionalDomain: 'Information Technology',
        preferredContractType: 'FULL_TIME',
        relocationWillingness: true,
        freelancer: false,
        programmingLanguages: ['Java', 'TypeScript', 'Python', 'JavaScript'],
        frameworks: ['Spring Boot', 'React', 'Angular', 'Express.js'],
        toolsAndPlatforms: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Git'],
        methodologies: ['Agile', 'Scrum', 'DevOps', 'CI/CD'],
        certifications: ['AWS Certified Solutions Architect', 'Scrum Master Certification'],
        degrees: ['Master of Computer Science', 'Bachelor of Computer Science'],
        universities: ['ETH Zurich', 'University of Zurich'],
        notableProjects: ['Digital Banking Platform Migration', 'Enterprise ERP Implementation'],
        workExperience: [
          {
            title: 'Senior IT Consultant',
            company: 'Accenture',
            duration: '2020 - Present',
            description: 'Leading digital transformation projects for Fortune 500 clients'
          },
          {
            title: 'Software Developer',
            company: 'Credit Suisse',
            duration: '2018 - 2020',
            description: 'Developed trading platform components using Java and React'
          }
        ],
        education: [
          {
            degree: 'Master of Computer Science',
            university: 'ETH Zurich',
            year: '2018'
          }
        ]
      };

      setParsedCandidate(mockParsedData);
      setIsParsing(false);
      setCurrentStep('review');
    }, 3000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setCreatedCandidate({
        id: 'cand_' + Date.now(),
        ...parsedCandidate,
        assignedJobs: selectedJobs,
        talentPools: selectedTalentPools,
        tags: candidateTags,
        notes
      });
      setIsSubmitting(false);
      setCurrentStep('assign');
    }, 2000);
  };

  const mockJobs = [
    { id: '1', title: 'Senior Software Engineer', company: 'Credit Suisse', match: 95 },
    { id: '2', title: 'Java Developer', company: 'UBS', match: 88 },
    { id: '3', title: 'Full Stack Developer', company: 'Nestlé', match: 82 }
  ];

  const mockTalentPools = [
    { id: '1', name: 'Frontend Specialists', count: 45 },
    { id: '2', name: 'Senior Developers', count: 78 },
    { id: '3', name: 'Swiss Market', count: 156 }
  ];

  const steps = [
    { id: 'intake', label: 'Smart Intake', icon: Upload },
    { id: 'parsing', label: 'Smart Extract', icon: Brain },
    { id: 'review', label: 'Review & Edit', icon: CheckCircle },
    { id: 'assign', label: 'Assign & Save', icon: UserPlus }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Candidate</h2>
              <p className="text-gray-600">
                {currentStep === 'intake' && 'Upload CV, paste LinkedIn, or start manually'}
                {currentStep === 'parsing' && 'Extracting candidate information...'}
                {currentStep === 'review' && 'Review and edit candidate profile'}
                {currentStep === 'assign' && 'Assign to jobs and save candidate'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 
                    'text-gray-500'
                  }`}>
                    <StepIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Smart Intake */}
          {currentStep === 'intake' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    How would you like to add this candidate?
                  </h3>
                  <p className="text-gray-600">
                    Choose your preferred method to get started
                  </p>
                </div>
              </div>

              {/* Input Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Upload CV */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    inputMethod === 'upload' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Upload CV/Resume</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Drag & drop or click to upload
                  </p>
                  {uploadedFile && (
                    <div className="text-sm text-blue-600 font-medium">
                      ✓ {uploadedFile.name}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* LinkedIn URL */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    inputMethod === 'linkedin' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setInputMethod('linkedin')}
                >
                  <Linkedin className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">LinkedIn Profile</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Paste LinkedIn URL
                  </p>
                  {inputMethod === 'linkedin' && (
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      autoFocus
                    />
                  )}
                </div>

                {/* Manual Entry */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    inputMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setInputMethod('manual')}
                >
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Manual Entry</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Start from scratch
                  </p>
                </div>
              </div>

              {/* Manual Input Area */}
              {inputMethod === 'manual' && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      placeholder="Tell me about this candidate... You can paste their bio, describe their experience, or just start typing their details."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full h-32 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 rounded-lg transition-colors ${
                          isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                      <span>Recording... Click to stop</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Start Templates */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Quick Start Templates</h4>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-visible">
                  {quickStartTemplates.map((template) => {
                    const isSelected = manualInput === template.text && inputMethod === 'manual';
                    return (
                      <button
                        key={template.role}
                        type="button"
                        onClick={() => {
                          setManualInput(template.text);
                          setInputMethod('manual');
                        }}
                        className={`min-w-[180px] px-4 py-3 text-left border-2 rounded-lg transition-all duration-200 shadow-sm focus:outline-none ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100' 
                            : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'
                        }`}
                        aria-label={`Insert ${template.role} template`}
                      >
                        <div className={`font-semibold mb-1 ${
                          isSelected ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                          {template.role}
                        </div>
                        <div className={`text-xs line-clamp-2 ${
                          isSelected ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {template.preview}
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center text-xs text-blue-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <button
                  onClick={handleParse}
                  disabled={!inputMethod || (inputMethod === 'linkedin' && !linkedinUrl) || (inputMethod === 'manual' && !manualInput)}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Brain className="h-4 w-4" />
                  <span>Extract Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: AI Parsing */}
          {currentStep === 'parsing' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-10 w-10 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Extracting candidate information...
              </h3>
              <p className="text-gray-600 mb-6">
                Smart AI is analyzing and structuring the candidate profile
              </p>
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
              
              {/* Preview Card */}
              <div className="mt-8 max-w-md mx-auto p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    DV
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">David Vinkenroye</h4>
                    <p className="text-sm text-gray-600">Senior IT Consultant</p>
                    <p className="text-xs text-green-600">Available July 2025</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Edit */}
          {currentStep === 'review' && parsedCandidate && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Review & Edit Candidate Profile
                </h3>
                <p className="text-gray-600">
                  Confirm the extracted information and make any necessary adjustments
                </p>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={parsedCandidate.firstName}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={parsedCandidate.lastName}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={parsedCandidate.email}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={parsedCandidate.phone}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Title</label>
                    <input
                      type="text"
                      value={parsedCandidate.currentTitle}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, currentTitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={parsedCandidate.currentLocation}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, currentLocation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Skills & Technologies */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Skills & Technologies</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Programming Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                      Programming Languages
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.programmingLanguages?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = parsedCandidate.programmingLanguages?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, programmingLanguages: newSkills});
                            }}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add programming language..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            programmingLanguages: [...(parsedCandidate.programmingLanguages || []), e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Frameworks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      Frameworks & Libraries
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.frameworks?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = parsedCandidate.frameworks?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, frameworks: newSkills});
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add framework..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            frameworks: [...(parsedCandidate.frameworks || []), e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Tools & Platforms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                      Tools & Platforms
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.toolsAndPlatforms?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = parsedCandidate.toolsAndPlatforms?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, toolsAndPlatforms: newSkills});
                            }}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add tool or platform..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            toolsAndPlatforms: [...(parsedCandidate.toolsAndPlatforms || []), e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Soft Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      Soft Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.softSkills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = parsedCandidate.softSkills.filter((_, i) => i !== index);
                              setParsedCandidate({...parsedCandidate, softSkills: newSkills});
                            }}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add soft skill..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            softSkills: [...parsedCandidate.softSkills, e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Professional Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
                    <input
                      type="text"
                      value={parsedCandidate.professionalHeadline || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, professionalHeadline: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. Senior Software Engineer specializing in React"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={parsedCandidate.experienceYears}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, experienceYears: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seniority Level</label>
                    <select
                      value={parsedCandidate.seniorityLevel}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, seniorityLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="ENTRY">Entry Level</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID">Mid-level</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                      <option value="PRINCIPAL">Principal</option>
                      <option value="DIRECTOR">Director</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Industry</label>
                    <input
                      type="text"
                      value={parsedCandidate.primaryIndustry}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, primaryIndustry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Functional Domain</label>
                    <input
                      type="text"
                      value={parsedCandidate.functionalDomain || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, functionalDomain: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. Software Development, Product Management"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={parsedCandidate.linkedinUrl || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, linkedinUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Work Preferences */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Work Preferences</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Remote Preference</label>
                    <select
                      value={parsedCandidate.remotePreference}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, remotePreference: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="REMOTE_ONLY">Remote Only</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ON_SITE">On-site</option>
                      <option value="NO_PREFERENCE">No Preference</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                    <select
                      value={parsedCandidate.preferredContractType || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, preferredContractType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Select...</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FREELANCE">Freelance</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parsedCandidate.relocationWillingness || false}
                        onChange={(e) => setParsedCandidate({...parsedCandidate, relocationWillingness: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Open to relocation</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parsedCandidate.freelancer || false}
                        onChange={(e) => setParsedCandidate({...parsedCandidate, freelancer: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Available for freelance</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Availability & Compensation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Availability & Compensation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                    <input
                      type="date"
                      value={parsedCandidate.availableFrom || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, availableFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                    <input
                      type="text"
                      value={parsedCandidate.expectedSalary}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, expectedSalary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. CHF 100,000 - 120,000"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                    <input
                      type="text"
                      value={parsedCandidate.nationality || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <input
                      type="text"
                      value={parsedCandidate.timezone || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. Europe/Zurich"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Permit</label>
                    <input
                      type="text"
                      value={parsedCandidate.workPermitType || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, workPermitType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g. EU Citizen, Work Permit B"
                    />
                  </div>
                </div>
              </div>

              {/* Education & Certifications */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Education & Certifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Education Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      value={parsedCandidate.educationLevel || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, educationLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                    >
                      <option value="">Select...</option>
                      <option value="HIGH_SCHOOL">High School</option>
                      <option value="BACHELORS">Bachelor's Degree</option>
                      <option value="MASTERS">Master's Degree</option>
                      <option value="PHD">PhD</option>
                      <option value="PROFESSIONAL">Professional Certification</option>
                      <option value="OTHER">Other</option>
                    </select>

                    {/* Degrees */}
                    <label className="block text-sm font-medium text-gray-700 mb-2">Degrees</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.degrees?.map((degree, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center">
                          {degree}
                          <button
                            onClick={() => {
                              const newDegrees = parsedCandidate.degrees?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, degrees: newDegrees});
                            }}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add degree..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            degrees: [...(parsedCandidate.degrees || []), e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={parsedCandidate.graduationYear || ''}
                      onChange={(e) => setParsedCandidate({...parsedCandidate, graduationYear: parseInt(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                      placeholder="e.g. 2020"
                    />

                    <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.certifications?.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center">
                          {cert}
                          <button
                            onClick={() => {
                              const newCerts = parsedCandidate.certifications?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, certifications: newCerts});
                            }}
                            className="ml-2 text-yellow-600 hover:text-yellow-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add certification..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setParsedCandidate({
                            ...parsedCandidate,
                            certifications: [...(parsedCandidate.certifications || []), e.currentTarget.value.trim()]
                          });
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Professional Summary</h4>
                <textarea
                  value={parsedCandidate.summary}
                  onChange={(e) => setParsedCandidate({...parsedCandidate, summary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none"
                  placeholder="Brief professional summary..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setCurrentStep('intake')}>
                  Back
                </Button>
                <button
                  onClick={() => setCurrentStep('assign')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <span>Continue to Assignment</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Assign & Save */}
          {currentStep === 'assign' && !createdCandidate && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Assign & Save Candidate
                </h3>
                <p className="text-gray-600">
                  Assign to jobs, add to talent pools, and configure settings
                </p>
              </div>

              {/* Job Assignments */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Assign to Jobs
                </h4>
                <div className="space-y-3">
                  {mockJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedJobs([...selectedJobs, job.id]);
                            } else {
                              setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h5 className="font-medium text-gray-900">{job.title}</h5>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.match >= 90 ? 'bg-green-100 text-green-800' :
                          job.match >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.match}% match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Talent Pools */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Add to Talent Pools
                </h4>
                <div className="space-y-3">
                  {mockTalentPools.map((pool) => (
                    <div key={pool.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTalentPools.includes(pool.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTalentPools([...selectedTalentPools, pool.id]);
                            } else {
                              setSelectedTalentPools(selectedTalentPools.filter(id => id !== pool.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h5 className="font-medium text-gray-900">{pool.name}</h5>
                          <p className="text-sm text-gray-600">{pool.count} candidates</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </h4>
                  <div className="space-y-3">
                    {['Ready to Submit', 'Top Talent', 'Needs Interview', 'Internal Only'].map((tag) => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={candidateTags.includes(tag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCandidateTags([...candidateTags, tag]);
                            } else {
                              setCandidateTags(candidateTags.filter(t => t !== tag));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Notes</h4>
                  <textarea
                    placeholder="Add notes about this candidate..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => setCurrentStep('review')}>
                  Back
                </Button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Candidate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Success State */}
          {createdCandidate && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Candidate Added Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                {parsedCandidate?.firstName} {parsedCandidate?.lastName} has been added to your talent pipeline
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      window.location.href = `/candidates/${createdCandidate.id}`;
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Profile</span>
                  </button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Reset and create another
                      handleClose();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 