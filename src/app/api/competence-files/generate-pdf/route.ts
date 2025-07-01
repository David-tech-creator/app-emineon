import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { generatePDF } from '@/lib/pdf-service';
import { CompetenceFileStatus } from '@prisma/client';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { generateAntaesCompetenceFileHTML } from '../generate/route';

// Types for the request
interface SegmentContent {
  id: string;
  type: string;
  title: string;
  content: string;
  order: number;
}

interface PDFGenerationRequest {
  candidateData: {
    id: string;
    fullName: string;
    currentTitle: string;
    email: string;
    phone: string;
    location: string;
    yearsOfExperience: number;
    skills: string[];
    certifications: string[];
    experience: any[];
    education: string[];
    languages: string[];
    summary: string;
  };
  segments: SegmentContent[];
  jobDescription?: {
    text: string;
    requirements: string[];
    skills: string[];
    responsibilities: string[];
    title?: string;
    company?: string;
  };
  managerContact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  template?: string;
  client?: string;
  jobTitle?: string;
}

// 🏗️ STEP 1: SEGMENT STRUCTURING
interface StructuredSegment {
  order: number;
  title: string;
  content: string;
  type: 'header' | 'summary' | 'skills' | 'experience' | 'experience-summary' | 'education' | 'static' | 'dynamic';
  formatting: 'paragraph' | 'list' | 'table' | 'columns';
  priority: 'high' | 'medium' | 'low';
}

// ENHANCED SEGMENT STRUCTURING with better recognition
function structureSegments(segments: SegmentContent[], candidateData: any, template: string): StructuredSegment[] {
  console.log('🏗️ STEP 1: Structuring segments with proper normalization...');
  
  const structuredSegments: StructuredSegment[] = segments
    .filter(segment => segment.content && segment.content.trim() !== '')
    .sort((a, b) => a.order - b.order)
    .map((segment, index) => {
      let type: StructuredSegment['type'] = 'dynamic';
      let formatting: StructuredSegment['formatting'] = 'paragraph';
      let priority: StructuredSegment['priority'] = 'medium';
      
      const titleUpper = segment.title.toUpperCase();
      const titleLower = segment.title.toLowerCase();
      
      // Enhanced section recognition with experience summary detection
      if (titleUpper.includes('HEADER') || titleUpper.includes('NAME')) {
        type = 'header';
        priority = 'high';
      } else if (titleUpper.includes('SUMMARY') || titleUpper.includes('EXECUTIVE') || titleUpper.includes('PROFILE')) {
        type = 'summary';
        priority = 'high';
      } else if (
        titleUpper.includes('SKILL') || 
        titleUpper.includes('COMPETENC') || 
        titleUpper.includes('EXPERTISE') ||
        titleUpper.includes('TECHNICAL') ||
        titleUpper.includes('FUNCTIONAL')
      ) {
        type = 'skills';
        formatting = 'list';
        priority = 'high';
      } else if (
        titleUpper.includes('PROFESSIONAL EXPERIENCES SUMMARY') ||
        titleLower.includes('experiences summary') ||
        titleLower.includes('experience summary') ||
        (titleUpper.includes('EXPERIENCE') && titleUpper.includes('SUMMARY'))
      ) {
        type = 'experience-summary';
        formatting = 'paragraph';
        priority = 'high';
      } else if (
        titleUpper.includes('EXPERIENCE') || 
        titleUpper.includes('EMPLOYMENT') ||
        titleUpper.includes('PROFESSIONAL EXPERIENCE') ||
        titleLower.includes('experience 1') ||
        titleLower.includes('experience 2') ||
        titleLower.includes('experience 3') ||
        titleLower.includes('professional experiences') ||
        titleLower.match(/professional experience \d+/)
      ) {
        type = 'experience';
        formatting = 'paragraph';
        priority = 'high';
      } else if (
        titleUpper.includes('EDUCATION') || 
        titleUpper.includes('QUALIFICATION') ||
        titleUpper.includes('ACADEMIC') ||
        titleUpper.includes('DEGREE')
      ) {
        type = 'education';
        formatting = 'list';
        priority = 'medium';
      } else if (
        titleUpper.includes('LANGUAGE') || 
        titleUpper.includes('CERTIFICATION') ||
        titleUpper.includes('CERT ') ||
        titleUpper.includes('LICENSE')
      ) {
        type = 'static';
        formatting = 'columns';
        priority = 'medium';
      }
      
      console.log(`📋 Structured segment: "${segment.title}" -> type: ${type}, formatting: ${formatting}`);
      
      return {
        order: index,
        title: segment.title,
        content: segment.content,
        type,
        formatting,
        priority
      };
    });

  console.log(`✅ Structured ${structuredSegments.length} segments`);
  return structuredSegments;
}

// 🧹 STEP 2: CONTENT CLEANING & NORMALIZATION
function cleanAndNormalizeContent(content: string, formatting: StructuredSegment['formatting']): string {
  let cleanedContent = content
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  switch (formatting) {
    case 'list':
      cleanedContent = cleanedContent
        .split('\n')
        .filter(Boolean)
        .map(line => {
          line = line.trim();
          if (!line.match(/^[•\-\*]/)) {
            if (line.includes(':') || /^[A-Z\s&]+$/.test(line)) {
              return `**${line}**`;
            }
            return `• ${line}`;
          }
          return line.replace(/^[•\-\*]\s*/, '• ');
        })
        .join('\n');
      break;
      
    case 'columns':
      cleanedContent = cleanedContent
        .split('\n')
        .filter(Boolean)
        .map(line => line.trim())
        .map(line => line.match(/^[•\-\*]/) ? line : `• ${line}`)
        .join('\n');
      break;
      
    case 'paragraph':
    default:
      cleanedContent = cleanedContent
        .split('\n')
        .filter(Boolean)
        .map(line => line.trim())
        .join('\n\n');
      break;
  }

  return cleanedContent;
}

// 🎨 STEP 3: ENHANCED SEMANTIC FORMATTING with comprehensive section structuring
async function applySemanticFormatting(content: string, segmentType: StructuredSegment['type'], template: string): Promise<string> {
  console.log(`🎨 Applying semantic formatting for type: ${segmentType}`);
  
  try {
    switch (segmentType) {
      case 'header':
        return await formatHeaderContent(content, template);
      case 'summary':
        return await formatSummaryContent(content, template);
      case 'skills':
        return await formatSkillsContent(content, template);
      case 'experience':
        return await formatExperienceContent(content, template);
      case 'experience-summary':
        return await formatExperienceSummaryContent(content, template);
      case 'education':
        return formatEducationContent(content);
      case 'static':
        return formatStaticContent(content, template);
      default:
        return await applyGeneralFormatting(content);
    }
  } catch (error) {
    console.error(`❌ Error in semantic formatting for ${segmentType}:`, error);
    return convertMarkdownToHTML(content);
  }
}

