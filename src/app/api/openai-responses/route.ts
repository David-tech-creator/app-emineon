import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions for section generation
interface SectionGenerationRequest {
  section: string;
  candidateData: any;
  jobData?: any;
  order?: number;
  enhancementAction?: 'improve' | 'expand' | 'rewrite' | 'format_for_pdf';
  existingContent?: string;
  finalEditorContent?: string;
  sectionType?: string;
  experienceIndex?: number;
}

interface SectionGenerationResponse {
  success: boolean;
  content: string;
  section: string;
  order: number;
  tokensUsed?: number;
  processingTime: number;
  error?: string;
}

// Helper function to safely extract job requirements/responsibilities
function getJobContext(job: any): string {
  if (!job) return 'Professional role requirements';
  
  let context = '';
  
  // Handle responsibilities
  if (job.responsibilities) {
    if (Array.isArray(job.responsibilities)) {
      context = job.responsibilities.join(', ');
    } else if (typeof job.responsibilities === 'string') {
      context = job.responsibilities;
    }
  }
  
  // Handle requirements
  if (job.requirements) {
    const requirementsText = Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements;
    context = context ? `${context}, ${requirementsText}` : requirementsText;
  }
  
  // Handle skills
  if (job.skills) {
    const skillsText = Array.isArray(job.skills) ? job.skills.join(', ') : job.skills;
    context = context ? `${context}, ${skillsText}` : skillsText;
  }
  
  return context || `${job.title || 'Professional role'} requirements`;
}

// Competence file section prompts using OpenAI Responses API
const SECTION_PROMPTS = {
  'HEADER': (candidate: any, job?: any) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with the candidate's full name
• DO NOT write "Here is" or "Below is" or any introduction
• DO NOT add extra formatting or explanations
• ONLY output the exact content requested

CANDIDATE DATA: ${JSON.stringify(candidate, null, 2)}

Create a professional header with:
• Full Name (as main heading)
• Current Title/Position
• Contact Information (Email, Phone, Location)
• Years of Experience

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

Return ONLY the formatted header content.`,

  'PROFESSIONAL SUMMARY': (candidate: any, job?: any) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with content (no "Here is" or introductions)
• Write in third person about the candidate
• Focus on high-level achievements and value proposition
• Keep to 3-4 impactful sentences

CANDIDATE PROFILE: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'extensive'} years experience
BACKGROUND: ${candidate.summary || 'Professional background'}
SKILLS: ${candidate.skills?.join(', ') || 'Professional expertise'}

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

Write a compelling professional summary that highlights the candidate's key strengths and value proposition.
Focus on measurable impact and leadership qualities.
Return ONLY the summary content, no additional formatting.`,

  'FUNCTIONAL SKILLS': (candidate: any, job?: any) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with "**" 
• DO NOT write introductory text like "Here are" or "Below is"
• Focus on soft skills, leadership, and business capabilities
• Use detailed bullet points with specific examples

CANDIDATE BACKGROUND: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'multiple'} years experience
EXPERIENCE LEVEL: ${candidate.experienceLevel || 'Senior Professional'}

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

Generate functional skills organized in categories:

**Leadership & Management**
**Strategic Planning & Analysis** 
**Communication & Collaboration**
**Problem Solving & Innovation**

Each bullet point should be detailed and demonstrate specific capabilities.
Return ONLY the formatted functional skills content.`,

  'TECHNICAL SKILLS': (candidate: any, job?: any) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with "**" (no introduction text)
• Organize skills into relevant categories
• Use bullet points for each skill
• DO NOT write "Here are" or "Below are" or explanations

CANDIDATE SKILLS: ${candidate.skills?.join(', ') || 'Technical expertise'}
CURRENT ROLE: ${candidate.currentTitle}

${job ? `TARGET ROLE REQUIREMENTS: ${getJobContext(job)}` : ''}

Organize the skills into categories like:
**Programming & Development**
**Cloud & Infrastructure** 
**Database & Analytics**
**Development Tools & Methodologies**

Use bullet points (•) for each skill within categories.
Return ONLY the formatted skills content.`,

  'AREAS OF EXPERTISE': (candidate: any, job?: any) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with "1. **"
