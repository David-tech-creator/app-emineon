import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loggingService } from '@/lib/services';
import { candidateSchema, transformFormToApiData } from '@/lib/validation';

export const runtime = 'nodejs';

// GET /api/candidates - List all candidates with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const source = searchParams.get('source') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentTitle: { contains: search, mode: 'insensitive' } },
        { primaryIndustry: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (skills.length > 0) {
      where.OR = [
        ...(where.OR || []),
        { technicalSkills: { hasSome: skills } },
        { softSkills: { hasSome: skills } },
        { frameworks: { hasSome: skills } },
        { programmingLanguages: { hasSome: skills } },
        { tags: { hasSome: skills } },
      ];
    }
    
    if (source) {
      where.source = { contains: source, mode: 'insensitive' };
    }
    
    // Get candidates with pagination
    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          currentTitle: true,
          professionalHeadline: true,
          currentLocation: true,
          linkedinUrl: true,
          portfolioUrl: true,
          experienceYears: true,
          technicalSkills: true,
          primaryIndustry: true,
          seniorityLevel: true,
          expectedSalary: true,
          remotePreference: true,
          tags: true,
          status: true,
          conversionStatus: true,
          matchingScore: true,
          source: true,
          createdAt: true,
          lastUpdated: true,
        },
      }),
      prisma.candidate.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

// POST /api/candidates - Create a new candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate and transform the data using the main validation schema
    const validatedData = candidateSchema.parse(body);
    
    // Check if candidate with email already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingCandidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create the candidate
    const candidate = await prisma.candidate.create({
      data: {
        ...validatedData,
        status: 'NEW',
        conversionStatus: 'IN_PIPELINE',
        profileToken: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    });
    
    // Log the creation
    await loggingService.log({
      action: 'CANDIDATE_CREATED',
      resource: `candidate:${candidate.id}`,
      details: {
        candidateId: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        source: candidate.source || 'manual',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: { candidate },
      message: 'Candidate created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: 'Invalid candidate data provided', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
} 