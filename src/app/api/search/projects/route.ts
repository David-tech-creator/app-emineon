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
    const urgency = searchParams.get('urgency');

    console.log('🔍 Searching projects with query:', query);

    // Build where clause for database search
    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { clientName: { contains: query, mode: 'insensitive' } },
        { skills: { hasSome: [query] } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (urgency) {
      where.urgency = urgency;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });

    const total = await prisma.project.count({ where });

    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
        processingTime: 0, // For consistency with Algolia format
      }
    });

  } catch (error) {
    console.error('❌ Error searching projects:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search projects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
