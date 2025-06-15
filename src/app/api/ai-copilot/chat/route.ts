import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ Authentication required for AI copilot');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated for AI copilot:', userId);

    const body = await request.json();
    const { message, fileIds } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get database context and search if relevant
    const candidateCount = await prisma.candidate.count();
    const jobCount = await prisma.job.count();
    
    let candidates: any[] = [];
    let jobs: any[] = [];
    
    // Enhanced search based on message content
    const searchTerms = message.toLowerCase();
    
    // Search candidates based on message
    if (searchTerms.includes('candidate') || searchTerms.includes('find') || searchTerms.includes('search') || 
        searchTerms.includes('match')) {
      
      const searchConditions: any[] = [
        { firstName: { contains: message, mode: 'insensitive' } },
        { lastName: { contains: message, mode: 'insensitive' } },
        { currentTitle: { contains: message, mode: 'insensitive' } },
        { summary: { contains: message, mode: 'insensitive' } },
        { currentLocation: { contains: message, mode: 'insensitive' } }
      ];
      
      candidates = await prisma.candidate.findMany({
        where: {
          OR: searchConditions
        },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          technicalSkills: true,
          experienceYears: true,
          currentTitle: true,
          currentLocation: true,
          status: true,
          summary: true
        }
      });
    }

    if (searchTerms.includes('job') || searchTerms.includes('position')) {
      jobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: message, mode: 'insensitive' } },
            { description: { contains: message, mode: 'insensitive' } },
            { location: { contains: message, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          status: true
        }
      });
    }

    const systemPrompt = `You are an AI assistant for Emineon ATS (Applicant Tracking System). You have access to real data and can search the database.

Current database context:
- Total candidates: ${candidateCount}
- Total jobs: ${jobCount}
- Search results: ${candidates.length} candidates, ${jobs.length} jobs

${candidates.length > 0 ? `
Found Candidates:
${candidates.map(c => `- ${c.firstName} ${c.lastName} (${c.currentTitle || 'No title'}) - ${c.technicalSkills?.slice(0, 3).join(', ') || 'No skills listed'} - ${c.experienceYears || 0} years exp`).join('\n')}
` : ''}

${jobs.length > 0 ? `
Found Jobs:
${jobs.map(j => `- ${j.title} in ${j.location || 'Remote'} - ${j.status}`).join('\n')}
` : ''}

You can help with:
- Searching and analyzing real candidate data
- Finding specific candidates or jobs
- Analyzing uploaded documents (CVs, job descriptions, company documents)
- Matching candidates to job requirements based on uploaded documents
- General recruitment advice and best practices
- Interview questions and strategies
- Job description writing
- Candidate evaluation criteria
- Market insights and trends
- Communication templates
- Recruitment process optimization

Provide detailed, actionable insights based on real data when available. If you found specific candidates or jobs, include them in your response with details. When working with uploaded documents, reference specific content and provide detailed analysis.`;

    // Prepare messages array
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    // If there are file IDs, include them in the user message
    if (fileIds && fileIds.length > 0) {
      const userContent: any[] = [];
      
      // Add file inputs
      fileIds.forEach((fileId: string) => {
        userContent.push({
          type: 'input_file',
          file_id: fileId
        });
      });
      
      // Add text input
      userContent.push({
        type: 'input_text',
        text: message
      });

      messages.push({
        role: 'user',
        content: userContent
      });
    } else {
      // Regular text message
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Use the responses API if we have files, otherwise use chat completions
    if (fileIds && fileIds.length > 0) {
      const response = await openai.responses.create({
        model: 'gpt-4o',
        input: messages.slice(1), // Remove system message for responses API
      });

      return NextResponse.json({
        message: response.output_text,
        role: 'assistant'
      });
    } else {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';

      return NextResponse.json({
        message: assistantMessage,
        role: 'assistant'
      });
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Handle specific OpenAI errors
    if (error.status === 400) {
      return NextResponse.json(
        { error: 'Invalid request or file format' },
        { status: 400 }
      );
    } else if (error.status === 404) {
      return NextResponse.json(
        { error: 'File not found. Please re-upload the file.' },
        { status: 404 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to process your request' },
        { status: 500 }
      );
    }
  }
} 