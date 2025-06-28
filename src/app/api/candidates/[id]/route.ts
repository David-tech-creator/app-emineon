import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const { id } = params;
    
    // For now, return mock data
    const mockCandidate = {
      id,
      name: 'John Smith',
      email: 'john.smith@example.com',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockCandidate,
      authenticated: !!userId,
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch candidate',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/candidates/[id] - Update candidate
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    console.log(`🔄 Updating candidate ${id} with data:`, body);

    // Update candidate in database
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...body,
        lastUpdated: new Date(),
      },
    });

    console.log(`✅ Candidate ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      data: updatedCandidate,
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Candidate not found',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update candidate',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    
    // For now, return a mock response
    return NextResponse.json({
      success: true,
      message: 'Candidate deleted successfully',
      deletedBy: userId,
    });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete candidate',
      },
      { status: 500 }
    );
  }
} 