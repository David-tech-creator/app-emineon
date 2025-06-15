'use client';

import { useState, useRef } from 'react';
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
  Users,
  Clock,
  Briefcase,
  Target,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Copy,
  Download,
  Eye,
  ChevronLeft,
  User,
  Code,
  Layout,
  Palette,
  ImageIcon as ImageIcon,
  Trash2,
  PenTool,
  UserPlus,
  Mic,
  MicOff,
  GripVertical,
  Search,
  Brain,
  Shuffle
} from 'lucide-react';
import { competenceFileTemplates, type CompetenceFileTemplate } from '@/data/competence-file-templates';
import { stylePresets, type StyleConfig } from '@/data/job-templates';
import StyleCustomizer from '@/components/jobs/StyleCustomizer';

// Form validation schema
const competenceFileSchema = z.object({
  candidateName: z.string().min(1, 'Candidate name is required'),
  candidateTitle: z.string().min(1, 'Current title is required'),
  candidateEmail: z.string().email().optional().or(z.literal('')),
  candidatePhone: z.string().optional(),
  candidateLocation: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  outputFormat: z.enum(['pdf', 'docx']),
});

type CompetenceFileFormData = z.infer<typeof competenceFileSchema>;

interface CreateCompetenceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileData: any) => void;
  preselectedCandidate?: any;
}

type Step = 'template' | 'intake' | 'analysis' | 'review' | 'download';

interface Section {
  key: string;
  label: string;
  show: boolean;
  order: number;
}

