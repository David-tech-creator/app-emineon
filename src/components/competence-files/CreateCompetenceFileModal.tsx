'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@clerk/nextjs';

// DND Kit imports
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
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Lexical imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { TRANSFORMERS } from '@lexical/markdown';

// Lexical nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode, $createListItemNode, $createListNode, $isListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { 
  Upload, 
  FileText, 
  Link, 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Download,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Wand2,
  Loader2,
  X,
  Edit3,
  Move,
  Sparkles,
  RefreshCw,
  ZoomOut,
  ZoomIn,
  Mic,
  MicOff,
  Briefcase,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

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

// Sortable Section Item Component for Step 2
function SortableSectionItem({ 
  section, 
  onToggleVisibility, 
  onDelete 
}: { 
  section: DocumentSection;
  onToggleVisibility: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 border rounded-lg bg-white ${
        isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex-shrink-0"
      >
        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
      </div>
      <button
        onClick={() => onToggleVisibility(section.id)}
        className="flex-shrink-0"
      >
        {section.visible ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
      </button>
      <div className="flex-1">
        <span className={`font-medium ${section.visible ? 'text-gray-900' : 'text-gray-400'}`}>
          {section.title}
        </span>
      </div>
      {section.type === 'custom' && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(section.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  );
}

// Sortable Section Editor Component for Step 3
function SortableSectionEditor({ 
  section, 
  onUpdate, 
  onTitleUpdate,
  getToken, 
  candidateData,
  jobDescription
}: {
  section: DocumentSection;
  onUpdate: (content: string) => void;
  onTitleUpdate: (title: string) => void;
  getToken: () => Promise<string | null>;
  candidateData: CandidateData | null;
  jobDescription?: JobDescription;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleTitleSave = () => {
    onTitleUpdate(tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(section.title);
    setIsEditingTitle(false);
  };

  const generateAIContent = async (type: 'improve' | 'expand' | 'rewrite') => {
    if (!candidateData) {
      console.error('❌ No candidate data available for AI generation');
      alert('No candidate data available. Please select a candidate first.');
      return;
    }
    
    console.log('🤖 Starting AI content generation:', { type, sectionType: section.type, sectionId: section.id });
    
    setIsGeneratingAI(true);
    try {
      const token = await getToken();
      
      if (!token) {
        console.error('❌ No authentication token available');
        alert('Authentication required. Please sign in to use AI features.');
        return;
      }

      console.log('🚀 Sending AI request to API...');
      
      const response = await fetch('/api/ai/generate-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          sectionType: section.type,
          currentContent: section.content,
          candidateData,
            jobDescription: jobDescription?.text ? jobDescription : undefined,
        }),
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const { suggestion } = await response.json();
        console.log('✅ AI suggestion received:', { 
          type, 
          suggestionLength: suggestion?.length || 0,
          preview: suggestion?.substring(0, 100) + '...' 
        });
        
        if (suggestion) {
          // Update the section content - this will trigger the editor to update
          onUpdate(suggestion);
          console.log('✅ Content updated successfully');
        } else {
          console.error('❌ Empty suggestion received');
          alert('No content was generated. Please try again.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', response.status, errorData);
        
        // Handle specific error cases
        if (response.status === 401) {
          alert('Authentication failed. Please sign in again.');
        } else if (response.status === 400) {
          alert(`Invalid request: ${errorData.error || 'Please check your input'}`);
        } else if (response.status === 500) {
          alert('Server error. Please try again in a moment.');
        } else {
          alert(`Failed to generate AI content: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('❌ AI generation error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to generate AI content. Please try again.');
      }
    } finally {
      setIsGeneratingAI(false);
      console.log('🏁 AI generation completed');
    }
  };

  // Simple content initialization without infinite loops
  const initialContent = React.useMemo(() => {
    if (section.content) {
      return section.content;
    }
    return candidateData ? generateInitialContent(candidateData) : '';
  }, [section.id]); // Only depend on section.id to prevent re-initialization

  // Simplified editor config for this specific section
  const sectionEditorConfig = React.useMemo(() => ({
    namespace: `CompetenceFileEditor-${section.id}`,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeHighlightNode,
      CodeNode,
      AutoLinkNode,
      LinkNode
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    }
  }), [section.id]);

  // Content initialization plugin
  const ContentInitializationPlugin = React.useMemo(() => {
    return function ContentInitializationPluginComponent() {
      const [editor] = useLexicalComposerContext();
      
      React.useEffect(() => {
        if (initialContent && initialContent.trim()) {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            
            // Split content into lines and create appropriate nodes
            const lines = initialContent.split('\n');
            
            lines.forEach((line: string, index: number) => {
              const trimmedLine = line.trim();
              
              if (trimmedLine) {
                // Check if line starts with bullet point
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                  // Create list item
                  const listItem = $createListItemNode();
                  const text = $createTextNode(trimmedLine.substring(1).trim());
                  listItem.append(text);
                  
                  // Check if we need to create a new list or add to existing
                  const lastChild = root.getLastChild();
                  if (lastChild && $isListNode(lastChild)) {
                    lastChild.append(listItem);
                  } else {
                    const list = $createListNode('bullet');
                    list.append(listItem);
                    root.append(list);
                  }
                } else if (trimmedLine === '---') {
                  // Create separator
                  const separator = $createParagraphNode();
                  const text = $createTextNode('───────────────────────────────────');
                  separator.append(text);
                  root.append(separator);
                } else {
                  // Create regular paragraph
                  const paragraph = $createParagraphNode();
                  const text = $createTextNode(trimmedLine);
                  paragraph.append(text);
                  root.append(paragraph);
                }
              } else if (index < lines.length - 1) {
                // Add empty paragraph for spacing
                const emptyParagraph = $createParagraphNode();
                root.append(emptyParagraph);
              }
            });
          });
        }
      }, [editor, initialContent]);
      
      return null;
    };
  }, [initialContent]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg bg-white ${
        isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'
      }`}
    >
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <Move className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </div>
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') handleTitleCancel();
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleTitleSave}>
                <Save className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleTitleCancel}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{section.title}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {/* AI Enhancement Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('🔥 Improve button clicked!');
              generateAIContent('improve');
            }}
            disabled={isGeneratingAI}
            className="text-xs bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
          >
            {isGeneratingAI ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1 text-green-600" />
            )}
            Improve
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('🔥 Expand button clicked!');
              generateAIContent('expand');
            }}
            disabled={isGeneratingAI}
            className="text-xs bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100"
          >
            <Plus className="h-3 w-3 mr-1 text-blue-600" />
            Expand
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              console.log('🔥 Rewrite button clicked!');
              generateAIContent('rewrite');
            }}
            disabled={isGeneratingAI}
            className="text-xs bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100"
          >
            <RefreshCw className="h-3 w-3 mr-1 text-purple-600" />
            Rewrite
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <LexicalComposer initialConfig={sectionEditorConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[150px] focus:outline-none prose prose-sm max-w-none p-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors bg-white" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none prose prose-sm">
                <p>Start typing or use AI to enhance this {section.type} section...</p>
                <div className="text-xs mt-1 text-gray-300">
                  💡 Tip: Use the AI buttons above to improve, expand, or rewrite content
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ContentInitializationPlugin />
          <OnChangePlugin 
            onChange={(editorState) => {
              // Debounced update to prevent infinite loops
              editorState.read(() => {
                try {
                  const root = $getRoot();
                  const textContent = root.getTextContent();
                  
                  // Clear previous timeout to debounce
                  if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                  }
                  
                  // Set new timeout for debounced update
                  debounceTimeoutRef.current = setTimeout(() => {
                    onUpdate(textContent);
                  }, 500); // 500ms debounce
                } catch (error) {
                  console.error('Error getting content:', error);
                }
              });
            }}
          />
          <HistoryPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </LexicalComposer>
      </div>
    </div>
  );
}

// Helper function to generate initial content with separate experience blocks
function generateExperienceBlocks(candidateData: CandidateData): string {
  if (!candidateData.experience || candidateData.experience.length === 0) {
    return 'No work experience provided.';
  }

  return candidateData.experience.map((exp, index) => {
    const duration = `${exp.startDate} - ${exp.endDate}`;
    return `
EXPERIENCE ${index + 1}
═══════════════════════════════════════

🏢 Company: ${exp.company}
💼 Position: ${exp.title}
📅 Duration: ${duration}

📋 Key Responsibilities & Achievements:
${exp.responsibilities}

${index < candidateData.experience.length - 1 ? '─────────────────────────────────────────\n' : ''}`;
  }).join('\n');
}

function generateHeaderContent(candidateData: CandidateData): string {
  return `${candidateData.fullName}
${candidateData.currentTitle}
${candidateData.yearsOfExperience ? `${candidateData.yearsOfExperience}+ years of experience` : ''}
${candidateData.location || ''}`;
}

function generateFunctionalSkillsContent(candidateData: CandidateData, template?: string): string {
  if (!candidateData.skills || candidateData.skills.length === 0) {
    return 'No functional skills provided';
  }
  
  // Antaes template now uses same categorization as Emineon
  if (template === 'antaes') {
  return `**Delivery & Project Management**
• Project planning and execution
• Stakeholder management and communication
• Risk assessment and mitigation strategies
Proven ability to deliver complex projects on time and within budget while maintaining high quality standards.

**Service & Release Management**
• Service lifecycle management
• Release planning and coordination
• Change management processes
Expertise in managing service delivery and coordinating releases across multiple environments.

**Product Management/Owner**
• Product roadmap development
• User story creation and prioritization
• Cross-functional team collaboration
Strong background in product strategy and working with development teams to deliver user-focused solutions.`;
}

  // Default Emineon template structure
  return `**Delivery & Project Management**
• Project planning and execution
• Stakeholder management and communication
• Risk assessment and mitigation strategies
Proven ability to deliver complex projects on time and within budget while maintaining high quality standards.

**Service & Release Management**
• Service lifecycle management
• Release planning and coordination
• Change management processes
Expertise in managing service delivery and coordinating releases across multiple environments.

**Product Management/Owner**
• Product roadmap development
• User story creation and prioritization
• Cross-functional team collaboration
Strong background in product strategy and working with development teams to deliver user-focused solutions.`;
}

function generateTechnicalSkillsContent(candidateData: CandidateData, template?: string): string {
  if (!candidateData.skills || candidateData.skills.length === 0) {
    return 'No technical skills provided';
  }
  
  // Categorize technical skills with explanatory text
  const skills = candidateData.skills;
  return `**Programming & Development**
• ${skills.filter(skill => 
    skill.toLowerCase().includes('javascript') || 
    skill.toLowerCase().includes('python') || 
    skill.toLowerCase().includes('java') ||
    skill.toLowerCase().includes('react') ||
    skill.toLowerCase().includes('node')
  ).join('\n• ') || 'Modern programming languages and frameworks'}
Extensive experience in full-stack development with focus on scalable, maintainable code.

**Cloud & Infrastructure**
• ${skills.filter(skill => 
    skill.toLowerCase().includes('aws') || 
    skill.toLowerCase().includes('azure') || 
    skill.toLowerCase().includes('docker') ||
    skill.toLowerCase().includes('kubernetes')
  ).join('\n• ') || 'Cloud platforms and containerization technologies'}
Proficient in designing and implementing cloud-native solutions with high availability.

**Data & Analytics**
• ${skills.filter(skill => 
    skill.toLowerCase().includes('sql') || 
    skill.toLowerCase().includes('database') || 
    skill.toLowerCase().includes('analytics')
  ).join('\n• ') || 'Database management and data analysis tools'}
Strong background in data modeling, analysis, and business intelligence solutions.`;
}

function generateAreasOfExpertiseContent(candidateData: CandidateData, template?: string): string {
  // Generate based on candidate's ACTUAL experience and skills only
  const industries = [];
  
  if (candidateData.experience?.some(exp => 
    exp.company.toLowerCase().includes('bank') || 
    exp.company.toLowerCase().includes('financial')
  )) {
    industries.push('Banking & Financial Services');
  }
  
  if (candidateData.experience?.some(exp => 
    exp.company.toLowerCase().includes('health') || 
    exp.company.toLowerCase().includes('medical')
  )) {
    industries.push('Healthcare & Life Sciences');
  }
  
  if (candidateData.skills?.some(skill => 
    skill.toLowerCase().includes('cloud') || 
    skill.toLowerCase().includes('aws') || 
    skill.toLowerCase().includes('azure')
  )) {
    industries.push('Cloud Computing & Digital Transformation');
  }
  
  // Only add generic industries if we have no actual data
  if (industries.length === 0) {
    // Use their actual job title/field if available
    const title = candidateData.currentTitle?.toLowerCase() || '';
    if (title.includes('engineer') || title.includes('developer')) {
      industries.push('Software Engineering & Development');
    } else if (title.includes('manager') || title.includes('lead')) {
      industries.push('Leadership & Management');
    } else {
      industries.push('Professional Services & Consulting');
    }
  }
  
  return industries.join('\n');
}

function generateSummaryContent(candidateData: CandidateData): string {
  // Generate ONLY truthful content based on actual CV data
  const experience = candidateData.yearsOfExperience || 'Multiple';
  const title = candidateData.currentTitle || 'Professional';
  const skills = candidateData.skills?.slice(0, 3).join(', ') || 'various professional skills';
  
  // Base summary on actual CV information only
  return `${title} with ${experience} years of professional experience. Demonstrated expertise in ${skills}. Professional background includes experience across ${candidateData.experience?.length || 1} organization${(candidateData.experience?.length || 1) > 1 ? 's' : ''}, with a focus on applying technical skills and knowledge to deliver results in professional environments.`;
}

function generateExperienceContent(candidateData: CandidateData): string {
  return generateExperienceBlocks(candidateData);
}

function generateExperiencesSummaryContent(candidateData: CandidateData): string {
  if (!candidateData.experience || candidateData.experience.length === 0) {
    return 'No professional experience provided';
  }
  
  return candidateData.experience.map(exp => {
    const duration = `${exp.startDate} - ${exp.endDate}`;
    return `${exp.title} – ${exp.company} (${duration})`;
  }).join('\n');
}

function generateEducationContent(candidateData: CandidateData): string {
  if (!candidateData.education || candidateData.education.length === 0) {
    return 'No education provided';
  }
  
  return candidateData.education.map(edu => `• ${edu}`).join('\n');
}

function generateCertificationsContent(candidateData: CandidateData): string {
  if (!candidateData.certifications || candidateData.certifications.length === 0) {
    return 'No certifications provided';
  }
  
  return candidateData.certifications.map(cert => `• ${cert}`).join('\n');
}

function generateLanguagesContent(candidateData: CandidateData): string {
  if (!candidateData.languages || candidateData.languages.length === 0) {
    return 'English (Native)';
  }
  
  return candidateData.languages.join(' | ');
}

function generateTechnicalEnvironment(skills: string[]): string {
  if (!skills || skills.length === 0) {
    return '• Modern development tools and methodologies\n• Agile/Scrum frameworks\n• Collaborative development environments';
  }
  
  return skills.slice(0, 6).map(skill => `• ${skill}`).join('\n');
}

function generateInitialContent(candidateData: CandidateData): string {
  const experienceBlocks = generateExperienceBlocks(candidateData);
  
  return `
COMPETENCE FILE
═══════════════════════════════════════

👤 PERSONAL INFORMATION
═══════════════════════════════════════
Name: ${candidateData.fullName}
Title: ${candidateData.currentTitle}
Email: ${candidateData.email || 'Not provided'}
Phone: ${candidateData.phone || 'Not provided'}
Location: ${candidateData.location || 'Not provided'}
Experience: ${candidateData.yearsOfExperience}+ years

📝 PROFESSIONAL SUMMARY
═══════════════════════════════════════
${candidateData.summary || `Experienced ${candidateData.currentTitle} with ${candidateData.yearsOfExperience}+ years of progressive experience in delivering innovative solutions and driving organizational growth.`}

💼 WORK EXPERIENCE
═══════════════════════════════════════
${experienceBlocks}

🎯 TECHNICAL SKILLS
═══════════════════════════════════════
${candidateData.skills && candidateData.skills.length > 0 
  ? candidateData.skills.map(skill => `• ${skill}`).join('\n')
  : 'No skills provided'
}

🎓 EDUCATION
═══════════════════════════════════════
${candidateData.education && candidateData.education.length > 0
  ? candidateData.education.map(edu => `• ${edu}`).join('\n')
  : 'No education provided'
}

🏆 CERTIFICATIONS
═══════════════════════════════════════
${candidateData.certifications && candidateData.certifications.length > 0
  ? candidateData.certifications.map(cert => `• ${cert}`).join('\n')
  : 'No certifications provided'
}

🌐 LANGUAGES
═══════════════════════════════════════
${candidateData.languages && candidateData.languages.length > 0
  ? candidateData.languages.map(lang => `• ${lang}`).join('\n')
  : 'No languages provided'
}
`;
}

// FACTUAL CONTENT GENERATOR - Only uses verifiable CV data
function generateFactualContent(sectionType: string, candidateData: CandidateData): string {
  switch (sectionType) {
    case 'header':
      return generateHeaderContent(candidateData);
      
    case 'summary':
      // Only use actual information from CV
      const experience = candidateData.yearsOfExperience || 'Multiple';
      const title = candidateData.currentTitle || 'Professional';
      const topSkills = candidateData.skills?.slice(0, 3).join(', ') || 'various professional skills';
      
      return `${title} with ${experience} years of professional experience. Demonstrated expertise in ${topSkills}. Proven track record of delivering professional responsibilities and contributing to organizational objectives through practical application of skills and knowledge.`;
      
    case 'functional-skills':
      return generateFunctionalSkillsContent(candidateData);
      
    case 'technical-skills':
      return generateTechnicalSkillsContent(candidateData);
      
    case 'areas-of-expertise':
      return generateAreasOfExpertiseContent(candidateData);
      
    case 'education':
      return generateEducationContent(candidateData);
      
    case 'certifications':
      return generateCertificationsContent(candidateData);
      
    case 'languages':
      return generateLanguagesContent(candidateData);
      
    case 'experiences-summary':
      return generateExperiencesSummaryContent(candidateData);
      
    default:
      return 'Professional information available upon request.';
  }
}

// Function to generate content for a specific section with AI enrichment
async function generateSectionContentWithAI(sectionType: string, candidateData: CandidateData, template?: string, jobDescription?: JobDescription, getToken?: () => Promise<string | null>): Promise<string> {
  // Always try AI enrichment - no fallbacks to basic content
  if (!getToken) {
    throw new Error('AI content generation requires authentication');
  }
  
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not available for AI content generation');
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
      sessionId, // Add session ID for backend tracking
      clientTimestamp: requestTimestamp
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
      throw new Error(`AI service returned ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const responseData = await response.json();
    const suggestion = responseData.suggestion;
    const responseSessionId = responseData.sessionId;
    const responseTimestamp = responseData.timestamp;
    
    if (!suggestion || !suggestion.trim()) {
      console.error(`❌ [${sectionType}] [SESSION: ${sessionId}] Empty response from AI service`);
      throw new Error('AI service returned empty content');
    }

    // Validate response matches request
    if (responseData.sectionType !== sectionType) {
      console.error(`❌ [${sectionType}] [SESSION: ${sessionId}] Section type mismatch! Expected: ${sectionType}, Got: ${responseData.sectionType}`);
      throw new Error(`Section type mismatch in AI response`);
    }
    
    console.log(`✅ [${sectionType}] [SESSION: ${sessionId}] AI content generated successfully:`, {
      length: suggestion.length,
      preview: suggestion.substring(0, 100) + '...',
      responseSessionId,
      responseTimestamp,
      latency: responseTimestamp ? responseTimestamp - requestTimestamp : 'unknown'
    });

    // Validate content uniqueness (basic check)
    if (suggestion.toLowerCase().includes('comprehensive academic foundation')) {
      console.warn(`⚠️ [${sectionType}] [SESSION: ${sessionId}] Detected potentially generic content`);
    }
    
    // Add delay to ensure proper separation between requests
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return suggestion;
  } catch (error) {
    console.error(`💥 [${sectionType}] AI generation failed:`, error);
    // Return error message instead of fallback content
    return `⚠️ AI content generation failed for the ${sectionType} section. Please try refreshing or contact support if the issue persists.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Function to generate content for a specific section (fallback/basic version)
function generateSectionContent(sectionType: string, candidateData: CandidateData, template?: string): string {
  switch (sectionType) {
    case 'header':
      return generateHeaderContent(candidateData);
    case 'summary':
      return generateSummaryContent(candidateData);
    case 'functional-skills':
      return generateFunctionalSkillsContent(candidateData, template);
    case 'technical-skills':
      return generateTechnicalSkillsContent(candidateData, template);
    case 'areas-of-expertise':
      return generateAreasOfExpertiseContent(candidateData, template);
    case 'experience':
      return generateExperienceContent(candidateData);
    case 'experiences-summary':
      return generateExperiencesSummaryContent(candidateData);
    case 'education':
      return generateEducationContent(candidateData);
    case 'certifications':
      return generateCertificationsContent(candidateData);
    case 'languages':
      return generateLanguagesContent(candidateData);
    default:
      return '';
  }
}

// Function to create separate experience sections with detailed structure
function createExperienceSections(candidateData: CandidateData): DocumentSection[] {
  if (!candidateData.experience || candidateData.experience.length === 0) {
    return [{
      id: 'experience-1',
      type: 'experience',
      title: 'PROFESSIONAL EXPERIENCES',
      content: 'No work experience provided.',
      visible: true,
      order: 5,
      editable: true
    }];
  }

  return candidateData.experience.map((exp, index) => {
    const duration = `${exp.startDate} - ${exp.endDate}`;
    
    // Enhanced experience block structure according to specifications
    const content = `**${exp.company}**
${exp.title}
${duration}

**Company Description/Context**
${generateCompanyDescription(exp.company, candidateData)}

    **Responsibilities**
    ${formatResponsibilities(exp.responsibilities)}
    
    **Professional Contributions**
    ${extractActualAchievements(exp, candidateData)}
    
    **Technical Environment**
${generateTechnicalEnvironment(candidateData.skills || [])}`;

    return {
      id: `experience-${index + 1}`,
      type: 'experience',
      title: `PROFESSIONAL EXPERIENCES`,
      content,
      visible: true,
      order: 5 + index,
      editable: true
    };
  });
}

// Helper functions for experience sections
function generateCompanyDescription(company: string, candidateData: CandidateData): string {
  // Generate contextual company description
  if (company.toLowerCase().includes('bank') || company.toLowerCase().includes('financial')) {
    return 'Leading financial services organization focused on digital transformation and customer-centric solutions.';
  } else if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('software')) {
    return 'Innovative technology company specializing in cutting-edge software solutions and digital products.';
  } else if (company.toLowerCase().includes('consulting')) {
    return 'Premier consulting firm providing strategic advisory services and technology implementation solutions.';
  } else {
    return 'Dynamic organization focused on innovation, growth, and delivering exceptional value to clients and stakeholders.';
  }
}

function formatResponsibilities(responsibilities: string): string {
  // Split responsibilities into bullet points
  const respArray = responsibilities.split(/[.!]/).filter(r => r.trim().length > 10);
  return respArray.map(resp => `• ${resp.trim()}`).join('\n');
}

function extractActualAchievements(experience: any, candidateData: CandidateData): string {
  // Extract achievements only from actual CV data - no fabrication
  const achievements: string[] = [];
  
  // Only include verifiable information from their actual responsibilities
  if (experience.responsibilities) {
    const responsibilities = experience.responsibilities.toLowerCase();
    
    // Look for achievement-indicating words in their actual responsibilities
    if (responsibilities.includes('led') || responsibilities.includes('managed')) {
      achievements.push('Demonstrated leadership and management capabilities in professional role');
    }
    
    if (responsibilities.includes('developed') || responsibilities.includes('created')) {
      achievements.push('Applied development and creative skills in project execution');
    }
    
    if (responsibilities.includes('improved') || responsibilities.includes('enhanced')) {
      achievements.push('Contributed to process and quality improvements');
    }
    
    // Only mention skills that are actually in their profile
    const relevantSkills = candidateData.skills?.filter(skill => 
      responsibilities.includes(skill.toLowerCase())
    ) || [];
    
    if (relevantSkills.length > 0) {
      achievements.push(`Applied expertise in ${relevantSkills.slice(0, 3).join(', ')}`);
    }
  }
  
  // If no specific achievements can be extracted, use general professional statement
  if (achievements.length === 0) {
    achievements.push('Delivered professional responsibilities in accordance with role requirements');
  }
  
  return achievements.map(achievement => `• ${achievement}`).join('\n');
}

// Simple Error Boundary Component
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function CreateCompetenceFileModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedCandidate 
}: CreateCompetenceFileModalProps) {
  const { getToken } = useAuth();
  
  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMethod, setInputMethod] = useState<'file' | 'text' | 'url'>('file');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
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
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false); // New state to track AI initialization
  const [generationProgress, setGenerationProgress] = useState<{completed: number, total: number, current: string}>({completed: 0, total: 0, current: ''});
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom functionality
  const [isJobDescriptionExpanded, setIsJobDescriptionExpanded] = useState(false);
  const [customElements, setCustomElements] = useState<string[]>([]);
  const [newElementInput, setNewElementInput] = useState('');
  
  // Manager contact details
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobFileInputRef = useRef<HTMLInputElement>(null);
  const hasGeneratedContentRef = useRef<string | null>(null); // Track generation key to prevent duplicates
  
  // Get template-specific section titles
  const getSectionTitles = (template: string) => {
    if (template === 'antaes') {
      return {
        header: 'CANDIDATE PROFILE',
        summary: 'EXECUTIVE SUMMARY', 
        'functional-skills': 'CORE COMPETENCIES',
        'technical-skills': 'TECHNICAL EXPERTISE',
        'areas-of-expertise': 'AREAS OF EXPERTISE',
        education: 'ACADEMIC BACKGROUND',
        certifications: 'PROFESSIONAL CERTIFICATIONS',
        languages: 'LANGUAGES',
        'experiences-summary': 'PROFESSIONAL EXPERIENCE OVERVIEW'
      };
    }
    // Default titles for other templates
    return {
      header: 'HEADER',
      summary: 'PROFESSIONAL SUMMARY',
      'functional-skills': 'FUNCTIONAL SKILLS',
      'technical-skills': 'TECHNICAL SKILLS', 
      'areas-of-expertise': 'AREAS OF EXPERTISE',
      education: 'EDUCATION',
      certifications: 'CERTIFICATIONS',
      languages: 'LANGUAGES',
      'experiences-summary': 'PROFESSIONAL EXPERIENCES SUMMARY'
    };
  };

  // Job Description Handlers
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
    setIsParsing(true);
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
      alert('Failed to transcribe audio. Please try typing the job description instead.');
    } finally {
      setIsParsing(false);
    }
  };
  
  // Pre-populate sections when candidate data changes
  // Note: Old useEffect removed - AI generation now happens in handleContinueToEditor
  
  // Reset generation tracker when modal closes or candidate changes
  useEffect(() => {
    if (!isOpen) {
      hasGeneratedContentRef.current = null;
    }
  }, [isOpen, selectedCandidate?.id]);
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  const handleZoomReset = () => {
    setZoomLevel(100);
  };
  
  // Custom elements handlers
  const addCustomElement = () => {
    if (newElementInput.trim() && !customElements.includes(newElementInput.trim())) {
      setCustomElements(prev => [...prev, newElementInput.trim()]);
      setNewElementInput('');
    }
  };

  const removeCustomElement = (element: string) => {
    setCustomElements(prev => prev.filter(el => el !== element));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomElement();
    }
  };
  
  // Generic AI processing function for all sections
  const handleAIProcessAllSections = useCallback(async (type: 'improve' | 'expand' | 'rewrite') => {
    if (!selectedCandidate) return;
    
    setIsGenerating(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      console.log(`🤖 Starting AI ${type} for all sections...`);
      
      // Get all visible sections that have content
      const sectionsToProcess = documentSections.filter(section => 
        section.visible && section.content && section.content.trim().length > 0
      );
      
      // Process sections in parallel for better performance
      const processingPromises = sectionsToProcess.map(async (section) => {
        try {
          const response = await fetch('/api/ai/generate-suggestion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              type,
              sectionType: section.type,
              currentContent: section.content,
              candidateData: selectedCandidate,
              jobDescription: jobDescription.text ? jobDescription : undefined,
            }),
          });
          
          if (response.ok) {
            const { suggestion } = await response.json();
            return { sectionId: section.id, suggestion };
          } else {
            console.error(`Failed to ${type} section ${section.type}`);
            return null;
          }
        } catch (error) {
          console.error(`Error ${type}ing section ${section.type}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(processingPromises);
      
      // Update sections with processed content
      const successfulUpdates = results.filter(result => result !== null);
      
      if (successfulUpdates.length > 0) {
        setDocumentSections(prev => 
          prev.map(section => {
            const update = successfulUpdates.find(upd => upd.sectionId === section.id);
            return update 
              ? { ...section, content: update.suggestion }
              : section;
          })
        );
        
        console.log(`✅ Successfully ${type}d ${successfulUpdates.length} sections`);
        
        // Show success feedback
        setLastSaved(new Date());
      } else {
        console.warn(`⚠️ No sections were ${type}d`);
      }
      
    } catch (error) {
      console.error(`💥 AI ${type} error:`, error);
      alert(`Failed to ${type} sections. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCandidate, documentSections, getToken]);

  // AI Improve All functionality
  const handleImproveAll = useCallback(async () => {
    await handleAIProcessAllSections('improve');
  }, [handleAIProcessAllSections]);

  // AI Expand All functionality
  const handleExpandAll = useCallback(async () => {
    await handleAIProcessAllSections('expand');
  }, [handleAIProcessAllSections]);

  // AI Rewrite All functionality
  const handleRewriteAll = useCallback(async () => {
    await handleAIProcessAllSections('rewrite');
  }, [handleAIProcessAllSections]);
  
  // Drag and drop handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setDocumentSections((sections) => {
        const oldIndex = sections.findIndex(section => section.id === active.id);
        const newIndex = sections.findIndex(section => section.id === over.id);
        
        const newSections = arrayMove(sections, oldIndex, newIndex);
        
        // Update order property
        return newSections.map((section, index) => ({
          ...section,
          order: index
        }));
      });
    }
  }, []);
  
  // File upload handling
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, Word document, or text file');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      const formData = new FormData();
      formData.append('file', file);

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
      setCurrentStep(2);
      
    } catch (error) {
      console.error('File parsing error:', error);
      alert(`Failed to parse CV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [getToken]);
  
  // Dropzone configuration for file upload
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Create a proper file input event
        const fileInput = fileInputRef.current;
        if (fileInput) {
          // Create a new FileList-like object
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInput.files = dt.files;
          
          // Create a proper event
          const event = new Event('change', { bubbles: true });
          Object.defineProperty(event, 'target', { value: fileInput, enumerable: true });
          await handleFileSelect(event as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }
    }, [handleFileSelect]),
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/html': ['.html']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
    disabled: isParsing
  });
  
  // Text parsing
  const handleTextParse = useCallback(async () => {
    if (!textInput.trim()) return;
    
    setIsParsing(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      console.log('🔄 Starting text parsing...', { textLength: textInput.length });
      
      const response = await fetch('/api/competence-files/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textInput }),
      });
      
      console.log('📡 Response received:', { 
        status: response.status, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        
        let errorMessage = 'Failed to parse text';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If not JSON, use the raw text
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ Parse result:', result);
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from text');
      }
      
      setSelectedCandidate(newCandidate);
      setCurrentStep(2);
      console.log('✅ Text parsing completed successfully');
      
    } catch (error) {
      console.error('💥 Text parsing error:', error);
      
      // Provide more specific error messages
      let userMessage = 'Failed to parse text. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          userMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('Could not extract')) {
          userMessage = 'Could not extract candidate information. Please ensure the text contains clear candidate details.';
        } else if (error.message.includes('Invalid response')) {
          userMessage = 'Server response was invalid. Please try again.';
        } else if (error.message !== 'Failed to parse text') {
          userMessage = error.message;
        }
      }
      
      alert(userMessage);
    } finally {
      setIsParsing(false);
    }
  }, [textInput, getToken]);
  
  // URL parsing
  const handleUrlParse = useCallback(async () => {
    if (!urlInput.trim()) return;
    
    setIsParsing(true);
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication token not available');
      }
      
      console.log('🔗 Starting URL parsing...', { url: urlInput });
      
      const response = await fetch('/api/competence-files/parse-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: urlInput }),
      });
      
      console.log('📡 URL parse response:', { 
        status: response.status, 
        statusText: response.statusText 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ URL parsing failed:', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        
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
      console.log('✅ URL parse result:', result);
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from LinkedIn profile');
      }
      
      setSelectedCandidate(newCandidate);
      setCurrentStep(2);
      console.log('✅ URL parsing completed successfully');
      
    } catch (error) {
      console.error('💥 URL parsing error:', error);
      
      let userMessage = 'Failed to parse LinkedIn URL. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          userMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('Could not extract')) {
          userMessage = 'Could not extract candidate information. Please ensure the LinkedIn URL is valid and accessible.';
        } else if (error.message.includes('Invalid response')) {
          userMessage = 'Server response was invalid. Please try again.';
        } else if (error.message.includes('Invalid URL')) {
          userMessage = 'Please enter a valid LinkedIn profile URL.';
        } else if (error.message !== 'Failed to parse LinkedIn URL') {
          userMessage = error.message;
        }
      }
      
      alert(userMessage);
    } finally {
      setIsParsing(false);
    }
  }, [urlInput, getToken]);
  
  // Section management
  const toggleSectionVisibility = useCallback((sectionId: string) => {
    setDocumentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  }, []);
  
  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setDocumentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, content }
          : section
      )
    );
  }, []);
  
  const addCustomSection = useCallback(() => {
    const newSection: DocumentSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'Custom Section',
      content: '',
      visible: true,
      order: documentSections.length,
      editable: true,
    };
    setDocumentSections(prev => [...prev, newSection]);
  }, [documentSections.length]);
  
  // Save functionality (saves draft to database)
  const handleSave = useCallback(async () => {
    if (!selectedCandidate || isAutoSaving) return;
    
    setIsAutoSaving(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/competence-files/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateData: selectedCandidate,
        template: selectedTemplate,
          sections: documentSections.filter(s => s.visible),
          format: 'draft', // Special format for saving drafts
          jobDescription: jobDescription.text ? jobDescription : undefined,
          saveOnly: true, // Flag to indicate this is a save operation, not generation
          managerContact: {
            name: managerName,
            email: managerEmail,
            phone: managerPhone,
          },
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastSaved(new Date());
        
        // Don't show alert or call onSuccess for auto-saves to prevent loop
        // Only show success for manual saves
        console.log('Draft auto-saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      // Don't show error alerts for auto-saves to prevent loops
      // Only log the error for debugging
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedCandidate, selectedTemplate, documentSections, jobDescription, getToken, managerName, managerEmail, managerPhone]);

  // Manual save function that shows user feedback
  const handleManualSave = useCallback(async () => {
    if (!selectedCandidate || isAutoSaving) return;
    
    setIsAutoSaving(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/competence-files/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateData: selectedCandidate,
          template: selectedTemplate,
          sections: documentSections.filter(s => s.visible),
          format: 'draft',
          jobDescription: jobDescription.text ? jobDescription : undefined,
          saveOnly: true,
          managerContact: {
            name: managerName,
            email: managerEmail,
            phone: managerPhone,
          },
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setLastSaved(new Date());
        alert('Draft saved successfully!');
        onSuccess('Draft saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert(`Failed to save draft: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedCandidate, selectedTemplate, documentSections, jobDescription, getToken, onSuccess, managerName, managerEmail, managerPhone]);
  
  // Generate final document
  const handleGenerateDocument = useCallback(async (format: 'pdf' | 'docx') => {
    if (!selectedCandidate) return;
    
    setIsGenerating(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/competence-files/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateData: selectedCandidate,
          template: selectedTemplate,
          sections: documentSections.filter(s => s.visible),
          format,
          jobDescription: jobDescription.text ? jobDescription : undefined,
          managerContact: {
            name: managerName,
            email: managerEmail,
            phone: managerPhone,
          },
        }),
      });
      
      if (response.ok) {
        // Handle direct file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${selectedCandidate.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Competence_File.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Call success callback and close modal for PDF generation
        onSuccess('File downloaded successfully');
        onClose();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCandidate, selectedTemplate, documentSections, getToken, onSuccess, onClose, managerName, managerEmail, managerPhone]);
  
  // Auto-save effect with debounce - DISABLED to prevent loops
  // useEffect(() => {
  //   if (currentStep === 4 && selectedCandidate && !isAutoSaving) {
  //     const interval = setInterval(() => {
  //       if (!isAutoSaving) {
  //         handleSave();
  //       }
  //     }, 30000); // Auto-save every 30 seconds
  //     return () => clearInterval(interval);
  //   }
  // }, [currentStep, selectedCandidate, handleSave, isAutoSaving]);
  
  // Handle Continue to Editor with AI Pre-generation
  const handleContinueToEditor = async () => {
    if (!selectedCandidate || !jobDescription.text.trim()) return;
    
    setIsInitializing(true);
    setGenerationProgress({completed: 0, total: 9, current: 'Starting AI generation...'});
    
    try {
      // Generate content for all sections BEFORE moving to editor
      console.log('🚀 Pre-generating AI content in PARALLEL for maximum speed...');
      
      // Get template-specific section titles
      const sectionTitles = getSectionTitles(selectedTemplate);
      
      // Create separate experience sections
      const experienceSections = createExperienceSections(selectedCandidate);
      
      // Define base sections structure
      const baseSectionStructures = [
        { id: 'header', type: 'header', title: sectionTitles.header, visible: true, order: 0, editable: true },
        { id: 'summary', type: 'summary', title: sectionTitles.summary, visible: true, order: 1, editable: true },
        { id: 'functional-skills', type: 'functional-skills', title: sectionTitles['functional-skills'], visible: true, order: 2, editable: true },
        { id: 'technical-skills', type: 'technical-skills', title: sectionTitles['technical-skills'], visible: true, order: 3, editable: true },
        { id: 'areas-of-expertise', type: 'areas-of-expertise', title: sectionTitles['areas-of-expertise'], visible: true, order: 4, editable: true },
        { id: 'education', type: 'education', title: sectionTitles.education, visible: true, order: 5, editable: true },
        { id: 'certifications', type: 'certifications', title: sectionTitles.certifications, visible: true, order: 6, editable: true },
        { id: 'languages', type: 'languages', title: sectionTitles.languages, visible: true, order: 7, editable: true },
        { id: 'experiences-summary', type: 'experiences-summary', title: sectionTitles['experiences-summary'], visible: true, order: 8, editable: true },
      ];
      
      // Update progress total
      setGenerationProgress({completed: 0, total: baseSectionStructures.length, current: 'Initializing AI generation...'});
      
      // Generate content for ALL sections in PARALLEL - no sequential delays!
      console.log(`🤖 Running ${baseSectionStructures.length} AI generation requests in PARALLEL...`);
      
      const contentGenerationPromises = baseSectionStructures.map(async (sectionStructure, index) => {
        try {
          console.log(`🚀 [${index + 1}/${baseSectionStructures.length}] Starting AI generation for: ${sectionStructure.type}`);
          
          const content = await generateSectionContentWithAI(
            sectionStructure.type, 
            selectedCandidate, 
            selectedTemplate, 
            jobDescription.text ? jobDescription : undefined,
            getToken
          );
          
          console.log(`✅ [${index + 1}/${baseSectionStructures.length}] AI content generated for: ${sectionStructure.type}`);
          
          return {
            ...sectionStructure,
            content
          };
          
        } catch (error) {
          console.error(`❌ AI generation failed for ${sectionStructure.type}:`, error);
          
          // CRITICAL: If AI fails, we must still provide content but it should be factual
          const factualContent = generateFactualContent(sectionStructure.type, selectedCandidate);
          
          return {
            ...sectionStructure,
            content: factualContent
          };
        }
      });
      
      // Wait for ALL AI generations to complete in parallel
      console.log('⏳ Waiting for all AI generations to complete...');
      const updatedBaseSections = await Promise.all(contentGenerationPromises);
      console.log('✅ All AI generations completed!');
      
      // Update experience sections to have orders starting after the base sections
      const updatedExperienceSections = experienceSections.map((section, index) => ({
        ...section,
        order: 9 + index // Start after the 9 base sections (0-8)
      }));
      
      // Combine base sections with experience sections
      const allSections = [
        ...updatedBaseSections.slice(0, 5), // header, summary, functional-skills, technical-skills, areas-of-expertise
        ...updatedBaseSections.slice(5), // education, certifications, languages, experiences-summary
        ...updatedExperienceSections // individual experience blocks
      ];
      
      // Set the generated sections
      setDocumentSections(allSections);
      console.log('✅ All content pre-generated successfully, moving to editor');
      
      // Move to step 4 only after all content is generated
      setCurrentStep(4);
      
    } catch (error) {
      console.error('💥 Critical error during content pre-generation:', error);
      alert(`Failed to generate AI content. Please check your internet connection and try again.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsInitializing(false);
    }
  };
  
  // Initialize content when step 4 is reached - but only generate AI content once per session
  useEffect(() => {
    if (currentStep !== 4 || !selectedCandidate || !isOpen) return;
    
    // Create a unique key for this generation session
    const generationKey = `${selectedCandidate.id}-${selectedTemplate}-${jobDescription.text.substring(0, 50)}`;
    
    // Check if we've already generated content for this exact combination
    if (hasGeneratedContentRef.current === generationKey) {
      console.log('🔄 Content already generated for this session, skipping re-generation');
      return;
    }

    // Check if sections are already populated (from pre-generation)
    if (documentSections.length > 0 && documentSections.some(s => s.content && s.content.trim().length > 0)) {
      console.log('🔄 Sections already populated with content, skipping initialization');
      hasGeneratedContentRef.current = generationKey;
      return;
    }

    // Only initialize if no content exists yet
    console.log('🔄 Step 4 reached without pre-generated content, initializing with basic structure...');
    
    // Get template-specific section titles
    const sectionTitles = getSectionTitles(selectedTemplate);
    
    // Create separate experience sections
    const experienceSections = createExperienceSections(selectedCandidate);
    
    // Create basic structure with placeholder content (will be replaced by AI if available)
    const baseSectionStructures = [
      { id: 'header', type: 'header', title: sectionTitles.header, visible: true, order: 0, editable: true },
      { id: 'summary', type: 'summary', title: sectionTitles.summary, visible: true, order: 1, editable: true },
      { id: 'functional-skills', type: 'functional-skills', title: sectionTitles['functional-skills'], visible: true, order: 2, editable: true },
      { id: 'technical-skills', type: 'technical-skills', title: sectionTitles['technical-skills'], visible: true, order: 3, editable: true },
      { id: 'areas-of-expertise', type: 'areas-of-expertise', title: sectionTitles['areas-of-expertise'], visible: true, order: 4, editable: true },
      { id: 'education', type: 'education', title: sectionTitles.education, visible: true, order: 5, editable: true },
      { id: 'certifications', type: 'certifications', title: sectionTitles.certifications, visible: true, order: 6, editable: true },
      { id: 'languages', type: 'languages', title: sectionTitles.languages, visible: true, order: 7, editable: true },
      { id: 'experiences-summary', type: 'experiences-summary', title: sectionTitles['experiences-summary'], visible: true, order: 8, editable: true },
    ];

    // Add basic content structure
    const baseSectionsWithContent = baseSectionStructures.map(section => ({
      ...section,
      content: generateSectionContent(section.type, selectedCandidate, selectedTemplate)
    }));

    // Update experience sections to have orders starting after the base sections
    const updatedExperienceSections = experienceSections.map((section, index) => ({
      ...section,
      order: 9 + index // Start after the 9 base sections (0-8)
    }));
    
    // Combine base sections with experience sections
    const allSections = [
      ...baseSectionsWithContent.slice(0, 5), // header, summary, functional-skills, technical-skills, areas-of-expertise
      ...baseSectionsWithContent.slice(5), // education, certifications, languages, experiences-summary
      ...updatedExperienceSections // individual experience blocks
    ];
    
    setDocumentSections(allSections);
    hasGeneratedContentRef.current = generationKey;
    console.log('✅ Basic structure initialized for editor');
  }, [isOpen, selectedCandidate, currentStep, selectedTemplate, getToken]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg flex flex-col ${ 
        currentStep === 4 
          ? 'w-full h-full m-0 rounded-none' // Full screen for editor
          : 'w-full max-w-6xl h-[90vh] m-4' // Fixed height for steps 1-3
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Create Competence File</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
                <span className="text-sm">Upload</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
                <span className="text-sm">Template</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
                <span className="text-sm">Job</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>4</div>
                <span className="text-sm">Edit</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Step 1: Upload/Input */}
          {currentStep === 1 && (
            <div className="h-full overflow-y-auto">
              <div className="p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Candidate Information</h3>
                    <p className="text-gray-600">Choose how you'd like to add candidate information</p>
                  </div>
                  
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => setInputMethod('file')}
                      variant={inputMethod === 'file' ? 'primary' : 'outline'}
                      className="flex-1 max-w-xs"
                    >
                      Upload File
                    </Button>
                    <Button
                      onClick={() => setInputMethod('text')}
                      variant={inputMethod === 'text' ? 'primary' : 'outline'}
                      className="flex-1 max-w-xs"
                    >
                      Paste Text
                    </Button>
                    <Button
                      onClick={() => setInputMethod('url')}
                      variant={inputMethod === 'url' ? 'primary' : 'outline'}
                      className="flex-1 max-w-xs"
                    >
                      LinkedIn URL
                    </Button>
                  </div>
                  
                  {inputMethod === 'file' && (
                    <div 
                      {...getRootProps()} 
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : isDragReject 
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 hover:border-gray-400'
                      } ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        {...getInputProps()}
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.html,.md"
                        className="hidden"
                        disabled={isParsing}
                      />
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${
                        isDragActive ? 'text-blue-500' : isDragReject ? 'text-red-500' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg font-medium mb-2 ${
                        isDragActive ? 'text-blue-900' : isDragReject ? 'text-red-900' : 'text-gray-900'
                      }`}>
                        {isDragActive ? 'Drop your resume here!' : 'Upload Resume/CV'}
                      </p>
                      <p className={`mb-4 ${
                        isDragActive ? 'text-blue-700' : isDragReject ? 'text-red-700' : 'text-gray-600'
                      }`}>
                        {isDragReject 
                          ? 'File type not supported' 
                          : 'Drag & drop or click to browse • PDF, DOC, DOCX, TXT, HTML, MD files • Max 25MB'
                        }
                      </p>
                      {!isDragActive && !isParsing && (
                        <Button onClick={() => fileInputRef.current?.click()} disabled={isParsing}>
                          {isParsing ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            'Choose File'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {inputMethod === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste Resume/CV Text
                      </label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste the candidate's resume or CV text here..."
                        className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button 
                        onClick={handleTextParse}
                        disabled={!textInput.trim() || isParsing}
                        className="w-full mt-4"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Parsing...
                          </>
                        ) : (
                          'Parse Text'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {inputMethod === 'url' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button 
                        onClick={handleUrlParse}
                        disabled={!urlInput.trim() || isParsing}
                        className="w-full mt-4"
                      >
                        {isParsing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Parsing...
                          </>
                        ) : (
                          'Parse LinkedIn Profile'
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {isParsing && (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Processing candidate information...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Template & Section Selection */}
          {currentStep === 2 && selectedCandidate && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Your Competence File</h3>
                      <p className="text-gray-600">Choose a template and select which sections to include</p>
                    </div>
                    
                    {/* Candidate Info */}
                    <Card className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {selectedCandidate.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{selectedCandidate.fullName}</h4>
                          <p className="text-gray-600">{selectedCandidate.currentTitle}</p>
                          <p className="text-sm text-gray-500">{selectedCandidate.location}</p>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Template Selection */}
                    <Card className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Choose Template</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {(['emineon', 'antaes', 'professional', 'modern', 'minimal'] as const).map((template) => (
                          <button
                            key={template}
                            onClick={() => setSelectedTemplate(template)}
                            className={`p-4 border-2 rounded-lg text-left transition-colors h-32 flex flex-col ${
                              selectedTemplate === template
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium capitalize mb-2 flex items-center gap-1 flex-wrap">
                              {template === 'emineon' && (
                                <Sparkles className="h-4 w-4 text-blue-600" />
                              )}
                              {template === 'antaes' && (
                                <div className="h-4 w-4 bg-blue-900 rounded-sm flex items-center justify-center">
                                  <div className="h-2 w-2 bg-white rounded-sm"></div>
                                </div>
                              )}
                              <span className="truncate">{template === 'antaes' ? 'Antaes' : template}</span>
                              {template === 'emineon' && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                  BRANDED
                                </span>
                              )}
                              {template === 'antaes' && (
                                <span className="text-xs bg-blue-900 text-white px-1.5 py-0.5 rounded-full font-medium">
                                  CONSULTING
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 flex-1 overflow-hidden" style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {template === 'emineon' && 'Premium Emineon-branded template with strategic logo placement and professional styling'}
                              {template === 'antaes' && 'Antaes consulting template with minimalist design, blue accents, and partnership excellence branding'}
                              {template === 'professional' && 'Classic layout with traditional formatting'}
                              {template === 'modern' && 'Contemporary design with clean lines'}
                              {template === 'minimal' && 'Simple and focused presentation'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </Card>
                    
                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setCurrentStep(3)}
                      >
                        Continue to Job Description
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Job Description Input */}
          {currentStep === 3 && selectedCandidate && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Job Description</h3>
                      <p className="text-gray-600">Provide the job description to create a targeted competence file</p>
                    </div>
                    
                    {/* Show AI Content Generation Loading Screen */}
                    {isInitializing && (
                      <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
                        <div className="text-center max-w-md mx-auto">
                          <div className="relative">
                            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6 text-blue-600" />
                            <div className="absolute inset-0 h-16 w-16 mx-auto">
                              <div className="h-full w-full border-4 border-blue-200 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            Generating AI-Enhanced Competence File
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Our AI is analyzing the candidate's profile and job description to create personalized, professional content for each section.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-2">✨ AI is creating:</p>
                              <ul className="space-y-1 text-blue-700">
                                <li>• Targeted professional summary</li>
                                <li>• Job-specific skill highlights</li>
                                <li>• Customized areas of expertise</li>
                                <li>• Enhanced experience descriptions</li>
                                <li>• Strategic competence positioning</li>
                              </ul>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-4">
                            This process typically takes 30-60 seconds...
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Candidate Info */}
                    <Card className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {selectedCandidate.fullName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{selectedCandidate.fullName}</h4>
                          <p className="text-gray-600">{selectedCandidate.currentTitle}</p>
                          <p className="text-sm text-gray-500">{selectedTemplate} template selected</p>
                        </div>
                        <div className="text-right">
                          <Briefcase className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-gray-500">Job Targeting</p>
                        </div>
                      </div>
                    </Card>
                    
                    {/* Job Description Input Method Selection */}
                    <Card className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">How would you like to add the job description?</h4>
                      <div className="flex gap-4 justify-center mb-6">
                        <Button
                          onClick={() => setJobInputMethod('text')}
                          variant={jobInputMethod === 'text' ? 'primary' : 'outline'}
                          className="flex-1 max-w-xs"
                        >
                          Type/Paste Text
                        </Button>
                        <Button
                          onClick={() => setJobInputMethod('file')}
                          variant={jobInputMethod === 'file' ? 'primary' : 'outline'}
                          className="flex-1 max-w-xs"
                        >
                          Upload File
                        </Button>
                        <Button
                          onClick={() => setJobInputMethod('voice')}
                          variant={jobInputMethod === 'voice' ? 'primary' : 'outline'}
                          className="flex-1 max-w-xs"
                        >
                          Voice Dictation
                        </Button>
                      </div>
                      
                      {/* Text Input Method */}
                      {jobInputMethod === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Description
                          </label>
                          <textarea
                            value={jobDescription.text}
                            onChange={(e) => setJobDescription(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="Paste the job description here, or start typing to describe the role you're hiring for..."
                            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          {jobDescription.text.trim() && (
                            <Button 
                              onClick={() => parseJobDescription(jobDescription.text)}
                              disabled={isParsing}
                              className="w-full mt-4"
                            >
                              {isParsing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Analyzing Job Description...
                                </>
                              ) : (
                                'Analyze Job Requirements'
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {/* File Upload Method */}
                      {jobInputMethod === 'file' && (
                        <div>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <input
                              type="file"
                              ref={jobFileInputRef}
                              onChange={handleJobFileSelect}
                              accept=".pdf,.doc,.docx,.txt"
                              multiple
                              className="hidden"
                            />
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-lg font-medium text-gray-900 mb-2">Upload Job Description</p>
                            <p className="text-gray-600 mb-4">Supports PDF, DOC, DOCX, TXT files</p>
                            <Button onClick={() => jobFileInputRef.current?.click()}>
                              Choose Files
                            </Button>
                          </div>
                          {jobDescriptionFiles.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-700 mb-2">Selected files:</p>
                              <ul className="space-y-1">
                                {jobDescriptionFiles.map((file, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-center">
                                    <FileText className="h-4 w-4 mr-2" />
                                    {file.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Voice Input Method */}
                      {jobInputMethod === 'voice' && (
                        <div className="text-center">
                          <div className="mb-6">
                            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                              isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                            }`}>
                              {isRecording ? (
                                <MicOff className="h-12 w-12 text-red-600" />
                              ) : (
                                <Mic className="h-12 w-12 text-gray-600" />
                              )}
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">
                              {isRecording ? 'Recording...' : 'Voice Dictation'}
                            </p>
                            <p className="text-gray-600 mb-4">
                              {isRecording ? 'Speak clearly and describe the job requirements' : 'Click to start recording your job description'}
                            </p>
                          </div>
                          
                          <div className="flex gap-4 justify-center">
                            {!isRecording ? (
                              <Button
                                onClick={startVoiceRecording}
                                disabled={isParsing}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Mic className="h-4 w-4 mr-2" />
                                Start Recording
                              </Button>
                            ) : (
                              <Button
                                onClick={stopVoiceRecording}
                                variant="outline"
                                className="border-red-600 text-red-600 hover:bg-red-50"
                              >
                                <MicOff className="h-4 w-4 mr-2" />
                                Stop Recording
                              </Button>
                            )}
                          </div>
                          
                          {isParsing && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-600" />
                                <span className="text-blue-600">Transcribing and analyzing...</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Job Description Preview - Enhanced & Expandable */}
                      {jobDescription.text && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">Job Description Preview</h5>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsJobDescriptionExpanded(!isJobDescriptionExpanded)}
                              className="text-xs"
                            >
                              {isJobDescriptionExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Collapse
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Expand Full Preview
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className={`text-sm text-gray-700 ${
                            isJobDescriptionExpanded 
                              ? 'max-h-96 overflow-y-auto' 
                              : 'max-h-32 overflow-hidden'
                          } transition-all duration-200`}>
                            <div className="whitespace-pre-wrap">
                              {isJobDescriptionExpanded 
                                ? jobDescription.text 
                                : `${jobDescription.text.substring(0, 500)}${jobDescription.text.length > 500 ? '...' : ''}`
                              }
                            </div>
                          </div>
                          
                          {/* Enhanced AI Identified Elements */}
                          {(jobDescription.requirements.length > 0 || jobDescription.skills.length > 0 || jobDescription.responsibilities.length > 0) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-medium text-gray-800">AI Identified Key Elements</p>
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                                  {jobDescription.requirements.length + jobDescription.skills.length + jobDescription.responsibilities.length} elements found
                                </span>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Requirements */}
                                {jobDescription.requirements.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                      Requirements ({jobDescription.requirements.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {jobDescription.requirements.map((req, idx) => (
                                        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md border border-blue-200">
                                          {req}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Skills */}
                                {jobDescription.skills.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                      Skills ({jobDescription.skills.length})
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                      {jobDescription.skills.map((skill, idx) => (
                                        <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md border border-green-200">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Responsibilities */}
                                {jobDescription.responsibilities && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                      Responsibilities
                                    </p>
                                    <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md border border-purple-200">
                                      {jobDescription.responsibilities}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Custom Elements Section */}
                                <div>
                                  <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                    Custom Elements ({customElements.length})
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {customElements.map((element, idx) => (
                                        <span key={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md border border-orange-200 flex items-center">
                                          {element}
                                          <button
                                            onClick={() => removeCustomElement(element)}
                                            className="ml-1 text-orange-600 hover:text-orange-800"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={newElementInput}
                                        onChange={(e) => setNewElementInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Add custom element..."
                                        className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      />
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={addCustomElement}
                                        disabled={!newElementInput.trim()}
                                        className="text-xs"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                    
                    {/* Manager Contact Details */}
                    <Card className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Manager Contact Details</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Add your contact information so clients can reach out to you directly instead of the candidate.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Manager Name
                          </label>
                          <input
                            type="text"
                            value={managerName}
                            onChange={(e) => setManagerName(e.target.value)}
                            placeholder="Your full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={managerEmail}
                            onChange={(e) => setManagerEmail(e.target.value)}
                            placeholder="your.email@company.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={managerPhone}
                            onChange={(e) => setManagerPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {managerName && managerEmail && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-800">
                            ✓ Manager contact details will be included in the competence file
                          </p>
                        </div>
                      )}
                    </Card>
                    
                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        disabled={isInitializing}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Template
                      </Button>
                      <Button
                        onClick={handleContinueToEditor}
                        disabled={!jobDescription.text.trim() || isInitializing}
                      >
                        {isInitializing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generating AI Content...
                          </>
                        ) : (
                          <>
                            Continue to Editor
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 4: Lexical Editor */}
          {currentStep === 4 && selectedCandidate && (
            <div className="flex-1 flex flex-col h-full">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h4 className="font-medium">{selectedCandidate.fullName}</h4>
                    <p className="text-sm text-gray-600">{selectedTemplate} template</p>
                  </div>
                </div>
                
                {/* AI and Zoom Controls */}
                <div className="flex items-center space-x-4">
                  {/* AI Action Buttons */}
                  <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImproveAll}
                    disabled={isGenerating}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                        <Sparkles className="h-4 w-4 mr-2 text-green-600" />
                    )}
                    Improve All
                  </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExpandAll}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2 text-blue-600" />
                      )}
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRewriteAll}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:from-purple-100 hover:to-violet-100"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2 text-purple-600" />
                      )}
                      Rewrite All
                    </Button>
                  </div>
                  
                  {/* Zoom Controls */}
                  <div className="flex items-center space-x-2 bg-white rounded-lg border px-3 py-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                      {zoomLevel}%
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomReset}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualSave}
                      disabled={isAutoSaving}
                      className={isAutoSaving ? "opacity-50" : ""}
                    >
                      {isAutoSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isAutoSaving ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleGenerateDocument('pdf')}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Generate PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateDocument('docx')}
                      disabled={isGenerating}
                    >
                      Generate DOCX
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Editor Content - Full Screen with Zoom */}
              <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="min-h-full p-8">
                  <div 
                    className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8 transition-transform duration-200"
                    style={{ 
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'top center',
                      marginBottom: zoomLevel !== 100 ? `${(zoomLevel - 100) * 2}px` : '0'
                    }}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={documentSections.filter(s => s.visible).map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-8">
                          {documentSections
                            .filter(section => section.visible)
                            .sort((a, b) => a.order - b.order)
                            .map((section) => (
                              <SortableSectionEditor
                                key={section.id}
                                section={section}
                                onUpdate={(content) => updateSectionContent(section.id, content)}
                                onTitleUpdate={(title) => {
                                  setDocumentSections(prev =>
                                    prev.map(s =>
                                      s.id === section.id ? { ...s, title } : s
                                    )
                                  );
                                }}
                                getToken={getToken}
                                candidateData={selectedCandidate}
                                jobDescription={jobDescription}
                              />
                            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 