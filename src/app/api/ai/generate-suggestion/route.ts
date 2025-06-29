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
- Generate content SPECIFIC to the ${sectionType.toUpperCase()} section ONLY
- DO NOT include content from other sections
- Use proper bullet points (•) and bold text (**text**) for structure
- Follow the exact format specified for this section
- Make content professional, detailed, and compelling
- Base content on the candidate's actual data when available
- Return ONLY the formatted content for this section, no explanations
- Make the content rich and comprehensive with specific details`;

  switch (sectionType) {
    case 'header':
      return `${baseInstructions}

SECTION: HEADER (Personal Information Only)
Generate ONLY header/contact information with:
- Full name (large, prominent)
- Role title 
- Years of experience
- Location
- Contact details if available

Format:
**${candidateContext.includes('Name:') ? candidateContext.split('Name:')[1].split('\n')[0].trim() : '[Full Name]'}**
${candidateContext.includes('Current Title:') ? candidateContext.split('Current Title:')[1].split('\n')[0].trim() : '[Role Title]'}
${candidateContext.includes('Experience Level:') ? candidateContext.split('Experience Level:')[1].split('\n')[0].trim() : '[X]+ years'} of experience
${candidateContext.includes('Location:') ? candidateContext.split('Location:')[1].split('\n')[0].trim() : '[Location]'}

DO NOT include summary, skills, or experience details here.`;

    case 'summary':
      return `${baseInstructions}

SECTION: PROFESSIONAL SUMMARY (Executive Overview Only)
Generate a compelling 4-5 sentence professional summary that:
- Opens with years of experience and core expertise
- Highlights 3-4 key technical competencies
- Emphasizes leadership and strategic capabilities
- Mentions industry experience or domain expertise
- Concludes with value proposition and career focus

Write as a flowing paragraph. Focus ONLY on high-level professional identity.
DO NOT include specific technical skills lists or detailed experience.

Example style:
"Seasoned [Role] with [X]+ years of experience in [domain]. Expert in [key technologies/methodologies] with proven track record of [type of achievements]. Demonstrated leadership in [areas] and strategic expertise in [domains]. Passionate about [professional focus] and committed to [value proposition]."`;

    case 'functional-skills':
      return `${baseInstructions}

SECTION: FUNCTIONAL SKILLS (Comprehensive Professional Competencies)
Generate categorized functional/soft skills with detailed explanations covering ALL functional areas:

**Leadership & Team Management**
• Cross-functional team leadership and mentoring
• Agile coaching and team development
• Stakeholder management and communication
• Change management and organizational transformation
• Conflict resolution and team motivation

Proven ability to lead diverse teams through complex transformations, fostering collaboration and driving high-performance cultures. Expert in agile methodologies and continuous improvement practices.

**Project & Program Management**
• Project lifecycle management (initiation to closure)
• Agile, Scrum, Kanban, and Waterfall methodologies
• Resource allocation and budget management
• Risk identification, assessment, and mitigation
• Timeline management and milestone tracking
• Vendor and contractor management

Strategic project leader with expertise in delivering complex initiatives on time and within budget. Skilled in managing multiple concurrent projects while ensuring quality and stakeholder satisfaction.

**Business Analysis & Strategy**
• Requirements gathering and documentation
• Business process analysis and optimization
• Stakeholder analysis and management
• Gap analysis and solution design
• Strategic planning and roadmap development
• Market research and competitive analysis

Expert business analyst with proven ability to translate business needs into actionable solutions. Skilled in identifying opportunities for process improvement and operational efficiency.

**Communication & Collaboration**
• Executive presentation and reporting
• Technical documentation and knowledge transfer
• Cross-cultural communication and global team coordination
• Client relationship management and consulting
• Training and workshop facilitation
• Public speaking and conference presentations

Exceptional communicator with ability to convey complex technical concepts to diverse audiences. Expert in building consensus and driving alignment across organizational levels.

