import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { jobService, distributionService } from '@/lib/services';
import { z } from 'zod';

export const runtime = 'nodejs';

const jobDistributionSchema = z.object({
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  autoPublish: z.boolean().optional().default(false),
  socialMedia: z.object({
    linkedin: z.boolean().optional().default(false),
    twitter: z.boolean().optional().default(false),
    facebook: z.boolean().optional().default(false),
    instagram: z.boolean().optional().default(false),
  }).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = jobDistributionSchema.parse(body);

    // Get available job boards
    const availableBoards = await distributionService.getAvailableJobBoards();
    const selectedBoards = availableBoards.filter(board => 
      validatedData.platforms.includes(board.name)
    );

    if (selectedBoards.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid job boards selected' },
        { status: 400 }
      );
    }

    // Publish the job first if auto-publish is enabled
    if (validatedData.autoPublish) {
      await jobService.publishJob(jobId, validatedData, userId);
    }

    // Get distribution results
    const distributions = await distributionService.getJobDistributions(jobId);
    
    // Calculate total cost
    const totalCost = selectedBoards.reduce((sum, board) => sum + (board.cost || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        distributedTo: selectedBoards.map(board => board.name),
        totalCost,
        distributions,
        socialMediaEnabled: !!validatedData.socialMedia,
        publishedAt: validatedData.autoPublish ? new Date().toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Job distribution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to distribute job' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const jobId = params.id;
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job distribution status
    const distributions = await distributionService.getJobDistributions(jobId);
    const availableBoards = await distributionService.getAvailableJobBoards();

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        distributions,
        availableBoards,
        distributionCount: distributions.length,
      },
    });
  } catch (error) {
    console.error('Get distribution status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get distribution status' },
      { status: 500 }
    );
  }
} 