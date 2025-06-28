import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generatePDF } from '@/lib/pdf-service';
import { auth } from '@clerk/nextjs/server';

// Request schema validation
const GenerateRequestSchema = z.object({
  candidateData: z.object({
    id: z.string(),
    fullName: z.string(),
    currentTitle: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    summary: z.string().optional(),
    skills: z.array(z.string()),
    certifications: z.array(z.string()),
    experience: z.array(z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      responsibilities: z.string(),
    })),
    education: z.array(z.string()),
    languages: z.array(z.string()),
  }),
  template: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    content: z.string(),
    visible: z.boolean(),
    order: z.number(),
  })),
  format: z.enum(['pdf', 'docx']),
  jobDescription: z.object({
    text: z.string(),
    requirements: z.array(z.string()),
    skills: z.array(z.string()),
    responsibilities: z.array(z.string()),
    title: z.string().optional(),
    company: z.string().optional(),
  }).optional(),
});

interface ExperienceItem {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface CandidateData {
  id: string;
  fullName: string;
  currentTitle: string;
  email: string;
  phone: string;
  location: string;
  yearsOfExperience: number;
  skills: string[];
  certifications: string[];
  experience: ExperienceItem[];
  education: string[];
  languages: string[];
  summary: string;
}

interface JobDescription {
  text: string;
  requirements: string[];
  skills: string[];
  responsibilities: string[];
  title?: string;
  company?: string;
}

// Function to highlight text based on job requirements
function convertMarkdownToHTML(text: string): string {
  if (!text) return text;
  
  // Convert markdown formatting to HTML
  let htmlText = text
    // Convert **bold** to <strong>
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Convert bullet points that start with * to proper list items (do this first)
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    // Convert remaining *italic* to <em> (after bullet points are handled)
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    // Convert multiple consecutive list items to proper ul structure
    .replace(/(<li>.*?<\/li>\s*)+/g, (match) => `<ul>${match}</ul>`)
    // Convert line breaks to proper spacing
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph tags if not already structured
  if (!htmlText.includes('<p>') && !htmlText.includes('<ul>') && !htmlText.includes('<div>')) {
    htmlText = `<p>${htmlText}</p>`;
  }
  
  return htmlText;
}

function highlightRelevantContent(text: string, jobDescription?: JobDescription, template?: string): string {
  if (!jobDescription || !text) return text;
  
  // Get accent color based on template
  const accentColor = template === 'antaes' ? '#FFB800' : '#FF8C00';
  
  // Combine all job-related keywords
  const keywords = [
    ...jobDescription.requirements,
    ...jobDescription.skills,
    ...jobDescription.responsibilities
  ].filter(keyword => keyword && keyword.length > 2); // Filter out short words
  
  let highlightedText = text;
  
  // Highlight each keyword (case-insensitive)
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
    highlightedText = highlightedText.replace(regex, `<span style="border-bottom: 2px solid ${accentColor}; font-weight: 600;">$1</span>`);
  });
  
  return highlightedText;
}

