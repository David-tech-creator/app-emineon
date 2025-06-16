import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { uploadToCloudinary } from '@/lib/cloudinary-config';
import { generatePDF } from '@/lib/pdf-service';

export async function POST(request: NextRequest) {
  try {
    // Check authentication - Allow bypass for testing purposes
    const { userId } = auth();
    
    if (!userId) {
      console.log('⚠️ No authentication found, proceeding for testing purposes');
      // Don't return error, allow testing to continue
    } else {
      console.log('✅ User authenticated for test generate:', userId);
    }

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

    // Generate enhanced HTML content with improved styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Competence File - ${candidateData.fullName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 40px; 
            color: #2D3748; 
            line-height: 1.6; 
            background: #ffffff;
          }
          
          .header { 
            border-bottom: 3px solid #3B82F6; 
            padding-bottom: 25px; 
            margin-bottom: 35px; 
            position: relative;
          }
          
          .logo {
            position: absolute;
            top: 0;
            right: 0;
            max-height: 70px;
            max-width: 220px;
            object-fit: contain;
          }
          
          .header-content {
            ${logoUrl ? 'margin-right: 240px;' : ''}
          }
          
          .candidate-header h1 { 
            font-size: 32px; 
            font-weight: 700; 
            color: #1A202C; 
            margin-bottom: 8px;
          }
          
          .candidate-header h2 { 
            font-size: 20px; 
            color: #4A5568; 
            margin-bottom: 15px;
            font-weight: 500;
          }
          
          .contact-info {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 12px;
          }
          
          .contact-info span {
            color: #718096;
            font-size: 14px;
            background: #F7FAFC;
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #E2E8F0;
          }
          
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          
          .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            color: #2D3748; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #E2E8F0; 
            padding-bottom: 8px; 
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Professional Summary Styles */
          .professional-summary p {
            font-size: 16px;
            line-height: 1.7;
            color: #4A5568;
            text-align: justify;
          }
          
          /* Experience Styles */
          .experience-section {
            space-y: 20px;
          }
          
          .experience-item {
            margin-bottom: 25px;
            padding: 20px;
            background: #F8F9FA;
            border-radius: 8px;
            border-left: 4px solid #3B82F6;
          }
          
          .experience-item.current-role {
            background: #EBF8FF;
            border-left-color: #1E40AF;
          }
          
          .role-header {
            margin-bottom: 12px;
          }
          
          .job-title {
            font-size: 18px;
            font-weight: 600;
            color: #1A202C;
            margin-bottom: 4px;
          }
          
          .company-name {
            font-size: 16px;
            color: #3B82F6;
            font-weight: 500;
            margin-bottom: 8px;
          }
          
          .employment-period {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .date-range {
            color: #718096;
            font-size: 14px;
            font-weight: 500;
          }
          
          .current-badge {
            background: #10B981;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .responsibilities p {
            color: #4A5568;
            line-height: 1.6;
            margin-top: 10px;
          }
          
          /* Skills Styles */
          .skills-section {
            space-y: 15px;
          }
          
          .skill-category {
            margin-bottom: 20px;
          }
          
          .skill-category h4 {
            font-size: 16px;
            font-weight: 600;
            color: #2D3748;
            margin-bottom: 10px;
          }
          
          .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .skill-tag {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .skill-tag.technical {
            background: #EBF8FF;
            color: #1E40AF;
            border: 1px solid #BFDBFE;
          }
          
          .skill-tag.general {
            background: #F0FDF4;
            color: #166534;
            border: 1px solid #BBF7D0;
          }
          
          /* Education Styles */
          .education-section {
            space-y: 12px;
          }
          
          .education-item {
            margin-bottom: 15px;
            padding: 15px;
            background: #FFFBEB;
            border-radius: 6px;
            border-left: 3px solid #F59E0B;
          }
          
          .degree-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .education-icon {
            font-size: 18px;
          }
          
          .degree-text {
            color: #92400E;
            font-weight: 500;
          }
          
          /* Certifications Styles */
          .certifications-section {
            space-y: 12px;
          }
          
          .certification-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #FEF2F2;
            border-radius: 6px;
            border-left: 3px solid #EF4444;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .cert-icon {
            font-size: 16px;
          }
          
          .cert-text {
            color: #991B1B;
            font-weight: 500;
          }
          
          /* Languages Styles */
          .languages-section {
            space-y: 12px;
          }
          
          .language-item {
            margin-bottom: 12px;
            padding: 12px;
            background: #F0F9FF;
            border-radius: 6px;
            border-left: 3px solid #0EA5E9;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .language-icon {
            font-size: 16px;
          }
          
          .language-text {
            color: #0C4A6E;
            font-weight: 500;
          }
          
          /* Utility Styles */
          .no-content {
            color: #9CA3AF;
            font-style: italic;
            text-align: center;
            padding: 20px;
            background: #F9FAFB;
            border-radius: 6px;
          }
          
          .custom-section {
            padding: 20px;
            background: #F8F9FA;
            border-radius: 6px;
            border: 2px dashed #D1D5DB;
          }
          
          .placeholder-text {
            color: #6B7280;
            font-style: italic;
            text-align: center;
          }
          
          .footer {
            margin-top: 50px; 
            text-align: center; 
            color: #9CA3AF; 
            font-size: 12px;
            border-top: 1px solid #E5E7EB;
            padding-top: 25px;
          }
          
          @media print { 
            body { margin: 20px; }
            .header { page-break-after: avoid; }
            .experience-item { page-break-inside: avoid; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoUrl ? `<img src="${logoUrl}" alt="Company Logo" class="logo" />` : ''}
          <div class="header-content">
            <div class="candidate-header">
              <h1>${candidateData.fullName}</h1>
              <h2>${candidateData.currentTitle || 'Professional'}</h2>
              <div class="contact-info">
                ${candidateData.email ? `<span>📧 ${candidateData.email}</span>` : ''}
                ${candidateData.phone ? `<span>📞 ${candidateData.phone}</span>` : ''}
                ${candidateData.location ? `<span>📍 ${candidateData.location}</span>` : ''}
                ${candidateData.yearsOfExperience ? `<span>💼 ${candidateData.yearsOfExperience} years experience</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        ${candidateData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <div class="professional-summary">
            <p>${candidateData.summary}</p>
          </div>
        </div>
        ` : ''}

        ${candidateData.experience && candidateData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          <div class="experience-section">
            ${candidateData.experience.map((exp: any, index: number) => `
              <div class="experience-item ${index === 0 && exp.endDate.toLowerCase().includes('present') ? 'current-role' : ''}">
                <div class="role-header">
                  <h3 class="job-title">${exp.title}</h3>
                  <h4 class="company-name">${exp.company}</h4>
                  <div class="employment-period">
                    <span class="date-range">${exp.startDate} - ${exp.endDate}</span>
                    ${index === 0 && exp.endDate.toLowerCase().includes('present') ? '<span class="current-badge">Current Position</span>' : ''}
                  </div>
                </div>
                <div class="responsibilities">
                  <p>${exp.responsibilities}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${candidateData.skills && candidateData.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills & Expertise</div>
          <div class="skills-section">
            ${(() => {
              const technicalSkills = candidateData.skills.filter((skill: string) => 
                /javascript|python|java|react|node|sql|aws|docker|kubernetes|typescript|html|css|git/i.test(skill)
              );
              const otherSkills = candidateData.skills.filter((skill: string) => !technicalSkills.includes(skill));
              
              return `
                ${technicalSkills.length > 0 ? `
                  <div class="skill-category">
                    <h4>Technical Skills</h4>
                    <div class="skill-tags">
                      ${technicalSkills.map((skill: string) => `<span class="skill-tag technical">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
                
                ${otherSkills.length > 0 ? `
                  <div class="skill-category">
                    <h4>${technicalSkills.length > 0 ? 'Additional Skills' : 'Core Skills'}</h4>
                    <div class="skill-tags">
                      ${otherSkills.map((skill: string) => `<span class="skill-tag general">${skill}</span>`).join('')}
                    </div>
                  </div>
                ` : ''}
              `;
            })()}
          </div>
        </div>
        ` : ''}

        ${candidateData.education && candidateData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          <div class="education-section">
            ${candidateData.education.map((edu: string) => `
              <div class="education-item">
                <div class="degree-info">
                  <span class="education-icon">🎓</span>
                  <span class="degree-text">${edu}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${candidateData.certifications && candidateData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          <div class="certifications-section">
            ${candidateData.certifications.map((cert: string) => `
              <div class="certification-item">
                <span class="cert-icon">🏆</span>
                <span class="cert-text">${cert}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${candidateData.languages && candidateData.languages.length > 0 ? `
        <div class="section">
          <div class="section-title">Languages</div>
          <div class="languages-section">
            ${candidateData.languages.map((lang: string) => `
              <div class="language-item">
                <span class="language-icon">🌐</span>
                <span class="language-text">${lang}</span>
              </div>
            `).join('')}
          </div>
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