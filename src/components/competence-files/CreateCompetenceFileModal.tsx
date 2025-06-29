'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
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
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  Edit3,
  Loader2,
  Users,
  Palette,
  Settings,
  Image,
  CheckCircle,
  FileDown,
  GripVertical,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDropzone } from 'react-dropzone';
import { useCompetenceFileStore, type CandidateData } from '@/stores/competence-file-store';
import { predefinedTemplates, fontOptions, colorPresets } from '@/data/templates';

interface CreateCompetenceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileData: any) => void;
  preselectedCandidate?: CandidateData | null;
}

// Mock candidates for demo
const mockCandidates: CandidateData[] = [
  {
    id: '1',
    fullName: 'Sarah Johnson',
    currentTitle: 'Senior Frontend Engineer',
    email: 'sarah.johnson@email.com',
    phone: '+41 79 123 4567',
    location: 'Zurich, Switzerland',
    yearsOfExperience: 8,
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
    certifications: ['AWS Certified Developer', 'React Professional'],
    experience: [
      {
        company: 'Tech Corp',
        title: 'Senior Frontend Engineer',
        startDate: '2021-01',
        endDate: 'Present',
        responsibilities: 'Led frontend development team, implemented modern React architecture'
      }
    ],
    education: ['MSc Computer Science, ETH Zurich'],
    languages: ['English (Native)', 'German (Professional)', 'French (Basic)'],
    summary: 'Experienced frontend engineer with expertise in React and modern web technologies'
  },
  {
    id: '2',
    fullName: 'David Chen',
    currentTitle: 'Backend Engineer',
    email: 'david.chen@email.com',
    phone: '+41 79 234 5678',
    location: 'Basel, Switzerland',
    yearsOfExperience: 6,
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes'],
    certifications: ['Google Cloud Professional', 'Python Institute Certified'],
    experience: [
      {
        company: 'Data Solutions AG',
        title: 'Backend Engineer',
        startDate: '2020-03',
        endDate: 'Present',
        responsibilities: 'Designed scalable backend systems, optimized database performance'
      }
    ],
    education: ['BSc Software Engineering, University of Basel'],
    languages: ['English (Professional)', 'German (Native)', 'Mandarin (Native)'],
    summary: 'Backend specialist with strong experience in Python and cloud technologies'
  }
];

