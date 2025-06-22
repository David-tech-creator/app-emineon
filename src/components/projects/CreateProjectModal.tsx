'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import {
  X,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  Briefcase,
  DollarSign,
  Clock,
  AlertCircle,
  Globe,
  Target,
  Mail,
  Phone,
  FileText,
  Sparkles,
  Copy,
  Loader2,
  CheckCircle,
  ArrowRight,
  Eye,
  Settings,
  Share2,
  Zap,
  Brain,
  UserPlus,
  Trash2
} from 'lucide-react';

// Enhanced project schema for the end-to-end workflow
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  clientName: z.string().min(1, 'Client name is required'),
  clientContact: z.string().optional(),
  clientEmail: z.string().optional(),
  clientPhone: z.string().optional(),
  totalPositions: z.number().min(1, 'At least one position is required'),
  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetRange: z.string().optional(),
  hourlyRateMin: z.number().optional(),
  hourlyRateMax: z.number().optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().optional(),
  isHybrid: z.boolean().optional(),
  skillsRequired: z.array(z.string()).optional(),
  experienceRequired: z.array(z.string()).optional(),
  industryBackground: z.string().optional(),
  languageRequirements: z.array(z.string()).optional(),
  assignedRecruiter: z.string().optional(),
  internalNotes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  // Job positions within the project
  jobPositions: z.array(z.object({
    title: z.string().min(1, 'Job title is required'),
    seniorityLevel: z.string(),
    count: z.number().min(1),
    specificSkills: z.array(z.string()).optional(),
    description: z.string().optional()
  })).min(1, 'At least one job position is required')
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  emailData?: {
    emailContent: string;
    emailSubject: string;
    senderEmail: string;
  };
}

const urgencyLevels = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' }
];

const priorityLevels = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' }
];

const seniorityLevels = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Principal',
  'Manager',
  'Director'
];

const currencies = ['EUR', 'USD', 'CHF', 'GBP'];

const commonSkills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js',
  'SQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Analysis', 'Project Management',
  'Agile', 'Scrum', 'DevOps', 'CI/CD', 'Git'
];

const commonLanguages = [
  'English', 'German', 'French', 'Spanish', 'Italian', 'Portuguese',
  'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish'
];

