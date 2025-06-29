import { NextRequest, NextResponse } from 'next/server';
import { enrichmentQueueService, checkQueueHealth } from '@/lib/services/enrichment-queue';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'overview';

    switch (action) {
      case 'overview':
        return await getQueueOverview();
      
      case 'jobs':
        return await getRecentJobs(searchParams);
      
      case 'stats':
        return await getDetailedStats();
      
      case 'health':
        return await getHealthStatus();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: overview, jobs, stats, or health' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Queue dashboard error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch queue dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getQueueOverview() {
  // Get queue statistics
  const queueStats = await enrichmentQueueService.getQueueStats();
  
  // Get recent job counts from database
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  
  const [
    totalJobs,
    jobsLast24h,
    jobsLastHour,
    pendingJobs,
    failedJobs,
    jobsByType,
    recentCompletions
  ] = await Promise.all([
    // Total jobs
    prisma.enrichmentJob.count(),
    
    // Jobs in last 24 hours
    prisma.enrichmentJob.count({
      where: { createdAt: { gte: last24Hours } }
    }),
    
    // Jobs in last hour
    prisma.enrichmentJob.count({
      where: { createdAt: { gte: lastHour } }
    }),
    
    // Pending jobs
    prisma.enrichmentJob.count({
      where: { status: 'pending' }
    }),
    
    // Failed jobs
    prisma.enrichmentJob.count({
      where: { status: 'failed' }
    }),
    
    // Jobs by type
    prisma.enrichmentJob.groupBy({
      by: ['type'],
      _count: { type: true },
      where: { createdAt: { gte: last24Hours } }
    }),
    
    // Recent completions
    prisma.enrichmentJob.findMany({
      where: { 
        status: 'completed',
        completedAt: { gte: last24Hours }
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        createdAt: true,
        completedAt: true,
        candidateId: true,
      }
    })
  ]);

  // Calculate average processing time for completed jobs
  const completedJobsWithTiming = await prisma.enrichmentJob.findMany({
    where: {
      status: 'completed',
      startedAt: { not: null },
      completedAt: { not: null },
      createdAt: { gte: last24Hours }
    },
    select: {
      startedAt: true,
      completedAt: true,
    }
  });

  const avgProcessingTime = completedJobsWithTiming.length > 0
    ? completedJobsWithTiming.reduce((sum, job) => {
        const processingTime = job.completedAt!.getTime() - job.startedAt!.getTime();
        return sum + processingTime;
      }, 0) / completedJobsWithTiming.length / 1000 // Convert to seconds
    : 0;

  return NextResponse.json({
    success: true,
    overview: {
      queues: queueStats,
      database: {
        totalJobs,
        jobsLast24h,
        jobsLastHour,
        pendingJobs,
        failedJobs,
        avgProcessingTimeSeconds: Math.round(avgProcessingTime),
      },
      jobsByType: jobsByType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      recentCompletions,
    },
    timestamp: new Date().toISOString(),
  });
}

async function getRecentJobs(searchParams: URLSearchParams) {
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const candidateId = searchParams.get('candidateId');

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (candidateId) where.candidateId = candidateId;

  const jobs = await prisma.enrichmentJob.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      candidateId: true,
      type: true,
      status: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
      error: true,
      retryCount: true,
      maxRetries: true,
      result: true,
    }
  });

  return NextResponse.json({
    success: true,
    jobs,
    count: jobs.length,
    timestamp: new Date().toISOString(),
  });
}

async function getDetailedStats() {
  const queueStats = await enrichmentQueueService.getQueueStats();
  
  // Get performance metrics
  const now = new Date();
  const periods = {
    '1h': new Date(now.getTime() - 60 * 60 * 1000),
    '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  };

  const statsPromises = Object.entries(periods).map(async ([period, since]) => {
    const [completed, failed, avgTime] = await Promise.all([
      prisma.enrichmentJob.count({
        where: { 
          status: 'completed',
          completedAt: { gte: since }
        }
      }),
      
      prisma.enrichmentJob.count({
        where: { 
          status: 'failed',
          createdAt: { gte: since }
        }
      }),
      
      prisma.enrichmentJob.findMany({
        where: {
          status: 'completed',
          startedAt: { not: null },
          completedAt: { not: null, gte: since }
        },
        select: {
          startedAt: true,
          completedAt: true,
        }
      }).then(jobs => {
        if (jobs.length === 0) return 0;
        const totalTime = jobs.reduce((sum, job) => 
          sum + (job.completedAt!.getTime() - job.startedAt!.getTime()), 0
        );
        return totalTime / jobs.length / 1000; // Average in seconds
      })
    ]);

    return {
      period,
      completed,
      failed,
      avgProcessingTimeSeconds: Math.round(avgTime),
      successRate: completed + failed > 0 ? (completed / (completed + failed) * 100).toFixed(1) + '%' : 'N/A'
    };
  });

  const periodStats = await Promise.all(statsPromises);

  // Get error distribution
  const errorStats = await prisma.enrichmentJob.groupBy({
    by: ['error'],
    _count: { error: true },
    where: { 
      status: 'failed',
      error: { not: null },
      createdAt: { gte: periods['24h'] }
    },
    orderBy: { _count: { error: 'desc' } },
    take: 10
  });

  return NextResponse.json({
    success: true,
    stats: {
      queues: queueStats,
      performance: periodStats.reduce((acc, stat) => {
        acc[stat.period] = {
          completed: stat.completed,
          failed: stat.failed,
          avgProcessingTimeSeconds: stat.avgProcessingTimeSeconds,
          successRate: stat.successRate
        };
        return acc;
      }, {} as Record<string, any>),
      errors: errorStats.map(error => ({
        message: error.error || 'Unknown error',
        count: error._count.error
      }))
    },
    timestamp: new Date().toISOString(),
  });
}

async function getHealthStatus() {
  const health = await checkQueueHealth();
  
  // Check database connectivity
  let dbHealth = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbHealth = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Get system metrics
  const systemMetrics = {
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    nodeVersion: process.version,
  };

  return NextResponse.json({
    success: true,
    health: {
      ...health,
      database: dbHealth,
      system: systemMetrics,
    },
    timestamp: new Date().toISOString(),
  });
}

// Management endpoints
export async function POST(request: NextRequest) {
  try {
    const { action, jobId } = await request.json();

    switch (action) {
      case 'cleanup':
        const days = parseInt(request.headers.get('cleanup-days') || '7');
        const result = await enrichmentQueueService.cleanup(days);
        return NextResponse.json({
          success: true,
          message: `Cleaned up ${result.deletedJobs} jobs and ${result.deletedProgress} progress records`,
          result
        });

      case 'retry':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId required for retry' }, { status: 400 });
        }
        const retrySuccess = await enrichmentQueueService.retryJob(jobId);
        return NextResponse.json({
          success: retrySuccess,
          message: retrySuccess ? `Job ${jobId} queued for retry` : `Failed to retry job ${jobId}`
        });

      case 'cancel':
        if (!jobId) {
          return NextResponse.json({ error: 'jobId required for cancel' }, { status: 400 });
        }
        const cancelSuccess = await enrichmentQueueService.cancelJob(jobId);
        return NextResponse.json({
          success: cancelSuccess,
          message: cancelSuccess ? `Job ${jobId} cancelled` : `Failed to cancel job ${jobId}`
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: cleanup, retry, or cancel' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Queue management error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform queue management action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 