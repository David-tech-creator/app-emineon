import { NextRequest, NextResponse } from 'next/server';
import { cvParserService } from '@/lib/services/cv-parser';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    console.log('CV parsing request received');

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

    // Extract file content as text
    const fileContent = await file.text();
    const fileName = file.name;

    const parsedData = await cvParserService.parseCV(fileContent, fileName);

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