import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('📄 Resume parsing endpoint called');

    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided',
        message: 'Please upload a resume file (PDF, DOC, or DOCX)'
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: 'Please upload a PDF, DOC, or DOCX file'
      }, { status: 400 });
    }

    // Validate file size (32MB limit for OpenAI)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        message: 'File size must be less than 32MB'
      }, { status: 400 });
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`);

    let openaiFile: any = undefined;

    try {
      // Upload file to OpenAI Files API with user_data purpose
      console.log('☁️ Uploading file to OpenAI...');
      openaiFile = await openai.files.create({
        file: file,
        purpose: 'user_data'
      });

      console.log(`✅ File uploaded to OpenAI: ${openaiFile.id}`);

      // Use the new Responses API to process the PDF
      console.log('🤖 Processing PDF with Responses API...');
      const response = await openai.responses.create({
        model: 'gpt-4o',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                file_id: openaiFile.id
              },
              {
                type: 'input_text',
                text: `You are a professional resume parser. Extract structured information from the uploaded resume/CV and return it as a JSON object with the following structure:

{
  "fullName": "string",
  "currentTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "yearsOfExperience": number,
  "skills": ["string"],
  "certifications": ["string"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or Present",
      "responsibilities": "string"
    }
  ],
  "education": ["string"],
  "languages": ["string"],
  "summary": "string"
}

Extract all available information. If some fields are not available, use empty strings or arrays. For yearsOfExperience, calculate based on work history. For summary, create a brief professional summary based on the resume content.

Return ONLY the JSON object, no additional text or formatting.`
              }
            ]
          }
        ]
      });

      const responseContent = response.output_text;
      
      if (!responseContent) {
        throw new Error('No response from OpenAI');
      }

      console.log('📋 Raw GPT-4 response:', responseContent);

      // Parse the JSON response
      let candidateData;
      try {
        // Clean the response in case there's any markdown formatting
        const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
        candidateData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse GPT-4 response as JSON:', parseError);
        throw new Error('Failed to parse resume content. Please try again.');
      }

      // Validate required fields
      if (!candidateData.fullName) {
        throw new Error('Could not extract candidate name from resume');
      }

      // Add metadata
      candidateData.id = `parsed_${Date.now()}`;
      candidateData.source = 'resume_upload';
      candidateData.originalFileName = file.name;

      console.log('✅ Resume parsed successfully:', candidateData.fullName);

      // Clean up: Delete the uploaded file
      try {
        await openai.files.del(openaiFile.id);
        console.log('🗑️ Cleaned up OpenAI file');
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete OpenAI file:', deleteError);
        // Don't fail the request if cleanup fails
      }

      return NextResponse.json({
        success: true,
        data: candidateData,
        message: 'Resume parsed successfully'
      });

    } catch (openaiError) {
      console.error('❌ OpenAI API error:', openaiError);

      // Try to clean up any created resources
      try {
        if (openaiFile) {
          await openai.files.del(openaiFile.id);
        }
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup file after error:', cleanupError);
      }

      return NextResponse.json({
        error: 'Failed to process resume',
        message: 'There was an error processing your resume. Please try again or contact support.',
        details: openaiError instanceof Error ? openaiError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 Resume parsing error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your resume.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Resume parsing endpoint',
    methods: ['POST'],
    description: 'Upload a resume file (PDF, DOC, DOCX) to parse candidate information'
  });
} 