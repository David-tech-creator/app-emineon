import { v2 as cloudinary } from 'cloudinary';

// Force correct Cloudinary Configuration
console.log('🔧 Configuring Cloudinary with cloud_name: emineon');

cloudinary.config({
  cloud_name: 'emineon',
  api_key: '452814944399829',
  api_secret: 'c1vCg07L1avVzo-WludXlXhYgDs',
  secure: true,
});

// Verify configuration
const config = cloudinary.config();
console.log('✅ Cloudinary config verified:', { 
  cloud_name: config.cloud_name,
  api_key: config.api_key ? config.api_key.substring(0, 5) + '...' : 'not set'
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string,
  folder: string = 'competence-files'
): Promise<{ url: string; publicId: string }> => {
  console.log('📤 Attempting upload to cloud_name:', cloudinary.config().cloud_name);
  
  // Remove extension from filename for public_id to avoid double extensions
  const publicId = filename.replace(/\.[^/.]+$/, '');
  
  // Determine resource type based on file extension
  const isPdf = filename.toLowerCase().endsWith('.pdf');
  const resourceType = isPdf ? 'raw' : 'auto';
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: `emineon-ats/${folder}`,
        public_id: publicId,
        overwrite: true,
        // Only apply transformations for non-PDF files
        ...(isPdf ? {} : {
          transformation: [
            { quality: 'auto' },
            { format: 'auto' }
          ]
        })
      },
      (error: any, result: any) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload successful:', result.secure_url);
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id
          });
        }
      }
    ).end(buffer);
  });
};

export const uploadImageToCloudinary = async (
  buffer: Buffer,
  filename: string,
  transformations?: any[]
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'emineon-ats/images',
        public_id: filename,
        overwrite: true,
        transformation: transformations || [
          { width: 400, height: 400, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id
          });
        }
      }
    ).end(buffer);
  });
};

export default cloudinary; 