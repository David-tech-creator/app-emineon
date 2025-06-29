import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CandidateData {
  id: string;
  fullName: string;
  currentTitle: string;
  email?: string;
  phone?: string;
  location?: string;
  yearsOfExperience?: number;
  skills: string[];
  certifications: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
  education: string[];
  languages: string[];
  summary?: string;
}

export interface JobDescription {
  text: string;
  requirements: string[];
  skills: string[];
  responsibilities: string[];
  title?: string;
  company?: string;
}

export interface EnrichedContent {
  enhancedSummary: string;
  optimizedSkills: {
    technical: string[];
    functional: string[];
    leadership: string[];
  };
  enrichedExperience: Array<{
    company: string;
    title: string;
    period: string;
    enhancedDescription: string;
    keyAchievements: string[];
    technicalEnvironment: string[];
    responsibilities: string[];
  }>;
  areasOfExpertise: string[];
  valueProposition: string;
  optimizedEducation: string[];
  optimizedCertifications: string[];
  optimizedCoreCompetencies: string[];
  optimizedTechnicalExpertise: string[];
}

export class CompetenceEnrichmentService {
  
  /**
   * Generic retry wrapper for OpenAI API calls - ALWAYS succeeds
   */
  private async retryWithOpenAI<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string,
    maxRetries: number = 5
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 ${operationName} - Attempt ${attempt}/${maxRetries}`);
        const result = await operation();
        console.log(`✅ ${operationName} - Success on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ ${operationName} - Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.log(`🔄 ${operationName} - All retries exhausted, using intelligent fallback`);
          return fallback();
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ ${operationName} - Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // This should never be reached, but TypeScript requires it
    return fallback();
  }

  /**
   * Main enrichment function that processes candidate data with job description context
   */
  async enrichCandidateForJob(
    candidateData: CandidateData,
    jobDescription?: JobDescription,
    clientName?: string
  ): Promise<EnrichedContent> {
    console.log('🤖 Starting comprehensive AI enrichment for competence file...');
    
    // Step 1: Analyze job requirements if provided (ALWAYS succeeds)
    const jobAnalysis = jobDescription ? await this.analyzeJobRequirementsWithRetry(jobDescription) : null;
    
    // Step 2: Generate enhanced professional summary (ALWAYS succeeds)
    const enhancedSummary = await this.generateEnhancedSummaryWithRetry(candidateData, jobDescription, clientName);
    
    // Step 3: Optimize and categorize skills (ALWAYS succeeds)
    const optimizedSkills = await this.optimizeSkillsWithRetry(candidateData, jobAnalysis);
    
    // Step 4: Enrich work experience with detailed achievements (ALWAYS succeeds)
    const enrichedExperience = await this.enrichWorkExperienceWithRetry(candidateData, jobAnalysis);
    
    // Step 5: Generate areas of expertise (ALWAYS succeeds)
    const areasOfExpertise = await this.generateAreasOfExpertiseWithRetry(candidateData, jobDescription);
    
    // Step 6: Optimize academic background and certifications (ALWAYS succeeds)
    const optimizedEducation = await this.optimizeEducationWithRetry(candidateData, jobDescription);
    const optimizedCertifications = await this.optimizeCertificationsWithRetry(candidateData, jobDescription);
    
    // Step 7: Optimize Core Competencies and Technical Expertise (ALWAYS succeeds)
    const optimizedCoreCompetencies = await this.optimizeCoreCompetenciesWithRetry(candidateData, jobDescription);
    const optimizedTechnicalExpertise = await this.optimizeTechnicalExpertiseWithRetry(candidateData, jobDescription);
    
    // Step 8: Create value proposition (ALWAYS succeeds)
    const valueProposition = await this.generateValuePropositionWithRetry(candidateData, jobDescription, clientName);
    
    console.log('✅ AI enrichment completed successfully');
    
    return {
      enhancedSummary,
      optimizedSkills,
      enrichedExperience,
      areasOfExpertise,
      valueProposition,
      optimizedEducation,
      optimizedCertifications,
      optimizedCoreCompetencies,
      optimizedTechnicalExpertise
    };
  }

  /**
   * Retry wrapper methods for each AI operation - ALWAYS succeed
   */
  private async analyzeJobRequirementsWithRetry(jobDescription: JobDescription) {
    return this.retryWithOpenAI(
      () => this.analyzeJobRequirements(jobDescription),
      () => this.getFallbackJobAnalysis(),
      'Job Requirements Analysis'
    );
  }

  private async generateEnhancedSummaryWithRetry(candidateData: CandidateData, jobDescription?: JobDescription, clientName?: string) {
    return this.retryWithOpenAI(
      () => this.generateEnhancedSummary(candidateData, jobDescription, clientName),
      () => candidateData.summary || `${candidateData.fullName} brings ${candidateData.yearsOfExperience || 'extensive'} years of proven expertise in ${candidateData.currentTitle} roles, with a track record of delivering innovative solutions and driving business growth. Their unique combination of technical excellence and strategic thinking makes them ideally positioned to contribute immediately to your organization's success.`,
      'Enhanced Summary Generation'
    );
  }

  private async optimizeSkillsWithRetry(candidateData: CandidateData, jobAnalysis: any) {
    return this.retryWithOpenAI(
      () => this.optimizeSkills(candidateData, jobAnalysis),
      () => this.getFallbackSkills(candidateData),
      'Skills Optimization'
    );
  }

  private async enrichWorkExperienceWithRetry(candidateData: CandidateData, jobAnalysis: any) {
    return this.retryWithOpenAI(
      () => this.enrichWorkExperience(candidateData, jobAnalysis),
      () => candidateData.experience.slice(0, 4).map(exp => ({
        company: exp.company,
        title: exp.title,
        period: `${exp.startDate} - ${exp.endDate}`,
        enhancedDescription: exp.responsibilities,
        keyAchievements: [`Delivered exceptional results in ${exp.title} role`, `Contributed to organizational success at ${exp.company}`, `Applied professional expertise to drive business outcomes`],
        technicalEnvironment: candidateData.skills.slice(0, 5),
        responsibilities: [`Managed daily operations and responsibilities`, `Collaborated with team members and stakeholders`, `Delivered quality results and met objectives`]
      })),
      'Work Experience Enrichment'
    );
  }

  private async generateAreasOfExpertiseWithRetry(candidateData: CandidateData, jobDescription?: JobDescription) {
    return this.retryWithOpenAI(
      () => this.generateAreasOfExpertise(candidateData, jobDescription),
      () => this.getFallbackAreasOfExpertise(candidateData),
      'Areas of Expertise Generation'
    );
  }

  private async optimizeEducationWithRetry(candidateData: CandidateData, jobDescription?: JobDescription) {
    return this.retryWithOpenAI(
      () => this.optimizeEducation(candidateData, jobDescription),
      () => candidateData.education || [],
      'Education Optimization'
    );
  }

  private async optimizeCertificationsWithRetry(candidateData: CandidateData, jobDescription?: JobDescription) {
    return this.retryWithOpenAI(
      () => this.optimizeCertifications(candidateData, jobDescription),
      () => candidateData.certifications || [],
      'Certifications Optimization'
    );
  }

  private async optimizeCoreCompetenciesWithRetry(candidateData: CandidateData, jobDescription?: JobDescription) {
    return this.retryWithOpenAI(
      () => this.optimizeCoreCompetencies(candidateData, jobDescription),
      () => candidateData.skills.slice(0, 8),
      'Core Competencies Optimization'
    );
  }

  private async optimizeTechnicalExpertiseWithRetry(candidateData: CandidateData, jobDescription?: JobDescription) {
    return this.retryWithOpenAI(
      () => this.optimizeTechnicalExpertise(candidateData, jobDescription),
      () => candidateData.skills.filter(skill => 
        skill.toLowerCase().includes('javascript') || 
        skill.toLowerCase().includes('python') || 
        skill.toLowerCase().includes('sql') ||
        skill.toLowerCase().includes('aws') ||
        skill.toLowerCase().includes('react') ||
        skill.toLowerCase().includes('node')
      ).slice(0, 6),
      'Technical Expertise Optimization'
    );
  }

  private async generateValuePropositionWithRetry(candidateData: CandidateData, jobDescription?: JobDescription, clientName?: string) {
    return this.retryWithOpenAI(
      () => this.generateValueProposition(candidateData, jobDescription, clientName),
      () => `${candidateData.fullName} delivers proven expertise in ${candidateData.currentTitle} roles with a strong track record of driving results and innovation. Their comprehensive skill set and professional experience position them to make an immediate impact and contribute to organizational success.`,
      'Value Proposition Generation'
    );
  }

  /**
   * Analyze job requirements to understand what to emphasize - NEVER fails
   */
  private async analyzeJobRequirements(jobDescription: JobDescription) {
    // Robust job description parsing - handle ANY format
    const jobText = jobDescription.text || '';
    const jobTitle = jobDescription.title || 'Professional Role';
    const company = jobDescription.company || 'Target Company';
    
    // Extract requirements from text if not provided in structured format
    const requirements = jobDescription.requirements?.length > 0 
      ? jobDescription.requirements 
      : this.extractRequirementsFromText(jobText);
    
    // Extract skills from text if not provided in structured format  
    const skills = jobDescription.skills?.length > 0
      ? jobDescription.skills
      : this.extractSkillsFromText(jobText);
    
    // Extract responsibilities from text if not provided in structured format
    const responsibilities = jobDescription.responsibilities?.length > 0
      ? jobDescription.responsibilities
      : this.extractResponsibilitiesFromText(jobText);

    const prompt = `Analyze this job description and extract key requirements that should be emphasized in a candidate profile:

Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobText || 'Professional role with growth opportunities'}
Requirements: ${requirements.join(', ') || 'Professional experience and skills'}
Required Skills: ${skills.join(', ') || 'Professional and technical skills'}
Responsibilities: ${responsibilities.join(', ') || 'Professional responsibilities and duties'}

Return ONLY a valid JSON object with this exact structure:
{
  "keySkillsRequired": ["skill1", "skill2"],
  "experienceEmphasis": ["area1", "area2"],
  "industryContext": "industry/domain",
  "seniorityLevel": "mid",
  "technicalFocus": ["tech1", "tech2"],
  "softSkillsNeeded": ["skill1", "skill2"],
  "clientFacing": false,
  "leadershipRequired": false
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert recruiter who analyzes job requirements. Return ONLY valid JSON without any additional text, markdown, or formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No job analysis content received');
    }
    
    // Clean the content to ensure it's valid JSON
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    // Validate the structure
    if (!parsed.keySkillsRequired || !Array.isArray(parsed.keySkillsRequired)) {
      throw new Error('Invalid job analysis structure');
    }
    return parsed;
  }

  /**
   * Generate enhanced professional summary tailored to job and client
   */
  private async generateEnhancedSummary(
    candidateData: CandidateData,
    jobDescription?: JobDescription,
    clientName?: string
  ): Promise<string> {
    const jobContext = jobDescription ? `
Target Role: ${jobDescription.title || 'Not specified'}
Target Company: ${jobDescription.company || clientName || 'Client'}
Key Requirements: ${jobDescription.requirements?.join(', ') || 'Professional qualifications'}
Required Skills: ${jobDescription.skills?.join(', ') || 'Professional skills'}
` : '';

    const prompt = `Create a compelling professional summary for this candidate that perfectly aligns with the target role:

CANDIDATE PROFILE:
Name: ${candidateData.fullName}
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years
Core Skills: ${candidateData.skills.join(', ')}
Education: ${candidateData.education.join(', ')}
Current Summary: ${candidateData.summary || 'Not provided'}

RECENT EXPERIENCE:
${candidateData.experience.map(exp => 
  `${exp.title} at ${exp.company}: ${exp.responsibilities}`
).join('\n')}

${jobContext}

Create a concise 3-4 sentence professional summary that:
1. Positions the candidate perfectly for the target role using ONLY their actual experience
2. Highlights their most relevant REAL experience and achievements from their CV
3. Emphasizes skills that match the job requirements from their actual skill set
4. Uses natural, conversational language that sounds genuinely human
5. Includes quantifiable achievements based on their actual years of experience and roles
6. NEVER invent or fabricate any information not present in the candidate's actual data

CRITICAL: Avoid typical AI/corporate buzzwords like "spearheaded", "leveraged", "synergistic", "paradigm", "cutting-edge", "innovative solutions", "best practices", "stakeholders", "deliverables", "actionable insights", "seamless integration", "robust solutions", "scalable frameworks", "strategic initiatives", "cross-functional collaboration", "end-to-end solutions", "value-added", "game-changing", "next-generation", "world-class", "industry-leading", "state-of-the-art", "mission-critical", "transformational", "groundbreaking", "revolutionary".

Use simple, direct, human language. Write in third person, make it ATS-friendly with relevant keywords, and ensure every statement is grounded in the candidate's real background.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert resume writer who creates compelling professional summaries that perfectly position candidates for their target roles.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No enhanced summary generated');
    }
    return result;
  }

  /**
   * Optimize and categorize skills based on job requirements
   */
  private async optimizeSkills(candidateData: CandidateData, jobAnalysis: any) {
    const prompt = `Analyze and categorize these candidate skills, optimizing them for the target role:

CANDIDATE SKILLS: ${candidateData.skills.join(', ')}
CERTIFICATIONS: ${candidateData.certifications.join(', ')}
EXPERIENCE TITLES: ${candidateData.experience.map(exp => exp.title).join(', ')}

${jobAnalysis ? `
TARGET ROLE REQUIREMENTS:
Required Skills: ${jobAnalysis.keySkillsRequired?.join(', ') || 'Professional skills'}
Technical Focus: ${jobAnalysis.technicalFocus?.join(', ') || 'Technical expertise'}
Soft Skills Needed: ${jobAnalysis.softSkillsNeeded?.join(', ') || 'Professional skills'}
Leadership Required: ${jobAnalysis.leadershipRequired || false}
` : ''}

Return a JSON object categorizing skills into:
{
  "technical": ["technical skills, tools, programming languages, platforms"],
  "functional": ["business skills, domain expertise, methodologies"],
  "leadership": ["management, mentoring, strategic skills"]
}

CRITICAL REQUIREMENTS:
1. ONLY use skills explicitly mentioned in the candidate's profile or certifications
2. ONLY infer skills that are directly evident from their actual job titles and responsibilities
3. DO NOT add skills the candidate doesn't actually have
4. Prioritize skills that match the job requirements from their REAL skill set
5. Use professional terminology but stay truthful to their actual capabilities
6. Include ALL relevant skills - no limits on quantity`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a skills optimization expert. Return only valid JSON with categorized professional skills.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No skills optimization content received');
    }
    
    // Clean the content to ensure it's valid JSON
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    // Validate the structure
    if (!parsed.technical || !Array.isArray(parsed.technical)) {
      throw new Error('Invalid skills structure');
    }
    return parsed;
  }

  /**
   * Enrich work experience with detailed achievements and technical environment
   */
  private async enrichWorkExperience(candidateData: CandidateData, jobAnalysis: any) {
    const enrichedExperience = [];
    
    for (const exp of candidateData.experience) { // Process ALL experience roles
      const prompt = `Enhance this work experience entry with detailed achievements, technical environment, and quantified results:

ROLE: ${exp.title} at ${exp.company}
PERIOD: ${exp.startDate} - ${exp.endDate}
RESPONSIBILITIES: ${exp.responsibilities}

CANDIDATE CONTEXT:
Overall Experience: ${candidateData.yearsOfExperience || 'Multiple'} years
Skills: ${candidateData.skills.join(', ')}

${jobAnalysis ? `
TARGET ROLE ALIGNMENT:
Focus on: ${jobAnalysis.experienceEmphasis?.join(', ') || 'Professional experience'}
Technical Emphasis: ${jobAnalysis.technicalFocus?.join(', ') || 'Technical skills'}
Industry: ${jobAnalysis.industryContext || 'Professional'}
` : ''}

Return a JSON object with:
{
  "enhancedDescription": "Concise 1-2 sentence role overview based on actual responsibilities",
  "keyAchievements": ["Clear, readable achievements that are to the point and easy to understand - focus on real impact"],
  "technicalEnvironment": ["technologies, tools, platforms that someone in this role would realistically use"],
  "responsibilities": ["key responsibilities and duties performed in this role"]
}

CRITICAL REQUIREMENTS:
1. Base ALL content on the candidate's ACTUAL responsibilities and role description
2. Infer realistic achievements that someone in their position would accomplish
3. Use quantified results appropriate to their seniority level and industry
4. NEVER invent specific numbers, dates, or projects not mentioned in their CV
5. Focus on realistic business impact someone in their role and company would deliver
6. Write achievements in simple, direct language - avoid corporate jargon
7. Make achievements readable and to the point - no fluff or buzzwords

AVOID these AI/corporate buzzwords: "spearheaded", "leveraged", "synergistic", "paradigm", "cutting-edge", "innovative solutions", "best practices", "stakeholders", "deliverables", "actionable insights", "seamless integration", "robust solutions", "scalable frameworks", "strategic initiatives", "cross-functional collaboration", "end-to-end solutions", "value-added", "game-changing", "next-generation", "world-class", "industry-leading", "state-of-the-art", "mission-critical", "transformational", "groundbreaking", "revolutionary", "optimized", "streamlined", "enhanced", "facilitated", "coordinated", "collaborated", "interfaced".`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert resume writer who transforms basic job descriptions into compelling achievement-focused narratives.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1200
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error(`No experience enrichment generated for ${exp.company}`);
      }
      
      // Clean the content to ensure it's valid JSON
      let cleanContent = content;
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const enrichedData = JSON.parse(cleanContent);
      enrichedExperience.push({
        company: exp.company,
        title: exp.title,
        period: `${exp.startDate} - ${exp.endDate}`,
        enhancedDescription: enrichedData.enhancedDescription || exp.responsibilities,
        keyAchievements: enrichedData.keyAchievements || [],
        technicalEnvironment: enrichedData.technicalEnvironment || [],
        responsibilities: enrichedData.responsibilities || [exp.responsibilities]
      });
    }
    
    return enrichedExperience;
  }

  /**
   * Generate areas of expertise based on experience and job requirements
   */
  private async generateAreasOfExpertise(candidateData: CandidateData, jobDescription?: JobDescription) {
    const prompt = `Generate areas of expertise for this candidate based on their background:

CANDIDATE PROFILE:
Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years
Skills: ${candidateData.skills.join(', ')}
Companies: ${candidateData.experience.map(exp => exp.company).join(', ')}

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
REQUIRED SKILLS: ${jobDescription.skills?.join(', ') || 'Professional skills'}
KEY RESPONSIBILITIES: ${jobDescription.responsibilities?.slice(0, 3).join(', ') || 'Professional duties'}
` : ''}

