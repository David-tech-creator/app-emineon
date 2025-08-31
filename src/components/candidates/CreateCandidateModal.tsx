'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { X, Upload, FileText, Linkedin, User, Brain, CheckCircle, UserPlus, Loader2, Paperclip, Mic, MicOff, Eye, EyeOff, Plus, Trash2, Tag, Briefcase, Users, Star, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Job {
  id: string;
  title: string;
  company: string;
  status: string;
  department?: string;
  location?: string;
}

interface TalentPool {
  id: string;
  name: string;
  count: number;
}

interface CreatedCandidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentTitle: string;
  currentLocation: string;
}

interface CreateCandidateModalProps {
  open: boolean;
  onClose: () => void;
  jobId?: string; // Optional job ID to automatically assign candidate to
  onCandidateCreated?: (candidate: CreatedCandidate) => void; // Callback when candidate is created
  onViewCandidate?: (candidateId: string) => void; // Callback to open candidate modal
  onRefreshCandidates?: () => void; // Callback to refresh candidates list
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

interface ParsedData {
  fullName?: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  location?: string;
  summary?: string;
  yearsOfExperience?: number;
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  education?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string;
  }>;
}

export function CreateCandidateModal({ open, onClose, jobId, onCandidateCreated, onViewCandidate, onRefreshCandidates }: CreateCandidateModalProps) {
  const { getToken } = useAuth();
  const router = useRouter();
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
  const [createdCandidate, setCreatedCandidate] = useState<CreatedCandidate | null>(null);
  
  // Real data states
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [availableTalentPools, setAvailableTalentPools] = useState<TalentPool[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingTalentPools, setLoadingTalentPools] = useState(false);
  
  // Tag input states
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real jobs and talent pools when modal opens
  useEffect(() => {
    if (open) {
      fetchJobs();
      fetchTalentPools();
      fetchAvailableTags();
    }
  }, [open]);

  // Auto-assign current job when jobId is provided
  useEffect(() => {
    if (jobId && availableJobs.length > 0) {
      const currentJob = availableJobs.find(job => job.id === jobId);
      if (currentJob && !selectedJobs.includes(jobId)) {
        setSelectedJobs([jobId]);
      }
    }
  }, [jobId, availableJobs, selectedJobs]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchTalentPools = async () => {
    setLoadingTalentPools(true);
    try {
      // For now, we'll use mock data since talent pools API might not exist yet
      // In the future, this would be: const response = await fetch('/api/talent-pools');
      const mockPools = [
        { id: '1', name: 'Frontend Specialists', count: 45 },
        { id: '2', name: 'Backend Engineers', count: 32 },
        { id: '3', name: 'Full Stack Developers', count: 78 },
        { id: '4', name: 'Senior Developers', count: 56 },
        { id: '5', name: 'Swiss Market', count: 156 },
        { id: '6', name: 'Remote Workers', count: 89 }
      ];
      setAvailableTalentPools(mockPools);
    } catch (error) {
      console.error('Error fetching talent pools:', error);
    } finally {
      setLoadingTalentPools(false);
    }
  };

  const fetchAvailableTags = async () => {
    try {
      // Mock available tags - in production this could come from API
      const commonTags = [
        'Hot Candidate',
        'Top Talent',
        'Ready to Submit',
        'Needs Interview',
        'Internal Only',
        'Remote Preferred',
        'Local Only',
        'Urgent',
        'High Potential',
        'Culture Fit',
        'Technical Expert',
        'Leadership Material',
        'Quick Start',
        'Flexible',
        'Bilingual'
      ];
      setAvailableTags(commonTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

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
    setTagInput('');
    setShowTagSuggestions(false);
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

  // Tag input handlers
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    setShowTagSuggestions(value.length > 0);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !candidateTags.includes(tag.trim())) {
      setCandidateTags([...candidateTags, tag.trim()]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setCandidateTags(candidateTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag(tagInput.trim());
      }
    } else if (e.key === 'Backspace' && !tagInput && candidateTags.length > 0) {
      removeTag(candidateTags[candidateTags.length - 1]);
    }
  };

  const filteredTagSuggestions = availableTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !candidateTags.includes(tag)
  );

  const handleParse = async () => {
    setIsParsing(true);
    setCurrentStep('parsing');

    try {
      let parsedData: ParsedData | null = null;
      
      if (inputMethod === 'upload' && uploadedFile) {
        // Parse uploaded file
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await fetch('/api/competence-files/parse-resume', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to parse uploaded file');
        }
        
        const result = await response.json();
        if (result.success) {
          parsedData = result.data;
        } else {
          throw new Error(result.message || 'Failed to parse file');
        }
      } else if (inputMethod === 'linkedin' && linkedinUrl) {
        // Parse LinkedIn profile text
        const response = await fetch('/api/competence-files/parse-linkedin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: linkedinUrl }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to parse LinkedIn profile text');
        }
        
        const result = await response.json();
        if (result.success) {
          parsedData = result.data;
        } else {
          throw new Error(result.message || 'Failed to parse LinkedIn profile');
        }
      } else if (inputMethod === 'manual' && manualInput) {
        // Validate manual input length
        if (manualInput.trim().length < 50) {
          throw new Error('Please provide more detailed information. Your input should include at least basic candidate details like name, contact info, and experience.');
        }
        
        // Parse manual text input
        const response = await fetch('/api/competence-files/parse-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: manualInput }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to parse text input');
        }
        
        const result = await response.json();
        if (result.success) {
          parsedData = result.data;
        } else {
          throw new Error(result.message || 'Failed to parse text');
        }
      } else {
        throw new Error('Please provide input data to parse');
      }

      if (parsedData) {
        // Map the parsed data to our candidate structure
        const mappedCandidate: ParsedCandidate = {
          // Split fullName into first and last name
          firstName: parsedData.fullName?.split(' ')[0] || '',
          lastName: parsedData.fullName?.split(' ').slice(1).join(' ') || '',
          email: parsedData.email || '',
          phone: parsedData.phone || '',
          currentTitle: parsedData.currentTitle || '',
          currentLocation: parsedData.location || '',
          summary: parsedData.summary || '',
          experienceYears: parsedData.yearsOfExperience || 0,
          technicalSkills: parsedData.skills || [],
          softSkills: [], // Will be filled from skills analysis
          spokenLanguages: parsedData.languages || [],
          linkedinUrl: linkedinUrl || '',
          seniorityLevel: (parsedData.yearsOfExperience && parsedData.yearsOfExperience > 5) ? 'SENIOR' : 
                         (parsedData.yearsOfExperience && parsedData.yearsOfExperience > 2) ? 'MID_LEVEL' : 'JUNIOR',
          primaryIndustry: 'Technology', // Default - could be enhanced with AI classification
          availability: 'Available',
          expectedSalary: '',
          remotePreference: 'HYBRID',
          // Additional fields matching Prisma schema
          professionalHeadline: parsedData.currentTitle || '',
          nationality: '',
          timezone: '',
          workPermitType: '',
          availableFrom: '',
          graduationYear: new Date().getFullYear(),
          educationLevel: 'BACHELOR',
          functionalDomain: '',
          preferredContractType: 'PERMANENT',
          relocationWillingness: false,
          freelancer: false,
          programmingLanguages: parsedData.skills?.filter((skill: string) => 
            ['javascript', 'typescript', 'python', 'java', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'].includes(skill.toLowerCase())
          ) || [],
          frameworks: parsedData.skills?.filter((skill: string) => 
            ['react', 'angular', 'vue', 'spring', 'django', 'express', 'laravel', 'rails'].includes(skill.toLowerCase())
          ) || [],
          toolsAndPlatforms: parsedData.skills?.filter((skill: string) => 
            ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git'].includes(skill.toLowerCase())
          ) || [],
          methodologies: parsedData.skills?.filter((skill: string) => 
            ['agile', 'scrum', 'devops', 'tdd', 'ci/cd'].includes(skill.toLowerCase())
          ) || [],
          certifications: parsedData.certifications || [],
          degrees: parsedData.education || [],
          universities: parsedData.education?.map((edu: string) => {
            // Extract university name from education string
            const parts = edu.split(' - ');
            return parts.length > 1 ? parts[1] : edu;
          }) || [],
          notableProjects: [],
          workExperience: parsedData.experience?.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            duration: `${exp.startDate} - ${exp.endDate}`,
            description: exp.responsibilities || ''
          })) || [],
          education: parsedData.education?.map((edu: string) => {
            const parts = edu.split(' - ');
            return {
              degree: parts[0] || edu,
              university: parts[1] || '',
              year: new Date().getFullYear().toString()
            };
          }) || []
        };

        setParsedCandidate(mappedCandidate);
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Parsing error:', error);
      alert(`Error parsing candidate data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('intake');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!parsedCandidate) {
        throw new Error('No candidate data to submit');
      }

      // Prepare candidate data for API
      const candidateData = {
        ...parsedCandidate,
        tags: candidateTags,
        notes,
        source: inputMethod === 'upload' ? 'resume_upload' : 
                inputMethod === 'linkedin' ? 'linkedin_import' : 'manual_entry'
      };

      console.log('Submitting candidate data:', candidateData);

      const token = await getToken();
      
      // Check if we have an uploaded CV file to include
      const hasUploadedFile = uploadedFile && inputMethod === 'upload';
      
      let response;
      if (hasUploadedFile) {
        // Send as FormData to include the CV file
        const formData = new FormData();
        formData.append('candidateData', JSON.stringify(candidateData));
        formData.append('cvFile', uploadedFile);
        
        console.log('📎 Submitting candidate with CV file:', uploadedFile.name);
        
        response = await fetch('/api/candidates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Send as JSON only
        response = await fetch('/api/candidates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(candidateData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create candidate');
      }

      const result = await response.json();
      
      if (result.success) {
        const createdCandidateData = {
          id: result.data.id,
          ...parsedCandidate,
          assignedJobs: selectedJobs,
          talentPools: selectedTalentPools,
          tags: candidateTags,
          notes
        };
        
        // CV file is now handled directly by the candidate creation API
        setCreatedCandidate(createdCandidateData);
        
        // Refresh the candidates list
        if (onRefreshCandidates) {
          onRefreshCandidates();
        }
        
        // If jobId is provided, automatically assign candidate to job
        if (jobId) {
          try {
            const assignResponse = await fetch(`/api/jobs/${jobId}/candidates`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ candidateId: result.data.id }),
            });

            if (assignResponse.ok) {
              // Call the callback to refresh the candidates list
              onCandidateCreated?.(createdCandidateData);
              return; // Skip going to assign step
            } else {
              console.error('Failed to assign candidate to job');
            }
          } catch (error) {
            console.error('Error assigning candidate to job:', error);
          }
        }
        
        setCurrentStep('assign');
      } else {
        throw new Error(result.message || 'Failed to create candidate');
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      alert(`Error creating candidate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };



  const steps = [
    { id: 'intake', label: 'Smart Intake', icon: Upload },
    { id: 'parsing', label: 'Smart Extract', icon: Brain },
    { id: 'review', label: 'Review & Edit', icon: CheckCircle },
    { id: 'assign', label: 'Assign & Save', icon: UserPlus }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0A2F5A]/10 rounded-lg">
              <UserPlus className="h-6 w-6 text-[#0A2F5A]" />
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
                    isActive ? 'bg-[#0A2F5A]/10 text-[#0A2F5A]' : 
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
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-220px)]">
          {/* Step 1: Smart Intake */}
          {currentStep === 'intake' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-[#0A2F5A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="h-8 w-8 text-[#0A2F5A]" />
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
                    inputMethod === 'upload' ? 'border-[#0A2F5A] bg-[#0A2F5A]/5' : 'border-gray-300 hover:border-gray-400'
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
                    <div className="text-sm text-[#0A2F5A] font-medium">
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

                {/* LinkedIn Profile Text */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    inputMethod === 'linkedin' ? 'border-[#0A2F5A] bg-[#0A2F5A]/5' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setInputMethod('linkedin')}
                >
                  <Linkedin className="h-8 w-8 text-[#0A2F5A] mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">LinkedIn Profile</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Paste LinkedIn profile text
                  </p>
                  {inputMethod === 'linkedin' && (
                    <textarea
                      placeholder="Copy and paste the LinkedIn profile text here..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                      autoFocus
                    />
                  )}
                </div>

                {/* Manual Entry */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    inputMethod === 'manual' ? 'border-[#0A2F5A] bg-[#0A2F5A]/5' : 'border-gray-300 hover:border-gray-400'
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
                      placeholder="Enter candidate details here... Include at least:
• Full name and contact information
• Current role and experience
• Key skills and qualifications
• Education or certifications

Example:
John Smith, john@email.com, +41 79 123 4567
Senior Software Engineer at TechCorp with 5 years experience
Skills: React, TypeScript, Python, AWS
Bachelor's in Computer Science from ETH Zurich"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#0A2F5A] focus:border-[#0A2F5A] text-sm"
                    />
                    <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                      {manualInput.length}/50 min
                    </div>
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
                  
                  {inputMethod === 'manual' && manualInput.length > 0 && manualInput.length < 50 && (
                    <div className="flex items-center space-x-2 text-amber-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please provide more details for better parsing results (minimum 50 characters)</span>
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
                            ? 'border-[#0A2F5A] bg-[#0A2F5A]/5 shadow-md ring-2 ring-[#0A2F5A]/20' 
                            : 'border-gray-300 bg-white hover:border-[#0A2F5A]/30 hover:bg-[#0A2F5A]/5 hover:shadow-md'
                        }`}
                        aria-label={`Insert ${template.role} template`}
                      >
                        <div className={`font-semibold mb-1 ${
                          isSelected ? 'text-[#0A2F5A]' : 'text-gray-800'
                        }`}>
                          {template.role}
                        </div>
                        <div className={`text-xs line-clamp-2 ${
                          isSelected ? 'text-[#0A2F5A]/80' : 'text-gray-500'
                        }`}>
                          {template.preview}
                        </div>
                        {isSelected && (
                          <div className="mt-2 flex items-center text-xs text-[#0A2F5A]">
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
                  disabled={!inputMethod || (inputMethod === 'linkedin' && !linkedinUrl.trim()) || (inputMethod === 'manual' && !manualInput.trim()) || (inputMethod === 'upload' && !uploadedFile)}
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
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#0A2F5A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="h-8 w-8 text-[#0A2F5A] animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Processing candidate information...
              </h3>
              <p className="text-gray-600 mb-8">
                {uploadedFile ? `Analyzing ${uploadedFile.name}` : 'Extracting and structuring profile data'}
              </p>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-[#0A2F5A] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#0A2F5A] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#0A2F5A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                      <span className="w-3 h-3 bg-[#0A2F5A] rounded-full mr-2"></span>
                      Frameworks & Libraries
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {parsedCandidate.frameworks?.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-[#0A2F5A]/10 text-[#0A2F5A] rounded-full text-sm flex items-center">
                          {skill}
                          <button
                            onClick={() => {
                              const newSkills = parsedCandidate.frameworks?.filter((_, i) => i !== index) || [];
                              setParsedCandidate({...parsedCandidate, frameworks: newSkills});
                            }}
                            className="ml-2 text-[#0A2F5A] hover:text-[#083248]"
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
                      <option value="INTERN">Intern</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="MID_LEVEL">Mid-level</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                      <option value="PRINCIPAL">Principal</option>
                      <option value="ARCHITECT">Architect</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="VP">VP</option>
                      <option value="C_LEVEL">C-Level</option>
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
                      <option value="REMOTE">Remote Only</option>
                      <option value="HYBRID">Hybrid</option>
                      <option value="ONSITE">On-site</option>
                      <option value="FLEXIBLE">Flexible</option>
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
                      <option value="PERMANENT">Permanent</option>
                      <option value="FREELANCE">Freelance</option>
                      <option value="FIXED_TERM">Fixed Term</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parsedCandidate.relocationWillingness || false}
                        onChange={(e) => setParsedCandidate({...parsedCandidate, relocationWillingness: e.target.checked})}
                        className="h-4 w-4 text-[#0A2F5A] focus:ring-[#0A2F5A] border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Open to relocation</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parsedCandidate.freelancer || false}
                        onChange={(e) => setParsedCandidate({...parsedCandidate, freelancer: e.target.checked})}
                        className="h-4 w-4 text-[#0A2F5A] focus:ring-[#0A2F5A] border-gray-300 rounded"
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
                      <option value="ASSOCIATE">Associate Degree</option>
                      <option value="BACHELOR">Bachelor's Degree</option>
                      <option value="MASTER">Master's Degree</option>
                      <option value="PHD">PhD</option>
                      <option value="CERTIFICATION">Professional Certification</option>
                      <option value="BOOTCAMP">Bootcamp</option>
                      <option value="SELF_TAUGHT">Self-taught</option>
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
                  {jobId && (
                    <span className="ml-2 px-2 py-1 bg-[#0A2F5A]/10 text-[#0A2F5A] text-xs rounded-full">
                      Auto-assigned
                    </span>
                  )}
                </h4>
                {loadingJobs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">Loading jobs...</span>
                  </div>
                ) : availableJobs.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No active jobs found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {availableJobs.map((job) => {
                      const isCurrentJob = job.id === jobId;
                      return (
                        <div key={job.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          isCurrentJob ? 'border-[#0A2F5A]/30 bg-[#0A2F5A]/5' : 'border-gray-200'
                        }`}>
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
                              className="h-4 w-4 text-[#0A2F5A] focus:ring-[#0A2F5A] border-gray-300 rounded"
                            />
                            <div>
                              <h5 className={`font-medium ${isCurrentJob ? 'text-[#0A2F5A]' : 'text-gray-900'}`}>
                                {job.title}
                                {isCurrentJob && (
                                  <span className="ml-2 text-xs text-[#0A2F5A]/80 font-normal">(Current Job)</span>
                                )}
                              </h5>
                              <p className={`text-sm ${isCurrentJob ? 'text-[#0A2F5A]/70' : 'text-gray-600'}`}>
                                {job.location || 'Location not specified'} • {job.status || 'Active'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {job.department || 'General'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Talent Pools */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Add to Talent Pools
                </h4>
                {loadingTalentPools ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">Loading talent pools...</span>
                  </div>
                ) : availableTalentPools.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No talent pools available</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {availableTalentPools.map((pool) => (
                      <div key={pool.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                            className="h-4 w-4 text-[#0A2F5A] focus:ring-[#0A2F5A] border-gray-300 rounded"
                          />
                          <div>
                            <h5 className="font-medium text-gray-900">{pool.name}</h5>
                            <p className="text-sm text-gray-600">{pool.count} candidates</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </h4>
                  
                  {/* Selected Tags */}
                  {candidateTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {candidateTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0A2F5A]/10 text-[#0A2F5A]"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[#0A2F5A]/60 hover:bg-[#0A2F5A]/20 hover:text-[#0A2F5A]"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag Input with Autocomplete */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type to add tags... (Press Enter or comma to add)"
                      value={tagInput}
                      onChange={(e) => handleTagInputChange(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                      onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2F5A] focus:border-[#0A2F5A] text-sm"
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredTagSuggestions.slice(0, 8).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Type and press Enter or comma to add custom tags. Click suggestions to add quickly.
                  </p>
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
                      // Close modal and open candidate modal
                      onClose();
                      if (onViewCandidate) {
                        onViewCandidate(createdCandidate.id);
                      }
                    }}
                    className="btn-primary flex items-center justify-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Candidate</span>
                  </button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Reset all form state and start over
                      setCreatedCandidate(null);
                      setCurrentStep('intake');
                      setUploadedFile(null);
                      setManualInput('');
                      setParsedCandidate({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        currentTitle: '',
                        currentLocation: '',
                        summary: '',
                        experienceYears: 0,
                        technicalSkills: [],
                        softSkills: [],
                        spokenLanguages: [],
                        linkedinUrl: '',
                        githubUrl: '',
                        portfolioUrl: '',
                        seniorityLevel: 'JUNIOR',
                        primaryIndustry: '',
                        availability: '',
                        expectedSalary: '',
                        remotePreference: 'HYBRID',
                        professionalHeadline: '',
                        nationality: '',
                        timezone: '',
                        workPermitType: 'CITIZEN',
                        availableFrom: '',
                        graduationYear: new Date().getFullYear(),
                        educationLevel: 'BACHELOR',
                        functionalDomain: '',
                        preferredContractType: 'PERMANENT',
                        relocationWillingness: false,
                        freelancer: false,
                        programmingLanguages: [],
                        frameworks: [],
                        toolsAndPlatforms: [],
                        methodologies: [],
                        certifications: [],
                        degrees: [],
                        universities: [],
                        notableProjects: [],
                        workExperience: [],
                        education: []
                      });
                      setSelectedJobs(jobId ? [jobId] : []);
                      setSelectedTalentPools([]);
                      setCandidateTags([]);
                      setTagInput('');
                      setNotes('');
                      setIsSubmitting(false);
                      setIsParsing(false);
                      // Reset other states
                      setLinkedinUrl('');
                      setInputMethod(null);
                    }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Another</span>
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