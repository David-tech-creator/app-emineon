import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test logo upload endpoint called');

    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        error: 'No file provided',
        message: 'Please upload a logo file'
      }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type',
        message: 'Please upload a PNG, JPG, SVG, or WebP image'
      }, { status: 400 });
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({
        error: 'File too large',
        message: 'Logo file size must be less than 2MB'
      }, { status: 400 });
    }

    console.log(`📁 Processing test logo: ${file.name} (${file.size} bytes, ${file.type})`);

    try {
      // Convert file to buffer for Cloudinary upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a unique filename for the logo
      const timestamp = Date.now();
      const filename = `test_logo_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // Upload to Cloudinary with image optimizations
      console.log('☁️ Uploading test logo to Cloudinary...');
      const result = await uploadImageToCloudinary(buffer, filename, [
        { width: 200, height: 200, crop: 'limit' }, // Limit size for logos
        { quality: 'auto' }, // Optimize quality
        { format: 'auto' } // Auto format selection
      ]);

      console.log('✅ Test logo uploaded successfully:', result.url);

      return NextResponse.json({
        success: true,
        data: {
          logoUrl: result.url,
          publicId: result.publicId,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
        message: 'Test logo uploaded successfully'
      });

    } catch (uploadError: any) {
      console.error('❌ Cloudinary test upload error:', uploadError);
      
      return NextResponse.json({
        error: 'Upload failed',
        message: 'Failed to upload test logo to cloud storage',
        details: uploadError?.message || 'Unknown upload error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('💥 Test logo upload error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while uploading the test logo.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test logo upload endpoint',
    supportedFormats: ['PNG', 'JPG', 'SVG', 'WebP'],
    maxFileSize: '2MB',
    authentication: 'not required',
    endpoint: '/api/competence-files/test-logo-upload',
    status: 'active'
  });
} 