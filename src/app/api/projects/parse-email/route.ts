import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parseEmailSchema = z.object({
  emailContent: z.string().min(1, 'Email content is required'),
  emailSubject: z.string().min(1, 'Email subject is required'),
  senderEmail: z.string().email('Valid sender email is required'),
  receivedDate: z.string().optional(),
});

// POST /api/projects/parse-email - Parse email and create project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailContent, emailSubject, senderEmail, receivedDate } = parseEmailSchema.parse(body);

    // Use OpenAI to parse the email and extract project information
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert recruitment assistant. Parse the following email to extract project information for a recruitment opportunity. 

Extract the following information and return it as a JSON object:
{
  "projectName": "string - descriptive name for the project",
  "clientName": "string - company/client name",
  "clientContact": "string - contact person name if mentioned",
  "totalPositions": "number - how many positions needed",
  "description": "string - project description and context",
  "location": "string - work location if mentioned",
  "isRemote": "boolean - if remote work is mentioned",
  "isHybrid": "boolean - if hybrid work is mentioned",
  "skillsRequired": "array of strings - technical skills needed",
  "experienceRequired": "array of strings - experience requirements",
  "industryBackground": "string - industry context if mentioned",
  "languageRequirements": "array of strings - language requirements",
  "urgencyLevel": "LOW|MEDIUM|HIGH|CRITICAL - based on timeline/urgency",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL - based on importance indicators",
  "budgetRange": "string - budget/rate information if mentioned",
  "startDate": "string - ISO date if start date mentioned",
  "endDate": "string - ISO date if deadline mentioned",
  "keyRequirements": "array of strings - main requirements",
  "additionalInfo": "string - any other relevant information"
}

Be intelligent about extracting information. For example:
- If email mentions "5 Data Engineers", totalPositions = 5, projectName could be "Data Engineers - [ClientName]"
- Extract specific technologies, frameworks, and skills mentioned
- Infer urgency from words like "urgent", "ASAP", "immediately", etc.
- Look for salary/rate information
- Identify if it's contract, permanent, or not specified
- Extract location details and remote work preferences

Only return the JSON object, no other text.`
        },
        {
          role: "user",
          content: `Email Subject: ${emailSubject}\n\nEmail Content:\n${emailContent}`
        }
      ],
      temperature: 0.1,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    // Create the project with parsed data
    const project = await prisma.project.create({
      data: {
        name: parsedData.projectName || `Project from ${parsedData.clientName}`,
        description: parsedData.description,
        clientName: parsedData.clientName,
        clientContact: parsedData.clientContact,
        clientEmail: senderEmail,
        totalPositions: parsedData.totalPositions || 1,
        urgencyLevel: parsedData.urgencyLevel || 'MEDIUM',
        priority: parsedData.priority || 'MEDIUM',
        location: parsedData.location,
        isRemote: parsedData.isRemote || false,
        isHybrid: parsedData.isHybrid || false,
        skillsRequired: parsedData.skillsRequired || [],
        experienceRequired: parsedData.experienceRequired || [],
        industryBackground: parsedData.industryBackground,
        languageRequirements: parsedData.languageRequirements || [],
        budgetRange: parsedData.budgetRange,
        startDate: parsedData.startDate ? new Date(parsedData.startDate) : null,
        endDate: parsedData.endDate ? new Date(parsedData.endDate) : null,
        sourceEmail: emailContent,
        sourceEmailSubject: emailSubject,
        sourceEmailDate: receivedDate ? new Date(receivedDate) : new Date(),
        parsedFromEmail: true,
        internalNotes: [
          `Project created from email parsing`,
          `Key requirements: ${parsedData.keyRequirements?.join(', ') || 'Not specified'}`,
          parsedData.additionalInfo || ''
        ].filter(Boolean),
        activities: {
          create: [
            {
              type: 'PROJECT_CREATED',
              title: 'Project Created from Email',
              description: `Project automatically created from email: "${emailSubject}"`,
              metadata: {
                source: 'email_parsing',
                senderEmail,
                originalSubject: emailSubject,
                parsedData: parsedData,
              }
            },
            {
              type: 'EMAIL_RECEIVED',
              title: 'Client Email Received',
              description: `Email received from ${senderEmail}`,
              metadata: {
                emailSubject,
                emailContent: emailContent.substring(0, 500) + '...',
                senderEmail,
              }
            }
          ]
        }
      },
      include: {
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            jobs: true,
            candidates: true,
            activities: true,
            documents: true,
          }
        }
      }
    });

    // Generate suggested job positions based on the project
    const jobSuggestions = await generateJobSuggestions(project, parsedData);

    return NextResponse.json({
      project,
      parsedData,
      jobSuggestions,
      message: 'Project created successfully from email'
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error parsing email and creating project:', error);
    return NextResponse.json(
      { error: 'Failed to parse email and create project', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to generate job position suggestions
async function generateJobSuggestions(project: any, parsedData: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Based on the project information, suggest specific job positions that should be created. 

Return a JSON array of job suggestions with this structure:
[
  {
    "title": "string - specific job title",
    "description": "string - detailed job description",
    "requirements": "array of strings - specific requirements for this role",
    "responsibilities": "array of strings - key responsibilities",
    "experienceLevel": "string - Junior/Mid/Senior/Lead/etc",
    "benefits": "array of strings - benefits to highlight",
    "priority": "number - 1-5, where 1 is highest priority"
  }
]

For example, if the project needs "5 Data Engineers", you might suggest:
- Senior Data Engineer (2 positions)
- Mid-Level Data Engineer (2 positions) 
- Junior Data Engineer (1 position)

Or if it's more specific, create role variations based on the requirements.`
        },
        {
          role: "user",
          content: `Project: ${project.name}
Client: ${project.clientName}
Total Positions: ${project.totalPositions}
Skills Required: ${project.skillsRequired.join(', ')}
Experience Required: ${project.experienceRequired.join(', ')}
Industry: ${project.industryBackground || 'Not specified'}
Description: ${project.description || 'Not provided'}

Additional Context: ${parsedData.additionalInfo || 'None'}`
        }
      ],
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (aiResponse) {
      try {
        return JSON.parse(aiResponse);
      } catch (error) {
        console.error('Failed to parse job suggestions:', aiResponse);
      }
    }
  } catch (error) {
    console.error('Error generating job suggestions:', error);
  }

  // Fallback: create basic job suggestions
  return [{
    title: `${parsedData.skillsRequired?.[0] || 'Position'} - ${project.clientName}`,
    description: project.description || 'Position details to be defined',
    requirements: project.skillsRequired || [],
    responsibilities: ['Responsibilities to be defined based on client requirements'],
    experienceLevel: 'Mid-Senior',
    benefits: ['Competitive package', 'Professional development opportunities'],
    priority: 1
  }];
} 