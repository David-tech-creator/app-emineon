import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication (allow bypass for testing and production)
    let isAuthenticated = false;
    try {
      const { userId } = auth();
      if (userId) {
        console.log('✅ User authenticated:', userId);
        isAuthenticated = true;
      } else {
        console.log('⚠️ No authentication found, proceeding for testing purposes');
      }
    } catch (authError) {
      console.log('⚠️ Authentication check failed, proceeding for testing purposes:', authError);
    }

    // Allow bypass in development or when BYPASS_AUTH is set
    const allowBypass = process.env.NODE_ENV === 'development' || 
                       process.env.BYPASS_AUTH === 'true' || 
                       process.env.VERCEL_ENV === 'preview';
    
    if (!isAuthenticated && !allowBypass) {
      console.log('❌ Authentication required and no bypass allowed');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required to access this endpoint'
      }, { status: 401 });
    }

    console.log('🔗 LinkedIn parsing endpoint called');

    const body = await request.json();
    const { linkedinText } = body;

    if (!linkedinText || typeof linkedinText !== 'string') {
      return NextResponse.json({ 
        error: 'No LinkedIn text provided',
        message: 'Please provide LinkedIn profile text to parse'
      }, { status: 400 });
    }

    if (linkedinText.trim().length < 50) {
      return NextResponse.json({
        error: 'LinkedIn text too short',
        message: 'Please provide more detailed LinkedIn profile information'
      }, { status: 400 });
    }

    console.log(`📝 Processing LinkedIn text (${linkedinText.length} characters)`);

    try {
      // Use OpenAI Responses API for better reliability
      console.log('🤖 Processing LinkedIn content with Responses API...');
      
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Please analyze this LinkedIn profile text and extract structured information. Return a JSON object with the following structure:

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

Extract all available information from the LinkedIn profile text. If some fields are not available, use empty strings or arrays. For yearsOfExperience, calculate based on work history. For summary, use the LinkedIn summary/about section or create a brief professional summary based on the profile content.

Return ONLY the JSON object, no additional text or formatting.

LinkedIn Profile Text:
${linkedinText}`
              }
            ]
          }
        ]
      });

      console.log('📋 Responses API completed successfully');

      // Extract the response content
      const responseMessage = response.output[0];
      if (!responseMessage || responseMessage.type !== 'message') {
        throw new Error('No valid response from Responses API');
      }

      const textContent = responseMessage.content[0];
      if (!textContent || textContent.type !== 'output_text') {
        throw new Error('No text content in response');
      }

      const responseContent = textContent.text;
      console.log('📋 Raw Responses API response:', responseContent);

      // Parse the JSON response
      let candidateData;
      try {
        // Clean the response in case there's any markdown formatting
        const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
        candidateData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse Responses API response as JSON:', parseError);
        throw new Error('Failed to parse LinkedIn content. Please try again.');
      }

      // Validate required fields
      if (!candidateData.fullName) {
        throw new Error('Could not extract candidate name from LinkedIn profile');
      }

      // Add metadata
      candidateData.id = `linkedin_${Date.now()}`;
      candidateData.source = 'linkedin_import';
      candidateData.originalText = linkedinText.substring(0, 500) + '...'; // Store first 500 chars for reference

      console.log('✅ LinkedIn profile parsed successfully:', candidateData.fullName);

      return NextResponse.json({
        success: true,
        data: candidateData,
        message: 'LinkedIn profile parsed successfully'
      });

    } catch (openaiError) {
      console.error('❌ OpenAI API error:', openaiError);
      
      // Fallback to regular Chat Completions API if Responses API fails
      console.log('🔄 Falling back to Chat Completions API...');
      
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a professional LinkedIn profile parser. Extract structured information from the provided LinkedIn profile text and return it as a JSON object with the following structure:

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

Extract all available information from the LinkedIn profile text. If some fields are not available, use empty strings or arrays. For yearsOfExperience, calculate based on work history. For summary, use the LinkedIn summary/about section or create a brief professional summary based on the profile content.

Return ONLY the JSON object, no additional text or formatting.`
            },
            {
              role: 'user',
              content: `Please parse this LinkedIn profile text and extract the structured information as JSON:\n\n${linkedinText}`
            }
          ],
          temperature: 0.1,
          max_tokens: 2000
        });

        const responseContent = completion.choices[0]?.message?.content;
        
        if (!responseContent) {
          throw new Error('No response from OpenAI');
        }

        console.log('📋 Fallback response:', responseContent);

        // Parse the JSON response
        let candidateData;
        try {
          // Clean the response in case there's any markdown formatting
          const cleanedResponse = responseContent.replace(/```json\n?|\n?```/g, '').trim();
          candidateData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error('❌ Failed to parse fallback response as JSON:', parseError);
          throw new Error('Failed to parse LinkedIn content. Please try again.');
        }

        // Validate required fields
        if (!candidateData.fullName) {
          throw new Error('Could not extract candidate name from LinkedIn profile');
        }

        // Add metadata
        candidateData.id = `linkedin_${Date.now()}`;
        candidateData.source = 'linkedin_import';
        candidateData.originalText = linkedinText.substring(0, 500) + '...';

        console.log('✅ LinkedIn profile parsed successfully (fallback):', candidateData.fullName);

        return NextResponse.json({
          success: true,
          data: candidateData,
          message: 'LinkedIn profile parsed successfully'
        });

      } catch (fallbackError) {
        console.error('❌ Fallback API error:', fallbackError);
        
        return NextResponse.json({
          error: 'Failed to process LinkedIn profile',
          message: 'There was an error processing your LinkedIn profile. Please try again or contact support.',
          details: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('💥 LinkedIn parsing error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your LinkedIn profile.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'LinkedIn parsing endpoint',
    methods: ['POST'],
    description: 'Parse LinkedIn profile text to extract candidate information'
  });
} 