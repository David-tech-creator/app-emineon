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
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                status: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
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
  client: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  contractType: z.enum(['permanent', 'freelance', 'fixed-term', 'internship']),
  startDate: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'closed']).default('draft'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('CHF'),
  remote: z.boolean().default(false),
  urgent: z.boolean().default(false),
});

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createJobSchema.parse(body);

    // Map form data to Job model fields
    const jobData = {
      title: validatedData.title,
      description: validatedData.description || '',
      department: 'General', // Default department
      location: validatedData.location,
      status: validatedData.status?.toUpperCase() as any || 'DRAFT',
      salaryMin: validatedData.salaryMin,
      salaryMax: validatedData.salaryMax,
      salaryCurrency: validatedData.currency,
      isRemote: validatedData.remote,
      employmentType: [validatedData.contractType],
      requirements: validatedData.requirements ? [validatedData.requirements] : [],
    };

    // Create the job in the database
    const job = await prisma.job.create({
      data: jobData,
      include: {
        applications: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 