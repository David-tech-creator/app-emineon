export interface Template {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  colorHex: string;
  font: string;
  footerText?: string;
  sections: Array<{
    key: string;
    label: string;
    show: boolean;
    order: number;
  }>;
  previewImage?: string;
  client?: string;
  category: string;
}

export const predefinedTemplates: Template[] = [
  {
    id: 'ubs-tech',
    name: 'UBS Technology Template',
    description: 'Professional corporate template optimized for UBS technology roles with emphasis on technical competencies',
    client: 'UBS Investment Bank',
    category: 'Banking & Finance',
    colorHex: '#E60012', // UBS Red
    font: 'Helvetica',
    footerText: 'Confidential - UBS Internal Use',
    previewImage: '/templates/ubs-preview.png',
    sections: [
      { key: 'header', label: 'Candidate Information', show: true, order: 1 },
      { key: 'summary', label: 'Executive Summary', show: true, order: 2 },
      { key: 'skills', label: 'Technical Competencies', show: true, order: 3 },
      { key: 'experience', label: 'Professional Experience', show: true, order: 4 },
      { key: 'certifications', label: 'Certifications & Qualifications', show: true, order: 5 },
      { key: 'education', label: 'Education', show: true, order: 6 },
      { key: 'languages', label: 'Language Proficiency', show: false, order: 7 },
    ]
  },
  {
    id: 'credit-suisse',
    name: 'Credit Suisse Executive',
    description: 'Formal banking template with traditional layout for Credit Suisse senior positions and client-facing roles',
    client: 'Credit Suisse',
    category: 'Banking & Finance',
    colorHex: '#005A9B', // Credit Suisse Blue
    font: 'Times New Roman',
    footerText: 'Credit Suisse - Excellence in Banking',
    previewImage: '/templates/cs-preview.png',
    sections: [
      { key: 'header', label: 'Contact Information', show: true, order: 1 },
      { key: 'summary', label: 'Professional Profile', show: true, order: 2 },
      { key: 'experience', label: 'Career Highlights', show: true, order: 3 },
      { key: 'skills', label: 'Core Competencies', show: true, order: 4 },
      { key: 'education', label: 'Academic Background', show: true, order: 5 },
      { key: 'certifications', label: 'Professional Certifications', show: true, order: 6 },
      { key: 'languages', label: 'Languages', show: true, order: 7 },
    ]
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech Consulting',
    description: 'Contemporary design for technology consulting roles with clean layout and modern typography',
    client: 'General Technology',
    category: 'Technology & Consulting',
    colorHex: '#6366F1', // Indigo
    font: 'Inter',
    footerText: 'Powered by Emineon Consulting',
    previewImage: '/templates/modern-preview.png',
    sections: [
      { key: 'header', label: 'About', show: true, order: 1 },
      { key: 'summary', label: 'Summary', show: true, order: 2 },
      { key: 'skills', label: 'Technical Stack', show: true, order: 3 },
      { key: 'experience', label: 'Experience', show: true, order: 4 },
      { key: 'certifications', label: 'Certifications', show: true, order: 5 },
      { key: 'education', label: 'Education', show: true, order: 6 },
      { key: 'languages', label: 'Languages', show: false, order: 7 },
    ]
  },
  {
    id: 'goldman-sachs',
    name: 'Goldman Sachs Premium',
    description: 'Elite investment banking template with sophisticated design for Goldman Sachs positions',
    client: 'Goldman Sachs',
    category: 'Investment Banking',
    colorHex: '#1B365D', // Goldman Sachs Blue
    font: 'Helvetica',
    footerText: 'Goldman Sachs - Leading Global Investment Banking',
    previewImage: '/templates/gs-preview.png',
    sections: [
      { key: 'header', label: 'Executive Profile', show: true, order: 1 },
      { key: 'summary', label: 'Investment Banking Summary', show: true, order: 2 },
      { key: 'experience', label: 'Transaction Experience', show: true, order: 3 },
      { key: 'skills', label: 'Financial Competencies', show: true, order: 4 },
      { key: 'education', label: 'Academic Excellence', show: true, order: 5 },
      { key: 'certifications', label: 'Professional Qualifications', show: true, order: 6 },
      { key: 'languages', label: 'Global Communication', show: true, order: 7 },
    ]
  },
  {
    id: 'mckinsey-consulting',
    name: 'McKinsey & Company',
    description: 'Strategic consulting template with analytical focus for McKinsey consulting roles',
    client: 'McKinsey & Company',
    category: 'Management Consulting',
    colorHex: '#003366', // McKinsey Navy
    font: 'Times New Roman',
    footerText: 'McKinsey & Company - Serving Leading Organizations',
    previewImage: '/templates/mckinsey-preview.png',
    sections: [
      { key: 'header', label: 'Consultant Profile', show: true, order: 1 },
      { key: 'summary', label: 'Strategic Overview', show: true, order: 2 },
      { key: 'experience', label: 'Consulting Experience', show: true, order: 3 },
      { key: 'skills', label: 'Analytical Capabilities', show: true, order: 4 },
      { key: 'education', label: 'Educational Foundation', show: true, order: 5 },
      { key: 'certifications', label: 'Professional Development', show: true, order: 6 },
      { key: 'languages', label: 'Global Reach', show: true, order: 7 },
    ]
  },
  {
    id: 'deloitte-digital',
    name: 'Deloitte Digital',
    description: 'Digital transformation template for Deloitte technology and digital consulting roles',
    client: 'Deloitte',
    category: 'Digital Consulting',
    colorHex: '#86BC25', // Deloitte Green
    font: 'Inter',
    footerText: 'Deloitte - Making an Impact that Matters',
    previewImage: '/templates/deloitte-preview.png',
    sections: [
      { key: 'header', label: 'Digital Profile', show: true, order: 1 },
      { key: 'summary', label: 'Digital Transformation Summary', show: true, order: 2 },
      { key: 'skills', label: 'Digital Capabilities', show: true, order: 3 },
      { key: 'experience', label: 'Project Portfolio', show: true, order: 4 },
      { key: 'certifications', label: 'Digital Certifications', show: true, order: 5 },
      { key: 'education', label: 'Academic Background', show: true, order: 6 },
      { key: 'languages', label: 'Communication Skills', show: false, order: 7 },
    ]
  },
  {
    id: 'pwc-advisory',
    name: 'PwC Advisory',
    description: 'Professional services template for PwC advisory and consulting positions',
    client: 'PricewaterhouseCoopers',
    category: 'Professional Services',
    colorHex: '#FF6600', // PwC Orange
    font: 'Roboto',
    footerText: 'PwC - Building Trust in Society',
    previewImage: '/templates/pwc-preview.png',
    sections: [
      { key: 'header', label: 'Advisory Profile', show: true, order: 1 },
      { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
      { key: 'experience', label: 'Advisory Experience', show: true, order: 3 },
      { key: 'skills', label: 'Service Capabilities', show: true, order: 4 },
      { key: 'education', label: 'Professional Education', show: true, order: 5 },
      { key: 'certifications', label: 'Industry Certifications', show: true, order: 6 },
      { key: 'languages', label: 'Global Capabilities', show: true, order: 7 },
    ]
  },
  {
    id: 'startup-tech',
    name: 'Startup Technology',
    description: 'Dynamic template for startup and scale-up technology roles with modern design',
    client: 'Tech Startups',
    category: 'Startup & Scale-up',
    colorHex: '#8B5CF6', // Purple
    font: 'Inter',
    footerText: 'Innovation • Growth • Impact',
    previewImage: '/templates/startup-preview.png',
    sections: [
      { key: 'header', label: 'Tech Profile', show: true, order: 1 },
      { key: 'summary', label: 'Innovation Summary', show: true, order: 2 },
      { key: 'skills', label: 'Tech Stack & Skills', show: true, order: 3 },
      { key: 'experience', label: 'Startup Experience', show: true, order: 4 },
      { key: 'certifications', label: 'Tech Certifications', show: true, order: 5 },
      { key: 'education', label: 'Learning Journey', show: true, order: 6 },
      { key: 'languages', label: 'Communication', show: false, order: 7 },
    ]
  },
  {
    id: 'healthcare-pharma',
    name: 'Healthcare & Pharma',
    description: 'Specialized template for healthcare, pharmaceutical, and life sciences professionals',
    client: 'Healthcare Industry',
    category: 'Healthcare & Life Sciences',
    colorHex: '#059669', // Medical Green
    font: 'Open Sans',
    footerText: 'Advancing Healthcare Excellence',
    previewImage: '/templates/healthcare-preview.png',
    sections: [
      { key: 'header', label: 'Healthcare Profile', show: true, order: 1 },
      { key: 'summary', label: 'Clinical Summary', show: true, order: 2 },
      { key: 'experience', label: 'Healthcare Experience', show: true, order: 3 },
      { key: 'skills', label: 'Clinical Competencies', show: true, order: 4 },
      { key: 'certifications', label: 'Medical Certifications', show: true, order: 5 },
      { key: 'education', label: 'Medical Education', show: true, order: 6 },
      { key: 'languages', label: 'Patient Communication', show: true, order: 7 },
    ]
  }
];

// Font options for customization
export const fontOptions = [
  { value: 'Inter', label: 'Inter (Modern Sans-serif)' },
  { value: 'Helvetica', label: 'Helvetica (Corporate)' },
  { value: 'Times New Roman', label: 'Times New Roman (Traditional)' },
  { value: 'Roboto', label: 'Roboto (Clean & Professional)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Lato', label: 'Lato (Elegant)' }
];

// Color preset options
export const colorPresets = [
  { value: '#1e40af', label: 'Professional Blue', color: '#1e40af' },
  { value: '#dc2626', label: 'Corporate Red', color: '#dc2626' },
  { value: '#059669', label: 'Success Green', color: '#059669' },
  { value: '#7c3aed', label: 'Modern Purple', color: '#7c3aed' },
  { value: '#ea580c', label: 'Energy Orange', color: '#ea580c' },
  { value: '#374151', label: 'Elegant Gray', color: '#374151' },
  { value: '#E60012', label: 'UBS Red', color: '#E60012' },
  { value: '#005A9B', label: 'CS Blue', color: '#005A9B' },
]; 