• DO NOT write "Certainly!" or "Below is" or "Here's" or any introduction
• DO NOT write "areas of expertise" or explain what you're doing
• DO NOT add placeholder brackets like [Primary Expertise Area]
• ONLY output the formatted content shown below

CANDIDATE PROFILE: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'multiple'} years experience
SKILLS: ${candidate.skills?.join(', ') || 'Professional expertise'}
EXPERIENCE: ${candidate.experience?.map((exp: any) => exp.title || exp.position).join(', ') || 'Professional experience'}

${job ? `TARGET ROLE: ${job.title} - ${getJobContext(job)}` : ''}

REQUIRED FORMAT - START IMMEDIATELY WITH THIS:

1. **Digital Transformation & Innovation Leadership**


   • Strategic planning and execution of digital transformation initiatives across enterprise organizations

   • Implementation of emerging technologies and automation solutions to drive operational efficiency

   • Leadership of cross-functional teams through complex technology adoption and change management processes


2. **Project & Program Management Excellence**


   • End-to-end project lifecycle management using Agile, Scrum, and traditional waterfall methodologies

   • Resource optimization, timeline management, and stakeholder coordination for multi-million dollar initiatives

   • Risk assessment, mitigation planning, and quality assurance frameworks for enterprise-scale projects


3. **Business Strategy & Operational Optimization**


   • Strategic analysis and business process reengineering to enhance organizational performance

   • Market research, competitive analysis, and strategic roadmap development for business growth

   • Performance metrics development, KPI tracking, and data-driven decision making frameworks


4. **Team Leadership & Organizational Development**


   • Building and leading high-performing teams across diverse functional areas and geographic locations`,

  'EDUCATION': (candidate: any, job?: any) => `
Generate education section:

CANDIDATE EDUCATION: ${candidate.education?.join(', ') || candidate.degrees?.join(', ') || 'Professional education'}

Create structured education entries:
• **Degree Type** - Institution Name (Year)
• **Professional Certifications** - Relevant credentials
• **Continuing Education** - Professional development

Include relevant coursework, academic achievements, or specializations.`,

  'CERTIFICATIONS': (candidate: any, job?: any) => `
Generate specific, realistic professional certifications based on the candidate's profile - NO placeholder text:

CANDIDATE BACKGROUND: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'multiple'} years experience
CANDIDATE CERTIFICATIONS: ${candidate.certifications?.join(', ') || 'Industry-relevant certifications'}
TECHNICAL SKILLS: ${candidate.skills?.join(', ') || 'Professional skills'}
CURRENT ROLE: ${candidate.currentTitle}

${job ? `TARGET ROLE REQUIREMENTS: ${getJobContext(job)}` : ''}

Create relevant, specific certifications organized by category. Use REAL certification names that exist:

**Cloud & Infrastructure**
- AWS Certified Solutions Architect - Professional
- Microsoft Azure Solutions Architect Expert  
- Google Cloud Professional Cloud Architect
- CompTIA Security+ Certification

**Project Management**
- PMP (Project Management Professional)
- Certified ScrumMaster (CSM)
- PRINCE2 Foundation and Practitioner
- Agile Certified Practitioner (PMI-ACP)

**Technical Expertise**
- CISSP (Certified Information Systems Security Professional)
- ITIL Foundation Certification
- Cisco Certified Network Professional (CCNP)
- Microsoft Certified Solutions Expert (MCSE)

**Professional Development**
- Six Sigma Green Belt Certification
- TOGAF Certified Architecture Practitioner
- COBIT Foundation Certification
- Lean Management Certification

