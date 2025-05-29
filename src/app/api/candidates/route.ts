import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { PrismaClient } from '@prisma/client';
import { candidateSchema, transformCandidateFormData } from '@/lib/validation';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    // Fetch candidates from database
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: candidates,
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
    
    // Transform and validate the data
    const validatedData = transformCandidateFormData(body);
    
    // Create candidate in database
    const candidate = await prisma.candidate.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      data: candidate,
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