**Problem-Solving & Innovation**
• Root cause analysis and systematic problem-solving
• Design thinking and creative solution development
• Process improvement and optimization
• Innovation management and idea generation
• Critical thinking and analytical reasoning
• Decision-making under uncertainty

Innovative problem-solver with track record of identifying creative solutions to complex business challenges. Expert in applying structured methodologies to drive continuous improvement.

**Quality Assurance & Compliance**
• Quality management systems and processes
• Regulatory compliance and audit preparation
• Standard operating procedures development
• Performance monitoring and KPI management
• Continuous improvement and lean methodologies
• Risk management and control frameworks

Focus on management, leadership, analytical, and process skills. DO NOT include technical tools or programming languages.`;

    case 'technical-skills':
      return `${baseInstructions}

SECTION: TECHNICAL SKILLS (Technology & Tools Expertise)
Generate categorized technical competencies with detailed explanations:

**Programming & Development**
• ${candidateContext.includes('Core Skills:') ? 
  candidateContext.split('Core Skills:')[1].split('\n')[0].split(',').slice(0, 4).map(s => s.trim()).join(', ') : 
  'JavaScript, Python, Java, TypeScript'}
• Modern frameworks and libraries
• API design and microservices architecture
• Code quality and testing methodologies

Extensive experience in full-stack development with expertise in modern programming paradigms. Proficient in building scalable, maintainable applications using industry best practices.

**Cloud & Infrastructure**
• AWS, Azure, Google Cloud Platform
• Docker, Kubernetes, containerization
• CI/CD pipelines and DevOps practices
• Infrastructure as Code (Terraform, CloudFormation)

Deep expertise in cloud-native architectures and modern deployment strategies. Skilled in designing resilient, scalable infrastructure solutions that support business growth.

**Data & Analytics**
• Database design and optimization (SQL, NoSQL)
• Data pipeline development and ETL processes
• Business intelligence and reporting tools
• Machine learning and data science frameworks

Proven ability to architect and implement data solutions that drive business insights. Expert in transforming raw data into actionable intelligence through advanced analytics.

Focus on technical tools, programming languages, and platforms. DO NOT include soft skills or management capabilities.`;

    case 'areas-of-expertise':
      return `${baseInstructions}

SECTION: AREAS OF EXPERTISE (Industry Domains)
Generate 4-6 specific industry/domain expertise areas:

${candidateContext.includes('Education:') && candidateContext.includes('finance') ? 'Financial Services' : 'Information Technology'}
Digital Transformation & Innovation
${candidateContext.includes('consulting') ? 'Strategic Consulting' : 'Enterprise Software Development'}
${candidateContext.includes('bank') || candidateContext.includes('financial') ? 'Banking & Capital Markets' : 'Cloud Computing & Architecture'}
Data Analytics & Business Intelligence
${candidateContext.includes('healthcare') ? 'Healthcare Technology' : 'Agile Methodologies & DevOps'}

Each line should be a specific domain or industry area. Base on candidate's background.
DO NOT include technical skills or tools here.`;

    case 'education':
      return `${baseInstructions}

SECTION: EDUCATION (Academic Background)
Generate educational background with relevant details:

• **${candidateContext.includes('Education:') ? 
  candidateContext.split('Education:')[1].split('\n')[0].split(',')[0].trim() : 
  'Master of Science in Computer Science'}** - [University Name] ([Year])
• **Bachelor's Degree** - [Institution] ([Year])
• **Professional Development** - Advanced certifications in relevant technologies
• **Continuing Education** - Industry workshops and specialized training programs

Include relevant coursework, academic achievements, or thesis topics if applicable.
Focus ONLY on formal education and academic qualifications.`;

    case 'certifications':
      return `${baseInstructions}

SECTION: CERTIFICATIONS (Professional Credentials)
Generate relevant professional certifications:

