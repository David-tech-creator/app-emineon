import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { AlgoliaService } from '@/lib/services/algolia-service';

export const runtime = 'nodejs';

// GET /api/jobs/[id] - Get job details by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;

    const job = await prisma.job.findUnique({
      where: {
        id: jobId
      },
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                currentLocation: true,
                technicalSkills: true,
                experienceYears: true,
                currentTitle: true,
                status: true,
                createdAt: true,
              }
            }
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update job
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;
    const body = await request.json();

    const job = await prisma.job.update({
      where: {
        id: jobId
      },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        applications: true,
        _count: {
          select: {
            applications: true,
          }
        }
      }
    });

    // Update job in Algolia
    try {
      await AlgoliaService.indexJob(jobId);
      console.log('✅ Job updated in Algolia');
    } catch (algoliaError) {
      console.error('⚠️ Failed to update job in Algolia:', algoliaError);
      // Don't fail the entire request if Algolia fails
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobId = params.id;

    await prisma.job.delete({
      where: {
        id: jobId
      }
    });

    // Remove job from Algolia index
    try {
      await AlgoliaService.removeJob(jobId);
      console.log('✅ Job removed from Algolia');
    } catch (algoliaError) {
      console.error('⚠️ Failed to remove job from Algolia:', algoliaError);
      // Don't fail the entire request if Algolia fails
    }

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 