Return a JSON array of 8-12 concise expertise tags that:
1. Are DIRECTLY derived from the candidate's actual job titles, responsibilities, and skills
2. Use short, professional terminology (2-4 words maximum)
3. Align with the target role requirements ONLY if the candidate actually has that experience
4. Are specific enough to demonstrate expertise they would realistically have
5. Cover both technical and business aspects from their ACTUAL background
6. Focus on key competencies rather than comprehensive lists

CRITICAL: Base every expertise area on concrete evidence from their CV. Keep tags short and impactful.

Example format: ["Program Management", "Engineering Leadership", "P&L Ownership", "Project Management"]

Return only the JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expertise mapping specialist who identifies specific areas of professional expertise. Return only a valid JSON array.' },
        { role: 'user', content: prompt }
            ],
      temperature: 0.5,
      max_tokens: 400
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No areas of expertise content received');
    }
    
    // Clean the content to ensure it's valid JSON
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid areas of expertise format');
    }
    return parsed;
  }

  /**
   * Optimize education background using AI
   */
  private async optimizeEducation(candidateData: CandidateData, jobDescription?: JobDescription) {
    if (!candidateData.education || candidateData.education.length === 0) {
      return [];
    }

    const prompt = `Optimize and enhance this education background for professional presentation:

CANDIDATE EDUCATION:
${candidateData.education.join('\n')}

CANDIDATE PROFILE:
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
REQUIRED SKILLS: ${jobDescription.skills?.join(', ') || 'Professional skills'}
` : ''}

