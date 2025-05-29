import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        api: 'operational',
        authentication: 'configured'
      },
      features: {
        candidateManagement: 'available',
        jobPosting: 'available',
        aiMatching: 'available',
        jobDistribution: 'available',
        socialMediaPromotion: 'available',
        publicApplications: 'available',
        assessments: 'available',
        workflowAutomation: 'available',
        reporting: 'available'
      },
      endpoints: {
        publicJobs: '/api/public/jobs',
        applyToJob: '/api/apply',
        aiJobDescription: '/api/ai/job-description',
        aiCandidateMatching: '/api/ai/candidate-matching',
        jobDistribution: '/api/jobs/[id]/distribute'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 