• **AWS Certified Solutions Architect** - Amazon Web Services (2023)
• **Certified Scrum Master (CSM)** - Scrum Alliance (2022)
• **Project Management Professional (PMP)** - PMI (2021)
• **Google Cloud Professional Developer** - Google Cloud (2023)
• **Microsoft Azure Fundamentals** - Microsoft (2022)
• **ITIL Foundation** - AXELOS (2021)

Base certifications on candidate's technical skills and experience level.
Include relevant dates and issuing organizations.
Focus ONLY on professional certifications and credentials.`;

    case 'languages':
      return `${baseInstructions}

SECTION: LANGUAGES (Communication Skills)
Generate language proficiencies in a clean format:

**English** (Native/Professional) | **French** (Professional) | **Spanish** (Conversational) | **German** (Basic)

Or in list format:
• English - Native/Professional proficiency
• French - Professional working proficiency  
• Spanish - Conversational proficiency
• German - Basic proficiency

Base on candidate's location and background. Include proficiency levels.
Focus ONLY on spoken/written languages.`;

    case 'experiences-summary':
      return `${baseInstructions}

SECTION: PROFESSIONAL EXPERIENCES SUMMARY (Career Timeline)
Generate concise one-line summaries for each role:

**Senior Software Engineer** – TechCorp Solutions (2020 - Present)
**Software Developer** – Innovation Labs (2018 - 2020)  
**Junior Developer** – StartupTech (2016 - 2018)
**Software Engineering Intern** – Global Systems (2015 - 2016)

Each line should include: **Job Title** – Company Name (Start Date - End Date)
Keep each line concise and professional.
Focus ONLY on job titles, companies, and dates.`;

    case 'experience':
      return `${baseInstructions}

SECTION: DETAILED PROFESSIONAL EXPERIENCE (Single Role Detail)
Generate ONE detailed experience block with this EXACT structure:

**TechCorp Solutions**
Senior Software Engineer
January 2020 - Present

**Company Description/Context**
Leading technology consultancy specializing in enterprise digital transformation and cloud migration solutions. Serves Fortune 500 clients across financial services, healthcare, and retail sectors with innovative software solutions.

**Key Responsibilities**
• Lead development of scalable microservices architecture serving 10M+ daily users
• Mentor team of 8 junior developers and coordinate cross-functional initiatives
• Design and implement CI/CD pipelines reducing deployment time by 75%
• Collaborate with product managers and stakeholders to define technical requirements
• Conduct code reviews and establish development best practices across teams

**Major Achievements**
• Architected cloud migration strategy that reduced infrastructure costs by 40%
• Delivered critical e-commerce platform upgrade ahead of schedule, increasing revenue by $2M annually
• Implemented automated testing framework improving code quality and reducing bugs by 60%
• Led emergency response team during system outages, achieving 99.9% uptime SLA

**Technical Environment**
• Languages: Java, Python, JavaScript, TypeScript
• Frameworks: Spring Boot, React, Node.js, Angular
• Cloud: AWS (EC2, Lambda, RDS, S3), Docker, Kubernetes
• Tools: Jenkins, Git, JIRA, Confluence

Generate this structure for the most recent/relevant experience with specific, quantifiable details.`;

    default:
      return `${baseInstructions}

Generate professional, detailed content for the ${sectionType} section based on the candidate information provided.
Make it specific to this section type and avoid generic descriptions.`;
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
      contentLength: currentContent?.length || 0,
      hasJobDescription: !!jobDescription
    });

    let prompt = '';
    let systemPrompt = `You are an expert HR professional and executive resume writer with 15+ years of experience. You specialize in creating compelling, ATS-optimized competence files that highlight candidates' unique value propositions and achievements.

CRITICAL: You MUST generate content specific to the ${sectionType.toUpperCase()} section ONLY. Do not mix content from other sections.`;
    
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
${candidateData.experience && candidateData.experience.length > 0 ? `
- Recent Experience: ${candidateData.experience[0]?.company} - ${candidateData.experience[0]?.title}` : ''}
${jobDescription ? `

