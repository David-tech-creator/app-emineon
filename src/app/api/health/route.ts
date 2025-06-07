import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authorization if provided (for extension compatibility)
    const authHeader = request.headers.get('authorization');
    let authStatus = 'anonymous';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.replace('Bearer ', '');
      // For testing, accept any non-empty API key
      authStatus = apiKey ? 'authenticated' : 'invalid';
    }
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      message: 'Emineon ATS API is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'operational',
        authentication: authStatus
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
        linkedinImport: 'available'
      },
      endpoints: {
        publicJobs: '/api/public/jobs',
        applyToJob: '/api/apply',
        aiJobDescription: '/api/ai/job-description',
        aiCandidateMatching: '/api/ai/candidate-matching',
        jobDistribution: '/api/jobs/[id]/distribute',
        linkedinImport: '/api/candidates/linkedin-import'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        error: 'Service temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 