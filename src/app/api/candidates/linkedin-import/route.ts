import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Validation schema for LinkedIn import data
const LinkedInImportSchema = z.object({
  linkedinUrl: z.string().url(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  currentTitle: z.string().optional(),
  currentCompany: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  profileImage: z.string().url().optional(),
  summary: z.string().optional(),
  workHistory: z.array(z.object({
    title: z.string(),
    company: z.string(),
    duration: z.string().optional(),
  })).optional(),
  extractedAt: z.string(),
  source: z.literal('linkedin_extension'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, we'll accept any Bearer token
    // In production, you'd validate the API key against your database
    const apiKey = authHeader.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = LinkedInImportSchema.parse(body);

    // Check for existing candidate by LinkedIn URL
    const existingCandidate = await prisma.candidate.findFirst({
      where: {
        linkedinUrl: validatedData.linkedinUrl
      }
    });

    if (existingCandidate) {
      return NextResponse.json({
        success: false,
        error: 'Candidate already exists',
        message: 'A candidate with this LinkedIn profile already exists in the system',
        existingCandidate: {
          id: existingCandidate.id,
          firstName: existingCandidate.firstName,
          lastName: existingCandidate.lastName,
          currentTitle: existingCandidate.currentTitle,
          linkedinUrl: existingCandidate.linkedinUrl,
        }
      }, { status: 409 });
    }

    // Generate a unique email placeholder since LinkedIn doesn't provide emails
    const emailPlaceholder = `linkedin.${Date.now()}@placeholder.emineon.com`;

    // Transform LinkedIn data to new candidate format
    const candidateData: Prisma.CandidateCreateInput = {
      // 🧱 1. Identification & Contact
      firstName: validatedData.firstName || 'Unknown',
      lastName: validatedData.lastName || 'Professional',
      email: emailPlaceholder,
      phone: null,
      linkedinUrl: validatedData.linkedinUrl,
      portfolioUrl: null,
      githubUrl: null,
      currentLocation: validatedData.location ? 
        `${validatedData.location.city || ''}, ${validatedData.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : null,
      nationality: null,
      timezone: null,
      
      // 🧠 2. Professional Summary
      currentTitle: validatedData.currentTitle || null,
      professionalHeadline: validatedData.currentTitle || null,
      summary: validatedData.summary || null,
      seniorityLevel: null, // Could be inferred from title
      primaryIndustry: null,
      functionalDomain: null,
      
      // 🛠 3. Skills & Technologies
      technicalSkills: [],
      softSkills: [],
      toolsAndPlatforms: [],
      frameworks: [],
      programmingLanguages: [],
      spokenLanguages: [],
      methodologies: [],
      
      // 💼 4. Work Experience
      experienceYears: null,
      companies: validatedData.workHistory ? validatedData.workHistory as Prisma.InputJsonValue : Prisma.DbNull,
      notableProjects: [],
      freelancer: false,
      
      // 🎓 5. Education & Certifications
      degrees: [],
      certifications: [],
      universities: [],
      graduationYear: null,
      educationLevel: null,
      
      // ⚙️ 6. Logistics & Preferences
      availableFrom: null,
      preferredContractType: null,
      expectedSalary: null,
      relocationWillingness: false,
      remotePreference: null,
      workPermitType: null,
      
      // 🤖 7. AI/ATS Specific Fields
      matchingScore: null,
      tags: ['LinkedIn Import', 'New'],
      
      // 💡 Bonus Meta Fields
      source: 'LinkedIn Extension',
      recruiterNotes: [`Imported from LinkedIn on ${new Date(validatedData.extractedAt).toLocaleDateString()}`],
      interviewScores: Prisma.DbNull,
      videoInterviewUrl: null,
      culturalFitScore: null,
      motivationalFitNotes: null,
      referees: Prisma.DbNull,
      archived: false,
      conversionStatus: 'IN_PIPELINE',
      
      // Legacy/Compatibility Fields
      status: 'NEW',
      profileToken: `linkedin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Save candidate to database
    const candidate = await prisma.candidate.create({
      data: candidateData
    });

    console.log('LinkedIn candidate imported successfully:', {
      id: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      linkedinUrl: candidate.linkedinUrl
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Candidate imported successfully from LinkedIn',
      candidate: {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        currentTitle: candidate.currentTitle,
        linkedinUrl: candidate.linkedinUrl,
        email: candidate.email,
        status: candidate.status,
        createdAt: candidate.createdAt,
      },
      metadata: {
        importedAt: candidate.createdAt,
        source: 'linkedin_extension',
        version: '2.0.0',
        workHistoryItems: validatedData.workHistory?.length || 0,
      }
    });

  } catch (error) {
    console.error('LinkedIn import error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid data format',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Candidate already exists',
          message: 'A candidate with this information already exists in the system'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'Failed to import candidate from LinkedIn'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for the extension
export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      success: true,
      message: 'Emineon ATS LinkedIn Import API is healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: 'connected',
      features: {
        linkedinImport: 'available',
        duplicateDetection: 'enabled',
        workHistoryParsing: 'enabled',
        newFieldStructure: 'active',
        totalFields: '40+',
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Service unhealthy',
        database: 'disconnected'
      },
      { status: 500 }
    );
  }
} 