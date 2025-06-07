import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs';

export const runtime = 'nodejs';

interface SearchRequest {
  query: string;
  documents?: {
    content: string;
    type: 'job_description' | 'cv' | 'company_document' | 'other';
    searchableTerms: string[];
  }[];
  filters?: {
    skills?: string[];
    experience?: { min?: number; max?: number };
    location?: string;
    availability?: string;
    remotePreference?: string;
  };
}

// POST /api/ai-copilot/search - Intelligent candidate search
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SearchRequest = await request.json();
    const { query, documents, filters } = body;

    // Build search criteria
    const searchCriteria: any = {
      archived: false, // Only active candidates
    };

    // Extract skills from documents if provided
    const documentSkills: string[] = [];
    if (documents && documents.length > 0) {
      documents.forEach(doc => {
        documentSkills.push(...doc.searchableTerms);
      });
    }

    // Extract skills from natural language query
    const querySkills = extractSkillsFromQuery(query);
    const allSkills = Array.from(new Set([...documentSkills, ...querySkills]));

    // Build skill-based search
    if (allSkills.length > 0) {
      searchCriteria.OR = [
        { technicalSkills: { hasSome: allSkills } },
        { frameworks: { hasSome: allSkills } },
        { programmingLanguages: { hasSome: allSkills } },
        { toolsAndPlatforms: { hasSome: allSkills } },
        { methodologies: { hasSome: allSkills } },
      ];
    }

    // Apply filters
    if (filters?.experience) {
      if (filters.experience.min !== undefined) {
        searchCriteria.experienceYears = { gte: filters.experience.min };
      }
      if (filters.experience.max !== undefined) {
        searchCriteria.experienceYears = {
          ...searchCriteria.experienceYears,
          lte: filters.experience.max
        };
      }
    }

    if (filters?.location) {
      searchCriteria.currentLocation = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters?.remotePreference) {
      searchCriteria.remotePreference = filters.remotePreference;
    }

    // Text search in multiple fields
    if (query && !allSkills.length) {
      searchCriteria.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { currentTitle: { contains: query, mode: 'insensitive' } },
        { professionalHeadline: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
        { primaryIndustry: { contains: query, mode: 'insensitive' } },
        { functionalDomain: { contains: query, mode: 'insensitive' } },
      ];
    }

    // Execute search
    const candidates = await prisma.candidate.findMany({
      where: searchCriteria,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        currentTitle: true,
        professionalHeadline: true,
        currentLocation: true,
        linkedinUrl: true,
        portfolioUrl: true,
        experienceYears: true,
        technicalSkills: true,
        softSkills: true,
        frameworks: true,
        programmingLanguages: true,
        toolsAndPlatforms: true,
        primaryIndustry: true,
        seniorityLevel: true,
        expectedSalary: true,
        remotePreference: true,
        availableFrom: true,
        tags: true,
        status: true,
        matchingScore: true,
        source: true,
        summary: true,
        createdAt: true,
        lastUpdated: true,
      },
      orderBy: [
        { matchingScore: 'desc' },
        { lastUpdated: 'desc' }
      ],
      take: 50 // Limit results
    });

    // Calculate match scores for document-based searches
    const candidatesWithScores = candidates.map(candidate => {
      let matchScore = candidate.matchingScore || 0;

      if (allSkills.length > 0) {
        const candidateSkills = [
          ...(candidate.technicalSkills || []),
          ...(candidate.frameworks || []),
          ...(candidate.programmingLanguages || []),
          ...(candidate.toolsAndPlatforms || [])
        ].map(s => s.toLowerCase());

        const matchingSkills = allSkills.filter(skill => 
          candidateSkills.includes(skill.toLowerCase())
        );

        matchScore = Math.round((matchingSkills.length / allSkills.length) * 100);
      }

      return {
        ...candidate,
        calculatedMatchScore: matchScore,
        matchingSkills: allSkills.filter(skill => {
          const candidateSkills = [
            ...(candidate.technicalSkills || []),
            ...(candidate.frameworks || []),
            ...(candidate.programmingLanguages || []),
            ...(candidate.toolsAndPlatforms || [])
          ].map(s => s.toLowerCase());
          return candidateSkills.includes(skill.toLowerCase());
        })
      };
    });

    // Sort by calculated match score
    candidatesWithScores.sort((a, b) => b.calculatedMatchScore - a.calculatedMatchScore);

    return NextResponse.json({
      success: true,
      data: {
        candidates: candidatesWithScores,
        searchCriteria: {
          query,
          skills: allSkills,
          documentsAnalyzed: documents?.length || 0,
          totalResults: candidatesWithScores.length
        },
        insights: generateSearchInsights(candidatesWithScores, allSkills)
      }
    });

  } catch (error) {
    console.error('Error in AI copilot search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

function extractSkillsFromQuery(query: string): string[] {
  const skills: string[] = [];
  const commonSkills = [
    'react', 'javascript', 'typescript', 'python', 'java', 'node.js', 'angular',
    'vue.js', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
    'express', 'spring', 'django', 'flask', 'git', 'jenkins', 'devops',
    'machine learning', 'ai', 'data science', 'blockchain', 'cloud',
    'microservices', 'rest api', 'graphql', 'redis', 'elasticsearch',
    'terraform', 'ansible', 'ci/cd', 'agile', 'scrum', 'kanban'
  ];

  const lowerQuery = query.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerQuery.includes(skill)) {
      skills.push(skill);
    }
  });

  return skills;
}

function generateSearchInsights(candidates: any[], skills: string[]): any {
  const insights = {
    totalCandidates: candidates.length,
    averageMatchScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.calculatedMatchScore, 0) / candidates.length)
      : 0,
    topSkills: skills,
    experienceDistribution: {} as Record<string, number>,
    locationDistribution: {} as Record<string, number>,
    availabilityInsights: {
      immediatelyAvailable: 0,
      available30Days: 0,
      futureAvailability: 0
    },
    recommendations: [] as string[]
  };

  // Calculate distributions
  candidates.forEach(candidate => {
    // Experience distribution
    const exp = candidate.experienceYears || 0;
    const expRange = exp < 2 ? 'Junior (0-2)' : 
                    exp < 5 ? 'Mid (2-5)' : 
                    exp < 10 ? 'Senior (5-10)' : 'Expert (10+)';
    insights.experienceDistribution[expRange] = (insights.experienceDistribution[expRange] || 0) + 1;

    // Location distribution
    if (candidate.currentLocation) {
      insights.locationDistribution[candidate.currentLocation] = (insights.locationDistribution[candidate.currentLocation] || 0) + 1;
    }

    // Availability insights
    if (candidate.availableFrom) {
      const availableDate = new Date(candidate.availableFrom);
      const now = new Date();
      const daysUntilAvailable = Math.ceil((availableDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      
      if (daysUntilAvailable <= 0) {
        insights.availabilityInsights.immediatelyAvailable++;
      } else if (daysUntilAvailable <= 30) {
        insights.availabilityInsights.available30Days++;
      } else {
        insights.availabilityInsights.futureAvailability++;
      }
    }
  });

  // Generate recommendations
  if (insights.averageMatchScore < 70) {
    insights.recommendations.push('Consider expanding search criteria - current match scores are relatively low');
  }
  
  if (skills.length > 0 && candidates.length < 5) {
    insights.recommendations.push('Limited candidates found for specified skills - consider broader skill requirements');
  }
  
  if (insights.availabilityInsights.immediatelyAvailable < candidates.length * 0.3) {
    insights.recommendations.push('Most candidates have future start dates - plan accordingly for timeline expectations');
  }

  return insights;
} 