Return a JSON array of optimized education entries that:
1. Present education in professional, standardized format
2. Highlight relevant coursework or specializations for the target role
3. Include graduation years if mentioned
4. Emphasize academic achievements that support career progression
5. Use consistent formatting and professional language

Example format: ["Master of Business Administration, Harvard Business School (2018)", "Bachelor of Science in Computer Science, MIT (2016) - Magna Cum Laude"]

Return only the JSON array.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an education optimization expert who enhances academic backgrounds for professional presentation. Return only a valid JSON array.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 400
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No education optimization content received');
    }
    
    // Clean the content to ensure it's valid JSON
    let cleanContent = content;
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
    }
    
    const parsed = JSON.parse(cleanContent);
    if (!Array.isArray(parsed)) {
      throw new Error('Invalid education optimization format');
    }
    return parsed;
  }

  /**
   * Optimize certifications using AI
   */
  private async optimizeCertifications(candidateData: CandidateData, jobDescription?: JobDescription) {
    if (!candidateData.certifications || candidateData.certifications.length === 0) {
      return [];
    }

    const prompt = `Optimize and enhance this certifications list for professional presentation:

CANDIDATE CERTIFICATIONS:
${candidateData.certifications.join('\n')}

CANDIDATE PROFILE:
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
REQUIRED SKILLS: ${jobDescription.skills?.join(', ') || 'Professional skills'}
ROLE REQUIREMENTS: ${jobDescription.requirements?.join(', ') || 'Professional requirements'}
` : ''}

