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
  if (job.responsibilities) {
    if (Array.isArray(job.responsibilities)) {
      if (job.responsibilities.length > 0) {
        parts.push(`Key Responsibilities: ${job.responsibilities.slice(0, 3).join(', ')}`);
      }
    } else if (typeof job.responsibilities === 'string') {
      parts.push(`Responsibilities: ${job.responsibilities.substring(0, 200)}${job.responsibilities.length > 200 ? '...' : ''}`);
    }
  }
  
  // Handle requirements - check if it's an array or string  
  if (job.requirements) {
    if (Array.isArray(job.requirements)) {
      if (job.requirements.length > 0) {
        parts.push(`Requirements: ${job.requirements.slice(0, 3).join(', ')}`);
      }
    } else if (typeof job.requirements === 'string') {
      parts.push(`Requirements: ${job.requirements.substring(0, 200)}${job.requirements.length > 200 ? '...' : ''}`);
    }
  }
  
  // Handle skills
  if (job.skills && Array.isArray(job.skills) && job.skills.length > 0) {
    parts.push(`Key Skills: ${job.skills.slice(0, 5).join(', ')}`);
  }
  
  return parts.length > 0 ? parts.join(' | ') : 'Not specified';
}

// Competence file section prompts using OpenAI Responses API
const SECTION_PROMPTS = {
  'HEADER': (candidate: CandidateData, job?: JobDescription) => `
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

  'PROFESSIONAL SUMMARY': (candidate: CandidateData, job?: JobDescription) => `
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

  'FUNCTIONAL SKILLS': (candidate: CandidateData, job?: JobDescription) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with "**" 
• DO NOT write introductory text like "Here are" or "Below is"
• Focus on soft skills, leadership, and business capabilities
• Use detailed bullet points with specific examples

CANDIDATE BACKGROUND: ${candidate.currentTitle} with ${candidate.yearsOfExperience || 'multiple'} years experience
EXPERIENCE LEVEL: ${getCandidateLevel(candidate)}

${job ? `TARGET ROLE: ${getJobContext(job)}` : ''}

Generate functional skills organized in categories:

**Leadership & Management**
**Strategic Planning & Analysis** 
**Communication & Collaboration**
**Problem Solving & Innovation**

Each bullet point should be detailed and demonstrate specific capabilities.
Return ONLY the formatted functional skills content.`,

  'TECHNICAL SKILLS': (candidate: CandidateData, job?: JobDescription) => `
STRICT GENERATION RULES:
• Your response MUST start immediately with "**Programming Languages:**" 
• DO NOT write "Here are" or "Below are" or any introduction
• Organize skills into clear categories with proper spacing
• Separate each category clearly with double line breaks
• Use clean formatting with categories as headers

CANDIDATE SKILLS: ${candidate.skills?.join(', ') || 'Technical expertise'}
CURRENT ROLE: ${candidate.currentTitle}

${job ? `TARGET ROLE REQUIREMENTS: ${getJobContext(job)}` : ''}

Format exactly like this structure:

**Programming Languages:**
C, C++, Python, JavaScript, TypeScript

**Frameworks & Libraries:**
RTOS, IoT, Embedded Systems, React, Node.js

**Cloud & Infrastructure:**
AWS, Azure, Google Cloud, Docker, Kubernetes

**Databases & Storage:**
SQL, NoSQL, MongoDB, PostgreSQL, Data Lakes

**Development Tools & Methodologies:**
JIRA, Git, Agile, Scrum, Waterfall, DevOps

**Specialized Technologies:**
AI/ML/DL Foundations, Tableau, Power BI, Data Analytics

Each category should have technologies separated by commas on a single line.
Add appropriate line spacing between categories.
Return ONLY the formatted skills content with proper organization.`,

  'AREAS OF EXPERTISE': (candidate: CandidateData, job?: JobDescription) => `
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

**Industry Expertise:**
IoT, Telecommunications, Systems Engineering, Digital Transformation, Enterprise Solutions

**Technical Proficiency:**
JIRA, Waterfall, Agile, SAFe, Tableau, AI/ML/DL Foundations, Cloud & App Development, RTOS

**Functional Skills:**

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

  'EDUCATION': (candidate: CandidateData, job?: JobDescription) => `
Generate education section:

CANDIDATE EDUCATION: ${candidate.education?.join(', ') || candidate.degrees?.join(', ') || 'Professional education'}

Create structured education entries:
• **Degree Type** - Institution Name (Year)
• **Professional Certifications** - Relevant credentials
• **Continuing Education** - Professional development

Include relevant coursework, academic achievements, or specializations.`,

  'CERTIFICATIONS': (candidate: CandidateData, job?: JobDescription) => `
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

  'LANGUAGES': (candidate: CandidateData, job?: JobDescription) => `
Generate a clean languages section using the candidate's actual language data:

CANDIDATE LANGUAGES: ${candidate.languages?.join(', ') || candidate.spokenLanguages?.join(', ') || 'English (Native)'}

Create a properly formatted languages section using ONLY the candidate's actual languages. Format each language as:
• **[Language Name]** - [Proficiency Level]

Use these proficiency levels: Native, Professional, Conversational, Basic

If only English is mentioned or no specific languages provided, show:
• **English** - Native

Do NOT include placeholder text, brackets, or example languages. Use only real data.
Return ONLY the formatted language list, nothing else.`,

  'PROFESSIONAL EXPERIENCES SUMMARY': (candidate: CandidateData, job?: JobDescription) => `
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

  'PROFESSIONAL EXPERIENCE': (candidate: CandidateData, job?: JobDescription, experienceIndex: number = 0) => `
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
  improve: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
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

  expand: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
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

  rewrite: (section: string, existingContent: string, candidateData: CandidateData, jobData?: JobDescription) => `
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
      
      prompt = ENHANCEMENT_PROMPTS[actualEnhancementAction](mappedSection, actualExistingContent, candidateData, jobDescription);
      
      console.log(`📝 Enhancement prompt preview (first 500 chars):`, prompt.substring(0, 500) + '...');
    } else {
      // Use generation prompts for initial content creation
      if (mappedSection.startsWith('PROFESSIONAL EXPERIENCE ') && mappedSection !== 'PROFESSIONAL EXPERIENCES SUMMARY') {
        const experienceIndex = parseInt(mappedSection.split(' ')[2]) - 1;
        console.log(`🔄 Processing dynamic professional experience: index ${experienceIndex}`);
        console.log(`📋 Candidate experience data:`, JSON.stringify(candidateData.experience || candidateData.workHistory || [], null, 2));
        console.log(`🎯 Target experience at index ${experienceIndex}:`, JSON.stringify(candidateData.experience?.[experienceIndex] || candidateData.workHistory?.[experienceIndex] || 'NOT FOUND', null, 2));
        prompt = SECTION_PROMPTS['PROFESSIONAL EXPERIENCE'](candidateData, jobDescription, experienceIndex);
      } else if (SECTION_PROMPTS[mappedSection as keyof typeof SECTION_PROMPTS]) {
        console.log(`🔄 Processing standard section: ${mappedSection}`);
        if (mappedSection === 'PROFESSIONAL EXPERIENCES SUMMARY') {
          console.log(`📋 Experience data for summary:`, JSON.stringify(candidateData.experience || candidateData.workHistory || [], null, 2));
        }
        prompt = SECTION_PROMPTS[mappedSection as keyof typeof SECTION_PROMPTS](candidateData, jobDescription);
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