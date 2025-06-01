import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    // Transform LinkedIn data to candidate format
    const candidateData = {
      firstName: validatedData.firstName || 'Unknown',
      lastName: validatedData.lastName || 'Professional',
      email: '', // Will be empty from LinkedIn scraping
      phone: '', // Will be empty from LinkedIn scraping
      currentTitle: validatedData.currentTitle || '',
      currentCompany: validatedData.currentCompany || '',
      location: validatedData.location ? 
        `${validatedData.location.city || ''}, ${validatedData.location.country || ''}`.trim().replace(/^,\s*|,\s*$/g, '') : '',
      linkedinUrl: validatedData.linkedinUrl,
      summary: validatedData.summary || '',
      workHistory: validatedData.workHistory || [],
      profileImage: validatedData.profileImage || '',
      source: 'LinkedIn Extension',
      status: 'new',
      tags: ['LinkedIn Import'],
      notes: `Imported from LinkedIn on ${new Date(validatedData.extractedAt).toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real application, you would:
    // 1. Save to database
    // 2. Check for duplicates
    // 3. Send notifications
    // 4. Update analytics

    // For now, we'll simulate a successful import
    console.log('LinkedIn candidate import:', candidateData);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Candidate imported successfully',
      candidate: {
        id: `linkedin_${Date.now()}`, // Generate a temporary ID
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        currentTitle: candidateData.currentTitle,
        currentCompany: candidateData.currentCompany,
        linkedinUrl: candidateData.linkedinUrl,
      },
      metadata: {
        importedAt: new Date().toISOString(),
        source: 'linkedin_extension',
        version: '1.0.0',
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

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for the extension
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Emineon ATS API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
} 