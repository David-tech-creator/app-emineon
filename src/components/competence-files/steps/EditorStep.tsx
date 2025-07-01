'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';
import { LexicalEditor } from 'lexical';

// Icons
import { 
  ArrowLeft,
  Save,
  Download,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Edit3,
  Sparkles,
  RefreshCw,
  TrendingUp,
  ZoomOut,
  ZoomIn,
  X
} from 'lucide-react';

// Store imports
import { useSegmentStore, Segment } from '@/stores/ai-generation-store';

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
  onGenerateDocument: (format: 'pdf' | 'docx') => void;
  isGenerating: boolean;
  isAutoSaving: boolean;
}

// SegmentBlock Component - Individual segment with Lexical editor
function SegmentBlock({ segment, jobDescription, selectedCandidate }: { 
  segment: Segment;
  jobDescription: JobDescription;
  selectedCandidate: CandidateData;
}) {
  const { updateSegment, regenerateSegment, improveSegment, expandSegment, rewriteSegment } = useSegmentStore();
  const { getToken } = useAuth();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState<'improve' | 'expand' | 'rewrite' | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(segment.title);

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

  // Lexical editor configuration
  const editorConfig = {
    namespace: `segment-${segment.id}`,
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

  // Content initialization plugin
  const ContentInitializationPlugin = () => {
    const [editor] = useLexicalComposerContext();
    
    React.useEffect(() => {
      if (!segment.content) return;
      
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        
        if (segment.content.trim()) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(segment.content, 'text/html');
            const nodes = $generateNodesFromDOM(editor, doc);
            root.append(...nodes);
          } catch (error) {
            console.error('Error parsing HTML content:', error);
            // Fallback to plain text
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(segment.content));
            root.append(paragraph);
          }
        } else {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(''));
          root.append(paragraph);
        }
      });
    }, [editor, segment.content]);
    
    return null;
  };

  const handleContentChange = useCallback((editorState: EditorState) => {
    editorState.read(() => {
      try {
        const textContent = $getRoot().getTextContent();
        if (textContent !== segment.content) {
          updateSegment(segment.id, { content: textContent });
        }
      } catch (error) {
        console.error('Error getting text content:', error);
      }
    });
  }, [segment.id, segment.content, updateSegment]);

  const handleRegenerate = async () => {
    if (!getToken) return;
    
    setIsRegenerating(true);
    try {
      // Pass the actual job and candidate data
      await regenerateSegment(segment.id, jobDescription, selectedCandidate);
    } catch (error) {
      console.error('Error regenerating segment:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleEnhance = async (action: 'improve' | 'expand' | 'rewrite') => {
    if (!getToken || !segment.content?.trim()) return;
    
    setIsEnhancing(action);
    try {
      const enhanceFunction = action === 'improve' ? improveSegment : 
                             action === 'expand' ? expandSegment : 
                             rewriteSegment;
      
      // Pass the actual job and candidate data
      await enhanceFunction(segment.id, jobDescription, selectedCandidate);
    } catch (error) {
      console.error(`Error ${action}ing segment:`, error);
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
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-white border rounded-lg p-6 shadow-sm transition-opacity ${
        !segment.visible ? 'opacity-50' : ''
      }`}
    >
      {/* Segment Header */}
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
            onClick={toggleVisibility}
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
        <div className="mb-4 flex items-center space-x-2 text-blue-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Generating content...</span>
        </div>
      )}

      {segment.status === 'error' && (
        <div className="mb-4 flex items-center space-x-2 text-red-600">
          <span className="text-sm">⚠️ Generation failed. Try regenerating.</span>
        </div>
      )}

      {/* Lexical Editor */}
      {segment.visible && (
        <LexicalComposer initialConfig={editorConfig} key={`${segment.id}-${segment.content}`}>
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none" />
              }
              placeholder={
                <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                  Enter content for {segment.title}...
                </div>
              }
              ErrorBoundary={() => <div>Something went wrong!</div>}
            />
            <OnChangePlugin onChange={handleContentChange} />
            <HistoryPlugin />
            <ContentInitializationPlugin />
          </div>
        </LexicalComposer>
      )}
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
    getVisibleSegments,
    clearSegments,
    updateSegment,
    regenerateSegment 
  } = useSegmentStore();
  
  const [zoomLevel, setZoomLevel] = useState(100);
  const [hasInitialized, setHasInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize segments when component mounts
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
    // Convert segments to the format expected by the existing PDF generation
    const visibleSegments = getVisibleSegments();
    const documentSections = visibleSegments.map(segment => ({
      id: segment.id,
      type: segment.type,
      title: segment.title,
      content: segment.content,
      visible: segment.visible,
      order: segment.order,
      editable: segment.editable,
    }));
    
    // Call the existing generation function with transformed data
    onGenerateDocument(format);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoomLevel(100);

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

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Editor Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Editor</h1>
          <div className="text-sm text-gray-500">
            {selectedCandidate.fullName} • {selectedTemplate} template
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-2">{zoomLevel}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset}>
              Reset
            </Button>
          </div>

          {/* Action Buttons */}
          <Button variant="outline" onClick={onSave} disabled={isAutoSaving}>
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

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-6" style={{ zoom: `${zoomLevel}%` }}>
        {segmentsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Generating your competence file...</h3>
              <p className="text-gray-600">This may take a few moments while we create personalized content.</p>
            </div>
          </div>
        ) : segments.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No content available</h3>
              <p className="text-gray-600 mb-4">Something went wrong while generating content.</p>
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
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={segments.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-6 max-w-4xl mx-auto">
                {segments.map((segment) => (
                  <SegmentBlock key={segment.id} segment={segment} jobDescription={jobDescription} selectedCandidate={selectedCandidate} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}