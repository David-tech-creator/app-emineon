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
  candidateData 
}: {
  section: DocumentSection;
  onUpdate: (content: string) => void;
  onTitleUpdate: (title: string) => void;
  getToken: () => Promise<string | null>;
  candidateData: CandidateData | null;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(section.title);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
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
              const timeoutId = setTimeout(() => {
                editorState.read(() => {
                  try {
                    const root = $getRoot();
                    const textContent = root.getTextContent();
                    onUpdate(textContent);
                  } catch (error) {
                    console.error('Error getting content:', error);
                  }
                });
              }, 500); // 500ms debounce
              
              return () => clearTimeout(timeoutId);
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

function generateFunctionalSkillsContent(candidateData: CandidateData): string {
  if (!candidateData.skills || candidateData.skills.length === 0) {
    return 'No functional skills provided';
  }
  
  // Group skills into functional categories with explanatory text
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

function generateTechnicalSkillsContent(candidateData: CandidateData): string {
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

function generateAreasOfExpertiseContent(candidateData: CandidateData): string {
  // Generate based on candidate's experience and skills
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
  
  // Default industries if none detected
  if (industries.length === 0) {
    industries.push('Information Technology', 'Digital Innovation', 'Enterprise Solutions');
  }
  
  return industries.join('\n');
}

function generateSummaryContent(candidateData: CandidateData): string {
  const experience = candidateData.yearsOfExperience || 5;
  const title = candidateData.currentTitle || 'Professional';
  const skills = candidateData.skills?.slice(0, 3).join(', ') || 'various technologies';
  
  return `Experienced ${title} with ${experience}+ years of progressive experience in delivering innovative solutions and driving organizational growth. Proven track record in ${skills} with strong leadership capabilities and strategic thinking. Demonstrated ability to manage complex projects, lead cross-functional teams, and deliver results in fast-paced environments. Passionate about leveraging technology to solve business challenges and create value for stakeholders.`;
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

// AI-powered content generation function
async function generateAIContent(sectionType: string, candidateData: CandidateData, getToken: () => Promise<string | null>): Promise<string> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/ai/generate-suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: 'generate',
        sectionType,
        currentContent: '',
        candidateData,
      }),
    });

    if (response.ok) {
      const { suggestion } = await response.json();
      return suggestion || generateSectionContent(sectionType, candidateData);
    } else {
      console.warn(`AI generation failed for ${sectionType}, falling back to default`);
      return generateSectionContent(sectionType, candidateData);
    }
  } catch (error) {
    console.warn(`AI generation error for ${sectionType}:`, error);
    return generateSectionContent(sectionType, candidateData);
  }
}

