'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  Search, 
  Upload, 
  Link2, 
  User, 
  FileText, 
  Brain, 
  Eye, 
  Download, 
  Share2,
  ChevronRight,
  ChevronLeft,
  Check,
  Paperclip,
  Mic,
  MicOff,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
  Edit3,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface CreateCompetenceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileData: any) => void;
}

interface CandidateData {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  photo?: string;
  skills: string[];
  experience: string;
  education: string;
  summary: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  client?: string;
  preview: string;
  sections: string[];
}

const mockCandidates = [
  {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Frontend Engineer',
    email: 'sarah.johnson@email.com',
    phone: '+41 79 123 4567',
    location: 'Zurich, Switzerland',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    experience: '8 years of experience in frontend development',
    education: 'MSc Computer Science, ETH Zurich',
    summary: 'Experienced frontend engineer with expertise in React and modern web technologies'
  },
  {
    id: '2',
    name: 'David Chen',
    title: 'Backend Engineer',
    email: 'david.chen@email.com',
    phone: '+41 79 234 5678',
    location: 'Basel, Switzerland',
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
    experience: '6 years of backend development experience',
    education: 'BSc Software Engineering, University of Basel',
    summary: 'Backend specialist with strong experience in Python and cloud technologies'
  }
];

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'UBS Tech Template',
    description: 'Professional template for UBS technology roles',
    client: 'UBS Investment Bank',
    preview: 'Clean, corporate design with emphasis on technical skills',
    sections: ['Header', 'Summary', 'Technical Skills', 'Experience', 'Education', 'Certifications']
  },
  {
    id: '2',
    name: 'Credit Suisse Template',
    description: 'Formal template for Credit Suisse positions',
    client: 'Credit Suisse',
    preview: 'Traditional banking format with detailed project history',
    sections: ['Contact Info', 'Profile', 'Key Projects', 'Skills Matrix', 'Education', 'Languages']
  },
  {
    id: '3',
    name: 'Standard CV Template',
    description: 'Generic professional template for all clients',
    preview: 'Versatile design suitable for various industries',
    sections: ['Personal Info', 'Summary', 'Experience', 'Skills', 'Education', 'References']
  },
  {
    id: '4',
    name: 'EU Tech Consulting',
    description: 'Modern template for European tech consulting roles',
    preview: 'Contemporary design with focus on innovation and leadership',
    sections: ['Bio', 'Core Competencies', 'Leadership Experience', 'Technical Expertise', 'Education']
  }
];