Generate ONLY realistic, industry-standard certifications that actually exist.
Base selections on the candidate's role and skills. NO generic placeholders or brackets.`,

  'LANGUAGES': (candidate: any, job?: any) => `
Generate a clean languages section using the candidate's actual language data:

CANDIDATE LANGUAGES: ${candidate.languages?.join(', ') || candidate.spokenLanguages?.join(', ') || 'English (Native)'}

Create a properly formatted languages section using ONLY the candidate's actual languages. Format each language as:
• **[Language Name]** - [Proficiency Level]

Use these proficiency levels: Native, Professional, Conversational, Basic

If only English is mentioned or no specific languages provided, show:
• **English** - Native

Do NOT include placeholder text, brackets, or example languages. Use only real data.
Return ONLY the formatted language list, nothing else.`,

  'PROFESSIONAL EXPERIENCES SUMMARY': (candidate: any, job?: any) => `
Create a chronological listing of all professional experiences in reverse chronological order (latest first):

CANDIDATE EXPERIENCES: ${JSON.stringify(candidate.experience || candidate.workHistory || [], null, 2)}

Format as a clean chronological list with:

**[Company Name]** - [Role Title]  
[Start Date] - [End Date]

**[Company Name]** - [Role Title]  
[Start Date] - [End Date]

Continue for all experiences in the candidate data.

If no experience data is available, create 2-3 realistic professional experiences relevant to the target role.

${job ? `TARGET ROLE CONTEXT: ${getJobContext(job)}` : ''}

Return ONLY the formatted chronological listing, no explanations or additional text.`,

  'PROFESSIONAL EXPERIENCE': (candidate: any, job?: any, experienceIndex: number = 0) => `
Generate a detailed professional experience entry for experience #${experienceIndex + 1}:

CANDIDATE EXPERIENCES: ${JSON.stringify(candidate.experience || [], null, 2)}
EXPERIENCE INDEX: ${experienceIndex}
TARGET EXPERIENCE: ${candidate.experience?.[experienceIndex] ? JSON.stringify(candidate.experience[experienceIndex], null, 2) : 'Not found - create generic professional experience'}

${job ? `TARGET ROLE CONTEXT: ${getJobContext(job)}` : ''}

If the experience exists at index ${experienceIndex}, use that exact data. Otherwise, create a realistic professional experience.

Format exactly as:

**[Company Name]** - [Role Title]  
[Start Date] - [End Date]

**Key Responsibilities:**
• [Responsibility 1]
• [Responsibility 2] 
• [Responsibility 3]

**Achievements & Impact:**
• [Achievement 1 with quantifiable results]
• [Achievement 2 with measurable outcomes]
• [Achievement 3 with business impact]

**Technical Environment:**
• [Technology/Tool 1]
• [Technology/Tool 2]
• [Technology/Tool 3]

Return ONLY the formatted experience entry, no introductory text or explanations.`
};

