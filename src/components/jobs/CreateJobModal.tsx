'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import {
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Loader2,
  Plus,
  Check,
  Upload,
  Sparkles,
  DollarSign,
  Users,
  Clock,
  Briefcase,
  Target,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Copy,
  Eye,
  Settings,
  UserPlus,
  Share2,
  Mic,
  MicOff,
  Send,
  Paperclip,
  Type
} from 'lucide-react';

// Enhanced form schema following E2E flow
const jobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  contractType: z.enum(['permanent', 'contract', 'freelance', 'fixed-term']),
  startDate: z.string().min(1, 'Start date is required'),
  duration: z.string().optional(),
  salary: z.string().optional(),
  workMode: z.enum(['on-site', 'remote', 'hybrid']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  languages: z.array(z.string()).optional(),
  department: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  owner: z.string().min(1, 'Job owner is required'),
  status: z.enum(['draft', 'active']).default('draft')
});

type JobFormData = z.infer<typeof jobSchema>;

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
}

const contractTypes = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'fixed-term', label: 'Fixed-term' },
  { value: 'internship', label: 'Internship' },
];

const currencies = ['CHF', 'EUR', 'USD', 'GBP'];

const recentClients = [
  'Acme Corporation',
  'TechStart AG',
  'Global Solutions Ltd',
  'Innovation Hub',
  'Digital Dynamics',
];

const popularJobTitles = [
  'Software Engineer',
  'Product Manager',
  'Data Scientist',
  'UX Designer',
  'DevOps Engineer',
  'Business Analyst',
  'Project Manager',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
];

