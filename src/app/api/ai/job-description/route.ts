import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { openaiService } from '@/lib/openai';
import { aiJobDescriptionSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 30;

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
    
    // Validate the input
    const validatedData = aiJobDescriptionSchema.parse(body);
    
    // Generate job description using OpenAI
    const jobDescription = await openaiService.generateJobDescription(validatedData);

    return NextResponse.json({
      success: true,
      data: {
        jobDescription,
        input: validatedData,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating job description:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate job description',
      },
      { status: 500 }
    );
  }
} 