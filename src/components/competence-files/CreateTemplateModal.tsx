'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  FileText,
  Settings,
  Target,
  Zap,
  Eye,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Code,
  Users,
  Award,
  BookOpen,
  Languages,
  Briefcase,
  Star,
  Tag,
  Globe,
  Wrench,
  Brain,
  Shield,
  PenTool,
  Monitor,
  Database,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

// Template schema
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  targetLevel: z.string().min(1, 'Target level is required'),
  industry: z.string().optional(),
  competencies: z.array(z.object({
    id: z.string(),
    category: z.string(),
    name: z.string(),
    type: z.enum(['technical', 'soft', 'experience', 'certification', 'language']),
    required: z.boolean(),
    weight: z.number().min(1).max(10)
  })).min(1, 'At least one competency is required'),
  assessmentCriteria: z.object({
    scoringSystem: z.enum(['scale_1_5', 'percentage', 'pass_fail']),
    proficiencyLevels: z.array(z.string()),
    assessmentMethods: z.array(z.string())
  }),
  configuration: z.object({
    autoScoring: z.boolean(),
    minThreshold: z.number().optional(),
    integrationSettings: z.object({
      linkToJobs: z.boolean(),
      teamAccess: z.boolean()
    })
  })
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (template: any) => void;
}

// Predefined skill categories and suggestions
const skillCategories = {
  technical: {
    icon: Code,
    label: 'Technical Skills',
    suggestions: [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'SQL',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD'
    ]
  },
  soft: {
    icon: Users,
    label: 'Soft Skills',
    suggestions: [
      'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Analytical Thinking',
      'Time Management', 'Adaptability', 'Conflict Resolution', 'Project Management'
    ]
  },
  experience: {
    icon: Briefcase,
    label: 'Experience Areas',
    suggestions: [
      'Enterprise Architecture', 'Microservices', 'DevOps', 'Agile/Scrum', 'System Design',
      'Performance Optimization', 'Security Implementation', 'Data Architecture'
    ]
  },
  certification: {
    icon: Award,
    label: 'Certifications',
    suggestions: [
      'AWS Certified', 'Azure Certified', 'Scrum Master', 'PMP', 'CISSP', 'CISA',
      'Google Cloud Certified', 'Kubernetes Certified', 'Oracle Certified'
    ]
  },
  language: {
    icon: Languages,
    label: 'Languages',
    suggestions: [
      'English', 'German', 'French', 'Spanish', 'Italian', 'Chinese', 'Japanese'
    ]
  }
};

const departmentCategories = [
  'Engineering',
  'Product Management',
  'Design',
  'Data Science',
  'DevOps',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations'
];

const targetLevels = [
  'Junior (0-2 years)',
  'Mid-level (3-5 years)',
  'Senior (5-8 years)',
  'Lead (8+ years)',
  'All Levels'
];

const industries = [
  'Financial Services',
  'Technology',
  'Healthcare',
  'Consulting',
  'Manufacturing',
  'Retail',
  'Insurance',
  'Government',
  'Education',
  'Other'
];

