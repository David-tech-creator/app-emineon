import { put, del, list } from '@vercel/blob';

export interface FileUploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
  contentType: string;
  metadata?: Record<string, any>;
}

export type FileCategory = 
  | 'competence-files'
  | 'cv-uploads'
  | 'avatars'
  | 'logos'
  | 'documents'
  | 'templates'
  | 'applications'
  | 'jobs';

export interface FileMetadata {
  userId?: string;
  candidateId?: string;
  jobId?: string;
  applicationId?: string;
  category: FileCategory;
  tags?: string[];
  description?: string;
  uploadedAt: string;
}

export class UniversalStorageService {
  private readonly bucketPrefix = 'emineon-ats';

  // Generate organized file path
  private generateFilePath(category: FileCategory, fileName: string, metadata?: FileMetadata): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    
    // Organize files by category and date
    const dateFolder = new Date().toISOString().slice(0, 7); // YYYY-MM
    return `${this.bucketPrefix}/${category}/${dateFolder}/${uniqueFileName}`;
  }

  // Upload any file type with proper categorization
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    category: FileCategory,
    metadata?: Partial<FileMetadata>
  ): Promise<FileUploadResult> {
    try {
      const fileMetadata: FileMetadata = {
        category,
        uploadedAt: new Date().toISOString(),
        ...metadata
      };

      const filePath = this.generateFilePath(category, fileName, fileMetadata);

      // Upload to Vercel Blob
      const blob = await put(filePath, buffer, {
        access: 'public',
        contentType,
        addRandomSuffix: false,
      });

      return {
        url: blob.url,
        path: filePath,
        fileName: fileName,
        size: buffer.length,
        contentType,
        metadata: fileMetadata,
      };
    } catch (error) {
      console.error(`Failed to upload ${category} file:`, error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get file URL
  async getFileUrl(filePathOrUrl: string): Promise<string> {
    if (filePathOrUrl.startsWith('http')) {
      return filePathOrUrl;
    }
    
    try {
      const { blobs } = await list({ prefix: filePathOrUrl });
      if (blobs.length > 0) {
        return blobs[0].url;
      }
      throw new Error(`File not found: ${filePathOrUrl}`);
    } catch (error) {
      console.error('Failed to get file URL:', error);
      throw new Error(`Failed to get file URL: ${filePathOrUrl}`);
    }
  }

  // Delete file
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      await del(fileUrl);
    } catch (error) {
      console.warn('Failed to delete file:', fileUrl, error);
    }
  }

  // List files by category
  async listFilesByCategory(category: FileCategory, limit: number = 100): Promise<FileUploadResult[]> {
    try {
      const prefix = `${this.bucketPrefix}/${category}/`;
      const { blobs } = await list({ prefix, limit });
      
      return blobs.map(blob => ({
        url: blob.url,
        path: blob.pathname,
        fileName: blob.pathname.split('/').pop() || '',
        size: blob.size,
        contentType: 'application/octet-stream',
        metadata: undefined,
      }));
    } catch (error) {
      console.warn(`Failed to list ${category} files:`, error);
      return [];
    }
  }

  // Check if file exists
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const response = await fetch(fileUrl, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Fallback local storage for development
export class LocalUniversalStorage {
  private uploadsDir: string;

  constructor(uploadsDir: string = 'public/uploads') {
    this.uploadsDir = uploadsDir;
  }

  private async ensureDirectory(category: FileCategory): Promise<string> {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const categoryDir = path.join(this.uploadsDir, category);
    try {
      await fs.access(categoryDir);
    } catch {
      await fs.mkdir(categoryDir, { recursive: true });
    }
    return categoryDir;
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string,
    category: FileCategory,
    metadata?: Partial<FileMetadata>
  ): Promise<FileUploadResult> {
    const { promises: fs } = await import('fs');
    const path = await import('path');
    
    const categoryDir = await this.ensureDirectory(category);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(categoryDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const publicPath = filePath.replace('public/', '/');
    
    return {
      url: publicPath,
      path: filePath,
      fileName: fileName,
      size: buffer.length,
      contentType,
      metadata: {
        category,
        uploadedAt: new Date().toISOString(),
        ...metadata
      },
    };
  }

  async getFileUrl(filePath: string): Promise<string> {
    return filePath.replace('public/', '/');
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const { promises: fs } = await import('fs');
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete file:', filePath, error);
    }
  }

  async listFilesByCategory(category: FileCategory): Promise<FileUploadResult[]> {
    try {
      const { promises: fs } = await import('fs');
      const path = await import('path');
      
      const categoryDir = path.join(this.uploadsDir, category);
      await this.ensureDirectory(category);
      
      const files = await fs.readdir(categoryDir);
      const results: FileUploadResult[] = [];
      
      for (const file of files) {
        const filePath = path.join(categoryDir, file);
        const stats = await fs.stat(filePath);
        const publicPath = filePath.replace('public/', '/');
        
        results.push({
          url: publicPath,
          path: filePath,
          fileName: file,
          size: stats.size,
          contentType: 'application/octet-stream',
          metadata: {
            category,
            uploadedAt: stats.birthtime.toISOString(),
          },
        });
      }
      
      return results;
    } catch (error) {
      console.warn(`Failed to list ${category} files:`, error);
      return [];
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const { promises: fs } = await import('fs');
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Create storage service based on environment
function createUniversalStorage() {
  if (process.env.NODE_ENV === 'production' || process.env.BLOB_READ_WRITE_TOKEN) {
    return new UniversalStorageService();
  } else {
    return new LocalUniversalStorage();
  }
}

// Export default instance
export const universalStorage = createUniversalStorage();

// Specialized utility functions for each file type
export class FileTypeUtils {
  // CV/Resume uploads
  static async uploadCV(
    buffer: Buffer,
    fileName: string,
    candidateId?: string,
    userId?: string
  ): Promise<FileUploadResult> {
    const contentType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return universalStorage.uploadFile(buffer, fileName, contentType, 'cv-uploads', {
      candidateId,
      userId,
      description: 'CV/Resume upload for parsing',
    });
  }

  // Avatar/Profile images
  static async uploadAvatar(
    buffer: Buffer,
    fileName: string,
    userId?: string,
    candidateId?: string
  ): Promise<FileUploadResult> {
    const contentType = `image/${fileName.split('.').pop()?.toLowerCase() || 'jpeg'}`;
    
    return universalStorage.uploadFile(buffer, fileName, contentType, 'avatars', {
      userId,
      candidateId,
      description: 'Profile avatar image',
    });
  }

  // Company logos
  static async uploadLogo(
    buffer: Buffer,
    fileName: string,
    companyName?: string,
    userId?: string
  ): Promise<FileUploadResult> {
    const contentType = `image/${fileName.split('.').pop()?.toLowerCase() || 'png'}`;
    
    return universalStorage.uploadFile(buffer, fileName, contentType, 'logos', {
      userId,
      description: `Company logo for ${companyName || 'organization'}`,
      tags: ['branding', 'logo'],
    });
  }

  // AI Copilot documents
  static async uploadDocument(
    buffer: Buffer,
    fileName: string,
    userId?: string,
    docType?: string
  ): Promise<FileUploadResult> {
    const contentType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return universalStorage.uploadFile(buffer, fileName, contentType, 'documents', {
      userId,
      description: `Document for AI analysis: ${docType || 'general'}`,
      tags: ['ai-analysis', docType].filter(Boolean) as string[],
    });
  }

  // Job-related files
  static async uploadJobFile(
    buffer: Buffer,
    fileName: string,
    jobId: string,
    userId?: string,
    fileType?: string
  ): Promise<FileUploadResult> {
    const contentType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return universalStorage.uploadFile(buffer, fileName, contentType, 'jobs', {
      jobId,
      userId,
      description: `Job-related file: ${fileType || 'attachment'}`,
      tags: ['job-posting', fileType].filter(Boolean) as string[],
    });
  }

  // Application attachments
  static async uploadApplicationFile(
    buffer: Buffer,
    fileName: string,
    applicationId: string,
    candidateId?: string,
    fileType?: string
  ): Promise<FileUploadResult> {
    const contentType = fileName.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return universalStorage.uploadFile(buffer, fileName, contentType, 'applications', {
      applicationId,
      candidateId,
      description: `Application attachment: ${fileType || 'document'}`,
      tags: ['application', fileType].filter(Boolean) as string[],
    });
  }

  // Template assets
  static async uploadTemplateAsset(
    buffer: Buffer,
    fileName: string,
    userId?: string,
    assetType?: string
  ): Promise<FileUploadResult> {
    let contentType = 'application/octet-stream';
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
      contentType = `image/${ext}`;
    } else if (['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
      contentType = `font/${ext}`;
    }

    return universalStorage.uploadFile(buffer, fileName, contentType, 'templates', {
      userId,
      description: `Template asset: ${assetType || 'resource'}`,
      tags: ['template', assetType].filter(Boolean) as string[],
    });
  }
}

// Export legacy storage for competence files (backwards compatibility)
export const competenceFileStorage = {
  uploadFile: async (buffer: Buffer, fileName: string, contentType: string, metadata?: any) => {
    return universalStorage.uploadFile(buffer, fileName, contentType, 'competence-files', metadata);
  },
  getFileUrl: universalStorage.getFileUrl.bind(universalStorage),
  deleteFile: universalStorage.deleteFile.bind(universalStorage),
  fileExists: universalStorage.fileExists.bind(universalStorage),
};

// Maintain backwards compatibility
export { competenceFileStorage as default };
export async function uploadCompetenceFile(
  buffer: Buffer,
  fileName: string,
  format: 'pdf' | 'docx',
  candidateData: any,
  templateData: any
): Promise<FileUploadResult> {
  const contentType = format === 'pdf' 
    ? 'application/pdf' 
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const metadata = {
    candidateId: candidateData.id,
    candidateName: candidateData.fullName,
    templateId: templateData.id,
    templateName: templateData.name,
    format,
    generatedAt: new Date().toISOString(),
  };

  return universalStorage.uploadFile(buffer, fileName, contentType, 'competence-files', metadata);
}

export async function getCompetenceFileUrl(filePath: string): Promise<string> {
  return universalStorage.getFileUrl(filePath);
} 