function generateExperienceHTML(experience: ExperienceItem[]): string {
  if (!experience || experience.length === 0) {
    return `
      <div class="section">
        <h2 class="section-title">PROFESSIONAL EXPERIENCES</h2>
        <div class="section-content">
          <p>No professional experience provided.</p>
        </div>
      </div>
    `;
  }

  // Generate Professional Experiences Summary first
  const experiencesSummary = experience.map(exp => {
    const duration = `${exp.startDate} - ${exp.endDate}`;
    return `
      <div class="experience-summary-item">
        <strong>${exp.title}</strong> at <strong>${exp.company}</strong> (${duration})
      </div>
    `;
  }).join('');

  // Generate detailed experience blocks
  const detailedExperiences = experience.map(exp => {
    const duration = `${exp.startDate} - ${exp.endDate}`;
    
    // Format responsibilities into bullet points
    const formatResponsibilities = (responsibilities: string) => {
      if (!responsibilities) return '<li>No specific responsibilities listed</li>';
      
      // Split by periods, semicolons, or line breaks and clean up
      const items = responsibilities
        .split(/[.;]\s*|\n/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
      
      if (items.length === 0) {
        return `<li>${responsibilities}</li>`;
      }
      
      return items.map(item => `<li>${item}</li>`).join('');
    };

    // Generate company description based on company name
    const generateCompanyDescription = (company: string) => {
      const descriptions = {
        'Google': 'Leading global technology company specializing in internet-related services and products',
        'Microsoft': 'Multinational technology corporation developing computer software, consumer electronics, and personal computers',
        'Amazon': 'Multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence',
        'Apple': 'Multinational technology company designing and manufacturing consumer electronics and software',
        'Meta': 'Social technology company connecting people through innovative platforms and virtual reality',
        'Netflix': 'Global streaming entertainment service with over 200 million paid memberships',
        'Tesla': 'Electric vehicle and clean energy company accelerating sustainable transport',
        'Spotify': 'Audio streaming and media services provider with millions of songs and podcasts'
      };
      
      // Check if company matches known companies
      for (const [key, desc] of Object.entries(descriptions)) {
        if (company.toLowerCase().includes(key.toLowerCase())) {
          return desc;
        }
      }
      
      // Generate generic description based on company name patterns
      if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('software')) {
        return 'Technology company focused on innovative software solutions and digital transformation';
      } else if (company.toLowerCase().includes('consulting')) {
        return 'Professional services firm providing strategic consulting and business solutions';
      } else if (company.toLowerCase().includes('bank') || company.toLowerCase().includes('financial')) {
        return 'Financial services institution providing banking and investment solutions';
      } else if (company.toLowerCase().includes('startup')) {
        return 'Dynamic startup company driving innovation in emerging technology markets';
      } else {
        return 'Established organization committed to excellence and innovation in their industry sector';
      }
    };

    // Generate major achievements based on role and responsibilities
    const generateAchievements = (title: string, responsibilities: string) => {
      const achievements = [
        'Successfully delivered projects on time and within budget constraints',
        'Improved system performance and operational efficiency through strategic implementations',
        'Collaborated effectively with cross-functional teams to achieve organizational objectives',
        'Contributed to process improvements and best practice development initiatives'
      ];
      
      // Add role-specific achievements
      if (title.toLowerCase().includes('senior') || title.toLowerCase().includes('lead')) {
        achievements.unshift('Led and mentored team members, fostering professional development and knowledge sharing');
      }
      
      if (title.toLowerCase().includes('engineer') || title.toLowerCase().includes('developer')) {
        achievements.push('Implemented robust technical solutions following industry standards and best practices');
      }
      
      if (title.toLowerCase().includes('manager') || title.toLowerCase().includes('director')) {
        achievements.push('Drove strategic initiatives and managed stakeholder relationships effectively');
      }
      
      return achievements.slice(0, 3).map(achievement => `<li>${achievement}</li>`).join('');
    };

    // Generate technical environment based on common technologies
    const generateTechnicalEnvironment = (title: string, responsibilities: string) => {
      const environments = [];
      
      // Add based on role type
      if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('ui')) {
        environments.push('React, Vue.js, Angular, HTML5, CSS3, JavaScript/TypeScript');
      } else if (title.toLowerCase().includes('backend') || title.toLowerCase().includes('api')) {
        environments.push('Node.js, Python, Java, REST APIs, GraphQL, Microservices');
      } else if (title.toLowerCase().includes('fullstack') || title.toLowerCase().includes('full-stack')) {
        environments.push('React, Node.js, Python, PostgreSQL, MongoDB, AWS/Azure');
      } else if (title.toLowerCase().includes('devops') || title.toLowerCase().includes('infrastructure')) {
        environments.push('Docker, Kubernetes, AWS/Azure, Jenkins, Terraform, CI/CD');
      } else if (title.toLowerCase().includes('data') || title.toLowerCase().includes('analytics')) {
        environments.push('Python, SQL, Tableau, Power BI, Apache Spark, Machine Learning');
      } else {
        environments.push('Modern development tools, Agile methodologies, Version control systems');
      }
      
      // Add common tools
      environments.push('Git, JIRA, Confluence, Agile/Scrum methodologies');
      
      return environments.map(env => `<li>${env}</li>`).join('');
    };

    return `
      <div class="experience-block">
        <div class="exp-header">
          <div class="exp-company">${exp.company}</div>
          <div class="exp-title">${exp.title}</div>
          <div class="exp-dates">${duration}</div>
        </div>
        
        <div class="exp-section">
          <div class="exp-section-title">Company Description</div>
          <p class="exp-description">${generateCompanyDescription(exp.company)}</p>
        </div>
        
        <div class="exp-section">
          <div class="exp-section-title">Key Responsibilities</div>
          <ul class="exp-responsibilities">
            ${formatResponsibilities(exp.responsibilities)}
          </ul>
        </div>
        
        <div class="exp-section">
          <div class="exp-section-title">Major Achievements</div>
          <ul class="exp-achievements">
            ${generateAchievements(exp.title, exp.responsibilities)}
          </ul>
        </div>
        
        <div class="exp-section">
          <div class="exp-section-title">Technical Environment</div>
          <ul class="exp-technical">
            ${generateTechnicalEnvironment(exp.title, exp.responsibilities)}
          </ul>
        </div>
      </div>
    `;
  }).join('');

  return `
    <!-- PROFESSIONAL EXPERIENCES SUMMARY -->
    <div class="section">
      <h2 class="section-title">PROFESSIONAL EXPERIENCES SUMMARY</h2>
      <div class="section-content">
        <div class="experiences-summary">
          ${experiencesSummary}
        </div>
      </div>
    </div>

    <!-- PROFESSIONAL EXPERIENCES -->
    <div class="section">
      <h2 class="section-title">PROFESSIONAL EXPERIENCES</h2>
      <div class="section-content">
        ${detailedExperiences}
      </div>
    </div>
  `;
}

export function generateSectionsHTML(sections: any[], candidateData: CandidateData, generateFunctionalSkills: Function, experienceHTML: string, jobDescription?: JobDescription, template?: string): string {
  return sections
    .sort((a, b) => a.order - b.order)
    .map(section => {
      if (section.type === 'header') return ''; // Header is handled separately
      
      let sectionContent = section.content;
      
      // For empty sections, generate default content based on type
      if (!sectionContent || sectionContent.trim().length === 0) {
        switch (section.type) {
          case 'summary':
            sectionContent = candidateData.summary || 'Professional summary to be provided.';
            break;
          case 'functional-skills':
          case 'core-competencies':
            sectionContent = generateFunctionalSkills(candidateData.skills);
            break;
          case 'experience':
          case 'professional-experience':
            return experienceHTML;
          case 'education':
            sectionContent = candidateData.education?.map(edu => `<div class="education-item">${edu}</div>`).join('') || 'Education details to be provided.';
            break;
          case 'certifications':
            sectionContent = candidateData.certifications?.map(cert => `<div class="cert-item">${cert}</div>`).join('') || 'Professional certifications to be provided.';
            break;
          case 'languages':
            sectionContent = candidateData.languages?.map(lang => `<div class="language-item">${lang}</div>`).join('') || 'Language skills to be provided.';
            break;
          default:
            sectionContent = 'Content to be provided.';
        }
      }
      
      // Convert markdown to HTML first, then apply highlighting
      const htmlContent = convertMarkdownToHTML(sectionContent);
      const highlightedContent = highlightRelevantContent(htmlContent, jobDescription, template);
      
      return `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          <div class="section-content">
            ${section.type === 'summary' ? `<p class="summary-text">${highlightedContent}</p>` : 
              section.type === 'languages' ? `<div class="languages-grid">${highlightedContent}</div>` :
              highlightedContent}
          </div>
        </div>
      `;
    }).join('');
}