// ✨ HEADER FORMATTING
async function formatHeaderContent(content: string, template: string): Promise<string> {
  console.log('🔧 Formatting header content...');
  
  const lines = content.split('\n').filter(line => line.trim());
  let formattedHtml = '<div class="header-section">';
  
  for (const line of lines) {
    const cleanLine = convertMarkdownToHTML(line.trim());
    if (cleanLine.includes('@') || cleanLine.includes('phone') || cleanLine.includes('+')) {
      formattedHtml += `<div class="contact-info">${cleanLine}</div>`;
    } else if (cleanLine.match(/\d+\s*(years|yrs)/i)) {
      formattedHtml += `<div class="experience-info">${cleanLine}</div>`;
    } else {
      formattedHtml += `<div class="header-info">${cleanLine}</div>`;
    }
  }
  
  formattedHtml += '</div>';
  return formattedHtml;
}

// ✨ PROFESSIONAL SUMMARY FORMATTING
async function formatSummaryContent(content: string, template: string): Promise<string> {
  console.log('🔧 Formatting professional summary...');
  
  const cleanContent = convertMarkdownToHTML(content);
  const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
  
  let formattedHtml = '<div class="summary-section">';
  
  paragraphs.forEach((paragraph, index) => {
    const cleanParagraph = paragraph.trim();
    if (cleanParagraph.length > 0) {
      formattedHtml += `<p class="summary-paragraph ${index === 0 ? 'summary-opening' : ''}">${cleanParagraph}</p>`;
    }
  });
  
  formattedHtml += '</div>';
  return formattedHtml;
}

// NEW: Comprehensive markdown to HTML converter
function convertMarkdownToHTML(content: string): string {
  return content
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Bullet points with various markers
    .replace(/^[•▸\-\*]\s*(.+)$/gm, '<li>$1</li>')
    
    // Line breaks
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
    
    // Wrap orphaned list items in <ul>
    .replace(/(<li>.*?<\/li>)/g, (match) => {
      // Don't wrap if already in a list
      if (match.includes('<ul>') || match.includes('<ol>')) {
        return match;
      }
      return `<ul>${match}</ul>`;
    })
    
    // Clean up any remaining markdown artifacts
    .replace(/^\s*[\-\*\+]\s*/gm, '')
    .replace(/^\s*\d+\.\s*/gm, '')
    
    // Wrap content in paragraphs if not already wrapped
    .replace(/^(?!<[uo]l|<h[1-6]|<p|<div)(.+)$/gm, '<p>$1</p>')
    
    // Clean up empty tags
    .replace(/<p><\/p>/g, '')
    .replace(/<li><\/li>/g, '')
    .replace(/(<ul>|<ol>)\s*(<\/ul>|<\/ol>)/g, '');
}

