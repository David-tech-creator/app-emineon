import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
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

    // Mock implementation for now - will be updated when TypeScript cache is cleared
    const mockMatches = [
      {
        candidateId: '1',
        candidateName: 'Alex Chen',
        score: 92,
        reasoning: 'Strong technical skills match with 6 years experience in React and Node.js',
        candidate: {
          id: '1',
          fullName: 'Alex Chen',
          email: 'alex.chen@email.com',
          currentTitle: 'Senior Software Engineer',
          experienceYears: 6,
          technicalSkills: ['React', 'Node.js', 'TypeScript', 'AWS'],
          currentLocation: 'San Francisco, CA',
        }
      },
      {
        candidateId: '2',
        candidateName: 'Maria Rodriguez',
        score: 88,
        reasoning: 'Excellent product management experience with agile methodologies',
        candidate: {
          id: '2',
          fullName: 'Maria Rodriguez',
          email: 'maria.rodriguez@email.com',
          currentTitle: 'Product Manager',
          experienceYears: 8,
          technicalSkills: ['Product Strategy', 'Agile', 'Scrum', 'Analytics'],
          currentLocation: 'Austin, TX',
        }
      }
    ].filter(match => match.score >= validatedData.minScore)
     .slice(0, validatedData.maxCandidates);

    return NextResponse.json({
      success: true,
      data: {
        matches: mockMatches,
        matchCount: mockMatches.length,
        totalCandidates: 2,
        averageScore: 90,
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

    // Mock implementation for now
    const mockMatches = [
      {
        candidateId: '1',
        candidateName: 'Alex Chen',
        score: 92,
        reasoning: 'Strong technical skills match',
        candidate: {
          id: '1',
          fullName: 'Alex Chen',
          email: 'alex.chen@email.com',
          currentTitle: 'Senior Software Engineer',
          experienceYears: 6,
          technicalSkills: ['React', 'Node.js', 'TypeScript'],
          currentLocation: 'San Francisco, CA',
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        matches: mockMatches,
        matchCount: mockMatches.length,
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