// Enhancement prompts for improve/expand/rewrite/format_for_pdf functionality
const ENHANCEMENT_PROMPTS = {
  improve: (section: string, existingContent: string, candidateData: any, jobData?: any) => `
Improve the following ${section} content by making it more compelling, professional, and impactful:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience || candidateData.workHistory,
  skills: candidateData.skills 
}, null, 2)}

${jobData ? `TARGET ROLE: ${getJobContext(jobData)}` : ''}

IMPROVEMENT GUIDELINES:
• Enhance impact and clarity of existing content
• Make language more compelling and professional
• Add specific details, metrics, or achievements where possible
• Maintain the original structure and formatting
• Improve flow and readability

CRITICAL FORMATTING REQUIREMENTS:
- Maintain double asterisks (**) for section headers
- Keep TWO blank lines after each main section header
- Use bullet points (•) with bold sub-headings
- Add ONE blank line after each bullet point  
- Add TWO blank lines between main sections
- NO introductory text like "Here's the improved version:"
- Return ONLY the enhanced content with proper spacing

Enhance the content while maintaining excellent formatting and structure.`,

  expand: (section: string, existingContent: string, candidateData: any, jobData?: any) => `
Expand the following ${section} content by adding more detail, depth, and comprehensive coverage:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience || candidateData.workHistory,
  skills: candidateData.skills 
}, null, 2)}

${jobData ? `TARGET ROLE: ${getJobContext(jobData)}` : ''}

EXPANSION GUIDELINES:
• Add more specific details and examples
• Include additional relevant subsections or skills
• Provide more comprehensive coverage of the topic
• Add specific methodologies, tools, or frameworks
• Include measurable achievements or outcomes where applicable

CRITICAL FORMATTING REQUIREMENTS:
- Use double asterisks (**) for main section headers
- Add TWO blank lines after each main section header
- Use bullet points (•) with bold sub-headings
- Add ONE blank line after each bullet point
- Add TWO blank lines between main sections
- NO introductory text like "Here's the expanded version:"
- Return ONLY the expanded content with proper spacing

Expand the content significantly while maintaining excellent formatting and structure.`,

  rewrite: (section: string, existingContent: string, candidateData: any, jobData?: any) => `
Completely rewrite the following ${section} content with a fresh perspective while maintaining the same core information:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience || candidateData.workHistory,
  skills: candidateData.skills 
}, null, 2)}

${jobData ? `TARGET ROLE: ${getJobContext(jobData)}` : ''}

REWRITE GUIDELINES:
• Completely rephrase and restructure the content
• Use different language and approach while preserving core information
• Organize information in a new, logical flow
• Add fresh perspective and alternative descriptions
• Maintain professional tone and impact

CRITICAL FORMATTING REQUIREMENTS:
- Use double asterisks (**) for main section headers
- Add TWO blank lines after each main section header
- Use bullet points (•) with bold sub-headings
- Add ONE blank line after each bullet point
- Add TWO blank lines between main sections
- NO introductory text like "Here's the rewritten version:"
- Return ONLY the rewritten content with proper spacing

Completely rewrite the content while maintaining excellent formatting and structure.`,

  format_for_pdf: (section: string, existingContent: string, candidateData: any, jobData?: any) => `
Format the following ${section} content for optimal PDF presentation with proper structure and spacing:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience || candidateData.workHistory,
  skills: candidateData.skills 
}, null, 2)}

${jobData ? `TARGET ROLE: ${getJobContext(jobData)}` : ''}

PDF FORMATTING GUIDELINES:
• Convert content to clean HTML format suitable for PDF generation
• Use proper HTML tags: <p>, <strong>, <ul>, <li>, <br>
• Maintain clear hierarchy with proper heading structure
• Ensure consistent spacing and bullet point formatting
• Remove any markdown syntax and convert to HTML
• Make content print-friendly and visually appealing

CRITICAL PDF FORMATTING REQUIREMENTS:
- Convert **text** to <strong>text</strong>
- Convert bullet points (•) to <ul><li> lists
- Use <p> tags for paragraphs with proper spacing
- Use <br> for line breaks where needed
- Remove any introductory text or explanations
- Return ONLY the formatted HTML content
- Ensure content flows well on printed pages

Format the content as clean HTML suitable for PDF generation.`
};