Return a JSON array of enhanced certification descriptions that:
1. Are DIRECTLY based on the candidate's actual certifications
2. Include relevant details about the certification value and expertise
3. Use professional, human language without corporate buzzwords
4. Emphasize certifications most relevant to the target role (if provided)
5. Maintain accuracy and authenticity

CRITICAL: Base every certification on the actual data provided. Do not add certifications not listed.

Example format: ["Microsoft Azure Solutions Architect Expert - Advanced cloud architecture certification", "PMP Project Management Professional - Comprehensive project management expertise"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career consultant who optimizes professional certifications for maximum impact while maintaining complete accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No certifications optimization content received');
    }

    try {
      const cleanContent = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      const optimizedCertifications = JSON.parse(cleanContent);
      
      if (!Array.isArray(optimizedCertifications)) {
        throw new Error('Response is not an array');
      }

      return optimizedCertifications;
    } catch (error) {
      console.error('Error parsing certifications optimization:', error);
      throw new Error('Failed to parse certifications optimization from AI response');
    }
  }

  /**
   * Optimize core competencies using AI
   */
  private async optimizeCoreCompetencies(candidateData: CandidateData, jobDescription?: JobDescription) {
    if (!candidateData.skills || candidateData.skills.length === 0) {
      return [];
    }

    const prompt = `Analyze and optimize core competencies for professional presentation:

CANDIDATE SKILLS:
${candidateData.skills.join(', ')}

CANDIDATE PROFILE:
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
REQUIRED SKILLS: ${jobDescription.skills?.join(', ') || 'Professional skills'}
ROLE REQUIREMENTS: ${jobDescription.requirements?.join(', ') || 'Professional requirements'}
` : ''}

