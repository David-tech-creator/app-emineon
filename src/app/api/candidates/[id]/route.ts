import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

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