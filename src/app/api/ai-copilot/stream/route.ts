import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhanced candidate search tool with better error handling
const candidateSearchTool = tool({
  name: 'search_candidates',
  description: 'Search for candidates in the database based on skills, experience, or other criteria',
  parameters: z.object({
    query: z.string().describe('Search query for candidates (skills, experience, role, etc.)'),
    filters: z.object({
      experienceYears: z.number().nullable().optional(),
      skills: z.array(z.string()).nullable().optional(),
      location: z.string().nullable().optional(),
      seniorityLevel: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL']).nullable().optional(),
    }).nullable().optional(),
    limit: z.number().default(10).describe('Maximum number of candidates to return'),
  }),
  execute: async (input) => {
    try {
      const whereClause: any = {};
      
      // Build search conditions
      if (input.query) {
        whereClause.OR = [
          { firstName: { contains: input.query, mode: 'insensitive' } },
          { lastName: { contains: input.query, mode: 'insensitive' } },
          { email: { contains: input.query, mode: 'insensitive' } },
          { summary: { contains: input.query, mode: 'insensitive' } },
          { currentLocation: { contains: input.query, mode: 'insensitive' } },
        ];
      }

      // Apply filters
      if (input.filters?.experienceYears) {
        whereClause.experienceYears = { gte: input.filters.experienceYears };
      }
      if (input.filters?.location) {
        whereClause.currentLocation = { contains: input.filters.location, mode: 'insensitive' };
      }
      if (input.filters?.seniorityLevel) {
        whereClause.seniorityLevel = input.filters.seniorityLevel;
      }

      const candidates = await prisma.candidate.findMany({
        where: whereClause,
        take: input.limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          technicalSkills: true,
          summary: true,
          currentLocation: true,
          experienceYears: true,
          seniorityLevel: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        count: candidates.length,
        candidates: candidates.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email,
          skills: c.technicalSkills,
          summary: c.summary,
          location: c.currentLocation,
          experience: c.experienceYears,
          seniority: c.seniorityLevel,
          status: c.status,
        })),
        query: input.query,
        filters: input.filters
      };
    } catch (error) {
      console.error('Error searching candidates:', error);
      return {
        success: false,
        error: 'Failed to search candidates',
        candidates: []
      };
    }
  },
});

