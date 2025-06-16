import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Swiss-themed mock candidates data
const swissCandidates = [
  {
    id: 1,
    name: 'Alexandra Weber',
    location: 'Zurich, Switzerland',
    experience: '8 years',
    currentRole: 'Senior Software Engineer',
    score: 'Very Strong',
    status: 'Active',
    avatar: 'AW',
    skills: ['TypeScript', 'React', 'Node.js', 'GraphQL', 'Docker', 'Kubernetes'],
    rating: 5,
    email: 'alexandra.weber@gmail.ch',
    phone: '+41 44 123 4567',
    company: 'Google Switzerland',
    summary: 'Experienced full-stack developer with expertise in modern web technologies. Led multiple teams in developing scalable applications for Swiss financial institutions. Passionate about clean code and agile methodologies.',
    education: 'ETH Zurich - M.Sc. Computer Science',
    languages: ['German (Native)', 'English (Fluent)', 'French (Conversational)'],
    availability: 'Available in 4 weeks',
    expectedSalary: 'CHF 140,000 - 160,000',
    linkedinUrl: 'https://linkedin.com/in/alexandra-weber-ch',
    portfolioUrl: 'https://alexandra-weber.dev',
    lastInteraction: '2 days ago',
    source: 'LinkedIn',
    workExperience: [
      {
        company: 'Google Switzerland',
        role: 'Senior Software Engineer',
        duration: '2022 - Present',
        description: 'Leading development of cloud-native applications using React and Node.js for Swiss enterprise clients.'
      },
      {
        company: 'Credit Suisse',
        role: 'Full Stack Developer',
        duration: '2019 - 2022',
        description: 'Developed trading platforms and financial analytics tools using modern web technologies.'
      }
    ],
    timeline: [
      {
        date: '2 days ago',
        action: 'Application submitted',
        type: 'application',
        details: 'Applied for Senior Frontend Developer position'
      },
      {
        date: '1 week ago',
        action: 'Initial phone screening',
        type: 'call',
        details: 'Preliminary discussion about role and expectations'
      }
    ]
  },
  {
    id: 2,
    name: 'Marco Rossi',
    location: 'Geneva, Switzerland',
    experience: '6 years',
    currentRole: 'UX/UI Designer',
    score: 'Strong',
    status: 'Interview Scheduled',
    avatar: 'MR',
    skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    rating: 4,
    email: 'marco.rossi@swissmail.ch',
    phone: '+41 22 987 6543',
    company: 'Nestlé',
    summary: 'Creative UX/UI designer with a passion for user-centered design. Experienced in designing for fintech and healthcare applications in the Swiss market.',
    education: 'University of Applied Sciences Geneva - B.A. Visual Communication',
    languages: ['Italian (Native)', 'French (Fluent)', 'English (Fluent)', 'German (Basic)'],
    availability: 'Available immediately',
    expectedSalary: 'CHF 95,000 - 115,000',
    linkedinUrl: 'https://linkedin.com/in/marco-rossi-design',
    portfolioUrl: 'https://marcorossi.design',
    lastInteraction: '3 hours ago',
    source: 'Referral',
    workExperience: [
      {
        company: 'Nestlé',
        role: 'Senior UX Designer',
        duration: '2021 - Present',
        description: 'Leading design for consumer-facing applications and internal tools.'
      },
      {
        company: 'Swiss International Air Lines',
        role: 'UI Designer',
        duration: '2019 - 2021',
        description: 'Designed mobile and web interfaces for customer booking and check-in systems.'
      }
    ],
    timeline: [
      {
        date: '3 hours ago',
        action: 'Interview confirmed',
        type: 'scheduling',
        details: 'Technical interview scheduled for tomorrow at 2 PM'
      },
      {
        date: '2 days ago',
        action: 'Portfolio review completed',
        type: 'stage_change',
        details: 'Design portfolio passed initial review'
      }
    ]
  },
  {
    id: 3,
    name: 'Sarah Mueller',
    location: 'Basel, Switzerland',
    experience: '10 years',
    currentRole: 'Product Manager',
    score: 'Very Strong',
    status: 'Under Review',
    avatar: 'SM',
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
    rating: 5,
    email: 'sarah.mueller@basel.ch',
    phone: '+41 61 456 7890',
    company: 'Roche',
    summary: 'Strategic product manager with extensive experience in pharmaceutical and biotech industries. Led successful product launches worth over CHF 50M in revenue.',
    education: 'University of Basel - MBA, ETH Zurich - B.Sc. Chemical Engineering',
    languages: ['German (Native)', 'English (Fluent)', 'French (Intermediate)'],
    availability: 'Available in 6 weeks',
    expectedSalary: 'CHF 150,000 - 180,000',
    linkedinUrl: 'https://linkedin.com/in/sarah-mueller-pm',
    lastInteraction: '1 day ago',
    source: 'Job Board',
    workExperience: [
      {
        company: 'Roche',
        role: 'Senior Product Manager',
        duration: '2020 - Present',
        description: 'Managing product portfolio for oncology diagnostics division.'
      },
      {
        company: 'Novartis',
        role: 'Product Manager',
        duration: '2017 - 2020',
        description: 'Led product development for digital health solutions.'
      }
    ],
    timeline: [
      {
        date: '1 day ago',
        action: 'Reference check initiated',
        type: 'stage_change',
        details: 'Contacting previous employers for reference verification'
      },
      {
        date: '1 week ago',
        action: 'Technical interview completed',
        type: 'interview',
        details: 'Positive feedback from product and engineering teams'
      }
    ]
  },
  {
    id: 4,
    name: 'Thomas Zimmermann',
    location: 'Bern, Switzerland',
    experience: '5 years',
    currentRole: 'DevOps Engineer',
    score: 'Strong',
    status: 'Long List',
    avatar: 'TZ',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Monitoring', 'Python'],
    rating: 4,
    email: 'thomas.zimmermann@bern.ch',
    phone: '+41 31 234 5678',
    company: 'SIX Group',
    summary: 'DevOps engineer specializing in cloud infrastructure and automation. Expert in building scalable and secure systems for financial services.',
    education: 'Bern University of Applied Sciences - B.Sc. Computer Science',
    languages: ['German (Native)', 'English (Fluent)'],
    availability: 'Available in 8 weeks',
    expectedSalary: 'CHF 110,000 - 130,000',
    linkedinUrl: 'https://linkedin.com/in/thomas-zimmermann-devops',
    lastInteraction: '5 days ago',
    source: 'Company Website',
    workExperience: [
      {
        company: 'SIX Group',
        role: 'DevOps Engineer',
        duration: '2021 - Present',
        description: 'Managing cloud infrastructure and deployment pipelines for trading systems.'
      },
      {
        company: 'PostFinance',
        role: 'System Administrator',
        duration: '2019 - 2021',
        description: 'Maintained and optimized banking infrastructure and security systems.'
      }
    ],
    timeline: [
      {
        date: '5 days ago',
        action: 'Application reviewed',
        type: 'stage_change',
        details: 'Moved to technical review phase'
      },
      {
        date: '1 week ago',
        action: 'Application submitted',
        type: 'application',
        details: 'Applied for Senior DevOps Engineer position'
      }
    ]
  },
  {
    id: 5,
    name: 'Elena Bianchi',
    location: 'Lugano, Switzerland',
    experience: '7 years',
    currentRole: 'Data Scientist',
    score: 'Strong',
    status: 'Active',
    avatar: 'EB',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics', 'R'],
    rating: 4,
    email: 'elena.bianchi@ticino.ch',
    phone: '+41 91 876 5432',
    company: 'ABB Switzerland',
    summary: 'Data scientist with expertise in machine learning and statistical analysis. Specialized in predictive modeling for industrial automation and energy systems.',
    education: 'USI Lugano - Ph.D. in Data Science, ETH Zurich - M.Sc. Mathematics',
    languages: ['Italian (Native)', 'English (Fluent)', 'German (Intermediate)', 'French (Basic)'],
    availability: 'Available in 3 weeks',
    expectedSalary: 'CHF 125,000 - 145,000',
    linkedinUrl: 'https://linkedin.com/in/elena-bianchi-datascience',
    portfolioUrl: 'https://github.com/elena-bianchi',
    lastInteraction: '6 hours ago',
    source: 'University Network',
    workExperience: [
      {
        company: 'ABB Switzerland',
        role: 'Senior Data Scientist',
        duration: '2021 - Present',
        description: 'Developing ML models for predictive maintenance and energy optimization.'
      },
      {
        company: 'CERN',
        role: 'Research Data Analyst',
        duration: '2018 - 2021',
        description: 'Analyzed particle physics data and developed statistical models.'
      }
    ],
    timeline: [
      {
        date: '6 hours ago',
        action: 'Follow-up email sent',
        type: 'email',
        details: 'Sent additional technical assessment questions'
      },
      {
        date: '3 days ago',
        action: 'Initial screening call',
        type: 'call',
        details: 'Discussed background and technical expertise'
      }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would fetch this from a database
    // For now, we return mock Swiss candidates data
    return NextResponse.json({
      candidates: swissCandidates,
      total: swissCandidates.length
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Authentication required to create candidates'
      }, { status: 401 });
    }

    console.log('✅ User authenticated for candidate creation:', userId);

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      currentTitle,
      currentLocation,
      summary,
      experienceYears,
      technicalSkills,
      softSkills,
      spokenLanguages,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      seniorityLevel,
      primaryIndustry,
      availability,
      expectedSalary,
      remotePreference,
      professionalHeadline,
      nationality,
      timezone,
      workPermitType,
      availableFrom,
      graduationYear,
      educationLevel,
      functionalDomain,
      preferredContractType,
      relocationWillingness,
      freelancer,
      programmingLanguages,
      frameworks,
      toolsAndPlatforms,
      methodologies,
      certifications,
      degrees,
      universities,
      notableProjects,
      workExperience,
      education,
      tags,
      notes,
      source
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json({
        error: 'Missing required fields',
        message: 'First name, last name, and email are required'
      }, { status: 400 });
    }

    console.log(`📝 Creating candidate: ${firstName} ${lastName} (${email})`);

    // Create candidate in database
    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        currentTitle: currentTitle || null,
        currentLocation: currentLocation || null,
        summary: summary || null,
        experienceYears: experienceYears || null,
        technicalSkills: technicalSkills || [],
        softSkills: softSkills || [],
        spokenLanguages: spokenLanguages || [],
        linkedinUrl: linkedinUrl || null,
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null,
        seniorityLevel: seniorityLevel as any || null,
        primaryIndustry: primaryIndustry || null,
        expectedSalary: expectedSalary || null,
        remotePreference: remotePreference as any || null,
        professionalHeadline: professionalHeadline || null,
        nationality: nationality || null,
        timezone: timezone || null,
        workPermitType: workPermitType || null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        graduationYear: graduationYear || null,
        educationLevel: educationLevel as any || null,
        functionalDomain: functionalDomain || null,
        preferredContractType: preferredContractType as any || null,
        relocationWillingness: relocationWillingness || false,
        freelancer: freelancer || false,
        programmingLanguages: programmingLanguages || [],
        frameworks: frameworks || [],
        toolsAndPlatforms: toolsAndPlatforms || [],
        methodologies: methodologies || [],
        certifications: certifications || [],
        degrees: degrees || [],
        universities: universities || [],
        notableProjects: notableProjects || [],
        tags: tags || [],
        recruiterNotes: notes ? [notes] : [],
        source: source || 'manual',
        lastUpdated: new Date(),
        status: 'NEW'
      }
    });

    console.log('✅ Candidate created successfully:', candidate.id);

    return NextResponse.json({
      success: true,
      data: candidate,
      message: 'Candidate created successfully'
    });

  } catch (error: any) {
    console.error('💥 Error creating candidate:', error);
    
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json({
        error: 'Email already exists',
        message: 'A candidate with this email address already exists'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to create candidate. Please try again.',
      details: error.message
    }, { status: 500 });
  }
} 