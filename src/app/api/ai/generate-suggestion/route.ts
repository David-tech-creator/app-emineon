import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to generate structured content prompts for each section type
function generateStructuredContentPrompt(sectionType: string, candidateContext: string): string {
  const baseInstructions = `${candidateContext}

CRITICAL INSTRUCTIONS:
- Generate content WITHOUT using icons or emojis
- Use proper bullet points (•) and bold text (**text**) for structure
- Follow the exact format specified for each section
- Make content professional and compelling
- Base content on the candidate's actual data when available
- Return ONLY the formatted content, no explanations`;

  switch (sectionType) {
    case 'header':
      return `${baseInstructions}

SECTION: HEADER
Generate a clean header section with:
- Full name (large, prominent)
- Role title 
- Years of experience
- Location

Format:
[Full Name]
[Role Title]
[X]+ years of experience
[Location]`;

    case 'summary':
      return `${baseInstructions}

SECTION: PROFESSIONAL SUMMARY
Generate a compelling 3-4 sentence professional summary that:
- Highlights years of experience and expertise
- Mentions key skills and technologies
- Emphasizes leadership and strategic capabilities
- Shows business impact and value proposition

Format as a flowing paragraph without bullet points.`;

    case 'functional-skills':
      return `${baseInstructions}

SECTION: FUNCTIONAL SKILLS
Generate categorized functional skills with bullet points followed by explanatory text:

**Delivery & Project Management**
• [Specific skill 1]
• [Specific skill 2]
• [Specific skill 3]
[Explanatory text about delivery and project management capabilities]

**Service & Release Management**
• [Specific skill 1]
• [Specific skill 2]
• [Specific skill 3]
[Explanatory text about service and release management expertise]

**Product Management/Owner**
• [Specific skill 1]
• [Specific skill 2]
• [Specific skill 3]
[Explanatory text about product management experience]`;

    case 'technical-skills':
      return `${baseInstructions}

SECTION: TECHNICAL SKILLS
Generate categorized technical competencies with bullet points followed by explanatory text:

**Programming & Development**
• [Relevant programming languages and frameworks]
• [Development tools and methodologies]
• [Architecture and design patterns]
[Explanatory text about development expertise]

**Cloud & Infrastructure**
• [Cloud platforms and services]
• [Infrastructure and DevOps tools]
• [Containerization and orchestration]
[Explanatory text about cloud and infrastructure capabilities]

**Data & Analytics**
• [Database technologies]
• [Analytics and BI tools]
• [Data processing frameworks]
[Explanatory text about data and analytics experience]`;

    case 'areas-of-expertise':
      return `${baseInstructions}

SECTION: AREAS OF EXPERTISE
Generate industry/domain expertise areas based on candidate's background:
- List 3-5 relevant industry domains
- Each on a separate line
- No bullet points, just clean list
- Base on candidate's experience and skills

Example format:
Information Technology
Digital Transformation
Financial Services`;

    case 'education':
      return `${baseInstructions}

SECTION: EDUCATION
Generate educational background with bullet points:
• [Degree] - [Institution] ([Year])
• [Additional qualifications or relevant coursework]
• [Professional development or continuing education]

Use bullet points for each educational item.`;

    case 'certifications':
      return `${baseInstructions}

SECTION: CERTIFICATIONS
Generate professional certifications with bullet points:
• [Certification Name] - [Issuing Organization] ([Year])
• [Additional relevant certifications]
• [Industry-specific credentials]

Use bullet points for each certification.`;

    case 'languages':
      return `${baseInstructions}

SECTION: LANGUAGES
Generate language proficiencies in grid format/tags:
Format as: [Language] ([Proficiency Level]) | [Language] ([Proficiency Level])

Example: English (Native) | French (Professional) | Spanish (Conversational)`;

    case 'experiences-summary':
      return `${baseInstructions}

SECTION: PROFESSIONAL EXPERIENCES SUMMARY
Generate one-liner summary for each role with dates:
[Job Title] – [Company Name] ([Start Date] - [End Date])
[Job Title] – [Company Name] ([Start Date] - [End Date])

Keep each line concise and professional.`;

    case 'experience':
      return `${baseInstructions}

SECTION: PROFESSIONAL EXPERIENCES
Generate detailed experience blocks with this EXACT structure:

**[Company Name]**
[Job Title]
[Duration dates]

**Company Description/Context**
[2-3 sentences describing the company and its focus/industry]

**Responsibilities**
• [Key responsibility 1]
• [Key responsibility 2]
• [Key responsibility 3]
• [Key responsibility 4]

**Major Achievements**
• [Quantifiable achievement 1]
• [Quantifiable achievement 2]
• [Quantifiable achievement 3]

**Technical Environment**
• [Technology/tool 1]
• [Technology/tool 2]
• [Technology/tool 3]
• [Methodology/framework]

Generate this structure for the most recent/relevant experience.`;

    default:
      return `${baseInstructions}

Generate professional content for the ${sectionType} section based on the candidate information provided.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, sectionType, currentContent, candidateData, jobDescription } = await request.json();

    if (!type || !sectionType || !candidateData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🤖 AI Suggestion Request:', {
      type,
      sectionType,
      candidateFullName: candidateData.fullName,
      contentLength: currentContent?.length || 0
    });

    let prompt = '';
    let systemPrompt = 'You are an expert HR professional and executive resume writer with 15+ years of experience. You specialize in creating compelling, ATS-optimized competence files that highlight candidates\' unique value propositions and achievements.';
    
    // Enhanced context about the candidate and job
    const candidateContext = `
Candidate Profile:
- Name: ${candidateData.fullName}
- Current Title: ${candidateData.currentTitle}
- Experience Level: ${candidateData.yearsOfExperience} years
- Core Skills: ${candidateData.skills?.slice(0, 8).join(', ') || 'Not specified'}
- Education: ${candidateData.education?.join(', ') || 'Not specified'}
- Location: ${candidateData.location || 'Not specified'}
- Summary: ${candidateData.summary || 'Not provided'}
${jobDescription ? `

Target Job Context:
- Job Title: ${jobDescription.title || 'Not specified'}
- Company: ${jobDescription.company || 'Not specified'}
- Key Requirements: ${jobDescription.requirements?.slice(0, 5).join(', ') || 'Not specified'}
- Required Skills: ${jobDescription.skills?.slice(0, 8).join(', ') || 'Not specified'}
- Main Responsibilities: ${jobDescription.responsibilities?.slice(0, 3).join(', ') || 'Not specified'}

IMPORTANT: Tailor the content to align with the job requirements while staying truthful to the candidate's actual experience. Emphasize relevant skills and experiences that match the job needs.` : ''}
`;

    switch (type) {
      case 'generate':
        prompt = generateStructuredContentPrompt(sectionType, candidateContext);
        break;
        
      case 'improve':
        prompt = `${candidateContext}

Section Type: ${sectionType.toUpperCase()}
Current Content: ${currentContent}

TASK: Enhance this ${sectionType} section to be more professional, impactful, and compelling. Focus on:

1. **Clarity & Impact**: Use strong action verbs and quantifiable achievements
2. **Professional Tone**: Maintain executive-level language appropriate for senior roles
3. **Value Proposition**: Highlight unique strengths and competitive advantages
4. **ATS Optimization**: Include relevant keywords naturally
5. **Readability**: Ensure clear structure and flow

GUIDELINES:
- Keep the same factual information but enhance presentation
- Use metrics and numbers where possible (even if estimated reasonably)
- Eliminate weak language and filler words
- Make every sentence add value
- Maintain authenticity while maximizing impact

Return ONLY the improved content with proper formatting. No explanations or meta-commentary.`;
        break;
        
      case 'expand':
        prompt = `${candidateContext}

Section Type: ${sectionType.toUpperCase()}
Current Content: ${currentContent}

TASK: Expand this ${sectionType} section with additional relevant detail and context. Focus on:

1. **Depth & Detail**: Add specific examples, methodologies, and approaches
2. **Industry Context**: Include relevant industry terminology and best practices
3. **Leadership Impact**: Highlight team leadership, mentoring, and strategic contributions
4. **Technical Depth**: Expand on technical skills with specific tools, frameworks, and applications
5. **Business Value**: Connect activities to business outcomes and ROI

EXPANSION STRATEGIES:
- Add specific examples of projects or achievements
- Include relevant certifications or training
- Mention collaboration with cross-functional teams
- Describe problem-solving approaches and methodologies
- Add context about scale, complexity, or business impact

Return ONLY the expanded content with proper formatting. Maintain professional tone throughout.`;
        break;
        
      case 'rewrite':
        prompt = `${candidateContext}

Section Type: ${sectionType.toUpperCase()}
Current Content: ${currentContent}

TASK: Completely rewrite this ${sectionType} section with a fresh perspective and approach. Focus on:

1. **New Angle**: Present the same information from a different strategic perspective
2. **Executive Positioning**: Position the candidate as a strategic leader and innovator
3. **Market Relevance**: Align with current industry trends and demands
4. **Competitive Edge**: Emphasize unique differentiators and competitive advantages
5. **Future-Forward**: Include forward-thinking skills and adaptability

REWRITE APPROACHES:
- Lead with most impressive achievements
- Use industry-specific terminology and frameworks
- Emphasize leadership and strategic thinking
- Include soft skills and emotional intelligence
- Position for career advancement and growth

Return ONLY the rewritten content with proper formatting. Create a compelling narrative that positions the candidate as a top-tier professional.`;
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });
    }

    console.log('🚀 Sending request to OpenAI...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content;

    if (!suggestion) {
      console.error('❌ No suggestion generated from OpenAI');
      return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
    }

    console.log('✅ AI suggestion generated successfully:', {
      type,
      sectionType,
      suggestionLength: suggestion.length
    });

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('❌ Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 