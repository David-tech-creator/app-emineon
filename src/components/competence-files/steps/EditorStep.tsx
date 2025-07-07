'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
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
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { LexicalEditor } from 'lexical';

// Core Lexical imports  
import { 
  $createParagraphNode, 
  $createTextNode, 
  $getRoot, 
  $getSelection,
  $isRangeSelection,
  RootNode,
  TextNode,
  ElementNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  EditorState,
  TextFormatType
} from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { 
  $isHeadingNode,
  $isQuoteNode,
  $createHeadingNode,
  $createQuoteNode,
  HeadingTagType 
} from '@lexical/rich-text';
import { 
  $isListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND
} from '@lexical/list';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

// Rich formatting nodes
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, $createListNode, $createListItemNode } from '@lexical/list';
import { LinkNode, $createLinkNode } from '@lexical/link';
import { QuoteNode } from '@lexical/rich-text';
import { CodeNode } from '@lexical/code';

// Markdown transformers for enhanced parsing
import { 
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  STRIKETHROUGH,
  UNORDERED_LIST,
  ORDERED_LIST,
  CHECK_LIST,
  QUOTE,
  HEADING,
  CODE,
  LINK,
  Transformer
} from '@lexical/markdown';

// Icons
import { 
  ArrowLeft,
  Edit3,
  Save,
  Download,
  Loader2,
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Move,
  ChevronUp,
  ChevronDown,
  GripVertical,
  TrendingUp,
  RefreshCw,
  Maximize,
  Minimize,
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Strikethrough,
  Fullscreen
} from 'lucide-react';

// Store imports
import { useSegmentStore, Segment } from '@/stores/ai-generation-store';

// Keyboard shortcuts plugin
function KeyboardShortcutsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'b':
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            break;
          case 'i':
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            break;
          case 'u':
            event.preventDefault();
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            break;
          case 'k':
            event.preventDefault();
            const url = prompt('Enter URL (e.g. https://example.com):');
            if (url && url.trim()) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim());
            }
            break;
          case 'e':
            if (event.shiftKey) {
              event.preventDefault();
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }
            break;
          case 'd':
            if (event.shiftKey) {
              event.preventDefault();
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }
            break;
        }
      }
      
      // Handle other keyboard shortcuts
      if (event.altKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                const element = node.getKey() === 'root' ? node : node.getTopLevelElementOrThrow();
                const heading = $createHeadingNode('h1');
                element.replace(heading);
                heading.select();
              }
            });
            break;
          case '2':
            event.preventDefault();
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                const element = node.getKey() === 'root' ? node : node.getTopLevelElementOrThrow();
                const heading = $createHeadingNode('h2');
                element.replace(heading);
                heading.select();
              }
            });
            break;
          case '3':
            event.preventDefault();
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const node = selection.anchor.getNode();
                const element = node.getKey() === 'root' ? node : node.getTopLevelElementOrThrow();
                const heading = $createHeadingNode('h3');
                element.replace(heading);
                heading.select();
              }
            });
            break;
        }
      }
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('keydown', handleKeyDown);
      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [editor]);

  return null;
}