// Sortable Section Item Component
interface SortableSectionItemProps {
  section: {
    key: string;
    label: string;
    show: boolean;
    order: number;
  };
  isEditing: boolean;
  editingLabel: string;
  onToggle: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onLabelChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function SortableSectionItem({
  section,
  isEditing,
  editingLabel,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onLabelChange,
  onRemove,
  canRemove
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
        isDragging 
          ? 'shadow-xl border-blue-300 bg-blue-50 scale-105' 
          : 'hover:shadow-md hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div 
            className="cursor-move text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
            {...attributes}
            {...listeners}
            title="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggle}
              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                section.show 
                  ? 'bg-primary-600 border-primary-600 text-white' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {section.show && <Check className="h-3 w-3" />}
            </button>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editingLabel}
                    onChange={(e) => onLabelChange(e.target.value)}
                    className="text-sm"
                    placeholder="Section name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveEdit();
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={!editingLabel.trim()}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h4 className={`font-medium ${
                    section.show ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {section.label}
                  </h4>
                  <button
                    onClick={onStartEdit}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    title="Edit section name"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500">
                Order: {section.order}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant={section.show ? 'default' : 'outline'}
            className={section.show ? 'bg-primary-600 text-white hover:bg-primary-700' : 'text-gray-600 border-gray-300'}
          >
            {section.show ? 'Included' : 'Hidden'}
          </Badge>
          
          {canRemove && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreateCompetenceFileModal({ isOpen, onClose, onSuccess, preselectedCandidate }: CreateCompetenceFileModalProps) {
  const store = useCompetenceFileStore();
  
  // Local state for section management
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [newSectionLabel, setNewSectionLabel] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // File input ref for logo upload
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle preselected candidate
  useEffect(() => {
    if (preselectedCandidate && isOpen) {
      store.setCandidateData(preselectedCandidate);
      store.nextStep(); // Skip to next step since we have candidate data
    }
  }, [preselectedCandidate, isOpen, store]);

  // Predefined section suggestions
  const sectionSuggestions = [
    'Projects',
    'Awards & Honors',
    'Publications',
    'Volunteer Experience',
    'Professional Memberships',
    'References',
    'Portfolio',
    'Achievements',
    'Research',
    'Patents',
    'Speaking Engagements',
    'Additional Information'
  ];

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Section management handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = store.sections.findIndex((section) => section.key === active.id);
      const newIndex = store.sections.findIndex((section) => section.key === over?.id);

      store.reorderSections(oldIndex, newIndex);
    }
  };

  const handleStartEdit = (sectionKey: string, currentLabel: string) => {
    setEditingSectionKey(sectionKey);
    setEditingLabel(currentLabel);
  };

  const handleSaveEdit = () => {
    if (editingSectionKey && editingLabel.trim()) {
      store.updateSectionLabel(editingSectionKey, editingLabel.trim());
      setEditingSectionKey(null);
      setEditingLabel('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSectionKey(null);
    setEditingLabel('');
  };

  const handleAddSection = () => {
    if (newSectionLabel.trim()) {
      store.addCustomSection(newSectionLabel.trim());
      setNewSectionLabel('');
      setShowAddSection(false);
    }
  };

  const handleRemoveSection = (sectionKey: string) => {
    store.removeSection(sectionKey);
  };

  const canRemoveSection = (sectionKey: string) => {
    return sectionKey.startsWith('custom_');
  };

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    store.setUploadedFile(file);
    store.setProcessingCandidate(true);

    try {
      console.log('📄 Processing uploaded file:', file.name);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call the new parse-resume API endpoint
      const response = await fetch('/api/competence-files/parse-resume', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to process resume');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to parse resume');
      }

      console.log('✅ Resume parsed successfully:', result.data);
      
      // Set the parsed candidate data
      store.setCandidateData(result.data);
      store.setProcessingCandidate(false);
      store.nextStep();
      
    } catch (error) {
      console.error('💥 CV processing error:', error);
      store.setProcessingCandidate(false);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to process resume: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    }
  }, [store]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleLinkedInImport = async () => {
    if (!store.linkedinText) return;
    
    store.setProcessingCandidate(true);
    
    try {
      console.log('🔗 Processing LinkedIn text...');
      
      // Call the new parse-linkedin API endpoint
      const response = await fetch('/api/competence-files/parse-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinText: store.linkedinText
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to process LinkedIn profile');
      }

      if (!result.success) {
        throw new Error(result.message || 'Failed to parse LinkedIn profile');
      }

      console.log('✅ LinkedIn profile parsed successfully:', result.data);
      
      // Set the parsed candidate data
      store.setCandidateData(result.data);
      store.setProcessingCandidate(false);
      store.nextStep();
      
    } catch (error) {
      console.error('💥 LinkedIn parsing error:', error);
      store.setProcessingCandidate(false);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to process LinkedIn profile: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
    }
  };

  const handleGenerate = async () => {
    if (!store.candidateData || !store.selectedTemplate) return;
    
    store.setGenerating(true);
    
    try {
      console.log('🚀 Starting generation with test endpoint...');
      
      // Use the test endpoint for simplified generation
      const response = await fetch('/api/competence-files/test-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateData: store.candidateData,
          format: store.outputFormat
        }),
      });

      console.log('📡 Response status:', response.status);
      const responseText = await response.text();
      console.log('📡 Response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        console.error('❌ API error:', result);
        throw new Error(result.error || `API error: ${response.status}`);
      }

      if (!result.success) {
        console.error('❌ Generation failed:', result);
        throw new Error(result.error || 'Generation failed');
      }

      console.log('✅ Generation successful:', result);

      // Set the file URL and show success
      store.setGeneratedFileUrl(result.data.fileUrl);
      store.setGenerating(false);
      
      // Call success callback
      onSuccess({
        candidateId: store.candidateData?.id,
        candidateName: store.candidateData?.fullName || 'Unknown Candidate',
        candidateTitle: store.candidateData?.currentTitle || 'Unknown Title',
        templateId: store.templateId,
        templateName: store.selectedTemplate?.name || 'Unknown Template',
        client: 'Unknown Client', // TODO: Add client selection to the modal
        job: 'Unknown Job', // TODO: Add job selection to the modal
        fileName: result.data.fileName,
        format: result.data.format,
        fileUrl: result.data.fileUrl,
        fileSize: result.data.fileSize
      });

      // Show success message if there's a warning
      if (result.warning) {
        console.warn('⚠️ Generation warning:', result.warning);
      }

    } catch (error) {
      console.error('💥 Generation error:', error);
      store.setGenerating(false);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to generate competence file: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  const handleClose = () => {
    store.resetWizard();
    onClose();
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PNG, JPG, SVG, or WebP image');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    setIsUploadingLogo(true);

    try {
      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = () => {
        const logoUrl = reader.result as string;
        store.updateStyleCustomization({ logoUrl });
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Logo upload error:', error);
      setIsUploadingLogo(false);
      alert('Failed to upload logo');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Competence File</h2>
              <p className="text-gray-600">
                {store.currentStep === 1 && 'Select or import candidate data'}
                {store.currentStep === 2 && 'Choose a professional template'}
                {store.currentStep === 3 && 'Customize styling and branding'}
                {store.currentStep === 4 && 'Configure document sections'}
                {store.currentStep === 5 && 'Generate and download file'}
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
            {[
              { step: 1, label: 'Candidate', icon: User },
              { step: 2, label: 'Template', icon: FileText },
              { step: 3, label: 'Style', icon: Palette },
              { step: 4, label: 'Sections', icon: Settings },
              { step: 5, label: 'Generate', icon: Download }
            ].map((item, index) => {
              const IconComponent = item.icon;
              const isActive = store.currentStep === item.step;
              const isCompleted = store.currentStep > item.step;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? 'text-primary-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive ? 'bg-primary-100 text-primary-600' : 
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : item.step}
                    </div>
                    <span className="font-medium hidden sm:block">{item.label}</span>
                  </div>
                  {index < 4 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* Step 1: Candidate Selection */}
          {store.currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Select candidate or import CV/LinkedIn data</span>
                </div>
              </div>

              {/* Source Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    store.candidateSource === 'db' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => store.setCandidateSource('db')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select from Database</h3>
                    <p className="text-sm text-gray-600">Choose an existing candidate from your database</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    store.candidateSource === 'upload' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => store.setCandidateSource('upload')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CV</h3>
                    <p className="text-sm text-gray-600">Upload PDF or Word document for AI parsing</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    store.candidateSource === 'linkedin' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => store.setCandidateSource('linkedin')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Link2 className="h-8 w-8 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">LinkedIn Import</h3>
                    <p className="text-sm text-gray-600">Paste LinkedIn profile or URL for parsing</p>
                  </CardContent>
                </Card>
              </div>

              {/* Database Selection */}
              {store.candidateSource === 'db' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search candidates by name, title, or skills..."
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockCandidates.map((candidate) => (
                      <Card 
                        key={candidate.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          store.candidateData?.id === candidate.id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                        }`}
                        onClick={() => store.setCandidateData(candidate)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{candidate.fullName}</h4>
                              <p className="text-sm text-gray-600">{candidate.currentTitle}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {candidate.skills.slice(0, 3).map(skill => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.skills.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* File Upload */}
              {store.candidateSource === 'upload' && (
                <div className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragActive 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          {isDragActive ? 'Drop CV here' : 'Upload CV'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Drag & drop or click to select PDF, DOC, or DOCX files
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {store.isProcessingCandidate && (
                    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-3" />
                      <span className="text-blue-800">Processing CV with AI...</span>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Import */}
              {store.candidateSource === 'linkedin' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile Text or URL
                    </label>
                    <textarea
                      rows={6}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Paste the LinkedIn profile text or URL here..."
                      value={store.linkedinText || ''}
                      onChange={(e) => store.setLinkedInText(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleLinkedInImport}
                    disabled={!store.linkedinText || store.isProcessingCandidate}
                    className="w-full"
                  >
                    {store.isProcessingCandidate ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Parse with AI
                      </>
                    )}
                  </Button>
                </div>
              )}
                         </div>
           )}

          {/* Step 2: Template Selection */}
          {store.currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Choose a professional template for {store.candidateData?.fullName}</span>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates by name, category, or client..."
                    value={store.templateSearch || ''}
                    onChange={(e) => store.setTemplateSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => store.setTemplateCategory('')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      !store.templateCategory 
                        ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {Array.from(new Set(predefinedTemplates.map(t => t.category))).map((category) => (
                    <button
                      key={category}
                      onClick={() => store.setTemplateCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        store.templateCategory === category 
                          ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predefinedTemplates.slice(0, 6).map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      store.selectedTemplate?.id === template.id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => store.setSelectedTemplate(template)}
                  >
                    <CardContent className="p-6">
                      {/* Template Preview */}
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Template Preview</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                          <div 
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: template.colorHex }}
                          />
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <span className="text-xs text-gray-500 font-medium">{template.font}</span>
                        </div>
                        
                        {template.client && (
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600 truncate">{template.client}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {store.selectedTemplate && (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700">
                    Template selected: <span className="font-medium">{store.selectedTemplate.name}</span>
                  </p>
                </div>
              )}
                         </div>
           )}

          {/* Step 3: Styling & Branding */}
          {store.currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Palette className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-blue-800 font-medium mb-1">Customize Styling & Branding</h3>
                    <p className="text-blue-700 text-sm">
                      Design your document with professional styling options and branding elements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Style Controls */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Palette className="h-5 w-5 mr-2 text-primary-600" />
                      Typography & Colors
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                        <select
                          value={store.styleCustomization.font}
                          onChange={(e) => store.updateStyleCustomization({ font: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        >
                          {fontOptions.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <select
                            value={store.styleCustomization.fontSize || '11pt'}
                            onChange={(e) => store.updateStyleCustomization({ fontSize: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                          >
                            <option value="9pt">9pt</option>
                            <option value="10pt">10pt</option>
                            <option value="11pt">11pt (Default)</option>
                            <option value="12pt">12pt</option>
                            <option value="14pt">14pt</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Line Spacing</label>
                          <select
                            value={store.styleCustomization.lineSpacing || '1.2'}
                            onChange={(e) => store.updateStyleCustomization({ lineSpacing: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                          >
                            <option value="1.0">Single</option>
                            <option value="1.15">1.15</option>
                            <option value="1.2">1.2 (Default)</option>
                            <option value="1.5">1.5</option>
                            <option value="2.0">Double</option>
                          </select>
                        </div>
                      </div>

                      {/* Color Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Brand Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorPresets.map((preset) => (
                            <button
                              key={preset.value}
                              onClick={() => store.updateStyleCustomization({ colorHex: preset.value })}
                              className={`w-full h-8 rounded border-2 transition-all ${
                                store.styleCustomization.colorHex === preset.value
                                  ? 'border-gray-900 scale-105'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: preset.color }}
                              title={preset.label}
                            />
                          ))}
                        </div>
                        
                        <div className="mt-2">
                          <Input
                            type="text"
                            placeholder="#1e40af"
                            value={store.styleCustomization.colorHex}
                            onChange={(e) => store.updateStyleCustomization({ colorHex: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                          {store.styleCustomization.logoUrl ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <img 
                                  src={store.styleCustomization.logoUrl} 
                                  alt="Company logo" 
                                  className="w-12 h-12 object-contain rounded border"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                                  <p className="text-xs text-gray-500">Click to change</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => store.updateStyleCustomization({ logoUrl: '' })}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">Upload company logo</p>
                              <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
                            </div>
                          )}
                          
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          
                          <Button
                            onClick={() => logoFileInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                            disabled={isUploadingLogo}
                            className="w-full mt-3"
                          >
                            {isUploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {store.styleCustomization.logoUrl ? 'Change Logo' : 'Upload Logo'}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Footer Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                        <Input
                          placeholder="© 2024 Your Company Name - Confidential"
                          value={store.styleCustomization.footerText || ''}
                          onChange={(e) => store.updateStyleCustomization({ footerText: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Live Preview</h4>
                  <Card>
                    <CardContent className="p-6">
                      <div 
                        className="w-full h-80 bg-white border-2 border-gray-200 rounded-lg p-4 overflow-hidden relative"
                        style={{ 
                          fontFamily: store.styleCustomization.font,
                          fontSize: store.styleCustomization.fontSize || '11pt',
                          lineHeight: store.styleCustomization.lineSpacing || '1.2'
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div 
                              className="h-2 w-full mb-2"
                              style={{ backgroundColor: store.styleCustomization.colorHex }}
                            />
                            <h1 
                              className="text-lg font-bold mb-1"
                              style={{ color: store.styleCustomization.colorHex }}
                            >
                              COMPETENCE FILE
                            </h1>
                            <p className="text-xs text-gray-600">Professional Skills Assessment</p>
                          </div>
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center ml-4">
                            {store.styleCustomization.logoUrl ? (
                              <img 
                                src={store.styleCustomization.logoUrl} 
                                alt="Company logo" 
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <Image className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Sample Content */}
                        <div className="space-y-3">
                          <div>
                            <h2 
                              className="text-sm font-semibold mb-1 pb-1 border-b"
                              style={{ color: store.styleCustomization.colorHex, borderColor: store.styleCustomization.colorHex }}
                            >
                              {store.candidateData?.fullName || 'Candidate Name'}
                            </h2>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p><strong>Position:</strong> {store.candidateData?.currentTitle || 'Job Title'}</p>
                              <p><strong>Experience:</strong> {store.candidateData?.yearsOfExperience || 'X'} years</p>
                            </div>
                          </div>

                          <div>
                            <h3 
                              className="text-xs font-semibold mb-1 pb-1 border-b"
                              style={{ color: store.styleCustomization.colorHex, borderColor: store.styleCustomization.colorHex }}
                            >
                              Key Skills
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {(store.candidateData?.skills || ['Skill 1', 'Skill 2', 'Skill 3']).slice(0, 4).map((skill, i) => (
                                <span key={i} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        {store.styleCustomization.footerText && (
                          <div className="absolute bottom-2 left-4 right-4">
                            <div 
                              className="text-xs text-center pt-1 border-t"
                              style={{ borderColor: store.styleCustomization.colorHex }}
                            >
                              {store.styleCustomization.footerText}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
                         </div>
           )}

          {/* Step 4: Document Sections */}
          {store.currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-blue-800 font-medium mb-1">Configure Document Sections</h3>
                    <p className="text-blue-700 text-sm">
                      Customize which sections appear in your document and their order. Watch the preview update in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sections Configuration */}
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-primary-600" />
                      Document Sections
                    </h4>
                    
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={store.sections.map(s => s.key)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {store.sections
                            .sort((a, b) => a.order - b.order)
                            .map((section) => (
                              <SortableSectionItem
                                key={section.key}
                                section={section}
                                isEditing={editingSectionKey === section.key}
                                editingLabel={editingLabel}
                                onToggle={() => store.toggleSection(section.key)}
                                onStartEdit={() => handleStartEdit(section.key, section.label)}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={handleCancelEdit}
                                onLabelChange={setEditingLabel}
                                onRemove={() => handleRemoveSection(section.key)}
                                canRemove={canRemoveSection(section.key)}
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Add Custom Section */}
                    <div className="border-t pt-4 mt-4">
                      {showAddSection ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Input
                              value={newSectionLabel}
                              onChange={(e) => setNewSectionLabel(e.target.value)}
                              placeholder="Enter section name or select from suggestions below"
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSection();
                                if (e.key === 'Escape') setShowAddSection(false);
                              }}
                              autoFocus
                            />
                            <Button
                              onClick={handleAddSection}
                              disabled={!newSectionLabel.trim()}
                              size="sm"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                            <Button
                              onClick={() => {
                                setShowAddSection(false);
                                setNewSectionLabel('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* Section Suggestions */}
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
                            <div className="flex flex-wrap gap-2">
                              {sectionSuggestions
                                .filter(suggestion => 
                                  !store.sections.some(section => 
                                    section.label.toLowerCase() === suggestion.toLowerCase()
                                  )
                                )
                                .slice(0, 8)
                                .map((suggestion) => (
                                  <button
                                    key={suggestion}
                                    onClick={() => setNewSectionLabel(suggestion)}
                                    className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setShowAddSection(true)}
                          variant="outline"
                          className="w-full border-dashed border-2 border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Custom Section
                        </Button>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-green-800 font-medium">
                              {store.sections.filter(s => s.show).length} of {store.sections.length} sections will be included
                            </span>
                            <Badge variant="outline" className="bg-primary-100 text-primary-700 border-primary-300">
                              {store.sections.filter(s => s.key.startsWith('custom_')).length} custom
                            </Badge>
                          </div>
                          <div className="text-sm text-green-700">
                            <strong>Tips:</strong> Drag sections by the grip handle to reorder • Click checkboxes to toggle visibility • Click edit icon to rename custom sections
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-primary-600" />
                    Live Preview
                  </h4>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div 
                      className="w-full h-[600px] bg-white p-8 overflow-y-auto text-black"
                      style={{ 
                        fontFamily: store.styleCustomization.font || 'Times New Roman',
                        fontSize: store.styleCustomization.fontSize || '11pt',
                        lineHeight: store.styleCustomization.lineSpacing || '1.2'
                      }}
                    >
                      {/* Header with company branding */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div 
                            className="h-1 w-full mb-3"
                            style={{ backgroundColor: store.styleCustomization.colorHex }}
                          />
                          <h1 
                            className="text-2xl font-bold mb-1"
                            style={{ color: store.styleCustomization.colorHex }}
                          >
                            COMPETENCE FILE
                          </h1>
                          <p className="text-sm text-gray-600 mb-4">Professional Skills Assessment</p>
                        </div>
                        <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                          {store.styleCustomization.logoUrl ? (
                            <img 
                              src={store.styleCustomization.logoUrl} 
                              alt="Company logo" 
                              className="w-full h-full object-contain rounded"
                            />
                          ) : (
                            <Image className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Candidate Information */}
                      {store.candidateData && (
                        <div className="mb-6">
                          <h2 
                            className="text-lg font-semibold mb-3 pb-1 border-b"
                            style={{ color: store.styleCustomization.colorHex, borderColor: store.styleCustomization.colorHex }}
                          >
                            {store.candidateData.fullName}
                          </h2>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Position:</strong> {store.candidateData.currentTitle}
                            </div>
                            <div>
                              <strong>Location:</strong> {store.candidateData.location}
                            </div>
                            <div>
                              <strong>Email:</strong> {store.candidateData.email}
                            </div>
                            <div>
                              <strong>Experience:</strong> {store.candidateData.yearsOfExperience} years
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dynamic Sections Preview */}
                      {store.sections
                        .filter(section => section.show)
                        .sort((a, b) => a.order - b.order)
                        .map((section, index) => (
                          <div key={section.key} className="mb-4">
                            <h3 
                              className="text-base font-semibold mb-2 pb-1 border-b"
                              style={{ color: store.styleCustomization.colorHex, borderColor: store.styleCustomization.colorHex }}
                            >
                              {section.label}
                            </h3>
                            <div className="text-sm text-gray-700">
                              {section.key === 'skills' && store.candidateData?.skills && (
                                <div className="flex flex-wrap gap-1">
                                  {store.candidateData.skills.slice(0, 6).map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {section.key === 'experience' && store.candidateData?.experience && (
                                <div>
                                  {store.candidateData.experience.slice(0, 2).map((exp, i) => (
                                    <div key={i} className="mb-2">
                                      <div className="font-medium">{exp.title} - {exp.company}</div>
                                      <div className="text-xs text-gray-600">{exp.startDate} - {exp.endDate}</div>
                                      <div className="text-xs">{exp.responsibilities}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {section.key === 'education' && store.candidateData?.education && (
                                <div>
                                  {store.candidateData.education.slice(0, 2).map((edu, i) => (
                                    <div key={i} className="text-sm">{edu}</div>
                                  ))}
                                </div>
                              )}
                              {section.key === 'summary' && store.candidateData?.summary && (
                                <p className="text-sm">{store.candidateData.summary}</p>
                              )}
                              {section.key === 'certifications' && store.candidateData?.certifications && (
                                <div className="space-y-1">
                                  {store.candidateData.certifications.map((cert, i) => (
                                    <div key={i} className="text-sm flex items-center">
                                      <Award className="h-3 w-3 mr-2 text-yellow-600" />
                                      {cert}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {section.key === 'languages' && store.candidateData?.languages && (
                                <div className="space-y-1">
                                  {store.candidateData.languages.map((lang, i) => (
                                    <div key={i} className="text-sm">{lang}</div>
                                  ))}
                                </div>
                              )}
                              {!['skills', 'experience', 'education', 'summary', 'certifications', 'languages'].includes(section.key) && (
                                <div className="text-xs text-gray-500 italic">
                                  {section.label} content will be populated here...
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                      {/* Footer */}
                      {store.styleCustomization.footerText && (
                        <div className="mt-8 pt-4 border-t" style={{ borderColor: store.styleCustomization.colorHex }}>
                          <div className="text-xs text-center text-gray-600">
                            {store.styleCustomization.footerText}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                         </div>
           )}

          {/* Step 5: Generate & Download */}
          {store.currentStep === 5 && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Ready to generate your competence file</span>
                </div>
              </div>

              {/* Output Format Selection */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Choose Output Format</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      store.outputFormat === 'pdf' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => store.setOutputFormat('pdf')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileDown className="h-8 w-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Document</h3>
                      <p className="text-sm text-gray-600">Professional, print-ready format ideal for sharing</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      store.outputFormat === 'docx' ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => store.setOutputFormat('docx')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Document</h3>
                      <p className="text-sm text-gray-600">Editable format for further customization</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Summary */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Generation Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Candidate:</span>
                      <p className="text-gray-900">{store.candidateData?.fullName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Template:</span>
                      <p className="text-gray-900">{store.selectedTemplate?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Format:</span>
                      <p className="text-gray-900">{store.outputFormat.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Sections:</span>
                      <p className="text-gray-900">{store.sections.filter(s => s.show).length} included</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="text-center">
                <Button 
                  onClick={handleGenerate}
                  disabled={store.isGenerating}
                  className="px-8 py-3 text-lg"
                  size="lg"
                >
                  {store.isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-3" />
                      Generating File...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-3" />
                      Generate Competence File
                    </>
                  )}
                </Button>
              </div>

              {store.generatedFileUrl && (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <p className="text-green-800 font-medium mb-3">File generated successfully!</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Create download link and trigger download
                      const link = document.createElement('a');
                      link.href = store.generatedFileUrl!;
                      link.download = `${store.candidateData?.fullName || 'Candidate'}_Competence_File.${store.outputFormat}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {store.currentStep > 1 && (
              <Button variant="outline" onClick={store.prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {store.currentStep < 5 && (
              <Button 
                onClick={store.nextStep}
                disabled={
                  (store.currentStep === 1 && !store.candidateData) ||
                  (store.currentStep === 2 && !store.selectedTemplate)
                }
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 