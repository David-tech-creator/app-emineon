import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const runtime = 'nodejs';

// GET /api/jobs - List all jobs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const department = searchParams.get('department');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = department;
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        applications: true,
        _count: {
          select: {
            applications: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.job.count({ where });

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  contractType: z.enum(['permanent', 'freelance', 'fixed-term', 'internship']),
  workMode: z.enum(['on-site', 'remote', 'hybrid']).optional(),
  startDate: z.string().optional(),
  duration: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['draft', 'active']).default('draft'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  department: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  owner: z.string().min(1, 'Job owner is required'),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  projectId: z.string().optional(),
  
  // Pipeline and SLA fields
  pipelineStages: z.array(z.string()).default(['Sourced', 'Screened', 'Interviewing', 'Offer', 'Hired']),
  slaDays: z.number().optional().default(10),
});

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Creating job with data:', body);
    
    const validatedData = createJobSchema.parse(body);

    // Parse salary range if provided
    let salaryMin: number | undefined;
    let salaryMax: number | undefined;
    let salaryCurrency = 'CHF';

    if (validatedData.salary) {
      const salaryMatch = validatedData.salary.match(/(\w+)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:[-–to]\s*(\d+(?:,\d+)*(?:\.\d+)?))?/i);
      if (salaryMatch) {
        if (salaryMatch[1]) salaryCurrency = salaryMatch[1];
        salaryMin = parseFloat(salaryMatch[2].replace(/,/g, '')) * 1000; // Assume values are in thousands
        if (salaryMatch[3]) {
          salaryMax = parseFloat(salaryMatch[3].replace(/,/g, '')) * 1000;
        }
      }
    }

    // Map employment type
    const employmentTypeMap: Record<string, string> = {
      'permanent': 'FULL_TIME',
      'freelance': 'FREELANCE',
      'fixed-term': 'CONTRACT',
      'internship': 'INTERNSHIP'
    };

    // Generate public token for job applications
    const publicToken = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate SLA deadline based on slaDays
    const slaDeadline = validatedData.slaDays 
      ? new Date(Date.now() + (validatedData.slaDays * 24 * 60 * 60 * 1000))
      : new Date(Date.now() + (10 * 24 * 60 * 60 * 1000)); // Default 10 days

    // Create job data matching Prisma schema
    const jobData = {
      title: validatedData.title,
      description: validatedData.description,
      department: validatedData.department || 'General',
      location: validatedData.location,
      status: validatedData.status === 'active' ? 'ACTIVE' as const : 'DRAFT' as const,
      salaryMin,
      salaryMax,
      salaryCurrency,
      experienceLevel: validatedData.experienceLevel,
      benefits: validatedData.benefits || [],
      requirements: [
        ...(validatedData.requirements || []),
        ...(validatedData.skills || []).map(skill => `Skill: ${skill}`),
        ...(validatedData.languages || []).map(lang => `Language: ${lang}`)
      ],
      responsibilities: validatedData.responsibilities || [],
      isRemote: validatedData.workMode === 'remote',
      publicToken,
      employmentType: [employmentTypeMap[validatedData.contractType] || 'FULL_TIME'],
      projectId: validatedData.projectId || undefined,
      publishedAt: validatedData.status === 'active' ? new Date() : undefined,
      
      // Pipeline and SLA fields
      pipelineStages: validatedData.pipelineStages,
      slaDeadline,
      slaDays: validatedData.slaDays,
    };

    console.log('Creating job with processed data:', jobData);

    const job = await prisma.job.create({
      data: jobData,
      include: {
        applications: true,
        _count: {
          select: {
            applications: true,
          }
        }
      }
    });

    console.log('Job created successfully:', job.id);

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 