import { NextRequest, NextResponse } from 'next/server';

// Sample candidate data for preview
const sampleCandidateData = {
  id: 'sample-id',
  fullName: 'Alexandra Thompson',
  currentTitle: 'Senior Business Strategy Consultant',
  email: 'alexandra.thompson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  yearsOfExperience: 8,
  summary: 'Strategic business consultant with 8+ years of experience driving digital transformation and operational excellence for Fortune 500 companies. Proven track record of delivering sustainable growth through data-driven insights, process optimization, and stakeholder alignment. Expertise in strategic planning, change management, and cross-functional team leadership.',
  skills: [
    'Strategic Planning',
    'Business Process Optimization',
    'Digital Transformation',
    'Data Analysis & Insights',
    'Change Management',
    'Stakeholder Management',
    'Financial Modeling',
    'Project Management',
    'Team Leadership',
    'Client Relationship Management',
    'Market Research',
    'Technical Documentation',
    'Programming Logic',
    'Communication Strategy'
  ],
  certifications: [
    'Certified Management Consultant (CMC)',
    'Project Management Professional (PMP)',
    'Six Sigma Black Belt',
    'Lean Management Certification',
    'Agile Certified Practitioner (PMI-ACP)'
  ],
  experience: [
    {
      company: 'McKinsey & Company',
      title: 'Senior Business Analyst',
      startDate: '2020',
      endDate: 'Present',
      responsibilities: 'Led strategic transformation initiatives for Fortune 500 clients. Conducted comprehensive market analysis and competitive intelligence. Developed data-driven recommendations for operational improvements. Managed cross-functional project teams of 8-12 members. Presented strategic insights to C-suite executives and board members.'
    },
    {
      company: 'Deloitte Consulting',
      title: 'Management Consultant',
      startDate: '2018',
      endDate: '2020',
      responsibilities: 'Delivered business process optimization projects across multiple industries. Designed and implemented digital transformation roadmaps. Facilitated change management workshops and stakeholder alignment sessions. Developed financial models and ROI analysis for strategic initiatives. Collaborated with client teams to ensure successful project delivery.'
    },
    {
      company: 'Boston Consulting Group',
      title: 'Business Analyst',
      startDate: '2016',
      endDate: '2018',
      responsibilities: 'Conducted market research and competitive analysis for strategic planning initiatives. Supported senior consultants in client engagement delivery. Developed comprehensive business cases and strategic recommendations. Analyzed complex datasets to identify trends and opportunities. Prepared executive presentations and strategic documentation.'
    }
  ],
  education: [
    'Master of Business Administration (MBA), Strategy & Operations - Wharton School, University of Pennsylvania',
    'Bachelor of Science in Business Administration - University of California, Berkeley',
    'Certificate in Digital Strategy - MIT Sloan Executive Education'
  ],
  languages: [
    'English (Native)',
    'Spanish (Fluent)',
    'French (Conversational)',
    'Mandarin (Basic)'
  ]
};

