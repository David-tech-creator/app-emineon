import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    // For now, return empty array since we need to implement proper job-candidate relationships
    // This will be enhanced once we have the proper pipeline structure
    return NextResponse.json([]);
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
    const jobId = params.id;
    const { candidateId } = await request.json();

    // Create new application to connect candidate with job
    const application = await prisma.application.create({
      data: {
        jobId: jobId,
        candidateId: candidateId,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error('Error adding candidate to job:', error);
    return NextResponse.json(
      { error: 'Failed to add candidate to job' },
      { status: 500 }
    );
  }
} 