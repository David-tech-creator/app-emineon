import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CandidateData, JobDescription } from '@/types';

export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY_SCHEDULED = 'retry_scheduled',
}

export enum JobType {
  COMPETENCE_FILE_GENERATION = 'competence_file_generation',
  SECTION_GENERATION = 'section_generation',
  CANDIDATE_PROFILE_ENHANCEMENT = 'candidate_profile_enhancement',
  SKILLS_OPTIMIZATION = 'skills_optimization',
  EXPERIENCE_ENHANCEMENT = 'experience_enhancement',
  CV_PARSING = 'cv_parsing',
  CONTENT_ENHANCEMENT = 'content_enhancement',
}

export interface JobProgress {
  percentage: number;
  message: string;
  stage?: string;
  currentStep?: number;
  totalSteps?: number;
  estimatedTimeRemaining?: number;
}

export interface AIJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: JobProgress;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  retryCount: number;
  maxRetries: number;
  priority: number;
  metadata?: Record<string, any>;
}

export interface AIGenerationState {
  // Jobs state
  jobs: Record<string, AIJob>;
  activeJobs: string[];
  completedJobs: string[];
  failedJobs: string[];
  
  // Queue state
  isProcessing: boolean;
  queueSize: number;
  concurrentJobs: number;
  maxConcurrency: number;
  
  // Statistics
  totalJobs: number;
  successRate: number;
  averageProcessingTime: number;
  
  // Actions
  addJob: (job: Omit<AIJob, 'createdAt'>) => void;
  updateJob: (jobId: string, updates: Partial<AIJob>) => void;
  updateJobProgress: (jobId: string, progress: Partial<JobProgress>) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  
  // Queue management
  setProcessing: (isProcessing: boolean) => void;
  setQueueSize: (size: number) => void;
  setConcurrentJobs: (count: number) => void;
  setMaxConcurrency: (max: number) => void;
  
  // Getters
  getJob: (jobId: string) => AIJob | undefined;
  getJobsByType: (type: JobType) => AIJob[];
  getJobsByStatus: (status: JobStatus) => AIJob[];
  getActiveJobsCount: () => number;
  getQueuedJobsCount: () => number;
}

