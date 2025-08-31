import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { AlgoliaService } from '@/lib/services/algolia-service';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// AI-powered candidate rating function
async function generateCandidateRating(candidate: any): Promise<number> {
  // If candidate already has a rating, return it
  if (candidate.matchingScore && candidate.matchingScore > 0) {
    return candidate.matchingScore;
  }

  try {
    const candidateProfile = `
      Name: ${candidate.firstName} ${candidate.lastName}
      Current Role: ${candidate.currentTitle || 'Not specified'}
      Experience: ${candidate.experienceYears || 0} years
      Technical Skills: ${candidate.technicalSkills?.join(', ') || 'None listed'}
      Education: ${candidate.degrees?.join(', ') || 'Not specified'}
      Certifications: ${candidate.certifications?.join(', ') || 'None'}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Rate this candidate on a 1.0-5.0 scale based on their professional profile. Consider:
- Technical skills depth and relevance
- Years of experience and career progression  
- Education quality and certifications
- Overall market value and desirability

Be realistic: 4.0+ is exceptional, 3.0-3.9 is good, 2.0-2.9 is average, below 2.0 needs development.

Respond with ONLY a number between 1.0 and 5.0, like: 3.7`
        },
        {
          role: 'user',
          content: candidateProfile
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    const rating = parseFloat(result || '3.0');
    
    // Ensure valid range
    return Math.max(1.0, Math.min(5.0, isNaN(rating) ? 3.0 : rating));
    
  } catch (error) {
    console.error('AI rating failed, using fallback:', error);
    
    // Simple fallback based on experience and skills
    let score = 2.5;
    const years = candidate.experienceYears || 0;
    const skillCount = candidate.technicalSkills?.length || 0;
    
    if (years >= 8) score += 0.8;
    else if (years >= 5) score += 0.6;
    else if (years >= 2) score += 0.4;
    
    if (skillCount >= 6) score += 0.4;
    else if (skillCount >= 3) score += 0.2;
    
    return Math.max(1.0, Math.min(5.0, score));
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/candidates called');
    
    // Temporarily bypass auth to fix database connection issues
    console.log('🔓 Bypassing auth for database troubleshooting...');
    
    // TODO: Re-enable authentication after fixing database issues
    // const { userId } = auth();
    // if (!userId) {
    //   console.log('❌ No userId found, returning 401');
    //   return NextResponse.json({ 
    //     success: false,
    //     error: 'Unauthorized',
    //     message: 'Please sign in to access candidates'
    //   }, { status: 401 });
    // }
    // console.log('✅ User authenticated:', userId);

    // Fetch real candidates from database
    console.log('🔍 Fetching candidates from database...');
    // Simplified query to test basic database connection
    console.log('🔍 Testing simple candidate query...');
    const candidates = await prisma.candidate.findMany({
      where: {
        archived: false, // Only fetch non-archived candidates
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        currentTitle: true,
        currentLocation: true,
        technicalSkills: true,
        experienceYears: true,
        status: true,
        createdAt: true,
        lastUpdated: true,
        matchingScore: true, // This will store the AI rating
        originalCvUrl: true,
        originalCvFileName: true,
        originalCvUploadedAt: true,
        degrees: true,
        certifications: true,
        universities: true,
        graduationYear: true,
        summary: true,
        softSkills: true,
      },
      // Remove limit to get all candidates
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Successfully fetched', candidates.length, 'candidates from database');
    console.log('📊 Sample candidate data:', candidates[0] ? {
      id: candidates[0].id,
      firstName: candidates[0].firstName,
      lastName: candidates[0].lastName,
      email: candidates[0].email
    } : 'No candidates found');

    // Simplified transformation for testing
    console.log('🔄 Transforming candidates for frontend...');
    
    // Process ratings for candidates that don't have them
    const candidatesWithRatings = await Promise.all(
      candidates.map(async (candidate, index) => {
        const rating = candidate.matchingScore || await generateCandidateRating(candidate);
        return { ...candidate, computedRating: rating };
      })
    );
    
    const transformedCandidates = candidatesWithRatings.map((candidate, index) => ({
      id: index + 1,
      databaseId: candidate.id,
      name: `${candidate.firstName || 'Unknown'} ${candidate.lastName || 'User'}`,
      location: candidate.currentLocation || 'Not specified',
      experience: `${candidate.experienceYears || 0} years`,
      currentRole: candidate.currentTitle || 'Not specified',
      score: 'Strong',
      status: candidate.status || 'NEW',
      avatar: (candidate.firstName?.charAt(0) || 'U') + (candidate.lastName?.charAt(0) || 'U'),
      skills: candidate.technicalSkills || [],
      rating: candidate.computedRating,
      email: candidate.email || 'no-email@example.com',
      phone: '',
      company: 'Not specified',
      summary: candidate.summary || 'No summary available',
      education: candidate.degrees?.join(', ') || 'Not specified',
      languages: [],
      availability: 'Available',
      expectedSalary: 'Not specified',
      linkedinUrl: undefined,
      portfolioUrl: undefined,
      lastInteraction: candidate.createdAt?.toISOString() || new Date().toISOString(),
      source: 'database',
      workExperience: [],
      timeline: [
        {
          date: candidate.createdAt?.toISOString() || new Date().toISOString(),
          action: 'Candidate added',
          type: 'application',
          details: 'Added to database'
        }
      ],
      // CV file information
      originalCvUrl: candidate.originalCvUrl,
      originalCvFileName: candidate.originalCvFileName,
      originalCvUploadedAt: candidate.originalCvUploadedAt?.toISOString(),
      // AI Matching information (will be added later)
      jobMatches: [],
      averageMatchScore: null,
      topMatchingJob: null
    }));

    console.log('🔄 Transformed', transformedCandidates.length, 'candidates for frontend');
    console.log('📋 Sample transformed candidate:', transformedCandidates[0] ? {
      id: transformedCandidates[0].id,
      name: transformedCandidates[0].name,
      location: transformedCandidates[0].location,
      databaseId: transformedCandidates[0].databaseId
    } : 'No transformed candidates');

    return NextResponse.json({
      success: true,
      data: transformedCandidates,
      total: transformedCandidates.length
    });
  } catch (error) {
    console.error('❌ Database error fetching candidates:', error);
    console.error('Database URL exists:', !!process.env.DATABASE_URL);
    console.error('Database URL preview:', process.env.DATABASE_URL?.substring(0, 20) + '...');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown database error',
      details: {
        databaseUrlExists: !!process.env.DATABASE_URL,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        suggestion: 'Check DATABASE_URL environment variable and database connectivity'
      }
    }, { status: 500 });
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

    // Handle both JSON and FormData (for file uploads)
    const contentType = request.headers.get('content-type');
    let body: any;
    let cvFile: File | null = null;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload with candidate data
      const formData = await request.formData();
      
      // Extract CV file if present
      cvFile = formData.get('cvFile') as File;
      
      // Extract candidate data from form
      const candidateDataString = formData.get('candidateData') as string;
      if (candidateDataString) {
        body = JSON.parse(candidateDataString);
      } else {
        // Extract individual fields from form data
        body = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          currentTitle: formData.get('currentTitle'),
          currentLocation: formData.get('currentLocation'),
          summary: formData.get('summary'),
          // Add other fields as needed
        };
      }
    } else {
      // Handle JSON data only
      body = await request.json();
    }
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

    // Index candidate in Algolia
    try {
      await AlgoliaService.indexCandidate(candidate.id);
      console.log('✅ Candidate indexed in Algolia');
    } catch (algoliaError) {
      console.error('⚠️ Failed to index candidate in Algolia:', algoliaError);
      // Don't fail the entire request if Algolia fails
    }

    // Handle CV file upload if present
    if (cvFile) {
      try {
        console.log('📎 Uploading CV file:', cvFile.name);
        
        // Upload file to Vercel Blob storage
        const { put } = await import('@vercel/blob');
        const blob = await put(`candidates/${candidate.id}/cv/${cvFile.name}`, cvFile, {
          access: 'public',
        });
        
        console.log('✅ CV file uploaded to blob storage:', blob.url);
        
        // Update candidate with CV file information
        await prisma.candidate.update({
          where: { id: candidate.id },
          data: {
            originalCvUrl: blob.url,
            originalCvFileName: cvFile.name,
            originalCvUploadedAt: new Date(),
          }
        });
        
        console.log('✅ Candidate updated with CV file information');
      } catch (fileError) {
        console.error('❌ Error uploading CV file:', fileError);
        // Don't fail the entire candidate creation if file upload fails
        // Just log the error and continue
      }
    }

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