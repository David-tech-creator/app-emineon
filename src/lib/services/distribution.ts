import { prisma } from '@/lib/prisma';
import { loggingService } from './logging';

export interface JobBoard {
  name: string;
  apiEndpoint?: string;
  cost?: number;
  isPremium: boolean;
}

const JOB_BOARDS: JobBoard[] = [
  { name: 'Indeed', cost: 0, isPremium: false },
  { name: 'LinkedIn', cost: 29.99, isPremium: true },
  { name: 'Glassdoor', cost: 19.99, isPremium: true },
  { name: 'ZipRecruiter', cost: 15.99, isPremium: true },
  { name: 'Monster', cost: 12.99, isPremium: true },
  { name: 'CareerBuilder', cost: 18.99, isPremium: true },
  { name: 'AngelList', cost: 0, isPremium: false },
  { name: 'Stack Overflow', cost: 25.99, isPremium: true },
  { name: 'Dice', cost: 22.99, isPremium: true },
  { name: 'FlexJobs', cost: 14.99, isPremium: true },
];

export class DistributionService {
  async getAvailableJobBoards(): Promise<JobBoard[]> {
    return JOB_BOARDS;
  }

  async distributeJob(jobId: string, platforms: string[]): Promise<void> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        department: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        requirements: true,
        employmentType: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const distributions = [];

    for (const platform of platforms) {
      const jobBoard = JOB_BOARDS.find(board => board.name === platform);
      
      if (!jobBoard) {
        console.warn(`Unknown job board: ${platform}`);
        continue;
      }

      try {
        // Simulate posting to job board
        const result = await this.postToJobBoard(job, jobBoard);
        
        const distribution = await prisma.jobDistribution.create({
          data: {
            jobId,
            platform,
            status: 'POSTED',
            externalId: result.externalId,
            postUrl: result.postUrl,
            cost: jobBoard.cost,
            postedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        distributions.push(distribution);

        await loggingService.log({
          action: 'JOB_DISTRIBUTED',
          resource: `job:${jobId}`,
          details: { platform, cost: jobBoard.cost, externalId: result.externalId },
        });
      } catch (error) {
        await prisma.jobDistribution.create({
          data: {
            jobId,
            platform,
            status: 'FAILED',
            errorCode: 'POSTING_ERROR',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        await loggingService.log({
          action: 'JOB_DISTRIBUTION_FAILED',
          resource: `job:${jobId}`,
          details: { platform, error: error instanceof Error ? error.message : 'Unknown error' },
          level: 'ERROR',
        });
      }
    }
  }

  async getJobDistributions(jobId: string) {
    return prisma.jobDistribution.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeJobDistribution(jobId: string, platform: string): Promise<void> {
    const distribution = await prisma.jobDistribution.findFirst({
      where: { jobId, platform, status: 'POSTED' },
    });

    if (distribution) {
      // Simulate removing from job board
      await this.removeFromJobBoard(distribution.externalId, platform);
      
      await prisma.jobDistribution.update({
        where: { id: distribution.id },
        data: { status: 'REMOVED' },
      });

      await loggingService.log({
        action: 'JOB_DISTRIBUTION_REMOVED',
        resource: `job:${jobId}`,
        details: { platform, externalId: distribution.externalId },
      });
    }
  }

  private async postToJobBoard(job: any, jobBoard: JobBoard): Promise<{ externalId: string; postUrl: string }> {
    // Simulate API call to job board
    console.log(`Posting job "${job.title}" to ${jobBoard.name}`);
    
    // Mock API response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const externalId = `${jobBoard.name.toLowerCase()}_${Date.now()}`;
    const postUrl = `https://${jobBoard.name.toLowerCase()}.com/jobs/${externalId}`;
    
    return { externalId, postUrl };
  }

  private async removeFromJobBoard(externalId?: string | null, platform?: string): Promise<void> {
    if (!externalId || !platform) return;
    
    // Simulate API call to remove job
    console.log(`Removing job ${externalId} from ${platform}`);
    
    // Mock API response
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getDistributionMetrics(timeframe: 'week' | 'month' | 'quarter' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalDistributions, successfulDistributions, platformStats, totalCost] = await Promise.all([
      prisma.jobDistribution.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      prisma.jobDistribution.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'POSTED',
        },
      }),
      
      prisma.jobDistribution.groupBy({
        by: ['platform'],
        where: { createdAt: { gte: startDate } },
        _count: { platform: true },
        _sum: { cost: true },
        orderBy: { _count: { platform: 'desc' } },
      }),
      
      prisma.jobDistribution.aggregate({
        where: { 
          createdAt: { gte: startDate },
          status: 'POSTED',
        },
        _sum: { cost: true },
      }),
    ]);

    return {
      timeframe,
      startDate,
      endDate: now,
      summary: {
        totalDistributions,
        successfulDistributions,
        successRate: totalDistributions > 0 ? (successfulDistributions / totalDistributions) * 100 : 0,
        totalCost: totalCost._sum.cost || 0,
      },
      platformBreakdown: platformStats.map(stat => ({
        platform: stat.platform,
        postings: stat._count.platform,
        totalCost: stat._sum.cost || 0,
      })),
    };
  }
}

export const distributionService = new DistributionService(); 