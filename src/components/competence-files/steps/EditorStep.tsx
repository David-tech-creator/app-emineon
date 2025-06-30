'use client';

import React, { useState, useRef, useCallback } from 'react';
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
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';

import { 
  ArrowLeft,
  Save,
  Download,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Wand2,
  Loader2,
  Edit3,
  Sparkles,
  RefreshCw,
  ZoomOut,
  ZoomIn
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
  selectedTemplate: 'professional' | 'modern' | 'minimal' | 'emineon' | 'antaes';
  documentSections: DocumentSection[];
  onSectionsUpdate: (sections: DocumentSection[]) => void;
  jobDescription: JobDescription;
  onBack: () => void;
  onSave: () => void;
  onGenerateDocument: (format: 'pdf' | 'docx') => void;
  isGenerating: boolean;
  isAutoSaving: boolean;
}

// Sortable Section Editor Component
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
    if (!candidateData || !getToken) return;
    
    setIsGenerating(true);
    try {
      const token = await getToken();
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
          jobDescription,
        }),
      });

      if (response.ok) {
        const { suggestion } = await response.json();
        onUpdate(suggestion);
        setLastSaved(new Date());
      } else {
        console.error('Failed to enhance content:', response.status);
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        alert(`Failed to ${type} content: ${errorData.error || 'Please try again'}`);
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert(`Failed to ${type} content. Please check your connection and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Lexical editor configuration
  const editorConfig = {
    namespace: `section-${section.id}`,
    theme: {
      paragraph: 'mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
      },
    },
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    nodes: [],
  };

  const ContentInitializationPlugin = React.useMemo(() => {
    const initialContent = section.content || '';
    
    return function ContentInitializationPluginComponent() {
      const [editor] = useLexicalComposerContext();
      const [initialized, setInitialized] = useState(false);

      React.useEffect(() => {
        if (!initialized && initialContent) {
          editor.update(() => {
            const root = $getRoot();
            root.clear();
            
            if (initialContent.trim()) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(initialContent, 'text/html');
              const nodes = $generateNodesFromDOM(editor, doc);
              root.append(...nodes);
            } else {
              const paragraph = $createParagraphNode();
              paragraph.append($createTextNode(''));
              root.append(paragraph);
            }
          });
          setInitialized(true);
        }
      }, [editor, initialized, initialContent]);

      return null;
    };
  }, [section.content]);

  const handleContentChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      const htmlString = $generateHtmlFromNodes(editorState._nodeMap.get('root')._lexicalEditor, null);
      if (htmlString !== section.content) {
        onUpdate(htmlString);
      }
    });
  }, [onUpdate, section.content]);

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
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
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
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

        {/* AI Enhancement Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAIContent('improve')}
            disabled={isGenerating}
            className="bg-green-50 border-green-200 hover:bg-green-100"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1 text-green-600" />
            )}
            Improve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAIContent('expand')}
            disabled={isGenerating}
            className="bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Plus className="h-4 w-4 mr-1 text-blue-600" />
            )}
            Expand
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateAIContent('rewrite')}
            disabled={isGenerating}
            className="bg-purple-50 border-purple-200 hover:bg-purple-100"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1 text-purple-600" />
            )}
            Rewrite
          </Button>
        </div>
      </div>

      {/* Lexical Editor */}
      <LexicalComposer initialConfig={editorConfig}>
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none" />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Enter content for {section.title}...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <OnChangePlugin onChange={handleContentChange} />
          <HistoryPlugin />
          <ContentInitializationPlugin />
        </div>
      </LexicalComposer>

      {lastSaved && (
        <div className="mt-2 text-xs text-gray-500">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export function EditorStep({
  selectedCandidate,
  selectedTemplate,
  documentSections,
  onSectionsUpdate,
  jobDescription,
  onBack,
  onSave,
  onGenerateDocument,
  isGenerating,
  isAutoSaving
}: EditorStepProps) {
  const { getToken } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(100);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = documentSections.findIndex(section => section.id === active.id);
      const newIndex = documentSections.findIndex(section => section.id === over.id);

      const newSections = arrayMove(documentSections, oldIndex, newIndex).map((section, index) => ({
        ...section,
        order: index
      }));

      onSectionsUpdate(newSections);
    }
  };

  const updateSectionContent = (sectionId: string, content: string) => {
    const updatedSections = documentSections.map(section =>
      section.id === sectionId ? { ...section, content } : section
    );
    onSectionsUpdate(updatedSections);
  };

  const updateSectionTitle = (sectionId: string, title: string) => {
    const updatedSections = documentSections.map(section =>
      section.id === sectionId ? { ...section, title } : section
    );
    onSectionsUpdate(updatedSections);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  const handleImproveAll = async () => {
    // Implementation for improving all sections
    console.log('Improving all sections...');
  };

  const handleExpandAll = async () => {
    // Implementation for expanding all sections
    console.log('Expanding all sections...');
  };

  const handleRewriteAll = async () => {
    // Implementation for rewriting all sections
    console.log('Rewriting all sections...');
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
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
              onClick={onSave}
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
              onClick={() => onGenerateDocument('pdf')}
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
              onClick={() => onGenerateDocument('docx')}
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
                        onTitleUpdate={(title) => updateSectionTitle(section.id, title)}
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
  );
}