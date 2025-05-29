import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface AIMatchingResult {
  candidateId: string;
  score: number;
  reasoning: string;
}

export class OpenAIService {
  private checkApiKey(): boolean {
    if (!openai || !process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured. AI features will return mock responses.');
      return false;
    }
    return true;
  }

  async generateJobDescription(input: {
    title: string;
    department: string;
    location: string;
    keyRequirements?: string[];
    experience?: string;
  }): Promise<string> {
    if (!this.checkApiKey()) {
      return `
## ${input.title}

**Department:** ${input.department}
**Location:** ${input.location}

We are seeking a talented ${input.title} to join our ${input.department} team. This is an excellent opportunity to work on exciting projects and contribute to our growing organization.

### Key Responsibilities
- Collaborate with cross-functional teams to deliver high-quality solutions
- Contribute to the design and implementation of innovative features
- Participate in code reviews and maintain high coding standards
- Stay updated with industry trends and best practices

### Required Qualifications
${input.keyRequirements?.map(req => `- ${req}`).join('\n') || '- Relevant experience in the field'}
${input.experience ? `- ${input.experience} of experience` : ''}

### What We Offer
- Competitive salary and benefits
- Professional development opportunities
- Collaborative and inclusive work environment
- Modern tools and technologies

*This job description was generated using mock data. Configure OpenAI API key for AI-powered descriptions.*
      `.trim();
    }

    try {
      const prompt = `Generate a professional job description for the following role:

Title: ${input.title}
Department: ${input.department}
Location: ${input.location}
${input.experience ? `Experience Level: ${input.experience}` : ''}
${input.keyRequirements?.length ? `Key Requirements: ${input.keyRequirements.join(', ')}` : ''}

Please create a comprehensive job description that includes:
- A compelling overview of the role
- Key responsibilities
- Required qualifications
- Preferred qualifications
- What we offer

Format it professionally and make it engaging for potential candidates.`;

      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate job description';
    } catch (error) {
      console.error('OpenAI Error:', error);
      return 'Error generating job description. Please try again.';
    }
  }

