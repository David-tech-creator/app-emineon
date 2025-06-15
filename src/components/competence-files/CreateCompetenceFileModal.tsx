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
  ChevronUp,
  ChevronDown,
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
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Type,
  Sparkles,
  Move,
  Maximize2,
  Minimize2
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

// Lexical imports
import { 
  $getRoot, 
  $getSelection, 
  EditorState, 
  LexicalEditor, 
  FORMAT_TEXT_COMMAND, 
  SELECTION_CHANGE_COMMAND, 
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  DecoratorNode,
  NodeKey,
  LexicalNode,
  $getNodeByKey
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import { mergeRegister } from '@lexical/utils';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';

import { 
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
  ListItemNode
} from '@lexical/list';

// Custom Decorator Nodes for enhanced blocks
class SkillsSummaryNode extends DecoratorNode<JSX.Element> {
  __skills: string[];

  static getType(): string {
    return 'skills-summary';
  }

  static clone(node: SkillsSummaryNode): SkillsSummaryNode {
    return new SkillsSummaryNode(node.__skills, node.__key);
  }

  constructor(skills: string[], key?: NodeKey) {
    super(key);
    this.__skills = skills;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'skills-summary-node p-4 border border-gray-200 rounded-lg bg-blue-50';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setSkills(skills: string[]): void {
    const writable = this.getWritable();
    writable.__skills = skills;
  }

  getSkills(): string[] {
    return this.__skills;
  }

  decorate(): JSX.Element {
    return <SkillsSummaryComponent skills={this.__skills} node={this} />;
  }

  static importJSON(serializedNode: any): SkillsSummaryNode {
    const { skills } = serializedNode;
    return new SkillsSummaryNode(skills);
  }

  exportJSON() {
    return {
      skills: this.__skills,
      type: 'skills-summary',
      version: 1,
    };
  }
}

class CertificationsTableNode extends DecoratorNode<JSX.Element> {
  __certifications: Array<{name: string, issuer: string, date: string}>;

  static getType(): string {
    return 'certifications-table';
  }

  static clone(node: CertificationsTableNode): CertificationsTableNode {
    return new CertificationsTableNode(node.__certifications, node.__key);
  }

  constructor(certifications: Array<{name: string, issuer: string, date: string}>, key?: NodeKey) {
    super(key);
    this.__certifications = certifications;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'certifications-table-node p-4 border border-gray-200 rounded-lg bg-green-50';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  setCertifications(certifications: Array<{name: string, issuer: string, date: string}>): void {
    const writable = this.getWritable();
    writable.__certifications = certifications;
  }

  getCertifications(): Array<{name: string, issuer: string, date: string}> {
    return this.__certifications;
  }

  decorate(): JSX.Element {
    return <CertificationsTableComponent certifications={this.__certifications} node={this} />;
  }

  static importJSON(serializedNode: any): CertificationsTableNode {
    const { certifications } = serializedNode;
    return new CertificationsTableNode(certifications);
  }

  exportJSON() {
    return {
      certifications: this.__certifications,
      type: 'certifications-table',
      version: 1,
    };
  }
}

// GPT Suggestion Node
class GPTSuggestionNode extends DecoratorNode<JSX.Element> {
  __suggestion: string;
  __context: string;

  static getType(): string {
    return 'gpt-suggestion';
  }

  static clone(node: GPTSuggestionNode): GPTSuggestionNode {
    return new GPTSuggestionNode(node.__suggestion, node.__context, node.__key);
  }

  constructor(suggestion: string, context: string, key?: NodeKey) {
    super(key);
    this.__suggestion = suggestion;
    this.__context = context;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'gpt-suggestion-node p-3 border border-purple-200 rounded-lg bg-purple-50 relative';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getSuggestion(): string {
    return this.__suggestion;
  }

  getContext(): string {
    return this.__context;
  }

  decorate(): JSX.Element {
    return <GPTSuggestionComponent suggestion={this.__suggestion} context={this.__context} node={this} />;
  }

  static importJSON(serializedNode: any): GPTSuggestionNode {
    const { suggestion, context } = serializedNode;
    return new GPTSuggestionNode(suggestion, context);
  }

  exportJSON() {
    return {
      suggestion: this.__suggestion,
      context: this.__context,
      type: 'gpt-suggestion',
      version: 1,
    };
  }
}

interface CreateCompetenceFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fileData: any) => void;
  preselectedCandidate?: CandidateData | null;
}

// Document Section Types
interface DocumentSection {
  id: string;
  type: 'header' | 'personal-info' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'custom';
  title: string;
  content: string;
  visible: boolean;
  order: number;
  editable: boolean;
}

// Lexical Editor Configuration
const editorConfig = {
  namespace: 'CompetenceFileEditor',
  nodes: [
    SkillsSummaryNode,
    CertificationsTableNode,
    GPTSuggestionNode,
    ListNode,
    ListItemNode
  ],
  theme: {
    root: 'p-4 border-gray-300 border-2 rounded-lg focus-within:border-blue-500 min-h-[200px]',
    text: {
      bold: 'font-bold',
      italic: 'italic',
      underline: 'underline',
    },
    paragraph: 'mb-2',
    heading: {
      h1: 'text-2xl font-bold mb-4',
      h2: 'text-xl font-semibold mb-3',
      h3: 'text-lg font-medium mb-2',
    },
    list: {
      nested: {
        listitem: 'list-none',
      },
      ol: 'list-decimal ml-4',
      ul: 'list-disc ml-4',
      listitem: 'mb-1',
    },
    quote: 'border-l-4 border-gray-300 pl-4 italic',
    code: 'bg-gray-100 px-2 py-1 rounded font-mono text-sm',
    codeblock: 'bg-gray-100 p-4 rounded font-mono text-sm',
  },
  onError: (error: Error) => {
    console.error('Lexical error:', error);
  },
};

// Enhanced Toolbar Component with AI Features
function EnhancedEditorToolbar({ selectedCandidate }: { selectedCandidate?: CandidateData | null }) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
          }
          return false;
        },
        1
      )
    );
  }, [editor]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertList = (type: 'ul' | 'ol') => {
    if (type === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const insertSkillsSummary = () => {
    if (!selectedCandidate) return;
    
    editor.update(() => {
      const skillsNode = new SkillsSummaryNode(selectedCandidate.skills);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([skillsNode]);
      }
    });
  };

  const insertCertificationsTable = () => {
    if (!selectedCandidate) return;
    
    editor.update(() => {
      const certifications = selectedCandidate.certifications.map(cert => ({
        name: cert,
        issuer: 'Unknown',
        date: 'N/A'
      }));
      const certsNode = new CertificationsTableNode(certifications);
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertNodes([certsNode]);
      }
    });
  };

  const generateAISuggestion = async () => {
    setIsGeneratingAI(true);
    try {
      const selection = $getSelection();
      let context = '';
      
      if ($isRangeSelection(selection)) {
        context = selection.getTextContent();
      }
      
      const response = await fetch('/api/ai/generate-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          context, 
          candidateData: selectedCandidate,
          sectionType: 'general'
        })
      });
      
      const { suggestion } = await response.json();
      
      editor.update(() => {
        const suggestionNode = new GPTSuggestionNode(suggestion, context);
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertNodes([suggestionNode]);
        }
      });
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
      {/* Basic Formatting */}
      <div className="flex items-center space-x-1">
        <Button
          variant={isBold ? "primary" : "outline"}
          size="sm"
          onClick={() => formatText('bold')}
          className="p-2"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? "primary" : "outline"}
          size="sm"
          onClick={() => formatText('italic')}
          className="p-2"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={isUnderline ? "primary" : "outline"}
          size="sm"
          onClick={() => formatText('underline')}
          className="p-2"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        {/* Lists */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertList('ul')}
          className="p-2"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertList('ol')}
          className="p-2"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      {/* AI-Enhanced Features */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={insertSkillsSummary}
          disabled={!selectedCandidate}
          className="text-xs"
          title="Insert Skills Summary Block"
        >
          <Award className="h-3 w-3 mr-1" />
          Skills
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={insertCertificationsTable}
          disabled={!selectedCandidate}
          className="text-xs"
          title="Insert Certifications Table"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Certs
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={generateAISuggestion}
          disabled={isGeneratingAI}
          className="text-xs"
          title="Generate AI Suggestion"
        >
          {isGeneratingAI ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3 mr-1" />
          )}
          AI Assist
        </Button>
      </div>
    </div>
  );
}

