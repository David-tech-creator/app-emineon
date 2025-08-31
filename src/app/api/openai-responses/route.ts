import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { type JobDescription, type CandidateData } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Remove unused interfaces

interface GenerationRequest {
  candidateData: CandidateData;
  jobDescription: JobDescription;
  segmentType: string;
  existingContent?: string;
  enhancementAction?: string;
  order?: number;
}

interface OpenAIResponse {
  hasOutput: boolean;
  outputLength: number;
  usage?: {
    input_tokens: number;
    input_tokens_details?: { cached_tokens: number };
    output_tokens: number;
    output_tokens_details?: { reasoning_tokens: number };
    total_tokens: number;
  };
  processingTime: number;
}

// Helper function to map segment types to proper section names
function mapSegmentTypeToSection(segmentType: string): string {
  const typeMapping: Record<string, string> = {
    'HEADER': 'HEADER',
    'SUMMARY': 'PROFESSIONAL SUMMARY',
    'SKILLS': 'FUNCTIONAL SKILLS',
    'FUNCTIONAL SKILLS': 'FUNCTIONAL SKILLS',
    'TECHNICAL SKILLS': 'TECHNICAL SKILLS',
    'AREAS OF EXPERTISE': 'AREAS OF EXPERTISE',
    'EXPERIENCE': 'PROFESSIONAL EXPERIENCE 1',
    'EXPERIENCE-SUMMARY': 'PROFESSIONAL EXPERIENCES SUMMARY',
    'PROFESSIONAL EXPERIENCES SUMMARY': 'PROFESSIONAL EXPERIENCES SUMMARY',
    'EDUCATION': 'EDUCATION',
    'CERTIFICATIONS': 'CERTIFICATIONS',
    'LANGUAGES': 'LANGUAGES',
    'STATIC': 'AREAS OF EXPERTISE',
    'DYNAMIC': 'TECHNICAL SKILLS'
  };
  
  // Check for exact matches first
  if (typeMapping[segmentType.toUpperCase()]) {
    return typeMapping[segmentType.toUpperCase()];
  }
  
  // Check for professional experience patterns
  if (segmentType.toUpperCase().includes('PROFESSIONAL EXPERIENCE')) {
    return segmentType;
  }
  
  // Check for partial matches
  const segmentUpper = segmentType.toUpperCase();
  if (segmentUpper.includes('FUNCTIONAL') || segmentUpper.includes('SKILLS')) {
    return 'FUNCTIONAL SKILLS';
  }
  
  if (segmentUpper.includes('TECHNICAL')) {
    return 'TECHNICAL SKILLS';
  }
  
  if (segmentUpper.includes('AREAS') || segmentUpper.includes('EXPERTISE')) {
    return 'AREAS OF EXPERTISE';
  }
  
  if (segmentUpper.includes('CERTIFICATIONS')) {
    return 'CERTIFICATIONS';
  }
  
  if (segmentUpper.includes('LANGUAGES')) {
    return 'LANGUAGES';
  }
  
  // Default fallback
  console.warn(`⚠️ Unknown segment type: ${segmentType}, using as-is`);
  return segmentType;
}