  async generateEmailTemplate(input: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    tone: 'professional' | 'friendly' | 'casual';
    purpose: 'outreach' | 'interview_invite' | 'rejection' | 'offer';
  }): Promise<{ subject: string; body: string }> {
    if (!this.checkApiKey()) {
      const mockTemplates = {
        outreach: {
          subject: `Exciting ${input.jobTitle} Opportunity at ${input.companyName}`,
          body: `Hi ${input.candidateName},\n\nI hope this message finds you well. I came across your profile and was impressed by your background. We have an exciting ${input.jobTitle} position at ${input.companyName} that I think would be a great fit for your skills.\n\nWould you be interested in learning more about this opportunity?\n\nBest regards,\nRecruitment Team\n\n*This template was generated using mock data. Configure OpenAI API key for AI-powered emails.*`
        },
        interview_invite: {
          subject: `Interview Invitation - ${input.jobTitle} at ${input.companyName}`,
          body: `Dear ${input.candidateName},\n\nThank you for your interest in the ${input.jobTitle} position at ${input.companyName}. We were impressed by your application and would like to invite you for an interview.\n\nPlease let us know your availability for the coming week.\n\nBest regards,\nRecruitment Team`
        },
        rejection: {
          subject: `Update on your ${input.jobTitle} application`,
          body: `Dear ${input.candidateName},\n\nThank you for your interest in the ${input.jobTitle} position at ${input.companyName}. After careful consideration, we have decided to move forward with other candidates.\n\nWe appreciate the time you invested in the application process.\n\nBest regards,\nRecruitment Team`
        },
        offer: {
          subject: `Job Offer - ${input.jobTitle} at ${input.companyName}`,
          body: `Dear ${input.candidateName},\n\nCongratulations! We are pleased to offer you the ${input.jobTitle} position at ${input.companyName}.\n\nPlease review the attached offer details and let us know if you have any questions.\n\nBest regards,\nRecruitment Team`
        }
      };

      return mockTemplates[input.purpose];
    }

    try {
      const toneDescriptions = {
        professional: 'formal and business-like',
        friendly: 'warm and approachable',
        casual: 'relaxed and conversational'
      };

      const purposeDescriptions = {
        outreach: 'initial outreach to interest them in the role',
        interview_invite: 'inviting them for an interview',
        rejection: 'politely declining their application',
        offer: 'extending a job offer'
      };

      const prompt = `Generate a ${toneDescriptions[input.tone]} email for ${purposeDescriptions[input.purpose]}.

Context:
- Candidate Name: ${input.candidateName}
- Job Title: ${input.jobTitle}
- Company Name: ${input.companyName}
- Email Purpose: ${input.purpose}
- Tone: ${input.tone}

Please provide both a subject line and email body. Make it personalized and appropriate for the purpose.`;

      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      // Parse subject and body
      const lines = content.split('\n');
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'))?.replace(/subject:/i, '').trim() || `${input.companyName} - ${input.jobTitle}`;
      const bodyStart = content.indexOf('\n\n') > -1 ? content.indexOf('\n\n') + 2 : 0;
      const body = content.substring(bodyStart).trim() || content;

      return {
        subject: subjectLine,
        body: body
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      return {
        subject: `${input.companyName} - ${input.jobTitle}`,
        body: 'Error generating email template. Please try again.'
      };
    }
  }

  async rankCandidates(jobDescription: string, candidates: Array<{
    id: string;
    name: string;
    skills: string[];
    experience: number;
  }>): Promise<AIMatchingResult[]> {
    if (!this.checkApiKey()) {
      // Return mock rankings based on experience and skills match
      return candidates
        .map(candidate => ({
          candidateId: candidate.id,
          score: Math.min(90, candidate.experience * 8 + Math.random() * 20),
          reasoning: `Strong match with ${candidate.experience} years experience and relevant skills: ${candidate.skills.slice(0, 2).join(', ')}`
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    try {
      const candidateProfiles = candidates.map(c => 
        `ID: ${c.id}, Name: ${c.name}, Skills: ${c.skills.join(', ')}, Experience: ${c.experience} years`
      ).join('\n');

      const prompt = `Rate and rank these candidates for the following job. Provide a score from 0-100 and brief reasoning for each.

Job Description:
${jobDescription}

Candidates:
${candidateProfiles}

For each candidate, provide: ID, Score (0-100), Reasoning (one sentence)
Format: ID|Score|Reasoning`;

      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || '';
      const results: AIMatchingResult[] = [];

      content.split('\n').forEach(line => {
        const parts = line.split('|');
        if (parts.length >= 3) {
          const candidateId = parts[0].trim();
          const score = parseInt(parts[1].trim());
          const reasoning = parts[2].trim();
          
          if (candidateId && !isNaN(score)) {
            results.push({ candidateId, score, reasoning });
          }
        }
      });

      // Sort by score descending and take top 5
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('OpenAI Error:', error);
      return [];
    }
  }

  async generateCandidateSummary(candidate: {
    name: string;
    skills: string[];
    experience: number;
    assessmentScore?: number;
    assessmentComments?: string;
  }): Promise<string> {
    if (!this.checkApiKey()) {
      return `${candidate.name} is a ${candidate.experience > 5 ? 'senior' : 'mid-level'} professional with expertise in ${candidate.skills.slice(0, 3).join(', ')}. With ${candidate.experience} years of experience, they bring valuable technical skills to any team.`;
    }

    try {
      const prompt = `Generate a concise professional summary for this candidate:

Name: ${candidate.name}
Skills: ${candidate.skills.join(', ')}
Experience: ${candidate.experience} years
${candidate.assessmentScore ? `Assessment Score: ${candidate.assessmentScore}/100` : ''}
${candidate.assessmentComments ? `Assessment Notes: ${candidate.assessmentComments}` : ''}

Provide a 2-3 sentence professional summary highlighting their key strengths and suitability for technical roles.`;

      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Unable to generate candidate summary';
    } catch (error) {
      console.error('OpenAI Error:', error);
      return 'Error generating candidate summary. Please try again.';
    }
  }

  async estimateSalary(jobTitle: string, location: string): Promise<{
    min: number;
    max: number;
    currency: string;
    reasoning: string;
  }> {
    if (!this.checkApiKey()) {
      // Mock salary estimates based on common ranges
      const baseSalary = jobTitle.toLowerCase().includes('senior') ? 80000 : 60000;
      return {
        min: baseSalary,
        max: baseSalary + 40000,
        currency: 'USD',
        reasoning: 'Estimated based on industry standards and location (mock data - configure OpenAI for AI estimates)'
      };
    }

    try {
      const prompt = `Estimate the salary range for this position:

Job Title: ${jobTitle}
Location: ${location}

Provide a realistic salary range in the local currency with brief reasoning. Format your response as:
Min: [amount]
Max: [amount]
Currency: [currency code]
Reasoning: [brief explanation]`;

      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || '';
      
      // Parse the response
      const minMatch = content.match(/Min:\s*[\$€£¥]?([0-9,]+)/);
      const maxMatch = content.match(/Max:\s*[\$€£¥]?([0-9,]+)/);
      const currencyMatch = content.match(/Currency:\s*([A-Z]{3})/);
      const reasoningMatch = content.match(/Reasoning:\s*(.+)/);

      return {
        min: minMatch ? parseInt(minMatch[1].replace(/,/g, '')) : 50000,
        max: maxMatch ? parseInt(maxMatch[1].replace(/,/g, '')) : 100000,
        currency: currencyMatch?.[1] || 'USD',
        reasoning: reasoningMatch?.[1] || 'Estimated based on market standards'
      };
    } catch (error) {
      console.error('OpenAI Error:', error);
      return {
        min: 50000,
        max: 100000,
        currency: 'USD',
        reasoning: 'Error estimating salary. Please try again.'
      };
    }
  }

  async parseCV(prompt: string): Promise<string> {
    if (!this.checkApiKey()) {
      // Return mock JSON response for CV parsing
      return JSON.stringify({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '+1 (555) 123-4567',
        currentTitle: 'Software Engineer',
        currentCompany: 'Tech Corp',
        summary: 'Experienced software engineer with expertise in full-stack development.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        experience: 5,
        education: [{
          degree: 'Bachelor of Computer Science',
          university: 'State University',
          year: 2018
        }],
        workHistory: [{
          title: 'Software Engineer',
          company: 'Tech Corp',
          startDate: '01/2020',
          endDate: 'Present',
          description: 'Developed web applications using modern technologies.'
        }],
        location: {
          city: 'San Francisco',
          country: 'United States'
        }
      });
    }

    try {
      const completion = await openai!.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
        temperature: 0.1,
      });

      return completion.choices[0]?.message?.content || '{}';
    } catch (error) {
      console.error('OpenAI CV parsing error:', error);
      return '{}';
    }
  }
}

export const openaiService = new OpenAIService(); 