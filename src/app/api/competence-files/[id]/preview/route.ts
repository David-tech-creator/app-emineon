import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// Import generation functions (we'll reuse the existing logic)
import { generateAntaesCompetenceFileHTML, generateCompetenceFileHTML } from '../../generate/route';



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
    
    // Fetch competence file from database with all necessary relations
    const competenceFile = await prisma.competenceFile.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentTitle: true,
            email: true,
            phone: true,
            currentLocation: true,
            experienceYears: true,
            technicalSkills: true,
            certifications: true,
            spokenLanguages: true,
            summary: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!competenceFile) {
      return NextResponse.json(
        { success: false, message: 'Competence file not found' },
        { status: 404 }
      );
    }

    // Format candidate data for the generation functions
    const candidateData = {
      id: competenceFile.candidate?.id || '',
      fullName: `${competenceFile.candidate?.firstName} ${competenceFile.candidate?.lastName}`,
      currentTitle: competenceFile.candidate?.currentTitle || '',
      email: competenceFile.candidate?.email || '',
      phone: competenceFile.candidate?.phone || '',
      location: competenceFile.candidate?.currentLocation || '',
      yearsOfExperience: competenceFile.candidate?.experienceYears || 0,
      skills: competenceFile.candidate?.technicalSkills || [],
      certifications: competenceFile.candidate?.certifications || [],
      experience: [], // Experience will be handled through sections
      education: [], // Education will be handled through sections
      languages: competenceFile.candidate?.spokenLanguages || [],
      summary: competenceFile.candidate?.summary || ''
    };

    const templateName = competenceFile.template?.name || 'Unknown';
    const candidateName = candidateData.fullName;
    const sections = (competenceFile.sectionsConfig as any[]) || [];

    console.log('🔍 Generating preview for competence file:', {
      id,
      candidate: candidateName,
      template: templateName,
      sectionsCount: sections.length
    });

    // Generate HTML using the same logic as PDF generation but with preview indicator
    let htmlContent: string;
    
    // Determine template type based on template name or metadata
    const isAntaesTemplate = templateName.toLowerCase().includes('antaes') || 
                            (competenceFile.metadata as any)?.template === 'antaes';
    
    if (isAntaesTemplate) {
      htmlContent = generateAntaesCompetenceFileHTML(candidateData, sections);
    } else {
      htmlContent = generateCompetenceFileHTML(candidateData, sections);
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
          background: #0A2F5A;
          color: white;
          padding: 8px 16px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          📄 PREVIEW MODE - ${candidateName} • ${templateName} • Version ${competenceFile.version}
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