Target Job Context:
- Job Title: ${jobDescription.title || 'Not specified'}
- Company: ${jobDescription.company || 'Not specified'}
- Key Requirements: ${jobDescription.requirements?.slice(0, 5).join(', ') || 'Not specified'}
- Required Skills: ${jobDescription.skills?.slice(0, 8).join(', ') || 'Not specified'}
- Main Responsibilities: ${jobDescription.responsibilities?.slice(0, 3).join(', ') || 'Not specified'}

IMPORTANT: Tailor the content to align with the job requirements while staying truthful to the candidate's actual experience. Emphasize relevant skills and experiences that match the job needs.` : ''}
`;

    console.log('📋 Candidate Context for Section:', sectionType, {
      candidateName: candidateData.fullName,
      title: candidateData.currentTitle,
      skillsCount: candidateData.skills?.length || 0,
      experienceCount: candidateData.experience?.length || 0,
      hasJobDescription: !!jobDescription
    });

    switch (type) {
      case 'generate':
        prompt = generateStructuredContentPrompt(sectionType, candidateContext);
        console.log('🎯 Generated Prompt for', sectionType, '(length:', prompt.length, ')');
        console.log('📝 Prompt Preview:', prompt.substring(0, 200) + '...');
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
6. **Specificity**: Add concrete examples and measurable results

GUIDELINES:
- Keep the same factual information but enhance presentation
- Use metrics and numbers where possible (even if estimated reasonably)
- Eliminate weak language and filler words
- Make every sentence add value
- Maintain authenticity while maximizing impact
- Stay focused on ${sectionType} content only

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
6. **Comprehensive Coverage**: Ensure all relevant aspects are covered thoroughly

EXPANSION STRATEGIES:
- Add specific examples of projects or achievements
- Include relevant certifications or training
- Mention collaboration with cross-functional teams
- Describe problem-solving approaches and methodologies
- Add context about scale, complexity, or business impact
- Include industry-specific terminology and frameworks

Return ONLY the expanded content with proper formatting. Maintain professional tone throughout.
Focus exclusively on ${sectionType} content.`;
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
6. **Compelling Narrative**: Create a story that showcases growth and impact

REWRITE APPROACHES:
- Lead with most impressive achievements
- Use industry-specific terminology and frameworks
- Emphasize leadership and strategic thinking
- Include soft skills and emotional intelligence
- Position for career advancement and growth
- Create compelling, results-oriented narrative

Return ONLY the rewritten content with proper formatting. Create a compelling narrative that positions the candidate as a top-tier professional.
Focus exclusively on ${sectionType} content.`;
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid suggestion type' }, { status: 400 });
    }

    console.log('🚀 Sending request to OpenAI for section:', sectionType, 'with prompt length:', prompt.length);

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
      max_tokens: 1000,
      temperature: 0.7,
    });

    const suggestion = completion.choices[0]?.message?.content;

    if (!suggestion) {
      console.error('❌ No suggestion generated from OpenAI for section:', sectionType);
      return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
    }

    console.log('✅ AI suggestion generated successfully for section:', sectionType, {
      type,
      suggestionLength: suggestion.length,
      preview: suggestion.substring(0, 150) + '...',
      containsGenericText: suggestion.includes('Comprehensive academic foundation') || suggestion.includes('Professional excellence')
    });

    // Additional debugging to catch generic content
    if (suggestion.includes('Comprehensive academic foundation') || 
        suggestion.includes('Professional excellence') ||
        suggestion.includes('theoretical knowledge and practical skills')) {
      console.warn('⚠️ WARNING: Generic content detected in', sectionType, 'section!');
      console.warn('🔍 Full suggestion:', suggestion);
    }

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('❌ Error generating AI suggestion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 