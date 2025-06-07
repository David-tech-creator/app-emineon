import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loggingService } from '@/lib/services';
import { z } from 'zod';

export const runtime = 'nodejs';

const applicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  coverLetter: z.string().optional(),
  referralCode: z.string().optional(),
  cvUrl: z.string().url().optional(),
  source: z.string().optional().default('website'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Get client IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if job exists and is active
    const job = await (prisma as any).job.findFirst({
      where: {
        id: validatedData.jobId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        department: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found or not active' },
        { status: 404 }
      );
    }

    // Check if candidate already exists
    let candidate = await prisma.candidate.findUnique({
      where: { email: validatedData.email },
    });

    // Create candidate if doesn't exist
    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          portfolioUrl: validatedData.cvUrl, // Map cvUrl to portfolioUrl for now
          source: validatedData.source,
          experienceYears: 0, // Default, can be updated later
          technicalSkills: [],
          softSkills: [],
          toolsAndPlatforms: [],
          frameworks: [],
          programmingLanguages: [],
          spokenLanguages: [],
          methodologies: [],
          degrees: [],
          certifications: [],
          universities: [],
          graduationYear: null,
          educationLevel: null,
          companies: null,
          notableProjects: [],
          tags: ['Website Application'],
          recruiterNotes: [`Applied via website on ${new Date().toLocaleDateString()}`],
          freelancer: false,
          relocationWillingness: false,
          archived: false,
          status: 'NEW',
          conversionStatus: 'IN_PIPELINE',
          profileToken: `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        } as any,
      });
    }

    // Check for existing application
    const existingApplication = await (prisma as any).application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: validatedData.jobId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this position' },
        { status: 409 }
      );
    }

    // Create the application
    const application = await (prisma as any).application.create({
      data: {
        candidateId: candidate.id,
        jobId: validatedData.jobId,
        coverLetter: validatedData.coverLetter,
        cvUrl: validatedData.cvUrl,
        referralCode: validatedData.referralCode,
        source: validatedData.source,
        ipAddress,
        userAgent,
        status: 'PENDING',
      },
    });

    // Log the application
    await loggingService.log({
      action: 'APPLICATION_SUBMITTED',
      resource: `application:${application.id}`,
      details: {
        candidateId: candidate.id,
        jobId: validatedData.jobId,
        jobTitle: job.title,
        source: validatedData.source,
        hasReferral: !!validatedData.referralCode,
      },
    });

    // If there's a referral code, try to mark it as used
    if (validatedData.referralCode) {
      try {
        await (prisma as any).referral.updateMany({
          where: {
            code: validatedData.referralCode,
            isUsed: false,
          },
          data: {
            isUsed: true,
            candidateId: candidate.id,
          },
        });
      } catch (error) {
        console.log('Referral code not found or already used:', validatedData.referralCode);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        applicationId: application.id,
        candidateId: candidate.id,
        jobTitle: job.title,
        submittedAt: application.createdAt,
        message: 'Application submitted successfully! We will review your application and get back to you soon.',
      },
    });
  } catch (error) {
    console.error('Application submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid application data', details: error.errors },
        { status: 400 }
      );
    }

    await loggingService.log({
      action: 'APPLICATION_ERROR',
      resource: 'application:unknown',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
      level: 'ERROR',
    });

    return NextResponse.json(
      { success: false, error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
} 