// Document Section Component
function DocumentSectionComponent({ 
  section, 
  onUpdate, 
  onRemove, 
  isDragging,
  selectedCandidate 
}: { 
  section: DocumentSection;
  onUpdate: (id: string, content: string) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
  selectedCandidate?: CandidateData | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const handleContentChange = (editorState: EditorState, editor: LexicalEditor) => {
    editor.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onUpdate(section.id, htmlString);
    });
  };

  if (!section.visible) return null;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`mb-8 group relative ${
        isDragging ? 'shadow-xl z-50' : 'hover:shadow-md'
      } transition-all duration-200`}
    >
      {/* Section Header - Only visible on hover */}
      <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
        <div 
          className="cursor-move text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        {section.type === 'custom' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(section.id)}
            className="p-1 opacity-70 hover:opacity-100"
            title="Remove section"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {/* Section Content */}
      {section.editable ? (
        <div className="border border-transparent hover:border-gray-200 rounded-lg transition-colors">
          <LexicalComposer initialConfig={{
            ...editorConfig,
            editorState: section.content
          }}>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <EnhancedEditorToolbar selectedCandidate={selectedCandidate} />
              <RichTextPlugin
                contentEditable={<ContentEditable className="min-h-[100px] p-4 focus:outline-none" />}
                placeholder={<div className="absolute top-4 left-4 text-gray-400 pointer-events-none">Start typing...</div>}
                ErrorBoundary={SimpleErrorBoundary}
              />
              <HistoryPlugin />
              <OnChangePlugin onChange={handleContentChange} />
              <ListPlugin />
              <LinkPlugin />
              <MarkdownShortcutPlugin />
              <TablePlugin />
            </div>
          </LexicalComposer>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          {/* Auto-generated content based on section type */}
          {section.type === 'personal-info' && selectedCandidate && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{selectedCandidate.fullName}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2 text-gray-600">{selectedCandidate.currentTitle}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="ml-2 text-gray-600">{selectedCandidate.location}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-600">{selectedCandidate.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-600">{selectedCandidate.phone}</span>
                </div>
              </div>
            </div>
          )}
          
          {section.type === 'experience' && selectedCandidate && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Work Experience</h3>
              {selectedCandidate.experience.map((exp, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900">{exp.title}</h4>
                    <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{exp.company}</p>
                  <p className="text-sm text-gray-600">{exp.responsibilities}</p>
                </div>
              ))}
            </div>
          )}
          
          {section.type === 'skills' && selectedCandidate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {section.type === 'education' && selectedCandidate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Education</h3>
              <div className="space-y-2">
                {selectedCandidate.education.map((edu, index) => (
                  <p key={index} className="text-sm text-gray-600">{edu}</p>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback for other content */}
          {section.content && (
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          )}
        </div>
      )}
    </div>
  );
}

// Main Modal Component
export function CreateCompetenceFileModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedCandidate 
}: CreateCompetenceFileModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateData | null>(preselectedCandidate || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>('');
  
  // Document sections state
  const [documentSections, setDocumentSections] = useState<DocumentSection[]>([
    {
      id: 'header',
      type: 'header',
      title: 'Header',
      content: '<h1>Competence File</h1>',
      visible: true,
      order: 0,
      editable: true
    },
    {
      id: 'personal-info',
      type: 'personal-info',
      title: 'Personal Information',
      content: '',
      visible: true,
      order: 1,
      editable: false
    },
    {
      id: 'summary',
      type: 'summary',
      title: 'Professional Summary',
      content: '<p>Enter your professional summary here...</p>',
      visible: true,
      order: 2,
      editable: true
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Work Experience',
      content: '',
      visible: true,
      order: 3,
      editable: false
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education',
      content: '',
      visible: true,
      order: 4,
      editable: false
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skills',
      content: '',
      visible: true,
      order: 5,
      editable: false
    }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle section drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setDocumentSections((sections) => {
        const oldIndex = sections.findIndex((section) => section.id === active.id);
        const newIndex = sections.findIndex((section) => section.id === over.id);
        
        const newSections = arrayMove(sections, oldIndex, newIndex);
        return newSections.map((section, index) => ({
          ...section,
          order: index
        }));
      });
    }
  };

  // Update section content
  const updateSectionContent = (id: string, content: string) => {
    setDocumentSections(sections => 
      sections.map(section => 
        section.id === id ? { ...section, content } : section
      )
    );
  };

  // Remove section
  const removeSection = (id: string) => {
    setDocumentSections(sections => sections.filter(section => section.id !== id));
  };

  // Add new section
  const addSection = () => {
    const newSection: DocumentSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'New Section',
      content: '<p>Enter content here...</p>',
      visible: true,
      order: documentSections.length,
      editable: true
    };
    setDocumentSections([...documentSections, newSection]);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Toggle fullscreen
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  // Generate competence file
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Implementation for generating the competence file
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      onSuccess({ sections: documentSections, candidate: selectedCandidate });
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  const modalClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-white"
    : "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";

  const contentClasses = isFullscreen
    ? "w-full h-full flex flex-col"
    : "bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col";

  return (
    <ErrorBoundary>
      <div className={modalClasses}>
        <div className={contentClasses}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Competence File
              </h2>
              {selectedCandidate && (
                <Badge variant="secondary">
                  {selectedCandidate.fullName}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="p-1"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="px-2 text-sm font-medium min-w-[50px] text-center">
                  {zoomLevel}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="p-1"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetZoom}
                  className="p-1"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="p-2"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              
              {/* Save Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
              </Button>
              
              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Document Structure */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Document Sections</h3>
                <Button
                  onClick={addSection}
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Section</span>
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={documentSections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {documentSections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div key={section.id} className="mb-2">
                          <SortableSectionItem
                            section={section}
                            onToggle={() => {
                              setDocumentSections(sections =>
                                sections.map(s =>
                                  s.id === section.id ? { ...s, visible: !s.visible } : s
                                )
                              );
                            }}
                            onRemove={() => removeSection(section.id)}
                          />
                        </div>
                      ))}
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">
              {/* Document Preview */}
              <div 
                className="flex-1 overflow-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100"
                style={{ 
                  zoom: `${zoomLevel}%`,
                  scrollBehavior: 'smooth'
                }}
              >
                <div className="max-w-[210mm] mx-auto bg-white shadow-2xl border border-gray-200 min-h-[297mm] relative">
                  {/* Document Header with Logo */}
                  <div className="relative">
                    {logoUrl && (
                      <div className="absolute top-8 right-8 z-10">
                        <img 
                          src={logoUrl} 
                          alt="Company Logo" 
                          className="h-12 w-auto object-contain opacity-90"
                        />
                      </div>
                    )}
                    
                    {/* Logo Upload Area */}
                    <div className="absolute top-4 left-4 z-10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setLogoUrl(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <Image className="h-4 w-4 mr-1" />
                        Logo
                      </Button>
                    </div>
                  </div>

                  {/* Document Content */}
                  <div className="p-8 pt-16">
                    {documentSections
                      .filter(section => section.visible)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <DocumentSectionComponent
                          key={section.id}
                          section={section}
                          onUpdate={updateSectionContent}
                          onRemove={removeSection}
                          selectedCandidate={selectedCandidate}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

// Sortable Section Item for Sidebar
function SortableSectionItem({
  section,
  onToggle,
  onRemove
}: {
  section: DocumentSection;
  onToggle: () => void;
  onRemove: () => void;
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
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 ${
        isDragging ? 'shadow-lg' : 'shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="cursor-move text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          
          <button
            onClick={onToggle}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
              section.visible 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300'
            }`}
          >
            {section.visible && <Check className="h-2 w-2" />}
          </button>
          
          <span className="text-sm font-medium text-gray-900">
            {section.title}
          </span>
        </div>
        
        {section.type === 'custom' && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="p-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Simple Error Boundary Component
function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <div>{children}</div>;
  } catch (error) {
    console.error('Error in component:', error);
    return <div className="p-4 text-red-600">Error loading component. Please refresh the page.</div>;
  }
}

// Enhanced Error Boundary with state
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Something went wrong</h3>
        <p className="text-red-600 text-sm mt-1">Please refresh the page and try again.</p>
        <Button 
          onClick={() => setHasError(false)} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

// React Components for Decorator Nodes
function SkillsSummaryComponent({ skills, node }: { skills: string[], node: SkillsSummaryNode }) {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState(skills.join(', '));

  const handleSave = () => {
    const newSkills = editedSkills.split(',').map(s => s.trim()).filter(s => s);
    editor.update(() => {
      node.setSkills(newSkills);
    });
    setIsEditing(false);
  };

  const handleAIEnhance = async () => {
    try {
      // Call AI service to enhance skills
      const response = await fetch('/api/ai/enhance-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills })
      });
      const { enhancedSkills } = await response.json();
      
      editor.update(() => {
        node.setSkills(enhancedSkills);
      });
    } catch (error) {
      console.error('Failed to enhance skills:', error);
    }
  };

  return (
    <div className="skills-summary-component">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Award className="h-4 w-4 mr-2" />
          Skills Summary
        </h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIEnhance}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Enhance
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <Input
            value={editedSkills}
            onChange={(e) => setEditedSkills(e.target.value)}
            placeholder="Enter skills separated by commas"
            className="text-sm"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSave}>Save</Button>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function CertificationsTableComponent({ 
  certifications, 
  node 
}: { 
  certifications: Array<{name: string, issuer: string, date: string}>, 
  node: CertificationsTableNode 
}) {
  const [editor] = useLexicalComposerContext();
  const [isEditing, setIsEditing] = useState(false);

  const handleAIGenerate = async () => {
    try {
      // Call AI service to suggest certifications
      const response = await fetch('/api/ai/suggest-certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCertifications: certifications })
      });
      const { suggestedCertifications } = await response.json();
      
      editor.update(() => {
        node.setCertifications([...certifications, ...suggestedCertifications]);
      });
    } catch (error) {
      console.error('Failed to generate certifications:', error);
    }
  };

  return (
    <div className="certifications-table-component">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <Award className="h-4 w-4 mr-2" />
          Certifications
        </h4>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIGenerate}
            className="text-xs"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            AI Suggest
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-700">Certification</th>
              <th className="text-left py-2 font-medium text-gray-700">Issuer</th>
              <th className="text-left py-2 font-medium text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((cert, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 text-gray-900">{cert.name}</td>
                <td className="py-2 text-gray-600">{cert.issuer}</td>
                <td className="py-2 text-gray-600">{cert.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GPTSuggestionComponent({ 
  suggestion, 
  context, 
  node 
}: { 
  suggestion: string, 
  context: string, 
  node: GPTSuggestionNode 
}) {
  const [editor] = useLexicalComposerContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAccept = () => {
    editor.update(() => {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(suggestion));
      node.replace(paragraph);
    });
  };

  const handleReject = () => {
    editor.update(() => {
      node.remove();
    });
  };

  const handleRegenerate = async () => {
    try {
      const response = await fetch('/api/ai/regenerate-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, currentSuggestion: suggestion })
      });
      const { newSuggestion } = await response.json();
      
      editor.update(() => {
        const newNode = new GPTSuggestionNode(newSuggestion, context);
        node.replace(newNode);
      });
    } catch (error) {
      console.error('Failed to regenerate suggestion:', error);
    }
  };

  return (
    <div className="gpt-suggestion-component">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
          <span className="text-sm font-medium text-purple-800">AI Suggestion</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>
      
      <div className={`text-sm text-gray-700 mb-3 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {suggestion}
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAccept}
          className="text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Regenerate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          className="text-xs text-red-600 hover:text-red-700"
        >
          <X className="h-3 w-3 mr-1" />
          Reject
        </Button>
      </div>
    </div>
  );
} 