export function CreateJobModal({ open, onClose }: CreateJobModalProps) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'intake' | 'parsing' | 'review' | 'configure' | 'success'>('intake');

  const [jobDescription, setJobDescription] = useState('');
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [parsedData, setParsedData] = useState<Partial<JobFormData> | null>(null);
  const [createdJob, setCreatedJob] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [chatInput, setChatInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      contractType: 'permanent',
      workMode: 'hybrid',
      priority: 'medium',
      status: 'draft',
      startDate: '',
      description: '',
      owner: '',
      skills: [] as string[],
      languages: [] as string[],
      duration: '',
      salary: '',
      department: ''
    }
  });

  const handleTitleChange = (value: string) => {
    setValue('title', value);
    if (value.length > 0) {
      const suggestions = popularJobTitles.filter(title =>
        title.toLowerCase().includes(value.toLowerCase())
      );
      setTitleSuggestions(suggestions.slice(0, 5));
    } else {
      setTitleSuggestions([]);
    }
  };

  const handleClientChange = (value: string) => {
    setValue('company', value);
    if (value.length > 0) {
      const suggestions = recentClients.filter(client =>
        client.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(suggestions.slice(0, 5));
    } else {
      setClientSuggestions([]);
    }
  };

  // Enhanced AI parsing function with real GPT integration
  const parseJobDescription = async (text: string) => {
    setIsParsingAI(true);
    setCurrentStep('parsing');
    
    try {
      // Call the AI job description parsing API
      const response = await fetch('/api/ai/job-description/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse job description');
      }

      const result = await response.json();
      
      // Enhanced parsed data with AI extraction
      const aiParsedData: Partial<JobFormData> = {
        title: result.data?.title || extractTitle(text) || 'Senior Software Developer',
        company: result.data?.company || extractCompany(text) || 'Tech Company',
        location: result.data?.location || extractLocation(text) || 'Zurich, Switzerland',
        contractType: result.data?.contractType || extractContractType(text) || 'permanent',
        workMode: result.data?.workMode || extractWorkMode(text) || 'hybrid',
        description: result.data?.description || text,
        skills: result.data?.skills || extractSkills(text),
        languages: result.data?.languages || extractLanguages(text),
        department: result.data?.department || extractDepartment(text),
        priority: result.data?.priority || 'medium',
        owner: 'Current User',
        salary: result.data?.salary || '',
        duration: result.data?.duration || ''
      };

      setParsedData(aiParsedData);
      
      // Pre-fill form with parsed data
      if (aiParsedData.title) setValue('title', aiParsedData.title);
      if (aiParsedData.company) setValue('company', aiParsedData.company);
      if (aiParsedData.location) setValue('location', aiParsedData.location);
      if (aiParsedData.contractType) setValue('contractType', aiParsedData.contractType as any);
      if (aiParsedData.workMode) setValue('workMode', aiParsedData.workMode as any);
      if (aiParsedData.description) setValue('description', aiParsedData.description);
      if (aiParsedData.skills) setValue('skills', aiParsedData.skills as any);
      if (aiParsedData.languages) setValue('languages', aiParsedData.languages as any);
      if (aiParsedData.priority) setValue('priority', aiParsedData.priority as any);
      if (aiParsedData.owner) setValue('owner', aiParsedData.owner);
      if (aiParsedData.department) setValue('department', aiParsedData.department as any);
      if (aiParsedData.salary) setValue('salary', aiParsedData.salary);
      if (aiParsedData.duration) setValue('duration', aiParsedData.duration);
    } catch (error) {
      console.error('AI parsing failed, using fallback:', error);
      // Fallback to local extraction
      const fallbackParsedData: Partial<JobFormData> = {
        title: extractTitle(text) || 'Senior Software Developer',
        company: extractCompany(text) || 'Tech Company',
        location: extractLocation(text) || 'Zurich, Switzerland',
        contractType: extractContractType(text) || 'permanent',
        workMode: extractWorkMode(text) || 'hybrid',
        description: text,
        skills: extractSkills(text),
        languages: extractLanguages(text),
        department: extractDepartment(text),
        priority: 'medium',
        owner: 'Current User'
      };

      setParsedData(fallbackParsedData);
      
      // Pre-fill form with fallback data
      if (fallbackParsedData.title) setValue('title', fallbackParsedData.title);
      if (fallbackParsedData.company) setValue('company', fallbackParsedData.company);
      if (fallbackParsedData.location) setValue('location', fallbackParsedData.location);
      if (fallbackParsedData.contractType) setValue('contractType', fallbackParsedData.contractType as any);
      if (fallbackParsedData.workMode) setValue('workMode', fallbackParsedData.workMode as any);
      if (fallbackParsedData.description) setValue('description', fallbackParsedData.description);
      if (fallbackParsedData.skills) setValue('skills', fallbackParsedData.skills as any);
      if (fallbackParsedData.languages) setValue('languages', fallbackParsedData.languages as any);
      if (fallbackParsedData.priority) setValue('priority', fallbackParsedData.priority as any);
      if (fallbackParsedData.owner) setValue('owner', fallbackParsedData.owner);
      if (fallbackParsedData.department) setValue('department', fallbackParsedData.department as any);
    }



    setIsParsingAI(false);
    setCurrentStep('review');
  };

  // Simple extraction functions (in real implementation, these would use AI)
  const extractTitle = (text: string) => {
    const titlePatterns = [
      /(?:position|role|job):\s*([^\n]+)/i,
      /(?:we are looking for|seeking|hiring)\s+(?:a|an)?\s*([^\n]+)/i,
      /^([^\n]+)(?:\s*-\s*job|position)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractCompany = (text: string) => {
    const companyPatterns = [
      /company:\s*([^\n]+)/i,
      /at\s+([A-Z][a-zA-Z\s&]+)(?:\s+we|,)/,
      /([A-Z][a-zA-Z\s&]+)\s+is\s+(?:looking|seeking|hiring)/
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractLocation = (text: string) => {
    const locationPatterns = [
      /location:\s*([^\n]+)/i,
      /(?:based in|located in|office in)\s+([^\n,]+)/i,
      /(Zurich|Geneva|Basel|Bern|Switzerland)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  const extractContractType = (text: string): 'permanent' | 'contract' | 'freelance' | 'fixed-term' => {
    if (/contract|contractor/i.test(text)) return 'contract';
    if (/freelance|freelancer/i.test(text)) return 'freelance';
    if (/fixed.term|temporary/i.test(text)) return 'fixed-term';
    return 'permanent';
  };

  const extractWorkMode = (text: string): 'on-site' | 'remote' | 'hybrid' => {
    if (/remote/i.test(text)) return 'remote';
    if (/on.site|office/i.test(text)) return 'on-site';
    return 'hybrid';
  };

  const extractSkills = (text: string): string[] => {
    const skillPatterns = [
      /(?:skills|technologies|requirements):\s*([^\n]+)/i,
      /(?:experience with|knowledge of)\s+([^\n]+)/i
    ];
    
    const commonSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS'];
    const foundSkills: string[] = [];
    
    commonSkills.forEach(skill => {
      if (new RegExp(skill, 'i').test(text)) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills.length > 0 ? foundSkills : ['Programming', 'Problem Solving'];
  };

  const extractLanguages = (text: string): string[] => {
    const languages: string[] = [];
    if (/english/i.test(text)) languages.push('English');
    if (/german|deutsch/i.test(text)) languages.push('German');
    if (/french|français/i.test(text)) languages.push('French');
    return languages;
  };

  const extractDepartment = (text: string): string => {
    if (/engineering|development|software/i.test(text)) return 'Technology';
    if (/marketing/i.test(text)) return 'Marketing';
    if (/sales/i.test(text)) return 'Sales';
    if (/design|ux|ui/i.test(text)) return 'Design';
    return 'Technology';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setChatInput(text);
        setJobDescription(text);
        // Auto-process the dropped file
        parseJobDescription(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setChatInput(text);
        setJobDescription(text);
        // Auto-process the uploaded file
        parseJobDescription(text);
      };
      reader.readAsText(file);
    }
  };

  const handleParseJob = () => {
    if (jobDescription.trim()) {
      parseJobDescription(jobDescription);
    }
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll simulate it
        setIsRecording(false);
        setChatInput(prev => prev + ' [Voice input transcribed]');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleChatSubmit = () => {
    if (chatInput.trim()) {
      setJobDescription(chatInput);
      parseJobDescription(chatInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newJob = await response.json();
        setCurrentStep('success');
        // Store job data for success screen
        setCreatedJob(newJob);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('intake');
    setChatInput('');
    setJobDescription('');
    setParsedData(null);
    setIsParsingAI(false);
    setIsRecording(false);
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create a Job</h2>
              <p className="text-gray-600">
                {currentStep === 'intake' && 'Chat with AI to create your job posting'}
                {currentStep === 'parsing' && 'AI is parsing your job description...'}
                {currentStep === 'review' && 'Review and edit the extracted information'}
                {currentStep === 'configure' && 'Configure job settings and publish'}
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
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'intake' ? 'text-primary-600' : currentStep === 'parsing' || currentStep === 'review' || currentStep === 'configure' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'intake' ? 'bg-primary-100 text-primary-600' : currentStep === 'parsing' || currentStep === 'review' || currentStep === 'configure' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {currentStep === 'parsing' || currentStep === 'review' || currentStep === 'configure' ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="font-medium">Smart Intake</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'parsing' ? 'text-primary-600' : currentStep === 'review' || currentStep === 'configure' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'parsing' ? 'bg-primary-100 text-primary-600' : currentStep === 'review' || currentStep === 'configure' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {currentStep === 'review' || currentStep === 'configure' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="font-medium">AI Parse</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'review' ? 'text-primary-600' : currentStep === 'configure' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'review' ? 'bg-primary-100 text-primary-600' : currentStep === 'configure' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {currentStep === 'configure' ? <CheckCircle className="h-4 w-4" /> : '3'}
              </div>
              <span className="font-medium">Review & Edit</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center space-x-2 ${currentStep === 'configure' ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep === 'configure' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                4
              </div>
              <span className="font-medium">Configure & Publish</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Smart Job Intake - Chat Interface */}
          {currentStep === 'intake' && (
            <div className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6 border border-primary-100">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hi! I'm your AI Job Assistant</h3>
                    <p className="text-gray-600 leading-relaxed">
                      I'll help you create a job posting quickly and easily. You can:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center space-x-2">
                        <Type className="h-4 w-4 text-primary-500" />
                        <span>Type or paste your job description</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-primary-500" />
                        <span>Drag & drop files (PDF, DOCX, TXT)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Mic className="h-4 w-4 text-primary-500" />
                        <span>Use voice dictation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chat Input Area */}
              <div className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                    dragActive 
                      ? 'border-primary-400 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {/* Chat Input */}
                  <div className="p-4">
                    <div className="relative">
                      <textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Paste your job description here, or start typing to describe the role you're hiring for..."
                        className="w-full min-h-[120px] max-h-[300px] p-4 pr-20 border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-500 bg-transparent"
                        style={{ fontSize: '16px', lineHeight: '1.5' }}
                      />
                      
                      {/* Input Actions */}
                      <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                        {/* File Upload */}
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt,.doc"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload-chat"
                        />
                        <label
                          htmlFor="file-upload-chat"
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                          title="Upload file"
                        >
                          <Paperclip className="h-5 w-5" />
                        </label>

                        {/* Voice Recording */}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`p-2 rounded-lg transition-colors ${
                            isRecording 
                              ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title={isRecording ? 'Stop recording' : 'Start voice recording'}
                        >
                          {isRecording ? (
                            <MicOff className="h-5 w-5 animate-pulse" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </button>

                        {/* Send Button */}
                        <button
                          onClick={handleChatSubmit}
                          disabled={!chatInput.trim()}
                          className={`p-2 rounded-lg transition-colors ${
                            chatInput.trim()
                              ? 'text-white bg-primary-600 hover:bg-primary-700'
                              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          }`}
                          title="Process job description"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop Overlay */}
                  {dragActive && (
                    <div className="absolute inset-0 bg-primary-50 bg-opacity-90 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                        <p className="text-lg font-semibold text-primary-900">Drop your file here</p>
                        <p className="text-sm text-primary-700">PDF, DOCX, or TXT files supported</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setChatInput("We're looking for a Senior Software Engineer to join our team...")}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    💻 Software Engineer
                  </button>
                  <button
                    onClick={() => setChatInput("We need a Product Manager with 5+ years of experience...")}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    📊 Product Manager
                  </button>
                  <button
                    onClick={() => setChatInput("Looking for a UX Designer to create amazing user experiences...")}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    🎨 UX Designer
                  </button>
                  <button
                    onClick={() => setChatInput("We're hiring a Data Scientist to work with machine learning...")}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    📈 Data Scientist
                  </button>
                </div>

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="flex items-center justify-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">Recording... Click the microphone to stop</span>
                  </div>
                )}

                {/* Help Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> to process, or <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Shift + Enter</kbd> for new line
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: AI Parsing */}
          {currentStep === 'parsing' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-12 w-12 text-primary-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI is parsing your job description...</h3>
                <p className="text-gray-600">This will take just a moment while we extract the key information</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Edit */}
          {currentStep === 'review' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">AI parsing completed! Review and edit the extracted information below.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Briefcase className="h-5 w-5 text-primary-600" />
                    <span>Basic Information</span>
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      {...register('title')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Senior Software Engineer"
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                    <input
                      {...register('company')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Tech Corp"
                    />
                    {errors.company && <p className="text-red-600 text-sm mt-1">{errors.company.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      {...register('location')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Zurich, Switzerland"
                    />
                    {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type *</label>
                    <select
                      {...register('contractType')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                      <option value="fixed-term">Fixed-term</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
                    <select
                      {...register('workMode')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="on-site">On-site</option>
                    </select>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary-600" />
                    <span>Additional Details</span>
                  </h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                    <input
                      {...register('salary')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., CHF 80k - 120k"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      {...register('department')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Department</option>
                      <option value="Technology">Technology</option>
                      <option value="Product">Product</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Data & Analytics">Data & Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      {...register('priority')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Owner *</label>
                    <input
                      {...register('owner')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Sarah Johnson"
                    />
                    {errors.owner && <p className="text-red-600 text-sm mt-1">{errors.owner.message}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                <textarea
                  {...register('description')}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Detailed job description..."
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>}
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {parsedData?.skills?.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add skills (comma separated)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        const currentSkills = watch('skills') || [];
                        setValue('skills', [...currentSkills, value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('intake')}
                >
                  Back to Intake
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue('status', 'draft');
                      handleSubmit(onSubmit)();
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep('configure')}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Continue to Configure
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 4: Configure & Publish */}
          {currentStep === 'configure' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Configure job settings and distribution channels</span>
                </div>
              </div>

              {/* Pipeline Configuration */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary-600" />
                    <span>Pipeline Configuration</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Pipeline Template
                      </label>
                      <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                        <option value="standard">Standard Pipeline (Sourced → Screened → Interview → Offer → Hired)</option>
                        <option value="technical">Technical Pipeline (Applied → Technical Screen → Interview → Final → Offer)</option>
                        <option value="executive">Executive Pipeline (Sourced → Initial → Panel → Reference → Offer)</option>
                        <option value="custom">Custom Pipeline</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recruiter Owner
                        </label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                          <option value="sarah">Sarah Chen</option>
                          <option value="marcus">Marcus Weber</option>
                          <option value="anna">Anna Müller</option>
                          <option value="current">Current User</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Manager
                        </label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                          <option value="">Select Account Manager</option>
                          <option value="john">John Smith</option>
                          <option value="lisa">Lisa Johnson</option>
                          <option value="mike">Mike Davis</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Configuration */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary-600" />
                    <span>Distribution Channels</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Internal Job Board */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Emineon Job Board</span>
                          </div>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                        <p className="text-sm text-gray-600">Internal company job board</p>
                        <p className="text-xs text-green-600 mt-1">Free</p>
                      </div>

                      {/* LinkedIn */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-blue-700 rounded"></div>
                            <span className="font-medium">LinkedIn</span>
                          </div>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <p className="text-sm text-gray-600">Professional network posting</p>
                      </div>

                      {/* Indeed */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-blue-600 rounded"></div>
                            <span className="font-medium">Indeed</span>
                          </div>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <p className="text-sm text-gray-600">Global job search platform</p>
                      </div>

                      {/* Jobup.ch */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 bg-red-600 rounded"></div>
                            <span className="font-medium">Jobup.ch</span>
                          </div>
                          <input type="checkbox" className="rounded" />
                        </div>
                        <p className="text-sm text-gray-600">Swiss job portal</p>
                      </div>
                    </div>

                    {/* Social Media Promotion */}
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">Social Media Promotion</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">LinkedIn Post</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Twitter</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Facebook</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">Instagram</span>
                        </label>
                      </div>
                    </div>

                    {/* Auto-generated LinkedIn Post Preview */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">LinkedIn Post Preview</h5>
                      <div className="bg-white border border-gray-200 rounded p-3 text-sm">
                        <p>🚀 We're hiring a <strong>{watch('title') || 'Software Engineer'}</strong> for {watch('company') || 'our client'} in {watch('location') || 'Zurich'}!</p>
                        <p className="mt-2">✨ {watch('contractType') === 'contract' ? 'Contract opportunity' : 'Permanent position'}</p>
                        <p>📍 {watch('workMode') === 'remote' ? 'Remote work' : watch('workMode') === 'hybrid' ? 'Hybrid work' : 'On-site'}</p>
                        <p className="mt-2">Apply now 👉 [link]</p>
                        <p className="text-gray-500 mt-2">#hiring #jobs #{watch('department')?.toLowerCase().replace(' ', '')}</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="h-4 w-4 mr-1" />
                        Edit Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                >
                  Back to Review
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setValue('status', 'draft');
                      handleSubmit(onSubmit)();
                    }}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setValue('status', 'active');
                      handleSubmit(onSubmit)();
                    }}
                                         className="bg-green-600 hover:bg-green-700 text-white"
                   >
                     <Zap className="h-4 w-4 mr-2" />
                     Publish Job
                   </Button>
                 </div>
               </div>
             </div>
           )}

          {/* Step 5: Success & Next Actions */}
          {currentStep === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Job Created Successfully!</h3>
                <p className="text-gray-600">
                  Your job "{watch('title') || 'New Job'}" has been {watch('status') === 'active' ? 'published and is now live' : 'saved as draft'}
                </p>
              </div>

              {/* Job Summary */}
              <Card className="text-left">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Job Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Title:</span>
                      <p className="font-medium">{watch('title')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Company:</span>
                      <p className="font-medium">{watch('company')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Location:</span>
                      <p className="font-medium">{watch('location')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className={`font-medium ${watch('status') === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {watch('status') === 'active' ? 'Published' : 'Draft'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">What would you like to do next?</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      if (createdJob?.id) {
                        window.location.href = `/jobs/${createdJob.id}`;
                      }
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Job Details
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (createdJob?.id) {
                        window.location.href = `/jobs/${createdJob.id}#candidates`;
                      }
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Candidates
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Copy job link to clipboard
                      navigator.clipboard.writeText(`${window.location.origin}/apply/${createdJob?.publicToken || createdJob?.id}`);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Job Link
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetModal();
                      setCurrentStep('intake');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Another Job
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetModal();
                    onClose();
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
         </div>
       </div>
     </div>
  );
}
