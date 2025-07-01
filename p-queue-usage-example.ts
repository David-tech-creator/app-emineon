// P-Queue Competence File Generation Usage Example
// This demonstrates how to use the new sequential generation system

import PQueue from 'p-queue';

// Types (these match the ones in your service)
interface CandidateData {
  fullName: string;
  currentTitle: string;
  yearsOfExperience?: number;
  skills: string[];
  experience?: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
  // ... other fields
}

interface JobDescription {
  title?: string;
  company?: string;
  requirements?: string[];
  skills?: string[];
  // ... other fields
}

interface SectionRequest {
  order: number;
  title: string;
  payload: {
    candidateData: CandidateData;
    jobData?: JobDescription;
  };
}

interface SectionResult {
  order: number;
  title: string;
  content: string;
  success: boolean;
  error?: string;
}

// Initialize the queue with concurrency: 3 as requested
const queue = new PQueue({ concurrency: 3 });

// Define all sections in order (matching your requirements)
const sections: SectionRequest[] = [
  { order: 0, title: 'HEADER', payload: {} },
  { order: 1, title: 'PROFESSIONAL SUMMARY', payload: {} },
  { order: 2, title: 'FUNCTIONAL SKILLS', payload: {} },
  { order: 3, title: 'TECHNICAL SKILLS', payload: {} },
  { order: 4, title: 'AREAS OF EXPERTISE', payload: {} },
  { order: 5, title: 'EDUCATION', payload: {} },
  { order: 6, title: 'CERTIFICATIONS', payload: {} },
  { order: 7, title: 'LANGUAGES', payload: {} },
  { order: 8, title: 'PROFESSIONAL EXPERIENCES SUMMARY', payload: {} },
  { order: 9, title: 'PROFESSIONAL EXPERIENCE 1', payload: {} },
  { order: 10, title: 'PROFESSIONAL EXPERIENCE 2', payload: {} },
  { order: 11, title: 'PROFESSIONAL EXPERIENCE 3', payload: {} },
  // Add more experience sections as needed...
];

// Section generation function with retry logic (max 2 retries as requested)
async function generateSection(
  section: SectionRequest, 
  retries = 2
): Promise<SectionResult> {
  try {
    console.log(`🔄 Generating: ${section.title} (order: ${section.order})`);
    
    // Call your OpenAI Responses API
    const response = await fetch('/api/openai-responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        section: section.title,
        candidateData: section.payload.candidateData,
        jobData: section.payload.jobData,
        order: section.order,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Section generation failed');
    }

    console.log(`✅ Section ${section.title} completed successfully`);
    
    return { 
      order: section.order, 
      title: section.title, 
      content: data.content,
      success: true 
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (retries > 0) {
      console.log(`🔄 Retrying ${section.title} (${retries} attempts left)`);
      
      // Add exponential backoff delay
      const delay = Math.pow(2, 2 - retries) * 1000; // 1s, 2s delays
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return generateSection(section, retries - 1);
    }
    
    console.error(`❌ Failed to generate section: ${section.title} - ${errorMessage}`);
    
    return {
      order: section.order,
      title: section.title,
      content: '',
      success: false,
      error: errorMessage
    };
  }
}

// Main function to generate complete competence file
async function generateCompetenceFile(
  candidateData: CandidateData, 
  jobDescription?: JobDescription
): Promise<SectionResult[]> {
  
  console.log('🚀 Starting competence file generation with p-queue');
  console.log(`👤 Candidate: ${candidateData.fullName}`);
  console.log(`🎯 Position: ${jobDescription?.title || 'General'}`);
  console.log(`⚙️ Concurrency: 3, Sequential processing`);
  
  // Inject candidate and job data into all sections
  const sectionsWithData = sections.map(section => ({
    ...section,
    payload: {
      candidateData,
      jobData: jobDescription
    }
  }));

  try {
    // Use Promise.all with p-queue to process sections with concurrency control
    const results = await Promise.all(
      sectionsWithData.map(section => 
        queue.add(() => generateSection(section))
      )
    );

    // Sort by order to ensure correct sequence
    const sortedResults = results.sort((a, b) => a.order - b.order);
    
    const successful = sortedResults.filter(r => r.success).length;
    const failed = sortedResults.length - successful;
    
    console.log(`📊 Generation complete: ${successful}/${sortedResults.length} successful, ${failed} failed`);
    
    return sortedResults;
    
  } catch (error) {
    console.error('💥 Competence file generation failed:', error);
    throw error;
  }
}

// Example usage
export async function exampleUsage() {
  // Sample candidate data
  const candidateData: CandidateData = {
    fullName: 'David Vinkenroye',
    currentTitle: 'Senior Consultant', 
    yearsOfExperience: 8,
    skills: [
      'Business Analysis',
      'Project Management', 
      'Strategic Planning',
      'JavaScript',
      'Python',
      'AWS'
    ],
    experience: [
      {
        company: 'Accenture',
        title: 'Senior Business Consultant',
        startDate: '2020',
        endDate: 'Present',
        responsibilities: 'Leading digital transformation projects...'
      }
    ]
  };

  // Sample job description
  const jobDescription: JobDescription = {
    title: 'Senior Digital Transformation Consultant',
    company: 'Tech Innovations Inc.',
    requirements: [
      '8+ years of consulting experience',
      'Digital transformation expertise',
      'Strong analytical skills'
    ],
    skills: [
      'Business Analysis',
      'Project Management',
      'Change Management'
    ]
  };

  try {
    // Generate the complete competence file
    const results = await generateCompetenceFile(candidateData, jobDescription);
    
    // 🧩 Output Structure - ready for document binding
    console.log('📋 Structured Results for Document Binding:');
    console.log(JSON.stringify(results.map(section => ({
      order: section.order,
      title: section.title,
      content: section.content
    })), null, 2));
    
    // You can now bind this directly to:
    // - Document preview components
    // - PDF/DOCX generation
    // - Editor blocks
    // - Database storage
    
    return results;
    
  } catch (error) {
    console.error('Example failed:', error);
    throw error;
  }
}

// Alternative: Use the service endpoint directly
export async function useServiceEndpoint(candidateData: CandidateData, jobDescription?: JobDescription) {
  const response = await fetch('/api/competence-files/p-queue-generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add authentication headers in production
    },
    body: JSON.stringify({
      candidateData,
      jobDescription,
      options: {
        maxRetries: 2,
        includeJobContext: true
      }
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('✅ Service generation successful');
    return result.data.sections; // Already sorted by order
  } else {
    console.error('❌ Service generation failed:', result.error);
    throw new Error(result.error);
  }
}

// Export the main function
export { generateCompetenceFile };
export default generateCompetenceFile; 