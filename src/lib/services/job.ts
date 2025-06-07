import { prisma } from '@/lib/prisma';
import { loggingService } from './logging';
import { socialMediaService } from './social-media';
import { v4 as uuidv4 } from 'uuid';

export interface CreateJobInput {
  title: string;
  description: string;
  department: string;
  location: string;
  language?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel?: string;
  employmentType?: string[];
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  isRemote?: boolean;
}

export interface JobDistributionOptions {
  platforms: string[];
  autoPublish?: boolean;
  socialMedia?: {
    linkedin?: boolean;
    twitter?: boolean;
    facebook?: boolean;
  };
}

export class JobService {
  async createJob(input: CreateJobInput, userId?: string) {
    try {
      const publicToken = uuidv4();
      
      const job = await prisma.job.create({
        data: {
          ...input,
          language: input.language as any || 'EN',
          employmentType: input.employmentType as any || [],
          benefits: input.benefits || [],
          requirements: input.requirements || [],
          responsibilities: input.responsibilities || [],
          isRemote: input.isRemote || false,
          publicToken,
          embedCode: this.generateEmbedCode(publicToken),
        },
      });

      await loggingService.log({
        actor: userId,
        action: 'CREATE_JOB',
        resource: `job:${job.id}`,
        details: { title: job.title, department: job.department },
      });

      return job;
    } catch (error) {
      await loggingService.log({
        actor: userId,
        action: 'CREATE_JOB_ERROR',
        resource: 'job:unknown',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        level: 'ERROR',
      });
      throw error;
    }
  }

  async publishJob(jobId: string, distributionOptions?: JobDistributionOptions, userId?: string) {
    try {
      const job = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'ACTIVE',
          publishedAt: new Date(),
        },
      });

      // Job board distribution functionality removed

      // Post to social media if specified
      if (distributionOptions?.socialMedia) {
        await socialMediaService.promoteJob(jobId, distributionOptions.socialMedia);
      }

      await loggingService.log({
        actor: userId,
        action: 'PUBLISH_JOB',
        resource: `job:${jobId}`,
        details: { 
          title: job.title,
          platforms: distributionOptions?.platforms || [],
          socialMedia: distributionOptions?.socialMedia || {},
        },
      });

      return job;
    } catch (error) {
      await loggingService.log({
        actor: userId,
        action: 'PUBLISH_JOB_ERROR',
        resource: `job:${jobId}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        level: 'ERROR',
      });
      throw error;
    }
  }

  async getPublicJobs(filters?: {
    location?: string;
    department?: string;
    employmentType?: string;
    isRemote?: boolean;
    language?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {
      status: 'ACTIVE',
      publishedAt: { not: null },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    // Build filters efficiently
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }
    if (filters?.employmentType) {
      where.employmentType = { has: filters.employmentType };
    }
    if (filters?.isRemote !== undefined) {
      where.isRemote = filters.isRemote;
    }
    if (filters?.language) {
      where.language = filters.language;
    }

    // Use pagination for better performance
    const limit = filters?.limit || 50; // Default limit
    const offset = filters?.offset || 0;

    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          department: true,
          location: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          experienceLevel: true,
          employmentType: true,
          benefits: true,
          requirements: true,
          responsibilities: true,
          isRemote: true,
          language: true,
          publishedAt: true,
          publicToken: true,
        },
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
      }),
      // Get total count for pagination
      prisma.job.count({ where })
    ]);

    return {
      jobs,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    };
  }

  async getJobByToken(publicToken: string) {
    return prisma.job.findUnique({
      where: { publicToken },
      select: {
        id: true,
        title: true,
        description: true,
        department: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        salaryCurrency: true,
        experienceLevel: true,
        employmentType: true,
        benefits: true,
        requirements: true,
        responsibilities: true,
        isRemote: true,
        language: true,
        publishedAt: true,
      },
    });
  }

  generateEmbedCode(publicToken: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    return `
<!-- Emineon ATS Job Widget -->
<div id="emineon-jobs-widget"></div>
<script>
  (function() {
    var widget = document.createElement('iframe');
    widget.src = '${baseUrl}/jobs/embed?token=${publicToken}';
    widget.style.width = '100%';
    widget.style.height = '600px';
    widget.style.border = 'none';
    widget.style.borderRadius = '8px';
    document.getElementById('emineon-jobs-widget').appendChild(widget);
  })();
</script>
    `.trim();
  }

  async getJobMetrics(jobId: string) {
    const [job, applications, views] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        select: {
          title: true,
          publishedAt: true,
          status: true,
        },
      }),
      
      prisma.application.count({
        where: { jobId },
      }),
      
      // This would be tracked via analytics in a real app
      // For now, we'll return a mock count
      Promise.resolve(Math.floor(Math.random() * 1000) + 100),
    ]);

    if (!job) {
      throw new Error('Job not found');
    }

    const daysSincePublished = job.publishedAt 
      ? Math.floor((Date.now() - job.publishedAt.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      jobId,
      title: job.title,
      status: job.status,
      daysSincePublished,
      totalViews: views,
      totalApplications: applications,
      applicationRate: views > 0 ? (applications / views) * 100 : 0,
      averageApplicationsPerDay: daysSincePublished > 0 ? applications / daysSincePublished : applications,
    };
  }

  async closeJob(jobId: string, userId?: string) {
    try {
      const job = await prisma.job.update({
        where: { id: jobId },
        data: { status: 'CLOSED' },
      });

      await loggingService.log({
        actor: userId,
        action: 'CLOSE_JOB',
        resource: `job:${jobId}`,
        details: { title: job.title },
      });

      return job;
    } catch (error) {
      await loggingService.log({
        actor: userId,
        action: 'CLOSE_JOB_ERROR',
        resource: `job:${jobId}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        level: 'ERROR',
      });
      throw error;
    }
  }
}

export const jobService = new JobService(); 