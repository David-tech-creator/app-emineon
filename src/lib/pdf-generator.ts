import puppeteer from 'puppeteer';
import { CandidateData } from '@/stores/competence-file-store';

interface GenerationOptions {
  template: {
    id: string;
    name: string;
    colorHex: string;
    font: string;
    client?: string;
    footerText?: string;
  };
  customization: {
    colorHex: string;
    font: string;
    logoUrl?: string;
    footerText?: string;
  };
  sections: Array<{
    key: string;
    label: string;
    show: boolean;
    order: number;
  }>;
}

export class PdfGenerator {
  private candidateData: CandidateData;
  private options: GenerationOptions;

  constructor(candidateData: CandidateData, options: GenerationOptions) {
    this.candidateData = candidateData;
    this.options = options;
  }

  // Generate HTML content for the competence file
  private generateHTML(): string {
    const { colorHex, font, logoUrl, footerText } = this.options.customization;
    
    // Get enabled sections in order
    const enabledSections = this.options.sections
      .filter(section => section.show)
      .sort((a, b) => a.order - b.order);

    let htmlContent = '';

    // Generate sections based on configuration
    enabledSections.forEach((section) => {
      switch (section.key) {
        case 'header':
          htmlContent += this.generateHeaderHTML();
          break;
        case 'summary':
          htmlContent += this.generateSummaryHTML();
          break;
        case 'experience':
          htmlContent += this.generateExperienceHTML();
          break;
        case 'skills':
          htmlContent += this.generateSkillsHTML();
          break;
        case 'education':
          htmlContent += this.generateEducationHTML();
          break;
        case 'certifications':
          htmlContent += this.generateCertificationsHTML();
          break;
        case 'languages':
          htmlContent += this.generateLanguagesHTML();
          break;
      }
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.candidateData.fullName} - Competence File</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Times:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Helvetica:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: '${font}', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            font-size: 14px;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            min-height: 297mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid ${colorHex};
            padding-bottom: 20px;
        }
        
        .name {
            font-size: 32px;
            font-weight: 700;
            color: ${colorHex};
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 18px;
            color: #666;
            font-style: italic;
            margin-bottom: 15px;
        }
        
        .contact-info {
            font-size: 14px;
            color: #555;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: ${colorHex};
            margin-bottom: 15px;
            border-bottom: 1px solid ${colorHex}30;
            padding-bottom: 5px;
        }
        
        .content {
            margin-bottom: 15px;
        }
        
        .experience-item {
            margin-bottom: 20px;
        }
        
        .job-title {
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
        
        .job-dates {
            font-size: 12px;
            color: #666;
            font-style: italic;
            margin-bottom: 8px;
        }
        
        .job-description {
            font-size: 14px;
            line-height: 1.5;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 8px;
        }
        
        .skill-item, .cert-item, .edu-item, .lang-item {
            background: ${colorHex}10;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 13px;
            border-left: 3px solid ${colorHex};
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #888;
            font-style: italic;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }
        
        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
            .container {
                padding: 0;
                margin: 0;
                max-width: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
        <div class="footer">
            ${footerText || 'Generated with Emineon ATS'}
        </div>
    </div>
</body>
</html>`;
  }

  private generateHeaderHTML(): string {
    const contactInfo: string[] = [];
    if (this.candidateData.email) contactInfo.push(this.candidateData.email);
    if (this.candidateData.phone) contactInfo.push(this.candidateData.phone);
    if (this.candidateData.location) contactInfo.push(this.candidateData.location);

    return `
      <div class="header">
        <div class="name">${this.candidateData.fullName}</div>
        <div class="title">${this.candidateData.currentTitle}</div>
        ${contactInfo.length > 0 ? `<div class="contact-info">${contactInfo.join(' • ')}</div>` : ''}
      </div>
    `;
  }

  private generateSummaryHTML(): string {
    if (!this.candidateData.summary) return '';
    
    return `
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="content">${this.candidateData.summary}</div>
      </div>
    `;
  }

  private generateExperienceHTML(): string {
    if (!this.candidateData.experience || this.candidateData.experience.length === 0) return '';
    
    const experienceItems = this.candidateData.experience.map(exp => `
      <div class="experience-item">
        <div class="job-title">${exp.title} at ${exp.company}</div>
        <div class="job-dates">${exp.startDate} - ${exp.endDate}</div>
        <div class="job-description">${exp.responsibilities}</div>
      </div>
    `).join('');

    return `
      <div class="section">
        <div class="section-title">Work Experience</div>
        ${experienceItems}
      </div>
    `;
  }

  private generateSkillsHTML(): string {
    if (!this.candidateData.skills || this.candidateData.skills.length === 0) return '';
    
    const skillItems = this.candidateData.skills.map(skill => 
      `<div class="skill-item">${skill}</div>`
    ).join('');

    return `
      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills-grid">
          ${skillItems}
        </div>
      </div>
    `;
  }

  private generateEducationHTML(): string {
    if (!this.candidateData.education || this.candidateData.education.length === 0) return '';
    
    const eduItems = this.candidateData.education.map(edu => 
      `<div class="edu-item">${edu}</div>`
    ).join('');

    return `
      <div class="section">
        <div class="section-title">Education</div>
        <div class="skills-grid">
          ${eduItems}
        </div>
      </div>
    `;
  }

  private generateCertificationsHTML(): string {
    if (!this.candidateData.certifications || this.candidateData.certifications.length === 0) return '';
    
    const certItems = this.candidateData.certifications.map(cert => 
      `<div class="cert-item">${cert}</div>`
    ).join('');

    return `
      <div class="section">
        <div class="section-title">Certifications</div>
        <div class="skills-grid">
          ${certItems}
        </div>
      </div>
    `;
  }

  private generateLanguagesHTML(): string {
    if (!this.candidateData.languages || this.candidateData.languages.length === 0) return '';
    
    const langItems = this.candidateData.languages.map(lang => 
      `<div class="lang-item">${lang}</div>`
    ).join('');

    return `
      <div class="section">
        <div class="section-title">Languages</div>
        <div class="skills-grid">
          ${langItems}
        </div>
      </div>
    `;
  }

  // Main PDF generation method
  async generate(): Promise<Buffer> {
    const html = this.generateHTML();
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set page content
      await page.setContent(html, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        printBackground: true,
        preferCSSPageSize: true,
      });
      
      return Buffer.from(pdfBuffer);
      
    } finally {
      await browser.close();
    }
  }
}

// Export utility function
export async function generateCompetenceFilePdf(
  candidateData: CandidateData,
  options: GenerationOptions
): Promise<Buffer> {
  const generator = new PdfGenerator(candidateData, options);
  return await generator.generate();
} 