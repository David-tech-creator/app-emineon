#!/usr/bin/env node

/**
 * Algolia Setup Script
 * 
 * This script initializes Algolia indices and indexes existing data
 * Run this after setting up Algolia configuration
 */

// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { algoliasearch } = require('algoliasearch');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Algolia configuration
const ALGOLIA_APP_ID = '9U680JAGZW';
const ALGOLIA_WRITE_API_KEY = 'bdaaee793d25f0dfa3a67ebf95a2efe1';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);

// Transform candidate for Algolia
function transformCandidateForAlgolia(candidate) {
  return {
    objectID: candidate.id,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    fullName: `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim(),
    email: candidate.email,
    currentTitle: candidate.currentTitle,
    currentLocation: candidate.currentLocation,
    summary: candidate.summary,
    experienceYears: candidate.experienceYears,
    technicalSkills: candidate.technicalSkills || [],
    softSkills: candidate.softSkills || [],
    spokenLanguages: candidate.spokenLanguages || [],
    status: candidate.status,
    seniorityLevel: candidate.seniorityLevel,
    primaryIndustry: candidate.primaryIndustry,
    expectedSalary: candidate.expectedSalary,
    remotePreference: candidate.remotePreference,
    professionalHeadline: candidate.professionalHeadline,
    nationality: candidate.nationality,
    timezone: candidate.timezone,
    workPermitType: candidate.workPermitType,
    availableFrom: candidate.availableFrom,
    graduationYear: candidate.graduationYear,
    educationLevel: candidate.educationLevel,
    functionalDomain: candidate.functionalDomain,
    preferredContractType: candidate.preferredContractType,
    relocationWillingness: candidate.relocationWillingness,
    freelancer: candidate.freelancer,
    programmingLanguages: candidate.programmingLanguages || [],
    frameworks: candidate.frameworks || [],
    toolsAndPlatforms: candidate.toolsAndPlatforms || [],
    methodologies: candidate.methodologies || [],
    certifications: candidate.certifications || [],
    degrees: candidate.degrees || [],
    universities: candidate.universities || [],
    notableProjects: candidate.notableProjects || [],
    tags: candidate.tags || [],
    source: candidate.source,
    createdAt: candidate.createdAt,
    lastUpdated: candidate.lastUpdated,
    // Searchable text fields
    _searchableText: [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.currentTitle,
      candidate.currentLocation,
      candidate.summary,
      candidate.professionalHeadline,
      ...(candidate.technicalSkills || []),
      ...(candidate.softSkills || []),
      ...(candidate.spokenLanguages || []),
      ...(candidate.programmingLanguages || []),
      ...(candidate.frameworks || []),
      ...(candidate.toolsAndPlatforms || []),
      ...(candidate.methodologies || []),
      ...(candidate.certifications || []),
      ...(candidate.degrees || []),
      ...(candidate.universities || []),
      ...(candidate.tags || []),
    ].filter(Boolean).join(' '),
  };
}

// Transform job for Algolia
function transformJobForAlgolia(job) {
  return {
    objectID: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    responsibilities: job.responsibilities,
    salaryRange: job.salaryMin && job.salaryMax ? `${job.salaryCurrency} ${job.salaryMin} - ${job.salaryMax}` : null,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    department: job.department,
    skills: job.requirements?.filter(req => req.startsWith('Skill:'))?.map(req => req.replace('Skill: ', '')) || [],
    benefits: job.benefits || [],
    status: job.status,
    remote: job.isRemote,
    urgent: job.priority === 'high',
    featured: false, // Add featured field to schema if needed
    applicationDeadline: job.slaDeadline,
    startDate: job.startDate,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    // Searchable text fields
    _searchableText: [
      job.title,
      job.company,
      job.location,
      job.description,
      job.department,
      ...(job.requirements || []),
      ...(job.responsibilities || []),
      ...(job.benefits || []),
    ].filter(Boolean).join(' '),
  };
}

async function setupAlgoliaIndices() {
  try {
    console.log('🔧 Setting up Algolia indices...');

    // Candidate index settings
    const candidateSettings = {
      searchableAttributes: [
        'fullName',
        'firstName',
        'lastName',
        'email',
        'currentTitle',
        'currentLocation',
        'summary',
        'professionalHeadline',
        'technicalSkills',
        'softSkills',
        'spokenLanguages',
        'programmingLanguages',
        'frameworks',
        'toolsAndPlatforms',
        'methodologies',
        'certifications',
        'degrees',
        'universities',
        'tags',
        '_searchableText',
      ],
      attributesForFaceting: [
        'status',
        'seniorityLevel',
        'primaryIndustry',
        'remotePreference',
        'educationLevel',
        'functionalDomain',
        'preferredContractType',
        'nationality',
        'workPermitType',
        'technicalSkills',
        'programmingLanguages',
        'frameworks',
        'source',
      ],
      customRanking: [
        'desc(experienceYears)',
        'desc(createdAt)',
      ],
    };

    // Job index settings
    const jobSettings = {
      searchableAttributes: [
        'title',
        'company',
        'location',
        'description',
        'requirements',
        'responsibilities',
        'department',
        'skills',
        'benefits',
        '_searchableText',
      ],
      attributesForFaceting: [
        'status',
        'employmentType',
        'experienceLevel',
        'department',
        'remote',
        'urgent',
        'featured',
        'skills',
        'company',
        'location',
      ],
      customRanking: [
        'desc(featured)',
        'desc(urgent)',
        'desc(createdAt)',
      ],
    };

    // Configure indices
    await client.setSettings({
      indexName: 'candidates',
      indexSettings: candidateSettings
    });
    console.log('✅ Candidates index configured');

    await client.setSettings({
      indexName: 'jobs',
      indexSettings: jobSettings
    });
    console.log('✅ Jobs index configured');

    return true;
  } catch (error) {
    console.error('❌ Error setting up indices:', error);
    throw error;
  }
}

async function indexAllCandidates() {
  try {
    console.log('📊 Fetching all non-archived candidates...');
    
    const candidates = await prisma.candidate.findMany({
      where: { archived: false },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📝 Transforming ${candidates.length} candidates for Algolia...`);
    
    const algoliaObjects = candidates.map(transformCandidateForAlgolia);

    if (algoliaObjects.length > 0) {
      console.log('🚀 Uploading candidates to Algolia...');
      const result = await client.saveObjects({
        indexName: 'candidates',
        objects: algoliaObjects
      });
      console.log(`✅ Successfully indexed ${algoliaObjects.length} candidates`);
      return result;
    } else {
      console.log('ℹ️ No candidates to index');
      return { objectIDs: [] };
    }
  } catch (error) {
    console.error('❌ Error indexing candidates:', error);
    throw error;
  }
}

