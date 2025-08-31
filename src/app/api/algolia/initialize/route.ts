import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { AlgoliaService } from '@/lib/services/algolia-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    console.log('🚀 Starting Algolia initialization...');

    // Step 1: Initialize indices with settings
    await AlgoliaService.initializeIndices();
    console.log('✅ Indices initialized');

    // Step 2: Index all candidates
    const candidateResult = await AlgoliaService.indexAllCandidates();
    console.log('✅ Candidates indexed');

    // Step 3: Index all jobs
    const jobResult = await AlgoliaService.indexAllJobs();
    console.log('✅ Jobs indexed');

    return NextResponse.json({
      success: true,
      message: 'Algolia initialization completed successfully',
      data: {
        candidates: candidateResult,
        jobs: jobResult
      }
    });

  } catch (error) {
    console.error('❌ Error initializing Algolia:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initialize Algolia',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