export const useAIGenerationStore = create<AIGenerationState>()(
  devtools(
    (set, get) => ({
      // Initial state
      jobs: {},
      activeJobs: [],
      completedJobs: [],
      failedJobs: [],
      
      isProcessing: false,
      queueSize: 0,
      concurrentJobs: 0,
      maxConcurrency: 5,
      
      totalJobs: 0,
      successRate: 0,
      averageProcessingTime: 0,
      
      // Actions
      addJob: (jobData) => {
        const job: AIJob = {
          ...jobData,
          createdAt: new Date(),
        };
        
        set((state) => {
          const newJobs = { ...state.jobs, [job.id]: job };
          const newActiveJobs = job.status === JobStatus.PENDING || job.status === JobStatus.IN_PROGRESS 
            ? [...state.activeJobs, job.id]
            : state.activeJobs;
          
          return {
            jobs: newJobs,
            activeJobs: newActiveJobs,
            totalJobs: state.totalJobs + 1,
            queueSize: Object.values(newJobs).filter(j => j.status === JobStatus.PENDING).length,
          };
        });
      },
      
      updateJob: (jobId, updates) => {
        set((state) => {
          const existingJob = state.jobs[jobId];
          if (!existingJob) return state;
          
          const updatedJob = { ...existingJob, ...updates };
          const newJobs = { ...state.jobs, [jobId]: updatedJob };
          
          // Update status-based arrays
          let newActiveJobs = state.activeJobs;
          let newCompletedJobs = state.completedJobs;
          let newFailedJobs = state.failedJobs;
          
          // Remove from current arrays
          newActiveJobs = newActiveJobs.filter(id => id !== jobId);
          newCompletedJobs = newCompletedJobs.filter(id => id !== jobId);
          newFailedJobs = newFailedJobs.filter(id => id !== jobId);
          
          // Add to appropriate array based on new status
          if (updatedJob.status === JobStatus.PENDING || updatedJob.status === JobStatus.IN_PROGRESS) {
            newActiveJobs.push(jobId);
          } else if (updatedJob.status === JobStatus.COMPLETED) {
            newCompletedJobs.push(jobId);
          } else if (updatedJob.status === JobStatus.FAILED) {
            newFailedJobs.push(jobId);
          }
          
          // Calculate success rate
          const totalCompleted = newCompletedJobs.length + newFailedJobs.length;
          const successRate = totalCompleted > 0 ? (newCompletedJobs.length / totalCompleted) * 100 : 0;
          
          return {
            jobs: newJobs,
            activeJobs: newActiveJobs,
            completedJobs: newCompletedJobs,
            failedJobs: newFailedJobs,
            successRate,
            queueSize: Object.values(newJobs).filter(j => j.status === JobStatus.PENDING).length,
          };
        });
      },
      
      updateJobProgress: (jobId, progress) => {
        set((state) => {
          const existingJob = state.jobs[jobId];
          if (!existingJob) return state;
          
          const updatedJob = {
            ...existingJob,
            progress: { ...existingJob.progress, ...progress }
          };
          
          return {
            jobs: { ...state.jobs, [jobId]: updatedJob }
          };
        });
      },
      
      removeJob: (jobId) => {
        set((state) => {
          const { [jobId]: removed, ...remainingJobs } = state.jobs;
          
          return {
            jobs: remainingJobs,
            activeJobs: state.activeJobs.filter(id => id !== jobId),
            completedJobs: state.completedJobs.filter(id => id !== jobId),
            failedJobs: state.failedJobs.filter(id => id !== jobId),
            queueSize: Object.values(remainingJobs).filter(j => j.status === JobStatus.PENDING).length,
          };
        });
      },
      
      clearCompleted: () => {
        set((state) => {
          const remainingJobs = Object.fromEntries(
            Object.entries(state.jobs).filter(([_, job]) => job.status !== JobStatus.COMPLETED)
          );
          
          return {
            jobs: remainingJobs,
            completedJobs: [],
            queueSize: Object.values(remainingJobs).filter(j => j.status === JobStatus.PENDING).length,
          };
        });
      },
      
      clearFailed: () => {
        set((state) => {
          const remainingJobs = Object.fromEntries(
            Object.entries(state.jobs).filter(([_, job]) => job.status !== JobStatus.FAILED)
          );
          
          return {
            jobs: remainingJobs,
            failedJobs: [],
            queueSize: Object.values(remainingJobs).filter(j => j.status === JobStatus.PENDING).length,
          };
        });
      },
      
      clearAll: () => {
        set({
          jobs: {},
          activeJobs: [],
          completedJobs: [],
          failedJobs: [],
          queueSize: 0,
          concurrentJobs: 0,
          totalJobs: 0,
          successRate: 0,
        });
      },
      
      // Queue management
      setProcessing: (isProcessing) => set({ isProcessing }),
      setQueueSize: (queueSize) => set({ queueSize }),
      setConcurrentJobs: (concurrentJobs) => set({ concurrentJobs }),
      setMaxConcurrency: (maxConcurrency) => set({ maxConcurrency }),
      
      // Getters
      getJob: (jobId) => get().jobs[jobId],
      
      getJobsByType: (type) => {
        return Object.values(get().jobs).filter(job => job.type === type);
      },
      
      getJobsByStatus: (status) => {
        return Object.values(get().jobs).filter(job => job.status === status);
      },
      
      getActiveJobsCount: () => {
        return get().activeJobs.length;
      },
      
      getQueuedJobsCount: () => {
        return Object.values(get().jobs).filter(job => job.status === JobStatus.PENDING).length;
      },
    }),
    {
      name: 'ai-generation-store',
    }
  )
);

