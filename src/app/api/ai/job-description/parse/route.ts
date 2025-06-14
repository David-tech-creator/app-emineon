import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

export const runtime = 'nodejs';

const parseJobDescriptionSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters').optional(),
  text: z.string().min(10, 'Text must be at least 10 characters').optional(),
}).refine(data => data.jobDescription || data.text, {
  message: "Either 'jobDescription' or 'text' field is required"
});

interface ParsedJobData {
  title: string;
  company: string;
  location: string;
  contractType: string;
  workMode: string;
  description: string;
  skills: string[];
  languages: string[];
  department: string;
  priority: string;
  salary: string;
  duration: string;
  startDate: string;
}

export async function POST(request: NextRequest) {
  try {
    // Make auth optional since this route is in publicRoutes
    let userId = null;
    try {
      const authResult = auth();
      userId = authResult.userId;
    } catch (authError) {
      console.log('Auth not available, continuing without user context');
    }

    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON format',
          message: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    const validatedData = parseJobDescriptionSchema.parse(body);

    // Get the job description text from either field
    const jobDescriptionText = validatedData.jobDescription || validatedData.text || '';

    // Enhanced AI parsing with GPT-like intelligence (mock implementation)
    // In production, this would use actual OpenAI API
    
    const parsedData = await parseWithAI(jobDescriptionText);

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: 'Job description parsed successfully',
    });
  } catch (error) {
    console.error('Job description parsing error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to parse job description' },
      { status: 500 }
    );
  }
}

async function parseWithAI(jobDescription: string): Promise<ParsedJobData> {
  // Enhanced AI parsing with GPT-like intelligence (mock implementation)
  // In production, this would use actual OpenAI API
  
  const text = jobDescription.toLowerCase();
  
  return {
    title: extractTitle(jobDescription),
    company: extractCompany(jobDescription),
    location: extractLocation(jobDescription),
    contractType: extractContractType(jobDescription),
    workMode: extractWorkMode(jobDescription),
    description: jobDescription,
    skills: extractSkills(jobDescription),
    languages: extractLanguages(jobDescription),
    department: extractDepartment(jobDescription),
    priority: extractPriority(jobDescription),
    salary: extractSalary(jobDescription),
    duration: extractDuration(jobDescription),
    startDate: extractStartDate(jobDescription),
  };
}

function extractTitle(text: string): string {
  // Enhanced title extraction
  const titlePatterns = [
    /(?:we are looking for|seeking|hiring)(?:\s+(?:a|an))?\s+([^.]+?)(?:\s+to|$)/i,
    /(?:position|role|job):\s*([^\n.]+)/i,
    /([^.,\n]+?engineer[^.,\n]*)/i,
    /([^.,\n]+?developer[^.,\n]*)/i,
    /([^.,\n]+?manager[^.,\n]*)/i,
    /([^.,\n]+?specialist[^.,\n]*)/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let title = match[1].trim();
      // Clean up common prefixes/suffixes
      title = title.replace(/^(a|an|the)\s+/i, '');
      title = title.replace(/\s+(at|for|in)\s+.*/i, '');
      return title;
    }
  }
  return 'Software Engineer';
}

function extractCompany(text: string): string {
  const companyPatterns = [
    /(?:team\s+at|join\s+(?:our\s+team\s+at\s+)?|work\s+(?:at|for))\s+([A-Z][a-zA-Z0-9\s&.-]+?)(?:\s*[.!,]|\s+(?:in|located|based)|$)/i,
    /company:\s*([^\n.]+)/i,
    /([A-Z][a-zA-Z0-9\s&.-]+?)\s+(?:is|are)\s+(?:looking|seeking|hiring)/i,
    /(?:at|for|with)\s+([A-Z][a-zA-Z0-9\s&.-]{2,}?)(?:\s*[.!,]|\s+(?:in|we|is|are|located|based)|$)/i,
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 1 && match[1].length < 50) {
      let company = match[1].trim();
      // Clean up common words that shouldn't be part of company name
      if (!['We', 'Our', 'The', 'A', 'An', 'This', 'That'].includes(company)) {
        return company;
      }
    }
  }
  return 'Tech Company';
}