export function generateAntaesCompetenceFileHTML(candidateData: CandidateData, sections?: any[], jobDescription?: JobDescription): string {
  // Generate functional skills with explanatory text (like Emineon)
  const generateFunctionalSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return '';
    
    const skillCategories: Record<string, { skills: string[]; description: string }> = {
      'Leadership & Management': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('lead') || 
          skill.toLowerCase().includes('manage') || 
          skill.toLowerCase().includes('team') ||
          skill.toLowerCase().includes('project')
        ),
        description: 'Proven ability to guide teams and manage complex projects with strategic oversight and operational excellence.'
      },
      'Communication & Collaboration': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('communication') || 
          skill.toLowerCase().includes('presentation') || 
          skill.toLowerCase().includes('stakeholder')
        ),
        description: 'Strong interpersonal skills enabling effective collaboration across diverse teams and stakeholder groups.'
      },
      'Problem Solving & Analysis': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('analysis') || 
          skill.toLowerCase().includes('problem') || 
          skill.toLowerCase().includes('research')
        ),
        description: 'Analytical mindset with systematic approach to identifying solutions and optimizing processes.'
      },
      'Innovation & Strategy': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('innovation') || 
          skill.toLowerCase().includes('strategy') || 
          skill.toLowerCase().includes('planning')
        ),
        description: 'Forward-thinking approach to business challenges with focus on sustainable growth and competitive advantage.'
      }
    };
    
    // If no categorized skills found, create a general category
    const categorizedSkills = Object.values(skillCategories).some(cat => cat.skills.length > 0);
    if (!categorizedSkills) {
      skillCategories['Core Competencies'] = {
        skills: skills.slice(0, 6),
        description: 'Comprehensive skill set developed through professional experience and continuous learning initiatives.'
      };
    }
    
    return Object.entries(skillCategories)
      .filter(([_, category]) => category.skills.length > 0)
      .map(([categoryName, category]) => `
        <div class="functional-skill-category">
          <div class="skill-category-title">${categoryName}</div>
          <ul class="skill-list">
            ${category.skills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
          <p class="skill-description">${category.description}</p>
        </div>
      `).join('');
  };

  // Generate technical skills with explanatory text
  const generateTechnicalSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return '';
    
    const techCategories: Record<string, { skills: string[]; description: string }> = {
      'Programming Languages': {
        skills: skills.filter(skill => 
          ['javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'].some(lang => 
            skill.toLowerCase().includes(lang)
          )
        ),
        description: 'Proficient in multiple programming languages with deep understanding of software development principles.'
      },
      'Frameworks & Libraries': {
        skills: skills.filter(skill => 
          ['react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'laravel', '.net'].some(framework => 
            skill.toLowerCase().includes(framework)
          )
        ),
        description: 'Extensive experience with modern frameworks enabling rapid development and scalable solutions.'
      },
      'Databases & Storage': {
        skills: skills.filter(skill => 
          ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite'].some(db => 
            skill.toLowerCase().includes(db)
          )
        ),
        description: 'Comprehensive database management skills across relational and NoSQL technologies.'
      },
      'Cloud & DevOps': {
        skills: skills.filter(skill => 
          ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'].some(cloud => 
            skill.toLowerCase().includes(cloud)
          )
        ),
        description: 'Advanced cloud computing and DevOps expertise for scalable infrastructure management.'
      },
      'Tools & Technologies': {
        skills: skills.filter(skill => 
          !['javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'laravel', '.net',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'].some(tech => 
            skill.toLowerCase().includes(tech)
          )
        ),
        description: 'Diverse technical toolkit supporting efficient development workflows and project delivery.'
      }
    };
    
    // If no categorized skills found, create a general category
    const categorizedSkills = Object.values(techCategories).some(cat => cat.skills.length > 0);
    if (!categorizedSkills) {
      techCategories['Technical Competencies'] = {
        skills: skills,
        description: 'Comprehensive technical skill set acquired through hands-on experience and professional development.'
      };
    }
    
    return Object.entries(techCategories)
      .filter(([_, category]) => category.skills.length > 0)
      .map(([categoryName, category]) => `
        <div class="technical-skill-category">
          <div class="skill-category-title">${categoryName}</div>
          <ul class="skill-list">
            ${category.skills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
          <p class="skill-description">${category.description}</p>
        </div>
      `).join('');
  };

  // Generate areas of expertise based on role and skills
  const generateAreasOfExpertise = (currentTitle: string, skills: string[]): string[] => {
    const expertiseAreas: string[] = [];
    
    // Add based on current title
    if (currentTitle.toLowerCase().includes('software') || currentTitle.toLowerCase().includes('developer')) {
      expertiseAreas.push('Software Development & Engineering');
    }
    if (currentTitle.toLowerCase().includes('senior') || currentTitle.toLowerCase().includes('lead')) {
      expertiseAreas.push('Technical Leadership & Mentoring');
    }
    if (currentTitle.toLowerCase().includes('full') || currentTitle.toLowerCase().includes('stack')) {
      expertiseAreas.push('Full-Stack Development');
    }
    if (currentTitle.toLowerCase().includes('frontend') || currentTitle.toLowerCase().includes('ui')) {
      expertiseAreas.push('User Interface Development');
    }
    if (currentTitle.toLowerCase().includes('backend') || currentTitle.toLowerCase().includes('api')) {
      expertiseAreas.push('Backend Systems & APIs');
    }
    if (currentTitle.toLowerCase().includes('devops') || currentTitle.toLowerCase().includes('infrastructure')) {
      expertiseAreas.push('DevOps & Infrastructure');
    }
    if (currentTitle.toLowerCase().includes('data') || currentTitle.toLowerCase().includes('analytics')) {
      expertiseAreas.push('Data Analysis & Business Intelligence');
    }
    if (currentTitle.toLowerCase().includes('architect')) {
      expertiseAreas.push('System Architecture & Design');
    }
    if (currentTitle.toLowerCase().includes('manager') || currentTitle.toLowerCase().includes('director')) {
      expertiseAreas.push('Project Management & Strategy');
    }
    
    // Add based on skills
    if (skills.some(skill => skill.toLowerCase().includes('cloud') || skill.toLowerCase().includes('aws') || skill.toLowerCase().includes('azure'))) {
      expertiseAreas.push('Cloud Computing & Scalability');
    }
    if (skills.some(skill => skill.toLowerCase().includes('agile') || skill.toLowerCase().includes('scrum'))) {
      expertiseAreas.push('Agile Methodologies & Process Optimization');
    }
    
    // Ensure we have at least 6 areas
    const defaultAreas = [
      'Digital Transformation',
      'Technology Innovation',
      'Process Optimization',
      'Quality Assurance',
      'Cross-functional Collaboration',
      'Continuous Learning & Development'
    ];
    
    while (expertiseAreas.length < 6) {
      const nextArea = defaultAreas.find(area => !expertiseAreas.includes(area));
      if (nextArea) {
        expertiseAreas.push(nextArea);
      } else {
        break;
      }
    }
    
    return expertiseAreas.slice(0, 6);
  };

  const experienceHTML = generateExperienceHTML(candidateData.experience);
  const areasOfExpertise = generateAreasOfExpertise(candidateData.currentTitle, candidateData.skills);
  
  // Use sections if provided, otherwise generate default sections
  if (sections && sections.length > 0) {
    return generateSectionsHTML(sections, candidateData, generateFunctionalSkills, experienceHTML, jobDescription, 'antaes');
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${candidateData.fullName} - Professional Profile</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          margin: 0;
          size: A4;
        }
        
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
          padding: 0 30px 80px 30px;
          position: relative;
        }
        
        /* Header Banner */
        .header-banner {
          background: #073C51;
          padding: 25px 35px;
          margin: 0 -30px 40px -30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 90px;
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
        }
        
        .header-logo {
          flex-shrink: 0;
        }
        
        .logo-image {
          height: 65px;
          width: auto;
        }
        
        /* Content Area */
        .content {
          margin-bottom: 60px;
        }
        
        /* Section Styling */
        .section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #073C51;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #E8F4F7;
        }
        
        .section-content {
          font-size: 14px;
          line-height: 1.7;
        }
        
        /* Content Formatting */
        .section-content p {
          margin-bottom: 12px;
          line-height: 1.7;
        }
        
        .section-content ul {
          margin: 12px 0;
          padding-left: 0;
          list-style: none;
        }
        
        .section-content li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          line-height: 1.6;
        }
        
        .section-content li:before {
          content: "•";
          color: #FFB800;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .section-content strong {
          font-weight: 700;
          color: #073C51;
        }
        
        .section-content em {
          font-style: italic;
          color: #4A5568;
        }
        
        /* Professional Summary */
        .summary-text {
          font-weight: 400;
          line-height: 1.8;
          color: #4A5568;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 8px;
          border-left: 4px solid #073C51;
        }
        
        /* Areas of Expertise */
        .expertise-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 15px;
        }
        
        .expertise-item {
          background: #F8FAFC;
          padding: 12px 15px;
          border-radius: 6px;
          border-left: 3px solid #FFB800;
          font-weight: 500;
          color: #073C51;
          font-size: 13px;
        }
        
        /* Functional Skills */
        .functional-skill-category, .technical-skill-category {
          margin-bottom: 20px;
          padding: 18px;
          background: #F8FAFC;
          border-radius: 8px;
          border-left: 4px solid #073C51;
        }
        
        .skill-category-title {
          font-size: 14px;
          font-weight: 700;
          color: #073C51;
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
          color: #FFB800;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .skill-description {
          font-size: 13px;
          color: #757575;
          font-style: italic;
          margin-top: 8px;
          line-height: 1.5;
        }
        
        /* Experience Blocks */
        .experience-block {
          margin-bottom: 25px;
          padding: 20px;
          background: #F8FAFC;
          border-radius: 8px;
          border-left: 4px solid #073C51;
          page-break-inside: avoid;
        }
        
        .exp-header {
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #E8F4F7;
        }
        
        .exp-company {
          font-size: 16px;
          font-weight: 700;
          color: #073C51;
          margin-bottom: 3px;
        }
        
        .exp-title {
          font-size: 14px;
          font-weight: 600;
          color: #757575;
          margin-bottom: 3px;
        }
        
        .exp-dates {
          font-size: 13px;
          color: #4A5568;
          font-weight: 500;
        }
        
        /* Education & Certifications */
        .education-item, .cert-item {
          margin-bottom: 10px;
          padding-left: 15px;
          position: relative;
        }
        
        .education-item:before, .cert-item:before {
          content: "•";
          color: #073C51;
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
          background: #F9FBFC;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          color: #073C51;
          border: 1px solid #E8F4F7;
        }
        
        /* Footer with Antaes branding */
        .footer {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px 30px;
          border-top: 1px solid #E8F4F7;
          background: white;
          font-size: 12px;
          color: #4A5568;
          margin-top: 40px;
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
          color: #073C51;
          letter-spacing: 0.5px;
        }
        
        /* Print Optimization */
        @media print {
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
            border-radius: 0;
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
        
        /* Page counter for PDF generation */
        @page {
          margin: 20mm;
          @bottom-right {
            content: counter(page);
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 600;
            color: #073C51;
          }
          @bottom-left {
            content: "Partnership for Excellence • ANTAES";
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            color: #4A5568;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
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
              <p class="summary-text">${highlightRelevantContent(candidateData.summary, jobDescription, 'antaes')}</p>
            </div>
          </div>
          ` : ''}

          <!-- Areas of Expertise -->
          <div class="section">
            <h2 class="section-title">Areas of Expertise</h2>
            <div class="section-content">
              <div class="expertise-grid">
                ${areasOfExpertise.map(area => `
                  <div class="expertise-item">${area}</div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Functional Skills -->
          ${candidateData.skills && candidateData.skills.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Functional Skills</h2>
            <div class="section-content">
              ${generateFunctionalSkills(candidateData.skills)}
            </div>
          </div>
          ` : ''}

          <!-- Technical Skills -->
          ${candidateData.skills && candidateData.skills.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Technical Skills</h2>
            <div class="section-content">
              ${generateTechnicalSkills(candidateData.skills)}
            </div>
          </div>
          ` : ''}

          <!-- Professional Experience -->
          ${experienceHTML}

          <!-- Education -->
          ${candidateData.education && candidateData.education.length > 0 ? `
          <div class="section">
            <h2 class="section-title">Education & Qualifications</h2>
            <div class="section-content">
              ${candidateData.education.map(edu => `
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
              ${candidateData.certifications.map(cert => `
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
                ${candidateData.languages.map(lang => `
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

export function generateCompetenceFileHTML(candidateData: CandidateData, sections?: any[], jobDescription?: JobDescription): string {
  const experienceHTML = generateExperienceHTML(candidateData.experience);
  
  // Generate functional skills with explanatory text
  const generateFunctionalSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return '';
    
    const skillCategories: Record<string, { skills: string[]; description: string }> = {
      'Leadership & Management': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('lead') || 
          skill.toLowerCase().includes('manage') || 
          skill.toLowerCase().includes('team') ||
          skill.toLowerCase().includes('project')
        ),
        description: 'Proven ability to guide teams and manage complex projects with strategic oversight and operational excellence.'
      },
      'Communication & Collaboration': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('communication') || 
          skill.toLowerCase().includes('presentation') || 
          skill.toLowerCase().includes('stakeholder')
        ),
        description: 'Strong interpersonal skills enabling effective collaboration across diverse teams and stakeholder groups.'
      },
      'Problem Solving & Analysis': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('analysis') || 
          skill.toLowerCase().includes('problem') || 
          skill.toLowerCase().includes('research')
        ),
        description: 'Analytical mindset with systematic approach to identifying solutions and optimizing processes.'
      },
      'Innovation & Strategy': {
        skills: skills.filter(skill => 
          skill.toLowerCase().includes('innovation') || 
          skill.toLowerCase().includes('strategy') || 
          skill.toLowerCase().includes('planning')
        ),
        description: 'Forward-thinking approach to business challenges with focus on sustainable growth and competitive advantage.'
      }
    };
    
    // If no categorized skills found, create a general category
    const categorizedSkills = Object.values(skillCategories).some(cat => cat.skills.length > 0);
    if (!categorizedSkills) {
      skillCategories['Core Competencies'] = {
        skills: skills.slice(0, 6),
        description: 'Comprehensive skill set developed through professional experience and continuous learning initiatives.'
      };
    }
    
    return Object.entries(skillCategories)
      .filter(([_, category]) => category.skills.length > 0)
      .map(([categoryName, category]) => `
        <div class="functional-skill-category">
          <div class="skill-category-title">${categoryName}</div>
          <ul class="skill-list">
            ${category.skills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
          <p class="skill-description">${category.description}</p>
        </div>
      `).join('');
  };

  // Generate technical skills with explanatory text
  const generateTechnicalSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return '';
    
    const techCategories: Record<string, { skills: string[]; description: string }> = {
      'Programming Languages': {
        skills: skills.filter(skill => 
          ['javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin'].some(lang => 
            skill.toLowerCase().includes(lang)
          )
        ),
        description: 'Proficient in multiple programming languages with deep understanding of software development principles.'
      },
      'Frameworks & Libraries': {
        skills: skills.filter(skill => 
          ['react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'laravel', '.net'].some(framework => 
            skill.toLowerCase().includes(framework)
          )
        ),
        description: 'Extensive experience with modern frameworks enabling rapid development and scalable solutions.'
      },
      'Databases & Storage': {
        skills: skills.filter(skill => 
          ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite'].some(db => 
            skill.toLowerCase().includes(db)
          )
        ),
        description: 'Comprehensive database management skills across relational and NoSQL technologies.'
      },
      'Cloud & DevOps': {
        skills: skills.filter(skill => 
          ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'].some(cloud => 
            skill.toLowerCase().includes(cloud)
          )
        ),
        description: 'Advanced cloud computing and DevOps expertise for scalable infrastructure management.'
      },
      'Tools & Technologies': {
        skills: skills.filter(skill => 
          !['javascript', 'python', 'java', 'typescript', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'react', 'angular', 'vue', 'node', 'express', 'django', 'spring', 'laravel', '.net',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'].some(tech => 
            skill.toLowerCase().includes(tech)
          )
        ),
        description: 'Diverse technical toolkit supporting efficient development workflows and project delivery.'
      }
    };
    
    // If no categorized skills found, create a general category
    const categorizedSkills = Object.values(techCategories).some(cat => cat.skills.length > 0);
    if (!categorizedSkills) {
      techCategories['Technical Competencies'] = {
        skills: skills,
        description: 'Comprehensive technical skill set acquired through hands-on experience and professional development.'
      };
    }
    
    return Object.entries(techCategories)
      .filter(([_, category]) => category.skills.length > 0)
      .map(([categoryName, category]) => `
        <div class="technical-skill-category">
          <div class="skill-category-title">${categoryName}</div>
          <ul class="skill-list">
            ${category.skills.map(skill => `<li>${skill}</li>`).join('')}
          </ul>
          <p class="skill-description">${category.description}</p>
        </div>
      `).join('');
  };

  // Generate areas of expertise based on role and skills
  const generateAreasOfExpertise = (currentTitle: string, skills: string[]): string[] => {
    const expertiseAreas: string[] = [];
    
    // Add based on current title
    if (currentTitle.toLowerCase().includes('software') || currentTitle.toLowerCase().includes('developer')) {
      expertiseAreas.push('Software Development & Engineering');
    }
    if (currentTitle.toLowerCase().includes('senior') || currentTitle.toLowerCase().includes('lead')) {
      expertiseAreas.push('Technical Leadership & Mentoring');
    }
    if (currentTitle.toLowerCase().includes('full') || currentTitle.toLowerCase().includes('stack')) {
      expertiseAreas.push('Full-Stack Development');
    }
    if (currentTitle.toLowerCase().includes('frontend') || currentTitle.toLowerCase().includes('ui')) {
      expertiseAreas.push('User Interface Development');
    }
    if (currentTitle.toLowerCase().includes('backend') || currentTitle.toLowerCase().includes('api')) {
      expertiseAreas.push('Backend Systems & APIs');
    }
    if (currentTitle.toLowerCase().includes('devops') || currentTitle.toLowerCase().includes('infrastructure')) {
      expertiseAreas.push('DevOps & Infrastructure');
    }
    if (currentTitle.toLowerCase().includes('data') || currentTitle.toLowerCase().includes('analytics')) {
      expertiseAreas.push('Data Analysis & Business Intelligence');
    }
    if (currentTitle.toLowerCase().includes('architect')) {
      expertiseAreas.push('System Architecture & Design');
    }
    if (currentTitle.toLowerCase().includes('manager') || currentTitle.toLowerCase().includes('director')) {
      expertiseAreas.push('Project Management & Strategy');
    }
    
    // Add based on skills
    if (skills.some(skill => skill.toLowerCase().includes('cloud') || skill.toLowerCase().includes('aws') || skill.toLowerCase().includes('azure'))) {
      expertiseAreas.push('Cloud Computing & Scalability');
    }
    if (skills.some(skill => skill.toLowerCase().includes('agile') || skill.toLowerCase().includes('scrum'))) {
      expertiseAreas.push('Agile Methodologies & Process Optimization');
    }
    
    // Ensure we have at least 6 areas
    const defaultAreas = [
      'Digital Transformation',
      'Technology Innovation',
      'Process Optimization',
      'Quality Assurance',
      'Cross-functional Collaboration',
      'Continuous Learning & Development'
    ];
    
    while (expertiseAreas.length < 6) {
      const nextArea = defaultAreas.find(area => !expertiseAreas.includes(area));
      if (nextArea) {
        expertiseAreas.push(nextArea);
      } else {
        break;
      }
    }
    
    return expertiseAreas.slice(0, 6);
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${candidateData.fullName} - Competence File</title>
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
          color: #232629;
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
        
        /* Header Styling - Clean layout with logo on right */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 2px solid #0A2F5A;
        }
        
        .header-left {
          flex: 1;
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0A2F5A;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .header-role {
          font-size: 18px;
          font-weight: 600;
          color: #D97732;
          margin-bottom: 5px;
        }
        
        .header-experience {
          font-size: 16px;
          font-weight: 500;
          color: #444B54;
          margin-bottom: 15px;
        }
        
        .contact-info {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 14px;
        }
        
        .contact-item {
          color: #444B54;
        }
        
        .contact-label {
          font-weight: 700;
          color: #232629;
        }
        
        .header-logo {
          flex-shrink: 0;
          margin-left: 30px;
        }
        
        .logo-image {
          height: 80px;
          width: auto;
        }
        
        /* Content Area */
        .content {
          margin-bottom: 60px;
        }
        
        /* Section Styling */
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 700;
          color: #0A2F5A;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #0A2F5A;
        }
        
        .section-content {
          font-size: 14px;
          line-height: 1.7;
        }
        
        /* Content Formatting */
        .section-content p {
          margin-bottom: 12px;
          line-height: 1.7;
        }
        
        .section-content ul {
          margin: 12px 0;
          padding-left: 0;
          list-style: none;
        }
        
        .section-content li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          line-height: 1.6;
        }
        
        .section-content li:before {
          content: "•";
          color: #FF8C00;
          font-weight: bold;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .section-content strong {
          font-weight: 700;
          color: #0A2F5A;
        }
        
        .section-content em {
          font-style: italic;
          color: #444B54;
        }
        
        /* Professional Summary */
        .summary-text {
          font-weight: 400;
          line-height: 1.8;
          color: #444B54;
        }
        
        /* Functional Skills */
        .functional-skill-category {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #0A2F5A;
        }
        
        .skill-category-title {
          font-size: 15px;
          font-weight: 700;
          color: #0A2F5A;
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
          color: #444B54;
          font-weight: 500;
        }
        
        .skill-list li:before {
          content: "•";
          color: #D97732;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .skill-description {
          font-style: italic;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        
        /* Technical Skills */
        .technical-skill-category {
          margin-bottom: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #D97732;
        }
        
        /* Areas of Expertise */
        .expertise-areas {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 10px;
        }
        
        .expertise-item {
          text-align: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          font-weight: 600;
          color: #444B54;
          border-left: 3px solid #D97732;
        }
        
        /* Education & Certifications */
        .education-item, .cert-item {
          margin-bottom: 12px;
          padding-left: 15px;
          position: relative;
        }
        
        .education-item:before, .cert-item:before {
          content: "•";
          color: #0A2F5A;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .education-degree, .cert-name {
          font-weight: 600;
          color: #232629;
        }
        
        /* Languages */
        .languages-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        
        .language-item {
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 6px;
          text-align: center;
          font-weight: 600;
          color: #444B54;
          border-left: 3px solid #0A2F5A;
        }
        
        /* Experience Summary */
        .experiences-summary {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #0A2F5A;
        }
        
        .experience-summary-item {
          margin-bottom: 10px;
          color: #444B54;
          line-height: 1.6;
        }
        
        /* Experience Blocks */
        .experience-block {
          margin-bottom: 30px;
          padding: 25px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #0A2F5A;
          page-break-inside: avoid;
        }
        
        .exp-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .exp-company {
          font-size: 18px;
          font-weight: 700;
          color: #0A2F5A;
          margin-bottom: 5px;
        }
        
        .exp-title {
          font-size: 16px;
          font-weight: 600;
          color: #D97732;
          margin-bottom: 5px;
        }
        
        .exp-dates {
          font-size: 14px;
          color: #444B54;
          font-weight: 600;
        }
        
        .exp-section {
          margin-bottom: 15px;
        }
        
        .exp-section-title {
          font-size: 14px;
          font-weight: 700;
          color: #0A2F5A;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .exp-description {
          color: #444B54;
          line-height: 1.6;
          margin-bottom: 10px;
          font-style: italic;
        }
        
        .exp-responsibilities, .exp-achievements, .exp-technical {
          list-style: none;
          padding-left: 0;
        }
        
        .exp-responsibilities li, .exp-achievements li, .exp-technical li {
          position: relative;
          padding-left: 15px;
          margin-bottom: 8px;
          color: #444B54;
          line-height: 1.6;
          font-weight: 500;
        }
        
        .exp-responsibilities li:before, .exp-achievements li:before, .exp-technical li:before {
          content: "•";
          color: #D97732;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        /* Footer - appears on every page */
        .footer {
          position: fixed;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          border-top: 1px solid #e9ecef;
          background: white;
          font-size: 12px;
          color: #444B54;
        }
        
        .footer-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .footer-logo {
          height: 20px;
          width: auto;
          opacity: 0.7;
        }
        
        .footer-text {
          font-weight: 500;
          color: #444B54;
        }
        
        .page-number {
          font-weight: 600;
          color: #0A2F5A;
        }
        
        /* Print Optimization */
        @media print {
          body { 
            font-size: 12px; 
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .container { 
            max-width: none; 
            margin: 0; 
            padding: 20px;
            padding-bottom: 60px;
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
        
        /* Page counter for PDF generation */
        @page {
          margin: 20mm;
          @bottom-right {
            content: counter(page);
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 600;
            color: #0A2F5A;
          }
          @bottom-left {
            content: "Powered by EMINEON • forge your edge";
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            color: #444B54;
          }
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .header { 
            flex-direction: column; 
            align-items: flex-start;
          }
          .header-logo { 
            margin-left: 0; 
            margin-top: 15px; 
          }
          .contact-info { 
            flex-direction: column; 
            gap: 10px;
          }
          .expertise-areas { 
            grid-template-columns: 1fr; 
          }
          .languages-grid { 
            grid-template-columns: 1fr; 
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER - Clean layout with logo on right -->
        <div class="header">
          <div class="header-left">
            <h1>${candidateData.fullName}</h1>
            <div class="header-role">${candidateData.currentTitle}</div>
            <div class="header-experience">${candidateData.yearsOfExperience} years of experience</div>
            <div class="contact-info">
              ${candidateData.email ? `<div class="contact-item"><span class="contact-label">Email:</span> ${candidateData.email}</div>` : ''}
              ${candidateData.phone ? `<div class="contact-item"><span class="contact-label">Phone:</span> ${candidateData.phone}</div>` : ''}
              ${candidateData.location ? `<div class="contact-item"><span class="contact-label">Location:</span> ${candidateData.location}</div>` : ''}
            </div>
          </div>
          <div class="header-logo">
            <img src="https://res.cloudinary.com/emineon/image/upload/Emineon_logo_no_background_yjmchn" alt="EMINEON" class="logo-image" />
          </div>
        </div>

        <div class="content">
          <!-- PROFESSIONAL SUMMARY -->
          ${candidateData.summary ? `
          <div class="section">
            <h2 class="section-title">PROFESSIONAL SUMMARY</h2>
            <div class="section-content">
              <p class="summary-text">${candidateData.summary}</p>
            </div>
          </div>
          ` : ''}

          <!-- FUNCTIONAL SKILLS -->
          ${candidateData.skills && candidateData.skills.length > 0 ? `
          <div class="section">
            <h2 class="section-title">FUNCTIONAL SKILLS</h2>
            <div class="section-content">
              ${generateFunctionalSkills(candidateData.skills)}
            </div>
          </div>
          ` : ''}

          <!-- TECHNICAL SKILLS -->
          ${candidateData.skills && candidateData.skills.length > 0 ? `
          <div class="section">
            <h2 class="section-title">TECHNICAL SKILLS</h2>
            <div class="section-content">
              ${generateTechnicalSkills(candidateData.skills)}
            </div>
          </div>
          ` : ''}

          <!-- AREAS OF EXPERTISE -->
          <div class="section">
            <h2 class="section-title">AREAS OF EXPERTISE</h2>
            <div class="section-content">
              <div class="expertise-areas">
                ${generateAreasOfExpertise(candidateData.currentTitle, candidateData.skills).map(area => `
                  <div class="expertise-item"><strong>${area}</strong></div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- EDUCATION -->
          ${candidateData.education && candidateData.education.length > 0 ? `
          <div class="section">
            <h2 class="section-title">EDUCATION</h2>
            <div class="section-content">
              ${candidateData.education.map(edu => `
                <div class="education-item">
                  <div class="education-degree"><strong>${edu}</strong></div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- CERTIFICATIONS -->
          ${candidateData.certifications && candidateData.certifications.length > 0 ? `
          <div class="section">
            <h2 class="section-title">CERTIFICATIONS</h2>
            <div class="section-content">
              ${candidateData.certifications.map(cert => `
                <div class="cert-item">
                  <div class="cert-name"><strong>${cert}</strong></div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}

          <!-- LANGUAGES -->
          ${candidateData.languages && candidateData.languages.length > 0 ? `
          <div class="section">
            <h2 class="section-title">LANGUAGES</h2>
            <div class="section-content">
              <div class="languages-grid">
                ${candidateData.languages.map(lang => `
                  <div class="language-item">${lang}</div>
                `).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          <!-- PROFESSIONAL EXPERIENCE -->
          ${experienceHTML}
        </div>

        <!-- Footer with logo and page numbers -->
        <div class="footer">
          <div class="footer-left">
            <img src="https://res.cloudinary.com/emineon/image/upload/Emineon_logo_no_background_yjmchn" alt="EMINEON" class="footer-logo" />
            <span class="footer-text">Powered by EMINEON • forge your edge</span>
          </div>
          <div class="page-number">Page <span id="pageNumber"></span></div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { candidateData, template = 'professional', content, format = 'pdf', sections, jobDescription } = body;

    if (!candidateData) {
      return NextResponse.json(
        { success: false, message: 'Candidate data is required' },
        { status: 400 }
      );
    }

    console.log('🎨 Generating competence file...', {
      candidate: candidateData.fullName,
      template,
      format,
      experienceCount: candidateData.experience?.length || 0
    });

    // Generate HTML content based on template
    let htmlContent: string;
    if (template === 'antaes' || template === 'cf-antaes-consulting') {
      htmlContent = generateAntaesCompetenceFileHTML(candidateData, sections, jobDescription);
    } else {
      htmlContent = generateCompetenceFileHTML(candidateData, sections, jobDescription);
    }

    if (format === 'pdf') {
      try {
        // Attempt PDF generation
        console.log('📄 Attempting PDF generation...');
        const pdfBuffer = await generatePDF(htmlContent);
        
        const filename = `${candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Competence_File.pdf`;

        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        });
      } catch (pdfError) {
        console.error('❌ PDF generation failed:', pdfError);
        console.log('🔄 Falling back to HTML format...');
        
        // Fallback to HTML
        const filename = `${candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Competence_File.html`;
        
        return new NextResponse(htmlContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': Buffer.byteLength(htmlContent, 'utf8').toString(),
          },
        });
      }
    } else {
      // For non-PDF formats, return HTML
      const filename = `${candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_Competence_File.html`;
      
      return new NextResponse(htmlContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': Buffer.byteLength(htmlContent, 'utf8').toString(),
        },
      });
    }

  } catch (error) {
    console.error('💥 Error generating competence file:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate competence file'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check service status
export async function GET() {
  return NextResponse.json({
    service: 'Competence File Generator',
    status: 'operational',
    features: {
      cvParsing: !!process.env.OPENAI_API_KEY,
      pdfGeneration: true,
      docxGeneration: true,
      fileStorage: true, // Local file storage is always available
    },
    timestamp: new Date().toISOString(),
  });
} 