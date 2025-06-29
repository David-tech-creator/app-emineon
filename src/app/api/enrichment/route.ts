import { NextRequest, NextResponse } from 'next/server';
import { 
  enrichmentQueueService, 
  EnrichmentJobType, 
  EnrichmentJobPriority,
  type CompetenceFileJobData,
  type ProfileEnhancementJobData,
  type BulkEnrichmentJobData 
} from '@/lib/services/enrichment-queue';
import type { CandidateData, JobDescription } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      candidateData, 
      candidateId,
      candidateIds,
      jobDescription, 
      clientName, 
      userId,
      priority = EnrichmentJobPriority.NORMAL,
      delay,
      sessionId,
      sections,
      format = 'pdf',
      enhancementTypes,
      batchSize,
      template,
      managerContact,
      metadata 
    } = body;

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and userId' },
        { status: 400 }
      );
    }

    let jobData: CompetenceFileJobData | ProfileEnhancementJobData | BulkEnrichmentJobData;

    // Build job data based on type
    switch (type) {
      case EnrichmentJobType.COMPETENCE_FILE_GENERATION:
        if (!candidateData && !candidateId) {
          return NextResponse.json(
            { error: 'Candidate data or candidateId required for competence file generation' },
            { status: 400 }
          );
        }

        jobData = {
          type: EnrichmentJobType.COMPETENCE_FILE_GENERATION,
          candidateId,
          candidateData,
          jobDescription,
          userId,
          clientName,
          template,
          sessionId,
          metadata,
          sections: sections || ['summary', 'experience', 'skills', 'education'],
          format,
          managerContact,
        };
        break;

      case EnrichmentJobType.CANDIDATE_PROFILE_ENHANCEMENT:
        if (!candidateData && !candidateId) {
          return NextResponse.json(
            { error: 'Candidate data or candidateId required for profile enhancement' },
            { status: 400 }
          );
        }

        jobData = {
          type: EnrichmentJobType.CANDIDATE_PROFILE_ENHANCEMENT,
          candidateId,
          candidateData,
          jobDescription,
          userId,
          clientName,
          template,
          sessionId,
          metadata,
          enhancementTypes: enhancementTypes || ['summary', 'skills', 'experience'],
        };
        break;

      case EnrichmentJobType.BULK_CANDIDATE_ENRICHMENT:
        if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
          return NextResponse.json(
            { error: 'candidateIds array required for bulk enrichment' },
            { status: 400 }
          );
        }

        jobData = {
          type: EnrichmentJobType.BULK_CANDIDATE_ENRICHMENT,
          candidateIds,
          jobDescription,
          userId,
          clientName,
          sessionId,
          metadata,
          batchSize,
        };
        break;

      case EnrichmentJobType.SKILLS_OPTIMIZATION:
      case EnrichmentJobType.EXPERIENCE_ENHANCEMENT:
        if (!candidateData && !candidateId) {
          return NextResponse.json(
            { error: 'Candidate data or candidateId required for this enhancement type' },
            { status: 400 }
          );
        }

        jobData = {
          type,
          candidateId,
          candidateData,
          jobDescription,
          userId,
          clientName,
          sessionId,
          metadata,
        } as any; // Base job data structure
        break;

      default:
        return NextResponse.json(
          { error: `Unknown enrichment job type: ${type}` },
          { status: 400 }
        );
    }

    // Add job to queue
    const jobId = await enrichmentQueueService.addJob(
      type,
      jobData,
      priority,
      delay
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: `Enrichment job ${jobId} queued successfully`,
      estimatedWaitTime: getEstimatedWaitTime(priority),
    });

  } catch (error) {
    console.error('Error queuing enrichment job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to queue enrichment job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Return queue statistics
      const stats = await enrichmentQueueService.getQueueStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    if (action === 'health') {
      // Health check
      const { checkQueueHealth } = await import('@/lib/services/enrichment-queue');
      const health = await checkQueueHealth();
      return NextResponse.json({
        success: true,
        health,
        timestamp: new Date().toISOString(),
      });
    }

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter required' },
        { status: 400 }
      );
    }

    // Get job status and progress
    const jobStatus = await enrichmentQueueService.getJobStatus(jobId);

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: jobStatus,
    });

  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId parameter required' },
        { status: 400 }
      );
    }

    if (action === 'retry') {
      // Retry a failed job
      const success = await enrichmentQueueService.retryJob(jobId);
      
      return NextResponse.json({
        success,
        message: success 
          ? `Job ${jobId} queued for retry` 
          : `Failed to retry job ${jobId}`,
      });
    }

    // Cancel/delete a job
    const success = await enrichmentQueueService.cancelJob(jobId);

    return NextResponse.json({
      success,
      message: success 
        ? `Job ${jobId} cancelled successfully` 
        : `Failed to cancel job ${jobId}`,
    });

  } catch (error) {
    console.error('Error managing job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to manage job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to estimate wait time based on priority and queue status
function getEstimatedWaitTime(priority: EnrichmentJobPriority): string {
  switch (priority) {
    case EnrichmentJobPriority.CRITICAL:
      return '< 30 seconds';
    case EnrichmentJobPriority.HIGH:
      return '1-2 minutes';
    case EnrichmentJobPriority.NORMAL:
      return '2-5 minutes';
    case EnrichmentJobPriority.LOW:
      return '5-15 minutes';
    default:
      return '2-5 minutes';
  }
} 