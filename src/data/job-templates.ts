export interface JobTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industry?: string;
  colorHex: string;
  font: string;
  previewImage?: string;
  sections: {
    key: string;
    label: string;
    show: boolean;
    order: number;
  }[];
  sampleContent: {
    title: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    benefits: string[];
  };
}

export const jobTemplates: JobTemplate[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern, dynamic template for technology startups and scale-ups',
    category: 'Technology',
    industry: 'Software & Technology',
    colorHex: '#6366F1',
    font: 'Inter',
    previewImage: '/templates/tech-startup-preview.png',
    sections: [
      { key: 'title', label: 'Job Title', show: true, order: 1 },
      { key: 'company', label: 'Company Information', show: true, order: 2 },
      { key: 'location', label: 'Location & Work Mode', show: true, order: 3 },
      { key: 'description', label: 'Role Overview', show: true, order: 4 },
      { key: 'responsibilities', label: 'Key Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Requirements', show: true, order: 6 },
      { key: 'skills', label: 'Technical Skills', show: true, order: 7 },
      { key: 'benefits', label: 'What We Offer', show: true, order: 8 },
      { key: 'salary', label: 'Compensation', show: false, order: 9 },
      { key: 'languages', label: 'Language Requirements', show: false, order: 10 },
    ],
    sampleContent: {
      title: 'Senior Software Engineer',
      description: 'Join our innovative team and help build the next generation of software solutions. We\'re looking for passionate engineers who thrive in a fast-paced, collaborative environment.',
      responsibilities: [
        'Design and develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Mentor junior developers',
        'Participate in architecture decisions',
        'Ensure code quality and best practices'
      ],
      requirements: [
        '5+ years of software development experience',
        'Proficiency in modern web technologies',
        'Experience with cloud platforms',
        'Strong problem-solving skills',
        'Excellent communication abilities'
      ],
      benefits: [
        'Competitive salary and equity',
        'Flexible working arrangements',
        'Professional development budget',
        'Health and wellness benefits',
        'Modern office environment'
      ]
    }
  },
  {
    id: 'corporate-finance',
    name: 'Corporate Finance',
    description: 'Professional template for banking and financial services positions',
    category: 'Finance',
    industry: 'Banking & Finance',
    colorHex: '#1E40AF',
    font: 'Helvetica',
    previewImage: '/templates/corporate-finance-preview.png',
    sections: [
      { key: 'title', label: 'Position Title', show: true, order: 1 },
      { key: 'company', label: 'Institution', show: true, order: 2 },
      { key: 'location', label: 'Location', show: true, order: 3 },
      { key: 'description', label: 'Position Summary', show: true, order: 4 },
      { key: 'responsibilities', label: 'Primary Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Qualifications', show: true, order: 6 },
      { key: 'skills', label: 'Required Skills', show: true, order: 7 },
      { key: 'benefits', label: 'Benefits Package', show: true, order: 8 },
      { key: 'salary', label: 'Compensation Range', show: true, order: 9 },
      { key: 'languages', label: 'Language Proficiency', show: true, order: 10 },
    ],
    sampleContent: {
      title: 'Investment Banking Analyst',
      description: 'We are seeking a highly motivated Investment Banking Analyst to join our team. This role offers exposure to complex financial transactions and the opportunity to work with leading corporations.',
      responsibilities: [
        'Conduct financial analysis and modeling',
        'Prepare pitch books and client presentations',
        'Support senior bankers in deal execution',
        'Perform industry and company research',
        'Assist in due diligence processes'
      ],
      requirements: [
        'Bachelor\'s degree in Finance, Economics, or related field',
        'Strong analytical and quantitative skills',
        'Proficiency in Excel and financial modeling',
        'Excellent written and verbal communication',
        'Ability to work under pressure and meet deadlines'
      ],
      benefits: [
        'Competitive base salary and bonus',
        'Comprehensive health insurance',
        'Professional development opportunities',
        'Retirement savings plan',
        'Prestigious career advancement path'
      ]
    }
  },
  {
    id: 'consulting-strategy',
    name: 'Strategy Consulting',
    description: 'Premium template for management consulting and strategy roles',
    category: 'Consulting',
    industry: 'Management Consulting',
    colorHex: '#059669',
    font: 'Times New Roman',
    previewImage: '/templates/consulting-strategy-preview.png',
    sections: [
      { key: 'title', label: 'Role Title', show: true, order: 1 },
      { key: 'company', label: 'Firm Information', show: true, order: 2 },
      { key: 'location', label: 'Office Location', show: true, order: 3 },
      { key: 'description', label: 'Role Description', show: true, order: 4 },
      { key: 'responsibilities', label: 'Key Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Requirements', show: true, order: 6 },
      { key: 'skills', label: 'Core Competencies', show: true, order: 7 },
      { key: 'benefits', label: 'Career Benefits', show: true, order: 8 },
      { key: 'salary', label: 'Compensation', show: false, order: 9 },
      { key: 'languages', label: 'Language Skills', show: true, order: 10 },
    ],
    sampleContent: {
      title: 'Senior Consultant',
      description: 'Join our world-class consulting team to solve complex business challenges for Fortune 500 clients. This role offers exceptional growth opportunities and exposure to diverse industries.',
      responsibilities: [
        'Lead client engagements and project workstreams',
        'Develop strategic recommendations and solutions',
        'Conduct market research and competitive analysis',
        'Present findings to C-level executives',
        'Mentor junior consultants and analysts'
      ],
      requirements: [
        'MBA from top-tier business school',
        '3+ years of consulting or relevant experience',
        'Strong analytical and problem-solving skills',
        'Excellent presentation and communication abilities',
        'Willingness to travel extensively'
      ],
      benefits: [
        'Highly competitive compensation',
        'Accelerated career progression',
        'Global mobility opportunities',
        'Comprehensive training programs',
        'World-class client exposure'
      ]
    }
  },
  {
    id: 'healthcare-medical',
    name: 'Healthcare & Medical',
    description: 'Specialized template for healthcare and medical professionals',
    category: 'Healthcare',
    industry: 'Healthcare & Life Sciences',
    colorHex: '#DC2626',
    font: 'Open Sans',
    previewImage: '/templates/healthcare-medical-preview.png',
    sections: [
      { key: 'title', label: 'Position', show: true, order: 1 },
      { key: 'company', label: 'Healthcare Institution', show: true, order: 2 },
      { key: 'location', label: 'Location', show: true, order: 3 },
      { key: 'description', label: 'Position Overview', show: true, order: 4 },
      { key: 'responsibilities', label: 'Clinical Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Qualifications & Licensing', show: true, order: 6 },
      { key: 'skills', label: 'Clinical Skills', show: true, order: 7 },
      { key: 'benefits', label: 'Benefits & Support', show: true, order: 8 },
      { key: 'salary', label: 'Compensation Package', show: true, order: 9 },
      { key: 'languages', label: 'Language Requirements', show: false, order: 10 },
    ],
    sampleContent: {
      title: 'Senior Clinical Specialist',
      description: 'We are seeking a dedicated healthcare professional to join our clinical team. This role offers the opportunity to make a meaningful impact on patient care while advancing your career.',
      responsibilities: [
        'Provide direct patient care and clinical support',
        'Collaborate with multidisciplinary healthcare teams',
        'Maintain accurate patient records and documentation',
        'Participate in quality improvement initiatives',
        'Mentor junior clinical staff'
      ],
      requirements: [
        'Valid medical license and certifications',
        'Minimum 5 years of clinical experience',
        'Board certification in relevant specialty',
        'Strong clinical assessment skills',
        'Commitment to patient safety and quality care'
      ],
      benefits: [
        'Competitive salary and benefits',
        'Continuing education support',
        'Malpractice insurance coverage',
        'Flexible scheduling options',
        'Career advancement opportunities'
      ]
    }
  },
  {
    id: 'creative-design',
    name: 'Creative & Design',
    description: 'Modern template for creative, design, and marketing roles',
    category: 'Creative',
    industry: 'Design & Marketing',
    colorHex: '#7C3AED',
    font: 'Inter',
    previewImage: '/templates/creative-design-preview.png',
    sections: [
      { key: 'title', label: 'Creative Role', show: true, order: 1 },
      { key: 'company', label: 'Agency/Company', show: true, order: 2 },
      { key: 'location', label: 'Studio Location', show: true, order: 3 },
      { key: 'description', label: 'Creative Brief', show: true, order: 4 },
      { key: 'responsibilities', label: 'Creative Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Portfolio Requirements', show: true, order: 6 },
      { key: 'skills', label: 'Creative Skills', show: true, order: 7 },
      { key: 'benefits', label: 'Creative Perks', show: true, order: 8 },
      { key: 'salary', label: 'Compensation', show: false, order: 9 },
      { key: 'languages', label: 'Communication Skills', show: false, order: 10 },
    ],
    sampleContent: {
      title: 'Senior UX Designer',
      description: 'Join our creative team to design exceptional user experiences that delight customers and drive business results. We\'re looking for a passionate designer who thinks beyond pixels.',
      responsibilities: [
        'Design intuitive user interfaces and experiences',
        'Conduct user research and usability testing',
        'Create wireframes, prototypes, and design systems',
        'Collaborate with product and engineering teams',
        'Present design concepts to stakeholders'
      ],
      requirements: [
        'Bachelor\'s degree in Design or related field',
        '4+ years of UX/UI design experience',
        'Strong portfolio demonstrating design process',
        'Proficiency in design tools (Figma, Sketch, etc.)',
        'Understanding of user-centered design principles'
      ],
      benefits: [
        'Creative freedom and autonomy',
        'State-of-the-art design tools',
        'Flexible work arrangements',
        'Professional development budget',
        'Inspiring work environment'
      ]
    }
  },
  {
    id: 'sales-business',
    name: 'Sales & Business Development',
    description: 'Results-focused template for sales and business development roles',
    category: 'Sales',
    industry: 'Sales & Business Development',
    colorHex: '#EA580C',
    font: 'Roboto',
    previewImage: '/templates/sales-business-preview.png',
    sections: [
      { key: 'title', label: 'Sales Position', show: true, order: 1 },
      { key: 'company', label: 'Company', show: true, order: 2 },
      { key: 'location', label: 'Territory/Location', show: true, order: 3 },
      { key: 'description', label: 'Opportunity Overview', show: true, order: 4 },
      { key: 'responsibilities', label: 'Sales Responsibilities', show: true, order: 5 },
      { key: 'requirements', label: 'Sales Experience', show: true, order: 6 },
      { key: 'skills', label: 'Sales Skills', show: true, order: 7 },
      { key: 'benefits', label: 'Compensation & Benefits', show: true, order: 8 },
      { key: 'salary', label: 'Earning Potential', show: true, order: 9 },
      { key: 'languages', label: 'Language Skills', show: false, order: 10 },
    ],
    sampleContent: {
      title: 'Senior Sales Executive',
      description: 'Drive revenue growth and build lasting client relationships in this exciting sales opportunity. We offer unlimited earning potential and career advancement for top performers.',
      responsibilities: [
        'Generate new business and expand existing accounts',
        'Develop and execute strategic sales plans',
        'Build relationships with key decision makers',
        'Negotiate contracts and close deals',
        'Collaborate with internal teams to deliver solutions'
      ],
      requirements: [
        '5+ years of B2B sales experience',
        'Proven track record of exceeding quotas',
        'Strong negotiation and closing skills',
        'Experience with CRM systems',
        'Excellent communication and presentation abilities'
      ],
      benefits: [
        'Uncapped commission structure',
        'Base salary plus performance bonuses',
        'Comprehensive benefits package',
        'Sales training and development',
        'Career advancement opportunities'
      ]
    }
  }
];

