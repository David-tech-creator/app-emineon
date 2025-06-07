import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export const runtime = 'nodejs';

interface DocumentAnalysis {
  type: 'job_description' | 'cv' | 'company_document' | 'other';
  extractedData: {
    skills: string[];
    experience?: string;
    requirements?: string[];
    responsibilities?: string[];
    salary?: string;
    location?: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      name?: string;
    };
    companies?: string[];
    education?: string[];
    certifications?: string[];
  };
  keyInsights: string[];
  searchableTerms: string[];
  confidence: number;
}

// POST /api/ai-copilot/analyze-document - Analyze uploaded documents
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const content = formData.get('content') as string;

    if (!content && !file) {
      return NextResponse.json(
        { success: false, error: 'No content or file provided' },
        { status: 400 }
      );
    }

    let documentContent = content;
    let documentName = fileName || 'document';

    // If file is provided, read its content
    if (file) {
      documentName = file.name;
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        documentContent = await file.text();
      } else {
        // For non-text files, we'd need a proper document parser
        // For now, return an error for unsupported types
        return NextResponse.json(
          { success: false, error: 'Unsupported file type. Please provide text content.' },
          { status: 400 }
        );
      }
    }

    // Analyze the document
    const analysis = await analyzeDocumentContent(documentContent, documentName);

    return NextResponse.json({
      success: true,
      data: {
        analysis,
        fileName: documentName,
        wordCount: documentContent.split(/\s+/).length,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze document' },
      { status: 500 }
    );
  }
}

