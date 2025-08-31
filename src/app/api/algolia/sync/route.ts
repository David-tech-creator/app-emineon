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

    const body = await request.json();
    const { action, type, id } = body;

    console.log(`🔄 Algolia sync request: ${action} ${type} ${id || 'all'}`);

    switch (action) {
      case 'initialize':
        // Set up indices with proper configuration
        await AlgoliaService.initializeIndices();
        return NextResponse.json({
          success: true,
          message: 'Algolia indices initialized successfully'
        });

      case 'index_all':
        if (type === 'candidates') {
          const candidateResult = await AlgoliaService.indexAllCandidates();
          return NextResponse.json({
            success: true,
            message: 'All candidates indexed successfully',
            data: candidateResult
          });
        } else if (type === 'jobs') {
          const jobResult = await AlgoliaService.indexAllJobs();
          return NextResponse.json({
            success: true,
            message: 'All jobs indexed successfully',
            data: jobResult
          });
        } else if (type === 'all') {
          const [candidateResult, jobResult] = await Promise.all([
            AlgoliaService.indexAllCandidates(),
            AlgoliaService.indexAllJobs()
          ]);
          return NextResponse.json({
            success: true,
            message: 'All data indexed successfully',
            data: { candidates: candidateResult, jobs: jobResult }
          });
        }
        break;

      case 'index_single':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID required for single indexing' },
            { status: 400 }
          );
        }

        if (type === 'candidate') {
          const result = await AlgoliaService.indexCandidate(id);
          return NextResponse.json({
            success: true,
            message: 'Candidate indexed successfully',
            data: result
          });
        } else if (type === 'job') {
          const result = await AlgoliaService.indexJob(id);
          return NextResponse.json({
            success: true,
            message: 'Job indexed successfully',
            data: result
          });
        }
        break;

      case 'remove':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'ID required for removal' },
            { status: 400 }
          );
        }

        if (type === 'candidate') {
          const result = await AlgoliaService.removeCandidate(id);
          return NextResponse.json({
            success: true,
            message: 'Candidate removed from index',
            data: result
          });
        } else if (type === 'job') {
          const result = await AlgoliaService.removeJob(id);
          return NextResponse.json({
            success: true,
            message: 'Job removed from index',
            data: result
          });
        }
        break;

      case 'clear':
        if (type === 'all') {
          await AlgoliaService.clearAllIndices();
          return NextResponse.json({
            success: true,
            message: 'All indices cleared successfully'
          });
        }
        break;

      case 'stats':
        const stats = await AlgoliaService.getIndexStats();
        return NextResponse.json({
          success: true,
          data: stats
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error in Algolia sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync with Algolia',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
