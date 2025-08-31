import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface MatchingRequest {
  jobId?: string;
  candidateId?: string;
  jobDescription?: string;
  candidateProfile?: string;
  mode: 'job-to-candidates' | 'candidate-to-jobs';
  limit?: number;
}

interface MatchingScore {
  candidateId?: string;
  jobId?: string;
  score: number;
  reasoning: string;
  keyMatches: string[];
  gaps: string[];
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 AI Matching API called');
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body: MatchingRequest = await request.json();
    const { jobId, candidateId, jobDescription, candidateProfile, mode, limit = 10 } = body;

    console.log('🎯 Matching mode:', mode);

    if (mode === 'job-to-candidates') {
      // Find best candidates for a job
      return await findCandidatesForJob({ jobId, jobDescription, limit });
    } else {
      // Find best jobs for a candidate
      return await findJobsForCandidate({ candidateId, candidateProfile, limit });
    }

  } catch (error) {
    console.error('❌ AI Matching error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI matching failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function findCandidatesForJob({ jobId, jobDescription, limit }: {
  jobId?: string;
  jobDescription?: string;
  limit: number;
}) {
  console.log('🔍 Finding candidates for job...');
  
  // Get job details if jobId provided
  let job = null;
  if (jobId) {
    job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        description: true,
        requirements: true,
        location: true,
        salaryRange: true,
        employmentType: true,
      }
    });
  }

  const jobContext = job ? 
    `Job Title: ${job.title}
     Description: ${job.description}
     Requirements: ${job.requirements}
     Location: ${job.location}
     Salary: ${job.salaryRange}
     Type: ${job.employmentType}` :
    jobDescription;

  // Get all active candidates
  const candidates = await prisma.candidate.findMany({
    where: { archived: false },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      currentTitle: true,
      currentLocation: true,
      summary: true,
      technicalSkills: true,
      softSkills: true,
      experienceYears: true,
      expectedSalary: true,
      remotePreference: true,
      degrees: true,
      certifications: true,
      workExperiences: {
        select: {
          title: true,
          company: true,
          description: true,
          startDate: true,
          endDate: true,
        }
      }
    },
    take: 50, // Limit for performance
  });

  console.log(`📊 Analyzing ${candidates.length} candidates...`);

  // AI-powered matching
  const matchingResults: MatchingScore[] = [];

  for (const candidate of candidates) {
    const candidateProfile = `
      Name: ${candidate.firstName} ${candidate.lastName}
      Current Role: ${candidate.currentTitle || 'Not specified'}
      Location: ${candidate.currentLocation || 'Not specified'}
      Experience: ${candidate.experienceYears || 0} years
      Summary: ${candidate.summary || 'No summary available'}
      Technical Skills: ${candidate.technicalSkills?.join(', ') || 'None listed'}
      Soft Skills: ${candidate.softSkills?.join(', ') || 'None listed'}
      Education: ${candidate.degrees?.join(', ') || 'Not specified'}
      Certifications: ${candidate.certifications?.join(', ') || 'None'}
      Expected Salary: ${candidate.expectedSalary || 'Not specified'}
      Remote Preference: ${candidate.remotePreference || 'Not specified'}
      Work Experience: ${candidate.workExperiences?.map(exp => 
        `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'}): ${exp.description}`
      ).join('; ') || 'No experience listed'}
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert recruiter and talent matcher. Analyze how well a candidate matches a job position.

SCORING CRITERIA:
- Technical Skills Match (0-30 points)
- Experience Relevance (0-25 points)  
- Education & Certifications (0-15 points)
- Location & Remote Compatibility (0-10 points)
- Salary Alignment (0-10 points)
- Soft Skills & Culture Fit (0-10 points)

TOTAL SCORE: 0-100 (where 80+ = Excellent, 60-79 = Good, 40-59 = Moderate, <40 = Poor)

Provide SPECIFIC reasoning and be HONEST about gaps. Focus on REAL qualifications, not assumptions.`
          },
          {
            role: 'user',
            content: `
JOB REQUIREMENTS:
${jobContext}

CANDIDATE PROFILE:
${candidateProfile}

