import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { jobSchema } from '@/lib/validation';
import { workflowEngine } from '@/lib/services/workflow';
import { loggingService } from '@/lib/services';

export const runtime = 'nodejs';

// GET /api/jobs - List all jobs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    
    // Get jobs with pagination
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          department: true,
          location: true,
          language: true,
          status: true,
          salaryMin: true,
          salaryMax: true,
          salaryCurrency: true,
          experienceLevel: true,
          employmentType: true,
          benefits: true,
          requirements: true,
          responsibilities: true,
          isRemote: true,
          publicToken: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          expiresAt: true,
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
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
    const validatedData = jobSchema.parse(body);
    
    // Generate public token for job applications
    const publicToken = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the job
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        publicToken,
        publishedAt: validatedData.status === 'ACTIVE' ? new Date() : null,
      },
    });

    // Log the creation
    await loggingService.log({
      action: 'JOB_CREATED',
      resource: `job:${job.id}`,
      details: {
        jobId: job.id,
        title: job.title,
        department: job.department,
        status: job.status,
        createdBy: userId,
      },
    });

    // Trigger workflow
    await workflowEngine.executeWorkflows({
      event: 'job_created',
      data: {
        job,
        createdBy: userId
      }
    });

    return NextResponse.json({
      success: true,
      data: { job },
      message: 'Job created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid job data provided',
          details: error.message,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job',
      },
      { status: 500 }
    );
  }
} 