// ✨ ENHANCED SKILLS FORMATTING (Technical Skills, Functional Skills, Areas of Expertise)
async function formatSkillsContent(content: string, template: string): Promise<string> {
  console.log('🔧 Formatting skills content with comprehensive structure...');
  
  try {
    const lines = content.split('\n').filter(line => line.trim());
    let formattedHtml = '<div class="skills-section">';
    
    let currentCategory = '';
    let currentSkills: string[] = [];
    let currentSubItems: string[] = [];
    let isInSubSection = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for main category headers (bold text, all caps, numbered, or hash)
      if (trimmedLine.match(/^(\*\*.*\*\*|[A-Z][A-Z\s&]+:?$|^\d+\.\s*\*\*.*\*\*|^#{1,3}\s*)/)) {
        // Save previous category
        if (currentCategory && (currentSkills.length > 0 || currentSubItems.length > 0)) {
          formattedHtml += formatSkillCategory(currentCategory, currentSkills, currentSubItems);
          currentSkills = [];
          currentSubItems = [];
        }
        
        // Start new category
        currentCategory = trimmedLine
          .replace(/^#{1,3}\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:$/, '')
          .trim();
        isInSubSection = false;
      } 
      // Check for sub-category headers (with dash or lower case starting)
      else if (trimmedLine.match(/^(-\s*\*\*.*\*\*|-\s*[A-Za-z].*:$|[a-z].*:$)/)) {
        // Save any pending sub-items
        if (currentSubItems.length > 0) {
          currentSkills.push(`<div class="skill-subcategory-items">${currentSubItems.join(', ')}</div>`);
          currentSubItems = [];
        }
        
        const subCategory = trimmedLine
          .replace(/^-\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:$/, '')
          .trim();
        currentSkills.push(`<div class="skill-subheader"><strong>${subCategory}:</strong></div>`);
        isInSubSection = true;
      }
      // Regular skill items
      else if (trimmedLine.length > 0) {
        const skill = trimmedLine
          .replace(/^[•▸\-\*]\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        
        if (skill.length > 0) {
          if (isInSubSection) {
            currentSubItems.push(skill);
          } else {
            currentSkills.push(skill);
          }
        }
      }
    }
    
    // Add final category
    if (currentCategory && (currentSkills.length > 0 || currentSubItems.length > 0)) {
      formattedHtml += formatSkillCategory(currentCategory, currentSkills, currentSubItems);
    }
    
    // If no categories found, treat as single list
    if (!currentCategory && currentSkills.length === 0 && currentSubItems.length === 0) {
      const allSkills = lines.map(line => 
        line.replace(/^[•▸\-\*]\s*/, '').replace(/\*\*/g, '').trim()
      ).filter(skill => skill.length > 0);
      
      formattedHtml += `<div class="skill-items-grid">
        ${allSkills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>`;
    }
    
    formattedHtml += '</div>';
    console.log('✅ Skills content formatted with comprehensive structure');
    return formattedHtml;
    
  } catch (error) {
    console.error('❌ Error formatting skills content:', error);
    // Fallback: convert basic content
    const basicHtml = convertMarkdownToHTML(content);
    return `<div class="skills-section">${basicHtml}</div>`;
  }
}

// Helper function to format skill categories with enhanced visual structure
function formatSkillCategory(category: string, skills: string[], subItems: string[]): string {
  let categoryHtml = `<div class="skill-category">
    <h4 class="skill-category-title">${category}</h4>`;
  
  if (skills.length > 0) {
    // Check if skills contain HTML (sub-categories)
    const hasSubCategories = skills.some(skill => skill.includes('<div'));
    
    if (hasSubCategories) {
      categoryHtml += `<div class="skill-content">${skills.join('')}</div>`;
    } else {
      categoryHtml += `<div class="skill-items-grid">
        ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>`;
    }
  }
  
  if (subItems.length > 0) {
    categoryHtml += `<div class="skill-items-grid">
      ${subItems.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
    </div>`;
  }
  
  categoryHtml += '</div>';
  return categoryHtml;
}

// ✨ ENHANCED PROFESSIONAL EXPERIENCE FORMATTING
async function formatExperienceContent(content: string, template: string): Promise<string> {
  console.log('🔧 Formatting professional experience with comprehensive structure...');
  
  try {
    const lines = content.split('\n').filter(line => line.trim());
    let formattedHtml = '<div class="experience-section">';
    
    let currentExperience = '';
    let currentCompany = '';
    let currentRole = '';
    let currentDates = '';
    let currentSection = '';
    let currentItems: string[] = [];
    let isFirstExperience = true;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if it's a company/role line (contains company name and dates)
      if (trimmedLine.includes(' - ') && trimmedLine.match(/\d{4}/)) {
        // Save previous experience
        if (currentExperience && !isFirstExperience) {
          if (currentItems.length > 0) {
            formattedHtml += formatExperienceSubsection(currentSection, currentItems);
          }
          formattedHtml += '</div></div>'; // Close previous experience content and item
          currentItems = [];
        }
        
        // Parse new experience with enhanced parsing
        const cleanLine = trimmedLine.replace(/\*\*/g, '').trim();
        const parts = cleanLine.split(' - ');
        currentCompany = parts[0].trim();
        
        // Enhanced role and date parsing
        const roleAndDatePart = parts.slice(1).join(' - ').trim();
        const dateMatch = roleAndDatePart.match(/(\d{4}[-\/]\d{2}|\d{4})\s*[-–—]\s*(\d{4}[-\/]\d{2}|\d{4}|Present|Current)$/i);
        
        if (dateMatch) {
          currentDates = dateMatch[0];
          currentRole = roleAndDatePart.replace(dateMatch[0], '').trim();
        } else {
          // Fallback parsing
          const roleMatch = roleAndDatePart.match(/^(.+?)(?:\s+(\d{4}.*)|$)/);
          currentRole = roleMatch ? roleMatch[1].trim() : roleAndDatePart;
          currentDates = roleMatch && roleMatch[2] ? roleMatch[2] : '';
        }
        
        // Start new experience with enhanced header
        formattedHtml += `<div class="experience-item">
          <div class="experience-header">
            <div class="company-info">
              <h3 class="company-name">${currentCompany}</h3>
              <div class="role-title">${currentRole}</div>
            </div>
            <div class="experience-dates">${currentDates}</div>
          </div>
          <div class="experience-content">`;
        
        currentExperience = currentCompany;
        currentSection = 'Key Responsibilities';
        isFirstExperience = false;
      } 
      // Enhanced section header detection
      else if (trimmedLine.match(/^(\*\*.*\*\*|[A-Z][A-Za-z\s&]+:)$/)) {
        // Save previous section
        if (currentItems.length > 0) {
          formattedHtml += formatExperienceSubsection(currentSection, currentItems);
          currentItems = [];
        }
        
        // Start new section with enhanced recognition
        currentSection = trimmedLine
          .replace(/\*\*/g, '')
          .replace(/:$/, '')
          .trim();
      }
      // Enhanced item detection and categorization
      else if (trimmedLine.match(/^[•▸\-\*]\s*/) || (trimmedLine.length > 10 && currentExperience)) {
        const item = trimmedLine
          .replace(/^[•▸\-\*]\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        
        if (item && item.length > 3) {
          currentItems.push(item);
        }
      }
      // Handle multi-line content that might be part of previous item
      else if (trimmedLine.length > 0 && currentExperience && !trimmedLine.match(/^[A-Z][A-Z\s]+:?$/)) {
        const cleanItem = trimmedLine.replace(/\*\*/g, '').trim();
        if (cleanItem.length > 5) {
          currentItems.push(cleanItem);
        }
      }
    }
    
    // Close final sections and experience
    if (currentItems.length > 0) {
      formattedHtml += formatExperienceSubsection(currentSection, currentItems);
    }
    
    if (currentExperience) {
      formattedHtml += '</div></div>'; // Close final experience content and item
    }
    
    formattedHtml += '</div>';
    console.log('✅ Professional experience formatted with comprehensive structure');
    return formattedHtml;
    
  } catch (error) {
    console.error('❌ Error formatting experience content:', error);
    // Enhanced fallback
    const basicHtml = convertMarkdownToHTML(content);
    return `<div class="experience-section">${basicHtml}</div>`;
  }
}

// Helper function to format experience subsections with enhanced structure
function formatExperienceSubsection(sectionTitle: string, items: string[]): string {
  if (!sectionTitle || items.length === 0) return '';
  
  // Enhanced section type detection
  const sectionType = detectExperienceSection(sectionTitle);
  const sectionClass = `experience-subsection ${sectionType}`;
  
  let formattedItems = '';
  
  // Special formatting for different section types
  switch (sectionType) {
    case 'achievements':
      formattedItems = items.map(item => 
        `<li class="achievement-item">${item}</li>`
      ).join('');
      break;
      
    case 'technical-environment':
      formattedItems = items.map(item => 
        `<span class="tech-tag">${item}</span>`
      ).join('');
      return `<div class="${sectionClass}">
        <h5 class="subsection-title">${sectionTitle}</h5>
        <div class="tech-environment">${formattedItems}</div>
      </div>`;
      
    case 'responsibilities':
    default:
      formattedItems = items.map(item => 
        `<li class="responsibility-item">${item}</li>`
      ).join('');
      break;
  }
  
  return `<div class="${sectionClass}">
    <h5 class="subsection-title">${sectionTitle}</h5>
    <ul class="subsection-list">${formattedItems}</ul>
  </div>`;
}

// Helper function to detect experience section types
function detectExperienceSection(sectionTitle: string): string {
  const title = sectionTitle.toLowerCase();
  
  if (title.includes('achievement') || title.includes('accomplishment') || title.includes('result')) {
    return 'achievements';
  } else if (title.includes('technical') || title.includes('environment') || title.includes('technology') || title.includes('stack')) {
    return 'technical-environment';
  } else if (title.includes('responsibility') || title.includes('duties') || title.includes('role')) {
    return 'responsibilities';
  } else {
    return 'general';
  }
}

function formatEducationContent(content: string): string {
  console.log('🔧 Formatting education content...');
  
  const lines = content.split('\n').filter(line => line.trim());
  let formattedHtml = '<div class="education-section">';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Clean the line of markdown syntax
    const cleanLine = trimmedLine
      .replace(/^[•▸\-\*]\s*/, '')
      .replace(/\*\*/g, '')
      .trim();
    
    if (cleanLine.length > 0) {
      formattedHtml += `<div class="education-item">
        <p>${cleanLine}</p>
      </div>`;
    }
  }
  
  formattedHtml += '</div>';
  console.log('✅ Education content formatted successfully');
  return formattedHtml;
}

// ✨ ENHANCED STATIC CONTENT FORMATTING (Certifications, Languages)
function formatStaticContent(content: string, template: string): string {
  console.log('🔧 Formatting static content with enhanced structure...');
  
  const lines = content.split('\n').filter(line => line.trim());
  let formattedHtml = '<div class="static-section">';
  
  // Check if content has categories or is just a list
  const hasCategories = lines.some(line => 
    line.match(/^(###|##|\*\*.*\*\*|[A-Z][A-Z\s&]+:?$)/)
  );
  
  // Detect content type for special formatting
  const contentType = detectStaticContentType(content);
  
  if (hasCategories) {
    let currentCategory = '';
    let currentItems: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for category headers
      if (trimmedLine.match(/^(###|##|\*\*.*\*\*|[A-Z][A-Z\s&]+:?$)/)) {
        // Save previous category
        if (currentCategory && currentItems.length > 0) {
          formattedHtml += formatStaticCategory(currentCategory, currentItems, contentType);
          currentItems = [];
        }
        
        // Start new category
        currentCategory = trimmedLine
          .replace(/^#{1,3}\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/:$/, '')
          .trim();
      } else if (trimmedLine.length > 0) {
        // Add item
        const item = trimmedLine
          .replace(/^[•▸\-\*]\s*/, '')
          .replace(/\*\*/g, '')
          .trim();
        if (item.length > 0) {
          currentItems.push(item);
        }
      }
    }
    
    // Add final category
    if (currentCategory && currentItems.length > 0) {
      formattedHtml += formatStaticCategory(currentCategory, currentItems, contentType);
    }
  } else {
    // No categories, just format as single list
    const items = lines.map(line => 
      line.replace(/^[•▸\-\*]\s*/, '').replace(/\*\*/g, '').trim()
    ).filter(item => item.length > 0);
    
    if (contentType === 'certifications') {
      formattedHtml += `<div class="certification-badges">
        ${items.map(item => formatCertificationItem(item)).join('')}
      </div>`;
    } else if (contentType === 'languages') {
      formattedHtml += `<div class="language-list">
        ${items.map(item => formatLanguageItem(item)).join('')}
      </div>`;
    } else {
      formattedHtml += `<div class="static-items">
        ${items.map(item => `<span class="static-item">${item}</span>`).join('')}
      </div>`;
    }
  }
  
  formattedHtml += '</div>';
  console.log('✅ Static content formatted with enhanced structure');
  return formattedHtml;
}

// Helper function to detect static content type
function detectStaticContentType(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('certification') || contentLower.includes('certified') || 
      contentLower.includes('license') || contentLower.includes('credential')) {
    return 'certifications';
  } else if (contentLower.includes('language') || contentLower.includes('english') || 
             contentLower.includes('french') || contentLower.includes('spanish') ||
             contentLower.includes('native') || contentLower.includes('fluent') ||
             contentLower.includes('professional') || contentLower.includes('conversational')) {
    return 'languages';
  } else {
    return 'general';
  }
}

// Helper function to format static categories based on content type
function formatStaticCategory(category: string, items: string[], contentType: string): string {
  let categoryHtml = `<div class="static-category ${contentType}">
    <h4 class="static-category-title">${category}</h4>`;
  
  if (contentType === 'certifications') {
    categoryHtml += `<div class="certification-badges">
      ${items.map(item => formatCertificationItem(item)).join('')}
    </div>`;
  } else if (contentType === 'languages') {
    categoryHtml += `<div class="language-list">
      ${items.map(item => formatLanguageItem(item)).join('')}
    </div>`;
  } else {
    categoryHtml += `<div class="static-items">
      ${items.map(item => `<span class="static-item">${item}</span>`).join('')}
    </div>`;
  }
  
  categoryHtml += '</div>';
  return categoryHtml;
}

// Enhanced certification formatting with badge-style elements
function formatCertificationItem(item: string): string {
  // Parse certification with optional provider/date
  const certMatch = item.match(/^(.+?)(?:\s*[-–—]\s*(.+?))?(?:\s*\((.+?)\))?$/);
  
  if (certMatch) {
    const certName = certMatch[1].trim();
    const provider = certMatch[2] ? certMatch[2].trim() : '';
    const dateOrLevel = certMatch[3] ? certMatch[3].trim() : '';
    
    return `<div class="certification-badge">
      <div class="cert-name">${certName}</div>
      ${provider ? `<div class="cert-provider">${provider}</div>` : ''}
      ${dateOrLevel ? `<div class="cert-date">${dateOrLevel}</div>` : ''}
    </div>`;
  } else {
    return `<div class="certification-badge">
      <div class="cert-name">${item}</div>
    </div>`;
  }
}

// Enhanced language formatting with professional display
function formatLanguageItem(item: string): string {
  // Parse language with level (French - Native, English - Professional, etc.)
  const langMatch = item.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  
  if (langMatch) {
    const language = langMatch[1].trim();
    const level = langMatch[2].trim();
    
    // Determine level class for styling
    const levelClass = getLevelClass(level);
    
    return `<div class="language-item ${levelClass}">
      <span class="language-name">${language}</span>
      <span class="language-level">${level}</span>
    </div>`;
  } else {
    return `<div class="language-item">
      <span class="language-name">${item}</span>
    </div>`;
  }
}

// Helper function to get CSS class for language proficiency level
function getLevelClass(level: string): string {
  const levelLower = level.toLowerCase();
  
  if (levelLower.includes('native') || levelLower.includes('mother tongue')) {
    return 'level-native';
  } else if (levelLower.includes('fluent') || levelLower.includes('advanced')) {
    return 'level-fluent';
  } else if (levelLower.includes('professional') || levelLower.includes('business')) {
    return 'level-professional';
  } else if (levelLower.includes('intermediate')) {
    return 'level-intermediate';
  } else if (levelLower.includes('basic') || levelLower.includes('elementary')) {
    return 'level-basic';
  } else {
    return 'level-general';
  }
}

async function applyGeneralFormatting(content: string): Promise<string> {
  console.log('🔧 Applying general formatting...');
  
  // Convert markdown to HTML
  const htmlContent = convertMarkdownToHTML(content);
  
  console.log('✅ General formatting applied successfully');
  return `<div class="general-content">${htmlContent}</div>`;
}

// Main formatting pipeline
async function formatContentForPDF(
  segments: SegmentContent[], 
  candidateData: any, 
  template: string = 'professional-classic',
  jobDescription?: any
): Promise<SegmentContent[]> {
  console.log('🎯 STEP 4: Applying 5-step formatting pipeline...');
  
  // Step 1: Structure segments
  const structuredSegments = structureSegments(segments, candidateData, template);
  
  // Step 2-3: Clean and format content
  const formattedSegments: SegmentContent[] = [];
  
  for (const segment of structuredSegments) {
    try {
      console.log(`📝 Processing segment: ${segment.title}`);
      
      // Step 2: Clean content
      const cleanedContent = cleanAndNormalizeContent(segment.content, segment.formatting);
      
      // Step 3: Apply semantic formatting with AI
      const formattedContent = await applySemanticFormatting(cleanedContent, segment.type, template);
      
      formattedSegments.push({
        id: `formatted_${segment.order}`,
        type: segment.type,
        title: segment.title,
        content: formattedContent,
        order: segment.order
      });
      
      console.log(`✅ Formatted segment: ${segment.title}`);
    } catch (error) {
      console.error(`❌ Error formatting segment ${segment.title}:`, error);
      // Fallback to original content
      formattedSegments.push({
        id: `fallback_${segment.order}`,
        type: segment.type,
        title: segment.title,
        content: segment.content,
        order: segment.order
      });
    }
  }
  
  console.log(`✅ Completed formatting pipeline: ${formattedSegments.length} segments processed`);
  return formattedSegments;
}

// 🏗️ STEP 4: ENHANCED HTML GENERATION with modular structure
function generateHTMLFromSegments(segments: SegmentContent[], candidateData: any, template: string = 'professional-classic'): string {
  const headerData = {
    fullName: candidateData.fullName,
    currentTitle: candidateData.currentTitle,
    email: candidateData.email,
    phone: candidateData.phone,
    location: candidateData.location,
    yearsOfExperience: candidateData.yearsOfExperience
  };
  
  const styles = getTemplateStyles(template);
  
  const sectionsHTML = segments
    .filter(segment => segment.content && segment.content.trim() !== '')
    .sort((a, b) => a.order - b.order)
    .map(segment => {
      if (segment.title.toUpperCase().includes('HEADER') || segment.title.toUpperCase().includes('NAME')) {
        return '';
      }
      
      return `
        <section class="content-section" data-section-type="${segment.type}">
          <h2 class="section-title">${segment.title}</h2>
          <div class="section-content">
            ${segment.content}
          </div>
        </section>
      `;
    })
    .filter(Boolean)
    .join('');
  
  const headerHTML = `
    <header class="document-header">
      <div class="candidate-info">
        <h1 class="candidate-name">${headerData.fullName}</h1>
        <div class="candidate-title">${headerData.currentTitle}</div>
        <div class="contact-info">
          <div class="contact-row">
            ${headerData.email ? `<span class="contact-item email">${headerData.email}</span>` : ''}
            ${headerData.phone ? `<span class="contact-item phone">${headerData.phone}</span>` : ''}
          </div>
          <div class="contact-row">
            ${headerData.location ? `<span class="contact-item location">${headerData.location}</span>` : ''}
            ${headerData.yearsOfExperience ? `<span class="contact-item experience">${headerData.yearsOfExperience} years experience</span>` : ''}
          </div>
        </div>
      </div>
    </header>
  `;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerData.fullName} - Professional Competence File</title>
      <style>
        ${styles}
      </style>
    </head>
    <body>
      <div class="competence-document ${template}-template">
        ${headerHTML}
        <main class="document-content">
          ${sectionsHTML}
        </main>
      </div>
    </body>
    </html>
  `;
}

// 🎨 STEP 5: ENHANCED TEMPLATE STYLES with comprehensive structured formatting
function getTemplateStyles(template: string): string {
  const baseStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #232629;
      background: white;
    }
    
    .competence-document {
      max-width: 800px;
      margin: 0 auto;
      padding: 30px;
      background: white;
    }
    
    /* ===== HEADER STYLES ===== */
    .document-header {
      text-align: center;
      border-bottom: 2px solid #333333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .candidate-name {
      font-size: 24px;
      font-weight: 700;
      color: #333333;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    
    .candidate-title {
      font-size: 16px;
      font-weight: 500;
      color: #666666;
      margin-bottom: 15px;
    }
    
    .contact-info {
      font-size: 11px;
      color: #777777;
    }
    
    .contact-row {
      margin: 4px 0;
    }
    
    .contact-item {
      margin: 0 15px;
      font-weight: 400;
    }
    
    .contact-item:first-child {
      margin-left: 0;
    }
    
    .contact-item:last-child {
      margin-right: 0;
    }
    
    /* ===== SECTION HEADERS ===== */
    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      padding: 8px 0;
      margin: 20px 0 15px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .content-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .section-content {
      padding: 0 5px;
    }
    
    /* ===== PROFESSIONAL SUMMARY STYLES ===== */
    .summary-section {
      margin-bottom: 20px;
    }
    
    .summary-paragraph {
      margin-bottom: 12px;
      font-size: 12px;
      line-height: 1.7;
      text-align: justify;
      color: #444444;
    }
    
    .summary-opening {
      font-weight: 500;
    }
    
    /* ===== SIMPLIFIED SKILLS STYLES ===== */
    .skills-section {
      margin-bottom: 25px;
    }
    
    .skill-category {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .skill-category-title {
      font-size: 13px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }
    
    .skill-items-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    
    .skill-tag {
      background: #f5f5f5;
      color: #333333;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      border: 1px solid #e0e0e0;
      display: inline-block;
      margin: 2px;
      white-space: nowrap;
    }
    
    .skill-content {
      margin-bottom: 12px;
    }
    
    .skill-subheader {
      font-weight: 600;
      color: #555555;
      margin: 6px 0 4px 0;
      font-size: 11px;
    }
    
    .skill-subcategory-items {
      margin-left: 12px;
      color: #666666;
    }
    
    /* ===== SIMPLIFIED PROFESSIONAL EXPERIENCE STYLES ===== */
    .experience-section {
      margin-bottom: 25px;
    }
    
    .experience-item {
      margin-bottom: 20px;
      page-break-inside: avoid;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .experience-header {
      background: #f8f8f8;
      padding: 12px 16px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-name {
      font-size: 14px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 4px;
    }
    
    .role-title {
      font-size: 12px;
      font-weight: 500;
      color: #666666;
    }
    
    .experience-dates {
      font-size: 11px;
      font-weight: 500;
      color: #777777;
      background: #ffffff;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      white-space: nowrap;
    }
    
    .experience-content {
      padding: 16px;
    }
    
    .experience-subsection {
      margin-bottom: 14px;
    }
    
    .subsection-title {
      font-size: 11px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .subsection-list {
      margin-left: 16px;
      margin-bottom: 12px;
    }
    
    .responsibility-item, .achievement-item {
      margin-bottom: 6px;
      font-size: 11px;
      line-height: 1.5;
      color: #444444;
    }
    
    .achievement-item {
      color: #333333;
      font-weight: 500;
    }
    
    .tech-tag {
      background: #f0f0f0;
      color: #555555;
      padding: 3px 6px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 500;
      border: 1px solid #ddd;
      white-space: nowrap;
    }
    
    /* ===== SIMPLIFIED EXPERIENCES SUMMARY STYLES ===== */
    .experience-summary-section {
      margin-bottom: 25px;
    }
    
    .summary-overview {
      margin-bottom: 16px;
    }
    
    .summary-experience-item {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    
    .summary-experience-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .summary-company {
      font-weight: 600;
      color: #333333;
      font-size: 12px;
    }
    
    .summary-role-dates {
      font-size: 10px;
      color: #777777;
      font-weight: 500;
      background: #ffffff;
      padding: 4px 6px;
      border-radius: 3px;
      border: 1px solid #ddd;
    }
    
    .summary-highlights {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    
    .summary-highlight {
      font-size: 10px;
      color: #555555;
      line-height: 1.4;
    }
    
    /* ===== SIMPLIFIED CERTIFICATION STYLES ===== */
    .certification-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .certification-badge {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 10px 12px;
      min-width: 180px;
      text-align: center;
    }
    
    .cert-name {
      font-weight: 600;
      color: #333333;
      font-size: 11px;
      margin-bottom: 4px;
    }
    
    .cert-provider {
      font-size: 10px;
      color: #666666;
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .cert-date {
      font-size: 9px;
      color: #777777;
    }
    
    /* ===== SIMPLIFIED LANGUAGE STYLES ===== */
    .language-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
    }
    
    .language-item {
      background: #f8f8f8;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 120px;
    }
    
    .language-name {
      font-weight: 600;
      color: #333333;
      font-size: 11px;
    }
    
    .language-level {
      font-size: 9px;
      font-weight: 500;
      padding: 2px 6px;
      border-radius: 3px;
      color: white;
      background: #666666;
    }
    
    /* ===== SIMPLIFIED EDUCATION STYLES ===== */
    .education-section {
      margin-bottom: 20px;
    }
    
    .education-item {
      background: #f8f8f8;
      border-left: 3px solid #333333;
      padding: 10px 14px;
      margin-bottom: 8px;
      border-radius: 0 4px 4px 0;
    }
    
    .education-item p {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      color: #444444;
    }
    
    /* ===== SIMPLIFIED STATIC CONTENT STYLES ===== */
    .static-section {
      margin-bottom: 20px;
    }
    
    .static-category {
      margin-bottom: 14px;
    }
    
    .static-category-title {
      font-size: 12px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 8px;
    }
    
    .static-items {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .static-item {
      background: #f5f5f5;
      color: #444444;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 500;
      border: 1px solid #e0e0e0;
    }
    
    /* ===== GENERAL CONTENT STYLES ===== */
    .general-content {
      margin-bottom: 20px;
    }
    
    .general-content p {
      margin-bottom: 10px;
      font-size: 11px;
      line-height: 1.5;
      color: #444444;
    }
    
    .general-content ul {
      margin-left: 16px;
      margin-bottom: 12px;
    }
    
    .general-content li {
      margin-bottom: 4px;
      font-size: 11px;
      line-height: 1.4;
      color: #444444;
    }
    
    /* ===== PRINT OPTIMIZATION ===== */
    @media print {
      .competence-document {
        padding: 15px;
        max-width: none;
      }
      
      .section-title {
        color: #333333 !important;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .experience-item,
      .skill-category,
      .certification-badge {
        page-break-inside: avoid;
      }
      
      .skill-tag,
      .tech-tag,
      .certification-badge,
      .language-item {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  `;

  // Template-specific styles - simplified
  if (template === 'antaes') {
    return baseStyles + `
      /* Antaes Template Specific Styles */
      .candidate-name {
        color: #8B0000;
      }
      
      .section-title {
        color: #8B0000;
        border-bottom-color: #8B0000;
      }
      
      .company-name {
        color: #8B0000;
      }
      
      .document-header {
        border-bottom-color: #8B0000;
      }
    `;
  } else {
    return baseStyles + `
      /* Professional Classic Template Specific Styles */
      .candidate-name {
        color: #333333;
      }
      
      .section-title {
        color: #333333;
        border-bottom-color: #e0e0e0;
      }
      
      .document-header {
        border-bottom-color: #333333;
      }
    `;
  }
}

// Helper function to convert segments to sections format
function convertSegmentsToSections(segments: SegmentContent[], candidateData: any): any[] {
  return segments.map((segment, index) => ({
    key: segment.type,
    label: segment.title,
    show: true,
    order: segment.order || index + 1,
    content: segment.content
  }));
}

// NEW: Enhanced Antaes HTML generator using processed segments
function generateAntaesHTMLFromSegments(segments: SegmentContent[], candidateData: any, jobDescription?: any, managerContact?: any): string {
  console.log('🎨 Generating Antaes HTML with processed segments');
  
  // Group segments by type for easy access
  const segmentMap = new Map<string, SegmentContent>();
  segments.forEach(segment => {
    segmentMap.set(segment.type.toLowerCase(), segment);
  });

  // Extract header data
  const headerData = {
    fullName: candidateData.fullName || 'Professional',
    currentTitle: candidateData.currentTitle || 'Consultant',
    yearsOfExperience: candidateData.yearsOfExperience || 'Multiple',
    location: candidateData.location || '',
    email: candidateData.email || '',
    phone: candidateData.phone || ''
  };

  // Generate sections HTML using processed content
  const sectionsHTML = segments
    .sort((a, b) => a.order - b.order)
    .map(segment => {
      const sectionClass = `section-${segment.type.toLowerCase().replace(/\s+/g, '-')}`;
      
      return `
        <div class="section ${sectionClass}" id="${segment.type.toLowerCase()}">
          <h2 class="section-title">${segment.title.toUpperCase()}</h2>
          <div class="section-content">
            ${segment.content}
          </div>
        </div>
      `;
    })
    .join('');

  // Complete Antaes template with processed content
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${headerData.fullName} - Competence File</title>
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
        
        /* Header Styling - Logo on right, content on left */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #073C51;
        }
        
        .header-content {
          flex: 1;
          text-align: left;
        }
        
        .header-logo {
          flex-shrink: 0;
          margin-left: 20px;
        }
        
        .logo-image {
          height: 70px;
          width: auto;
          max-width: 250px;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          color: #073C51;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        
        .header-role {
          font-size: 16px;
          font-weight: 600;
          color: #FFB800;
          margin-bottom: 4px;
        }
        
        .header-experience {
          font-size: 14px;
          font-weight: 500;
          color: #444B54;
          margin-bottom: 12px;
        }
        
        .location-info {
          font-size: 14px;
          color: #444B54;
          margin-bottom: 12px;
          font-weight: 500;
        }
        
        .manager-contact {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e9ecef;
        }
        
        .manager-label {
          font-size: 12px;
          font-weight: 600;
          color: #073C51;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .contact-item {
          color: #444B54;
          font-size: 13px;
          margin-bottom: 3px;
        }
        
        .contact-label {
          font-weight: 700;
          color: #232629;
        }
        
        /* Content Area */
        .content {
          margin-bottom: 60px;
        }
        
        /* Section Styling */
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #073C51;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #073C51;
        }
        
        .section-content {
          font-size: 14px;
          line-height: 1.7;
        }
        
        /* Enhanced Content Formatting for Processed Content */
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
          color: #444B54;
        }
        
        .section-content h3 {
          font-size: 16px;
          font-weight: 700;
          color: #073C51;
          margin: 15px 0 8px 0;
        }
        
        .section-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #FFB800;
          margin: 12px 0 6px 0;
        }
        
        .section-content h5 {
          font-size: 13px;
          font-weight: 600;
          color: #073C51;
          margin: 10px 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Skills sections styling */
        .section-skills .section-content,
        .section-technical-skills .section-content,
        .section-functional-skills .section-content {
          display: grid;
          gap: 15px;
        }
        
        /* Experience sections enhanced styling */
        .section-experience .section-content,
        .section-professional-experience .section-content,
        .section-professional-experience-1 .section-content,
        .section-professional-experience-2 .section-content,
        .section-professional-experience-3 .section-content {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #073C51;
        }
        
        /* Education and certifications styling */
        .section-education .section-content,
        .section-certifications .section-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #FFB800;
        }
        
        /* Languages and static content styling */
        .section-languages .section-content,
        .section-static .section-content {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .section-languages .section-content span,
        .section-static .section-content span {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: #f8f9fa;
          border-radius: 20px;
          font-weight: 500;
          color: #073C51;
          font-size: 12px;
          border: 1px solid #e9ecef;
        }
        
        /* Page counter for PDF generation */
        @page {
          margin: 20mm;
          @bottom-left {
            content: counter(page);
            font-family: 'Inter', sans-serif;
            font-size: 12px;
            font-weight: 600;
            color: #073C51;
          }
          @bottom-center {
            content: "Partnership for Excellence";
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            color: #444B54;
          }
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
          .logo-image {
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: transparent !important;
          }
          .header-logo {
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- HEADER - Content on left, logo on right -->
        <div class="header">
          <div class="header-content">
            <h1>${headerData.fullName}</h1>
            <div class="header-role">${headerData.currentTitle}</div>
            <div class="header-experience">${headerData.yearsOfExperience} years of experience</div>
            ${headerData.location ? `<div class="location-info">${headerData.location}</div>` : ''}
            ${managerContact && (managerContact.name || managerContact.email || managerContact.phone) ? `
              <div class="manager-contact">
                <div class="manager-label">For inquiries, contact:</div>
                ${managerContact.name ? `<div class="contact-item"><span class="contact-label">Manager:</span> ${managerContact.name}</div>` : ''}
                ${managerContact.email ? `<div class="contact-item"><span class="contact-label">Email:</span> ${managerContact.email}</div>` : ''}
                ${managerContact.phone ? `<div class="contact-item"><span class="contact-label">Phone:</span> ${managerContact.phone}</div>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="header-logo">
            <img src="https://res.cloudinary.com/emineon/image/upload/w_200,h_100,c_fit,q_100,f_png/Antaes_logo" 
                 alt="ANTAES" 
                 class="logo-image" 
                 style="width: 150px; height: 80px; object-fit: contain; display: block !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; opacity: 1 !important; visibility: visible !important; background: transparent !important;" 
                 onload="this.style.opacity='1';" 
                 onerror="console.error('Antaes logo failed to load:', this.src);" />
          </div>
        </div>
        
        <div class="content">
          ${sectionsHTML}
        </div>
      </div>
    </body>
    </html>
  `;
}

// ✨ PROFESSIONAL EXPERIENCES SUMMARY FORMATTING
async function formatExperienceSummaryContent(content: string, template: string): Promise<string> {
  console.log('🔧 Formatting professional experiences summary...');
  
  try {
    const lines = content.split('\n').filter(line => line.trim());
    let formattedHtml = '<div class="experience-summary-section">';
    
    // Check if content has multiple experiences or is a general summary
    const hasMultipleExperiences = lines.some(line => 
      line.includes(' - ') && line.match(/\d{4}/)
    );
    
    if (hasMultipleExperiences) {
      // Format as condensed experience list
      let currentExperience = '';
      let currentDetails: string[] = [];
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes(' - ') && trimmedLine.match(/\d{4}/)) {
          // Save previous experience
          if (currentExperience) {
            formattedHtml += formatSummaryExperienceItem(currentExperience, currentDetails);
            currentDetails = [];
          }
          
          // Parse new experience
          const cleanLine = trimmedLine.replace(/\*\*/g, '').trim();
          const parts = cleanLine.split(' - ');
          const company = parts[0].trim();
          const roleAndDates = parts.slice(1).join(' - ').trim();
          
          currentExperience = `${company} - ${roleAndDates}`;
        } else if (trimmedLine.length > 0) {
          // Add detail line
          const detail = trimmedLine
            .replace(/^[•▸\-\*]\s*/, '')
            .replace(/\*\*/g, '')
            .trim();
          if (detail.length > 3) {
            currentDetails.push(detail);
          }
        }
      }
      
      // Add final experience
      if (currentExperience) {
        formattedHtml += formatSummaryExperienceItem(currentExperience, currentDetails);
      }
    } else {
      // Format as general summary paragraphs
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim());
      
      if (paragraphs.length > 0) {
        formattedHtml += '<div class="summary-overview">';
        paragraphs.forEach((paragraph, index) => {
          const cleanParagraph = convertMarkdownToHTML(paragraph.trim());
          const summaryClass = index === 0 ? 'summary-opening' : '';
          formattedHtml += `<p class="summary-paragraph ${summaryClass}">${cleanParagraph}</p>`;
        });
        formattedHtml += '</div>';
      } else {
        // Single paragraph
        const cleanContent = convertMarkdownToHTML(content);
        formattedHtml += `<div class="summary-overview">
          <p class="summary-paragraph summary-opening">${cleanContent}</p>
        </div>`;
      }
    }
    
    formattedHtml += '</div>';
    console.log('✅ Professional experiences summary formatted successfully');
    return formattedHtml;
    
  } catch (error) {
    console.error('❌ Error formatting experience summary:', error);
    const basicHtml = convertMarkdownToHTML(content);
    return `<div class="experience-summary-section">${basicHtml}</div>`;
  }
}

// Helper function to format condensed experience items for summary
function formatSummaryExperienceItem(experienceHeader: string, details: string[]): string {
  const [company, roleAndDates] = experienceHeader.split(' - ');
  
  let summaryHtml = `<div class="summary-experience-item">
    <div class="summary-experience-header">
      <span class="summary-company">${company}</span>
      <span class="summary-role-dates">${roleAndDates}</span>
    </div>`;
  
  if (details.length > 0) {
    // Show only key highlights (max 3 items)
    const highlights = details.slice(0, 3);
    summaryHtml += `<div class="summary-highlights">
      ${highlights.map(detail => `<span class="summary-highlight">• ${detail}</span>`).join('')}
    </div>`;
  }
  
  summaryHtml += '</div>';
  return summaryHtml;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🎯 PDF Generation Request received');
    
    const body = await request.json();
    const { candidateData, segments, jobDescription, managerContact, template = 'professional-classic', client, jobTitle } = body;

    if (!candidateData || !segments) {
      return NextResponse.json(
        { success: false, message: 'Missing required data: candidateData and segments are required' },
        { status: 400 }
      );
    }

    console.log(`📋 Processing ${segments.length} segments with template: ${template}`);
    console.log(`👤 Candidate: ${candidateData.fullName}`);
    console.log(`💼 Position: ${jobTitle || 'N/A'} at ${client || 'N/A'}`);

    // STEP 1-5: Enhanced 5-Step Pipeline Processing for ALL templates
    const processedSegments = await formatContentForPDF(segments, candidateData, template, jobDescription);
    
    // Generate HTML content based on template type
    let htmlContent: string;
    
    if (template === 'antaes' || template === 'cf-antaes-consulting') {
      console.log('🎨 Using Antaes template with 5-step pipeline processing');
      
      // Use the new enhanced Antaes generator with processed content
      htmlContent = generateAntaesHTMLFromSegments(
        processedSegments, 
        candidateData, 
        jobDescription, 
        managerContact
      );
    } else {
      console.log('🎨 Using Professional Classic template with 5-step pipeline processing');
      htmlContent = generateHTMLFromSegments(processedSegments, candidateData, template);
    }

    // Generate unique filename with timestamp and candidate info
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const sanitizedName = candidateData.fullName.replace(/[^a-zA-Z0-9]/g, '_');
    const templateName = template === 'professional-classic' ? 'Professional_Classic' : 
                        template === 'antaes' || template === 'cf-antaes-consulting' ? 'Antaes' :
                        template.charAt(0).toUpperCase() + template.slice(1);
    const fileName = `${sanitizedName}_${client || 'Client'}_${templateName}_Competence_File_${timestamp}.pdf`;

    // Generate PDF with Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set content and wait for images/fonts to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      },
      preferCSSPageSize: true
    });

    await browser.close();

    // Upload to Vercel Blob with unique filename (allow overwrite)
    const { url } = await put(fileName, pdfBuffer, {
      access: 'public',
      addRandomSuffix: false, // Use our custom filename
      allowOverwrite: true, // Allow overwriting existing files
    });

    const endTime = Date.now();
    const processingTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;

    // Save metadata to database using Prisma
    try {
      // Check if candidate exists before creating competence file
      const candidateExists = await prisma.candidate.findUnique({
        where: { id: candidateData.id }
      });

      if (candidateExists) {
        await prisma.competenceFile.create({
          data: {
            fileName: fileName,
            candidateId: candidateData.id,
            filePath: fileName,
            downloadUrl: url,
            format: 'pdf',
            status: CompetenceFileStatus.READY,
            version: 1,
            metadata: {
              client: client || 'Client',
              jobTitle: jobTitle || 'Position',
              template,
              templateName,
              segmentsCount: segments.length,
              processingMethod: '5-step-pipeline',
              processingTime,
              generationTimestamp: new Date().toISOString()
            },
            sectionsConfig: JSON.parse(JSON.stringify(segments)),
            generatedBy: 'system', // Since we removed auth
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        console.log('✅ Metadata saved to database');
      } else {
        console.log('⚠️ Candidate not found in database, skipping metadata save');
        console.log('📎 PDF generated successfully but not linked to candidate record');
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
      console.log('⚠️ Continuing with PDF generation despite database error');
    }

    console.log(`✅ PDF generated successfully in ${processingTime}`);
    console.log(`📎 File URL: ${url}`);
    console.log(`📊 Segments processed: ${segments.length}`);
    console.log(`🎨 Template: ${template}`);

    return NextResponse.json({
      success: true,
      fileUrl: url,
      fileName,
      templateName: templateName,
      processingMethod: '5-step-pipeline',
      processingTime,
      segmentsProcessed: segments.length,
      candidateName: candidateData.fullName,
      jobTitle: jobTitle || 'Position',
      clientName: client || 'Client',
      generationTimestamp: new Date().toISOString(),
    });

  } catch (error) {
    const endTime = Date.now();
    const processingTime = `${((endTime - startTime) / 1000).toFixed(2)}s`;
    
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate PDF from editor content', 
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      },
      { status: 500 }
    );
  }
} 