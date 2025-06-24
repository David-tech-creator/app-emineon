import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

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

    // Fetch applications for this job with candidate details
    const applications = await prisma.application.findMany({
      where: {
        jobId: jobId,
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            currentTitle: true,
            currentLocation: true,
            technicalSkills: true,
            experienceYears: true,
            summary: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching job candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    
    // Handle both single candidateId and multiple candidateIds for backward compatibility
    const candidateIds = body.candidateIds || (body.candidateId ? [body.candidateId] : []);
    
    if (!candidateIds || candidateIds.length === 0) {
      return NextResponse.json(
        { error: 'No candidate IDs provided' },
        { status: 400 }
      );
    }

    console.log(`🔄 Adding ${candidateIds.length} candidate(s) to job ${jobId}:`, candidateIds);

    // Validate that job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Validate that all candidates exist
    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds } }
    });

    if (candidates.length !== candidateIds.length) {
      const foundIds = candidates.map(c => c.id);
      const missingIds = candidateIds.filter((id: string) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Candidates not found: ${missingIds.join(', ')}` },
        { status: 404 }
      );
    }

    // Check for existing applications
    const existingApplications = await prisma.application.findMany({
      where: {
        jobId: jobId,
        candidateId: { in: candidateIds }
      }
    });

    const existingCandidateIds = existingApplications.map(app => app.candidateId);
    const newCandidateIds = candidateIds.filter((id: string) => !existingCandidateIds.includes(id));

    const results = {
      success: true,
      added: [] as Array<{
        applicationId: string;
        candidate: {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          currentTitle: string | null;
        };
      }>,
      skipped: [] as Array<{
        id: string;
        name: string;
        reason: string;
      }>,
      total: candidateIds.length
    };

    // Add existing candidates to skipped list
    if (existingCandidateIds.length > 0) {
      const skippedCandidates = candidates.filter(c => existingCandidateIds.includes(c.id));
      results.skipped = skippedCandidates.map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        reason: 'Already assigned to this job'
      }));
    }

    // Create new applications for candidates not already assigned
    if (newCandidateIds.length > 0) {
      const applications = await prisma.application.createMany({
        data: newCandidateIds.map((candidateId: string) => ({
          jobId: jobId,
          candidateId: candidateId,
          status: 'PENDING',
          source: 'manual_assignment',
          updatedAt: new Date(),
        }))
      });

      // Get the created applications with candidate details for response
      const createdApplications = await prisma.application.findMany({
        where: {
          jobId: jobId,
          candidateId: { in: newCandidateIds }
        },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              currentTitle: true,
            }
          }
        }
      });

      results.added = createdApplications.map(app => ({
        applicationId: app.id,
        candidate: app.candidate
      }));

      console.log(`✅ Successfully added ${applications.count} candidate(s) to job`);
    }

    // Log summary
    console.log(`📊 Summary: ${results.added.length} added, ${results.skipped.length} skipped`);

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('💥 Error adding candidates to job:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'One or more candidates are already assigned to this job' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to add candidates to job',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 