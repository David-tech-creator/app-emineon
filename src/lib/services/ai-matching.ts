import { prisma } from '@/lib/prisma';
import { openaiService } from '@/lib/openai';
import { loggingService } from './logging';

export interface CandidateMatch {
  candidateId: string;
  score: number;
  reasoning: string;
  factors: {
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    preferenceMatch: number;
  };
}

export interface JobMatchInput {
  jobId: string;
  maxCandidates?: number;
  minScore?: number;
}

export class AIMatchingService {
  async findMatchingCandidates(input: JobMatchInput): Promise<CandidateMatch[]> {
    try {
      const { jobId, maxCandidates = 10, minScore = 50 } = input;
      
      // Get job details
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          location: true,
          experienceLevel: true,
          isRemote: true,
          salaryMin: true,
          salaryMax: true,
        },
      });

      if (!job) {
        throw new Error('Job not found');
      }

      // Get active candidates
      const candidates = await prisma.candidate.findMany({
        where: {
          status: { in: ['NEW', 'ACTIVE'] },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          skills: true,
          experience: true,
          currentTitle: true,
          city: true,
          country: true,
          expectedSalary: true,
          currency: true,
          remoteWork: true,
          willingToRelocate: true,
        },
        take: 100, // Limit to prevent huge API calls
      });

      // Use AI to rank candidates
      const rankings = await openaiService.rankCandidates(
        this.formatJobForAI(job),
        candidates.map(c => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`,
          skills: c.skills,
          experience: c.experience,
        }))
      );

      // Convert to detailed matches
      const matches: CandidateMatch[] = [];
      for (const ranking of rankings) {
        if (ranking.score >= minScore) {
          const candidate = candidates.find(c => c.id === ranking.candidateId);
          if (candidate) {
            const factors = this.calculateMatchFactors(job, candidate);
            
            matches.push({
              candidateId: ranking.candidateId,
              score: ranking.score,
              reasoning: ranking.reasoning,
              factors,
            });

            // Store match in database for future reference
            await this.storeAIMatch(jobId, ranking.candidateId, ranking.score, ranking.reasoning, factors);
          }
        }
      }

      await loggingService.log({
        action: 'AI_CANDIDATE_MATCHING',
        resource: `job:${jobId}`,
        details: { candidatesFound: matches.length, minScore },
      });

      return matches.slice(0, maxCandidates);
    } catch (error) {
      await loggingService.log({
        action: 'AI_MATCHING_ERROR',
        resource: `job:${input.jobId}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        level: 'ERROR',
      });
      
      throw error;
    }
  }

  async getJobMatches(jobId: string): Promise<CandidateMatch[]> {
    const matches = await prisma.aIMatch.findMany({
      where: { jobId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            currentTitle: true,
            experience: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 20,
    });

    return matches.map(match => ({
      candidateId: match.candidateId,
      score: match.score,
      reasoning: match.reasoning || 'AI-generated match',
      factors: match.factors as any || {},
    }));
  }

  private formatJobForAI(job: any): string {
    return `
      Job Title: ${job.title}
      Location: ${job.location}
      Experience Level: ${job.experienceLevel || 'Not specified'}
      Remote Work: ${job.isRemote ? 'Yes' : 'No'}
      Salary Range: ${job.salaryMin && job.salaryMax ? `$${job.salaryMin} - $${job.salaryMax}` : 'Not specified'}
      
      Description:
      ${job.description}
      
      Requirements:
      ${job.requirements?.join('\n- ') || 'Not specified'}
    `.trim();
  }

  private calculateMatchFactors(job: any, candidate: any) {
    // Simple matching logic - in production, this would be more sophisticated
    const skillsMatch = this.calculateSkillsMatch(job.requirements || [], candidate.skills);
    const experienceMatch = this.calculateExperienceMatch(job.experienceLevel, candidate.experience);
    const locationMatch = this.calculateLocationMatch(job, candidate);
    const preferenceMatch = this.calculatePreferenceMatch(job, candidate);

    return {
      skillsMatch,
      experienceMatch,
      locationMatch,
      preferenceMatch,
    };
  }

  private calculateSkillsMatch(jobRequirements: string[], candidateSkills: string[]): number {
    if (!jobRequirements.length || !candidateSkills.length) return 50;
    
    const normalizedJobSkills = jobRequirements.join(' ').toLowerCase();
    const normalizedCandidateSkills = candidateSkills.join(' ').toLowerCase();
    
    let matches = 0;
    for (const skill of candidateSkills) {
      if (normalizedJobSkills.includes(skill.toLowerCase())) {
        matches++;
      }
    }
    
    return Math.min(100, (matches / candidateSkills.length) * 100);
  }

  private calculateExperienceMatch(jobExperience: string | null, candidateExperience: number): number {
    if (!jobExperience) return 70;
    
    const experienceMap: Record<string, number> = {
      'entry': 1,
      'junior': 2,
      'mid': 4,
      'senior': 7,
      'lead': 10,
      'principal': 12,
    };
    
    const requiredYears = experienceMap[jobExperience.toLowerCase()] || 3;
    const ratio = candidateExperience / requiredYears;
    
    if (ratio >= 0.8 && ratio <= 1.5) return 100;
    if (ratio >= 0.5 && ratio <= 2) return 80;
    if (ratio >= 0.3 && ratio <= 3) return 60;
    return 40;
  }

  private calculateLocationMatch(job: any, candidate: any): number {
    if (job.isRemote || candidate.remoteWork) return 100;
    if (candidate.willingToRelocate) return 80;
    
    const jobLocation = job.location?.toLowerCase() || '';
    const candidateCity = candidate.city?.toLowerCase() || '';
    const candidateCountry = candidate.country?.toLowerCase() || '';
    
    if (jobLocation.includes(candidateCity) || jobLocation.includes(candidateCountry)) {
      return 100;
    }
    
    return 30;
  }

  private calculatePreferenceMatch(job: any, candidate: any): number {
    let score = 70; // Base score
    
    // Salary expectations
    if (job.salaryMin && job.salaryMax && candidate.expectedSalary) {
      const isInRange = candidate.expectedSalary >= job.salaryMin && candidate.expectedSalary <= job.salaryMax;
      score += isInRange ? 20 : -10;
    }
    
    // Remote work preference
    if (job.isRemote && candidate.remoteWork) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private async storeAIMatch(jobId: string, candidateId: string, score: number, reasoning: string, factors: any) {
    try {
      await prisma.aIMatch.upsert({
        where: {
          jobId_candidateId: { jobId, candidateId },
        },
        update: {
          score,
          reasoning,
          factors,
        },
        create: {
          jobId,
          candidateId,
          score,
          reasoning,
          factors,
        },
      });
    } catch (error) {
      console.error('Error storing AI match:', error);
    }
  }
}

export const aiMatchingService = new AIMatchingService(); 