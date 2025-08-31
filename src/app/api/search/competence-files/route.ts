import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Extract filters from search params
    const status = searchParams.get('status');
    const template = searchParams.get('template');

    console.log('🔍 Searching competence files with query:', query);

    // Build where clause for database search
    const where: any = {};
    
    if (query) {
      where.OR = [
        { candidateName: { contains: query, mode: 'insensitive' } },
        { clientName: { contains: query, mode: 'insensitive' } },
        { jobTitle: { contains: query, mode: 'insensitive' } },
        { template: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (template) {
      where.template = template;
    }

    const competenceFiles = await prisma.competenceFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });

    const total = await prisma.competenceFile.count({ where });

    return NextResponse.json({
      success: true,
      data: competenceFiles,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
        processingTime: 0, // For consistency with Algolia format
      }
    });

  } catch (error) {
    console.error('❌ Error searching competence files:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search competence files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
