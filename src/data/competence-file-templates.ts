import { StyleConfig, stylePresets } from './job-templates';

export interface CompetenceFileTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  colors?: string[];
  features?: string[];
  styleConfig: StyleConfig;
  sections: {
    key: string;
    label: string;
    show: boolean;
    order: number;
  }[];
  previewImage?: string;
}

export const competenceFileTemplates: CompetenceFileTemplate[] = [
  {
    id: 'cf-modern-tech',
    name: 'Modern Tech Profile',
    description: 'Clean, modern design perfect for technology professionals',
    category: 'Technology',
    industry: 'Software Development',
    colors: ['#3B82F6', '#6366F1', '#10B981', '#F59E0B'],
    features: ['Skills Matrix', 'Project Highlights', 'Tech Stack', 'Certifications'],
    styleConfig: stylePresets.modern,
    sections: [
      { key: 'header', label: 'Header & Contact', show: true, order: 1 },
      { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
      { key: 'experience', label: 'Work Experience', show: true, order: 3 },
      { key: 'skills', label: 'Technical Skills', show: true, order: 4 },
      { key: 'education', label: 'Education', show: true, order: 5 },
      { key: 'certifications', label: 'Certifications', show: true, order: 6 },
      { key: 'projects', label: 'Key Projects', show: true, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  },
  {
    id: 'cf-executive-classic',
    name: 'Executive Classic',
    description: 'Professional and sophisticated for senior-level candidates',
    category: 'Executive',
    industry: 'Finance',
    colors: ['#1E40AF', '#1E3A8A', '#059669', '#DC2626'],
    features: ['Leadership Summary', 'Achievement Metrics', 'Board Experience', 'Strategic Vision'],
    styleConfig: stylePresets.classic,
    sections: [
      { key: 'header', label: 'Executive Profile', show: true, order: 1 },
      { key: 'summary', label: 'Executive Summary', show: true, order: 2 },
      { key: 'achievements', label: 'Key Achievements', show: true, order: 3 },
      { key: 'experience', label: 'Leadership Experience', show: true, order: 4 },
      { key: 'skills', label: 'Core Competencies', show: true, order: 5 },
      { key: 'education', label: 'Education & Qualifications', show: true, order: 6 },
      { key: 'board', label: 'Board & Advisory Roles', show: false, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  },
  {
    id: 'cf-creative-minimal',
    name: 'Creative Minimal',
    description: 'Minimalist design for creative and design professionals',
    category: 'Creative',
    industry: 'Design',
    colors: ['#374151', '#6B7280', '#9CA3AF', '#F59E0B'],
    features: ['Portfolio Links', 'Design Skills', 'Creative Process', 'Awards'],
    styleConfig: stylePresets.minimal,
    sections: [
      { key: 'header', label: 'Creative Profile', show: true, order: 1 },
      { key: 'summary', label: 'Creative Vision', show: true, order: 2 },
      { key: 'portfolio', label: 'Portfolio Highlights', show: true, order: 3 },
      { key: 'experience', label: 'Creative Experience', show: true, order: 4 },
      { key: 'skills', label: 'Design Skills & Tools', show: true, order: 5 },
      { key: 'awards', label: 'Awards & Recognition', show: false, order: 6 },
      { key: 'education', label: 'Education & Training', show: true, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  },
  {
    id: 'cf-consulting-professional',
    name: 'Consulting Professional',
    description: 'Structured format ideal for consulting and advisory roles',
    category: 'Consulting',
    industry: 'Professional Services',
    colors: ['#059669', '#10B981', '#34D399', '#3B82F6'],
    features: ['Case Studies', 'Client Impact', 'Methodology', 'Industry Expertise'],
    styleConfig: stylePresets.creative,
    sections: [
      { key: 'header', label: 'Professional Profile', show: true, order: 1 },
      { key: 'summary', label: 'Consulting Expertise', show: true, order: 2 },
      { key: 'experience', label: 'Consulting Experience', show: true, order: 3 },
      { key: 'casestudies', label: 'Case Studies', show: true, order: 4 },
      { key: 'skills', label: 'Core Competencies', show: true, order: 5 },
      { key: 'methodologies', label: 'Methodologies & Frameworks', show: true, order: 6 },
      { key: 'education', label: 'Education & Certifications', show: true, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  },
  {
    id: 'cf-banking-finance',
    name: 'Banking & Finance',
    description: 'Conservative and trustworthy design for financial sector',
    category: 'Finance',
    industry: 'Banking',
    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#059669'],
    features: ['Risk Management', 'Regulatory Knowledge', 'Financial Modeling', 'Compliance'],
    styleConfig: {
      ...stylePresets.classic,
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      accentColor: '#059669'
    },
    sections: [
      { key: 'header', label: 'Financial Professional', show: true, order: 1 },
      { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
      { key: 'experience', label: 'Financial Experience', show: true, order: 3 },
      { key: 'skills', label: 'Financial Skills', show: true, order: 4 },
      { key: 'certifications', label: 'Certifications & Licenses', show: true, order: 5 },
      { key: 'compliance', label: 'Regulatory Knowledge', show: true, order: 6 },
      { key: 'education', label: 'Education', show: true, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  },
  {
    id: 'cf-healthcare-medical',
    name: 'Healthcare & Medical',
    description: 'Clean and professional for healthcare professionals',
    category: 'Healthcare',
    industry: 'Medical',
    colors: ['#DC2626', '#EF4444', '#F87171', '#10B981'],
    features: ['Medical Specialties', 'Certifications', 'Patient Care', 'Research'],
    styleConfig: {
      ...stylePresets.modern,
      primaryColor: '#DC2626',
      secondaryColor: '#EF4444',
      accentColor: '#10B981'
    },
    sections: [
      { key: 'header', label: 'Medical Professional', show: true, order: 1 },
      { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
      { key: 'experience', label: 'Clinical Experience', show: true, order: 3 },
      { key: 'specialties', label: 'Medical Specialties', show: true, order: 4 },
      { key: 'certifications', label: 'Medical Certifications', show: true, order: 5 },
      { key: 'research', label: 'Research & Publications', show: false, order: 6 },
      { key: 'education', label: 'Medical Education', show: true, order: 7 },
      { key: 'languages', label: 'Languages', show: true, order: 8 },
    ]
  }
];

export default competenceFileTemplates; 