'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface CandidateData {
  id: string;
  fullName: string;
  currentTitle: string;
  email?: string;
  phone?: string;
  location?: string;
  photo?: string;
  yearsOfExperience?: number;
  summary?: string;
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
}

interface Template {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  colorHex: string;
  font: string;
  footerText?: string;
  sections: Array<{
    key: string;
    label: string;
    show: boolean;
    order: number;
  }>;
  previewImage?: string;
  client?: string;
}

interface TemplateCustomization {
  colorHex: string;
  font: string;
  fontSize?: string;
  lineSpacing?: string;
  margins?: string;
  logoUrl?: string;
  footerText?: string;
}

interface SectionConfig {
  key: string;
  label: string;
  show: boolean;
  order: number;
}

type CandidateSource = 'upload' | 'paste' | 'db' | 'linkedin';
type OutputFormat = 'pdf' | 'docx';

interface CompetenceFileState {
  // Current step (1-5)
  currentStep: number;
  
  // Step 1: Candidate Selection
  candidateSource: CandidateSource | null;
  candidateId?: string;
  uploadedFile?: File;
  linkedinText?: string;
  pastedCV?: string;
  candidateData?: CandidateData;
  isProcessingCandidate: boolean;
  
  // Step 2: Template Selection
  templateId?: string;
  selectedTemplate?: Template;
  templateSearch?: string;
  templateCategory?: string;
  
  // Step 3: Style Customization
  styleCustomization: TemplateCustomization;
  
  // Step 4: Section Configuration
  sections: SectionConfig[];
  
  // Step 5: Generation
  outputFormat: OutputFormat;
  isGenerating: boolean;
  generatedFileUrl?: string;
  
  // Modal state
  isOpen: boolean;
  
  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  
  // Step 1 actions
  setCandidateSource: (source: CandidateSource) => void;
  setUploadedFile: (file: File) => void;
  setLinkedInText: (text: string) => void;
  setPastedCV: (text: string) => void;
  setCandidateData: (data: CandidateData) => void;
  setProcessingCandidate: (processing: boolean) => void;
  
  // Step 2 actions
  setSelectedTemplate: (template: Template) => void;
  setTemplateSearch: (search: string) => void;
  setTemplateCategory: (category: string) => void;
  
  // Step 3 actions
  updateStyleCustomization: (updates: Partial<TemplateCustomization>) => void;
  
  // Step 4 actions
  updateSections: (sections: SectionConfig[]) => void;
  toggleSection: (key: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  addCustomSection: (label: string) => void;
  removeSection: (key: string) => void;
  updateSectionLabel: (key: string, label: string) => void;
  
  // Step 5 actions
  setOutputFormat: (format: OutputFormat) => void;
  setGenerating: (generating: boolean) => void;
  setGeneratedFileUrl: (url: string) => void;
  
  // Modal actions
  openModal: () => void;
  closeModal: () => void;
  resetWizard: () => void;
}

const defaultStyleCustomization: TemplateCustomization = {
  colorHex: '#1e40af',
  font: 'Inter',
  fontSize: '11pt',
  lineSpacing: '1.2',
  margins: 'normal',
  logoUrl: '',
  footerText: 'Generated with Emineon ATS'
};

const defaultSections: SectionConfig[] = [
  { key: 'header', label: 'Header Information', show: true, order: 1 },
  { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
  { key: 'experience', label: 'Work Experience', show: true, order: 3 },
  { key: 'skills', label: 'Technical Skills', show: true, order: 4 },
  { key: 'education', label: 'Education', show: true, order: 5 },
  { key: 'certifications', label: 'Certifications', show: true, order: 6 },
  { key: 'languages', label: 'Languages', show: false, order: 7 },
];

export const useCompetenceFileStore = create<CompetenceFileState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      candidateSource: null,
      isProcessingCandidate: false,
      styleCustomization: defaultStyleCustomization,
      sections: defaultSections,
      outputFormat: 'pdf',
      isGenerating: false,
      isOpen: false,

      // Navigation actions
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 5) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      
      setStep: (step: number) => set({ currentStep: step }),

      // Step 1 actions
      setCandidateSource: (source) => set({ candidateSource: source }),
      
      setUploadedFile: (file) => set({ uploadedFile: file }),
      
      setLinkedInText: (text) => set({ linkedinText: text }),
      
      setPastedCV: (text) => set({ pastedCV: text }),
      
      setCandidateData: (data) => set({ candidateData: data }),
      
      setProcessingCandidate: (processing) => set({ isProcessingCandidate: processing }),

      // Step 2 actions
      setSelectedTemplate: (template) => set({ 
        selectedTemplate: template,
        templateId: template.id,
        styleCustomization: {
          colorHex: template.colorHex,
          font: template.font,
          fontSize: defaultStyleCustomization.fontSize,
          lineSpacing: defaultStyleCustomization.lineSpacing,
          margins: defaultStyleCustomization.margins,
          logoUrl: template.logoUrl || '',
          footerText: template.footerText || defaultStyleCustomization.footerText
        },
        sections: template.sections.length > 0 ? template.sections : defaultSections
      }),

      setTemplateSearch: (search) => set({ templateSearch: search }),
      
      setTemplateCategory: (category) => set({ templateCategory: category }),

      // Step 3 actions
      updateStyleCustomization: (updates) => set((state) => ({
        styleCustomization: { ...state.styleCustomization, ...updates }
      })),

      // Step 4 actions
      updateSections: (sections) => set({ sections }),
      
      toggleSection: (key) => set((state) => ({
        sections: state.sections.map(section =>
          section.key === key ? { ...section, show: !section.show } : section
        )
      })),
      
      reorderSections: (fromIndex, toIndex) => set((state) => {
        const newSections = [...state.sections];
        const [movedSection] = newSections.splice(fromIndex, 1);
        newSections.splice(toIndex, 0, movedSection);
        
        // Update order values
        return {
          sections: newSections.map((section, index) => ({
            ...section,
            order: index + 1
          }))
        };
      }),

      addCustomSection: (label) => set((state) => {
        const maxOrder = Math.max(...state.sections.map(s => s.order), 0);
        const customKey = `custom_${Date.now()}`;
        
        return {
          sections: [
            ...state.sections,
            {
              key: customKey,
              label,
              show: true,
              order: maxOrder + 1
            }
          ]
        };
      }),

      removeSection: (key) => set((state) => ({
        sections: state.sections.filter(section => section.key !== key)
      })),

      updateSectionLabel: (key, label) => set((state) => ({
        sections: state.sections.map(section =>
          section.key === key ? { ...section, label } : section
        )
      })),

      // Step 5 actions
      setOutputFormat: (format) => set({ outputFormat: format }),
      
      setGenerating: (generating) => set({ isGenerating: generating }),
      
      setGeneratedFileUrl: (url) => set({ generatedFileUrl: url }),

      // Modal actions
      openModal: () => set({ isOpen: true }),
      
      closeModal: () => set({ isOpen: false }),
      
      resetWizard: () => set({
        currentStep: 1,
        candidateSource: null,
        candidateId: undefined,
        uploadedFile: undefined,
        linkedinText: undefined,
        pastedCV: undefined,
        candidateData: undefined,
        isProcessingCandidate: false,
        templateId: undefined,
        selectedTemplate: undefined,
        styleCustomization: defaultStyleCustomization,
        sections: defaultSections,
        outputFormat: 'pdf',
        isGenerating: false,
        generatedFileUrl: undefined
      })
    }),
    {
      name: 'competence-file-store'
    }
  )
); 