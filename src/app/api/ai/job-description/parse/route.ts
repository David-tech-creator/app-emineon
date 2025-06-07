import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

export const runtime = 'nodejs';

const parseJobDescriptionSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = parseJobDescriptionSchema.parse(body);

    // Enhanced AI parsing with GPT-4 (mock implementation for now)
    const parsedData = await parseWithAI(validatedData.jobDescription);

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

async function parseWithAI(jobDescription: string) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Enhanced extraction logic (in production, this would use OpenAI GPT-4)
  const text = jobDescription.toLowerCase();
  
  return {
    title: extractTitle(jobDescription),
    company: extractCompany(jobDescription),
    location: extractLocation(jobDescription),
    contractType: extractContractType(text),
    workMode: extractWorkMode(text),
    description: jobDescription,
    skills: extractSkills(jobDescription),
    languages: extractLanguages(jobDescription),
    department: extractDepartment(text),
    priority: extractPriority(text),
    salary: extractSalary(jobDescription),
    duration: extractDuration(jobDescription),
    startDate: extractStartDate(jobDescription),
  };
}

function extractTitle(text: string): string {
  const titlePatterns = [
    /(?:job title|position|role):\s*([^\n]+)/i,
    /(?:we are looking for|seeking|hiring)\s+(?:a|an)?\s*([^\n]+)/i,
    /^([^\n]+)(?:\s*-\s*(?:job|position))/i,
    /([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Manager|Analyst|Designer|Specialist))/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Software Engineer';
}

function extractCompany(text: string): string {
  const companyPatterns = [
    /(?:company|client):\s*([^\n]+)/i,
    /at\s+([A-Z][a-zA-Z\s&]+)(?:\s+we|,)/,
    /([A-Z][a-zA-Z\s&]+)\s+is\s+(?:looking|seeking|hiring)/,
    /(Credit Suisse|UBS|Nestlé|Roche|Novartis|ABB|Zurich Insurance)/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Tech Company';
}

function extractLocation(text: string): string {
  const locationPatterns = [
    /(?:location|based in|office in):\s*([^\n]+)/i,
    /(Zurich|Geneva|Basel|Bern|Lausanne|Switzerland)/i,
    /(London|Berlin|Paris|Amsterdam|Munich)/i,
    /([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+)/
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return 'Zurich, Switzerland';
}

function extractContractType(text: string): string {
  if (/contract|contractor|temporary/i.test(text)) return 'contract';
  if (/freelance|freelancer/i.test(text)) return 'freelance';
  if (/fixed.term|fixed term/i.test(text)) return 'fixed-term';
  if (/intern|internship/i.test(text)) return 'internship';
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
  if (/low priority|nice to have/i.test(text)) return 'low';
  return 'medium';
}

function extractSalary(text: string): string {
  const salaryPatterns = [
    /(?:salary|compensation|pay):\s*([^\n]+)/i,
    /(CHF|EUR|USD|GBP)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*-?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)?/i,
    /(\d{1,3}(?:,\d{3})*)\s*-\s*(\d{1,3}(?:,\d{3})*)\s*(CHF|EUR|USD|GBP)/i,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
}

function extractDuration(text: string): string {
  const durationPatterns = [
    /(\d+)\s*(?:month|months|mo)/i,
    /(\d+)\s*(?:year|years|yr)/i,
    /(permanent|indefinite|ongoing)/i,
    /(6 months?|12 months?|18 months?|24 months?)/i,
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return '';
}

function extractStartDate(text: string): string {
  const datePatterns = [
    /start date:\s*([^\n]+)/i,
    /(immediately|asap|as soon as possible)/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[1].toLowerCase().includes('immediately') || match[1].toLowerCase().includes('asap')) {
        return new Date().toISOString().split('T')[0];
      }
      return match[1].trim();
    }
  }
  return '';
} 