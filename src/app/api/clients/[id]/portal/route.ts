import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    const clientId = params.id;

    // Verify access (either internal user or authorized client portal user)
    // This would need to be expanded with proper client portal authentication
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client details (mock data for now since schema isn't fully migrated)
    const client = {
      id: clientId,
      name: 'TechCorp Solutions',
      industry: 'Technology',
      contactPerson: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      logo: null,
      jobs: [
        {
          id: '1',
          title: 'Senior Full Stack Developer',
          department: 'Engineering',
          location: 'Zurich, Switzerland',
          status: 'ACTIVE',
          priority: 'HIGH',
          createdAt: new Date('2024-02-01'),
          targetDate: new Date('2024-03-15'),
          _count: { candidates: 12 },
          candidates: []
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'Remote',
          status: 'ACTIVE',
          priority: 'MEDIUM',
          createdAt: new Date('2024-02-08'),
          targetDate: new Date('2024-04-01'),
          _count: { candidates: 8 },
          candidates: []
        }
      ]
    };

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Mock pipeline data for demo
    const activeJobs = client.jobs.map((job) => {
      const daysOpen = Math.ceil(
        (new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: job.id,
        title: job.title,
        department: job.department || '',
        location: job.location || '',
        status: job.status.toLowerCase(),
        candidatesCount: job._count.candidates,
        stagesCount: {
          sourcing: job.id === '1' ? 3 : 2,
          screening: job.id === '1' ? 4 : 3,
          interview: job.id === '1' ? 3 : 2,
          assessment: job.id === '1' ? 1 : 1,
          offer: job.id === '1' ? 1 : 0
        },
        priority: job.priority?.toLowerCase() || 'medium',
        daysOpen,
        lastActivity: job.id === '1' ? '2 hours ago' : '1 day ago',
        targetHireDate: job.targetDate ? formatDate(job.targetDate) : undefined
      };
    });

    // Mock recent activity
    const formattedActivity = [
      {
        id: '1',
        type: 'candidate_added',
        jobId: '1',
        jobTitle: 'Senior Full Stack Developer',
        candidateName: 'Alex Mueller',
        message: 'New candidate added to pipeline',
        timestamp: '2 hours ago',
        requiresAttention: false
      },
      {
        id: '2',
        type: 'stage_change',
        jobId: '1',
        jobTitle: 'Senior Full Stack Developer',
        candidateName: 'Emma Schmidt',
        message: 'Moved to Interview stage',
        timestamp: '4 hours ago',
        requiresAttention: true
      },
      {
        id: '3',
        type: 'assessment_completed',
        jobId: '2',
        jobTitle: 'Product Manager',
        candidateName: 'David Chen',
        message: 'Technical assessment completed - awaiting your review',
        timestamp: '1 day ago',
        requiresAttention: true
      }
    ];

    // Mock metrics
    const metrics = {
      totalCandidates: 26,
      interviewsScheduled: 6,
      pendingFeedback: 4,
      offersExtended: 1
    };

    const portalData = {
      client: {
        id: client.id,
        name: client.name,
        industry: client.industry || '',
        primaryContact: client.contactPerson || '',
        email: client.email || '',
        logo: client.logo
      },
      activeJobs,
      recentActivity: formattedActivity,
      metrics
    };

    return NextResponse.json(portalData);

  } catch (error) {
    console.error('Error fetching client portal data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portal data' },
      { status: 500 }
    );
  }
}

// Helper functions
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

function mapActivityType(action: string): string {
  const typeMap: Record<string, string> = {
    'candidate_added': 'candidate_added',
    'candidate_moved': 'stage_change',
    'comment_added': 'comment',
    'interview_scheduled': 'interview_scheduled',
    'assessment_completed': 'assessment_completed'
  };
  return typeMap[action] || 'activity';
}

function generateActivityMessage(action: string, candidateName: string, jobTitle: string): string {
  switch (action) {
    case 'candidate_added':
      return 'New candidate added to pipeline';
    case 'candidate_moved':
      return 'Moved to next stage';
    case 'comment_added':
      return 'New comment added';
    case 'interview_scheduled':
      return 'Interview scheduled';
    case 'assessment_completed':
      return 'Assessment completed - awaiting your review';
    default:
      return 'Activity recorded';
  }
}

function isActionRequired(action: string): boolean {
  return ['assessment_completed', 'interview_requested', 'feedback_requested'].includes(action);
} 