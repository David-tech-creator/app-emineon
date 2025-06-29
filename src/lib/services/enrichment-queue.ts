import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '@/lib/prisma';
import { competenceEnrichmentService } from '@/lib/ai/competence-enrichment';
import type { CandidateData, JobDescription } from '@/types';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
};

// Create Redis instances
const connection = new Redis(redisConfig);

// Queue configuration
const queueConfig = {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    attempts: 3,           // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,         // Start with 2 second delay
    },
  },
};

// Define job types
export enum EnrichmentJobType {
  COMPETENCE_FILE_GENERATION = 'competence_file_generation',
  CANDIDATE_PROFILE_ENHANCEMENT = 'candidate_profile_enhancement',
  BULK_CANDIDATE_ENRICHMENT = 'bulk_candidate_enrichment',
  SKILLS_OPTIMIZATION = 'skills_optimization',
  EXPERIENCE_ENHANCEMENT = 'experience_enhancement',
}

export enum EnrichmentJobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY_SCHEDULED = 'retry_scheduled',
}

export enum EnrichmentJobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  URGENT = 15,
  CRITICAL = 20,
}

// Job data interfaces
export interface BaseJobData {
  candidateId?: string;
  candidateData?: CandidateData;
  jobDescription?: JobDescription;
  userId: string;
  clientName?: string;
  template?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface CompetenceFileJobData extends BaseJobData {
  type: EnrichmentJobType.COMPETENCE_FILE_GENERATION;
  sections: string[];
  format: 'pdf' | 'docx' | 'draft';
  managerContact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface ProfileEnhancementJobData extends BaseJobData {
  type: EnrichmentJobType.CANDIDATE_PROFILE_ENHANCEMENT;
  enhancementTypes: string[];
}

export interface BulkEnrichmentJobData extends BaseJobData {
  type: EnrichmentJobType.BULK_CANDIDATE_ENRICHMENT;
  candidateIds: string[];
  batchSize?: number;
}

export type EnrichmentJobData = 
  | CompetenceFileJobData 
  | ProfileEnhancementJobData 
  | BulkEnrichmentJobData;

// Job result interfaces
export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime: number;
  tokensUsed?: number;
  metrics?: Record<string, any>;
}

export interface QueueJobProgress {
  percentage: number;
  message: string;
  stage?: string;
  completed?: number;
  total?: number;
  metadata?: Record<string, any>;
}

// Create queues for different priorities
const queues = {
  critical: new Queue('enrichment-critical', queueConfig),
  high: new Queue('enrichment-high', queueConfig),
  normal: new Queue('enrichment-normal', queueConfig),
  low: new Queue('enrichment-low', queueConfig),
};

export class EnrichmentQueueService {
  private workers: Worker[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeWorkers();
  }

  /**
   * Initialize queue workers for different priorities
   */
  private initializeWorkers() {
    if (this.isInitialized) return;

    // Critical priority worker (highest concurrency)
    this.workers.push(new Worker('enrichment-critical', this.processJob.bind(this), {
      ...queueConfig,
      concurrency: 5,
      stalledInterval: 30000,
      maxStalledCount: 1,
    }));

    // High priority worker
    this.workers.push(new Worker('enrichment-high', this.processJob.bind(this), {
      ...queueConfig,
      concurrency: 3,
      stalledInterval: 45000,
      maxStalledCount: 1,
    }));

    // Normal priority worker
    this.workers.push(new Worker('enrichment-normal', this.processJob.bind(this), {
      ...queueConfig,
      concurrency: 2,
      stalledInterval: 60000,
      maxStalledCount: 2,
    }));

    // Low priority worker
    this.workers.push(new Worker('enrichment-low', this.processJob.bind(this), {
      ...queueConfig,
      concurrency: 1,
      stalledInterval: 90000,
      maxStalledCount: 3,
    }));

    // Set up event listeners for all workers
    this.workers.forEach((worker, index) => {
      const priority = ['critical', 'high', 'normal', 'low'][index];
      
      worker.on('completed', (job) => {
        console.log(`✅ [${priority.toUpperCase()}] Job ${job.id} completed successfully`);
        this.updateJobStatus(job.data.sessionId || job.id, EnrichmentJobStatus.COMPLETED, {
          completedAt: new Date(),
          result: job.returnvalue,
        });
      });

      worker.on('failed', (job, err) => {
        console.error(`❌ [${priority.toUpperCase()}] Job ${job?.id} failed:`, err.message);
        this.updateJobStatus(job?.data.sessionId || job?.id, EnrichmentJobStatus.FAILED, {
          error: err.message,
          retryCount: job?.attemptsMade || 0,
        });
      });

      worker.on('progress', (job, progress) => {
        console.log(`📊 [${priority.toUpperCase()}] Job ${job.id} progress:`, progress);
        this.updateJobProgress(job.data.sessionId || job.id, progress as QueueJobProgress);
      });

      worker.on('stalled', (jobId) => {
        console.warn(`⚠️ [${priority.toUpperCase()}] Job ${jobId} stalled, will be retried`);
      });
    });

    this.isInitialized = true;
    console.log('🚀 Enrichment queue workers initialized successfully');
  }

