import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadToCloudinary } from '@/lib/cloudinary-config';
import { generatePDF } from '@/lib/pdf-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - REQUIRED for all users
    const { userId } = auth();
    
    if (!userId) {
      console.log('❌ Authentication required for test generate');
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required to access this endpoint'
      }, { status: 401 });
    }

    console.log('✅ User authenticated for test generate:', userId);
    console.log('🧪 Test generate endpoint called');
  
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('❌ Invalid JSON in request body');
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON format',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }
    
    console.log('📋 Request body received:', JSON.stringify(body, null, 2));
    
    const { candidateData, format = 'pdf', logoUrl, footerText } = body;

    if (!candidateData) {
      console.error('❌ Missing candidate data');
      return NextResponse.json({
        success: false,
        error: 'Missing candidate data',
        message: 'candidateData is required'
      }, { status: 400 });
    }

    if (!candidateData.fullName) {
      console.error('❌ Missing candidate name');
      return NextResponse.json({
        success: false,
        error: 'Missing candidate name',
        message: 'candidateData.fullName is required'
      }, { status: 400 });
    }

    console.log('👤 Processing candidate:', candidateData.fullName);

    // Generate enhanced HTML content with logo support
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Competence File - ${candidateData.fullName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333; 
            line-height: 1.6; 
          }
          .header { 
            border-bottom: 2px solid #3B82F6; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            position: relative;
          }
          .logo {
            position: absolute;
            top: 0;
            right: 0;
            max-height: 60px;
            max-width: 200px;
            object-fit: contain;
          }
          .header-content {
            ${logoUrl ? 'margin-right: 220px;' : ''}
          }
          .name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #1F2937; 
          }
          .title { 
            font-size: 18px; 
            color: #6B7280; 
            margin-top: 5px; 
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #374151; 
            margin-bottom: 10px; 
            border-bottom: 1px solid #E5E7EB; 
            padding-bottom: 5px; 
          }
          .skill-list { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 8px; 
          }
          .skill { 
            background: #EFF6FF; 
            color: #1E40AF; 
            padding: 4px 12px; 
            border-radius: 6px; 
            font-size: 14px; 
          }
          .contact-info { 
            display: flex; 
            gap: 20px; 
            flex-wrap: wrap; 
            margin-top: 10px; 
          }
          .contact-item { 
            color: #6B7280; 
          }
          .footer {
            margin-top: 40px; 
            text-align: center; 
            color: #9CA3AF; 
            font-size: 12px;
            border-top: 1px solid #E5E7EB;
            padding-top: 20px;
          }
          @media print { 
            body { margin: 20px; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" class="logo" />` : ''}
          <div class="header-content">
          <div class="name">${candidateData.fullName}</div>
          <div class="title">${candidateData.currentTitle || 'Professional'}</div>
          <div class="contact-info">
            ${candidateData.email ? `<div class="contact-item">📧 ${candidateData.email}</div>` : ''}
            ${candidateData.phone ? `<div class="contact-item">📞 ${candidateData.phone}</div>` : ''}
            ${candidateData.location ? `<div class="contact-item">📍 ${candidateData.location}</div>` : ''}
            </div>
          </div>
        </div>

        ${candidateData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${candidateData.summary}</p>
        </div>
        ` : ''}

        ${candidateData.skills && candidateData.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skill-list">
            ${candidateData.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        ${candidateData.experience && candidateData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Experience</div>
          ${candidateData.experience.map((exp: any) => `
            <div style="margin-bottom: 15px;">
              <div style="font-weight: bold;">${exp.title} at ${exp.company}</div>
              <div style="color: #6B7280; font-size: 14px;">${exp.startDate} - ${exp.endDate}</div>
              <div style="margin-top: 5px;">${exp.responsibilities}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${candidateData.education && candidateData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${candidateData.education.map((edu: string) => `<div>• ${edu}</div>`).join('')}
        </div>
        ` : ''}

        ${candidateData.certifications && candidateData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${candidateData.certifications.map((cert: string) => `<div>• ${cert}</div>`).join('')}
        </div>
        ` : ''}

        ${candidateData.languages && candidateData.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Languages</div>
          ${candidateData.languages.map((lang: string) => `<div>• ${lang}</div>`).join('')}
        </div>
        ` : ''}

        <div class="footer">
          ${footerText || `Generated on ${new Date().toLocaleDateString()} by Emineon ATS`}
        </div>
      </body>
      </html>
    `;

    console.log('📄 HTML content generated, length:', htmlContent.length);

    if (format === 'pdf') {
      // Use the new PDF service
      try {
        console.log('🚀 Generating PDF with new service...');
        const pdfBuffer = await generatePDF(htmlContent);
        console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

        // Upload to Cloudinary with proper filename
        console.log('☁️ Uploading to Cloudinary...');
        const fileName = `${candidateData.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        const uploadResult = await uploadToCloudinary(
          pdfBuffer,
          fileName,
          'competence-files'
        );
        console.log('✅ Upload successful:', uploadResult.url);

        return NextResponse.json({
          success: true,
          data: {
            fileUrl: uploadResult.url,
            fileName: fileName,
            fileSize: pdfBuffer.length,
            format: 'pdf'
          },
          message: 'PDF generated and uploaded successfully'
        });

      } catch (pdfError: unknown) {
        console.error('❌ PDF generation error:', pdfError);
        console.error('❌ Error stack:', pdfError instanceof Error ? pdfError.stack : 'No stack trace');
        
        // Fallback: return HTML content as file
        console.log('🔄 Falling back to HTML generation...');
        const htmlBuffer = Buffer.from(htmlContent, 'utf8');
        const fileName = `${candidateData.fullName.replace(/\s+/g, '_')}_${Date.now()}.html`;
        
        try {
          const uploadResult = await uploadToCloudinary(
            htmlBuffer,
            fileName,
            'competence-files'
          );
          console.log('✅ HTML fallback upload successful:', uploadResult.url);

          return NextResponse.json({
            success: true,
            data: {
              fileUrl: uploadResult.url,
              fileName: fileName,
              fileSize: htmlBuffer.length,
              format: 'html'
            },
            message: 'HTML file generated as fallback (PDF generation failed)',
            warning: `PDF generation failed: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`,
            error: pdfError instanceof Error ? pdfError.message : String(pdfError)
          });
        } catch (uploadError) {
          console.error('❌ HTML upload also failed:', uploadError);
          throw uploadError;
        }
      }
    } else {
      // For DOCX format, return HTML as fallback
      console.log('📄 Generating HTML file for DOCX format...');
      const htmlBuffer = Buffer.from(htmlContent, 'utf8');
      const fileName = `${candidateData.fullName.replace(/\s+/g, '_')}_${Date.now()}.html`;
      
      const uploadResult = await uploadToCloudinary(
        htmlBuffer,
        fileName,
        'competence-files'
      );
      console.log('✅ HTML upload successful:', uploadResult.url);

      return NextResponse.json({
        success: true,
        data: {
          fileUrl: uploadResult.url,
          fileName: fileName,
          fileSize: htmlBuffer.length,
          format: 'html'
        },
        message: 'HTML file generated (DOCX not yet implemented)',
        warning: 'DOCX generation not implemented, HTML provided instead'
      });
    }

  } catch (error) {
    console.error('💥 Test generation error:', error);
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    endpoint: 'test-generate',
    features: ['pdf-generation', 'html-fallback', 'cloudinary-upload'],
    timestamp: new Date().toISOString()
  });
} 