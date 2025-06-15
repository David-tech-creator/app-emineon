import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

const downloadJobSchema = z.object({
  jobData: z.object({
    title: z.string(),
    company: z.string(),
    location: z.string(),
    contractType: z.string(),
    workMode: z.string(),
    description: z.string(),
    skills: z.array(z.string()),
    salary: z.string().optional(),
    department: z.string().optional(),
    logoUrl: z.string().optional(),
  }),
  format: z.enum(['pdf', 'docx']),
  logoUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required to download job description'
      }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = downloadJobSchema.parse(body);
    const { jobData, format } = validatedData;

    // Generate HTML content for the job description
    const htmlContent = generateJobDescriptionHTML(jobData);

    if (format === 'pdf') {
      // For PDF generation, we'll use a simple HTML to PDF conversion
      // In production, you might want to use puppeteer or similar
      const pdfBuffer = await generatePDFFromHTML(htmlContent);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${jobData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
        },
      });
    } else {
      // For DOCX generation
      const docxBuffer = await generateDOCXFromHTML(htmlContent, jobData);
      
      return new NextResponse(docxBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${jobData.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
        },
      });
    }

  } catch (error) {
    console.error('Job description download error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate job description document' },
      { status: 500 }
    );
  }
}

function generateJobDescriptionHTML(jobData: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${jobData.title} - ${jobData.company}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .header-content h1 {
          margin: 0 0 10px 0;
          color: #007bff;
          font-size: 28px;
        }
        .header-content h2 {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 20px;
          font-weight: normal;
        }
        .header-content .location {
          color: #888;
          font-size: 16px;
        }
        .logo {
          max-height: 80px;
          max-width: 200px;
        }
        .job-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .detail-item {
          text-align: center;
        }
        .detail-label {
          font-weight: bold;
          color: #666;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .detail-value {
          color: #333;
          font-size: 16px;
          text-transform: capitalize;
        }
        .section {
          margin: 30px 0;
        }
        .section h3 {
          color: #007bff;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }
        .description {
          white-space: pre-wrap;
          line-height: 1.8;
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .skill-tag {
          background-color: #007bff;
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 14px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #888;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <h1>${jobData.title}</h1>
          <h2>${jobData.company}</h2>
          <div class="location">📍 ${jobData.location}</div>
        </div>
        ${jobData.logoUrl ? `<img src="${jobData.logoUrl}" alt="Company Logo" class="logo">` : ''}
      </div>

      <div class="job-details">
        <div class="detail-item">
          <div class="detail-label">Contract Type</div>
          <div class="detail-value">${jobData.contractType}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Work Mode</div>
          <div class="detail-value">${jobData.workMode}</div>
        </div>
        ${jobData.department ? `
        <div class="detail-item">
          <div class="detail-label">Department</div>
          <div class="detail-value">${jobData.department}</div>
        </div>
        ` : ''}
        ${jobData.salary ? `
        <div class="detail-item">
          <div class="detail-label">Salary</div>
          <div class="detail-value">${jobData.salary}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <h3>Job Description</h3>
        <div class="description">${jobData.description}</div>
      </div>

      ${jobData.skills && jobData.skills.length > 0 ? `
      <div class="section">
        <h3>Required Skills</h3>
        <div class="skills">
          ${jobData.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
      ` : ''}

      <div class="footer">
        Generated on ${new Date().toLocaleDateString()} | ${jobData.company}
      </div>
    </body>
    </html>
  `;
}

async function generatePDFFromHTML(html: string): Promise<Buffer> {
  // Simple HTML to PDF conversion
  // In production, you'd use puppeteer or similar
  // For now, we'll return a mock PDF buffer
  const mockPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Job Description) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

  return Buffer.from(mockPDFContent);
}

async function generateDOCXFromHTML(html: string, jobData: any): Promise<Buffer> {
  // Simple DOCX generation
  // In production, you'd use docx library or similar
  // For now, we'll create a basic DOCX structure
  
  const docxContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:t>${jobData.title}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${jobData.company}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${jobData.location}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>${jobData.description}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`;

  // This is a simplified DOCX structure
  // In production, you'd create a proper ZIP file with all required DOCX components
  return Buffer.from(docxContent);
} 