// Function to generate content for a specific section
function generateSectionContent(sectionType: string, candidateData: CandidateData): string {
  switch (sectionType) {
    case 'header':
      return generateHeaderContent(candidateData);
    case 'summary':
      return generateSummaryContent(candidateData);
    case 'functional-skills':
      return generateFunctionalSkillsContent(candidateData);
    case 'technical-skills':
      return generateTechnicalSkillsContent(candidateData);
    case 'areas-of-expertise':
      return generateAreasOfExpertiseContent(candidateData);
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

**Major Achievements**
${generateAchievements(exp, candidateData)}

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

function generateAchievements(experience: any, candidateData: CandidateData): string {
  // Generate relevant achievements based on role and skills
  const achievements = [
    'Successfully delivered key projects ahead of schedule and under budget',
    'Improved team productivity and efficiency through process optimization',
    'Led cross-functional initiatives resulting in measurable business impact'
  ];
  
  if (candidateData.skills?.some(skill => skill.toLowerCase().includes('lead'))) {
    achievements.push('Mentored and developed team members, contributing to their professional growth');
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
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom functionality
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Pre-populate sections when candidate data changes
  useEffect(() => {
    if (selectedCandidate && currentStep >= 2) {
      console.log('🔄 Pre-populating sections with candidate data:', selectedCandidate);
      
      // Get template-specific section titles
      const sectionTitles = getSectionTitles(selectedTemplate);
      
      // Create separate experience sections
      const experienceSections = createExperienceSections(selectedCandidate);
      
      // Update existing sections with section-specific content
      const updatedBaseSections = [
        { id: 'header', type: 'header', title: sectionTitles.header, content: '', visible: true, order: 0, editable: true },
        { id: 'summary', type: 'summary', title: sectionTitles.summary, content: '', visible: true, order: 1, editable: true },
        { id: 'functional-skills', type: 'functional-skills', title: sectionTitles['functional-skills'], content: '', visible: true, order: 2, editable: true },
        { id: 'technical-skills', type: 'technical-skills', title: sectionTitles['technical-skills'], content: '', visible: true, order: 3, editable: true },
        { id: 'areas-of-expertise', type: 'areas-of-expertise', title: sectionTitles['areas-of-expertise'], content: '', visible: true, order: 4, editable: true },
        { id: 'education', type: 'education', title: sectionTitles.education, content: '', visible: true, order: 5 + experienceSections.length, editable: true },
        { id: 'certifications', type: 'certifications', title: sectionTitles.certifications, content: '', visible: true, order: 6 + experienceSections.length, editable: true },
        { id: 'languages', type: 'languages', title: sectionTitles.languages, content: '', visible: true, order: 7 + experienceSections.length, editable: true },
        { id: 'experiences-summary', type: 'experiences-summary', title: sectionTitles['experiences-summary'], content: '', visible: true, order: 8 + experienceSections.length, editable: true },
      ].map(section => ({
        ...section,
        content: section.content || generateSectionContent(section.type, selectedCandidate)
      }));
      
      // Combine base sections with experience sections
      const allSections = [
        ...updatedBaseSections.slice(0, 5), // header, summary, functional-skills, technical-skills, areas-of-expertise
        ...experienceSections, // individual experience blocks (PROFESSIONAL EXPERIENCES)
        ...updatedBaseSections.slice(5) // education, certifications, languages, experiences-summary
      ];
      
      setDocumentSections(allSections);
      console.log('✅ Sections populated with separate experience blocks:', allSections.length, 'total sections');
    }
  }, [selectedCandidate, currentStep, selectedTemplate]);
  
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
      
      console.log('📁 Starting file upload...', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type 
      });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/competence-files/parse-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log('📡 File upload response:', { 
        status: response.status, 
        statusText: response.statusText 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File upload failed:', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        
        let errorMessage = 'Failed to parse file';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('✅ File parse result:', result);
      
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Invalid response format');
      }
      
      const newCandidate = result.data;
      
      if (!newCandidate.fullName) {
        throw new Error('Could not extract candidate name from file');
      }
      
      setSelectedCandidate(newCandidate);
      setCurrentStep(2);
      console.log('✅ File parsing completed successfully');
      
    } catch (error) {
      console.error('💥 File parsing error:', error);
      
      let userMessage = 'Failed to parse file. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          userMessage = 'Authentication failed. Please refresh the page and try again.';
        } else if (error.message.includes('Could not extract')) {
          userMessage = 'Could not extract candidate information. Please ensure the file contains clear candidate details.';
        } else if (error.message.includes('Invalid response')) {
          userMessage = 'Server response was invalid. Please try again.';
        } else if (error.message.includes('file format')) {
          userMessage = 'Unsupported file format. Please use PDF, DOCX, TXT, MD, or HTML files.';
        } else if (error.message.includes('too large')) {
          userMessage = 'File is too large. Please use a file smaller than 25MB.';
        } else if (error.message !== 'Failed to parse file') {
          userMessage = error.message;
        }
      }
      
      alert(userMessage);
    } finally {
      setIsParsing(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [getToken]);
  
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
  
  // Autosave functionality
  const handleAutoSave = useCallback(async () => {
    if (!selectedCandidate) return;
    
    setIsAutoSaving(true);
    try {
      const token = await getToken();
      const documentData = {
        candidateId: selectedCandidate.id,
        template: selectedTemplate,
        sections: documentSections,
        lastModified: new Date().toISOString(),
      };
      
      const response = await fetch('/api/competence-files/autosave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(documentData),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [selectedCandidate, selectedTemplate, documentSections, getToken]);
  
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
        
        // Call success callback and close modal
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
  }, [selectedCandidate, selectedTemplate, documentSections, getToken, onSuccess, onClose]);
  
  // Auto-save effect
  useEffect(() => {
    if (currentStep === 3 && selectedCandidate) {
      const interval = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentStep, selectedCandidate, handleAutoSave]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg flex flex-col ${ 
        currentStep === 3 
          ? 'w-full h-full m-0 rounded-none' // Full screen for editor
          : 'w-full max-w-6xl h-[90vh] m-4' // Fixed height for steps 1-2
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
                <span className="text-sm">Select</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
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
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.txt,.html,.md"
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Upload Resume/CV</p>
                      <p className="text-gray-600 mb-4">Supports PDF, DOC, DOCX, TXT, HTML, MD files</p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
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
                        Continue to Editor
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Lexical Editor */}
          {currentStep === 3 && selectedCandidate && (
            <div className="flex-1 flex flex-col h-full">
              {/* Editor Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
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
                      onClick={handleAutoSave}
                      disabled={isAutoSaving}
                    >
                      {isAutoSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save
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