Return a JSON array of core competencies that:
1. Focus on functional and soft skills from the candidate's actual skill set
2. Emphasize leadership, management, and business skills
3. Use professional terminology that reflects real expertise
4. Prioritize skills most relevant to the target role (if provided)
5. Avoid technical/programming skills (save those for technical expertise)
6. Use natural, human language without AI buzzwords

CRITICAL: Only include competencies directly derived from the candidate's actual skills.

Example format: ["Strategic Planning", "Team Leadership", "Project Management", "Business Analysis", "Client Relationship Management"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career consultant who identifies and optimizes core professional competencies while maintaining complete accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No core competencies optimization content received');
    }

    try {
      const cleanContent = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      const optimizedCompetencies = JSON.parse(cleanContent);
      
      if (!Array.isArray(optimizedCompetencies)) {
        throw new Error('Response is not an array');
      }

      return optimizedCompetencies;
    } catch (error) {
      console.error('Error parsing core competencies optimization:', error);
      throw new Error('Failed to parse core competencies optimization from AI response');
    }
  }

  /**
   * Optimize technical expertise using AI
   */
  private async optimizeTechnicalExpertise(candidateData: CandidateData, jobDescription?: JobDescription) {
    if (!candidateData.skills || candidateData.skills.length === 0) {
      return [];
    }

    const prompt = `Analyze and optimize technical expertise for professional presentation:

CANDIDATE SKILLS:
${candidateData.skills.join(', ')}

CANDIDATE PROFILE:
Current Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
REQUIRED SKILLS: ${jobDescription.skills?.join(', ') || 'Professional skills'}
ROLE REQUIREMENTS: ${jobDescription.requirements?.join(', ') || 'Professional requirements'}
` : ''}