export function CreateTemplateModal({ open, onClose, onSave }: CreateTemplateModalProps) {
  const [currentStep, setCurrentStep] = useState<'basics' | 'competencies' | 'assessment' | 'configuration' | 'preview'>('basics');
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof skillCategories>('technical');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      targetLevel: '',
      industry: '',
      competencies: [],
      assessmentCriteria: {
        scoringSystem: 'scale_1_5',
        proficiencyLevels: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        assessmentMethods: ['Interview', 'Technical Test', 'Portfolio Review']
      },
      configuration: {
        autoScoring: true,
        minThreshold: 60,
        integrationSettings: {
          linkToJobs: true,
          teamAccess: true
        }
      }
    }
  });

  const addCompetency = (name: string, category: keyof typeof skillCategories) => {
    const newCompetency = {
      id: Date.now().toString(),
      category: skillCategories[category].label,
      name,
      type: category,
      required: false,
      weight: 5
    };
    setCompetencies([...competencies, newCompetency]);
  };

  const removeCompetency = (id: string) => {
    setCompetencies(competencies.filter(c => c.id !== id));
  };

  const updateCompetency = (id: string, updates: Partial<any>) => {
    setCompetencies(competencies.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const onSubmit = (data: any) => {
    const templateData = {
      ...data,
      competencies,
      createdAt: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    onSave?.(templateData);
    handleClose();
  };

  const handleClose = () => {
    setCurrentStep('basics');
    setCompetencies([]);
    setSearchQuery('');
    reset();
    onClose();
  };

  const nextStep = () => {
    const steps = ['basics', 'competencies', 'assessment', 'configuration', 'preview'] as const;
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps = ['basics', 'competencies', 'assessment', 'configuration', 'preview'] as const;
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const getStepNumber = (step: string) => {
    const steps = ['basics', 'competencies', 'assessment', 'configuration', 'preview'];
    return steps.indexOf(step) + 1;
  };

  const isStepCompleted = (step: string) => {
    const steps = ['basics', 'competencies', 'assessment', 'configuration', 'preview'];
    return steps.indexOf(step) < steps.indexOf(currentStep);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Competence Template</h2>
              <p className="text-gray-600">
                {currentStep === 'basics' && 'Define template fundamentals'}
                {currentStep === 'competencies' && 'Build your competency framework'}
                {currentStep === 'assessment' && 'Set evaluation criteria'}
                {currentStep === 'configuration' && 'Configure rules and automation'}
                {currentStep === 'preview' && 'Review and publish template'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[
              { key: 'basics', label: 'Template Basics', icon: FileText },
              { key: 'competencies', label: 'Competency Framework', icon: Target },
              { key: 'assessment', label: 'Assessment Criteria', icon: Star },
              { key: 'configuration', label: 'Configuration', icon: Settings },
              { key: 'preview', label: 'Preview & Publish', icon: Eye }
            ].map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = isStepCompleted(step.key);
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive ? 'bg-primary-100 text-primary-600' : 
                      isCompleted ? 'bg-green-100 text-green-600' : 
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : getStepNumber(step.key)}
                    </div>
                    <span className="font-medium hidden sm:block">{step.label}</span>
                  </div>
                  {index < 4 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Step 1: Template Basics */}
          {currentStep === 'basics' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Define your template's core information and purpose</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                    <input
                      {...register('name')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Senior Software Engineer Template"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category/Department *</label>
                    <select
                      {...register('category')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select category</option>
                      {departmentCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Level *</label>
                    <select
                      {...register('targetLevel')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select target level</option>
                      {targetLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    {errors.targetLevel && <p className="text-red-600 text-sm mt-1">{errors.targetLevel.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe the purpose and use case for this template..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry Focus</label>
                    <select
                      {...register('industry')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select industry (optional)</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Competency Framework */}
          {currentStep === 'competencies' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Build your competency framework with skills and expertise areas</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Skill Categories */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Add Competencies</h4>
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(skillCategories).map(([key, category]) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedCategory(key as keyof typeof skillCategories)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedCategory === key
                              ? 'bg-primary-100 text-primary-700 border border-primary-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search skills or add custom..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Suggested {skillCategories[selectedCategory].label}</p>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {skillCategories[selectedCategory].suggestions
                        .filter(skill => 
                          skill.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          !competencies.some(c => c.name.toLowerCase() === skill.toLowerCase())
                        )
                        .map(skill => (
                          <button
                            key={skill}
                            onClick={() => addCompetency(skill, selectedCategory)}
                            className="px-3 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm transition-colors"
                          >
                            <Plus className="h-3 w-3 inline mr-1" />
                            {skill}
                          </button>
                        ))}
                      
                      {/* Add custom skill */}
                      {searchQuery && !skillCategories[selectedCategory].suggestions.some(s => 
                        s.toLowerCase() === searchQuery.toLowerCase()
                      ) && (
                        <button
                          onClick={() => {
                            addCompetency(searchQuery, selectedCategory);
                            setSearchQuery('');
                          }}
                          className="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-full text-sm transition-colors"
                        >
                          <Plus className="h-3 w-3 inline mr-1" />
                          Add "{searchQuery}"
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Competencies */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Selected Competencies</h4>
                    <span className="text-sm text-gray-500">{competencies.length} items</span>
                  </div>

                  {competencies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No competencies added yet</p>
                      <p className="text-sm">Select skills from the categories on the left</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {competencies.map(competency => (
                        <Card key={competency.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900">{competency.name}</span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  {competency.category}
                                </span>
                              </div>
                              <button
                                onClick={() => removeCompetency(competency.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={competency.required}
                                  onChange={(e) => updateCompetency(competency.id, { required: e.target.checked })}
                                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600">Required</span>
                              </label>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Weight:</span>
                                <input
                                  type="range"
                                  min="1"
                                  max="10"
                                  value={competency.weight}
                                  onChange={(e) => updateCompetency(competency.id, { weight: parseInt(e.target.value) })}
                                  className="w-20"
                                />
                                <span className="text-sm font-medium text-gray-900 w-8">{competency.weight}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assessment Criteria */}
          {currentStep === 'assessment' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Define how competencies will be evaluated and scored</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Scoring System</label>
                    <div className="space-y-3">
                      {[
                        { value: 'scale_1_5', label: '1-5 Scale', desc: 'Rate skills from 1 (beginner) to 5 (expert)' },
                        { value: 'percentage', label: 'Percentage', desc: 'Score from 0% to 100%' },
                        { value: 'pass_fail', label: 'Pass/Fail', desc: 'Simple binary assessment' }
                      ].map(option => (
                        <label key={option.value} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer">
                          <input
                            type="radio"
                            {...register('assessmentCriteria.scoringSystem')}
                            value={option.value}
                            className="mt-1 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Assessment Methods</label>
                    <div className="space-y-2">
                      {[
                        { value: 'interview', label: 'Interview Assessment' },
                        { value: 'technical_test', label: 'Technical Test' },
                        { value: 'portfolio', label: 'Portfolio Review' },
                        { value: 'presentation', label: 'Presentation/Demo' },
                        { value: 'peer_review', label: 'Peer Review' }
                      ].map(method => (
                        <label key={method.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={method.value}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-gray-700">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Proficiency Levels</label>
                    <div className="space-y-2">
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level, index) => (
                        <div key={level} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Zap className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Assessment Tips</h4>
                        <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                          <li>• Use consistent criteria across all assessments</li>
                          <li>• Provide clear examples for each proficiency level</li>
                          <li>• Consider multiple assessment methods for accuracy</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Configuration */}
          {currentStep === 'configuration' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Configure template rules, automation, and integration settings</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-primary-600" />
                      <span>Automation Settings</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('configuration.autoScoring')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Auto-scoring</div>
                          <div className="text-sm text-gray-600">Automatically calculate overall scores</div>
                        </div>
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Threshold (%)
                        </label>
                        <input
                          type="number"
                          {...register('configuration.minThreshold')}
                          min="0"
                          max="100"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="60"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Minimum score required for qualification
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-primary-600" />
                      <span>Integration Settings</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('configuration.integrationSettings.linkToJobs')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Link to Job Postings</div>
                          <div className="text-sm text-gray-600">Connect with job requirements</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          {...register('configuration.integrationSettings.teamAccess')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Team Access</div>
                          <div className="text-sm text-gray-600">Allow team members to use this template</div>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Required Competencies</h5>
                      <p className="text-sm text-gray-600">
                        {competencies.filter(c => c.required).length} out of {competencies.length} competencies are required
                      </p>
                      <div className="space-y-1">
                        {competencies.filter(c => c.required).slice(0, 3).map(comp => (
                          <div key={comp.id} className="text-sm text-gray-700 flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>{comp.name}</span>
                          </div>
                        ))}
                        {competencies.filter(c => c.required).length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{competencies.filter(c => c.required).length - 3} more...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-900">Weighted Scoring</h5>
                      <p className="text-sm text-gray-600">
                        Total weight: {competencies.reduce((sum, c) => sum + c.weight, 0)} points
                      </p>
                      <div className="text-sm text-gray-600">
                        High-weight competencies will have more impact on overall score
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Preview */}
          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Review your template before publishing</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Summary */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Summary</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900">{watch('name') || 'Untitled Template'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Category:</span>
                        <p className="text-gray-900">{watch('category') || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Target Level:</span>
                        <p className="text-gray-900">{watch('targetLevel') || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Industry:</span>
                        <p className="text-gray-900">{watch('industry') || 'General'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Description:</span>
                        <p className="text-gray-900">{watch('description') || 'No description provided'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Competencies Overview */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Competencies Overview</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Competencies:</span>
                        <span className="font-medium text-gray-900">{competencies.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Required:</span>
                        <span className="font-medium text-gray-900">{competencies.filter(c => c.required).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Weight:</span>
                        <span className="font-medium text-gray-900">{competencies.reduce((sum, c) => sum + c.weight, 0)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {Object.entries(skillCategories).map(([key, category]) => {
                          const count = competencies.filter(c => c.type === key).length;
                          return count > 0 ? (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-600">{category.label}:</span>
                              <span className="font-medium text-gray-900">{count}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sample Template Preview */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Template Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-12 w-12 mx-auto mb-3" />
                      <p className="font-medium">Competence File Preview</p>
                      <p className="text-sm">This is how generated competence files will be structured</p>
                      <div className="mt-4 text-left max-w-md mx-auto space-y-2 text-xs">
                        <div className="font-medium">Structure will include:</div>
                        <div>• Candidate header information</div>
                        <div>• Skills assessment based on your framework</div>
                        <div>• Technical knowledge categorization</div>
                        <div>• Experience mapping</div>
                        <div>• Certification tracking</div>
                        <div>• Language proficiency</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {currentStep !== 'basics' && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
                         {currentStep === 'preview' ? (
               <>
                 <Button variant="outline" onClick={handleSubmit(onSubmit)}>
                   Save as Draft
                 </Button>
                 <Button onClick={handleSubmit(onSubmit)} className="bg-primary-600 hover:bg-primary-700 text-white">
                   Publish Template
                 </Button>
               </>
             ) : (
              <Button onClick={nextStep} className="bg-primary-600 hover:bg-primary-700 text-white">
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 