async function analyzeDocumentContent(content: string, filename: string): Promise<DocumentAnalysis> {
  const lowerContent = content.toLowerCase();
  const lowerFilename = filename.toLowerCase();
  
  const analysis: DocumentAnalysis = {
    type: 'other',
    extractedData: {
      skills: [],
      requirements: [],
      responsibilities: [],
      contactInfo: {},
      companies: [],
      education: [],
      certifications: []
    },
    keyInsights: [],
    searchableTerms: [],
    confidence: 0
  };

  // Determine document type
  let typeConfidence = 0;
  
  // Job Description Detection
  const jdIndicators = [
    'job description', 'job posting', 'position', 'role', 'responsibilities',
    'requirements', 'qualifications', 'we are looking for', 'join our team',
    'about the role', 'what you\'ll do', 'what we\'re looking for'
  ];
  
  const jdMatches = jdIndicators.filter(indicator => lowerContent.includes(indicator)).length;
  if (jdMatches >= 2 || lowerContent.includes('job description')) {
    analysis.type = 'job_description';
    typeConfidence = Math.min(90, jdMatches * 20);
    analysis.keyInsights.push('Job description detected');
  }

  // CV/Resume Detection
  const cvIndicators = [
    'curriculum vitae', 'resume', 'professional experience', 'work experience',
    'education', 'skills', 'achievements', 'career summary', 'profile',
    'objective', 'references available'
  ];
  
  const cvMatches = cvIndicators.filter(indicator => lowerContent.includes(indicator)).length;
  if ((cvMatches >= 3 || lowerFilename.includes('cv') || lowerFilename.includes('resume')) && analysis.type === 'other') {
    analysis.type = 'cv';
    typeConfidence = Math.min(90, cvMatches * 15);
    analysis.keyInsights.push('CV/Resume detected');
  }

  // Company Document Detection
  const companyIndicators = [
    'company policy', 'employee handbook', 'standard operating procedure',
    'terms and conditions', 'privacy policy', 'code of conduct'
  ];
  
  const companyMatches = companyIndicators.filter(indicator => lowerContent.includes(indicator)).length;
  if (companyMatches >= 1 && analysis.type === 'other') {
    analysis.type = 'company_document';
    typeConfidence = Math.min(80, companyMatches * 25);
    analysis.keyInsights.push('Company document detected');
  }

  // Extract Technical Skills
  const technicalSkills = [
    'react', 'javascript', 'typescript', 'python', 'java', 'node.js', 'angular',
    'vue.js', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb',
    'postgresql', 'mysql', 'redis', 'elasticsearch', 'express', 'spring',
    'django', 'flask', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd',
    'devops', 'machine learning', 'artificial intelligence', 'data science',
    'blockchain', 'cloud computing', 'microservices', 'rest api', 'graphql',
    'terraform', 'ansible', 'kafka', 'rabbitmq', 'nginx', 'apache',
    'linux', 'windows', 'macos', 'bash', 'powershell', 'html', 'css',
    'sass', 'less', 'webpack', 'parcel', 'rollup', 'jest', 'cypress',
    'selenium', 'postman', 'jira', 'confluence', 'slack', 'teams'
  ];

  const foundSkills: string[] = [];
  technicalSkills.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    if (regex.test(content)) {
      foundSkills.push(skill);
    }
  });

  analysis.extractedData.skills = foundSkills;
  analysis.searchableTerms.push(...foundSkills);

  // Extract Experience Information
  const experienceMatches = content.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi);
  if (experienceMatches) {
    analysis.extractedData.experience = experienceMatches[0];
    analysis.keyInsights.push(`Experience requirement: ${experienceMatches[0]}`);
  }

  // Extract Contact Information
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    analysis.extractedData.contactInfo!.email = emailMatch[0];
    analysis.keyInsights.push(`Contact email found: ${emailMatch[0]}`);
  }

  const phoneMatch = content.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    analysis.extractedData.contactInfo!.phone = phoneMatch[0];
    analysis.keyInsights.push('Phone number found');
  }

  // Extract Company Names (simplified)
  const companyPatterns = [
    /(?:at|with|from)\s+([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Technologies|Tech|Solutions|Systems))/gi,
    /([A-Z][a-zA-Z\s&.,]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|Technologies|Tech|Solutions|Systems))/gi
  ];

  const companies: string[] = [];
  companyPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const company = match.replace(/^(at|with|from)\s+/i, '').trim();
        if (company.length > 2 && company.length < 50) {
          companies.push(company);
        }
      });
    }
  });

  analysis.extractedData.companies = Array.from(new Set(companies)).slice(0, 10);

  // Extract Education
  const educationKeywords = [
    'bachelor', 'master', 'phd', 'mba', 'degree', 'university', 'college',
    'certification', 'diploma', 'associate', 'doctorate'
  ];

  const education: string[] = [];
  educationKeywords.forEach(keyword => {
    const regex = new RegExp(`([^.!?]*${keyword}[^.!?]*)`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      education.push(...matches.slice(0, 3)); // Limit to 3 matches per keyword
    }
  });

  analysis.extractedData.education = Array.from(new Set(education)).slice(0, 5);

  // Extract Requirements (for job descriptions)
  if (analysis.type === 'job_description') {
    const requirementsSections = content.match(/(?:requirements?|qualifications?|must have|essential):?\s*([^]*?)(?=(?:responsibilities?|duties|what you'll do|benefits|we offer)|$)/gi);
    if (requirementsSections) {
      const requirements = requirementsSections[0]
        .split(/[•\n-]/)
        .map(req => req.trim())
        .filter(req => req.length > 10 && req.length < 200)
        .slice(0, 10);
      analysis.extractedData.requirements = requirements;
    }

    // Extract Responsibilities
    const responsibilitiesSections = content.match(/(?:responsibilities?|duties|what you'll do|role overview):?\s*([^]*?)(?=(?:requirements?|qualifications?|benefits|we offer)|$)/gi);
    if (responsibilitiesSections) {
      const responsibilities = responsibilitiesSections[0]
        .split(/[•\n-]/)
        .map(resp => resp.trim())
        .filter(resp => resp.length > 10 && resp.length < 200)
        .slice(0, 10);
      analysis.extractedData.responsibilities = responsibilities;
    }

    // Extract Salary Information
    const salaryMatch = content.match(/\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*per\s*(?:year|annum|hour|month))?/gi);
    if (salaryMatch) {
      analysis.extractedData.salary = salaryMatch[0];
      analysis.keyInsights.push(`Salary range: ${salaryMatch[0]}`);
    }

    // Extract Location
    const locationPatterns = [
      /(?:location|based in|work from):?\s*([A-Za-z\s,]+)(?:\n|,|\.)/gi,
      /(?:remote|hybrid|on-site|office)/gi
    ];

    locationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        analysis.extractedData.location = matches[0].replace(/^(location|based in|work from):?\s*/i, '').trim();
      }
    });
  }

  // Generate additional insights
  analysis.keyInsights.push(`${foundSkills.length} technical skills identified`);
  analysis.keyInsights.push(`${content.split(/\s+/).length} words analyzed`);
  
  if (analysis.extractedData.companies && analysis.extractedData.companies.length > 0) {
    analysis.keyInsights.push(`${analysis.extractedData.companies.length} companies mentioned`);
  }

  // Set confidence score
  analysis.confidence = Math.max(typeConfidence, foundSkills.length > 0 ? 60 : 30);

  return analysis;
} 