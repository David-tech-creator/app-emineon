import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authorization if provided (for extension compatibility)
    const authHeader = request.headers.get('authorization');
    let authStatus = 'anonymous';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '');
      // For testing, accept any non-empty API key
      authStatus = apiKey ? 'authenticated' : 'invalid';
    }
    
    // Database connectivity check
    let databaseStatus = 'disconnected';
    let databaseLatency = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      databaseLatency = Date.now() - dbStart;
      databaseStatus = 'connected';
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      databaseStatus = 'error';
    }

    // External services check
    const services = {
      database: databaseStatus,
      api: 'operational',
      authentication: authStatus,
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not_configured',
      clerk: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'configured' : 'not_configured'
    };

    // Performance metrics
    const responseTime = Date.now() - startTime;
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      success: true,
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      message: 'Emineon ATS API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services,
      performance: {
        responseTime: `${responseTime}ms`,
        databaseLatency: `${databaseLatency}ms`,
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        }
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
        reporting: 'available',
        linkedinImport: 'available',
        competenceFiles: 'available',
        clientPortal: 'available'
      },
      endpoints: {
        publicJobs: '/api/public/jobs',
        applyToJob: '/api/apply',
        aiJobDescription: '/api/ai/job-description',
        aiCandidateMatching: '/api/ai/candidate-matching',
        jobDistribution: '/api/jobs/[id]/distribute',
        linkedinImport: '/api/candidates/linkedin-import',
        competenceFiles: '/api/competence-files/generate'
      }
    };

    // Return appropriate status code based on health
    const statusCode = databaseStatus === 'connected' ? 200 : 503;
    
    return NextResponse.json(healthData, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse = { 
        success: false, 
        status: 'unhealthy',
        error: 'Service temporarily unavailable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      performance: {
        responseTime: `${Date.now() - startTime}ms`
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 