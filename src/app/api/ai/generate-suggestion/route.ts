import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { context, candidateData, sectionType } = await request.json();

    const prompt = `
You are an AI assistant helping to write professional competence files/resumes. 
Based on the following context and candidate information, generate a helpful suggestion to improve the content.

Context: "${context}"
Section Type: ${sectionType}
Candidate: ${candidateData?.fullName || 'Unknown'}
Current Title: ${candidateData?.currentTitle || 'Unknown'}
Skills: ${candidateData?.skills?.join(', ') || 'None listed'}

Generate a concise, professional suggestion (1-2 sentences) that would enhance this section. 
Focus on:
- Professional language and industry terminology
- Quantifiable achievements when possible
- Action-oriented descriptions
- Relevant keywords for the candidate's field

Suggestion:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer and career coach. Provide concise, actionable suggestions to improve resume content.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error('No suggestion generated');
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
} 