import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { openaiService } from '@/lib/openai';

// Mock candidates data for AI matching
const mockCandidates = [
  {
    id: '1',
    name: 'John Smith',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experience: 5,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
    experience: 3,
  },
  {
    id: '3',
    name: 'Mike Chen',
    skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'],
    experience: 8,
  },
  {
    id: '4',
    name: 'Emily Davis',
    skills: ['React', 'Vue.js', 'CSS', 'UX Design'],
    experience: 4,
  },
];

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
    const { jobId, jobDescription } = body;
    
    if (!jobId || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Job ID and job description are required',
        },
        { status: 400 }
      );
    }
    
    // Use AI to rank candidates for this job
    const rankings = await openaiService.rankCandidates(jobDescription, mockCandidates);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        rankings,
        totalCandidates: mockCandidates.length,
        rankedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error ranking candidates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to rank candidates',
      },
      { status: 500 }
    );
  }
} 