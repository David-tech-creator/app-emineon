import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { aiMatchingService } from '@/lib/services';
import { z } from 'zod';

export const runtime = 'nodejs';

const candidateMatchingSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  maxCandidates: z.number().min(1).max(50).optional().default(10),
  minScore: z.number().min(0).max(100).optional().default(50),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = candidateMatchingSchema.parse(body);

    // Find matching candidates using AI
    const matches = await aiMatchingService.findMatchingCandidates({
      jobId: validatedData.jobId,
      maxCandidates: validatedData.maxCandidates,
      minScore: validatedData.minScore,
    });

    return NextResponse.json({
      success: true,
      data: {
        matches,
        matchCount: matches.length,
        searchCriteria: {
          jobId: validatedData.jobId,
          maxCandidates: validatedData.maxCandidates,
          minScore: validatedData.minScore,
        },
      },
    });
  } catch (error) {
    console.error('Candidate matching error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to find matching candidates' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get existing matches for the job
    const matches = await aiMatchingService.getJobMatches(jobId);

    return NextResponse.json({
      success: true,
      data: {
        matches,
        matchCount: matches.length,
        jobId,
      },
    });
  } catch (error) {
    console.error('Get matches error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve matches' },
      { status: 500 }
    );
  }
} 