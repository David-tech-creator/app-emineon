'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

// Import step components
import { CandidateSelectionStep } from './steps/CandidateSelectionStep';
import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
import { JobDescriptionStep } from './steps/JobDescriptionStep';
import { EditorStep } from './steps/EditorStep';

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

interface DocumentSection {
  id: string;
  type: string;
  title: string;
  content: string;
  visible: boolean;
  order: number;
  editable: boolean;
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

// Function to create separate experience sections via OpenAI API only
function createExperienceSections(candidateData: CandidateData): DocumentSection[] {
  if (!candidateData.experience || candidateData.experience.length === 0) {
    return [];
  }

  // Sort experiences by end date (most recent first)
  const sortedExperiences = [...candidateData.experience].sort((a, b) => {
    const endDateA = new Date(a.endDate === 'Present' || a.endDate === 'Current' ? '2024-12-31' : a.endDate);
    const endDateB = new Date(b.endDate === 'Present' || b.endDate === 'Current' ? '2024-12-31' : b.endDate);
    return endDateB.getTime() - endDateA.getTime();
  });

  return sortedExperiences.map((exp, index) => {
    return {
      id: `experience-${index + 1}`,
      type: 'experience',
      title: `PROFESSIONAL EXPERIENCES`,
      content: '', // Empty - will be populated via OpenAI API only
      visible: true,
      order: 9 + index, // Start after the 9 base sections (0-8)
      editable: true
    };
  });
}

// Function to generate content via OpenAI API only - NO FALLBACKS
async function generateSectionContentWithAI(
  sectionType: string, 
  candidateData: CandidateData, 
  jobDescription?: JobDescription, 
  getToken?: () => Promise<string | null>
): Promise<string> {
  if (!getToken) {
    throw new Error('❌ AI content generation requires authentication');
  }
  
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('❌ Authentication token not available for AI content generation');
    }