function extractLocation(text: string): string {
  const locationPatterns = [
    /location:\s*([^\n.,]+)/i,
    /(?:based|located|office)\s+in\s+([^\n.,]+)/i,
    /(Zurich|Geneva|Basel|Bern|Lausanne|Switzerland|New York|London|Berlin|Paris|Amsterdam)[^\n.]*/i,
    /(?:in|at)\s+([A-Z][a-zA-Z\s,.-]+(?:Switzerland|Germany|France|UK|USA))/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return 'Remote';
}

function extractContractType(text: string): string {
  // Look for explicit contract type mentions first
  if (/contract\s+type:\s*permanent/i.test(text)) return 'permanent';
  if (/contract\s+type:\s*freelance/i.test(text)) return 'freelance';
  if (/contract\s+type:\s*(?:fixed.?term|temporary)/i.test(text)) return 'fixed-term';
  if (/contract\s+type:\s*internship/i.test(text)) return 'internship';
  
  // Then look for general mentions
  if (/freelance|freelancer/i.test(text)) return 'freelance';
  if (/(?:fixed.?term|temporary|temp)\s+(?:contract|position)/i.test(text)) return 'fixed-term';
  if (/intern|internship/i.test(text)) return 'internship';
  if (/permanent|full.?time|indefinite/i.test(text)) return 'permanent';
  
  return 'permanent';
}

function extractWorkMode(text: string): string {
  if (/remote|work from home|wfh/i.test(text)) return 'remote';
  if (/on.site|office|in.person/i.test(text)) return 'on-site';
  if (/hybrid|flexible/i.test(text)) return 'hybrid';
  return 'hybrid';
}

function extractSkills(text: string): string[] {
  const skillsMap = {
    'JavaScript': /javascript|js\b/i,
    'TypeScript': /typescript|ts\b/i,
    'React': /react/i,
    'Node.js': /node\.?js|nodejs/i,
    'Python': /python/i,
    'Java': /\bjava\b/i,
    'SQL': /sql|database/i,
    'AWS': /aws|amazon web services/i,
    'Docker': /docker/i,
    'Kubernetes': /kubernetes|k8s/i,
    'Git': /git\b/i,
    'Agile': /agile|scrum/i,
    'REST API': /rest|api/i,
    'GraphQL': /graphql/i,
    'MongoDB': /mongodb|mongo/i,
    'PostgreSQL': /postgresql|postgres/i,
    'Redis': /redis/i,
    'Microservices': /microservices/i,
    'CI/CD': /ci\/cd|continuous integration|continuous deployment/i,
    'Machine Learning': /machine learning|ml\b/i,
    'Data Science': /data science/i,
    'Analytics': /analytics/i,
    'Leadership': /leadership|team lead/i,
    'Product Management': /product management/i,
    'UX/UI': /ux|ui|user experience|user interface/i,
  };

  const foundSkills: string[] = [];
  Object.entries(skillsMap).forEach(([skill, pattern]) => {
    if (pattern.test(text)) {
      foundSkills.push(skill);
    }
  });

  return foundSkills.length > 0 ? foundSkills : ['Programming', 'Problem Solving'];
}

function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  if (/english/i.test(text)) languages.push('English');
  if (/german|deutsch/i.test(text)) languages.push('German');
  if (/french|français/i.test(text)) languages.push('French');
  if (/italian|italiano/i.test(text)) languages.push('Italian');
  if (/spanish|español/i.test(text)) languages.push('Spanish');
  return languages.length > 0 ? languages : ['English'];
}

function extractDepartment(text: string): string {
  if (/engineering|development|software|technical/i.test(text)) return 'Technology';
  if (/marketing|growth|digital marketing/i.test(text)) return 'Marketing';
  if (/sales|business development/i.test(text)) return 'Sales';
  if (/design|ux|ui|creative/i.test(text)) return 'Design';
  if (/product|pm\b/i.test(text)) return 'Product';
  if (/data|analytics|scientist/i.test(text)) return 'Data & Analytics';
  if (/finance|accounting/i.test(text)) return 'Finance';
  if (/hr|human resources|people/i.test(text)) return 'Human Resources';
  return 'Technology';
}

function extractPriority(text: string): string {
  if (/urgent|asap|immediately|high priority/i.test(text)) return 'high';
  if (/low priority|when possible/i.test(text)) return 'low';
  return 'medium';
}

function extractSalary(text: string): string {
  const salaryPatterns = [
    /salary:\s*([^\n.]+)/i,
    /(\$\d+[,\d]*(?:\s*-\s*\$?\d+[,\d]*)?(?:\s*per\s+year|\s*annually|\s*\/year)?)/i,
    /(CHF\s*\d+[,\d]*(?:\s*-\s*CHF?\s*\d+[,\d]*)?)/i,
    /(\€\d+[,\d]*(?:\s*-\s*\€?\d+[,\d]*)?)/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractDuration(text: string): string {
  if (/permanent|full.?time|indefinite/i.test(text)) return 'Permanent';
  if (/contract|fixed.?term|temporary/i.test(text)) {
    const durationMatch = text.match(/(\d+)\s*(month|year)s?/i);
    if (durationMatch) {
      return `${durationMatch[1]} ${durationMatch[2]}${durationMatch[1] !== '1' ? 's' : ''}`;
    }
    return 'Fixed term';
  }
  if (/freelance|consultant/i.test(text)) return 'Freelance';
  if (/intern|internship/i.test(text)) return 'Internship';
  return 'Permanent';
}

function extractStartDate(text: string): string {
  if (/immediately|asap|as soon as possible/i.test(text)) {
    return new Date().toISOString().split('T')[0];
  }
  
  const datePatterns = [
    /start(?:\s+date)?:\s*([^\n.]+)/i,
    /(?:starting|begins?|commence)\s+(?:on\s+)?([^\n.]+)/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      try {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {
        // Continue to next pattern
      }
    }
  }
  
  return '';
} 