export function CreateCompetenceFileModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedCandidate
}: CreateCompetenceFileModalProps) {
  // State management
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [candidateInput, setCandidateInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(preselectedCandidate || null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFileUrl, setGeneratedFileUrl] = useState('');
  const [customStyleConfig, setCustomStyleConfig] = useState<StyleConfig>(stylePresets.modern);
  const [showStyleCustomizer, setShowStyleCustomizer] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    { key: 'summary', label: 'Professional Summary', show: true, order: 1 },
    { key: 'experience', label: 'Work Experience', show: true, order: 2 },
    { key: 'education', label: 'Education', show: true, order: 3 },
    { key: 'skills', label: 'Skills & Competencies', show: true, order: 4 },
    { key: 'certifications', label: 'Certifications', show: true, order: 5 },
    { key: 'languages', label: 'Languages', show: true, order: 6 },
  ]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CompetenceFileFormData>({
    resolver: zodResolver(competenceFileSchema),
    defaultValues: {
      candidateName: '',
      candidateTitle: '',
      candidateEmail: '',
      candidatePhone: '',
      candidateLocation: '',
      yearsOfExperience: 0,
      summary: '',
      skills: [],
      outputFormat: 'pdf',
    }
  });

  // Event handlers
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    if (template.styleConfig) {
      setCustomStyleConfig(template.styleConfig);
    }
  };

  const handleTemplateConfirm = () => {
    if (selectedTemplate) {
      setCurrentStep('intake');
    }
  };

  const handleCandidateInputChange = (value: string) => {
    setCandidateInput(value);
    // TODO: Implement candidate search
  };

  const handleCandidateSelect = (candidate: any) => {
    setSelectedCandidate(candidate);
    // Pre-fill form with candidate data
    setValue('candidateName', candidate.fullName || '');
    setValue('candidateTitle', candidate.currentTitle || '');
    setValue('candidateEmail', candidate.email || '');
    setValue('candidatePhone', candidate.phone || '');
    setValue('candidateLocation', candidate.location || '');
    setValue('yearsOfExperience', candidate.yearsOfExperience || 0);
    setValue('summary', candidate.summary || '');
    setValue('skills', candidate.skills || []);
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    // TODO: Implement file parsing
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // TODO: Implement voice recording logic
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // TODO: Process recorded audio
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // TODO: Implement AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate analysis
      setCurrentStep('review');
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStyleChange = (newStyle: StyleConfig) => {
    setCustomStyleConfig(newStyle);
  };

  const handlePresetChange = (presetName: string) => {
    const preset = stylePresets[presetName as keyof typeof stylePresets];
    if (preset) {
      setCustomStyleConfig(preset);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true);
    try {
      // TODO: Implement logo upload to cloud storage
      const mockUrl = URL.createObjectURL(file);
      setLogoUrl(mockUrl);
      setCustomStyleConfig(prev => ({ ...prev, logoUrl: mockUrl }));
    } catch (error) {
      console.error('Logo upload error:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const toggleSection = (key: string) => {
    setSections(prev => prev.map(section => 
      section.key === key ? { ...section, show: !section.show } : section
    ));
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const newSections = [...prev];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      return newSections.map((section, index) => ({ ...section, order: index + 1 }));
    });
  };

  const onSubmit = async (data: CompetenceFileFormData) => {
    setIsGenerating(true);
    try {
      // TODO: Implement competence file generation
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate generation
      const mockUrl = 'https://example.com/competence-file.pdf';
      setGeneratedFileUrl(mockUrl);
      setCurrentStep('download');
      onSuccess({ url: mockUrl, ...data });
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetModal = () => {
    setCurrentStep('template');
    setSelectedTemplate(null);
    setCandidateInput('');
    setSelectedCandidate(null);
    setUploadedFile(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setIsGenerating(false);
    setGeneratedFileUrl('');
    setCustomStyleConfig(stylePresets.modern);
    setShowStyleCustomizer(false);
    setLogoUrl('');
    setLogoFile(null);
    reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Competence File</h2>
              <p className="text-gray-600">Generate professional competence files with AI assistance</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { key: 'template', label: 'Template Selection', icon: Building2 },
              { key: 'intake', label: 'Smart Intake', icon: UserPlus },
              { key: 'analysis', label: 'Smart Analysis', icon: Brain },
              { key: 'review', label: 'Review & Edit', icon: PenTool },
              { key: 'download', label: 'Preview & Download', icon: Download }
            ].map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = ['template', 'intake', 'analysis', 'review', 'download'].indexOf(currentStep) > index;
              const StepIcon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-100 text-blue-600' : 
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                  </div>
                  {index < 4 && (
                    <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Template Selection */}
          {currentStep === 'template' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Select a professional template that best represents your candidate's profile and industry.
                </p>
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {competenceFileTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedTemplate?.id === template.id
                        ? 'ring-2 ring-blue-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Template Preview */}
                        <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto">
                              <FileText className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="h-2 bg-gray-300 rounded w-16 mx-auto"></div>
                              <div className="h-1 bg-gray-200 rounded w-12 mx-auto"></div>
                              <div className="h-1 bg-gray-200 rounded w-14 mx-auto"></div>
                            </div>
                          </div>
                        </div>

                        {/* Template Info */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                          
                          {/* Template Features */}
                          <div className="flex flex-wrap gap-1">
                            {template.features?.slice(0, 3).map((feature, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Color Preview */}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Colors:</span>
                            <div className="flex space-x-1">
                              {template.colors?.slice(0, 4).map((color, index) => (
                                <div
                                  key={index}
                                  className="w-4 h-4 rounded-full border border-gray-200"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Selection Indicator */}
                        {selectedTemplate?.id === template.id && (
                          <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-600">Selected</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button variant="outline" onClick={handleClose} className="px-6">
                  Cancel
                </Button>
                <Button
                  onClick={handleTemplateConfirm}
                  disabled={!selectedTemplate}
                  className="px-6"
                >
                  Continue with Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Smart Intake */}
          {currentStep === 'intake' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Candidate Intake</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Hi there! I'll help you create a competence file quickly and easily. You can select a candidate from the database, paste CV content, upload files, or use voice dictation for the best user experience.
                </p>
              </div>

              {/* Input Options */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Search & Select */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Search className="h-5 w-5 mr-2 text-blue-600" />
                      Search Existing Candidates
                    </h4>
                    <div className="space-y-4">
                      <Input
                        placeholder="Search by name, email, or skills..."
                        value={candidateInput}
                        onChange={(e) => handleCandidateInputChange(e.target.value)}
                        className="w-full"
                      />
                      {/* Mock candidate results */}
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {['John Doe - Software Engineer', 'Jane Smith - UX Designer', 'Mike Johnson - DevOps Engineer'].map((candidate, index) => (
                          <div
                            key={index}
                            className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                            onClick={() => handleCandidateSelect({ fullName: candidate.split(' - ')[0], currentTitle: candidate.split(' - ')[1] })}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{candidate.split(' - ')[0]}</p>
                                <p className="text-sm text-gray-600">{candidate.split(' - ')[1]}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column - Manual Input */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <PenTool className="h-5 w-5 mr-2 text-green-600" />
                      Manual Input
                    </h4>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Paste candidate CV or description here..."
                        className="min-h-[120px] resize-none"
                        value={candidateInput}
                        onChange={(e) => setCandidateInput(e.target.value)}
                      />
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={isRecording ? stopRecording : startRecording}
                          className="flex-1"
                        >
                          {isRecording ? (
                            <>
                              <MicOff className="h-4 w-4 mr-2" />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Voice Dictation
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* File Upload */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-purple-600" />
                    Upload Documents
                  </h4>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onDragOver={handleDrag}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">Drop files here or click to upload</p>
                        <p className="text-gray-600">Supports PDF, DOC, DOCX, TXT files</p>
                      </div>
                      {uploadedFile && (
                        <div className="flex items-center justify-center space-x-2 p-2 bg-green-50 border border-green-200 rounded">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800">{uploadedFile.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('template')}
                  className="px-6"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Templates
                </Button>
                <Button
                  onClick={() => setCurrentStep('analysis')}
                  disabled={!candidateInput && !selectedCandidate && !uploadedFile}
                  className="px-6"
                >
                  Continue to Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Smart Analysis */}
          {currentStep === 'analysis' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Smart Analysis</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our AI will analyze the candidate information and extract key competencies, skills, and experience to create a comprehensive profile.
                </p>
              </div>

              {isAnalyzing ? (
                <div className="space-y-6">
                  {/* Analysis Progress */}
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto">
                          <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">Analyzing Candidate Profile</h4>
                          <p className="text-gray-600">Please wait while we process the information...</p>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="max-w-md mx-auto space-y-3 mt-6">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-gray-700">Extracting personal information</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                            <span className="text-sm text-gray-700">Analyzing skills and competencies</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Processing work experience</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Generating professional summary</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Analysis Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
                          AI-Powered Analysis
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Let our AI analyze the candidate information and automatically extract skills, experience, and competencies.
                        </p>
                        <Button onClick={handleAnalyze} className="w-full">
                          <Brain className="mr-2 h-4 w-4" />
                          Start AI Analysis
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Shuffle className="h-5 w-5 mr-2 text-blue-600" />
                          Manual Configuration
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Skip AI analysis and manually configure the candidate profile with your own information.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep('review')}
                          className="w-full"
                        >
                          <PenTool className="mr-2 h-4 w-4" />
                          Manual Setup
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Information */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Source:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedCandidate ? 'Database Candidate' : uploadedFile ? 'Uploaded File' : 'Manual Input'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Template:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedTemplate?.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Content Length:</span>
                          <span className="ml-2 font-medium text-gray-900">{candidateInput.length} characters</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className="ml-2 font-medium text-green-600">Ready for Analysis</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('intake')}
                  disabled={isAnalyzing}
                  className="px-6"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Intake
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                  disabled={isAnalyzing}
                  className="px-6"
                >
                  Skip to Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Edit */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PenTool className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Review & Edit</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Review the extracted information and make any necessary edits. Configure sections and customize the styling for your competence file.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <User className="h-5 w-5 mr-2 text-blue-600" />
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <Input
                              {...register('candidateName')}
                              placeholder="Enter candidate name"
                              className={errors.candidateName ? 'border-red-500' : ''}
                            />
                            {errors.candidateName && (
                              <p className="text-red-500 text-xs mt-1">{errors.candidateName.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Title *
                            </label>
                            <Input
                              {...register('candidateTitle')}
                              placeholder="Enter current title"
                              className={errors.candidateTitle ? 'border-red-500' : ''}
                            />
                            {errors.candidateTitle && (
                              <p className="text-red-500 text-xs mt-1">{errors.candidateTitle.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <Input
                              {...register('candidateEmail')}
                              type="email"
                              placeholder="Enter email address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone
                            </label>
                            <Input
                              {...register('candidatePhone')}
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <Input
                              {...register('candidateLocation')}
                              placeholder="Enter location"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Years of Experience
                            </label>
                            <Input
                              {...register('yearsOfExperience', { valueAsNumber: true })}
                              type="number"
                              min="0"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Professional Summary */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-600" />
                          Professional Summary
                        </h4>
                        <Textarea
                          {...register('summary')}
                          placeholder="Enter professional summary..."
                          className={`min-h-[100px] ${errors.summary ? 'border-red-500' : ''}`}
                        />
                        {errors.summary && (
                          <p className="text-red-500 text-xs mt-1">{errors.summary.message}</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Code className="h-5 w-5 mr-2 text-purple-600" />
                          Skills
                        </h4>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {watch('skills')?.map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentSkills = watch('skills') || [];
                                    setValue('skills', currentSkills.filter((_, i) => i !== index));
                                  }}
                                  className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Add a skill..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.target as HTMLInputElement;
                                  const skill = input.value.trim();
                                  if (skill) {
                                    const currentSkills = watch('skills') || [];
                                    setValue('skills', [...currentSkills, skill]);
                                    input.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                const skill = input.value.trim();
                                if (skill) {
                                  const currentSkills = watch('skills') || [];
                                  setValue('skills', [...currentSkills, skill]);
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column - Configuration */}
                  <div className="space-y-6">
                    {/* Section Configuration */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Layout className="h-5 w-5 mr-2 text-indigo-600" />
                          Section Configuration
                        </h4>
                        <div className="space-y-3">
                          {sections.map((section) => (
                            <div
                              key={section.key}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={section.show}
                                    onChange={() => toggleSection(section.key)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className={`text-sm ${section.show ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {section.label}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">#{section.order}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Style Customization */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Palette className="h-5 w-5 mr-2 text-pink-600" />
                            Style Customization
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowStyleCustomizer(!showStyleCustomizer)}
                          >
                            {showStyleCustomizer ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Customize
                              </>
                            )}
                          </Button>
                        </div>

                        {!showStyleCustomizer && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Template:</span>
                              <span className="font-medium text-gray-900">{selectedTemplate?.name || 'Default'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Primary Color:</span>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-4 h-4 rounded border border-gray-300"
                                  style={{ backgroundColor: customStyleConfig.primaryColor }}
                                />
                                <span className="font-medium text-gray-900">{customStyleConfig.primaryColor}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Font:</span>
                              <span className="font-medium text-gray-900">{customStyleConfig.titleFont}</span>
                            </div>
                          </div>
                        )}

                        {showStyleCustomizer && (
                          <div className="mt-4">
                            <StyleCustomizer
                              styleConfig={customStyleConfig}
                              onStyleChange={handleStyleChange}
                              onPresetChange={handlePresetChange}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Logo Upload */}
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <ImageIcon className="h-5 w-5 mr-2 text-yellow-600" />
                          Company Logo
                        </h4>
                        <div className="space-y-3">
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setLogoFile(file);
                                handleLogoUpload(file);
                              }
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => logoFileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="w-full"
                          >
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                          {logoUrl && (
                            <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                              <div className="flex items-center space-x-2">
                                <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                                <span className="text-sm text-green-800">Logo uploaded</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoUrl('');
                                  setLogoFile(null);
                                  setCustomStyleConfig(prev => ({ ...prev, logoUrl: '' }));
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('analysis')}
                    className="px-6"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Analysis
                  </Button>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('download')}
                      className="px-6"
                    >
                      Skip to Download
                    </Button>
                    <Button
                      type="submit"
                      className="px-6"
                    >
                      Generate Competence File
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Step 5: Preview & Download */}
          {currentStep === 'download' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {isGenerating ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Download className="h-8 w-8 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Preview & Download</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {isGenerating 
                    ? 'Generating your competence file...'
                    : generatedFileUrl 
                      ? 'Your competence file is ready for download!'
                      : 'Preview your competence file and download when ready.'
                  }
                </p>
              </div>

              {isGenerating ? (
                <div className="space-y-6">
                  {/* Generation Progress */}
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">Generating Competence File</h4>
                          <p className="text-gray-600">This may take a few moments...</p>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="max-w-md mx-auto space-y-3 mt-6">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-gray-700">Processing candidate data</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                            <span className="text-sm text-gray-700">Applying custom styling</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Generating PDF document</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="text-sm text-gray-500">Finalizing download</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : generatedFileUrl ? (
                <div className="space-y-6">
                  {/* Success State */}
                  <Card>
                    <CardContent className="p-8">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-lg font-semibold text-gray-900">Competence File Generated!</h4>
                          <p className="text-gray-600">Your professional competence file is ready for download.</p>
                        </div>
                        
                        {/* Download Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                          <Button
                            onClick={() => window.open(generatedFileUrl, '_blank')}
                            className="px-6"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(generatedFileUrl)}
                            className="px-6"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => window.open(generatedFileUrl, '_blank')}
                            className="px-6"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* File Details */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">File Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Candidate:</span>
                          <span className="ml-2 font-medium text-gray-900">{watch('candidateName')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Template:</span>
                          <span className="ml-2 font-medium text-gray-900">{selectedTemplate?.name || 'Default'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Format:</span>
                          <span className="ml-2 font-medium text-gray-900 uppercase">{watch('outputFormat')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Generated:</span>
                          <span className="ml-2 font-medium text-gray-900">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">Ready to Generate</h4>
                  <p className="text-gray-600 mb-6">
                    Click the button below to generate your competence file.
                  </p>
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    className="px-8"
                  >
                    Generate Competence File
                    <Zap className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('review')}
                  disabled={isGenerating}
                  className="px-6"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Review
                </Button>
                <div className="flex space-x-3">
                  {generatedFileUrl && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetModal();
                        setCurrentStep('template');
                      }}
                      className="px-6"
                    >
                      Create Another
                    </Button>
                  )}
                  <Button
                    onClick={handleClose}
                    variant={generatedFileUrl ? "primary" : "outline"}
                    className="px-6"
                  >
                    {generatedFileUrl ? 'Done' : 'Cancel'}
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