    // Generate unique session ID for this generation batch
    const sessionId = `frontend-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestTimestamp = Date.now();

    console.log(`🤖 [${sectionType}] [SESSION: ${sessionId}] Starting AI content generation...`);
    console.log(`📊 [${sectionType}] Candidate data:`, {
      name: candidateData.fullName,
      title: candidateData.currentTitle,
      skillsCount: candidateData.skills?.length || 0,
      hasJobDescription: !!jobDescription,
      sessionId,
      timestamp: requestTimestamp
    });

    const requestBody = {
      type: 'generate',
      sectionType,
      currentContent: '',
      candidateData,
      jobDescription: jobDescription?.text ? jobDescription : undefined,
      sessionId,
      clientTimestamp: requestTimestamp.toString()
    };

    console.log(`📤 [${sectionType}] [SESSION: ${sessionId}] Sending request to AI API...`);

    const response = await fetch('/api/ai/generate-suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Session-ID': sessionId,
        'X-Section-Type': sectionType,
        'X-Request-Timestamp': requestTimestamp.toString()
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📨 [${sectionType}] [SESSION: ${sessionId}] Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [${sectionType}] [SESSION: ${sessionId}] AI service error:`, response.status, errorText);
      throw new Error(`❌ AI service failed for ${sectionType}: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    const suggestion = responseData.suggestion;
    
    if (!suggestion || !suggestion.trim()) {
      console.error(`❌ [${sectionType}] [SESSION: ${sessionId}] Empty response from AI service`);
      throw new Error(`❌ AI service returned empty content for ${sectionType}`);
    }

    // Validate response matches request
    if (responseData.sectionType !== sectionType) {
      console.error(`❌ [${sectionType}] [SESSION: ${sessionId}] Section type mismatch! Expected: ${sectionType}, Got: ${responseData.sectionType}`);
      throw new Error(`❌ Section type mismatch in AI response for ${sectionType}`);
    }
    
    console.log(`✅ [${sectionType}] [SESSION: ${sessionId}] AI content generated successfully:`, {
      length: suggestion.length,
      preview: suggestion.substring(0, 100) + '...'
    });
    
    return suggestion;
  } catch (error) {
    console.error(`💥 [${sectionType}] AI generation failed:`, error);
    // NO FALLBACKS - Throw error to ensure only AI content is used
    throw new Error(`❌ AI content generation failed for ${sectionType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function CreateCompetenceFileModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedCandidate 
}: CreateCompetenceFileModalProps) {
  const { getToken } = useAuth();
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(preselectedCandidate || null);
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'modern' | 'minimal' | 'emineon' | 'antaes'>('emineon');
  
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
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([
    { id: 'header', type: 'header', title: 'HEADER', content: '', visible: true, order: 0, editable: true },
    { id: 'summary', type: 'summary', title: 'PROFESSIONAL SUMMARY', content: '', visible: true, order: 1, editable: true },
    { id: 'functional-skills', type: 'functional-skills', title: 'FUNCTIONAL SKILLS', content: '', visible: true, order: 2, editable: true },
    { id: 'technical-skills', type: 'technical-skills', title: 'TECHNICAL SKILLS', content: '', visible: true, order: 3, editable: true },
    { id: 'areas-of-expertise', type: 'areas-of-expertise', title: 'AREAS OF EXPERTISE', content: '', visible: true, order: 4, editable: true },
    { id: 'education', type: 'education', title: 'EDUCATION', content: '', visible: true, order: 5, editable: true },
    { id: 'certifications', type: 'certifications', title: 'CERTIFICATIONS', content: '', visible: true, order: 6, editable: true },
    { id: 'languages', type: 'languages', title: 'LANGUAGES', content: '', visible: true, order: 7, editable: true },
    { id: 'experiences-summary', type: 'experiences-summary', title: 'PROFESSIONAL EXPERIENCES SUMMARY', content: '', visible: true, order: 8, editable: true },
  ]);
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  const [customElements, setCustomElements] = useState<string[]>([]);
  const [newElementInput, setNewElementInput] = useState('');
  
  // Manager contact details
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');

  // Additional state for editor
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

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

  // Custom elements handlers
  const addCustomElement = () => {
    if (newElementInput.trim()) {
      setCustomElements([...customElements, newElementInput.trim()]);
      setNewElementInput('');
    }
  };

  const removeCustomElement = (element: string) => {
    setCustomElements(customElements.filter(e => e !== element));
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
    try {
      // Implement document generation logic here
      console.log(`Generating ${format} document...`);
    } catch (error) {
      console.error('Error generating document:', error);
    } finally {
      setIsGenerating(false);
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

  // Update document sections when candidate changes or when moving to step 4
  useEffect(() => {
    if (selectedCandidate && currentStep === 4 && documentSections.every(section => !section.content)) {
      console.log('🚀 Starting comprehensive AI content generation for all sections...');
      
      const generateAllContent = async () => {
        try {
          // Create individual experience sections
          const experienceSections = createExperienceSections(selectedCandidate);
          
          // Define all base sections that need AI content generation
          const baseSectionTypes = [
            { type: 'header', title: 'HEADER', order: 0 },
            { type: 'summary', title: 'PROFESSIONAL SUMMARY', order: 1 },
            { type: 'functional-skills', title: 'FUNCTIONAL SKILLS', order: 2 },
            { type: 'technical-skills', title: 'TECHNICAL SKILLS', order: 3 },
            { type: 'areas-of-expertise', title: 'AREAS OF EXPERTISE', order: 4 },
            { type: 'education', title: 'EDUCATION', order: 5 },
            { type: 'certifications', title: 'CERTIFICATIONS', order: 6 },
            { type: 'languages', title: 'LANGUAGES', order: 7 },
            { type: 'experiences-summary', title: 'PROFESSIONAL EXPERIENCES SUMMARY', order: 8 },
          ];

          // Generate AI content for all base sections in parallel
          console.log('🤖 Generating AI content for base sections...');
          const baseSectionPromises = baseSectionTypes.map(async (sectionDef) => {
            try {
              const content = await generateSectionContentWithAI(
                sectionDef.type,
                selectedCandidate,
                jobDescription.text ? jobDescription : undefined,
                getToken
              );
              
              return {
                id: sectionDef.type,
                type: sectionDef.type,
                title: sectionDef.title,
                content,
                visible: true,
                order: sectionDef.order,
                editable: true
              };
            } catch (error) {
              console.error(`❌ Failed to generate AI content for ${sectionDef.type}:`, error);
              throw new Error(`AI generation failed for ${sectionDef.type}`);
            }
          });

          // Generate AI content for individual experience sections in parallel
          console.log('🤖 Generating AI content for individual experience sections...');
          const experienceSectionPromises = experienceSections.map(async (expSection) => {
            try {
              const content = await generateSectionContentWithAI(
                'experience',
                selectedCandidate,
                jobDescription.text ? jobDescription : undefined,
                getToken
              );
              
              return {
                ...expSection,
                content
              };
            } catch (error) {
              console.error(`❌ Failed to generate AI content for experience section ${expSection.id}:`, error);
              throw new Error(`AI generation failed for experience section ${expSection.id}`);
            }
          });

          // Wait for ALL AI generations to complete
          console.log('⏳ Waiting for all AI content generation to complete...');
          const [aiBaseSections, aiExperienceSections] = await Promise.all([
            Promise.all(baseSectionPromises),
            Promise.all(experienceSectionPromises)
          ]);

          // Combine all AI-generated sections
          const allAISections = [
            ...aiBaseSections,
            ...aiExperienceSections
          ];

          setDocumentSections(allAISections);
          console.log(`✅ ALL content generated via AI! Total sections: ${allAISections.length}`);
          
        } catch (error) {
          console.error('💥 Critical error during AI content generation:', error);
          alert(`❌ AI content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your internet connection and try again.`);
          // Go back to step 3 on failure
          setCurrentStep(3);
        }
      };

      generateAllContent();
    }
  }, [selectedCandidate, currentStep, getToken, jobDescription]);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] m-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Create Competence File</h2>
            <div className="flex items-center space-x-4 mt-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep === step 
                      ? 'bg-blue-600 text-white' 
                      : currentStep > step 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-sm ${
                    currentStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}>
                    {step === 1 && 'Candidate'}
                    {step === 2 && 'Job Description'}
                    {step === 3 && 'Template & Sections'}
                    {step === 4 && 'AI Editor'}
                  </span>
                  {step < 4 && <span className="text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
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

          {/* Step 3: AI-Optimized Template & Section Configuration */}
          {currentStep === 3 && selectedCandidate && (
            <TemplateSelectionStep
              selectedCandidate={selectedCandidate}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              documentSections={documentSections}
              onSectionsUpdate={setDocumentSections}
              customElements={customElements}
              onCustomElementsUpdate={setCustomElements}
              newElementInput={newElementInput}
              onNewElementInputChange={setNewElementInput}
              onAddCustomElement={addCustomElement}
              onRemoveCustomElement={removeCustomElement}
              jobDescription={jobDescription}
            />
          )}

          {/* Step 4: AI-Enhanced Editor */}
          {currentStep === 4 && selectedCandidate && (
            <EditorStep
              selectedCandidate={selectedCandidate}
              selectedTemplate={selectedTemplate}
              documentSections={documentSections}
              onSectionsUpdate={setDocumentSections}
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
          <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
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
              {currentStep === 2 ? 'Configure Template & Sections' : currentStep === 3 ? 'Continue to AI Editor' : 'Next'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 