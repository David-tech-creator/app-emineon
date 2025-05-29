import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { jobSchema } from '@/lib/validation';
import { workflowEngine } from '@/lib/services/workflow';

// Mock jobs data
const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    description: 'We are looking for a senior software engineer with experience in React, Node.js, and TypeScript.',
    department: 'Engineering',
    location: 'San Francisco, CA',
    language: 'EN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Product Manager',
    description: 'Product manager to lead our mobile app development team.',
    department: 'Product',
    location: 'New York, NY',
    language: 'EN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'UX Designer',
    description: 'UX Designer to create beautiful and intuitive user experiences.',
    department: 'Design',
    location: 'Remote',
    language: 'EN',
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    
    let filteredJobs = mockJobs;
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    
    if (department) {
      filteredJobs = filteredJobs.filter(job => job.department === department);
    }

    return NextResponse.json({
      success: true,
      data: filteredJobs,
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
    
    // Create mock job
    const newJob = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Trigger workflow
    await workflowEngine.executeWorkflows({
      event: 'job_created',
      data: {
        job: newJob,
        createdBy: userId
      }
    });

    // Add to mock data
    mockJobs.push(newJob);

    return NextResponse.json({
      success: true,
      data: newJob,
      message: 'Job created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job',
      },
      { status: 500 }
    );
  }
} 