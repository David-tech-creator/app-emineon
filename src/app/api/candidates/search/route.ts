import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required to search candidates'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    const skills = searchParams.get('skills');

    if (!email && !name && !phone && !skills) {
      return NextResponse.json({
        error: 'Missing search parameters',
        message: 'At least one search parameter (email, name, phone, skills) is required'
      }, { status: 400 });
    }

    console.log('🔍 Searching candidates with params:', { email, name, phone, skills });

    // Build search conditions
    const searchConditions: any = {
      OR: []
    };

    if (email) {
      searchConditions.OR.push({
        email: {
          contains: email,
          mode: 'insensitive'
        }
      });
    }

    if (name) {
      searchConditions.OR.push(
        {
          firstName: {
            contains: name,
            mode: 'insensitive'
          }
        },
        {
          lastName: {
            contains: name,
            mode: 'insensitive'
          }
        },
        {
          fullName: {
            contains: name,
            mode: 'insensitive'
          }
        }
      );
    }

    if (phone) {
      searchConditions.OR.push({
        phone: {
          contains: phone.replace(/\D/g, ''), // Remove non-digits for search
          mode: 'insensitive'
        }
      });
    }

    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      searchConditions.OR.push({
        skills: {
          hasSome: skillList
        }
      });
    }

    // Search candidates in database
    const candidates = await prisma.candidate.findMany({
      where: searchConditions,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        fullName: true,
        email: true,
        phone: true,
        currentTitle: true,
        location: true,
        status: true,
        skills: true,
        experience: true,
        education: true,
        linkedinUrl: true,
        portfolioUrl: true,
        resumeUrl: true,
        notes: true,
        tags: true,
        source: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // Limit results
    });

    console.log(`✅ Found ${candidates.length} candidates`);

    // Transform data for response
    const transformedCandidates = candidates.map(candidate => ({
      ...candidate,
      // Ensure fullName is available
      fullName: candidate.fullName || `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
      // Format skills as array if it's stored as JSON
      skills: Array.isArray(candidate.skills) ? candidate.skills : [],
      // Format tags as array if it's stored as JSON
      tags: Array.isArray(candidate.tags) ? candidate.tags : []
    }));

    return NextResponse.json({
      success: true,
      data: transformedCandidates,
      total: transformedCandidates.length,
      searchParams: { email, name, phone, skills }
    });

  } catch (error) {
    console.error('❌ Candidate search error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 