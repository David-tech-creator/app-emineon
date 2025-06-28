import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Job description text is required' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert HR analyst. Parse the job description and extract key information in JSON format.

Extract:
- title: Job title
- company: Company name (if mentioned)
- requirements: Array of key requirements/qualifications
- skills: Array of technical and soft skills mentioned
- responsibilities: Array of main job responsibilities

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "company": "string",
  "requirements": ["requirement1", "requirement2"],
  "skills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"]
}

Focus on extracting the most important and specific items. Limit each array to maximum 10 items.`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', content);
      // Return a basic structure if parsing fails
      return NextResponse.json({
        title: '',
        company: '',
        requirements: [],
        skills: [],
        responsibilities: []
      });
    }

  } catch (error) {
    console.error('Error parsing job description:', error);
    return NextResponse.json(
      { error: 'Failed to parse job description' },
      { status: 500 }
    );
  }
} 