// Job analysis tool with enhanced AI processing
const jobAnalysisTool = tool({
  name: 'analyze_job_description',
  description: 'Analyze a job description to extract requirements, skills, and generate insights',
  parameters: z.object({
    jobDescription: z.string().describe('The job description text to analyze'),
    includeMatching: z.boolean().default(false).describe('Whether to include candidate matching recommendations'),
  }),
  execute: async (input) => {
    try {
      const prompt = `Analyze this job description and extract key information in JSON format:

Job Description:
${input.jobDescription}

Return a JSON object with:
{
  "jobTitle": "extracted job title",
  "requiredSkills": ["skill1", "skill2", ...],
  "optionalSkills": ["skill1", "skill2", ...],
  "experienceLevel": "entry/junior/mid/senior/lead",
  "location": "location or remote",
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "qualifications": ["qualification1", "qualification2", ...],
  "salaryRange": "if mentioned",
  "companySize": "if mentioned",
  "industry": "if mentioned",
  "workType": "remote/hybrid/onsite",
  "keyInsights": ["insight1", "insight2", ...],
  "matchingCriteria": {
    "mustHave": ["skill1", "skill2"],
    "niceToHave": ["skill1", "skill2"],
    "experienceYears": number,
    "locationPreference": "string"
  }
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const analysis = response.choices[0]?.message?.content;
      let structuredAnalysis;
      
      try {
        structuredAnalysis = JSON.parse(analysis || '{}');
      } catch {
        structuredAnalysis = {
          jobTitle: 'Could not parse',
          requiredSkills: [],
          experienceLevel: 'unknown',
          keyInsights: [analysis || 'Analysis failed']
        };
      }

      return {
        success: true,
        analysis: structuredAnalysis,
        originalDescription: input.jobDescription.substring(0, 500) + '...',
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing job description:', error);
      return {
        success: false,
        error: 'Failed to analyze job description'
      };
    }
  },
});

// Simplified streaming copilot agent without MCP tools
const streamingCopilotAgent = new Agent({
  name: 'Emineon ATS Streaming Copilot',
  instructions: `You are an advanced AI copilot for Emineon ATS, a sophisticated recruitment platform. You provide real-time assistance with:

1. **Candidate Search & Analysis**
   - Find candidates based on skills, experience, location
   - Analyze candidate profiles and fit
   - Provide interview recommendations

2. **Job Description Analysis**
   - Extract requirements and skills from job descriptions
   - Generate matching criteria
   - Assess role complexity and market positioning

3. **Recruitment Strategy**
   - Provide best practices and guidance
   - Suggest sourcing strategies
   - Recommend interview processes

4. **General AI Assistant**
   - Answer questions about recruitment best practices
   - Provide market insights and trends
   - Help with communication and strategy

Always be professional, data-driven, and provide actionable insights. Structure your responses clearly and offer specific recommendations. When using tools, explain what you're doing and why.`,
  tools: [
    candidateSearchTool,
    jobAnalysisTool,
  ],
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication (allow bypass for testing and development)
    let userId = null;
    try {
      const authResult = auth();
      userId = authResult.userId;
      if (userId) {
        console.log('✅ User authenticated for streaming:', userId);
      } else {
        console.log('⚠️ No authentication found for streaming, proceeding for testing purposes');
      }
    } catch (authError) {
      console.log('⚠️ Authentication check failed for streaming, proceeding for testing purposes:', authError);
    }

    // Allow bypass in development, preview, or for AI copilot functionality
    const allowBypass = process.env.NODE_ENV === 'development' || 
                       process.env.BYPASS_AUTH === 'true' || 
                       process.env.VERCEL_ENV === 'preview' ||
                       true; // Always allow AI copilot access for now
    
    if (!userId && !allowBypass) {
      console.log('❌ Authentication required and no bypass allowed for streaming');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json() as { 
      messages?: any[]; 
      query?: string; 
      maxTurns?: number;
      stream?: boolean;
    };
    
    const { messages, query, maxTurns = 10, stream = true } = body;
    const input = query || messages || '';

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'Query or messages are required' },
        { status: 400 }
      );
    }

    console.log(`Streaming AI Copilot Query from ${userId}:`, typeof input === 'string' ? input : 'Messages array');

    if (stream) {
      // Create streaming response
      const result = await run(streamingCopilotAgent, input, {
        maxTurns,
        stream: true,
      });

      // Create a ReadableStream that emits SSE data
      const streamResponse = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of result) {
              // Send different types of events to the client
              const eventData = JSON.stringify({
                type: event.type,
                data: event,
                timestamp: new Date().toISOString(),
              });
              
              controller.enqueue(`data: ${eventData}\n\n`);
              
              // Log significant events
              if (event.type === 'run_item_stream_event') {
                console.log(`Stream event: ${event.type}`);
              }
            }
            
            // Send final result
            const finalData = JSON.stringify({
              type: 'final_result',
              data: {
                success: true,
                output: result.finalOutput,
                metadata: {
                  turns: result.newItems?.length || 0,
                  timestamp: new Date().toISOString(),
                }
              }
            });
            controller.enqueue(`data: ${finalData}\n\n`);
            controller.enqueue(`data: [DONE]\n\n`);
            controller.close();
          } catch (error) {
            console.error('Error in streaming loop:', error);
            const errorData = JSON.stringify({
              type: 'error',
              data: {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            });
            controller.enqueue(`data: ${errorData}\n\n`);
            controller.error(error);
          }
        },
      });

      // Return the ReadableStream as SSE
      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } else {
      // Non-streaming response
      const result = await run(streamingCopilotAgent, input, {
        maxTurns,
        stream: false,
      });

      return NextResponse.json({
        success: true,
        output: result.finalOutput,
        metadata: {
          turns: result.newItems?.length || 0,
          timestamp: new Date().toISOString(),
        }
      });
    }

  } catch (error) {
    console.error('Streaming copilot API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        output: 'I apologize, but I encountered an issue processing your request. Please try again.'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Handle GET requests with a simple health check
export async function GET() {
  return NextResponse.json({
    status: 'Streaming AI Copilot API is operational',
    features: [
      'Real-time streaming responses',
      'Advanced candidate search',
      'Job description analysis',
      'Local tool integration',
      'Multi-turn conversations',
      'Tool calling with feedback'
    ],
    timestamp: new Date().toISOString()
  });
} 