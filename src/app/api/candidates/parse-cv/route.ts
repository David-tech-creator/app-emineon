import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { cvParserService } from '@/lib/services/cv-parser';

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

    const formData = await request.formData();
    const file = formData.get('cv') as File;
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No CV file provided',
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size too large. Maximum 10MB allowed.',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type) && 
        !file.name.endsWith('.doc') && 
        !file.name.endsWith('.docx') && 
        !file.name.endsWith('.pdf') &&
        !file.name.endsWith('.txt')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.',
        },
        { status: 400 }
      );
    }

    const parsedData = await cvParserService.parseCV(file);

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: 'CV parsed successfully',
    });
  } catch (error) {
    console.error('CV parsing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse CV',
      },
      { status: 500 }
    );
  }
} 