function generateAntaesPreviewHTML(candidateData: any): string {
  const generateFunctionalSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return '';
    
    // Group skills by category for better organization
    const skillCategories: { [key: string]: string[] } = {
      'Strategic Planning': skills.filter(skill => 
        skill.toLowerCase().includes('strategy') || 
        skill.toLowerCase().includes('planning') ||
        skill.toLowerCase().includes('management')
      ),
      'Technical Expertise': skills.filter(skill => 
        skill.toLowerCase().includes('technical') || 
        skill.toLowerCase().includes('programming') ||
        skill.toLowerCase().includes('development')
      ),
      'Leadership': skills.filter(skill => 
        skill.toLowerCase().includes('leadership') || 
        skill.toLowerCase().includes('team') ||
        skill.toLowerCase().includes('communication')
      )
    };
    
    // If no categorized skills, put them all in a general category
    const uncategorizedSkills = skills.filter(skill => 
      !Object.values(skillCategories).some(category => category.includes(skill))
    );
    
    if (uncategorizedSkills.length > 0) {
      skillCategories['Core Competencies'] = uncategorizedSkills;
    }
    
    return Object.entries(skillCategories)
      .filter(([_, categorySkills]) => categorySkills.length > 0)
      .map(([category, categorySkills]) => `
        <div class="functional-skill-category">
          <div class="skill-category-title">${category}</div>
          <ul class="skill-list">
            ${categorySkills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
        </div>
      `).join('');
  };

  // Simple experience HTML for preview
  const experienceHTML = candidateData.experience?.map((exp: any) => `
    <div class="experience-block">
      <div class="exp-header">
        <div class="exp-company">${exp.company}</div>
        <div class="exp-title">${exp.title}</div>
        <div class="exp-dates">${exp.startDate} - ${exp.endDate}</div>
      </div>
      <div class="exp-content">
        <p>${exp.responsibilities}</p>
      </div>
    </div>
  `).join('') || '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${candidateData.fullName} - Professional Profile | Antaes Consulting</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #4A5568;
          background: #ffffff;
          font-size: 14px;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
          min-height: 297mm;
          padding: 30px;
          position: relative;
          padding-bottom: 80px;
        }
        
        /* Header Banner - Solid professional blue with soft borders */
        .header-banner {
          background: #073C51;
          padding: 25px 35px;
          margin: -30px -30px 40px -30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 90px;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 20px rgba(7, 60, 81, 0.15);
          border: none;
        }
        
        .header-left {
          flex: 1;
          color: white;
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
          letter-spacing: -0.8px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .header-role {
          font-size: 18px;
          font-weight: 500;
          color: #FFB800;
          margin-bottom: 12px;
          letter-spacing: 0.2px;
        }
        
        .contact-info {
          display: flex;
          gap: 24px;
          font-size: 14px;
          color: white;
          flex-wrap: wrap;
          gap: 24px;
          font-size: 14px;
          color: #757575;
          flex-wrap: wrap;
        }
        
        .header-logo {
          flex-shrink: 0;
        }
        
        .logo-image {
          height: 60px;
          width: auto;
        }
        
        /* Content Area */
        .content {
          margin-bottom: 60px;
        }
        
        /* Section Styling - Minimalist and clean */
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #2C4F7C;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #E8F1FA;
        }
        
        .section-content {
          font-size: 14px;
          line-height: 1.7;
        }
        
        /* Professional Summary */
        .summary-text {
          font-weight: 400;
          line-height: 1.8;
          color: #4A5568;
          padding: 15px;
          background: #F8FAFE;
          border-radius: 8px;
          border-left: 3px solid #2C4F7C;
        }
        
        /* Functional Skills */
        .functional-skill-category {
          margin-bottom: 20px;
          padding: 15px;
          background: #F8FAFE;
          border-radius: 8px;
          border-left: 3px solid #2C4F7C;
        }
        
        .skill-category-title {
          font-size: 14px;
          font-weight: 700;
          color: #2C4F7C;
          margin-bottom: 10px;
        }
        
        .skill-list {
          list-style: none;
          padding-left: 0;
          margin-bottom: 10px;
        }
        
        .skill-list li {
          position: relative;
          padding-left: 15px;
          margin-bottom: 5px;
          color: #4A5568;
          font-weight: 500;
        }
        
        .skill-list li:before {
          content: "•";
          color: #2C4F7C;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* Experience Blocks */
        .experience-block {
          margin-bottom: 25px;
          padding: 20px;
          background: #F8FAFE;
          border-radius: 8px;
          border-left: 3px solid #2C4F7C;
          page-break-inside: avoid;
        }
        
        .exp-header {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E8F1FA;
        }
        
        .exp-company {
          font-size: 16px;
          font-weight: 700;
          color: #2C4F7C;
          margin-bottom: 3px;
        }
        
        .exp-title {
          font-size: 14px;
          font-weight: 600;
          color: #3B6494;
          margin-bottom: 3px;
        }
        
        .exp-dates {
          font-size: 13px;
          color: #4A5568;
          font-weight: 500;
        }
        
        .exp-content {
          color: #4A5568;
          line-height: 1.6;
        }
        
        /* Education & Certifications */
        .education-item, .cert-item {
          margin-bottom: 10px;
          padding-left: 15px;
          position: relative;
        }
        
        .education-item:before, .cert-item:before {
          content: "•";
          color: #2C4F7C;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* Languages */
        .languages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        
        .language-item {
          padding: 8px 12px;
          background: #F8FAFE;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          color: #2C4F7C;
          border: 1px solid #E8F1FA;
        }
        
        /* Footer with Antaes branding */
        .footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px 30px;
          border-top: 1px solid #E8F1FA;
          background: white;
          font-size: 12px;
          color: #4A5568;
        }
        
        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        
        .footer-logo {
          height: 40px;
          width: auto;
        }
        
        .footer-slogan {
          font-weight: 600;
          color: #2C4F7C;
          letter-spacing: 0.5px;
        }
        
        /* Preview specific styling */
        .preview-header {
          background: #2C4F7C;
          color: white;
          padding: 10px 20px;
          margin: -30px -30px 20px -30px;
          text-align: center;
          font-weight: 600;
        }
        
        /* Print Optimization */
        @media print {
          .preview-header { display: none; }
          body { 
            font-size: 12px; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .container { 
            max-width: none; 
            margin: 0; 
            padding: 0;
            padding-bottom: 60px;
          }
          .header-banner {
            margin: 0 0 30px 0;
          }
          .section { 
            page-break-inside: avoid; 
          }
          .experience-block { 
            page-break-inside: avoid; 
          }
          .footer {
            position: fixed;
            bottom: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Preview Header -->
        <div class="preview-header">
          🔍 ANTAES CONSULTING TEMPLATE PREVIEW - Sample Data
        </div>

        <!-- Header Banner with Antaes branding -->
        <div class="header-banner">
          <div class="header-left">
            <h1>${candidateData.fullName}</h1>
            <div class="header-role">${candidateData.currentTitle}</div>
            <div class="contact-info">
              <span>${candidateData.yearsOfExperience}+ Years of Experience</span>
            </div>
          </div>
          <div class="header-logo">
            <img src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Antaes_logo_white.png" alt="ANTAES" class="logo-image" />
          </div>
        </div>

        <div class="content">
          <!-- Professional Summary -->
          ${candidateData.summary ? `
          <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            <div class="section-content">
              <p class="summary-text">${candidateData.summary}</p>
            </div>
          </div>
          ` : ''}

          <!-- Core Competencies -->
          ${candidateData.skills && candidateData.skills.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Core Competencies</h2>
            <div class="section-content">
              ${generateFunctionalSkills(candidateData.skills)}
            </div>
          </div>
          ` : ''}

          <!-- Professional Experience -->
          ${experienceHTML ? `
          <div class="section">
            <h2 class="section-title">Professional Experience</h2>
            <div class="section-content">
              ${experienceHTML}
            </div>
          </div>
          ` : ''}

          <!-- Education -->
          ${candidateData.education && candidateData.education.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Education & Qualifications</h2>
            <div class="section-content">
              ${candidateData.education.map((edu: string) => `
                <div class="education-item">${edu}</div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Certifications -->
          ${candidateData.certifications && candidateData.certifications.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Professional Certifications</h2>
            <div class="section-content">
              ${candidateData.certifications.map((cert: string) => `
                <div class="cert-item">${cert}</div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Languages -->
          ${candidateData.languages && candidateData.languages.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Languages</h2>
            <div class="section-content">
              <div class="languages-grid">
                ${candidateData.languages.map((lang: string) => `
                  <div class="language-item">${lang}</div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Footer with Antaes branding -->
        <div class="footer">
          <div class="footer-content">
            <img src="https://res.cloudinary.com/emineon/image/upload/v1749926503/Antaes_logo.png" alt="ANTAES" class="footer-logo" />
            <span class="footer-slogan">Partnership for Excellence</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function GET() {
  try {
    const htmlContent = generateAntaesPreviewHTML(sampleCandidateData);
    
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating Antaes preview:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate Antaes template preview'
      },
      { status: 500 }
    );
  }
} 