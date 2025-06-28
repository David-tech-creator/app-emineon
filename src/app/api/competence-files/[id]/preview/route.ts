import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// Import generation functions (we'll reuse the existing logic)
import { generateAntaesCompetenceFileHTML, generateCompetenceFileHTML } from '../../generate/route';

// Mock data (same as [id]/route.ts - in real implementation, this would come from database)
const mockCompetenceFiles = [
  {
    id: '1',
    candidateId: '1',
    candidateName: 'Sarah Johnson',
    candidateTitle: 'Senior Frontend Engineer',
    template: 'emineon',
    templateName: 'Emineon Professional',
    client: 'UBS Investment Bank',
    job: 'Senior React Developer',
    status: 'Generated',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    version: 1,
    downloadCount: 3,
    isAnonymized: false,
    fileName: 'Sarah_Johnson_UBS_Competence_File.pdf',
    fileUrl: 'https://res.cloudinary.com/emineon/raw/upload/v1749930214/emineon-ats/competence-files/Test_Download_Fix_1749930214191',
    format: 'pdf',
    sections: [
      { id: 'header', title: 'Header', content: 'Sarah Johnson\nSenior Frontend Engineer\nEmail: sarah.johnson@email.com\nPhone: +1 234 567 8900\nLocation: New York, NY', type: 'header', visible: true, order: 0 },
      { id: 'summary', title: 'Professional Summary', content: 'Experienced frontend engineer with 8+ years of expertise in React, TypeScript, and modern web development. Proven track record of leading teams and delivering scalable, high-performance applications. Strong background in UX/UI design principles and agile development methodologies.', type: 'summary', visible: true, order: 1 },
      { id: 'skills', title: 'Technical Skills', content: 'React, TypeScript, JavaScript, Node.js, HTML5, CSS3, SASS, Redux, GraphQL, REST APIs, Webpack, Jest, Cypress, Git, Docker, AWS, Agile/Scrum', type: 'functional-skills', visible: true, order: 2 },
      { id: 'experience', title: 'Professional Experience', content: 'Senior Frontend Engineer at TechCorp (2020-Present)\n• Led development of customer-facing web applications serving 100K+ users\n• Implemented responsive design patterns improving mobile engagement by 40%\n• Mentored junior developers and established coding standards\n\nFrontend Engineer at StartupXYZ (2018-2020)\n• Built React-based dashboard reducing load times by 60%\n• Collaborated with design team to implement pixel-perfect UIs\n• Integrated third-party APIs and payment systems', type: 'experience', visible: true, order: 3 }
    ],
    candidateData: {
      id: '1',
      fullName: 'Sarah Johnson',
      currentTitle: 'Senior Frontend Engineer',
      email: 'sarah.johnson@email.com',
      phone: '+1 234 567 8900',
      location: 'New York, NY',
      yearsOfExperience: 8,
      skills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'HTML5', 'CSS3', 'SASS', 'Redux', 'GraphQL', 'REST APIs'],
      certifications: ['AWS Certified Developer', 'React Professional Certification'],
      experience: [
        {
          company: 'TechCorp',
          title: 'Senior Frontend Engineer',
          startDate: '2020-01',
          endDate: 'Present',
          responsibilities: 'Led development of customer-facing web applications serving 100K+ users. Implemented responsive design patterns improving mobile engagement by 40%. Mentored junior developers and established coding standards.'
        },
        {
          company: 'StartupXYZ',
          title: 'Frontend Engineer',
          startDate: '2018-06',
          endDate: '2020-01',
          responsibilities: 'Built React-based dashboard reducing load times by 60%. Collaborated with design team to implement pixel-perfect UIs. Integrated third-party APIs and payment systems.'
        }
      ],
      education: ['BS Computer Science - MIT (2016)', 'Frontend Development Bootcamp - General Assembly (2017)'],
      languages: ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
      summary: 'Experienced frontend engineer with 8+ years of expertise in React, TypeScript, and modern web development. Proven track record of leading teams and delivering scalable, high-performance applications.'
    }
  },
  {
    id: '2',
    candidateId: '2',
    candidateName: 'David Chen',
    candidateTitle: 'Backend Engineer',
    template: 'antaes',
    templateName: 'Antaes Consulting',
    client: 'Credit Suisse',
    job: 'Python Developer',
    status: 'Draft',
    createdAt: '2024-01-14T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
    version: 2,
    downloadCount: 0,
    isAnonymized: true,
    fileName: 'David_Chen_CS_Competence_File.pdf',
    fileUrl: null,
    format: 'pdf',
    sections: [
      { id: 'header', title: 'Header', content: 'David Chen\nBackend Engineer\nEmail: [REDACTED]\nPhone: [REDACTED]\nLocation: San Francisco, CA', type: 'header', visible: true, order: 0 },
      { id: 'summary', title: 'Executive Summary', content: 'Backend engineer with expertise in Python, Django, and distributed systems. Strong background in API development and database optimization.', type: 'summary', visible: true, order: 1 }
    ],
    candidateData: {
      id: '2',
      fullName: 'David Chen',
      currentTitle: 'Backend Engineer',
      email: 'david.chen@email.com',
      phone: '+1 555 123 4567',
      location: 'San Francisco, CA',
      yearsOfExperience: 6,
      skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'REST APIs', 'GraphQL'],
      certifications: ['AWS Solutions Architect', 'Python Professional Certification'],
      experience: [
        {
          company: 'DataTech Inc',
          title: 'Backend Engineer',
          startDate: '2019-03',
          endDate: 'Present',
          responsibilities: 'Developed and maintained scalable backend services handling millions of requests daily. Optimized database queries improving response times by 50%. Implemented microservices architecture.'
        }
      ],
      education: ['MS Computer Science - Stanford (2018)', 'BS Software Engineering - UC Berkeley (2016)'],
      languages: ['English (Fluent)', 'Mandarin (Native)', 'Japanese (Intermediate)'],
      summary: 'Backend engineer with expertise in Python, Django, and distributed systems. Strong background in API development and database optimization.'
    }
  }
];

// GET - Generate HTML preview of competence file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const competenceFile = mockCompetenceFiles.find(file => file.id === id);

    if (!competenceFile) {
      return NextResponse.json(
        { success: false, message: 'Competence file not found' },
        { status: 404 }
      );
    }

    console.log('🔍 Generating preview for competence file:', {
      id,
      candidate: competenceFile.candidateName,
      template: competenceFile.template,
      sectionsCount: competenceFile.sections?.length || 0
    });

    // Generate HTML using the same logic as PDF generation but with preview indicator
    let htmlContent: string;
    
    if (competenceFile.template === 'antaes' || competenceFile.template === 'cf-antaes-consulting') {
      htmlContent = generateAntaesCompetenceFileHTML(competenceFile.candidateData, competenceFile.sections);
    } else {
      htmlContent = generateCompetenceFileHTML(competenceFile.candidateData, competenceFile.sections);
    }

    // Add preview-specific styling and indicators
    const previewHTML = htmlContent.replace(
      '<body>',
      `<body>
        <div class="preview-indicator" style="
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
          color: white;
          padding: 8px 16px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          📄 PREVIEW MODE - ${competenceFile.candidateName} • ${competenceFile.templateName} • Version ${competenceFile.version}
        </div>
        <div style="margin-top: 40px;">`
    ).replace(
      '</body>',
      `</div></body>`
    );

    return new NextResponse(previewHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate preview'
      },
      { status: 500 }
    );
  }
} 