export async function POST(request: NextRequest) {
  let body: SectionGenerationRequest | undefined;
  
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    body = await request.json() as SectionGenerationRequest;
    const { 
      section, 
      candidateData, 
      jobData, 
      order = 0, 
      enhancementAction, 
      existingContent, 
      finalEditorContent, 
      sectionType, 
      experienceIndex 
    } = body;

    if (!section && !sectionType) {
      return NextResponse.json(
        { success: false, error: 'Section or sectionType is required' },
        { status: 400 }
      );
    }

    if (!candidateData) {
      return NextResponse.json(
        { success: false, error: 'candidateData is required' },
        { status: 400 }
      );
    }

    // Handle finalEditorContent parameter - when present, automatically use format_for_pdf enhancement
    const actualSection = section || sectionType || 'UNKNOWN';
    let actualEnhancementAction = enhancementAction;
    let actualExistingContent = existingContent;
    
    if (finalEditorContent && !enhancementAction) {
      console.log(`📝 Final editor content provided for ${actualSection}, using format_for_pdf enhancement`);
      actualEnhancementAction = 'format_for_pdf';
      actualExistingContent = finalEditorContent;
    } else if (finalEditorContent && enhancementAction) {
      console.log(`📝 Final editor content provided for ${actualSection} with ${enhancementAction} enhancement`);
      actualExistingContent = finalEditorContent;
    }

    // Validation for enhancement actions
    if (actualEnhancementAction && !actualExistingContent) {
      return NextResponse.json(
        { success: false, error: 'existingContent or finalEditorContent is required for enhancement actions' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    console.log(`🤖 Generating section: ${actualSection} (order: ${order})${actualEnhancementAction ? ` - ${actualEnhancementAction.toUpperCase()} enhancement` : ''}`);

    // Get the appropriate prompt for this section
    let prompt: string;
    
    // Handle enhancement actions first
    if (actualEnhancementAction && actualExistingContent) {
      console.log(`🎨 Processing ${actualEnhancementAction} enhancement for ${actualSection}`);
      console.log(`📄 Existing content preview (first 150 chars):`, actualExistingContent.substring(0, 150) + (actualExistingContent.length > 150 ? '...' : ''));
      prompt = ENHANCEMENT_PROMPTS[actualEnhancementAction](actualSection, actualExistingContent, candidateData, jobData);
    } else if (actualSection.startsWith('PROFESSIONAL EXPERIENCE ') && actualSection !== 'PROFESSIONAL EXPERIENCES SUMMARY') {
      const experienceIndex = parseInt(actualSection.split(' ')[2]) - 1;
      console.log(`🔄 Processing dynamic professional experience: index ${experienceIndex}`);
      console.log(`📋 Candidate experience data:`, JSON.stringify(candidateData.experience || candidateData.workHistory || [], null, 2));
      console.log(`🎯 Target experience at index ${experienceIndex}:`, JSON.stringify(candidateData.experience?.[experienceIndex] || candidateData.workHistory?.[experienceIndex] || 'NOT FOUND', null, 2));
      prompt = SECTION_PROMPTS['PROFESSIONAL EXPERIENCE'](candidateData, jobData, experienceIndex);
    } else if (SECTION_PROMPTS[actualSection as keyof typeof SECTION_PROMPTS]) {
      console.log(`🔄 Processing standard section: ${actualSection}`);
      if (actualSection === 'PROFESSIONAL EXPERIENCES SUMMARY') {
        console.log(`📋 Experience data for summary:`, JSON.stringify(candidateData.experience || candidateData.workHistory || [], null, 2));
      }
      prompt = SECTION_PROMPTS[actualSection as keyof typeof SECTION_PROMPTS](candidateData, jobData);
    } else {
      console.error(`❌ Unknown section type: ${actualSection}`);
      return NextResponse.json(
        { success: false, error: `Unknown section type: ${actualSection}` },
        { status: 400 }
      );
    }

    console.log(`📝 Generated prompt preview (first 200 chars): ${prompt.substring(0, 200)}...`);

    // Use OpenAI Responses API for generation
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
            }
          ]
        }
      ]
    });

    const processingTime = Date.now() - startTime;
    
    console.log(`📊 OpenAI Response received for ${actualSection}:`, {
      hasOutput: !!response.output,
      outputLength: response.output?.length || 0,
      usage: response.usage,
      processingTime
    });

    // Extract the response content
    const responseMessage = response.output[0];
    if (!responseMessage || responseMessage.type !== 'message') {
      console.error(`❌ Invalid response structure for ${actualSection}:`, { responseMessage, responseType: responseMessage?.type });
      throw new Error('No valid response from OpenAI Responses API');
    }

    const textContent = responseMessage.content[0];
    if (!textContent || textContent.type !== 'output_text') {
      console.error(`❌ Invalid text content structure for ${actualSection}:`, { textContent, contentType: textContent?.type });
      throw new Error('No text content in OpenAI Responses API response');
    }

    const generatedContent = textContent.text;
    
    console.log(`📝 Raw content generated for ${actualSection} (${generatedContent?.length || 0} chars):`, 
      generatedContent?.substring(0, 150) + (generatedContent?.length > 150 ? '...' : ''));

    if (!generatedContent || generatedContent.trim().length === 0) {
      console.error(`❌ Empty content returned for ${actualSection}`);
      throw new Error('OpenAI returned empty content');
    }

    // Clean the content to remove unwanted preambles and conclusions
    const cleanedContent = cleanGeneratedContent(generatedContent, actualSection);

    console.log(`✅ Section ${actualSection} generated successfully in ${processingTime}ms`);

    const result: SectionGenerationResponse = {
      success: true,
      content: cleanedContent,
      section: actualSection,
      order,
      processingTime,
      tokensUsed: response.usage?.total_tokens || 0,
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ OpenAI Responses API error:', error);
    console.error(`❌ Error details:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Parse the request body again to get section and order for error response
    let errorSection = 'unknown';
    let errorOrder = 0;
    
    try {
      const errorBody = await request.json() as SectionGenerationRequest;
      errorSection = errorBody.section || 'unknown';
      errorOrder = errorBody.order || 0;
    } catch {
      // If parsing fails, use defaults
    }
    
    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate content: ${errorMessage}`,
        content: '',
        section: errorSection,
        order: errorOrder,
        processingTime: 0,
      } as SectionGenerationResponse,
      { status: 500 }
    );
  }
}

