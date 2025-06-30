'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

// Import step components
// import { CandidateSelectionStep } from './steps/CandidateSelectionStep';
// import { TemplateSelectionStep } from './steps/TemplateSelectionStep';
// import { JobDescriptionStep } from './steps/JobDescriptionStep';

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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedCandidate !== null;
      case 2:
        return selectedTemplate !== null;
      case 3:
        return true; // Job description is optional
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Create Competence File</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-blue-600 text-white">1</div>
                <span className="text-sm">Candidate</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Refactored Modal</h3>
              <p className="text-gray-600">This is the new modular structure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 