// Helper functions for external use
export const generateJobId = (type: JobType, prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix || type}_${timestamp}_${random}`;
};

export const createJob = (
  type: JobType,
  priority: number = 5,
  metadata?: Record<string, any>
): Omit<AIJob, 'createdAt'> => {
  return {
    id: generateJobId(type),
    type,
    status: JobStatus.PENDING,
    progress: {
      percentage: 0,
      message: 'Queued for processing...',
    },
    retryCount: 0,
    maxRetries: 3,
    priority,
    metadata,
  };
};

// New Segment Model for Competence Files
interface ExperienceData {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export type Segment = {
  id: string;
  title: string; // e.g., "PROFESSIONAL SUMMARY"
  content: string;
  htmlContent?: string; // Rich HTML content from Lexical editor
  status: 'idle' | 'loading' | 'done' | 'error';
  editable: boolean;
  order: number;
  visible: boolean;
  type: string; // section type for AI prompts
  experienceData?: ExperienceData | null;
};

// Segment Store Interface
export interface SegmentState {
  segments: Segment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  addSegment: (segment: Segment) => void;
  removeSegment: (id: string) => void;
  reorderSegments: (fromIndex: number, toIndex: number) => void;
  loadFromAI: (jobData: JobDescription, candidateData: CandidateData) => Promise<void>;
  regenerateSegment: (segmentId: string, jobData: JobDescription, candidateData: CandidateData) => Promise<void>;
  improveSegment: (segmentId: string, jobData: JobDescription, candidateData: CandidateData) => Promise<void>;
  expandSegment: (segmentId: string, jobData: JobDescription, candidateData: CandidateData) => Promise<void>;
  rewriteSegment: (segmentId: string, jobData: JobDescription, candidateData: CandidateData) => Promise<void>;
  clearSegments: () => void;
  
  // Getters
  getSegmentByType: (type: string) => Segment | undefined;
  getVisibleSegments: () => Segment[];
  getSegmentsByStatus: (status: Segment['status']) => Segment[];
}

// Create the segment store
export const useSegmentStore = create<SegmentState>()(
  devtools(
    (set, get) => ({
      segments: [],
      isLoading: false,
      error: null,
      
      updateSegment: (id, updates) =>
        set(state => ({
          segments: state.segments.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }), false, 'updateSegment'),
      
      addSegment: (segment) =>
        set(state => ({
          segments: [...state.segments, segment].sort((a, b) => a.order - b.order),
        }), false, 'addSegment'),
      
      removeSegment: (id) =>
        set(state => ({
          segments: state.segments.filter(s => s.id !== id),
        }), false, 'removeSegment'),
      
      reorderSegments: (fromIndex, toIndex) =>
        set(state => {
          const newSegments = [...state.segments];
          const [reorderedItem] = newSegments.splice(fromIndex, 1);
          newSegments.splice(toIndex, 0, reorderedItem);
          
          // Update order values
          return {
            segments: newSegments.map((segment, index) => ({
              ...segment,
              order: index,
            })),
          };
        }, false, 'reorderSegments'),
      
      loadFromAI: async (jobData, candidateData) => {
        set({ isLoading: true, error: null });
        
        try {
          // ✅ JO VINKENROYE INSPIRED ORDERING - Perfect match to the screenshot
          const staticSections = [
            { id: 'header', title: 'HEADER', type: 'HEADER', order: 0 },
            { id: 'summary', title: 'EXECUTIVE SUMMARY', type: 'PROFESSIONAL SUMMARY', order: 1 },
            { id: 'core-competencies', title: 'CORE COMPETENCIES', type: 'AREAS OF EXPERTISE', order: 2 },
            { id: 'education', title: 'ACADEMIC QUALIFICATIONS', type: 'EDUCATION', order: 3 }, // ✅ Right after Core Competencies
            { id: 'certifications', title: 'PROFESSIONAL CERTIFICATIONS', type: 'CERTIFICATIONS', order: 4 }, // ✅ Right after Education
            { id: 'experiences-summary', title: 'PROFESSIONAL EXPERIENCE SUMMARY', type: 'PROFESSIONAL EXPERIENCES SUMMARY', order: 5 }, // ✅ Right after Certifications
            { id: 'technical', title: 'TECHNICAL EXPERTISE', type: 'TECHNICAL SKILLS', order: 6 },
            { id: 'skills', title: 'FUNCTIONAL SKILLS', type: 'FUNCTIONAL SKILLS', order: 7 },
            { id: 'languages', title: 'LANGUAGES & SKILLS', type: 'LANGUAGES', order: 8 },
          ];

          // 🔁 Dynamic PROFESSIONAL EXPERIENCES - Generate based on candidate's work history
          const experienceSections: Segment[] = [];
          const candidateExperiences = candidateData.experience || [];
          
          if (candidateExperiences.length > 0) {
            candidateExperiences.forEach((exp: any, index: number) => {
              experienceSections.push({
                id: `experience-${index}`,
                title: `PROFESSIONAL EXPERIENCE ${index + 1}`,
                type: `PROFESSIONAL EXPERIENCE ${index + 1}`,
                content: '',
                status: 'idle' as const,
                editable: true,
                order: 9 + index, // Start after LANGUAGES (order 8)
                visible: true,
                experienceData: exp
              });
            });
          } else {
            // Fallback: If no experience data, create 2 generic experience sections
            console.log('⚠️ No work history found, creating generic experience sections');
            for (let i = 0; i < 2; i++) {
              experienceSections.push({
                id: `experience-${i}`,
                title: `PROFESSIONAL EXPERIENCE ${i + 1}`,
                type: `PROFESSIONAL EXPERIENCE ${i + 1}`,
                content: '',
                status: 'idle' as const,
                editable: true,
                order: 9 + i,
                visible: true,
                experienceData: null
              });
            }
          }

          // Combine all sections
          const allSections = [
            ...staticSections,
            ...experienceSections
          ].map(section => ({
            ...section,
            visible: true,
            editable: true,
            status: 'idle' as const
          }));

          console.log(`🚀 Starting AI content generation with JO VINKENROYE ORDERING for ${allSections.length} segments...`);
          console.log('📋 New Jo Vinkenroye section order:', allSections.map(s => `${s.order}: ${s.title}`));
          
          // Generate content for all sections in parallel with retry logic
          const results = await Promise.allSettled(
            allSections.map(async (section) => {
              console.log(`🔄 Generating: ${section.title} (type: ${section.type})`);
              
              const response = await fetch('/api/openai-responses', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                            body: JSON.stringify({
              segmentType: section.type,
              candidateData,
              jobDescription: jobData,
              order: section.order,
            }),
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'API request failed'}`);
              }

              const data = await response.json();
              
              if (!data.success) {
                throw new Error(data.error || 'AI generation failed');
              }

              return {
                ...section,
                content: data.content,
                status: 'done' as const,
              };
            })
          );

          // Process results and handle failures
          const segments: Segment[] = [];
          
          results.forEach((result, index) => {
            const section = allSections[index];
            if (result.status === 'fulfilled') {
              segments.push(result.value);
              console.log(`✅ ${section.title} - Generated successfully`);
            } else {
              console.error(`❌ ${section.title} - Generation failed:`, result.reason);
              segments.push({
                ...section,
                content: `Generation failed. Try regenerating this section.`,
                status: 'error' as const,
              });
            }
          });

          set({ segments, isLoading: false });
          console.log(`🎉 JO VINKENROYE INSPIRED AI content generation completed! Generated ${segments.length} segments`);
          
        } catch (error) {
          console.error('💥 Critical error during AI content generation:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to generate content',
            isLoading: false 
          });
          throw error;
        }
      },
      
      regenerateSegment: async (segmentId, jobData, candidateData) => {
        const segment = get().segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        console.log(`🔄 Regenerating segment: ${segment.title} (type: ${segment.type})`);
        
        // Update segment to loading state
        get().updateSegment(segmentId, { status: 'loading' });
        
        try {
          const response = await fetch('/api/openai-responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              segmentType: segment.type,  // This should already be the correct section type from loadFromAI
              candidateData,
              jobDescription: jobData,
              order: segment.order, // Include order for proper sequencing
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'API request failed'}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'AI generation failed');
          }

          // Update segment with new content
          get().updateSegment(segmentId, {
            content: data.content,
            status: 'done',
          });
          
          console.log(`✅ Segment ${segment.title} regenerated successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to regenerate ${segment.title}:`, error);
          get().updateSegment(segmentId, {
            content: `Generation failed. Try regenerating this section.`,
            status: 'error',
          });
          throw error;
        }
      },
      
      improveSegment: async (segmentId, jobData, candidateData) => {
        const segment = get().segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        console.log(`🎨 Improving segment: ${segment.title} (type: ${segment.type})`);
        
        // Update segment to loading state
        get().updateSegment(segmentId, { status: 'loading' });
        
        try {
          const response = await fetch('/api/openai-responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              segmentType: segment.type,
              candidateData,
              jobDescription: jobData,
              order: segment.order,
              enhancementAction: 'improve',
              existingContent: segment.content,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'API request failed'}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'AI enhancement failed');
          }

          // Update segment with improved content
          get().updateSegment(segmentId, {
            content: data.content,
            status: 'done',
          });
          
          console.log(`✅ Segment ${segment.title} improved successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to improve ${segment.title}:`, error);
          get().updateSegment(segmentId, {
            status: 'error',
          });
          throw error;
        }
      },
      
      expandSegment: async (segmentId, jobData, candidateData) => {
        const segment = get().segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        console.log(`📈 Expanding segment: ${segment.title} (type: ${segment.type})`);
        
        // Update segment to loading state
        get().updateSegment(segmentId, { status: 'loading' });
        
        try {
          const response = await fetch('/api/openai-responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              segmentType: segment.type,
              candidateData,
              jobDescription: jobData,
              order: segment.order,
              enhancementAction: 'expand',
              existingContent: segment.content,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'API request failed'}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'AI enhancement failed');
          }

          // Update segment with expanded content
          get().updateSegment(segmentId, {
            content: data.content,
            status: 'done',
          });
          
          console.log(`✅ Segment ${segment.title} expanded successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to expand ${segment.title}:`, error);
          get().updateSegment(segmentId, {
            status: 'error',
          });
          throw error;
        }
      },
      
      rewriteSegment: async (segmentId, jobData, candidateData) => {
        const segment = get().segments.find(s => s.id === segmentId);
        if (!segment) return;
        
        console.log(`✍️ Rewriting segment: ${segment.title} (type: ${segment.type})`);
        
        // Update segment to loading state
        get().updateSegment(segmentId, { status: 'loading' });
        
        try {
          const response = await fetch('/api/openai-responses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              segmentType: segment.type,
              candidateData,
              jobDescription: jobData,
              order: segment.order,
              enhancementAction: 'rewrite',
              existingContent: segment.content,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || 'API request failed'}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'AI enhancement failed');
          }

          // Update segment with rewritten content
          get().updateSegment(segmentId, {
            content: data.content,
            status: 'done',
          });
          
          console.log(`✅ Segment ${segment.title} rewritten successfully`);
          
        } catch (error) {
          console.error(`❌ Failed to rewrite ${segment.title}:`, error);
          get().updateSegment(segmentId, {
            status: 'error',
          });
          throw error;
        }
      },
      
      clearSegments: () => set({ segments: [], isLoading: false, error: null }),
      
      // Getters
      getSegmentByType: (type) => get().segments.find(s => s.type === type),
      getVisibleSegments: () => get().segments.filter(s => s.visible),
      getSegmentsByStatus: (status) => get().segments.filter(s => s.status === status),
    }),
    {
      name: 'segment-store',
    }
  )
); 