  /**
   * Add a job to the appropriate priority queue
   */
  async addJob(
    jobType: EnrichmentJobType,
    data: EnrichmentJobData,
    priority: EnrichmentJobPriority = EnrichmentJobPriority.NORMAL,
    delay?: number
  ): Promise<string> {
    try {
      // Generate unique job ID
      const jobId = `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Determine which queue to use based on priority
      let queueName: keyof typeof queues;
      if (priority >= EnrichmentJobPriority.CRITICAL) {
        queueName = 'critical';
      } else if (priority >= EnrichmentJobPriority.HIGH) {
        queueName = 'high';
      } else if (priority >= EnrichmentJobPriority.LOW) {
        queueName = 'low';
      } else {
        queueName = 'normal';
      }

      // Create job in database first
      await this.createJobRecord(jobId, jobType, data, priority);

      // Add job to Redis queue
      const job = await queues[queueName].add(
        jobType,
        {
          ...data,
          jobId,
          priority,
          queuedAt: new Date().toISOString(),
        },
        {
          jobId,
          priority,
          delay,
          removeOnComplete: priority >= EnrichmentJobPriority.HIGH ? 200 : 100,
          removeOnFail: priority >= EnrichmentJobPriority.HIGH ? 100 : 50,
        }
      );

      console.log(`🎯 Job ${jobId} added to ${queueName} queue with priority ${priority}`);
      return jobId;

    } catch (error) {
      console.error('❌ Failed to add job to queue:', error);
      throw error;
    }
  }

  /**
   * Process a job from the queue
   */
  private async processJob(job: Job): Promise<JobResult> {
    const startTime = Date.now();
    const { jobId, type, userId } = job.data;

    console.log(`🔄 Processing job ${jobId} of type ${type}`);

    // Update status to in_progress
    await this.updateJobStatus(jobId, EnrichmentJobStatus.IN_PROGRESS, {
      startedAt: new Date(),
    });

    try {
      let result: any;
      let tokensUsed = 0;

      // Process based on job type
      switch (type) {
        case EnrichmentJobType.COMPETENCE_FILE_GENERATION:
          result = await this.processCompetenceFileGeneration(job);
          break;

        case EnrichmentJobType.CANDIDATE_PROFILE_ENHANCEMENT:
          result = await this.processCandidateEnhancement(job);
          break;

        case EnrichmentJobType.BULK_CANDIDATE_ENRICHMENT:
          result = await this.processBulkEnrichment(job);
          break;

        case EnrichmentJobType.SKILLS_OPTIMIZATION:
          result = await this.processSkillsOptimization(job);
          break;

        case EnrichmentJobType.EXPERIENCE_ENHANCEMENT:
          result = await this.processExperienceEnhancement(job);
          break;

        default:
          throw new Error(`Unknown job type: ${type}`);
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        processingTime,
        tokensUsed,
        metrics: {
          duration: processingTime,
          memoryUsed: process.memoryUsage(),
          timestamp: new Date().toISOString(),
        },
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`💥 Job ${jobId} processing failed:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        metrics: {
          duration: processingTime,
          errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Process competence file generation
   */
  private async processCompetenceFileGeneration(job: Job): Promise<any> {
    const { candidateData, jobDescription, clientName, template, sections } = job.data;

    // Update progress
    await job.updateProgress({ percentage: 10, message: 'Starting AI enrichment...' });

    // Run AI enrichment
    const enrichedContent = await competenceEnrichmentService.enrichCandidateForJob(
      candidateData,
      jobDescription,
      clientName
    );

    await job.updateProgress({ percentage: 80, message: 'Generating document...' });

    // Generate the document (this would integrate with your existing generation logic)
    const documentResult = {
      enrichedContent,
      candidateData,
      template,
      sections,
      generatedAt: new Date().toISOString(),
    };

    await job.updateProgress({ percentage: 100, message: 'Document generation completed' });

    return documentResult;
  }

  /**
   * Process candidate profile enhancement
   */
  private async processCandidateEnhancement(job: Job): Promise<any> {
    const { candidateData, jobDescription, enhancementTypes } = job.data;

    await job.updateProgress({ percentage: 20, message: 'Analyzing candidate profile...' });

    const enrichedContent = await competenceEnrichmentService.enrichCandidateForJob(
      candidateData,
      jobDescription
    );

    await job.updateProgress({ percentage: 100, message: 'Profile enhancement completed' });

    return {
      originalData: candidateData,
      enrichedContent,
      enhancementTypes,
      enhancedAt: new Date().toISOString(),
    };
  }

  /**
   * Process bulk candidate enrichment
   */
  private async processBulkEnrichment(job: Job): Promise<any> {
    const { candidateIds, jobDescription, batchSize = 5 } = job.data;
    const results = [];
    
    for (let i = 0; i < candidateIds.length; i += batchSize) {
      const batch = candidateIds.slice(i, i + batchSize);
      const percentage = Math.round((i / candidateIds.length) * 100);
      
      await job.updateProgress({
        percentage,
        message: `Processing batch ${Math.floor(i / batchSize) + 1}...`,
        completed: i,
        total: candidateIds.length,
      });

      // Process batch (you'd implement the actual processing logic)
      const batchResults = await Promise.all(
        batch.map(async (candidateId: string) => {
          // Fetch candidate and process
          const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId },
          });
          
          if (!candidate) {
            return { candidateId, error: 'Candidate not found' };
          }

          // Convert to CandidateData format using correct Prisma field names
          const candidateData: CandidateData = {
            id: candidate.id,
            fullName: candidate.firstName + ' ' + candidate.lastName,
            currentTitle: candidate.currentTitle || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            location: candidate.currentLocation || '',
            yearsOfExperience: candidate.experienceYears || 0,
            skills: [...(candidate.technicalSkills || []), ...(candidate.softSkills || [])],
            certifications: candidate.certifications || [],
            experience: [], // This would need to be built from other fields
            education: candidate.degrees || [],
            languages: candidate.spokenLanguages || [],
            summary: candidate.summary || '',
          };

          try {
            const enriched = await competenceEnrichmentService.enrichCandidateForJob(
              candidateData,
              jobDescription
            );
            return { candidateId, success: true, enriched };
          } catch (error) {
            return { 
              candidateId, 
              error: error instanceof Error ? error.message : 'Processing failed' 
            };
          }
        })
      );

      results.push(...batchResults);
    }

    await job.updateProgress({ percentage: 100, message: 'Bulk enrichment completed' });

    return {
      totalProcessed: candidateIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => r.error).length,
      results,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * Process skills optimization
   */
  private async processSkillsOptimization(job: Job): Promise<any> {
    const { candidateData, jobDescription } = job.data;

    await job.updateProgress({ percentage: 50, message: 'Optimizing skills...' });

    // Use the enrichment service to optimize skills
    const enriched = await competenceEnrichmentService.enrichCandidateForJob(
      candidateData,
      jobDescription
    );

    await job.updateProgress({ percentage: 100, message: 'Skills optimization completed' });

    return {
      originalSkills: candidateData.skills,
      optimizedSkills: enriched.optimizedSkills,
      optimizedAt: new Date().toISOString(),
    };
  }

  /**
   * Process experience enhancement
   */
  private async processExperienceEnhancement(job: Job): Promise<any> {
    const { candidateData, jobDescription } = job.data;

    await job.updateProgress({ percentage: 50, message: 'Enhancing work experience...' });

    const enriched = await competenceEnrichmentService.enrichCandidateForJob(
      candidateData,
      jobDescription
    );

    await job.updateProgress({ percentage: 100, message: 'Experience enhancement completed' });

    return {
      originalExperience: candidateData.experience,
      enrichedExperience: enriched.enrichedExperience,
      enhancedAt: new Date().toISOString(),
    };
  }

  /**
   * Create job record in database
   */
  private async createJobRecord(
    jobId: string,
    type: EnrichmentJobType,
    data: EnrichmentJobData,
    priority: EnrichmentJobPriority
  ): Promise<void> {
    try {
      // If we have a candidateId, use it; otherwise create a temporary record
      const candidateId = data.candidateId || 'temp-' + jobId;

      await prisma.enrichmentJob.create({
        data: {
          id: jobId,
          candidateId,
          type,
          status: EnrichmentJobStatus.PENDING,
          maxRetries: priority >= EnrichmentJobPriority.HIGH ? 5 : 3,
          result: {
            priority,
            queueName: this.getQueueName(priority),
            metadata: data.metadata || {},
          },
        },
      });

      console.log(`📝 Job record created in database: ${jobId}`);
    } catch (error) {
      console.error('❌ Failed to create job record:', error);
      throw error;
    }
  }

  /**
   * Update job status in database
   */
  private async updateJobStatus(
    jobId: string,
    status: EnrichmentJobStatus,
    updates: Partial<{
      startedAt: Date;
      completedAt: Date;
      result: any;
      error: string;
      retryCount: number;
    }> = {}
  ): Promise<void> {
    try {
      await prisma.enrichmentJob.update({
        where: { id: jobId },
        data: {
          status,
          ...updates,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`❌ Failed to update job status for ${jobId}:`, error);
    }
  }

  /**
   * Update job progress (this could be stored in Redis for real-time updates)
   */
  private async updateJobProgress(jobId: string, progress: QueueJobProgress): Promise<void> {
    try {
      // Store progress in Redis for real-time updates
      await connection.setex(
        `job_progress:${jobId}`,
        3600, // 1 hour TTL
        JSON.stringify({
          ...progress,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error(`❌ Failed to update job progress for ${jobId}:`, error);
    }
  }

  /**
   * Get job status and progress
   */
  async getJobStatus(jobId: string): Promise<{
    status: EnrichmentJobStatus;
    progress?: QueueJobProgress;
    result?: any;
    error?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    retryCount: number;
  } | null> {
    try {
      // Get job record from database
      const jobRecord = await prisma.enrichmentJob.findUnique({
        where: { id: jobId },
      });

      if (!jobRecord) {
        return null;
      }

      // Get progress from Redis
      let progress: QueueJobProgress | undefined;
      try {
        const progressData = await connection.get(`job_progress:${jobId}`);
        if (progressData) {
          progress = JSON.parse(progressData);
        }
      } catch (error) {
        console.warn(`Could not fetch progress for job ${jobId}:`, error);
      }

      return {
        status: jobRecord.status as EnrichmentJobStatus,
        progress,
        result: jobRecord.result,
        error: jobRecord.error || undefined,
        createdAt: jobRecord.createdAt,
        startedAt: jobRecord.startedAt || undefined,
        completedAt: jobRecord.completedAt || undefined,
        retryCount: jobRecord.retryCount,
      };
    } catch (error) {
      console.error(`❌ Failed to get job status for ${jobId}:`, error);
      return null;
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      // Try to remove from all queues
      const queueNames = ['critical', 'high', 'normal', 'low'] as const;
      let removed = false;

      for (const queueName of queueNames) {
        try {
          const job = await queues[queueName].getJob(jobId);
          if (job) {
            await job.remove();
            removed = true;
            break;
          }
        } catch (error) {
          // Job might not be in this queue, continue
        }
      }

      // Update database status
      await this.updateJobStatus(jobId, EnrichmentJobStatus.CANCELLED);

      console.log(`🚫 Job ${jobId} cancelled successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to cancel job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    critical: any;
    high: any;
    normal: any;
    low: any;
    totalActive: number;
    totalWaiting: number;
    totalCompleted: number;
    totalFailed: number;
  }> {
    try {
      const stats = await Promise.all([
        queues.critical.getJobCounts(),
        queues.high.getJobCounts(),
        queues.normal.getJobCounts(),
        queues.low.getJobCounts(),
      ]);

      const [critical, high, normal, low] = stats;

      return {
        critical,
        high,
        normal,
        low,
        totalActive: critical.active + high.active + normal.active + low.active,
        totalWaiting: critical.waiting + high.waiting + normal.waiting + low.waiting,
        totalCompleted: critical.completed + high.completed + normal.completed + low.completed,
        totalFailed: critical.failed + high.failed + normal.failed + low.failed,
      };
    } catch (error) {
      console.error('❌ Failed to get queue statistics:', error);
      throw error;
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    try {
      const jobRecord = await prisma.enrichmentJob.findUnique({
        where: { id: jobId },
      });

      if (!jobRecord || jobRecord.status !== EnrichmentJobStatus.FAILED) {
        return false;
      }

      if (jobRecord.retryCount >= jobRecord.maxRetries) {
        console.warn(`Job ${jobId} has exceeded max retries (${jobRecord.maxRetries})`);
        return false;
      }

      // Update retry count and status
      await this.updateJobStatus(jobId, EnrichmentJobStatus.RETRY_SCHEDULED, {
        retryCount: jobRecord.retryCount + 1,
      });

      // Re-add to queue with delay
      const priority = (jobRecord.result as any)?.priority || EnrichmentJobPriority.NORMAL;
      const delay = Math.pow(2, jobRecord.retryCount) * 1000; // Exponential backoff

      // You'd need to reconstruct the job data here
      // This is simplified - in practice, you'd store the original job data
      console.log(`🔄 Retrying job ${jobId} with delay ${delay}ms`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to retry job ${jobId}:`, error);
      return false;
    }
  }

  /**
   * Clean up old jobs and progress data
   */
  async cleanup(olderThanDays: number = 7): Promise<{
    deletedJobs: number;
    deletedProgress: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Clean up database records
      const deletedJobs = await prisma.enrichmentJob.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: {
            in: [EnrichmentJobStatus.COMPLETED, EnrichmentJobStatus.FAILED, EnrichmentJobStatus.CANCELLED],
          },
        },
      });

      // Clean up Redis progress data
      const progressKeys = await connection.keys('job_progress:*');
      let deletedProgress = 0;

      for (const key of progressKeys) {
        const data = await connection.get(key);
        if (data) {
          const progress = JSON.parse(data);
          const updatedAt = new Date(progress.updatedAt);
          if (updatedAt < cutoffDate) {
            await connection.del(key);
            deletedProgress++;
          }
        }
      }

      console.log(`🧹 Cleanup completed: ${deletedJobs.count} jobs, ${deletedProgress} progress records`);

      return {
        deletedJobs: deletedJobs.count,
        deletedProgress,
      };
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown all workers
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down enrichment queue workers...');
    
    await Promise.all(this.workers.map(worker => worker.close()));
    await connection.quit();
    
    console.log('✅ Enrichment queue service shutdown completed');
  }

  /**
   * Helper method to get queue name from priority
   */
  private getQueueName(priority: EnrichmentJobPriority): string {
    if (priority >= EnrichmentJobPriority.CRITICAL) return 'critical';
    if (priority >= EnrichmentJobPriority.HIGH) return 'high';
    if (priority >= EnrichmentJobPriority.LOW) return 'low';
    return 'normal';
  }
}

// Export singleton instance
export const enrichmentQueueService = new EnrichmentQueueService();

// Health check function
export async function checkQueueHealth(): Promise<{
  redis: boolean;
  workers: boolean;
  queues: Record<string, boolean>;
}> {
  try {
    const health = {
      redis: false,
      workers: false,
      queues: {} as Record<string, boolean>,
    };

    // Check Redis connection
    try {
      await connection.ping();
      health.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    // Check workers
    health.workers = enrichmentQueueService['workers'].length > 0;

    // Check each queue
    for (const [name, queue] of Object.entries(queues)) {
      try {
        await queue.getJobCounts();
        health.queues[name] = true;
      } catch (error) {
        console.error(`Queue ${name} health check failed:`, error);
        health.queues[name] = false;
      }
    }

    return health;
  } catch (error) {
    console.error('Queue health check failed:', error);
    return {
      redis: false,
      workers: false,
      queues: {},
    };
  }
} 