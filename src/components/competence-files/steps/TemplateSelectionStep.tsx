'use client';

import React from 'react';
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
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle
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

interface TemplateSelectionStepProps {
  selectedCandidate: CandidateData;
  selectedTemplate: 'professional' | 'modern' | 'minimal' | 'emineon' | 'antaes';
  onTemplateSelect: (template: 'professional' | 'modern' | 'minimal' | 'emineon' | 'antaes') => void;
  documentSections: DocumentSection[];
  onSectionsUpdate: (sections: DocumentSection[]) => void;
  customElements: string[];
  onCustomElementsUpdate: (elements: string[]) => void;
  newElementInput: string;
  onNewElementInputChange: (value: string) => void;
  onAddCustomElement: () => void;
  onRemoveCustomElement: (element: string) => void;
  jobDescription?: {
    text: string;
    requirements: string[];
    skills: string[];
    responsibilities: string;
    title?: string;
    company?: string;
  };
}

// Sortable Section Item Component
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

export function TemplateSelectionStep({
  selectedCandidate,
  selectedTemplate,
  onTemplateSelect,
  documentSections,
  onSectionsUpdate,
  customElements,
  onCustomElementsUpdate,
  newElementInput,
  onNewElementInputChange,
  onAddCustomElement,
  onRemoveCustomElement,
  jobDescription
}: TemplateSelectionStepProps) {
  // DND Kit sensors
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

  const handleToggleVisibility = (sectionId: string) => {
    const updatedSections = documentSections.map(section =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    );
    onSectionsUpdate(updatedSections);
  };

  const handleDeleteCustomSection = (sectionId: string) => {
    const updatedSections = documentSections.filter(section => section.id !== sectionId);
    onSectionsUpdate(updatedSections);
  };

  const templates = [
    {
      id: 'emineon' as const,
      name: 'Emineon',
      description: 'Professional consulting template with clean design',
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-800'
    },
    {
      id: 'antaes' as const,
      name: 'Antaes',
      description: 'Executive-level template with premium styling',
      color: 'bg-purple-100 border-purple-300',
      textColor: 'text-purple-800'
    },
    {
      id: 'professional' as const,
      name: 'Professional',
      description: 'Classic business template for corporate environments',
      color: 'bg-gray-100 border-gray-300',
      textColor: 'text-gray-800'
    },
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Contemporary design with clean lines',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-800'
    },
    {
      id: 'minimal' as const,
      name: 'Minimal',
      description: 'Clean, simple layout focusing on content',
      color: 'bg-orange-100 border-orange-300',
      textColor: 'text-orange-800'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customize Your Competence File</h3>
              <p className="text-gray-600">Choose a template and select which sections to include</p>
            </div>

            {/* AI Optimization Preview */}
            {jobDescription && (jobDescription.text || jobDescription.title) && (
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900 mb-2">AI-Powered Section Optimization</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      Based on the job description{jobDescription.title && ` for "${jobDescription.title}"`}, 
                      AI will automatically optimize each section with relevant content that highlights 
                      your candidate's alignment with the role requirements.
                    </p>
                    {jobDescription.skills && jobDescription.skills.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Key Skills to Highlight:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {jobDescription.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {jobDescription.skills.length > 5 && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                              +{jobDescription.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-blue-600">
                      💡 Sections will be intelligently populated with optimized content in the next step
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
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
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Select Template</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onTemplateSelect(template.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-4 h-4 rounded ${template.color}`}></div>
                          <h5 className="font-semibold text-gray-900">{template.name}</h5>
                          {selectedTemplate === template.id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Section Configuration */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Configure Sections</h4>
              <p className="text-sm text-gray-600 mb-4">
                Drag to reorder sections, click the eye icon to show/hide, or remove custom sections
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={documentSections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {documentSections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <SortableSectionItem
                          key={section.id}
                          section={section}
                          onToggleVisibility={handleToggleVisibility}
                          onDelete={section.type === 'custom' ? handleDeleteCustomSection : undefined}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            
            {/* Custom Elements */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Custom Elements</h4>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newElementInput}
                  onChange={(e) => onNewElementInputChange(e.target.value)}
                  placeholder="Enter custom section name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      onAddCustomElement();
                    }
                  }}
                />
                <Button
                  onClick={onAddCustomElement}
                  disabled={!newElementInput.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {customElements.length > 0 && (
                <div className="space-y-2">
                  {customElements.map((element, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{element}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveCustomElement(element)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Template Preview */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-4">Section Preview</h4>
              <Card className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Active sections in order:
                  </p>
                  {documentSections
                    .filter(section => section.visible)
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="text-sm text-gray-700">{section.title}</span>
                      </div>
                    ))}
                  {documentSections.filter(section => section.visible).length === 0 && (
                    <p className="text-sm text-gray-500">No sections selected</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 