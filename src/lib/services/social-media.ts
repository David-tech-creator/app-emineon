import { prisma } from '@/lib/prisma';
import { loggingService } from './logging';

export interface SocialMediaOptions {
  linkedin?: boolean;
  twitter?: boolean;
  facebook?: boolean;
  instagram?: boolean;
}

export interface SocialPostTemplate {
  platform: string;
  template: string;
  hashtagSuggestions: string[];
}

export class SocialMediaService {
  async promoteJob(jobId: string, options: SocialMediaOptions): Promise<void> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        description: true,
        department: true,
        location: true,
        isRemote: true,
        salaryMin: true,
        salaryMax: true,
        publicToken: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const promotionPromises = [];

    if (options.linkedin) {
      promotionPromises.push(this.postToLinkedIn(job));
    }
    if (options.twitter) {
      promotionPromises.push(this.postToTwitter(job));
    }
    if (options.facebook) {
      promotionPromises.push(this.postToFacebook(job));
    }
    if (options.instagram) {
      promotionPromises.push(this.postToInstagram(job));
    }

    await Promise.allSettled(promotionPromises);
  }

  async generatePostContent(jobId: string, platform: keyof SocialMediaOptions): Promise<SocialPostTemplate> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        description: true,
        department: true,
        location: true,
        isRemote: true,
        publicToken: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const jobUrl = `${baseUrl}/apply/${job.publicToken}`;

    const templates: Record<string, SocialPostTemplate> = {
      linkedin: {
        platform: 'LinkedIn',
        template: `🚀 We're hiring a ${job.title} to join our ${job.department} team!

${job.isRemote ? '🏠 Remote opportunity' : `📍 Based in ${job.location}`}

Join us in ${job.description.substring(0, 100)}...

Apply now: ${jobUrl}

#hiring #jobs #${job.department.replace(/\s+/g, '')} #career`,
        hashtagSuggestions: ['#hiring', '#jobs', '#careers', '#opportunity', `#${job.department.replace(/\s+/g, '')}`],
      },
      
      twitter: {
        platform: 'Twitter',
        template: `🎯 ${job.title} opportunity at our company!

${job.isRemote ? '🏠 Remote' : `📍 ${job.location}`}
💼 ${job.department}

Apply: ${jobUrl}

#jobs #hiring #${job.department.replace(/\s+/g, '').toLowerCase()}`,
        hashtagSuggestions: ['#jobs', '#hiring', '#careers', `#${job.department.replace(/\s+/g, '').toLowerCase()}`],
      },
      
      facebook: {
        platform: 'Facebook',
        template: `We're expanding our ${job.department} team! 

Looking for a talented ${job.title} to join us ${job.isRemote ? 'remotely' : `in ${job.location}`}.

What we're looking for:
${job.description.substring(0, 150)}...

Ready to apply? Visit: ${jobUrl}

#NowHiring #Careers #${job.department.replace(/\s+/g, '')}`,
        hashtagSuggestions: ['#NowHiring', '#Careers', '#Jobs', `#${job.department.replace(/\s+/g, '')}`],
      },
      
      instagram: {
        platform: 'Instagram',
        template: `Join our team! 📈

We're looking for a ${job.title} to help us grow our ${job.department} department.

${job.isRemote ? '🏠 Work from anywhere' : `🏢 Located in ${job.location}`}

Link in bio to apply! 

#hiring #jobs #careers #teamgrowth #${job.department.replace(/\s+/g, '').toLowerCase()}`,
        hashtagSuggestions: ['#hiring', '#jobs', '#careers', '#teamgrowth', `#${job.department.replace(/\s+/g, '').toLowerCase()}`],
      },
    };

    return templates[platform] || templates.linkedin;
  }

  private async postToLinkedIn(job: any): Promise<void> {
    try {
      // Simulate LinkedIn API call
      const content = await this.generatePostContent(job.id, 'linkedin');
      
      console.log('Posting to LinkedIn:', content.template);
      
      // Mock API response delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const postId = `li_${Date.now()}`;
      const postUrl = `https://linkedin.com/feed/update/urn:li:share:${postId}`;
      
      await prisma.socialMediaPost.create({
        data: {
          jobId: job.id,
          platform: 'LINKEDIN',
          content: content.template,
          status: 'PUBLISHED',
          postUrl,
          postId,
        },
      });
      
      await loggingService.log({
        action: 'JOB_PROMOTED_LINKEDIN',
        resource: `job:${job.id}`,
        details: { postId, postUrl },
      });
    } catch (error) {
      await this.logSocialMediaError(job.id, 'LINKEDIN', error);
    }
  }

  private async postToTwitter(job: any): Promise<void> {
    try {
      const content = await this.generatePostContent(job.id, 'twitter');
      
      console.log('Posting to Twitter:', content.template);
      
      // Mock API response delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const postId = `tw_${Date.now()}`;
      const postUrl = `https://twitter.com/company/status/${postId}`;
      
      await prisma.socialMediaPost.create({
        data: {
          jobId: job.id,
          platform: 'TWITTER',
          content: content.template,
          status: 'PUBLISHED',
          postUrl,
          postId,
        },
      });
      
      await loggingService.log({
        action: 'JOB_PROMOTED_TWITTER',
        resource: `job:${job.id}`,
        details: { postId, postUrl },
      });
    } catch (error) {
      await this.logSocialMediaError(job.id, 'TWITTER', error);
    }
  }

  private async postToFacebook(job: any): Promise<void> {
    try {
      const content = await this.generatePostContent(job.id, 'facebook');
      
      console.log('Posting to Facebook:', content.template);
      
      // Mock API response delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const postId = `fb_${Date.now()}`;
      const postUrl = `https://facebook.com/company/posts/${postId}`;
      
      await prisma.socialMediaPost.create({
        data: {
          jobId: job.id,
          platform: 'FACEBOOK',
          content: content.template,
          status: 'PUBLISHED',
          postUrl,
          postId,
        },
      });
      
      await loggingService.log({
        action: 'JOB_PROMOTED_FACEBOOK',
        resource: `job:${job.id}`,
        details: { postId, postUrl },
      });
    } catch (error) {
      await this.logSocialMediaError(job.id, 'FACEBOOK', error);
    }
  }

  private async postToInstagram(job: any): Promise<void> {
    try {
      const content = await this.generatePostContent(job.id, 'instagram');
      
      console.log('Posting to Instagram:', content.template);
      
      // Mock API response delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const postId = `ig_${Date.now()}`;
      const postUrl = `https://instagram.com/p/${postId}`;
      
      await prisma.socialMediaPost.create({
        data: {
          jobId: job.id,
          platform: 'INSTAGRAM',
          content: content.template,
          status: 'PUBLISHED',
          postUrl,
          postId,
        },
      });
      
      await loggingService.log({
        action: 'JOB_PROMOTED_INSTAGRAM',
        resource: `job:${job.id}`,
        details: { postId, postUrl },
      });
    } catch (error) {
      await this.logSocialMediaError(job.id, 'INSTAGRAM', error);
    }
  }

  private async logSocialMediaError(jobId: string, platform: string, error: unknown): Promise<void> {
    await prisma.socialMediaPost.create({
      data: {
        jobId,
        platform: platform as any,
        content: '',
        status: 'FAILED',
      },
    });
    
    await loggingService.log({
      action: 'JOB_PROMOTION_FAILED',
      resource: `job:${jobId}`,
      details: { platform, error: error instanceof Error ? error.message : 'Unknown error' },
      level: 'ERROR',
    });
  }

  async getSocialMediaPosts(jobId: string) {
    return prisma.socialMediaPost.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSocialMediaMetrics(timeframe: 'week' | 'month' | 'quarter' = 'month') {
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

    const [totalPosts, successfulPosts, platformStats] = await Promise.all([
      prisma.socialMediaPost.count({
        where: { createdAt: { gte: startDate } },
      }),
      
      prisma.socialMediaPost.count({
        where: { 
          createdAt: { gte: startDate },
          status: 'PUBLISHED',
        },
      }),
      
      prisma.socialMediaPost.groupBy({
        by: ['platform', 'status'],
        where: { createdAt: { gte: startDate } },
        _count: { platform: true },
        orderBy: { _count: { platform: 'desc' } },
      }),
    ]);

    return {
      timeframe,
      startDate,
      endDate: now,
      summary: {
        totalPosts,
        successfulPosts,
        successRate: totalPosts > 0 ? (successfulPosts / totalPosts) * 100 : 0,
      },
      platformBreakdown: platformStats.reduce((acc: any, stat: any) => {
        const platform = stat.platform;
        if (!acc[platform]) {
          acc[platform] = { total: 0, posted: 0, failed: 0 };
        }
        acc[platform].total += stat._count.platform;
        if (stat.status === 'PUBLISHED') {
          acc[platform].posted += stat._count.platform;
        } else if (stat.status === 'FAILED') {
          acc[platform].failed += stat._count.platform;
        }
        return acc;
      }, {}),
    };
  }
}

export const socialMediaService = new SocialMediaService(); 