export const jobTemplateCategories = [
  'Technology',
  'Finance',
  'Consulting',
  'Healthcare',
  'Creative',
  'Sales',
  'Operations',
  'Marketing',
  'Legal',
  'Education'
];

export const fontOptions = [
  { name: 'Inter', label: 'Inter (Modern)' },
  { name: 'Helvetica', label: 'Helvetica (Classic)' },
  { name: 'Times New Roman', label: 'Times New Roman (Traditional)' },
  { name: 'Open Sans', label: 'Open Sans (Friendly)' },
  { name: 'Roboto', label: 'Roboto (Clean)' },
  { name: 'Lato', label: 'Lato (Professional)' }
];

export const colorPresets = [
  { name: 'Primary Blue', hex: '#3B82F6' },
  { name: 'Corporate Navy', hex: '#1E40AF' },
  { name: 'Tech Purple', hex: '#6366F1' },
  { name: 'Finance Blue', hex: '#0EA5E9' },
  { name: 'Consulting Green', hex: '#059669' },
  { name: 'Healthcare Red', hex: '#DC2626' },
  { name: 'Creative Purple', hex: '#7C3AED' },
  { name: 'Sales Orange', hex: '#EA580C' },
  { name: 'Professional Gray', hex: '#6B7280' },
  { name: 'Success Green', hex: '#10B981' }
]; 