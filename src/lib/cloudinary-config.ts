import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
console.log('🔧 Configuring Cloudinary...');

// Check if CLOUDINARY_URL is available (single URL format)
if (process.env.CLOUDINARY_URL) {
  console.log('✅ Using CLOUDINARY_URL configuration');
  // Cloudinary will automatically parse the CLOUDINARY_URL
} else {
  // Fallback to individual environment variables
  console.log('🔧 Using individual environment variables');
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'emineon',
    api_key: process.env.CLOUDINARY_API_KEY || '452814944399829',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'c1vCg07L1avVzo-WludXlXhYgDs',
    secure: true,
  });
}

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
  
  // Use auto resource type for all files to avoid access issues
  const publicId = filename.replace(/\.[^/.]+$/, ''); // Remove extension to avoid double extensions
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `emineon-ats/${folder}`,
        public_id: publicId,
        overwrite: true,
        type: 'upload',
        invalidate: true
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