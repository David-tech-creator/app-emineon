import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

// GET - List all competence files for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // For now, return mock data until we have a proper database schema
    // In a real implementation, this would query the database
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
          { id: 'header', title: 'Header', content: 'Sarah Johnson\nSenior Frontend Engineer', type: 'header', visible: true, order: 0 },
          { id: 'summary', title: 'Professional Summary', content: 'Experienced frontend engineer...', type: 'summary', visible: true, order: 1 },
          { id: 'skills', title: 'Technical Skills', content: 'React, TypeScript, Node.js...', type: 'skills', visible: true, order: 2 }
        ]
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
          { id: 'header', title: 'Header', content: 'David Chen\nBackend Engineer', type: 'header', visible: true, order: 0 },
          { id: 'summary', title: 'Executive Summary', content: 'Backend engineer with expertise...', type: 'summary', visible: true, order: 1 }
        ]
      }
    ];

    // Apply filters
    let filteredFiles = mockCompetenceFiles;
    
    if (search) {
      filteredFiles = filteredFiles.filter(file =>
        file.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        file.client.toLowerCase().includes(search.toLowerCase()) ||
        file.job.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status && status !== 'all') {
      filteredFiles = filteredFiles.filter(file =>
        file.status.toLowerCase() === status.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredFiles
    });

  } catch (error) {
    console.error('Error fetching competence files:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch competence files'
      },
      { status: 500 }
    );
  }
}

// POST - Create a new competence file (save sections)
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      candidateId, 
      candidateName,
      candidateTitle,
      template, 
      templateName,
      client,
      job,
      sections, 
      status = 'Draft',
      isAnonymized = false
    } = body;

    // In a real implementation, this would save to database
    const newCompetenceFile = {
      id: Date.now().toString(),
      candidateId,
      candidateName,
      candidateTitle,
      template,
      templateName,
      client,
      job,
      status,
      sections,
      isAnonymized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      downloadCount: 0,
      fileName: `${candidateName?.replace(/[^a-zA-Z0-9]/g, '_')}_Competence_File.pdf`,
      fileUrl: null,
      format: 'pdf'
    };

    console.log('💾 Saved competence file:', {
      id: newCompetenceFile.id,
      candidate: candidateName,
      template,
      sectionsCount: sections?.length || 0
    });

    return NextResponse.json({
      success: true,
      data: newCompetenceFile
    });

  } catch (error) {
    console.error('Error creating competence file:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create competence file'
      },
      { status: 500 }
    );
  }
} 