// Content cleaning function to remove unwanted preambles and conclusions
function cleanGeneratedContent(content: string, section: string): string {
  let cleaned = content.trim();
  
  // AGGRESSIVE removal of introductory text - must be done in order
  const aggressiveIntros = [
    /^Certainly![^:]*:/i,
    /^Certainly! Below[^\.]*\./i,
    /^Here's[^:]*:/i,
    /^Here are[^:]*:/i,
    /^Below is[^:]*:/i, 
    /^Below are[^:]*:/i,
    /^This is[^:]*:/i,
    /^The following[^:]*:/i,
    /^I'll[^:]*:/i,
    /^Let me[^:]*:/i,
    /^Based on[^:]*:/i,
    /^Generate[^:]*:/i,
    /^Create[^:]*:/i,
  ];

  // Remove aggressive intros first
  for (const intro of aggressiveIntros) {
    cleaned = cleaned.replace(intro, '');
  }

  // Remove specific introductory sentences that appear at the beginning (case-insensitive)
  const specificIntros = [
    /^.*functional skills section tailored to your profile[^\.]*\./i,
    /^.*comprehensive functional skills section[^\.]*\./i,
    /^.*Below is a comprehensive[^\.]*\./i,
    /^.*Here's a comprehensive[^\.]*\./i,
    /^.*This is a detailed[^\.]*\./i,
    /^.*enhanced areas of expertise[^\.]*\./i,
    /^.*technical skills[^:]*:/i,
    /^.*areas of expertise[^:]*:/i,
  ];
  
  // Remove specific introductory sentences
  for (const intro of specificIntros) {
    cleaned = cleaned.replace(intro, '');
  }

  // Remove ALL placeholder text patterns
  const placeholders = [
    /\(Add tools if applicable\)/gi,
    /\(Relevant frameworks can be added if known\)/gi,
    /\(Add relevant frameworks if applicable\)/gi,
    /\(Add.*if applicable\)/gi,
    /\(Relevant.*can be added.*\)/gi,
    /\(.*can be added.*\)/gi,
    /\[.*?\]/g, // Remove any bracketed placeholders
  ];
  
  // Remove placeholder text
  for (const placeholder of placeholders) {
    cleaned = cleaned.replace(placeholder, '');
  }
  
  // Remove common conclusions and instructional text
  const conclusions = [
    /Replace `\[.*?\]` with.*$/gm,
    /---\s*Replace.*$/gm,
    /These certifications.*$/gm,
    /This structure.*$/gm,
    /Feel free to.*$/gm,
    /---$/gm,
    /^\s*---\s*$/gm,
  ];
  
  // Remove conclusions
  for (const conclusion of conclusions) {
    cleaned = cleaned.replace(conclusion, '');
  }
  
  // Clean up formatting issues
  cleaned = cleaned.replace(/^[\s\-\n\r]+/gm, ''); // Remove leading whitespace/dashes
  cleaned = cleaned.replace(/[\s\-\n\r]+$/gm, ''); // Remove trailing whitespace/dashes
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Normalize multiple newlines to double
  cleaned = cleaned.replace(/^\s*\n+/, ''); // Remove leading newlines
  cleaned = cleaned.replace(/\n+\s*$/, ''); // Remove trailing newlines
  cleaned = cleaned.trim();
  
  return cleaned;
}

export async function GET() {
  return NextResponse.json({
    service: 'OpenAI Responses API for Competence Files',
    status: 'operational',
    supportedSections: Object.keys(SECTION_PROMPTS),
    features: {
      sequentialGeneration: true,
      jobContextIntegration: true,
      professionalExperienceHandling: true,
    },
    authentication: 'required',
    timestamp: new Date().toISOString(),
  });
} 