export function CreateCompetenceFileModal({ isOpen, onClose, onSuccess }: CreateCompetenceFileModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftedSections, setDraftedSections] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [customizations, setCustomizations] = useState<any>({});
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [clientNotes, setClientNotes] = useState('');

  const filteredCandidates = mockCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    // Simulate CV processing
    setTimeout(() => {
      const mockCandidate: CandidateData = {
        id: 'uploaded',
        name: 'John Doe',
        title: 'Software Engineer',
        email: 'john.doe@email.com',
        phone: '+41 79 345 6789',
        location: 'Geneva, Switzerland',
        skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'],
        experience: '5 years of software development',
        education: 'BSc Computer Science',
        summary: 'Experienced software engineer with backend expertise'
      };
      setSelectedCandidate(mockCandidate);
      setIsProcessing(false);
      setCurrentStep(2);
    }, 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleLinkedInImport = () => {
    if (!linkedinUrl) return;
    setIsProcessing(true);
    // Simulate LinkedIn processing
    setTimeout(() => {
      const mockCandidate: CandidateData = {
        id: 'linkedin',
        name: 'Jane Smith',
        title: 'Product Manager',
        email: 'jane.smith@email.com',
        phone: '+41 79 456 7890',
        location: 'Bern, Switzerland',
        skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Leadership'],
        experience: '7 years in product management',
        education: 'MBA, University of St. Gallen',
        summary: 'Strategic product manager with proven track record in tech companies'
      };
      setSelectedCandidate(mockCandidate);
      setIsProcessing(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setCurrentStep(3);
    // Start AI drafting
    setIsDrafting(true);
    setTimeout(() => {
      setDraftedSections({
        summary: `${selectedCandidate?.name} is a highly skilled ${selectedCandidate?.title} with ${selectedCandidate?.experience}. Known for expertise in ${selectedCandidate?.skills.slice(0, 3).join(', ')}.`,
        skills: selectedCandidate?.skills || [],
        experience: `Professional experience spanning ${selectedCandidate?.experience}. Demonstrated success in delivering complex projects and leading technical initiatives.`,
        education: selectedCandidate?.education || '',
        projects: 'Led multiple high-impact projects including system architecture redesign and team leadership initiatives.'
      });
      setIsDrafting(false);
    }, 3000);
  };

  const handleGenerate = () => {
    const fileData = {
      candidateName: selectedCandidate?.name,
      candidateTitle: selectedCandidate?.title,
      template: selectedTemplate?.name,
      client: selectedTemplate?.client || 'General',
      job: 'Software Engineer Position',
      status: 'Generated',
      isAnonymized,
      sections: draftedSections,
      customizations,
      clientNotes
    };
    onSuccess(fileData);
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedCandidate(null);
    setSelectedTemplate(null);
    setSearchQuery('');
    setLinkedinUrl('');
    setIsProcessing(false);
    setIsDrafting(false);
    setDraftedSections({});
    setCustomizations({});
    setIsAnonymized(false);
    setClientNotes('');
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Competence File</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of 5: {
                currentStep === 1 ? 'Select or Import Candidate' :
                currentStep === 2 ? 'Choose Template' :
                currentStep === 3 ? 'AI Draft & Edit' :
                currentStep === 4 ? 'Review & Customize' :
                'Generate & Export'
              }
            </p>
          </div>
          <Button variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-center space-x-3">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 5 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Step 1: Select or Import Candidate */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select or Import Candidate</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Choose from existing candidates or import new data to create a competence file</p>
                </div>

                {/* Search Existing Candidates */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Search className="h-4 w-4 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Search Existing Candidates</h4>
                    </div>
                    {selectedCandidate && (
                      <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        {selectedCandidate.name} selected
                      </Badge>
                    )}
                  </div>
                  
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, title, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {filteredCandidates.map((candidate) => (
                      <Card key={candidate.id} 
                            className={`cursor-pointer transition-all hover:shadow-md border ${
                              selectedCandidate?.id === candidate.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedCandidate(candidate)}>
                        <CardContent className="p-5">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              selectedCandidate?.id === candidate.id 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-blue-100 text-blue-600'
                            }`}>
                              {selectedCandidate?.id === candidate.id ? (
                                <Check className="h-6 w-6" />
                              ) : (
                                <User className="h-6 w-6" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-gray-900 truncate">{candidate.name}</h5>
                              <p className="text-sm text-gray-600 mb-2 truncate">{candidate.title}</p>
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{candidate.skills.length - 3}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Import Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload CV */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Upload className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Upload CV</h4>
                    </div>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {isDragActive ? 'Drop the CV here...' : 'Drag & drop a CV, or click to select'}
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    </div>
                  </div>

                  {/* LinkedIn URL */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Link2 className="h-4 w-4 text-purple-600" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">Import from LinkedIn</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Paste LinkedIn profile URL..."
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="pl-10 h-11"
                        />
                      </div>
                      <Button 
                        onClick={handleLinkedInImport} 
                        disabled={!linkedinUrl.trim()}
                        className="w-full h-11"
                      >
                        Import Profile
                      </Button>
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="text-center py-8 bg-blue-50 rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="text-sm font-medium text-blue-700">Processing candidate data...</p>
                    <p className="text-xs text-blue-600 mt-1">This may take a few moments</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Choose Template */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Template</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Select a template for <span className="font-medium">{selectedCandidate?.name}</span></p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockTemplates.map((template) => (
                    <Card key={template.id} 
                          className={`cursor-pointer transition-all hover:shadow-lg ${
                            selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedTemplate(template)}>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h5>
                              {template.client && (
                                <Badge variant="outline" className="mb-2">{template.client}</Badge>
                              )}
                            </div>
                            {selectedTemplate?.id === template.id && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                          <p className="text-xs text-gray-500 italic">{template.preview}</p>
                          
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Sections Included:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.sections.slice(0, 4).map((section) => (
                                <Badge key={section} variant="outline" className="text-xs">{section}</Badge>
                              ))}
                              {template.sections.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{template.sections.length - 4} more</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedTemplate && (
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700">
                      ✓ Template selected: <span className="font-medium">{selectedTemplate.name}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1">Click "Start AI Draft" to continue</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: AI Draft & Edit */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Draft & Edit</h3>
                  <p className="text-gray-600 max-w-md mx-auto">AI is analyzing candidate data and generating content sections</p>
                </div>

                {isDrafting ? (
                  <div className="text-center py-12 bg-blue-50 rounded-xl">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500" />
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Generating content...</h4>
                    <p className="text-sm text-gray-600">AI is parsing candidate data and filling template sections</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(draftedSections).map(([section, content]) => (
                      <Card key={section} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900 capitalize">{section}</h5>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                                <Check className="h-3 w-3 mr-1" />
                                AI Generated
                              </Badge>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700">
                            {Array.isArray(content) ? (
                              <div className="flex flex-wrap gap-2">
                                {(content as string[]).map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">{item}</Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="leading-relaxed">{content as string}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review & Customize */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Customize</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Final review and customization before generating the file</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Options</h4>
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="anonymize"
                          checked={isAnonymized}
                          onChange={(e) => setIsAnonymized(e.target.checked)}
                          className="rounded border-gray-300 h-4 w-4"
                        />
                        <label htmlFor="anonymize" className="text-sm font-medium text-gray-700">
                          Anonymize contact information
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-lg font-medium text-gray-900">Notes to Client</label>
                      <textarea
                        value={clientNotes}
                        onChange={(e) => setClientNotes(e.target.value)}
                        placeholder="Add any specific notes or instructions for the client..."
                        className="w-full p-4 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Document Preview</h4>
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">Candidate:</span>
                            <span className="text-gray-900">{isAnonymized ? 'Anonymous Candidate' : selectedCandidate?.name}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">Template:</span>
                            <span className="text-gray-900">{selectedTemplate?.name}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700">Client:</span>
                            <span className="text-gray-900">{selectedTemplate?.client || 'General'}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="font-medium text-gray-700">Sections:</span>
                            <span className="text-gray-900">{Object.keys(draftedSections).length} sections</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Generate & Export */}
            {currentStep === 5 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Download className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate & Export</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Your competence file is ready! Choose how you'd like to export it</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Download className="h-8 w-8 text-blue-500" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Download PDF</h5>
                      <p className="text-sm text-gray-600">Get a formatted PDF file ready for sharing</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Share2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Share Link</h5>
                      <p className="text-sm text-gray-600">Generate a branded share link for clients</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-105">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="h-8 w-8 text-purple-500" />
                      </div>
                      <h5 className="text-lg font-semibold text-gray-900 mb-2">Attach to Job</h5>
                      <p className="text-sm text-gray-600">Link directly to submission pipeline</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="h-10"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button variant="ghost" onClick={handleClose} className="h-10">
              Cancel
            </Button>
            {currentStep < 5 ? (
              <Button 
                onClick={() => {
                  console.log('Button clicked:', { currentStep, selectedCandidate: !!selectedCandidate });
                  if (currentStep === 1 && selectedCandidate) {
                    setCurrentStep(2);
                  } else if (currentStep === 2 && selectedTemplate) {
                    handleTemplateSelect(selectedTemplate);
                  } else if (currentStep === 3 && !isDrafting) {
                    setCurrentStep(4);
                  } else if (currentStep === 4) {
                    setCurrentStep(5);
                  }
                }}
                disabled={
                  (currentStep === 1 && !selectedCandidate) ||
                  (currentStep === 2 && !selectedTemplate) ||
                  (currentStep === 3 && isDrafting)
                }
                className={`h-10 px-6 ${selectedCandidate && currentStep === 1 ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              >
                {currentStep === 1 && selectedCandidate ? 'Continue with Selected Candidate' :
                 currentStep === 2 ? 'Start AI Draft' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleGenerate} className="bg-green-600 hover:bg-green-700 h-10 px-6">
                <Download className="h-4 w-4 mr-2" />
                Generate File
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 