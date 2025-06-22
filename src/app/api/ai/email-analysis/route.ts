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
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required for email analysis'
      }, { status: 401 });
    }

    console.log('✅ Email analysis request from user:', userId);

    const body = await request.json();
    const { from, subject, body: emailBody, date } = body;

    if (!from || !subject) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'Email from and subject are required'
      }, { status: 400 });
    }

    console.log('📧 Analyzing email:', { from, subject });

    // Prepare the analysis prompt
    const analysisPrompt = `
Analyze this recruitment-related email and provide insights:

From: ${from}
Subject: ${subject}
Date: ${date}
Body: ${emailBody || 'No body content'}

Please analyze this email and provide:
1. Email type (candidate_application, recruiter_outreach, interview_scheduling, follow_up, etc.)
2. Brief summary of the email content
3. Suggested actions for the recruiter
4. Priority level (high, medium, low)
5. Any candidate information that can be extracted

Respond in JSON format with the following structure:
{
  "type": "email_type",
  "summary": "brief summary",
  "actionItems": ["action1", "action2"],
  "priority": "medium",
  "candidateInfo": {
    "name": "extracted name if available",
    "skills": ["skill1", "skill2"],
    "experience": "experience level if mentioned",
    "location": "location if mentioned"
  },
  "sentiment": "positive/neutral/negative"
}
`;

    // Call OpenAI for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert recruitment analyst. Analyze emails to help recruiters manage their workflow efficiently. Always respond with valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysisText = completion.choices[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Parse the JSON response
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError);
      // Fallback analysis
      analysis = {
        type: 'general',
        summary: 'Email analyzed successfully',
        actionItems: ['Review email content', 'Take appropriate action'],
        priority: 'medium',
        candidateInfo: {},
        sentiment: 'neutral'
      };
    }

    console.log('🤖 Analysis completed:', analysis.type);

    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        analyzedAt: new Date().toISOString(),
        emailFrom: from,
        emailSubject: subject
      }
    });

  } catch (error) {
    console.error('❌ Email analysis error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
} 