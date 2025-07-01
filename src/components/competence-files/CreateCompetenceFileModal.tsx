'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/Card';


// Import step components
import { CandidateSelectionStep } from './steps/CandidateSelectionStep';
import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
import { JobDescriptionStep } from './steps/JobDescriptionStep';
import { EditorStep } from './steps/EditorStep';
import { useSegmentStore } from '@/stores/ai-generation-store';


// Types
interface CandidateData {
  id: string;
  fullName: string;
  currentTitle: string;
  email: string;
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  certifications: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
  education: string[];
  languages: string[];
  summary: string;
}

interface CreateCompetenceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileUrl: string) => void;
  preselectedCandidate?: CandidateData | null;
}

interface JobDescription {
  text: string;
  requirements: string[];
  skills: string[];
  responsibilities: string;
  title?: string;
  company?: string;
}

export function CreateCompetenceFileModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedCandidate 
}: CreateCompetenceFileModalProps) {
  const { getToken } = useAuth();
  
  // Segment store
  const { 
    segments, 
    isLoading: segmentsLoading, 
    loadFromAI, 
    clearSegments 
  } = useSegmentStore();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(preselectedCandidate || null);
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'professional-classic' | 'modern' | 'minimal' | 'emineon' | 'antaes'>('professional-classic');
  
  // Job Description state
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    text: '',
    requirements: [],
    skills: [],
    responsibilities: '',
    title: '',
    company: ''
  });
  const [jobInputMethod, setJobInputMethod] = useState<'text' | 'file' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [jobDescriptionFiles, setJobDescriptionFiles] = useState<File[]>([]);
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  
  // Manager contact details
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  // Additional state for editor
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Processing feedback states
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  // File upload and parsing handlers
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsParsing(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      const formData = new FormData();
      formData.append('file', files[0]);

      const response = await fetch('/api/competence-files/parse-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format from server');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from file. Please ensure the file contains clear candidate information.');
      }
      
      setSelectedCandidate(newCandidate);
      
    } catch (error) {
      console.error('File parsing error:', error);
      alert(`Failed to parse CV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  }, [getToken]);

  const handleTextParse = useCallback(async (text: string) => {
    setIsParsing(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await fetch('/api/competence-files/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = 'Failed to parse text';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from text');
      }
      
      setSelectedCandidate(newCandidate);
      
    } catch (error) {
      console.error('Text parsing error:', error);
      alert(`Failed to parse text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  }, [getToken]);

  const handleUrlParse = useCallback(async (url: string) => {
    setIsParsing(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      const response = await fetch('/api/competence-files/parse-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = 'Failed to parse LinkedIn URL';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from LinkedIn profile');
      }
      
      setSelectedCandidate(newCandidate);
      
    } catch (error) {
      console.error('URL parsing error:', error);
      alert(`Failed to parse LinkedIn URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  }, [getToken]);

  // Job description handlers
  const handleJobFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    setJobDescriptionFiles(files);
    setIsParsing(true);
    
    try {
      const token = await getToken();
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      
      const response = await fetch('/api/files/extract-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const { texts } = await response.json();
        const combinedText = texts.join('\n\n');
        await parseJobDescription(combinedText);
      } else {
        throw new Error('Failed to extract text from files');
      }
    } catch (error) {
      console.error('Error processing job description files:', error);
      alert('Failed to process job description files. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const parseJobDescription = async (text: string) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/ai/job-description/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      
      if (response.ok) {
        const parsed = await response.json();
        setJobDescription({
          text,
          requirements: parsed.requirements || [],
          skills: parsed.skills || [],
          responsibilities: parsed.responsibilities || '',
          title: parsed.title || '',
          company: parsed.company || ''
        });
      } else {
        // Fallback: just set the text
        setJobDescription(prev => ({ ...prev, text }));
      }
    } catch (error) {
      console.error('Error parsing job description:', error);
      // Fallback: just set the text
      setJobDescription(prev => ({ ...prev, text }));
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        await transcribeAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Failed to start voice recording. Please check microphone permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const { text } = await response.json();
        await parseJobDescription(text);
      } else {
        throw new Error('Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    }
  };

  // Document generation handlers
  const handleSave = async () => {
    setIsAutoSaving(true);
    try {
      // Implement save logic here
      console.log('Saving draft...');
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleGenerateDocument = async (format: 'pdf' | 'docx') => {
    setIsGenerating(true);
    setProcessingStep('Initializing...');
    setProcessingProgress(0);
    
    try {
      if (!selectedCandidate || !selectedTemplate) {
        throw new Error('Missing candidate or template selection');
      }

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      setProcessingStep('Preparing document content...');
      setProcessingProgress(15);

      // Get visible segments for PDF generation from editor
      const visibleSegments = segments
        .filter(segment => segment.visible)
        .sort((a, b) => a.order - b.order)
        .map(segment => ({
          id: segment.id,
          type: segment.type,
          title: segment.title,
          content: segment.content,
          order: segment.order,
        }));

      setProcessingStep('Applying professional formatting...');
      setProcessingProgress(40);

      let response;
      
      if (format === 'pdf') {
        // Use the new generate-pdf endpoint for PDF generation from editor content
        console.log('🎯 Using generate-pdf endpoint for editor-based PDF generation...');
        
        setProcessingStep('Generating document...');
        setProcessingProgress(70);
        
        response = await fetch('/api/competence-files/generate-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            candidateData: selectedCandidate,
            segments: visibleSegments,
            jobDescription: jobDescription.text ? jobDescription : undefined,
            managerContact: {
              name: managerName,
              email: managerEmail,
              phone: managerPhone,
            },
            template: selectedTemplate,
            client: jobDescription.company || 'Client',
            jobTitle: jobDescription.title || 'Position',
          }),
        });
      } else {
        // Use the existing generate endpoint for other formats
        console.log('📄 Using generate endpoint for document generation...');
        
        setProcessingStep('Generating document...');
        setProcessingProgress(50);
        
        // Convert segments to sections format expected by the API
        const sections = visibleSegments.map(segment => ({
          id: segment.id,
          type: segment.type,
          title: segment.title,
          content: segment.content,
          visible: true,
          order: segment.order,
        }));

        response = await fetch('/api/competence-files/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            candidateData: selectedCandidate,
            template: selectedTemplate,
            sections,
            format,
            jobDescription: jobDescription.text ? jobDescription : undefined,
            managerContact: {
              name: managerName,
              email: managerEmail,
              phone: managerPhone,
            },
          }),
        });
      }

      setProcessingStep('Finalizing document...');
      setProcessingProgress(90);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Generation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      setProcessingStep('Complete');
      setProcessingProgress(100);
      
      if (result.success && result.fileUrl) {
        console.log(`✅ ${format.toUpperCase()} document generated successfully!`);
        console.log(`📎 File URL: ${result.fileUrl}`);
        
        // Auto-download the PDF file
        if (format === 'pdf') {
          const link = document.createElement('a');
          link.href = result.fileUrl;
          link.download = result.fileName || `${selectedCandidate.fullName}_${selectedTemplate}_Competence_File.pdf`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log(`📥 Auto-downloading: ${result.fileName}`);
        }
        
        // Show success message
        alert(`Document generated successfully!\n\nYour ${format.toUpperCase()} file has been ${format === 'pdf' ? 'downloaded' : 'created'}.`);
        
        // Call success callback to refresh the competence files list
        onSuccess(result.fileUrl);
      } else {
        throw new Error(result.message || 'Document generation failed');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Failed to generate document.\n\nPlease try again or contact support if the issue persists.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
      setProcessingStep('');
      setProcessingProgress(0);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update segments when candidate changes or when moving to step 4
  useEffect(() => {
    if (selectedCandidate && currentStep === 4 && segments.length === 0) {
      console.log('🚀 Starting AI content generation for all segments...');
      
      const jobData = jobDescription.text ? jobDescription : undefined;
      
      loadFromAI(jobData, selectedCandidate).catch(error => {
        console.error('💥 Critical error during AI content generation:', error);
        alert(`❌ AI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your internet connection and try again.`);
        // Go back to step 3 on failure
        setCurrentStep(3);
      });
    }
  }, [selectedCandidate, currentStep, segments.length, jobDescription, loadFromAI]);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedCandidate !== null;
      case 2:
        return true; // Job description is optional, but having it enables AI optimization
      case 3:
        return selectedTemplate !== null;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  // Determine modal size based on step
  const isEditorStep = currentStep === 4;
  const modalClass = isEditorStep
    ? 'fixed inset-0 bg-white w-full h-full m-0 rounded-none flex flex-col z-50' // Full page for editor
    : 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  const innerClass = isEditorStep
    ? 'w-full h-full flex flex-col' // Full page for editor
    : 'bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] m-4 flex flex-col';

  return (
    <div className={modalClass}>
      <div className={innerClass}>
        {/* Header: Always show stepper and exit button */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Create Competence File</h2>
            <div className="flex items-center space-x-4 mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === step 
                      ? 'bg-primary-600 text-white' 
                      : currentStep > step 
                        ? 'bg-success-600 text-white' 
                        : 'bg-secondary-200 text-secondary-600'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-sm ${
                    currentStep === step ? 'text-primary-600 font-medium' : 'text-secondary-600'
                  }`}>
                    {step === 1 && 'Candidate'}
                    {step === 2 && 'Job Description'}
                    {step === 3 && 'Template'}
                    {step === 4 && 'Editor'}
                  </span>
                  {step < 4 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="ml-auto">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Step 1: Candidate Selection */}
          {currentStep === 1 && (
            <CandidateSelectionStep
              selectedCandidate={selectedCandidate}
              onCandidateSelected={setSelectedCandidate}
              isParsing={isParsing}
              onFileUpload={handleFileUpload}
              onTextParse={handleTextParse}
              onUrlParse={async (url: string) => {
                // Handle LinkedIn URL parsing
                console.log('LinkedIn URL parsing:', url);
              }}
            />
          )}

          {/* Step 2: Job Description & Manager Details */}
          {currentStep === 2 && (
            <JobDescriptionStep
              jobDescription={jobDescription}
              onJobDescriptionUpdate={setJobDescription}
              jobInputMethod={jobInputMethod}
              onJobInputMethodChange={setJobInputMethod}
              isRecording={isRecording}
              onStartRecording={startVoiceRecording}
              onStopRecording={stopVoiceRecording}
              isParsing={isParsing}
              jobDescriptionFiles={jobDescriptionFiles}
              onJobFileSelect={handleJobFileSelect}
              isJobDescriptionExpanded={isJobDescriptionExpanded}
              onToggleJobDescriptionExpanded={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
              managerName={managerName}
              onManagerNameChange={setManagerName}
              managerEmail={managerEmail}
              onManagerEmailChange={setManagerEmail}
              managerPhone={managerPhone}
              onManagerPhoneChange={setManagerPhone}
            />
          )}

          {/* Step 3: Template Selection */}
          {currentStep === 3 && selectedCandidate && (
            <TemplateSelectionStep
              selectedCandidate={selectedCandidate}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              jobDescription={jobDescription}
            />
          )}

          {/* Step 4: AI-Enhanced Editor */}
          {currentStep === 4 && selectedCandidate && (
            <EditorStep
              selectedCandidate={selectedCandidate}
              selectedTemplate={selectedTemplate}
              jobDescription={jobDescription}
              onBack={handleBack}
              onSave={handleSave}
              onGenerateDocument={handleGenerateDocument}
              isGenerating={isGenerating}
              isAutoSaving={isAutoSaving}
            />
          )}
        </div>

        {/* Footer with navigation buttons */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between p-6 border-t bg-neutral-100 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
            >
              {currentStep === 2 ? 'Select Template' : currentStep === 3 ? 'Continue to Editor' : 'Next'}
            </Button>
          </div>
        )}

        {/* Processing Feedback Overlay */}
        {isGenerating && processingStep && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-emineon">
              <div className="text-center">
                <div className="mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600 mx-auto"></div>
                </div>
                <h3 className="text-lg font-semibold text-primary-900 mb-3">
                  Creating Document
                </h3>
                <p className="text-sm text-secondary-600 mb-6">
                  {processingStep}
                </p>
                <div className="w-full bg-secondary-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-secondary-500 font-medium">
                  {processingProgress}% Complete
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 