// Formatting Toolbar Component
function FormattingToolbar() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [blockType, setBlockType] = useState('paragraph');

  // Update active formats based on selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const formats = new Set<string>();
          
          // Check text formats
          if (selection.hasFormat('bold')) formats.add('bold');
          if (selection.hasFormat('italic')) formats.add('italic');
          if (selection.hasFormat('underline')) formats.add('underline');
          if (selection.hasFormat('strikethrough')) formats.add('strikethrough');
          if (selection.hasFormat('code')) formats.add('code');
          
          setActiveFormats(formats);

          // Check block type
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getKey() === 'root' 
            ? anchorNode 
            : anchorNode.getTopLevelElementOrThrow();
          
          if ($isHeadingNode(element)) {
            setBlockType(element.getTag());
          } else if ($isQuoteNode(element)) {
            setBlockType('quote');
          } else if ($isListNode(element)) {
            setBlockType(element.getListType() === 'bullet' ? 'ul' : 'ol');
          } else {
            setBlockType('paragraph');
          }
        }
      });
    });
  }, [editor]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const element = node.getKey() === 'root' 
          ? node 
          : node.getTopLevelElementOrThrow();
        
        if ($isHeadingNode(element) && element.getTag() === headingSize) {
          // Convert back to paragraph
          const paragraph = $createParagraphNode();
          element.replace(paragraph);
          paragraph.select();
        } else {
          // Convert to heading
          const heading = $createHeadingNode(headingSize);
          element.replace(heading);
          heading.select();
        }
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.anchor.getNode();
        const element = node.getKey() === 'root' 
          ? node 
          : node.getTopLevelElementOrThrow();
        
        if ($isQuoteNode(element)) {
          // Convert back to paragraph
          const paragraph = $createParagraphNode();
          element.replace(paragraph);
          paragraph.select();
        } else {
          // Convert to quote
          const quote = $createQuoteNode();
          element.replace(quote);
          quote.select();
        }
      }
    });
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  const formatList = (listType: 'ul' | 'ol') => {
    if (blockType === listType) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else if (listType === 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-1 p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-md shadow-sm">
      {/* Text Formatting */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
        <button
          onClick={() => formatText('bold')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            activeFormats.has('bold') 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-blue-50 hover:text-blue-600 hover:shadow-md text-gray-700'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => formatText('italic')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            activeFormats.has('italic') 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-blue-50 hover:text-blue-600 hover:shadow-md text-gray-700'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => formatText('underline')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            activeFormats.has('underline') 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-blue-50 hover:text-blue-600 hover:shadow-md text-gray-700'
          }`}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>
        <button
          onClick={() => formatText('strikethrough')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            activeFormats.has('strikethrough') 
              ? 'bg-blue-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-blue-50 hover:text-blue-600 hover:shadow-md text-gray-700'
          }`}
          title="Strikethrough (Ctrl+Shift+D)"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
        <button
          onClick={() => formatHeading('h1')}
          className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 shadow-sm ${
            blockType === 'h1' 
              ? 'bg-indigo-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md text-gray-700'
          }`}
          title="Large Heading"
        >
          H1
        </button>
        <button
          onClick={() => formatHeading('h2')}
          className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 shadow-sm ${
            blockType === 'h2' 
              ? 'bg-indigo-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md text-gray-700'
          }`}
          title="Medium Heading"
        >
          H2
        </button>
        <button
          onClick={() => formatHeading('h3')}
          className={`px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 shadow-sm ${
            blockType === 'h3' 
              ? 'bg-indigo-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md text-gray-700'
          }`}
          title="Small Heading"
        >
          H3
        </button>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-1 pr-3 border-r border-gray-300">
        <button
          onClick={() => formatList('ul')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            blockType === 'ul' 
              ? 'bg-green-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-green-50 hover:text-green-600 hover:shadow-md text-gray-700'
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => formatList('ol')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            blockType === 'ol' 
              ? 'bg-green-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-green-50 hover:text-green-600 hover:shadow-md text-gray-700'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Special Formatting */}
      <div className="flex items-center gap-1">
        <button
          onClick={formatQuote}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            blockType === 'quote' 
              ? 'bg-purple-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-purple-50 hover:text-purple-600 hover:shadow-md text-gray-700'
          }`}
          title="Quote Block"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          onClick={() => formatText('code')}
          className={`p-2 rounded-md transition-all duration-200 shadow-sm ${
            activeFormats.has('code') 
              ? 'bg-orange-500 text-white shadow-md transform scale-105' 
              : 'bg-white hover:bg-orange-50 hover:text-orange-600 hover:shadow-md text-gray-700'
          }`}
          title="Inline Code (Ctrl+Shift+E)"
        >
          <Code className="h-4 w-4" />
        </button>
        <button
          onClick={insertLink}
          className="p-2 rounded-md transition-all duration-200 shadow-sm bg-white hover:bg-cyan-50 hover:text-cyan-600 hover:shadow-md text-gray-700"
          title="Insert Link (Ctrl+K)"
        >
          <Link className="h-4 w-4" />
        </button>
      </div>
      
      {/* Keyboard Shortcuts Help */}
      <div className="ml-auto pl-3 border-l border-gray-300">
        <div 
          className="px-3 py-2 text-xs text-gray-500 bg-white rounded-md shadow-sm border border-gray-200 cursor-help"
          title="⌨️ Keyboard Shortcuts:
• Ctrl+B - Bold
• Ctrl+I - Italic  
• Ctrl+U - Underline
• Ctrl+K - Link
• Ctrl+Shift+E - Code
• Ctrl+Shift+D - Strikethrough
• Alt+1/2/3 - Headings"
        >
          ⌨️ Shortcuts
        </div>
      </div>
    </div>
  );
}

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

interface JobDescription {
  text: string;
  requirements: string[];
  skills: string[];
  responsibilities: string;
  title?: string;
  company?: string;
}

interface EditorStepProps {
  selectedCandidate: CandidateData;
  selectedTemplate: 'professional' | 'professional-classic' | 'modern' | 'minimal' | 'emineon' | 'antaes';
  jobDescription: JobDescription;
  onBack: () => void;
  onSave: () => void;
  onGenerateDocument: (format: 'pdf' | 'docx', documentSections: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    visible: boolean;
    order: number;
    editable: boolean;
  }>) => void;
  isGenerating: boolean;
  isAutoSaving: boolean;
}

// Structured data interfaces
interface ExperienceData {
  company: string;
  role: string;
  dates: string;
  location?: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

interface SkillsData {
  categories: Array<{
    name: string;
    skills: string[];
  }>;
}

interface EducationData {
  institution: string;
  degree: string;
  field: string;
  dates: string;
  location?: string;
  achievements: string[];
}

interface SummaryData {
  keyStrengths: string[];
  yearsOfExperience: string;
  industryFocus: string[];
  careerHighlights: string[];
}

interface CoreCompetencyData {
  categories: Array<{
    name: string;
    competencies: string[];
  }>;
}

interface CertificationData {
  certifications: Array<{
    name: string;
    organization: string;
    dateObtained: string;
    expiryDate?: string;
    certificationId?: string;
  }>;
}

interface LanguageData {
  languages: Array<{
    name: string;
    proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
    certifications?: string;
  }>;
}

interface ProjectData {
  projects: Array<{
    name: string;
    client: string;
    duration: string;
    role: string;
    technologies: string[];
    description: string;
    achievements: string[];
  }>;
}

interface AreasOfExpertiseData {
  areas: Array<{
    category: string;
    expertise: string[];
  }>;
}

interface AwardData {
  awards: Array<{
    name: string;
    organization: string;
    date: string;
    description: string;
  }>;
}

// SegmentBlock Component - Individual segment with Lexical editor and structured editing
function SegmentBlock({ segment, jobDescription, selectedCandidate }: { 
  segment: Segment;
  jobDescription: JobDescription;
  selectedCandidate: CandidateData;
}) {
  const { updateSegment, regenerateSegment, improveSegment, expandSegment, rewriteSegment } = useSegmentStore();
  const { getToken } = useAuth();
  
  // Local state for UI interactions
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<'improve' | 'expand' | 'rewrite' | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(segment.title);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(segment.title);

  // Cleanup global content tracking variables when component unmounts
  useEffect(() => {
    return () => {
      try {
        delete (window as any)[`editorContent_${segment.id}`];
        delete (window as any)[`editorHtmlContent_${segment.id}`];
      } catch (error) {
        console.warn('Failed to cleanup global content variables:', error);
      }
    };
  }, [segment.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: segment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Enhanced Lexical editor configuration with rich formatting support
  const editorConfig = useMemo(() => ({
    namespace: `segment-editor-${segment.id}`,
    theme: {
      text: {
        bold: 'font-bold text-gray-900',
        italic: 'italic text-gray-800',
        strikethrough: 'line-through text-gray-600',
        underline: 'underline decoration-2 underline-offset-2',
        code: 'bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-200',
      },
      paragraph: 'mb-3 leading-relaxed text-gray-700 text-base',
      heading: {
        h1: 'text-3xl font-bold mb-6 mt-8 text-gray-900 leading-tight border-b-2 border-gray-200 pb-2',
        h2: 'text-2xl font-bold mb-4 mt-6 text-gray-900 leading-tight',
        h3: 'text-xl font-semibold mb-3 mt-5 text-gray-800 leading-snug',
        h4: 'text-lg font-semibold mb-3 mt-4 text-gray-800',
        h5: 'text-base font-semibold mb-2 mt-3 text-gray-800',
        h6: 'text-sm font-semibold mb-2 mt-3 text-gray-700 uppercase tracking-wide',
      },
      list: {
        ol: 'list-decimal list-outside ml-6 mb-4 space-y-1',
        ul: 'list-disc list-outside ml-6 mb-4 space-y-1',
      },
      listItem: 'mb-1 leading-relaxed text-gray-700 pl-1',
      quote: 'border-l-4 border-blue-400 pl-6 py-3 my-6 italic text-gray-700 bg-gray-50 rounded-r-lg relative before:content-["""] before:text-4xl before:text-blue-400 before:absolute before:-left-2 before:-top-1',
      link: 'text-blue-600 underline decoration-2 underline-offset-2 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200 rounded px-1',
      code: 'bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm border border-gray-200 shadow-sm',
      root: 'leading-relaxed text-gray-700',
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      LinkNode,
      QuoteNode,
      CodeNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical editor error:', error);
    },
  }), [segment.id]);

  // Enhanced content initialization with proper markdown parsing
  const ContentInitializationPlugin = () => {
    const [editor] = useLexicalComposerContext();
    const isInitializedRef = React.useRef(false);
    const lastInitializedContentRef = React.useRef<string>('');
    
    React.useEffect(() => {
      // Don't reinitialize if content hasn't actually changed from external source
      const contentToCheck = segment.content;
      if (isInitializedRef.current && lastInitializedContentRef.current === contentToCheck) {
        return;
      }
      
      // Don't reinitialize if content is empty and we already have editor content
      if (!contentToCheck?.trim() && isInitializedRef.current) {
        return;
      }
      
      // Check if this might be a user-generated content update
      const currentEditorContent = (window as any)[`editorContent_${segment.id}`];
      if (isInitializedRef.current && currentEditorContent && currentEditorContent === segment.content) {
        // This is likely a sync from the debounced update, don't reinitialize
        console.log('⚠️ Skipping content reinitialization - appears to be from user editing');
        return;
      }
      
      console.log('🔄 Initializing editor content for segment:', segment.id, {
        contentLength: segment.content?.length || 0,
        isFirstTime: !isInitializedRef.current
      });
      
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        
        // Use plain content with markdown parsing
        if (segment.content?.trim()) {
          try {
            console.log('📝 Initializing with plain content (markdown parsing)');
            createStructuredNodesFromMarkdown(root, segment.content);
          } catch (error) {
            console.warn('Structured content parsing failed, using fallback:', error);
            // Fallback to simple paragraph
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(segment.content || 'Enter content here...'));
            root.append(paragraph);
          }
        } 
        // Empty content case
        else {
          console.log('📝 Initializing with empty content');
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        }
        
        // Mark as initialized and store the content we just initialized with
        isInitializedRef.current = true;
        lastInitializedContentRef.current = contentToCheck || '';
      });
    }, [editor, segment.content]);
    
    return null;
  };

  // Enhanced markdown-to-Lexical parser for structured content
  const createStructuredNodesFromMarkdown = (root: RootNode, content: string) => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      const paragraph = $createParagraphNode();
      paragraph.append($createTextNode(''));
      root.append(paragraph);
      return;
    }

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Parse headings (##, ###, etc.)
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
        const headingText = headingMatch[2].trim();
        const heading = $createHeadingNode(`h${level}`);
        
        // Parse mixed inline formatting for headings
        const parts = parseInlineFormatting(headingText);
        parts.forEach(part => {
          const textNode = $createTextNode(part.text);
          if (part.bold) textNode.setFormat('bold');
          if (part.italic) textNode.setFormat('italic');
          if (part.strikethrough) textNode.setFormat('strikethrough');
          if (part.code) textNode.setFormat('code');
          heading.append(textNode);
        });
        
        root.append(heading);
        i++;
        continue;
      }

      // Parse standalone bold headings (**Text** on its own line)
      const boldHeadingMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
      if (boldHeadingMatch && !line.includes('-') && !line.includes('•')) {
        const heading = $createHeadingNode('h3');
        const textNode = $createTextNode(boldHeadingMatch[1].trim());
        textNode.setFormat('bold');
        heading.append(textNode);
        root.append(heading);
        i++;
        continue;
      }

      // Parse lists (bullet points starting with -, •, or *)
      if (line.match(/^[-•*]\s+/)) {
        const listItems: string[] = [];
        
        // Collect consecutive list items
        while (i < lines.length && lines[i].match(/^[-•*]\s+/)) {
          const listItemText = lines[i].replace(/^[-•*]\s+/, '').trim();
          listItems.push(listItemText);
          i++;
        }
        
        // Create unordered list with enhanced formatting support
        const list = $createListNode('bullet');
        listItems.forEach(itemText => {
          const listItem = $createListItemNode();
          
          // Parse mixed inline formatting for list items
          const parts = parseInlineFormatting(itemText);
          parts.forEach(part => {
            const textNode = $createTextNode(part.text);
            if (part.bold) textNode.setFormat('bold');
            if (part.italic) textNode.setFormat('italic');
            if (part.strikethrough) textNode.setFormat('strikethrough');
            if (part.code) textNode.setFormat('code');
            listItem.append(textNode);
          });
          
          list.append(listItem);
        });
        root.append(list);
        continue;
      }

      // Parse numbered lists (1., 2., etc.)
      if (line.match(/^\d+\.\s+/)) {
        const listItems: string[] = [];
        
        // Collect consecutive numbered items
        while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
          const listItemText = lines[i].replace(/^\d+\.\s+/, '').trim();
          listItems.push(listItemText);
          i++;
        }
        
        // Create ordered list with enhanced formatting support
        const list = $createListNode('number');
        listItems.forEach(itemText => {
          const listItem = $createListItemNode();
          
          // Parse mixed inline formatting for list items
          const parts = parseInlineFormatting(itemText);
          parts.forEach(part => {
            const textNode = $createTextNode(part.text);
            if (part.bold) textNode.setFormat('bold');
            if (part.italic) textNode.setFormat('italic');
            if (part.strikethrough) textNode.setFormat('strikethrough');
            if (part.code) textNode.setFormat('code');
            listItem.append(textNode);
          });
          
          list.append(listItem);
        });
        root.append(list);
        continue;
      }

      // Parse quotes (lines starting with >)
      if (line.startsWith('>')) {
        const quoteText = line.replace(/^>\s*/, '').trim();
        const quote = $createQuoteNode();
        
        // Parse mixed inline formatting for quotes
        const parts = parseInlineFormatting(quoteText);
        parts.forEach(part => {
          const textNode = $createTextNode(part.text);
          if (part.bold) textNode.setFormat('bold');
          if (part.italic) textNode.setFormat('italic');
          if (part.strikethrough) textNode.setFormat('strikethrough');
          if (part.code) textNode.setFormat('code');
          quote.append(textNode);
        });
        
        root.append(quote);
        i++;
        continue;
      }

      // Skip empty lines
      if (line.trim() === '') {
        i++;
        continue;
      }

      // Regular paragraph with mixed inline formatting
      const paragraph = createFormattedParagraph(line);
      root.append(paragraph);
      i++;
    }
  };

  // Enhanced helper function to create text nodes with proper inline formatting
  const createFormattedTextNode = (text: string): TextNode => {
    // Simple case: if no formatting markers, return plain text
    if (!text.includes('**') && !text.includes('*') && !text.includes('_') && !text.includes('~~') && !text.includes('`')) {
      return $createTextNode(text);
    }

    // Handle the most common case: **Bold Text** (entire text is bold)
    const fullBoldMatch = text.match(/^\*\*(.+?)\*\*:?\s*$/);
    if (fullBoldMatch) {
      const cleanText = fullBoldMatch[1].trim();
      const textNode = $createTextNode(cleanText);
      textNode.setFormat('bold');
      return textNode;
    }

    // Handle italic text: *Italic Text* (but not **bold**)
    const fullItalicMatch = text.match(/^\*(.+?)\*$/) && !text.includes('**');
    if (fullItalicMatch) {
      const cleanText = text.replace(/^\*(.+?)\*$/, '$1');
      const textNode = $createTextNode(cleanText);
      textNode.setFormat('italic');
      return textNode;
    }

    // Handle underscore italic: _Italic Text_
    const underscoreItalicMatch = text.match(/^_(.+?)_$/);
    if (underscoreItalicMatch) {
      const cleanText = underscoreItalicMatch[1];
      const textNode = $createTextNode(cleanText);
      textNode.setFormat('italic');
      return textNode;
    }

    // Handle strikethrough: ~~Text~~
    const strikethroughMatch = text.match(/^~~(.+?)~~$/);
    if (strikethroughMatch) {
      const cleanText = strikethroughMatch[1];
      const textNode = $createTextNode(cleanText);
      textNode.setFormat('strikethrough');
      return textNode;
    }

    // Handle inline code: `code`
    const codeMatch = text.match(/^`(.+?)`$/);
    if (codeMatch) {
      const cleanText = codeMatch[1];
      const textNode = $createTextNode(cleanText);
      textNode.setFormat('code');
      return textNode;
    }

    // For mixed formatting, we need to return a plain text node
    // The paragraph will handle mixed formatting by creating multiple text nodes
    let cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1')      // Remove italic markers
      .replace(/_(.*?)_/g, '$1')        // Remove underscore markers
      .replace(/~~(.*?)~~/g, '$1')      // Remove strikethrough markers
      .replace(/`(.*?)`/g, '$1');       // Remove code markers

    return $createTextNode(cleanText);
  };

  // Enhanced helper function to create a paragraph with mixed inline formatting
  const createFormattedParagraph = (text: string) => {
    const paragraph = $createParagraphNode();
    
    if (!text.includes('**') && !text.includes('*') && !text.includes('_') && !text.includes('~~') && !text.includes('`')) {
      paragraph.append($createTextNode(text));
      return paragraph;
    }

    // Parse mixed inline formatting
    const parts = parseInlineFormatting(text);
    parts.forEach(part => {
      const textNode = $createTextNode(part.text);
      if (part.bold) textNode.setFormat('bold');
      if (part.italic) textNode.setFormat('italic');
      if (part.strikethrough) textNode.setFormat('strikethrough');
      if (part.code) textNode.setFormat('code');
      paragraph.append(textNode);
    });

    return paragraph;
  };

  // Parse text with mixed inline formatting into parts
  const parseInlineFormatting = (text: string) => {
    const parts: Array<{
      text: string;
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      code?: boolean;
    }> = [];

    let currentIndex = 0;
    
    while (currentIndex < text.length) {
      // Find the next formatting marker
      const boldMatch = text.indexOf('**', currentIndex);
      const italicMatch = text.indexOf('*', currentIndex);
      const strikeMatch = text.indexOf('~~', currentIndex);
      const codeMatch = text.indexOf('`', currentIndex);
      
      // Get the nearest formatting marker
      const markers = [
        { type: 'bold', index: boldMatch, length: 2 },
        { type: 'italic', index: italicMatch === boldMatch ? -1 : italicMatch, length: 1 },
        { type: 'strike', index: strikeMatch, length: 2 },
        { type: 'code', index: codeMatch, length: 1 }
      ].filter(m => m.index >= 0).sort((a, b) => a.index - b.index);

      if (markers.length === 0) {
        // No more formatting, add rest as plain text
        if (currentIndex < text.length) {
          parts.push({ text: text.substring(currentIndex) });
        }
        break;
      }

      const nextMarker = markers[0];
      
      // Add any plain text before the marker
      if (nextMarker.index > currentIndex) {
        parts.push({ text: text.substring(currentIndex, nextMarker.index) });
      }

      // Find the closing marker
      const openMarker = nextMarker.type === 'bold' ? '**' :
                        nextMarker.type === 'italic' ? '*' :
                        nextMarker.type === 'strike' ? '~~' : '`';

      const closeIndex = text.indexOf(openMarker, nextMarker.index + nextMarker.length);
      
      if (closeIndex === -1) {
        // No closing marker, treat as plain text
        parts.push({ text: text.substring(nextMarker.index) });
        break;
      }

      // Extract formatted text
      const formattedText = text.substring(nextMarker.index + nextMarker.length, closeIndex);
      const formatProps: any = { text: formattedText };
      
      if (nextMarker.type === 'bold') formatProps.bold = true;
      else if (nextMarker.type === 'italic') formatProps.italic = true;
      else if (nextMarker.type === 'strike') formatProps.strikethrough = true;
      else if (nextMarker.type === 'code') formatProps.code = true;
      
      parts.push(formatProps);
      
      currentIndex = closeIndex + nextMarker.length;
    }

    return parts;
  };

  // Simplified OnChange plugin for basic content tracking only
  const handleContentChange = (editorState: any) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      // Simple content storage without HTML synchronization
      (window as any)[`editorContent_${segment.id}`] = textContent;
    });
  };

  // Function to get current content from Lexical editor (simplified)
  const getCurrentEditorContent = (): string => {
    try {
      const textContent = (window as any)[`editorContent_${segment.id}`];
      return textContent || segment.content;
    } catch (error) {
      console.error('Failed to get current editor content:', error);
      return segment.content;
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await regenerateSegment(segment.id, jobDescription, selectedCandidate);
    } catch (error) {
      console.error('Failed to regenerate segment:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEnhance = async (action: 'improve' | 'expand' | 'rewrite') => {
    setIsEnhancing(action);
    try {
      const currentContent = getCurrentEditorContent();
      await regenerateSegment(segment.id, jobDescription, selectedCandidate, action, currentContent);
    } catch (error) {
      console.error('Failed to enhance segment:', error);
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleTitleSave = () => {
    updateSegment(segment.id, { title: tempTitle });
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(segment.title);
    setIsEditingTitle(false);
  };

  const toggleVisibility = () => {
    updateSegment(segment.id, { visible: !segment.visible });
    
    // Also adjust heights for smooth UX
    const segmentElement = document.querySelector(`[data-segment-id="${segment.id}"]`);
    if (segmentElement) {
      if (!segment.visible) {
        // Becoming visible
        segmentElement.classList.add('transition-all', 'duration-300', 'ease-in-out');
      } else {
        // Becoming hidden
        segmentElement.classList.add('transition-all', 'duration-300', 'ease-in-out');
      }
    }
  };

  const toggleEditorFullscreen = () => {
    // This will be handled by the parent EditorStep component
  };

  const togglePreviewFullscreen = () => {
    // This will be handled by the parent EditorStep component
  };

  const exitFullscreen = () => {
    // This will be handled by the parent EditorStep component
  };

  // Add keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'e') {
          event.preventDefault();
          toggleEditorFullscreen();
        } else if (event.key === 'p') {
          event.preventDefault();
          togglePreviewFullscreen();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border rounded-lg p-4 shadow-sm transition-opacity ${
        !segment.visible ? 'opacity-50' : ''
      }`}
    >
      {/* Segment Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="px-2 py-1 border rounded text-sm font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') handleTitleCancel();
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleTitleSave}>Save</Button>
              <Button variant="outline" size="sm" onClick={handleTitleCancel}>Cancel</Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">{segment.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTitle(true)}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Segment Toolbar */}
        <div className="flex items-center space-x-2">
          {/* Enhancement Buttons - Only show if content exists */}
          {segment.content && segment.content.trim() && segment.status !== 'loading' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnhance('improve')}
                disabled={isEnhancing === 'improve'}
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                {isEnhancing === 'improve' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                )}
                Improve
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnhance('expand')}
                disabled={isEnhancing === 'expand'}
                className="bg-blue-50 border-blue-200 hover:bg-blue-100"
              >
                {isEnhancing === 'expand' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Plus className="h-4 w-4 mr-1 text-blue-600" />
                )}
                Expand
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEnhance('rewrite')}
                disabled={isEnhancing === 'rewrite'}
                className="bg-purple-50 border-purple-200 hover:bg-purple-100"
              >
                {isEnhancing === 'rewrite' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1 text-purple-600" />
                )}
                Rewrite
              </Button>
            </>
          )}
          
          {/* Generate button for empty segments */}
          {(!segment.content || segment.content.trim() === '' || segment.status === 'error') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating || segment.status === 'loading'}
              className="bg-blue-50 border-blue-200 hover:bg-blue-100"
            >
              {isRegenerating || segment.status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1 text-blue-600" />
              )}
              Generate
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleVisibility();
            }}
          >
            {segment.visible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Status indicator */}
      {segment.status === 'loading' && (
        <div className="mb-3 flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs">Generating content...</span>
        </div>
      )}

      {segment.status === 'error' && (
        <div className="mb-3 flex items-center space-x-2 text-red-600">
          <span className="text-xs">⚠️ Generation failed. Try regenerating.</span>
        </div>
      )}

      {/* Content Editor - Only Lexical Rich Text Editor */}
      {segment.visible && (
        <LexicalComposer initialConfig={editorConfig} key={`${segment.id}-${segment.content}`}>
          <div className="relative">
            {/* Formatting Toolbar */}
            <FormattingToolbar />
            
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[200px] p-6 border border-t-0 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 prose prose-lg max-w-none text-base leading-relaxed bg-white transition-shadow duration-200 hover:shadow-sm" />
              }
              placeholder={
                <div className="absolute top-6 left-6 text-gray-400 pointer-events-none text-base leading-relaxed">
                  Enter rich content for {segment.title}...
                </div>
              }
              ErrorBoundary={() => <div className="p-4 text-red-600 bg-red-50 rounded border border-red-200">Something went wrong with the editor!</div>}
            />
            
            {/* Rich Formatting Plugins */}
            <ListPlugin />
            <LinkPlugin />
            <TabIndentationPlugin />
            <AutoFocusPlugin />
            <MarkdownShortcutPlugin 
              transformers={[
                HEADING,
                BOLD_STAR,
                BOLD_UNDERSCORE,
                ITALIC_STAR,
                ITALIC_UNDERSCORE,
                STRIKETHROUGH,
                UNORDERED_LIST,
                ORDERED_LIST,
                QUOTE,
                CODE,
                LINK
              ]} 
            />
            
            {/* Core Plugins */}
            <OnChangePlugin onChange={handleContentChange} />
            <HistoryPlugin />
            <KeyboardShortcutsPlugin />
            <ContentInitializationPlugin />
          </div>
        </LexicalComposer>
      )}
    </div>
  );
}

// Live Preview Component
function LivePreview({ 
  segments, 
  selectedCandidate, 
  selectedTemplate, 
  zoomLevel, 
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleFullscreen,
  fullscreenMode,
  className = '' 
}: {
  segments: Segment[];
  selectedCandidate: CandidateData;
  selectedTemplate: string;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleFullscreen: () => void;
  fullscreenMode: 'none' | 'editor' | 'preview' | 'both';
  className?: string;
}) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Add sync state management
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [previewNeedsSync, setPreviewNeedsSync] = useState(false);
  const [isManualSync, setIsManualSync] = useState(false);
  const [cachedPreviewHTML, setCachedPreviewHTML] = useState<string>('');

  // Function to handle manual sync
  const handleSyncPreview = () => {
    setIsManualSync(true);
    setLastSyncTime(new Date());
    setPreviewNeedsSync(false);
    
    // Update cached preview HTML
    setCachedPreviewHTML(generatePreviewHTML());
    
    // Reset sync animation
    setTimeout(() => {
      setIsManualSync(false);
    }, 500);
  };

  // Function to mark preview as needing sync when segments change
  useEffect(() => {
    if (lastSyncTime) {
      setPreviewNeedsSync(true);
    }
  }, [segments]);

  // Emineon-styled Sync Button Component
  const SyncButton = () => (
    <button
      onClick={handleSyncPreview}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        previewNeedsSync 
          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={previewNeedsSync ? 'Preview is outdated - Click to sync' : 'Preview is up to date'}
    >
      {isManualSync ? (
        <>
          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
          Syncing...
        </>
      ) : previewNeedsSync ? (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Sync Preview
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Synced
        </>
      )}
    </button>
  );

  // Professional experience parser
  const parseExperienceContent = (content: string) => {
    if (!content) return null;
    
    // Extract company and role from patterns like "**Company** - Role" or "**Company - Role**"
    const companyRoleMatch = content.match(/\*\*(.*?)\*\*\s*-\s*(.*?)(?:\n|$)/);
    
    // Extract dates from patterns like "2021-07 - 2023-09"
    const dateMatch = content.match(/(\d{4}-\d{2})\s*-\s*(\d{4}-\d{2}|\w+)/);
    
    // Extract responsibilities (lines starting with •, -, or bullets)
    const responsibilities = content
      .split('\n')
      .filter(line => line.trim().match(/^[•\-\*]\s/))
      .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
      .filter(line => line.length > 0);

    // Extract achievements or key points
    const achievements = content
      .split('\n')
      .filter(line => line.includes('**') && !line.includes(' - ') && line.length > 10)
      .map(line => line.replace(/\*\*/g, '').trim())
      .filter(line => line.length > 0);

    return {
      company: companyRoleMatch?.[1]?.trim() || '',
      role: companyRoleMatch?.[2]?.trim() || '',
      dates: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : '',
      responsibilities,
      achievements,
      rawContent: content
    };
  };

  // Skills formatter for beautiful tags
  const formatSkillsContent = (content: string): string => {
    if (!content) return '';
    
    // Parse skills by categories
    const lines = content.split('\n').filter(line => line.trim());
    let formattedHTML = '<div class="skills-grid space-y-6">';
    
    let currentCategory = '';
    let currentSkills: string[] = [];
    
    lines.forEach(line => {
      // Check if it's a category header (bold text)
      const categoryMatch = line.match(/\*\*(.*?)\*\*/);
      if (categoryMatch) {
        // If we have previous skills, add them
        if (currentCategory && currentSkills.length > 0) {
          formattedHTML += formatSkillCategory(currentCategory, currentSkills);
        }
        currentCategory = categoryMatch[1].trim();
        currentSkills = [];
      } else if (line.trim() && currentCategory) {
        // Extract skills from bullet points
        const skillsText = line.replace(/^[•\-\*]\s*/, '').trim();
        if (skillsText) {
          // Split by commas or semicolons
          const skills = skillsText.split(/[,;]/).map(s => s.trim()).filter(s => s);
          currentSkills.push(...skills);
        }
      }
    });
    
    // Add final category
    if (currentCategory && currentSkills.length > 0) {
      formattedHTML += formatSkillCategory(currentCategory, currentSkills);
    }
    
    formattedHTML += '</div>';
    return formattedHTML;
  };

  const formatSkillCategory = (category: string, skills: string[]): string => {
    return `
      <div class="skill-category mb-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-3">${category}</h4>
        <div class="flex flex-wrap gap-2">
          ${skills.map(skill => `
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              ${skill}
            </span>
          `).join('')}
        </div>
      </div>
    `;
  };

  const formatRegularContent = (content: string): string => {
    if (!content) return '';
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\n- /g, '<br/>• ')
      .replace(/\n/g, '<br/>');
  };

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  // Generate live HTML from current segments
  const previewHTML = useMemo(() => {
    const visibleSegments = segments
      .filter(segment => segment.visible && segment.content?.trim())
      .sort((a, b) => a.order - b.order);

    if (visibleSegments.length === 0) {
      return `
        <div style="padding: 40px; text-align: center; color: #666; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin-bottom: 16px;">Preview</h3>
          <p>Your competence file preview will appear here as you edit the content.</p>
        </div>
      `;
    }

    // Build modern HTML content inspired by Emineon design
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${selectedCandidate.fullName} - Competence File</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #1e293b; 
            background: #f8fafc;
            padding: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
            min-height: 100vh;
          }
          .header { 
            background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
            color: white;
            padding: 40px;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #f97316, #ea580c);
          }
          .antaes-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
          }
          .antaes-logo-icon {
            width: 48px;
            height: 48px;
            background: #f97316;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
            color: white;
          }
          .antaes-logo-text {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .antaes-tagline {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 4px;
          }
          .candidate-info h1 { 
            font-size: 32px; 
            font-weight: 700; 
            margin-bottom: 8px;
            color: white;
          }
          .candidate-role { 
            font-size: 18px; 
            color: #f97316; 
            font-weight: 600;
            margin-bottom: 16px;
          }
          .contact-info {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            font-size: 14px;
            color: #cbd5e1;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .section { 
            padding: 32px 40px;
            border-bottom: 1px solid #e2e8f0;
          }
          .section:last-child {
            border-bottom: none;
          }
          .section-title { 
            font-size: 20px; 
            font-weight: 700; 
            color: #1e293b; 
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .section-title::after {
            content: '';
            flex: 1;
            height: 2px;
            background: linear-gradient(90deg, #f97316, transparent);
          }
          .section-content { 
            font-size: 15px; 
            line-height: 1.7;
            color: #475569;
          }
          .skill-category {
            margin-bottom: 24px;
          }
          .skill-category h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
          }
          .skill-tag {
            display: inline-flex;
            align-items: center;
            background: #334155;
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            margin: 4px 6px 4px 0;
          }
          .experience-entry {
            margin-bottom: 32px;
            padding: 24px;
            background: #f8fafc;
            border-left: 4px solid #f97316;
            border-radius: 0 8px 8px 0;
          }
          .experience-company {
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 6px;
          }
          .experience-role {
            font-size: 16px;
            font-weight: 600;
            color: #f97316;
            margin-bottom: 4px;
          }
          .experience-dates {
            font-size: 14px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .experience-section {
            margin-bottom: 16px;
          }
          .experience-section h5 {
            font-size: 14px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .experience-list {
            list-style: none;
            padding: 0;
          }
          .experience-list li {
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
            color: #475569;
            line-height: 1.6;
          }
          .experience-list li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #f97316;
            font-weight: bold;
          }
          .footer {
            padding: 24px 40px;
            background: #f1f5f9;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
          }
          @media (max-width: 768px) {
            .header, .section { padding: 24px; }
            .candidate-info h1 { font-size: 24px; }
            .contact-info { gap: 16px; }
            .section-title { font-size: 18px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="antaes-logo">
              <div class="antaes-logo-icon">A</div>
              <div>
                <div class="antaes-logo-text">ANTAES</div>
                <div class="antaes-tagline">Competence File</div>
              </div>
            </div>
            
            <div class="candidate-info">
              <h1>${selectedCandidate.fullName}</h1>
              <div class="candidate-role">${selectedCandidate.currentTitle}</div>
              ${selectedCandidate.email || selectedCandidate.phone || selectedCandidate.location ? `
                <div class="contact-info">
                  ${selectedCandidate.email ? `<div class="contact-item">📧 ${selectedCandidate.email}</div>` : ''}
                  ${selectedCandidate.phone ? `<div class="contact-item">📞 ${selectedCandidate.phone}</div>` : ''}
                  ${selectedCandidate.location ? `<div class="contact-item">📍 ${selectedCandidate.location}</div>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
    `;

    // Add each segment
    visibleSegments.forEach(segment => {
      const content = segment.content.trim();
      if (!content) return;

      html += `
        <div class="section">
          <h2 class="section-title">${segment.title}</h2>
          <div class="section-content">
      `;

      // Process content based on segment type
      if (segment.type.includes('SKILLS') || segment.type.includes('TECHNICAL') || segment.type.includes('COMPETENC')) {
        html += formatSkillsContent(content);
      } else if (segment.type.includes('EXPERIENCE')) {
        const experience = parseExperienceContent(content);
        if (experience && experience.company) {
          html += `
            <div class="experience-entry">
              <div class="experience-company">${experience.company}</div>
              <div class="experience-role">${experience.role}</div>
              <div class="experience-dates">${experience.dates}</div>
              
              ${experience.responsibilities.length > 0 ? `
                <div class="experience-section">
                  <h5>Key Responsibilities</h5>
                  <ul class="experience-list">
                    ${experience.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${experience.achievements.length > 0 ? `
                <div class="experience-section">
                  <h5>Major Achievements</h5>
                  <ul class="experience-list">
                    ${experience.achievements.map(achieve => `<li>${achieve}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;
        } else {
          html += formatRegularContent(content);
        }
      } else {
        html += formatRegularContent(content);
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `
          <div class="footer">
            Generated by ANTAES Competence File System • ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }, [segments, selectedCandidate, selectedTemplate, formatSkillsContent, parseExperienceContent, formatRegularContent]);

  

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Preview Controls */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <div className="flex items-center space-x-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1 rounded ${previewDevice === 'desktop' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-1 rounded ${previewDevice === 'tablet' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1 rounded ${previewDevice === 'mobile' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          
          {/* Preview Expand Button */}
          <button
            onClick={onToggleFullscreen}
            className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            title={fullscreenMode === 'preview' ? 'Exit preview fullscreen' : 'Expand preview'}
          >
            {fullscreenMode === 'preview' ? (
              <>
                <Minimize className="h-4 w-4 mr-1.5" />
                Exit
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-1.5" />
                Expand
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Preview Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={onZoomOut}
              className="p-1 rounded hover:bg-gray-200"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium px-2">{zoomLevel}%</span>
            <button 
              onClick={onZoomIn}
              className="p-1 rounded hover:bg-gray-200"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button 
              onClick={onZoomReset}
              className="text-xs px-2 py-1 rounded hover:bg-gray-200"
              title="Reset zoom"
            >
              Reset
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            Manual sync • Click sync to update preview
          </div>
          
          {/* Sync Button */}
          <SyncButton />
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto">
        <div 
          className="flex justify-center p-4"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            height: `${100 / (zoomLevel / 100)}%`,
            minHeight: `${800 * (100 / zoomLevel)}px`
          }}
        >
          <div 
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ 
              width: getDeviceWidth(),
              minHeight: '800px'
            }}
          >
            <iframe
              srcDoc={previewHTML}
              className="w-full h-full border-0"
              style={{ minHeight: '800px' }}
              title="Competence File Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorStep({
  selectedCandidate,
  selectedTemplate,
  jobDescription,
  onBack,
  onSave,
  onGenerateDocument,
  isGenerating,
  isAutoSaving
}: EditorStepProps) {
  const {
    segments,
    isLoading: segmentsLoading,
    error: segmentsError,
    loadFromAI,
    reorderSegments,
    clearSegments,
    getVisibleSegments,
    updateSegment,
    regenerateSegment
  } = useSegmentStore();

  // Editor state
  const [hasInitialized, setHasInitialized] = useState(false);
  const [editorZoomLevel, setEditorZoomLevel] = useState(100);
  const [previewZoomLevel, setPreviewZoomLevel] = useState(100);
  
  // Fullscreen modes: none, editor, preview, both
  const [fullscreenMode, setFullscreenMode] = useState<'none' | 'editor' | 'preview' | 'both'>('none');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Auto-initialization
  useEffect(() => {
    if (!hasInitialized && selectedCandidate) {
      console.log('🚀 Initializing segments with AI content...');
      loadFromAI(jobDescription, selectedCandidate);
      setHasInitialized(true);
    }
  }, [hasInitialized, selectedCandidate, jobDescription, loadFromAI]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // clearSegments(); // Uncomment if you want to clear segments on unmount
    };
  }, []);

  // Debug logging for segments
  useEffect(() => {
    console.log('🎯 EditorStep - Segments state:', {
      segmentsCount: segments.length,
      isLoading: segmentsLoading,
      error: segmentsError,
      segments: segments.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        status: s.status,
        contentLength: s.content?.length || 0,
        visible: s.visible,
        order: s.order
      }))
    });
  }, [segments, segmentsLoading, segmentsError]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = segments.findIndex(segment => segment.id === active.id);
      const newIndex = segments.findIndex(segment => segment.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderSegments(oldIndex, newIndex);
      }
    }
  };

  const handleGenerateDocument = (format: 'pdf' | 'docx') => {
    // Get the final editor content from segments
    const visibleSegments = getVisibleSegments();
    
    console.log('🎯 EditorStep - Final editor content for PDF generation:', {
      segmentsCount: visibleSegments.length,
      segments: visibleSegments.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        visible: s.visible,
        order: s.order,
        contentLength: s.content?.length || 0,
        contentPreview: s.content?.substring(0, 100) || ''
      }))
    });
    
    // Validate that we have content
    if (visibleSegments.length === 0) {
      console.error('❌ No visible segments found for PDF generation');
      alert('No content available for PDF generation. Please ensure segments are loaded and visible.');
      return;
    }
    
    // Validate that segments have content
    const segmentsWithContent = visibleSegments.filter(s => s.content && s.content.trim().length > 0);
    if (segmentsWithContent.length === 0) {
      console.error('❌ No segments with content found for PDF generation');
      alert('No content available for PDF generation. Please ensure segments have content.');
      return;
    }
    
    console.log(`✅ Found ${segmentsWithContent.length} segments with content out of ${visibleSegments.length} visible segments`);
    
    // Convert segments to the format expected by the PDF generation
    const documentSections = visibleSegments.map(segment => ({
      id: segment.id,
      type: segment.type,
      title: segment.title,
      content: segment.content,
      visible: segment.visible,
      order: segment.order,
      editable: segment.editable,
    }));
    
    console.log('🚀 EditorStep - Passing documentSections to parent modal:', {
      sectionsCount: documentSections.length,
      format: format,
      sections: documentSections.map(s => ({
        id: s.id,
        title: s.title,
        type: s.type,
        visible: s.visible,
        contentLength: s.content?.length || 0,
        hasContent: !!s.content && s.content.trim().length > 0
      }))
    });
    
    // Pass the final editor content to the parent
    onGenerateDocument(format, documentSections);
  };

  // Editor zoom controls
  const handleEditorZoomIn = () => setEditorZoomLevel((prev: number) => Math.min(prev + 10, 150));
  const handleEditorZoomOut = () => setEditorZoomLevel((prev: number) => Math.max(prev - 10, 50));
  const handleEditorZoomReset = () => setEditorZoomLevel(100);

  // Preview zoom controls  
  const handlePreviewZoomIn = () => setPreviewZoomLevel((prev: number) => Math.min(prev + 10, 150));
  const handlePreviewZoomOut = () => setPreviewZoomLevel((prev: number) => Math.max(prev - 10, 50));
  const handlePreviewZoomReset = () => setPreviewZoomLevel(100);

  // Fullscreen controls
  const toggleEditorFullscreen = () => {
    setFullscreenMode(fullscreenMode === 'editor' ? 'none' : 'editor');
  };

  const togglePreviewFullscreen = () => {
    setFullscreenMode(fullscreenMode === 'preview' ? 'none' : 'preview');
  };

  const toggleBothFullscreen = () => {
    setFullscreenMode(fullscreenMode === 'both' ? 'none' : 'both');
  };

  const exitFullscreen = () => {
    setFullscreenMode('none');
  };

  // Handle escape key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && fullscreenMode !== 'none') {
        exitFullscreen();
      }
    };

    if (fullscreenMode !== 'none') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [fullscreenMode]);

  if (segmentsError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to load content</h3>
          <p className="text-sm mb-4">{segmentsError}</p>
          <Button 
            onClick={() => {
              setHasInitialized(false);
              clearSegments();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const editorContent = (
    <div className={`flex-1 flex flex-col h-full ${fullscreenMode === 'editor' || fullscreenMode === 'preview' || fullscreenMode === 'both' ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Editor Header - Fixed height and proper spacing - Hidden in 'both' mode */}
      {fullscreenMode !== 'both' && (
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0 min-h-[4rem] relative z-10">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Button variant="outline" onClick={fullscreenMode !== 'none' ? exitFullscreen : onBack} className="flex-shrink-0">
              {fullscreenMode !== 'none' ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <ArrowLeft className="h-4 w-4 mr-2" />
              )}
              {fullscreenMode !== 'none' ? 'Exit Fullscreen' : 'Back'}
            </Button>
            <h1 className="text-xl font-semibold flex-shrink-0">Editor</h1>
            <div className="text-sm text-gray-500 truncate">
              {selectedCandidate.fullName} • {selectedTemplate} template
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* General Page Fullscreen Toggle */}
            <Button 
              variant="outline" 
              onClick={() => {
                if (fullscreenMode !== 'none') {
                  exitFullscreen();
                } else {
                  // Show both editor and preview in fullscreen
                  toggleBothFullscreen();
                }
              }}
              className="bg-primary-500 text-white hover:bg-primary-600 hidden sm:flex"
              title="Toggle page fullscreen"
            >
              {fullscreenMode !== 'none' ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Fullscreen className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>

            {/* Action Buttons */}
            <Button variant="outline" onClick={onSave} disabled={isAutoSaving} className="hidden sm:flex">
              {isAutoSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

            <Button 
              onClick={() => handleGenerateDocument('pdf')} 
              disabled={isGenerating || segmentsLoading}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate PDF
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className={`${fullscreenMode === 'preview' ? 'hidden' : 'flex-1'} border-r border-gray-200 flex flex-col`}>
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between flex-shrink-0 h-14">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-700">Content Editor</h3>
              
              {/* Editor Expand Button */}
              <button
                onClick={toggleEditorFullscreen}
                className="flex items-center px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                title={fullscreenMode === 'editor' ? 'Exit editor fullscreen' : 'Expand editor'}
              >
                {fullscreenMode === 'editor' ? (
                  <>
                    <Minimize className="h-4 w-4 mr-1.5" />
                    Exit
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4 mr-1.5" />
                    Expand
                  </>
                )}
              </button>

              {/* Exit Fullscreen button for 'both' mode - Updated to grey styling */}
              {fullscreenMode === 'both' && (
                <button
                  onClick={exitFullscreen}
                  className="flex items-center px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  title="Exit fullscreen"
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Exit Fullscreen
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Editor Zoom Controls */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={handleEditorZoomOut}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium px-2">{editorZoomLevel}%</span>
                <button 
                  onClick={handleEditorZoomIn}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button 
                  onClick={handleEditorZoomReset}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-200"
                  title="Reset zoom"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Editor Content */}
          <div className="flex-1 overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
            <div 
              style={{ 
                transform: `scale(${editorZoomLevel / 100})`,
                transformOrigin: 'top left',
                width: `${100 / (editorZoomLevel / 100)}%`,
                minHeight: '100%',
                overflow: 'visible'
              }}
            >
              {segmentsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading content...</p>
                  </div>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={segments.map(s => s.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4 p-4" style={{ minHeight: '100%' }}>
                      {segments.map(segment => (
                        <SortableSegmentWrapper key={segment.id} segment={segment}>
                          <SegmentBlock 
                            segment={segment}
                            jobDescription={jobDescription}
                            selectedCandidate={selectedCandidate}
                          />
                        </SortableSegmentWrapper>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {fullscreenMode !== 'editor' && (
          <div className={`${fullscreenMode === 'preview' ? 'flex-1' : 'flex-1'}`}>
            <LivePreview
              segments={segments}
              selectedCandidate={selectedCandidate}
              selectedTemplate={selectedTemplate}
              zoomLevel={previewZoomLevel}
              onZoomIn={handlePreviewZoomIn}
              onZoomOut={handlePreviewZoomOut}
              onZoomReset={handlePreviewZoomReset}
              onToggleFullscreen={togglePreviewFullscreen}
              fullscreenMode={fullscreenMode}
            />
          </div>
        )}
      </div>
    </div>
  );

  // SortableSegmentWrapper for drag and drop
  function SortableSegmentWrapper({ 
    children, 
    segment 
  }: { 
    children: React.ReactNode; 
    segment: Segment; 
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: segment.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div className="relative group">
          <div
            {...listeners}
            className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          {children}
        </div>
      </div>
    );
  }

  return editorContent;
}