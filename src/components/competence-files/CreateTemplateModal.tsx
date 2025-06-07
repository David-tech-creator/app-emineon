'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Building2, 
  Settings,
  Eye,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (templateData: any) => void;
}

interface TemplateSection {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  order: number;
}

const defaultSections: TemplateSection[] = [
  { id: '1', name: 'Professional Summary', description: 'Brief overview of candidate experience', isRequired: true, order: 1 },
  { id: '2', name: 'Technical Skills', description: 'Programming languages, frameworks, tools', isRequired: true, order: 2 },
  { id: '3', name: 'Work Experience', description: 'Professional work history', isRequired: true, order: 3 },
  { id: '4', name: 'Education', description: 'Academic background and certifications', isRequired: false, order: 4 },
  { id: '5', name: 'Key Projects', description: 'Notable projects and achievements', isRequired: false, order: 5 },
  { id: '6', name: 'Soft Skills', description: 'Communication, leadership, teamwork', isRequired: false, order: 6 }
];

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: CreateTemplateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [isClientSpecific, setIsClientSpecific] = useState(false);
  const [sections, setSections] = useState<TemplateSection[]>(defaultSections);
  const [customSection, setCustomSection] = useState({ name: '', description: '' });

  const resetModal = () => {
    setCurrentStep(1);
    setTemplateName('');
    setTemplateDescription('');
    setClientName('');
    setIsClientSpecific(false);
    setSections(defaultSections);
    setCustomSection({ name: '', description: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAddCustomSection = () => {
    if (customSection.name.trim()) {
      const newSection: TemplateSection = {
        id: Date.now().toString(),
        name: customSection.name,
        description: customSection.description,
        isRequired: false,
        order: sections.length + 1
      };
      setSections([...sections, newSection]);
      setCustomSection({ name: '', description: '' });
    }
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const handleToggleRequired = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, isRequired: !s.isRequired } : s
    ));
  };

  const handleCreateTemplate = () => {
    const templateData = {
      name: templateName,
      description: templateDescription,
      client: isClientSpecific ? clientName : null,
      sections: sections.map(s => s.name),
      sectionDetails: sections,
      isClientSpecific,
      createdAt: new Date().toISOString(),
      status: 'Active'
    };
    
    onSuccess(templateData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Template</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Configure Sections' :
                'Review & Create'
              }
            </p>
          </div>
          <Button variant="ghost" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-center space-x-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step < currentStep ? <Check className="h-4 w-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Template Information</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Set up the basic details for your competence file template</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Template Name *</label>
                    <Input
                      placeholder="e.g., UBS Tech Template, Standard CV Template"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      placeholder="Brief description of when to use this template..."
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="clientSpecific"
                        checked={isClientSpecific}
                        onChange={(e) => setIsClientSpecific(e.target.checked)}
                        className="rounded border-gray-300 h-4 w-4"
                      />
                      <label htmlFor="clientSpecific" className="text-sm font-medium text-gray-700">
                        Client-specific template
                      </label>
                    </div>

                    {isClientSpecific && (
                      <div className="space-y-2 ml-7">
                        <label className="text-sm font-medium text-gray-700">Client Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="e.g., UBS, Credit Suisse, Zurich Insurance"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Configure Sections */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Settings className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Configure Sections</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Choose which sections to include in your template</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Existing Sections */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Template Sections</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {sections.map((section) => (
                        <Card key={section.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h5 className="font-medium text-gray-900">{section.name}</h5>
                                  {section.isRequired && (
                                    <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200">
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{section.description}</p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleRequired(section.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check className={`h-4 w-4 ${section.isRequired ? 'text-red-600' : 'text-gray-400'}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSection(section.id)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Add Custom Section</h4>
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Section Name</label>
                              <Input
                                placeholder="e.g., Certifications, Languages"
                                value={customSection.name}
                                onChange={(e) => setCustomSection({ ...customSection, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Description</label>
                              <Input
                                placeholder="Brief description of this section"
                                value={customSection.description}
                                onChange={(e) => setCustomSection({ ...customSection, description: e.target.value })}
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleAddCustomSection}
                            disabled={!customSection.name.trim()}
                            variant="outline"
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Section
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Create */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Review Template</h3>
                  <p className="text-gray-600 max-w-md mx-auto">Review your template configuration before creating</p>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Template Info */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Template Information</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Name:</span>
                          <span className="text-gray-900">{templateName}</span>
                        </div>
                        {templateDescription && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">Description:</span>
                            <span className="text-gray-900 text-right max-w-md">{templateDescription}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Type:</span>
                          <span className="text-gray-900">
                            {isClientSpecific ? `Client-specific (${clientName})` : 'General template'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-700">Sections:</span>
                          <span className="text-gray-900">{sections.length} sections</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sections Preview */}
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Sections ({sections.length})</h4>
                      <div className="space-y-3">
                        {sections.map((section, index) => (
                          <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                              <span className="font-medium text-gray-900">{section.name}</span>
                              {section.isRequired && (
                                <Badge variant="outline" className="text-xs text-red-700 bg-red-50 border-red-200">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="h-10"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button variant="ghost" onClick={handleClose} className="h-10">
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && (!templateName.trim() || (isClientSpecific && !clientName.trim()))) ||
                  (currentStep === 2 && sections.length === 0)
                }
                className="h-10 px-6"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleCreateTemplate}
                className="bg-green-600 hover:bg-green-700 h-10 px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 