export function CreateProjectModal({ open, onClose, emailData }: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState<'details' | 'positions' | 'requirements' | 'review'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingEmail, setIsParsingEmail] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      urgencyLevel: 'MEDIUM',
      priority: 'MEDIUM',
      currency: 'EUR',
      isRemote: false,
      isHybrid: false,
      skillsRequired: [] as string[],
      experienceRequired: [] as string[],
      languageRequirements: [] as string[],
      internalNotes: [] as string[],
      tags: [] as string[],
      jobPositions: [{
        title: '',
        seniorityLevel: 'Mid-Level',
        count: 1,
        specificSkills: [] as string[],
        description: ''
      }]
    }
  });

  const watchedValues = watch();
  const jobPositions = watch('jobPositions') || [];

  // Auto-parse email if provided
  const parseEmailData = async () => {
    if (!emailData) return;
    
    setIsParsingEmail(true);
    try {
      const response = await fetch('/api/projects/parse-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
      if (response.ok) {
        const result = await response.json();
        const parsedData = result.parsedData;
        
        // Pre-fill form with parsed data
        setValue('name', parsedData.projectName || '');
        setValue('clientName', parsedData.clientName || '');
        setValue('totalPositions', parsedData.totalPositions || 1);
        setValue('description', parsedData.description || '');
        setValue('location', parsedData.location || '');
        setValue('isRemote', parsedData.isRemote || false);
        setValue('isHybrid', parsedData.isHybrid || false);
        setValue('skillsRequired', parsedData.skillsRequired || []);
        setValue('experienceRequired', parsedData.experienceRequired || []);
        setValue('industryBackground', parsedData.industryBackground || '');
        setValue('languageRequirements', parsedData.languageRequirements || []);
        setValue('urgencyLevel', parsedData.urgencyLevel || 'MEDIUM');
        setValue('priority', parsedData.priority || 'MEDIUM');
        setValue('budgetRange', parsedData.budgetRange || '');
        
        // Create job suggestions
        if (result.jobSuggestions && result.jobSuggestions.length > 0) {
          const positions = result.jobSuggestions.map((job: any) => ({
            title: job.title,
            seniorityLevel: job.experienceLevel || 'Mid-Level',
            count: 1,
            specificSkills: job.requirements || [],
            description: job.description || ''
          }));
          setValue('jobPositions', positions);
        }
      }
    } catch (error) {
      console.error('Error parsing email:', error);
    } finally {
      setIsParsingEmail(false);
    }
  };

  // Initialize email parsing when modal opens with email data
  useState(() => {
    if (emailData && open) {
      parseEmailData();
    }
  });

  const addJobPosition = () => {
    const currentPositions = getValues('jobPositions');
    setValue('jobPositions', [
      ...currentPositions,
      {
        title: '',
        seniorityLevel: 'Mid-Level',
        count: 1,
        specificSkills: [],
        description: ''
      }
    ]);
  };

  const removeJobPosition = (index: number) => {
    const currentPositions = getValues('jobPositions');
    if (currentPositions.length > 1) {
      setValue('jobPositions', currentPositions.filter((_, i) => i !== index));
    }
  };

  const addSkill = (skill: string, field: 'skillsRequired' | 'experienceRequired' | 'languageRequirements') => {
    const currentSkills = getValues(field) || [];
    if (!currentSkills.includes(skill)) {
      setValue(field, [...currentSkills, skill]);
    }
  };

  const removeSkill = (skill: string, field: 'skillsRequired' | 'experienceRequired' | 'languageRequirements') => {
    const currentSkills = getValues(field) || [];
    setValue(field, currentSkills.filter(s => s !== skill));
  };

  const addJobSpecificSkill = (positionIndex: number, skill: string) => {
    const currentPositions = getValues('jobPositions');
    const updatedPositions = [...currentPositions];
    const specificSkills = updatedPositions[positionIndex].specificSkills || [];
    if (!specificSkills.includes(skill)) {
      updatedPositions[positionIndex].specificSkills = [...specificSkills, skill];
      setValue('jobPositions', updatedPositions);
    }
  };

  const removeJobSpecificSkill = (positionIndex: number, skill: string) => {
    const currentPositions = getValues('jobPositions');
    const updatedPositions = [...currentPositions];
    const specificSkills = updatedPositions[positionIndex].specificSkills || [];
    updatedPositions[positionIndex].specificSkills = specificSkills.filter(s => s !== skill);
    setValue('jobPositions', updatedPositions);
  };

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Project created:', result);
        handleClose();
        // Optionally redirect to the project page
        window.location.href = `/projects/${result.id}`;
      } else {
        throw new Error('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setCurrentStep('details');
    setShowAdvanced(false);
    onClose();
  };

  const nextStep = () => {
    const steps = ['details', 'positions', 'requirements', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  const prevStep = () => {
    const steps = ['details', 'positions', 'requirements', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as any);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {emailData ? 'Create Project from Email' : 'New Project'}
              </h2>
              <p className="text-sm text-gray-500">
                {currentStep === 'details' && 'Project details and client information'}
                {currentStep === 'positions' && 'Define job positions within the project'}
                {currentStep === 'requirements' && 'Skills and requirements'}
                {currentStep === 'review' && 'Review and create project'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {[
              { key: 'details', label: 'Details', icon: Building2 },
              { key: 'positions', label: 'Positions', icon: Users },
              { key: 'requirements', label: 'Requirements', icon: Target },
              { key: 'review', label: 'Review', icon: CheckCircle }
            ].map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = ['details', 'positions', 'requirements', 'review'].indexOf(currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-100 text-blue-700' : 
                    isCompleted ? 'bg-green-100 text-green-700' : 
                    'bg-gray-100 text-gray-500'
                  }`}>
                    <step.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Project Details */}
            {currentStep === 'details' && (
              <div className="space-y-6">
                {emailData && isParsingEmail && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-700">Analyzing email content...</span>
                    </div>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <Input
                      {...register('name')}
                      placeholder="e.g., DataFlow Innovations - Data Engineers"
                      className={errors.name ? 'border-red-300' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client/Company *
                    </label>
                    <Input
                      {...register('clientName')}
                      placeholder="e.g., DataFlow Innovations"
                      className={errors.clientName ? 'border-red-300' : ''}
                    />
                    {errors.clientName && (
                      <p className="text-red-600 text-sm mt-1">{errors.clientName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Positions *
                    </label>
                    <Input
                      type="number"
                      {...register('totalPositions', { valueAsNumber: true })}
                      min="1"
                      placeholder="5"
                      className={errors.totalPositions ? 'border-red-300' : ''}
                    />
                    {errors.totalPositions && (
                      <p className="text-red-600 text-sm mt-1">{errors.totalPositions.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      {...register('location')}
                      placeholder="e.g., Carouge, Geneva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      {...register('urgencyLevel')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <Textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Describe the project, context, and objectives..."
                  />
                </div>

                {/* Work Arrangement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Work Arrangement
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('isRemote')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Remote Work Available</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('isHybrid')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Hybrid Work Available</span>
                    </label>
                  </div>
                </div>

                {/* Advanced Options */}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>Advanced Options</span>
                  </Button>

                  {showAdvanced && (
                    <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Contact Person
                          </label>
                          <Input
                            {...register('clientContact')}
                            placeholder="e.g., Emmanuel Dubois"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Email
                          </label>
                          <Input
                            type="email"
                            {...register('clientEmail')}
                            placeholder="e.g., emmanuel@company.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Client Phone
                          </label>
                          <Input
                            {...register('clientPhone')}
                            placeholder="e.g., +41 22 123 4567"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Range
                          </label>
                          <Input
                            {...register('budgetRange')}
                            placeholder="e.g., €500k - €750k"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <Input
                            type="date"
                            {...register('startDate')}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <Input
                            type="date"
                            {...register('endDate')}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry Background
                        </label>
                        <Input
                          {...register('industryBackground')}
                          placeholder="e.g., Medical/Healthcare, Financial Services, Technology"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Job Positions */}
            {currentStep === 'positions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Job Positions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addJobPosition}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Position</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  {jobPositions.map((position, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Position {index + 1}</h4>
                        {jobPositions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeJobPosition(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                          </label>
                          <Input
                            {...register(`jobPositions.${index}.title`)}
                            placeholder="e.g., Senior Data Engineer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seniority Level
                          </label>
                          <select
                            {...register(`jobPositions.${index}.seniorityLevel`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {seniorityLevels.map(level => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of Positions
                          </label>
                          <Input
                            type="number"
                            {...register(`jobPositions.${index}.count`, { valueAsNumber: true })}
                            min="1"
                            placeholder="1"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position Description
                        </label>
                        <Textarea
                          {...register(`jobPositions.${index}.description`)}
                          rows={3}
                          placeholder="Specific requirements and responsibilities for this position..."
                        />
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position-Specific Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(position.specificSkills || []).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeJobSpecificSkill(index, skill)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {commonSkills.filter(skill => !(position.specificSkills || []).includes(skill)).slice(0, 8).map(skill => (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => addJobSpecificSkill(index, skill)}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">AI Suggestion</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on your project requirements, we'll automatically create individual job postings for each position and suggest the best candidates from our database.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 'requirements' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Required Skills (Common across all positions)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {watchedValues.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill, 'skillsRequired')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills.filter(skill => !watchedValues.skillsRequired?.includes(skill)).map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill, 'skillsRequired')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Experience Requirements
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {watchedValues.experienceRequired?.map((exp, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {exp}
                        <button
                          type="button"
                          onClick={() => removeSkill(exp, 'experienceRequired')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      '3+ years experience',
                      '5+ years experience',
                      'Senior level',
                      'Team leadership',
                      'Project management',
                      'Client facing',
                      'Startup experience',
                      'Enterprise experience',
                      'Agile methodology'
                    ].filter(exp => !watchedValues.experienceRequired?.includes(exp)).map(exp => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => addSkill(exp, 'experienceRequired')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 text-left"
                      >
                        + {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Language Requirements
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {watchedValues.languageRequirements?.map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeSkill(lang, 'languageRequirements')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {commonLanguages.filter(lang => !watchedValues.languageRequirements?.includes(lang)).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => addSkill(lang, 'languageRequirements')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        + {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 'review' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Summary</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Name:</span> {watchedValues.name}</div>
                        <div><span className="font-medium">Client:</span> {watchedValues.clientName}</div>
                        <div><span className="font-medium">Total Positions:</span> {watchedValues.totalPositions}</div>
                        <div><span className="font-medium">Urgency:</span> {watchedValues.urgencyLevel}</div>
                        <div><span className="font-medium">Priority:</span> {watchedValues.priority}</div>
                        {watchedValues.location && (
                          <div><span className="font-medium">Location:</span> {watchedValues.location}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Job Positions</h4>
                      <div className="space-y-2 text-sm">
                        {jobPositions.map((position, index) => (
                          <div key={index}>
                            <span className="font-medium">{position.title}</span> ({position.seniorityLevel}) - {position.count} position{position.count > 1 ? 's' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {watchedValues.skillsRequired && watchedValues.skillsRequired.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {watchedValues.skillsRequired.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-900">Next Steps</h4>
                      <p className="text-sm text-green-700 mt-1">
                        After creating this project, we'll automatically:
                      </p>
                      <ul className="text-sm text-green-700 mt-2 list-disc list-inside space-y-1">
                        <li>Create individual job postings for each position</li>
                        <li>Run AI candidate matching against our database</li>
                        <li>Generate a client portal for project collaboration</li>
                        <li>Set up automated progress tracking and reporting</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {currentStep !== 'details' && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            
            {currentStep !== 'review' ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
