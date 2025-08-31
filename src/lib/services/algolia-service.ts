import { 
  searchClient,
  writeClient,
  CANDIDATES_INDEX,
  JOBS_INDEX,
  transformCandidateForAlgolia,
  transformJobForAlgolia,
  candidateSearchConfig,
  jobSearchConfig
} from '@/lib/algolia';
import { prisma } from '@/lib/prisma';

export class AlgoliaService {
  // Initialize indices with proper settings
  static async initializeIndices() {
    try {
      console.log('🔧 Setting up Algolia indices...');

      // Configure candidates index
      await writeClient.setSettings({
        indexName: CANDIDATES_INDEX,
        indexSettings: candidateSearchConfig
      });
      console.log('✅ Candidates index configured');

      // Configure jobs index  
      await writeClient.setSettings({
        indexName: JOBS_INDEX,
        indexSettings: jobSearchConfig
      });
      console.log('✅ Jobs index configured');

      return { success: true };
    } catch (error) {
      console.error('❌ Error initializing Algolia indices:', error);
      throw error;
    }
  }

  // Index all candidates
  static async indexAllCandidates() {
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
        const result = await writeClient.saveObjects({
          indexName: CANDIDATES_INDEX,
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

  // Index all jobs
  static async indexAllJobs() {
    try {
      console.log('📊 Fetching all active jobs...');
      
      const jobs = await prisma.job.findMany({
        where: { 
          status: { not: 'ARCHIVED' } // Assuming jobs have similar archiving
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log(`📝 Transforming ${jobs.length} jobs for Algolia...`);
      
      const algoliaObjects = jobs.map(transformJobForAlgolia);

      if (algoliaObjects.length > 0) {
        console.log('🚀 Uploading jobs to Algolia...');
        const result = await writeClient.saveObjects({
          indexName: JOBS_INDEX,
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

  // Index a single candidate
  static async indexCandidate(candidateId: string) {
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId }
      });

      if (!candidate) {
        throw new Error('Candidate not found');
      }

      if (candidate.archived) {
        // Remove from index if archived
        await writeClient.deleteObject({
          indexName: CANDIDATES_INDEX,
          objectID: candidateId
        });
        console.log(`🗑️ Removed archived candidate ${candidateId} from Algolia`);
        return { deleted: true };
      } else {
        // Add/update in index
        const algoliaObject = transformCandidateForAlgolia(candidate);
        const result = await writeClient.saveObject({
          indexName: CANDIDATES_INDEX,
          body: algoliaObject
        });
        console.log(`✅ Indexed candidate ${candidateId} in Algolia`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error indexing candidate ${candidateId}:`, error);
      throw error;
    }
  }

  // Index a single job
  static async indexJob(jobId: string) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: jobId }
      });

      if (!job) {
        throw new Error('Job not found');
      }

      if (job.status === 'ARCHIVED') {
        // Remove from index if archived
        await writeClient.deleteObject({
          indexName: JOBS_INDEX,
          objectID: jobId
        });
        console.log(`🗑️ Removed archived job ${jobId} from Algolia`);
        return { deleted: true };
      } else {
        // Add/update in index
        const algoliaObject = transformJobForAlgolia(job);
        const result = await writeClient.saveObject({
          indexName: JOBS_INDEX,
          body: algoliaObject
        });
        console.log(`✅ Indexed job ${jobId} in Algolia`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Error indexing job ${jobId}:`, error);
      throw error;
    }
  }

  // Remove candidate from index
  static async removeCandidate(candidateId: string) {
    try {
      await writeClient.deleteObject({
        indexName: CANDIDATES_INDEX,
        objectID: candidateId
      });
      console.log(`🗑️ Removed candidate ${candidateId} from Algolia index`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error removing candidate ${candidateId} from Algolia:`, error);
      throw error;
    }
  }

  // Remove job from index
  static async removeJob(jobId: string) {
    try {
      await writeClient.deleteObject({
        indexName: JOBS_INDEX,
        objectID: jobId
      });
      console.log(`🗑️ Removed job ${jobId} from Algolia index`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Error removing job ${jobId} from Algolia:`, error);
      throw error;
    }
  }

  // Search candidates
  static async searchCandidates(query: string, filters?: any, options?: any) {
    try {
      const searchOptions = {
        hitsPerPage: options?.limit || 20,
        page: options?.page || 0,
        filters: filters ? Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== '')
          .map(([key, value]) => `${key}:"${value}"`)
          .join(' AND ') : '',
        ...options
      };

      const result = await searchClient.search({
        requests: [{
          indexName: CANDIDATES_INDEX,
          query,
          ...searchOptions
        }]
      });
      return result.results[0];
    } catch (error) {
      console.error('❌ Error searching candidates:', error);
      throw error;
    }
  }

  // Search jobs
  static async searchJobs(query: string, filters?: any, options?: any) {
    try {
      const searchOptions = {
        hitsPerPage: options?.limit || 20,
        page: options?.page || 0,
        filters: filters ? Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== '')
          .map(([key, value]) => `${key}:"${value}"`)
          .join(' AND ') : '',
        ...options
      };

      const result = await searchClient.search({
        requests: [{
          indexName: JOBS_INDEX,
          query,
          ...searchOptions
        }]
      });
      return result.results[0];
    } catch (error) {
      console.error('❌ Error searching jobs:', error);
      throw error;
    }
  }

  // Clear all indices (for development/testing)
  static async clearAllIndices() {
    try {
      await writeClient.clearObjects({ indexName: CANDIDATES_INDEX });
      await writeClient.clearObjects({ indexName: JOBS_INDEX });
      console.log('🧹 Cleared all Algolia indices');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing indices:', error);
      throw error;
    }
  }

  // Get index statistics
  static async getIndexStats() {
    try {
      const candidatesStats = await writeClient.getSettings({ indexName: CANDIDATES_INDEX });
      const jobsStats = await writeClient.getSettings({ indexName: JOBS_INDEX });
      
      return {
        candidates: candidatesStats,
        jobs: jobsStats
      };
    } catch (error) {
      console.error('❌ Error getting index stats:', error);
      throw error;
    }
  }
}
