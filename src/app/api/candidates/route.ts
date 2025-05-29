import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/utils/database';
import { candidateSchema, transformCandidateFormData } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    // For now, return mock data since we don't have a real database connection
    const mockCandidates = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        skills: ['Python', 'Django', 'PostgreSQL'],
        experience: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockCandidates,
      authenticated: !!userId,
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch candidates',
      },
      { status: 500 }
    );
  }
}

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
    
    // Validate the data
    const validatedData = candidateSchema.parse(body);
    
    // For now, return a mock response since we don't have a real database
    const mockCandidate = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockCandidate,
      message: 'Candidate created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create candidate',
      },
      { status: 500 }
    );
  }
} 