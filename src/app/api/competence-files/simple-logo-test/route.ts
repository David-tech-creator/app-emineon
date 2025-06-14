import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary-config';

export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'ready',
    endpoint: '/api/competence-files/simple-logo-test',
    message: 'Simple logo upload test endpoint (no auth)',
    supportedFormats: ['PNG', 'JPG', 'SVG', 'WebP'],
    maxFileSize: '2MB'
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple logo test endpoint called');

    // Get the uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No file provided',
        message: 'Please upload a logo file'
      }, { status: 400 });
    }

    console.log(`📁 File received: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type',
        message: `File type ${file.type} is not supported. Please upload PNG, JPG, SVG, or WebP files.`,
        supportedTypes: validTypes
      }, { status: 400 });
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File too large',
        message: `File size ${Math.round(file.size / 1024)}KB exceeds the 2MB limit.`,
        maxSize: '2MB'
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('☁️ Uploading to Cloudinary...');

    // Upload to Cloudinary
    const uploadResult = await uploadImageToCloudinary(
      buffer, 
      `test-logo-${Date.now()}`,
      [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    );

    console.log('✅ Upload successful:', uploadResult.url);

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: {
        logoUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Simple logo upload error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      message: 'Failed to upload logo to cloud storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 