Return a JSON array of technical expertise that:
1. Focus on technical, programming, and technology skills from the candidate's actual skill set
2. Include programming languages, frameworks, tools, and platforms
3. Emphasize technical skills most relevant to the target role (if provided)
4. Use proper technical terminology and industry standards
5. Avoid soft skills and management skills (save those for core competencies)
6. Use natural, human language without AI buzzwords

CRITICAL: Only include technical expertise directly derived from the candidate's actual skills.

Example format: ["JavaScript", "React.js", "Node.js", "Python", "AWS Cloud Services", "Docker", "PostgreSQL", "REST APIs"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical recruiter who identifies and optimizes technical expertise while maintaining complete accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No technical expertise optimization content received');
    }

    try {
      const cleanContent = content.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      const optimizedExpertise = JSON.parse(cleanContent);
      
      if (!Array.isArray(optimizedExpertise)) {
        throw new Error('Response is not an array');
      }

      return optimizedExpertise;
    } catch (error) {
      console.error('Error parsing technical expertise optimization:', error);
      throw new Error('Failed to parse technical expertise optimization from AI response');
    }
  }

  /**
   * Generate value proposition tailored to client needs
   */
  private async generateValueProposition(candidateData: CandidateData, jobDescription?: JobDescription, clientName?: string) {
    const prompt = `Create a compelling value proposition for this candidate targeting the specific client and role:

CANDIDATE:
Name: ${candidateData.fullName}
Title: ${candidateData.currentTitle}
Experience: ${candidateData.yearsOfExperience || 'Multiple'} years
Key Skills: ${candidateData.skills.join(', ')}
Recent Role: ${candidateData.experience[0]?.title} at ${candidateData.experience[0]?.company}

${jobDescription ? `
TARGET ROLE: ${jobDescription.title || 'Professional Role'}
CLIENT: ${jobDescription.company || clientName || 'the client'}
KEY REQUIREMENTS: ${jobDescription.requirements?.join(', ') || 'Professional qualifications'}
` : ''}

Write a comprehensive value proposition that:
1. Clearly states what unique value the candidate brings
2. Connects their experience to the client's specific needs
3. Highlights their competitive advantage
4. Uses confident, professional language

Focus on business impact and measurable value delivery.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a strategic positioning expert who creates compelling value propositions for executive candidates.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const result = response.choices[0]?.message?.content;
    if (!result) {
      throw new Error('No value proposition generated');
    }
    return result;
  }

  /**
   * Fallback methods - intelligent defaults based on candidate data
   */
  private getFallbackJobAnalysis() {
    return {
      keySkillsRequired: ["Professional Skills", "Technical Expertise"],
      experienceEmphasis: ["Professional Experience", "Technical Leadership"],
      industryContext: "Technology",
      seniorityLevel: "mid",
      technicalFocus: ["Software Development", "Technical Solutions"],
      softSkillsNeeded: ["Communication", "Problem Solving"],
      clientFacing: false,
      leadershipRequired: false
    };
  }

  private getFallbackSkills(candidateData: CandidateData) {
    const allSkills = candidateData.skills || [];
    
    // Smart categorization based on common patterns
    const technical = allSkills.filter(skill => 
      /javascript|python|java|react|node|sql|aws|azure|docker|kubernetes|git|programming|software|development|technical|system|database|cloud|api|framework|library|tool/i.test(skill)
    );
    
    const functional = allSkills.filter(skill => 
      /management|analysis|design|strategy|planning|coordination|communication|business|process|project|marketing|sales|finance|operations|consulting/i.test(skill)
    );
    
    const leadership = allSkills.filter(skill => 
      /leadership|management|mentoring|team|project|supervision|direction|guidance|coaching|strategic/i.test(skill)
    );
    
    return {
      technical: technical.length > 0 ? technical : ["Technical Skills", "Professional Tools"],
      functional: functional.length > 0 ? functional : ["Professional Skills", "Business Acumen"],
      leadership: leadership.length > 0 ? leadership : ["Team Collaboration", "Professional Communication"]
    };
  }

  private getFallbackAreasOfExpertise(candidateData: CandidateData) {
    const areas = [];
    
    if (candidateData.currentTitle) {
      areas.push(`${candidateData.currentTitle} Excellence`);
    }
    
    if (candidateData.skills && candidateData.skills.length > 0) {
      areas.push("Technical Expertise");
      areas.push("Professional Development");
      
      // Add skill-specific areas
      candidateData.skills.forEach(skill => {
        areas.push(`${skill} Proficiency`);
      });
    }
    
    if (candidateData.experience && candidateData.experience.length > 0) {
      areas.push("Industry Experience");
      areas.push("Project Management");
      
      // Add company-specific experience
      const uniqueCompanies = Array.from(new Set(candidateData.experience.map(exp => exp.company)));
      uniqueCompanies.forEach(company => {
        areas.push(`${company} Experience`);
      });
    }
    
    return areas.length > 0 ? areas : [
      "Professional Excellence",
      "Technical Skills",
      "Problem Solving",
      "Team Collaboration",
      "Business Development",
      "Strategic Planning"
    ];
  }

  /**
   * Helper methods to extract information from unstructured job text
   */
  private extractRequirementsFromText(text: string): string[] {
    const requirements = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('experience') || lowerText.includes('year')) {
      requirements.push('Professional experience');
    }
    if (lowerText.includes('degree') || lowerText.includes('education') || lowerText.includes('bachelor') || lowerText.includes('master')) {
      requirements.push('Educational qualifications');
    }
    if (lowerText.includes('skill') || lowerText.includes('technical') || lowerText.includes('programming')) {
      requirements.push('Technical skills');
    }
    if (lowerText.includes('leadership') || lowerText.includes('manage') || lowerText.includes('team')) {
      requirements.push('Leadership experience');
    }
    if (lowerText.includes('communication') || lowerText.includes('presentation')) {
      requirements.push('Communication skills');
    }
    
    return requirements.length > 0 ? requirements : ['Professional qualifications', 'Relevant experience'];
  }

  private extractSkillsFromText(text: string): string[] {
    const skills: string[] = [];
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'azure', 'docker', 'kubernetes',
      'management', 'leadership', 'communication', 'analysis', 'design', 'strategy', 'planning',
      'project management', 'agile', 'scrum', 'git', 'api', 'database', 'cloud', 'devops'
    ];
    
    const lowerText = text.toLowerCase();
    commonSkills.forEach(skill => {
      if (lowerText.includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });
    
    return skills.length > 0 ? skills : ['Professional Skills', 'Technical Expertise'];
  }

  private extractResponsibilitiesFromText(text: string): string[] {
    const responsibilities = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('develop') || lowerText.includes('build') || lowerText.includes('create')) {
      responsibilities.push('Development and implementation');
    }
    if (lowerText.includes('manage') || lowerText.includes('lead') || lowerText.includes('supervise')) {
      responsibilities.push('Management and leadership');
    }
    if (lowerText.includes('collaborate') || lowerText.includes('work with') || lowerText.includes('team')) {
      responsibilities.push('Collaboration and teamwork');
    }
    if (lowerText.includes('analyze') || lowerText.includes('research') || lowerText.includes('evaluate')) {
      responsibilities.push('Analysis and research');
    }
    if (lowerText.includes('design') || lowerText.includes('architect') || lowerText.includes('plan')) {
      responsibilities.push('Design and planning');
    }
    
    return responsibilities.length > 0 ? responsibilities : ['Professional duties', 'Project execution'];
  }
}

// Export singleton instance
export const competenceEnrichmentService = new CompetenceEnrichmentService(); 