// Helper function to safely extract job context from job data
function getJobContext(job: JobDescription): string {
  if (!job) return 'Not specified';
  
  const parts = [];
  
  if (job.title) parts.push(`Position: ${job.title}`);
  if (job.company) parts.push(`Company: ${job.company}`);
  
  // Handle responsibilities - check if it's an array or string
  if (job && (job as any).responsibilities) {
    const respVal = (job as any).responsibilities;
    if (Array.isArray(respVal)) {
      if (respVal.length > 0) {
        parts.push(`Key Responsibilities: ${respVal.slice(0, 3).join(', ')}`);
      }
    } else if (typeof respVal === 'string') {
      const resp = respVal as string;
      parts.push(`Responsibilities: ${resp.substring(0, 200)}${resp.length > 200 ? '...' : ''}`);
    }
  }
  
  // Handle requirements - check if it's an array or string  
  if (job && (job as any).requirements) {
    const reqVal = (job as any).requirements;
    if (Array.isArray(reqVal)) {
      if (reqVal.length > 0) {
        parts.push(`Requirements: ${reqVal.slice(0, 3).join(', ')}`);
      }
    } else if (typeof reqVal === 'string') {
      const req = reqVal as string;
      parts.push(`Requirements: ${req.substring(0, 200)}${req.length > 200 ? '...' : ''}`);
    }
  }
  
  // Handle skills
  if (job.skills && Array.isArray(job.skills) && job.skills.length > 0) {
    parts.push(`Key Skills: ${job.skills.slice(0, 5).join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Not specified';
}

// Map short language codes to readable names
function getLanguageName(lang?: string): string {
  if (!lang) return 'English';
  const code = lang.toLowerCase();
  switch (code) {
    case 'fr': return 'French';
    case 'de': return 'German';
    case 'nl': return 'Dutch';
    case 'en': return 'English';
    default: return lang;
  }
}

// Competence file section prompts using OpenAI Responses API
const SECTION_PROMPTS = {
  'HEADER': (candidate: CandidateData, job?: JobDescription, language?: string) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with the candidate's full name
• DO NOT write "Here is" or "Below is" or any introduction
• DO NOT add extra formatting or explanations
• ONLY output the exact content requested

OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}

CANDIDATE DATA: ${JSON.stringify(candidate, null, 2)}

Create a professional header with:
• Full Name (as main heading)
• Current Title/Position (translated to ${getLanguageName((job as any)?.language || language)})
• Years of Experience (if available, in ${getLanguageName((job as any)?.language || language)})

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

TRANSLATE ALL TEXT including job titles and experience descriptions to ${getLanguageName((job as any)?.language || language)}.
Return ONLY the formatted header content in ${getLanguageName((job as any)?.language || language)}.`,

  'PROFESSIONAL SUMMARY': (candidate: CandidateData, job?: JobDescription, language?: string) => `
STRICT GENERATION RULES:
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}
• Your response MUST start immediately with content (no "Here is" or introductions)
• Write in third person about the candidate
• Focus on high-level achievements and value proposition from actual data
• Keep to 3-4 impactful sentences
• DO NOT invent specific metrics, percentages, or achievements not in the source data
• Use compelling language to present real information effectively

CANDIDATE PROFILE: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'extensive'} years experience
BACKGROUND: ${candidate.summary || 'Professional background'}
SKILLS: ${candidate.skills?.join(', ') || 'Professional expertise'}
ACTUAL EXPERIENCE: ${candidate.experience?.map((e:any)=>`${e.title || ''} at ${e.company || ''}`).join(' | ') || 'Professional experience'}

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

Write a compelling professional summary using ONLY the provided candidate data.
Enhance the presentation using professional CV best practices without fabricating information.
TRANSLATE ALL CONTENT to ${getLanguageName((job as any)?.language || language)}.
Return ONLY the summary content in ${getLanguageName((job as any)?.language || language)}, no additional formatting.`,

  'FUNCTIONAL SKILLS': (candidate: CandidateData, job?: JobDescription, language?: string) => `
STRICT GENERATION RULES:
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}
• Use ONLY information present in the candidate profile and (if provided) the job description
• DO NOT invent skills or categories; if insufficient data, return an empty response
• No introductory text, no explanations, no placeholders
• Organize functional skills into logical categories derived from the input
• FORMAT EXACTLY LIKE THIS (bullet list like Professional Experience):

  **Category Name**
  • Skill or capability with brief evidence
  • Skill or capability with brief evidence

  **Another Category Name**
  • Skill item
  • Skill item

CANDIDATE CONTEXT:
Title: ${candidate.currentTitle}
Years: ${candidate.yearsOfExperience || ''}
Skills: ${candidate.skills?.join(', ') || ''}
Experience: ${candidate.experience?.map((e:any)=>`${e.title || ''} at ${e.company || ''}`).join(' | ') || ''}

${job ? `TARGET ROLE CONTEXT: ${getJobContext(job)}` : ''}

OUTPUT REQUIREMENTS:
- Use bullet character "•" at the start of each item (not dashes)
- Keep bold headers with **Category Name** on a separate line
- TRANSLATE category names and skill descriptions to ${getLanguageName((job as any)?.language || language)}
- If you cannot confidently derive content from the input, return nothing (empty string)
`,

  'TECHNICAL SKILLS': (candidate: CandidateData, job?: JobDescription, language?: string) => `
STRICT GENERATION RULES:
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}
• Use ONLY technologies explicitly present in candidate.skills, candidate experience, or job requirements
• DO NOT add generic examples or placeholders; if insufficient data, return an empty response
• Organize real technologies into logical categories you derive from the input (e.g., Programming Languages, Frameworks, Cloud)
• FORMAT EXACTLY LIKE THIS (bullet list like Professional Experience):

  **Category Name**
  • Technology/Tool 1
  • Technology/Tool 2

  **Another Category Name**
  • Technology/Tool 1
  • Technology/Tool 2

CANDIDATE TECHNOLOGIES: ${candidate.skills?.join(', ') || ''}
${job ? `JOB TECHNOLOGIES: ${job.skills?.join(', ') || ''}` : ''}

OUTPUT REQUIREMENTS:
- Use bullet character "•" at the start of each item (no comma lists)
- Keep bold headers with **Category Name** on a separate line
- TRANSLATE category names and technology descriptions to ${getLanguageName((job as any)?.language || language)}
- Output nothing if you cannot confidently derive any technical skills from the input
`,

  'AREAS OF EXPERTISE': (candidate: CandidateData, job?: JobDescription, language?: string) => `
STRICT GENERATION RULES:
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}
• Derive ALL content solely from candidate data and (if provided) job description
• DO NOT include sample items, generic domains, or invented expertise areas
• DO NOT create fake specializations or domains not evident in the input
• If insufficient data, return an empty response
• Organize into concise lines under bolded headers ONLY if clearly supported by input

CANDIDATE SNAPSHOT:
Title: ${candidate.currentTitle}
Years: ${candidate.yearsOfExperience || ''}
Skills: ${candidate.skills?.join(', ') || ''}
Experience: ${candidate.experience?.map((e:any)=>`${e.title || ''} at ${e.company || ''}`).join(' | ') || ''}
${job ? `JOB CONTEXT: ${getJobContext(job)}` : ''}

OUTPUT REQUIREMENTS:
- Only include expertise areas that are clearly evident from the candidate's actual experience and skills
- Format as:
  **Industry Expertise:** [Only domains clearly evident from experience]
  
  **Functional Skills:** [Only capabilities clearly evident from experience]
  
  **Technical Proficiency:** [Only technologies clearly evident from skills/experience]
- If you cannot confidently derive any category from the actual input, omit that header entirely
- If nothing can be confidently derived, return empty output
`,

  'EDUCATION': (candidate: CandidateData, job?: JobDescription, language?: string) => `
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}

CRITICAL RULES - NO FABRICATION:
• Use ONLY education data explicitly provided by the candidate
• DO NOT invent degrees, institutions, or academic achievements
• DO NOT include certifications here (they belong in CERTIFICATIONS section)
• If no education data is provided, return empty content

CANDIDATE EDUCATION: ${candidate.education?.join(', ') || 'None provided'}

If actual education data exists, format as bullet points:
• **[Actual Degree]** - [Actual Institution] ([Actual Year if available])
• **[Actual Program]** - [Actual Institution] ([Actual Year if available])

Only include academic programs, thesis topics, or honors if they are explicitly mentioned in the candidate data.
DO NOT create placeholder education entries.`,

  'CERTIFICATIONS': (candidate: CandidateData, job?: JobDescription, language?: string) => `
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}

CRITICAL RULES - NO FABRICATION:
• Use ONLY certifications explicitly listed in the candidate's certification data
• DO NOT invent, suggest, or add certifications not provided by the candidate
• If no certifications are provided in candidate data, return empty content
• DO NOT use example certifications or templates

CANDIDATE CERTIFICATIONS: ${candidate.certifications?.join(', ') || 'None provided'}
CANDIDATE BACKGROUND: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'multiple'} years experience
TECHNICAL SKILLS: ${candidate.skills?.join(', ') || 'Professional skills'}

${job ? `TARGET ROLE REQUIREMENTS: ${getJobContext(job)}` : ''}

If the candidate has actual certifications listed, format them as bullet points:
• **[Actual Certification Name]** - [Year if available]
• **[Actual Certification Name]** - [Year if available]

If no certifications are provided in the candidate data, return nothing.
DO NOT use placeholder examples or template certifications.`,

  'LANGUAGES': (candidate: CandidateData, job?: JobDescription, language?: string) => `
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}
Generate a clean languages section using the candidate's actual language data:

CANDIDATE LANGUAGES: ${candidate.languages?.join(', ') || 'English (Native)'}

Create a properly formatted languages section using ONLY the candidate's actual languages. Format each language as:
• **[Language Name]** - [Proficiency Level]

Use these proficiency levels: Native, Professional, Conversational, Basic

If only English is mentioned or no specific languages provided, show:
• **English** - Native

Do NOT include placeholder text, brackets, or example languages. Use only real data.
Return ONLY the formatted language list, nothing else.`,

  'PROFESSIONAL EXPERIENCES SUMMARY': (candidate: CandidateData, job?: JobDescription, language?: string) => `
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}

CRITICAL RULES - NO FABRICATION:
• Use ONLY the actual professional experiences from the candidate data
• DO NOT invent companies, roles, or dates
• If no experience data is available, return empty content

CANDIDATE EXPERIENCES: ${JSON.stringify(candidate.experience || [], null, 2)}

Create a chronological listing using ONLY the provided experience data in reverse chronological order (latest first):

Format as:
**[Actual Company Name]** - [Actual Role Title]  
[Actual Start Date] - [Actual End Date]

**[Actual Company Name]** - [Actual Role Title]  
[Actual Start Date] - [Actual End Date]

${job ? `TARGET ROLE CONTEXT: ${getJobContext(job)}` : ''}

Return ONLY the formatted chronological listing from actual data, no explanations or additional text.`,

  'PROFESSIONAL EXPERIENCE': (candidate: CandidateData, job?: JobDescription, experienceIndex: number = 0, language?: string) => `
OUTPUT LANGUAGE: ${getLanguageName((job as any)?.language || language)}

CRITICAL RULES - NO FABRICATION:
• Use ONLY information from the candidate's actual experience data
• DO NOT invent metrics, percentages, or specific numbers unless they appear in the source data
• DO NOT create fake achievements with made-up statistics
• Present real responsibilities and achievements in the most compelling way possible
• Use professional CV best practices for impact statements without fabricating data

CANDIDATE EXPERIENCES: ${JSON.stringify(candidate.experience || [], null, 2)}
EXPERIENCE INDEX: ${experienceIndex}
TARGET EXPERIENCE: ${candidate.experience?.[experienceIndex] ? JSON.stringify(candidate.experience[experienceIndex], null, 2) : 'Not found - skip this experience'}

${job ? `TARGET ROLE CONTEXT: ${getJobContext(job)}` : ''}

If the experience exists at index ${experienceIndex}, use that exact data and enhance the presentation using CV best practices:
- Transform responsibilities into action-oriented statements
- Highlight achievements using power verbs and impact language
- Present technical skills professionally
- DO NOT add fake metrics or percentages

If no experience exists at this index, return empty content.

Format exactly as:

**[Company Name]** - [Role Title]  
[Start Date] - [End Date]

**Key Responsibilities:**
• [Enhanced responsibility based on actual data]
• [Enhanced responsibility based on actual data]
• [Enhanced responsibility based on actual data]

**Achievements & Impact:**
• [Real achievement presented compellingly - NO FAKE METRICS]
• [Real achievement presented compellingly - NO FAKE METRICS]
• [Real achievement presented compellingly - NO FAKE METRICS]

**Technical Environment:**
• [Actual technology/tool from experience]
• [Actual technology/tool from experience]
• [Actual technology/tool from experience]

TRANSLATE ALL CONTENT including company names, job titles, responsibilities, achievements, and section headers to ${getLanguageName((job as any)?.language || language)}.
Return ONLY the formatted experience entry in ${getLanguageName((job as any)?.language || language)}, no introductory text or explanations.`
};

// Enhancement prompts for improve/expand/rewrite/format_for_pdf functionality
const ENHANCEMENT_PROMPTS = {
  improve: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
Improve the following ${section} content by making it more compelling, professional, and impactful:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience,
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

  expand: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
Expand the following ${section} content by adding more detail, depth, and comprehensive coverage:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience,
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

  rewrite: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
Completely rewrite the following ${section} content with a fresh perspective while maintaining the same core information:

EXISTING CONTENT:
${existingContent}

CANDIDATE CONTEXT:
${JSON.stringify({ 
  name: candidateData.fullName, 
  title: candidateData.currentTitle,
  experience: candidateData.experience,
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

  format_for_pdf: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
CRITICAL INSTRUCTION: You must PRESERVE the exact content provided below. Do NOT generate new content, do NOT add information, do NOT change the meaning. ONLY convert the formatting to clean HTML with proper structure.

ORIGINAL CONTENT TO PRESERVE:
${existingContent}

TASK: Convert the above content to clean HTML format for PDF generation. You must:

✅ PRESERVE every piece of information exactly as written
✅ PRESERVE all bullet points, sections, and structure
✅ PRESERVE all company names, dates, achievements, and details
✅ PRESERVE all technical skills, certifications, and languages exactly as listed
✅ ONLY convert formatting (markdown to HTML, improve structure, add proper styling classes)

SPECIAL FORMATTING RULES FOR SPECIFIC SECTIONS:

${section.includes('FUNCTIONAL SKILLS') || section.includes('SKILLS') ? `
FOR FUNCTIONAL SKILLS - Structure like Core Competencies:
- Create subsections with clear subtitles (e.g., "Leadership & Management", "Strategic Planning", "Communication & Collaboration", etc.)
- Use this HTML structure:
<div class="skills-category">
  <h4 class="skills-subtitle">Leadership & Management</h4>
  <ul class="skills-list">
    <li class="skill-item">• Specific skill or achievement from original content</li>
    <li class="skill-item">• Another specific skill or achievement</li>
  </ul>
  <p class="skills-description">Brief descriptive summary in italics</p>
</div>

- Group related skills under logical subtitles
- Keep all original content but organize it under appropriate categories
- Use yellow bullet points (•) for each skill item
- Add brief italic descriptions for each category
` : ''}

${section.includes('TECHNICAL') ? `
FOR TECHNICAL SKILLS - Structure with multiple categories:
- Create subsections like "Programming Languages", "Frameworks & Libraries", "Databases & Storage", etc.
- Use the same HTML structure as functional skills
- Group technologies logically
- Keep all original technical items
` : ''}

${section.includes('EXPERIENCE') && !section.includes('SUMMARY') ? `
FOR PROFESSIONAL EXPERIENCE - Use structured format:
<div class="experience-entry">
  <div class="company-header">
    <h3 class="company-name">Company Name</h3>
    <h4 class="role-title">Job Title</h4>
    <p class="duration">Start Date - End Date</p>
  </div>
  
  <div class="role-overview">
    <h5>ROLE OVERVIEW</h5>
    <p>Brief overview paragraph</p>
  </div>
  
  <div class="responsibilities">
    <h5>KEY RESPONSIBILITIES</h5>
    <ul>
      <li>• Responsibility item</li>
    </ul>
  </div>
  
  <div class="achievements">
    <h5>KEY ACHIEVEMENTS</h5>
    <ul>
      <li>• Achievement with metrics</li>
    </ul>
  </div>
  
  <div class="technical-environment">
    <h5>TECHNICAL ENVIRONMENT</h5>
    <div class="tech-tags">
      <span class="tech-tag">Technology</span>
    </div>
  </div>
</div>
` : ''}

GENERAL HTML FORMATTING:
- Convert **bold text** to <strong>bold text</strong>
- Convert bullet points to proper <li> elements with • symbols
- Use appropriate heading levels (h3, h4, h5)
- Add CSS classes for styling (skills-category, skill-item, etc.)
- Ensure clean, semantic HTML structure
- Remove any markdown formatting syntax
- Keep all specific details, numbers, achievements, and metrics exactly as written

Remember: Your job is ONLY to format the existing content into clean HTML structure, NOT to create new content or change any information.`
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: GenerationRequest = await request.json();
    console.log('📥 OpenAI Response API called for:', body.segmentType);
    
    let result = '';
    let usage = undefined;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const { 
      candidateData, 
      jobDescription, 
      segmentType, 
      existingContent, 
      enhancementAction 
    } = body;

    if (!segmentType) {
      return NextResponse.json(
        { success: false, error: 'segmentType is required' },
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
    const actualSection = segmentType;
    let actualEnhancementAction = enhancementAction;
    let actualExistingContent = existingContent;
    
    // Map segment types to proper section names for PDF generation
    let mappedSection = actualSection;
    if (segmentType && !segmentType) {
      mappedSection = mapSegmentTypeToSection(segmentType);
      console.log(`🔄 Mapped segment type "${segmentType}" to section "${mappedSection}"`);
    }
    
    if (existingContent && !enhancementAction) {
      console.log(`📝 Final editor content provided for ${mappedSection}, using format_for_pdf enhancement`);
      console.log(`📄 Final editor content length: ${existingContent.length} chars`);
      console.log(`📄 Final editor content preview:`, existingContent.substring(0, 300) + (existingContent.length > 300 ? '...' : ''));
      actualEnhancementAction = 'format_for_pdf';
      actualExistingContent = existingContent;
    }
    
    console.log(`🎯 Processing section: ${mappedSection}`);
    console.log(`🎯 Enhancement action: ${actualEnhancementAction || 'generate'}`);
    console.log(`🎯 Has existing content: ${!!actualExistingContent}`);
    console.log(`🎯 Has final editor content: ${!!existingContent}`);
    
    if (actualExistingContent || existingContent) {
      const contentToCheck = actualExistingContent || existingContent;
      if (contentToCheck) {
        console.log(`📋 Content to process (${contentToCheck.length} chars):`, contentToCheck.substring(0, 200) + (contentToCheck.length > 200 ? '...' : ''));
      }
    }

    // Validation for enhancement actions
    if (actualEnhancementAction && !actualExistingContent) {
      return NextResponse.json(
        { success: false, error: 'existingContent or finalEditorContent is required for enhancement actions' },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating section: ${mappedSection} (order: ${body.order})${actualEnhancementAction ? ` - ${actualEnhancementAction.toUpperCase()} enhancement` : ''}`);

    // Get the appropriate prompt for this section
    let prompt: string;
    
    // Handle enhancement actions first
    if (actualEnhancementAction && actualExistingContent) {
      console.log(`🎨 Processing ${actualEnhancementAction} enhancement for ${mappedSection}`);
      console.log(`📄 Original content length: ${actualExistingContent.length} chars`);
      console.log(`📄 Original content preview (first 300 chars):`, actualExistingContent.substring(0, 300) + (actualExistingContent.length > 300 ? '...' : ''));
      
      if (actualEnhancementAction === 'format_for_pdf') {
        console.log(`🔧 CRITICAL: Using format_for_pdf enhancement - should preserve exact content`);
      }
      
      const action = actualEnhancementAction as keyof typeof ENHANCEMENT_PROMPTS;
      prompt = ENHANCEMENT_PROMPTS[action](mappedSection, actualExistingContent, candidateData, jobDescription);
      
      console.log(`📝 Enhancement prompt preview (first 500 chars):`, prompt.substring(0, 500) + '...');
    } else {
      // Use generation prompts for initial content creation
      if (mappedSection.startsWith('PROFESSIONAL EXPERIENCE ') && mappedSection !== 'PROFESSIONAL EXPERIENCES SUMMARY') {
        const experienceIndex = parseInt(mappedSection.split(' ')[2]) - 1;
        console.log(`🔄 Processing dynamic professional experience: index ${experienceIndex}`);
        console.log(`📋 Candidate experience data:`, JSON.stringify(candidateData.experience || [], null, 2));
        console.log(`🎯 Target experience at index ${experienceIndex}:`, JSON.stringify(candidateData.experience?.[experienceIndex] || 'NOT FOUND', null, 2));
        prompt = SECTION_PROMPTS['PROFESSIONAL EXPERIENCE'](candidateData, jobDescription, experienceIndex, (jobDescription as any)?.language);
      } else if (SECTION_PROMPTS[mappedSection as keyof typeof SECTION_PROMPTS]) {
        console.log(`🔄 Processing standard section: ${mappedSection}`);
        if (mappedSection === 'PROFESSIONAL EXPERIENCES SUMMARY') {
          console.log(`📋 Experience data for summary:`, JSON.stringify(candidateData.experience || [], null, 2));
        }
        prompt = SECTION_PROMPTS[mappedSection as keyof typeof SECTION_PROMPTS](candidateData, jobDescription, (jobDescription as any)?.language);
      } else {
        console.error(`❌ Unknown section type: ${mappedSection}`);
        return NextResponse.json(
          { success: false, error: `Unknown section type: ${mappedSection}` },
          { status: 400 }
        );
      }
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
    
    console.log(`📊 OpenAI Response received for ${mappedSection}:`, {
      hasOutput: !!response.output,
      outputLength: response.output?.length || 0,
      usage: response.usage,
      processingTime
    });

    // Extract the response content
    const responseMessage = response.output[0];
    if (!responseMessage || responseMessage.type !== 'message') {
      console.error(`❌ Invalid response structure for ${mappedSection}:`, { responseMessage, responseType: responseMessage?.type });
      throw new Error('No valid response from OpenAI Responses API');
    }

    const textContent = responseMessage.content[0];
    if (!textContent || textContent.type !== 'output_text') {
      console.error(`❌ Invalid text content structure for ${mappedSection}:`, { textContent, contentType: textContent?.type });
      throw new Error('No text content in OpenAI Responses API response');
    }

    const generatedContent = textContent.text;
    
    console.log(`📝 Raw content generated for ${mappedSection} (${generatedContent?.length || 0} chars):`, 
      generatedContent?.substring(0, 300) + (generatedContent?.length > 300 ? '...' : ''));

    // Special debugging for skills sections
    if (mappedSection.includes('SKILLS') || mappedSection.includes('EXPERTISE')) {
      console.log(`🔍 SKILLS SECTION DEBUG for ${mappedSection}:`);
      console.log(`  - Enhancement action: ${actualEnhancementAction}`);
      console.log(`  - Has existing content: ${!!actualExistingContent}`);
      console.log(`  - Has final editor content: ${!!existingContent}`);
      console.log(`  - Raw response length: ${generatedContent?.length || 0}`);
      console.log(`  - Raw response content:`, generatedContent || 'NO CONTENT');
    }

    if (actualEnhancementAction === 'format_for_pdf') {
      console.log(`🔍 VERIFICATION: Checking if content was preserved...`);
      const originalWords = actualExistingContent?.split(/\s+/).slice(0, 10).join(' ') || '';
      const generatedWords = generatedContent?.split(/\s+/).slice(0, 10).join(' ') || '';
      console.log(`📄 Original first 10 words: "${originalWords}"`);
      console.log(`📄 Generated first 10 words: "${generatedWords}"`);
      
      if (originalWords && generatedWords && !generatedWords.includes(originalWords.split(' ')[0])) {
        console.warn(`⚠️ WARNING: Content may not have been preserved properly for ${mappedSection}!`);
      }
    }

    if (!generatedContent || generatedContent.trim().length === 0) {
      console.error(`❌ Empty content returned for ${mappedSection}`);
      throw new Error('OpenAI returned empty content');
    }

    // Clean the content to remove unwanted preambles and conclusions
    const cleanedContent = cleanGeneratedContent(generatedContent, mappedSection);

    console.log(`✅ Section ${mappedSection} generated successfully in ${processingTime}ms`);
    
    // Create response object with proper typing
    const openaiResponse: OpenAIResponse = {
      hasOutput: cleanedContent.length > 0,
      outputLength: cleanedContent.split(' ').length,
      usage: response.usage,
      processingTime
    };

    console.log(`📊 OpenAI Response received for ${mappedSection}:`, openaiResponse);

    return NextResponse.json({
      success: true,
      content: cleanedContent,
      section: mappedSection,
      order: body.order || 0,
      tokensUsed: response.usage?.total_tokens,
      processingTime,
      response: openaiResponse
    });

  } catch (error: unknown) {
    console.error('Error in OpenAI content generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
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

// Fix property access to match CandidateData interface
function getCandidateLevel(candidate: CandidateData): string {
  // Determine experience level based on years of experience
  const years = candidate.yearsOfExperience || 0;
  if (years < 2) return 'Junior';
  if (years < 5) return 'Mid-level';
  if (years < 8) return 'Senior';
  return 'Lead/Principal';
}

function getCandidateEducation(candidate: CandidateData): string {
  return candidate.education?.join(', ') || 'Education details available upon request';
}

function getCandidateLanguages(candidate: CandidateData): string {
  return candidate.languages?.join(', ') || 'English (Professional)';
}

function getCandidateExperiences(candidate: CandidateData): Array<{company: string; title: string; startDate: string; endDate: string; responsibilities: string}> {
  return candidate.experience || [];
} 