Analyze this match and respond with ONLY a JSON object in this exact format:
{
  "score": 85,
  "reasoning": "Strong technical match with React and Node.js experience. 5 years experience aligns well with senior role requirements.",
  "keyMatches": ["React expertise", "Node.js experience", "5+ years experience", "Remote work preference"],
  "gaps": ["No AWS certification", "Limited mobile development experience"],
  "recommendations": ["Consider AWS training", "Evaluate mobile development needs"]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          matchingResults.push({
            candidateId: candidate.id,
            score: parsed.score || 0,
            reasoning: parsed.reasoning || 'No reasoning provided',
            keyMatches: parsed.keyMatches || [],
            gaps: parsed.gaps || [],
            recommendations: parsed.recommendations || []
          });
        } catch (parseError) {
          console.error('Failed to parse AI response for candidate:', candidate.id);
        }
      }
    } catch (aiError) {
      console.error('AI matching failed for candidate:', candidate.id, aiError);
    }
  }

  // Sort by score and take top matches
  const topMatches = matchingResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  // Save matching results to database if jobId is provided
  if (jobId && topMatches.length > 0) {
    console.log('💾 Saving matching results to database...');
    
    for (const match of topMatches) {
      try {
        await prisma.candidateJobMatch.upsert({
          where: {
            candidateId_jobId: {
              candidateId: match.candidateId!,
              jobId: jobId
            }
          },
          update: {
            score: match.score,
            reasoning: match.reasoning,
            keyMatches: match.keyMatches,
            gaps: match.gaps,
            recommendations: match.recommendations,
            updatedAt: new Date()
          },
          create: {
            candidateId: match.candidateId!,
            jobId: jobId,
            score: match.score,
            reasoning: match.reasoning,
            keyMatches: match.keyMatches,
            gaps: match.gaps,
            recommendations: match.recommendations
          }
        });
      } catch (dbError) {
        console.error('Failed to save match for candidate:', match.candidateId, dbError);
      }
    }
    
    console.log('✅ Matching results saved to database');
  }

  console.log(`✅ Found ${topMatches.length} matching candidates`);

  return NextResponse.json({
    success: true,
    data: {
      matches: topMatches,
      totalAnalyzed: candidates.length,
      jobContext: jobContext?.substring(0, 100) + '...'
    }
  });
}

async function findJobsForCandidate({ candidateId, candidateProfile, limit }: {
  candidateId?: string;
  candidateProfile?: string;
  limit: number;
}) {
  console.log('🔍 Finding jobs for candidate...');
  
  // Get candidate details if candidateId provided
  let candidate = null;
  if (candidateId) {
    candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        firstName: true,
        lastName: true,
        currentTitle: true,
        summary: true,
        technicalSkills: true,
        experienceYears: true,
        expectedSalary: true,
        currentLocation: true,
        remotePreference: true,
      }
    });
  }

  const candidateContext = candidate ? 
    `Name: ${candidate.firstName} ${candidate.lastName}
     Current Role: ${candidate.currentTitle}
     Experience: ${candidate.experienceYears} years
     Skills: ${candidate.technicalSkills?.join(', ')}
     Location: ${candidate.currentLocation}
     Expected Salary: ${candidate.expectedSalary}
     Remote Preference: ${candidate.remotePreference}
     Summary: ${candidate.summary}` :
    candidateProfile;

  // Get all active jobs
  const jobs = await prisma.job.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      location: true,
      salaryRange: true,
      employmentType: true,
    },
    take: 30, // Limit for performance
  });

  const matchingResults: MatchingScore[] = [];

  for (const job of jobs) {
    const jobProfile = `
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Location: ${job.location}
      Salary: ${job.salaryRange}
      Type: ${job.employmentType}
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert recruiter analyzing job-candidate fit. Score how well this candidate matches this job position.

SCORING CRITERIA:
- Skills Alignment (0-35 points)
- Experience Level Match (0-25 points)
- Location/Remote Compatibility (0-15 points)
- Salary Expectations vs Offer (0-15 points)
- Career Growth Potential (0-10 points)

TOTAL SCORE: 0-100 (where 80+ = Perfect Match, 60-79 = Good Fit, 40-59 = Possible, <40 = Poor Fit)`
          },
          {
            role: 'user',
            content: `
CANDIDATE PROFILE:
${candidateContext}

JOB OPPORTUNITY:
${jobProfile}

Analyze this match and respond with ONLY a JSON object:
{
  "score": 85,
  "reasoning": "Excellent skills match with strong experience level alignment",
  "keyMatches": ["React expertise matches requirement", "Senior level experience"],
  "gaps": ["No cloud experience mentioned"],
  "recommendations": ["Perfect for senior role", "Consider cloud training"]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 400,
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        try {
          const parsed = JSON.parse(result);
          matchingResults.push({
            jobId: job.id,
            score: parsed.score || 0,
            reasoning: parsed.reasoning || 'No reasoning provided',
            keyMatches: parsed.keyMatches || [],
            gaps: parsed.gaps || [],
            recommendations: parsed.recommendations || []
          });
        } catch (parseError) {
          console.error('Failed to parse AI response for job:', job.id);
        }
      }
    } catch (aiError) {
      console.error('AI matching failed for job:', job.id, aiError);
    }
  }

  // Sort by score and take top matches
  const topMatches = matchingResults
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return NextResponse.json({
    success: true,
    data: {
      matches: topMatches,
      totalAnalyzed: jobs.length,
      candidateContext: candidateContext?.substring(0, 100) + '...'
    }
  });
}