async function indexAllJobs() {
  try {
    console.log('📊 Fetching all active jobs...');
    
    const jobs = await prisma.job.findMany({
      where: { 
        status: { not: 'ARCHIVED' }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📝 Transforming ${jobs.length} jobs for Algolia...`);
    
    const algoliaObjects = jobs.map(transformJobForAlgolia);

    if (algoliaObjects.length > 0) {
      console.log('🚀 Uploading jobs to Algolia...');
      const result = await client.saveObjects({
        indexName: 'jobs',
        objects: algoliaObjects
      });
      console.log(`✅ Successfully indexed ${algoliaObjects.length} jobs`);
      return result;
    } else {
      console.log('ℹ️ No jobs to index');
      return { objectIDs: [] };
    }
  } catch (error) {
    console.error('❌ Error indexing jobs:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting Algolia setup...');
    
    // Step 1: Initialize indices
    await setupAlgoliaIndices();
    
    // Step 2: Index existing candidates
    await indexAllCandidates();
    
    // Step 3: Index existing jobs
    await indexAllJobs();
    
    console.log('🎉 Algolia setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test search functionality in the app');
    console.log('2. Monitor Algolia dashboard for search analytics');
    console.log('3. Fine-tune search settings based on usage patterns');
    
  } catch (error) {
    console.error('❌ Algolia setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  setupAlgoliaIndices,
  indexAllCandidates,
  indexAllJobs,
  transformCandidateForAlgolia,
  transformJobForAlgolia
};
