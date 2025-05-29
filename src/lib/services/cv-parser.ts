import { openaiService } from '@/lib/openai';
import { CVParsingResponse } from '@/lib/validation';

export interface ParsedCandidateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  currentTitle?: string;
  currentCompany?: string;
  summary?: string;
  skills?: string[];
  experience?: number;
  education?: {
    degree?: string;
    university?: string;
    year?: number;
  }[];
  workHistory?: {
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }[];
  location?: {
    city?: string;
    country?: string;
  };
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
}

export class CVParserService {
  async parseCV(file: File): Promise<ParsedCandidateData> {
    console.log('CV Parser: parseCV called with file:', file.name, file.type, file.size);
    
    try {
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        // For PDF files, we'll provide guidance to the user
        extractedText = `PDF file uploaded: ${file.name}. Please copy and paste the text content for parsing.`;
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        // For Word documents, attempt to read as text
        extractedText = await this.extractTextFromWord(file);
      } else if (file.type === 'text/plain') {
        // Plain text files
        extractedText = await file.text();
      } else {
        throw new Error('Unsupported file format. Please upload PDF, Word, or text documents.');
      }

      console.log('CV Parser: extracted text length:', extractedText.length);
      
      if (!extractedText.trim()) {
        throw new Error('Could not extract text from the document. Please try copying and pasting the content.');
      }

      const result = await this.parseTextWithAI(extractedText);
      console.log('CV Parser: final parsed result:', result);
      return result;
    } catch (error) {
      console.error('CV parsing error:', error);
      throw new Error('Failed to parse CV. Please check the file format and try again.');
    }
  }

  async parseLinkedInProfile(linkedinUrl: string): Promise<ParsedCandidateData> {
    console.log('CV Parser: parseLinkedInProfile called with URL:', linkedinUrl);
    
    try {
      // Note: In production, you'd need to use LinkedIn API or web scraping
      // For now, we'll provide a mock response with guidance
      const mockData = await this.mockLinkedInParsing(linkedinUrl);
      console.log('CV Parser: LinkedIn parsing result:', mockData);
      return mockData;
    } catch (error) {
      console.error('LinkedIn parsing error:', error);
      throw new Error('Failed to parse LinkedIn profile. Please try manual entry.');
    }
  }

  private async extractTextFromWord(file: File): Promise<string> {
    // For Word documents, we'll read as text (this is simplified)
    // In production, use libraries like mammoth.js for proper Word parsing
    try {
      const text = await file.text();
      return text;
    } catch (error) {
      console.error('Word extraction error:', error);
      return ''; // Fallback to empty string
    }
  }

  private async parseTextWithAI(text: string): Promise<ParsedCandidateData> {
    try {
      const prompt = `Parse the following CV/resume text and extract structured information. Return the information in JSON format with the following structure:

{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "phone": "string",
  "currentTitle": "string",
  "currentCompany": "string",
  "summary": "string",
  "skills": ["string array"],
  "experience": "number (years of total experience)",
  "education": [
    {
      "degree": "string",
      "university": "string", 
      "year": "number"
    }
  ],
  "workHistory": [
    {
      "title": "string",
      "company": "string",
      "startDate": "string (MM/YYYY format)",
      "endDate": "string (MM/YYYY format or 'Present')",
      "description": "string"
    }
  ],
  "location": {
    "city": "string",
    "country": "string"
  },
  "linkedinUrl": "string",
  "portfolioUrl": "string",
  "githubUrl": "string"
}

Only include fields where information is clearly available. Calculate total years of experience based on work history. For skills, extract technical skills, programming languages, tools, and relevant professional skills.

CV Text:
${text}

JSON Response:`;

      const response = await openaiService.parseCV(prompt);
      
      try {
        const parsed = JSON.parse(response);
        return this.validateAndCleanParsedData(parsed);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Return minimal data if JSON parsing fails
        return this.extractBasicInfoFallback(text);
      }
    } catch (error) {
      console.error('AI parsing error:', error);
      return this.extractBasicInfoFallback(text);
    }
  }

  private async mockLinkedInParsing(linkedinUrl: string): Promise<ParsedCandidateData> {
    console.log('Mock LinkedIn parsing for URL:', linkedinUrl);
    
    // Mock LinkedIn parsing - in production, integrate with LinkedIn API
    const mockData = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 987-6543',
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'Innovation Labs',
      summary: 'Passionate frontend developer with 7 years of experience building modern web applications. Expert in React, TypeScript, and user experience design.',
      skills: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'CSS3', 'HTML5', 'Figma', 'GraphQL'],
      experience: 7,
      education: [{
        degree: 'Master of Computer Science',
        university: 'MIT',
        year: 2017
      }],
      workHistory: [{
        title: 'Senior Frontend Developer',
        company: 'Innovation Labs',
        startDate: '03/2022',
        endDate: 'Present',
        description: 'Lead frontend development team and architected scalable web applications.'
      }],
      linkedinUrl,
      location: {
        city: 'New York',
        country: 'United States'
      }
    };
    
    console.log('Returning mock LinkedIn data:', mockData);
    return mockData;
  }

  private validateAndCleanParsedData(data: any): ParsedCandidateData {
    const cleaned: ParsedCandidateData = {};

    // Clean and validate basic info
    if (data.firstName && typeof data.firstName === 'string') {
      cleaned.firstName = data.firstName.trim();
    }
    if (data.lastName && typeof data.lastName === 'string') {
      cleaned.lastName = data.lastName.trim();
    }
    if (data.email && this.isValidEmail(data.email)) {
      cleaned.email = data.email.trim().toLowerCase();
    }
    if (data.phone && typeof data.phone === 'string') {
      cleaned.phone = data.phone.trim();
    }

    // Professional info
    if (data.currentTitle && typeof data.currentTitle === 'string') {
      cleaned.currentTitle = data.currentTitle.trim();
    }
    if (data.currentCompany && typeof data.currentCompany === 'string') {
      cleaned.currentCompany = data.currentCompany.trim();
    }
    if (data.summary && typeof data.summary === 'string') {
      cleaned.summary = data.summary.trim();
    }

    // Skills array
    if (Array.isArray(data.skills)) {
      cleaned.skills = data.skills
        .filter((skill: any) => typeof skill === 'string' && skill.trim())
        .map((skill: any) => skill.trim());
    }

    // Experience
    if (typeof data.experience === 'number' && data.experience >= 0) {
      cleaned.experience = Math.round(data.experience);
    }

    // Education
    if (Array.isArray(data.education)) {
      cleaned.education = data.education
        .filter((edu: any) => edu && typeof edu === 'object')
        .map((edu: any) => ({
          degree: edu.degree && typeof edu.degree === 'string' ? edu.degree.trim() : undefined,
          university: edu.university && typeof edu.university === 'string' ? edu.university.trim() : undefined,
          year: typeof edu.year === 'number' ? edu.year : undefined,
        }))
        .filter((edu: any) => edu.degree || edu.university);
    }

    // Work history
    if (Array.isArray(data.workHistory)) {
      cleaned.workHistory = data.workHistory
        .filter((work: any) => work && typeof work === 'object')
        .map((work: any) => ({
          title: work.title && typeof work.title === 'string' ? work.title.trim() : undefined,
          company: work.company && typeof work.company === 'string' ? work.company.trim() : undefined,
          startDate: work.startDate && typeof work.startDate === 'string' ? work.startDate.trim() : undefined,
          endDate: work.endDate && typeof work.endDate === 'string' ? work.endDate.trim() : undefined,
          description: work.description && typeof work.description === 'string' ? work.description.trim() : undefined,
        }))
        .filter((work: any) => work.title || work.company);
    }

    // Location
    if (data.location && typeof data.location === 'object') {
      cleaned.location = {
        city: data.location.city && typeof data.location.city === 'string' ? data.location.city.trim() : undefined,
        country: data.location.country && typeof data.location.country === 'string' ? data.location.country.trim() : undefined,
      };
    }

    // URLs
    if (data.linkedinUrl && this.isValidUrl(data.linkedinUrl)) {
      cleaned.linkedinUrl = data.linkedinUrl.trim();
    }
    if (data.portfolioUrl && this.isValidUrl(data.portfolioUrl)) {
      cleaned.portfolioUrl = data.portfolioUrl.trim();
    }
    if (data.githubUrl && this.isValidUrl(data.githubUrl)) {
      cleaned.githubUrl = data.githubUrl.trim();
    }

    return cleaned;
  }

  private extractBasicInfoFallback(text: string): ParsedCandidateData {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    
    const email = text.match(emailRegex)?.[0];
    const phone = text.match(phoneRegex)?.[0];

    return {
      email: email ? email.toLowerCase() : undefined,
      phone: phone || undefined,
      summary: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const cvParserService = new CVParserService(); 