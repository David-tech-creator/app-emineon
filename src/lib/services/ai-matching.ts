import { openaiService } from '@/lib/openai';

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  employmentType: string[];
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  isRemote: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  currentTitle?: string | null;
  professionalHeadline?: string | null;
  currentLocation?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  experienceYears?: number | null;
  technicalSkills: string[];
  softSkills: string[];
  primaryIndustry?: string | null;
  seniorityLevel?: string | null;
  expectedSalary?: string | null;
  remotePreference?: string | null;
  tags: string[];
  status: string;
  conversionStatus?: string | null;
  matchingScore?: number | null;
  source?: string | null;
  createdAt: Date;
  lastUpdated: Date;
}

export interface MatchResult {
  candidateId: string;
  score: number;
  reasoning: string;
  strengths: string[];
  concerns: string[];
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'WEAK_MATCH' | 'NO_MATCH';
}

export interface RankingResult {
  candidates: Array<{
    candidate: Candidate;
    score: number;
    reasoning: string;
  }>;
  totalCandidates: number;
  averageScore: number;
}

export class AIMatchingService {
  async matchCandidateToJob(candidate: Candidate, job: Job): Promise<MatchResult> {
    try {
      console.log(`Matching candidate ${candidate.fullName} to job ${job.title}`);
      
      // Get candidate data for matching
      const candidateData = {
        fullName: candidate.fullName,
        currentTitle: candidate.currentTitle,
        experienceYears: candidate.experienceYears,
        technicalSkills: candidate.technicalSkills,
        softSkills: candidate.softSkills,
        primaryIndustry: candidate.primaryIndustry,
        seniorityLevel: candidate.seniorityLevel,
        currentLocation: candidate.currentLocation,
        remotePreference: candidate.remotePreference,
        expectedSalary: candidate.expectedSalary,
      };

      // Calculate individual match scores
      const skillsMatch = this.calculateSkillsMatch(job.requirements, candidate.technicalSkills);
      const experienceMatch = this.calculateExperienceMatch(job.experienceLevel || null, candidate.experienceYears || null);
      const locationMatch = this.calculateLocationMatch(job.location, job.isRemote, candidate.currentLocation || null, candidate.remotePreference || null);
      const titleMatch = this.calculateTitleMatch(job.title, candidate.currentTitle || null);

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (skillsMatch * 0.4) + 
        (experienceMatch * 0.3) + 
        (locationMatch * 0.2) + 
        (titleMatch * 0.1)
      );

      // Generate reasoning and recommendation
      const { reasoning, strengths, concerns, recommendation } = this.generateMatchAnalysis(
        overallScore, skillsMatch, experienceMatch, locationMatch, titleMatch, candidate, job
      );

      return {
        candidateId: candidate.id,
        score: overallScore,
        reasoning,
        strengths,
        concerns,
        recommendation
      };

    } catch (error) {
      console.error('AI matching error:', error);
      
      // Return fallback match result
      return {
        candidateId: candidate.id,
        score: 50,
        reasoning: 'Unable to perform detailed matching analysis. Manual review recommended.',
        strengths: ['Profile available for review'],
        concerns: ['Automated matching unavailable'],
        recommendation: 'WEAK_MATCH'
      };
    }
  }

  async rankCandidatesForJob(candidates: Candidate[], job: Job): Promise<RankingResult> {
    try {
      console.log(`Ranking ${candidates.length} candidates for job: ${job.title}`);

      // Get match results for all candidates
      const matchResults = await Promise.all(
        candidates.map(async (candidate) => {
          const match = await this.matchCandidateToJob(candidate, job);
          return {
            candidate,
            score: match.score,
            reasoning: match.reasoning
          };
        })
      );

      // Sort by score (highest first)
      const rankedCandidates = matchResults.sort((a, b) => b.score - a.score);

      // Calculate statistics
      const totalCandidates = candidates.length;
      const averageScore = Math.round(
        rankedCandidates.reduce((sum, result) => sum + result.score, 0) / totalCandidates
      );

      return {
        candidates: rankedCandidates,
        totalCandidates,
        averageScore
      };

    } catch (error) {
      console.error('Candidate ranking error:', error);
      
      // Return fallback ranking
      return {
        candidates: candidates.map(candidate => ({
          candidate,
          score: 50,
          reasoning: 'Automated ranking unavailable. Manual review recommended.'
        })),
        totalCandidates: candidates.length,
        averageScore: 50
      };
    }
  }

  private calculateSkillsMatch(jobRequirements: string[], candidateSkills: string[]): number {
    if (!jobRequirements.length || !candidateSkills.length) return 50;

    const normalizedJobSkills = jobRequirements.map(skill => skill.toLowerCase().trim());
    const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase().trim());

    let matchCount = 0;
    let partialMatchCount = 0;

    normalizedJobSkills.forEach(jobSkill => {
      const exactMatch = normalizedCandidateSkills.some(candidateSkill => 
        candidateSkill === jobSkill
      );
      
      if (exactMatch) {
        matchCount++;
      } else {
        const partialMatch = normalizedCandidateSkills.some(candidateSkill => 
          candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
        );
        if (partialMatch) {
          partialMatchCount++;
        }
      }
    });

    const exactMatchScore = (matchCount / normalizedJobSkills.length) * 100;
    const partialMatchScore = (partialMatchCount / normalizedJobSkills.length) * 50;
    
    return Math.min(100, Math.round(exactMatchScore + partialMatchScore));
  }

  private calculateExperienceMatch(jobExperience: string | null, candidateExperience: number | null): number {
    if (!jobExperience) return 70;
    if (!candidateExperience) return 30;

    const experienceMap: { [key: string]: number } = {
      'entry': 1,
      'junior': 2,
      'mid': 4,
      'senior': 7,
      'lead': 10,
      'principal': 12,
      'director': 15
    };

    const requiredYears = experienceMap[jobExperience.toLowerCase()] || 3;
    const ratio = candidateExperience / requiredYears;

    if (ratio >= 0.8 && ratio <= 1.5) return 100;
    if (ratio >= 0.6 && ratio <= 2.0) return 80;
    if (ratio >= 0.4 && ratio <= 3.0) return 60;
    return 30;
  }

  private calculateLocationMatch(
    jobLocation: string, 
    isRemote: boolean, 
    candidateLocation: string | null, 
    remotePreference: string | null
  ): number {
    if (isRemote) {
      if (remotePreference === 'REMOTE' || remotePreference === 'FLEXIBLE') return 100;
      if (remotePreference === 'HYBRID') return 80;
      return 60; // ONSITE preference but remote job
    }

    if (!candidateLocation) return 50;

    // Simple location matching (could be enhanced with geocoding)
    const jobLocationLower = jobLocation.toLowerCase();
    const candidateLocationLower = candidateLocation.toLowerCase();

    if (candidateLocationLower.includes(jobLocationLower) || 
        jobLocationLower.includes(candidateLocationLower)) {
      return 100;
    }

    // Check for same city/state
    const jobParts = jobLocationLower.split(',').map(part => part.trim());
    const candidateParts = candidateLocationLower.split(',').map(part => part.trim());

    const hasCommonLocation = jobParts.some(jobPart => 
      candidateParts.some(candidatePart => 
        candidatePart.includes(jobPart) || jobPart.includes(candidatePart)
      )
    );

    if (hasCommonLocation) return 80;

    // Remote preference for on-site job
    if (remotePreference === 'REMOTE') return 20;
    if (remotePreference === 'HYBRID') return 40;
    
    return 30; // Different locations, no remote preference
  }

  private calculateTitleMatch(jobTitle: string, candidateTitle: string | null): number {
    if (!candidateTitle) return 30;

    const jobTitleLower = jobTitle.toLowerCase();
    const candidateTitleLower = candidateTitle.toLowerCase();

    // Exact match
    if (jobTitleLower === candidateTitleLower) return 100;

    // Check for key words
    const jobWords = jobTitleLower.split(' ').filter(word => word.length > 2);
    const candidateWords = candidateTitleLower.split(' ').filter(word => word.length > 2);

    const matchingWords = jobWords.filter(word => 
      candidateWords.some(candidateWord => 
        candidateWord.includes(word) || word.includes(candidateWord)
      )
    );

    const matchRatio = matchingWords.length / jobWords.length;
    return Math.round(matchRatio * 100);
  }

  private generateMatchAnalysis(
    overallScore: number,
    skillsMatch: number,
    experienceMatch: number,
    locationMatch: number,
    titleMatch: number,
    candidate: Candidate,
    job: Job
  ) {
    const strengths: string[] = [];
    const concerns: string[] = [];

    // Analyze strengths
    if (skillsMatch >= 80) strengths.push('Strong technical skills alignment');
    if (experienceMatch >= 80) strengths.push('Excellent experience level match');
    if (locationMatch >= 80) strengths.push('Great location/remote preference fit');
    if (titleMatch >= 70) strengths.push('Relevant title and role experience');
    if (candidate.technicalSkills.length >= 5) strengths.push('Diverse technical skill set');

    // Analyze concerns
    if (skillsMatch < 50) concerns.push('Limited technical skills overlap');
    if (experienceMatch < 50) concerns.push('Experience level mismatch');
    if (locationMatch < 40) concerns.push('Location/remote preference concerns');
    if (titleMatch < 30) concerns.push('Different role background');

    // Generate recommendation
    let recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'WEAK_MATCH' | 'NO_MATCH';
    if (overallScore >= 85) recommendation = 'STRONG_MATCH';
    else if (overallScore >= 70) recommendation = 'GOOD_MATCH';
    else if (overallScore >= 50) recommendation = 'WEAK_MATCH';
    else recommendation = 'NO_MATCH';

    // Generate reasoning
    const reasoning = `Overall match score of ${overallScore}% based on skills (${skillsMatch}%), experience (${experienceMatch}%), location (${locationMatch}%), and title relevance (${titleMatch}%). ${strengths.length > 0 ? 'Key strengths: ' + strengths.join(', ') + '. ' : ''}${concerns.length > 0 ? 'Areas of concern: ' + concerns.join(', ') + '.' : ''}`;

    return { reasoning, strengths, concerns, recommendation };
  }

  // Mock AI-powered ranking for development
  async mockAIRanking(candidates: Candidate[]): Promise<Array<{ candidate: Candidate; score: number; reasoning: string }>> {
    // Return mock rankings based on experience and skills match
    return candidates.map(candidate => ({
      candidate,
      score: Math.min(90, (candidate.experienceYears || 0) * 8 + Math.random() * 20),
      reasoning: `Strong match with ${candidate.experienceYears || 0} years experience and relevant skills: ${candidate.technicalSkills.slice(0, 2).join(', ')}`
    })).sort((a, b) => b.score - a.score);
  }
}

export const aiMatchingService = new AIMatchingService(); 