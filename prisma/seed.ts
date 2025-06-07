import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample jobs first
  const job1 = await prisma.job.upsert({
    where: { id: 'job-1-senior-fullstack' },
    update: {},
    create: {
      id: 'job-1-senior-fullstack',
      title: 'Senior Full Stack Developer',
      description: `We are looking for a Senior Full Stack Developer to join our growing engineering team. You will be responsible for developing and maintaining our web applications using modern technologies.

**Key Responsibilities:**
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Mentor junior developers
- Participate in code reviews and technical discussions
- Implement best practices for code quality and testing

**Requirements:**
- 5+ years of experience in full-stack development
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Knowledge of database design and optimization
- Familiarity with cloud platforms (AWS/GCP/Azure)
- Experience with CI/CD pipelines

**Nice to Have:**
- Experience with Next.js
- Knowledge of containerization (Docker/Kubernetes)
- Previous startup experience
- Open source contributions`,
      department: 'Engineering',
      location: 'San Francisco, CA',
      language: 'EN',
      status: 'ACTIVE',
      salaryMin: 120000,
      salaryMax: 180000,
      salaryCurrency: 'USD',
      experienceLevel: 'SENIOR',
      employmentType: ['FULL_TIME'],
      benefits: [
        'Health Insurance',
        'Dental Insurance',
        'Vision Insurance',
        '401k Matching',
        'Flexible PTO',
        'Remote Work Options',
        'Professional Development Budget',
        'Stock Options'
      ],
      requirements: [
        '5+ years full-stack development experience',
        'JavaScript/TypeScript proficiency',
        'React and Node.js experience',
        'Database design knowledge',
        'Cloud platform experience',
        'CI/CD pipeline experience'
      ],
      responsibilities: [
        'Develop scalable web applications',
        'Collaborate with cross-functional teams',
        'Mentor junior developers',
        'Participate in code reviews',
        'Implement best practices'
      ],
      isRemote: true,
      publicToken: 'public-job-1-token',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  });

  const job2 = await prisma.job.upsert({
    where: { id: 'job-2-backend-python' },
    update: {},
    create: {
      id: 'job-2-backend-python',
      title: 'Backend Developer - Python',
      description: `Join our backend team to build robust and scalable APIs that power our platform. We're looking for a Python developer with strong experience in building high-performance backend systems.

**What You'll Do:**
- Design and implement RESTful APIs
- Optimize database queries and performance
- Build microservices architecture
- Implement security best practices
- Work with DevOps team on deployment strategies

**Requirements:**
- 3+ years of Python development experience
- Strong knowledge of Django or FastAPI
- Experience with PostgreSQL or similar databases
- Understanding of RESTful API design
- Experience with testing frameworks
- Knowledge of Docker and containerization

**Bonus Points:**
- Experience with GraphQL
- Knowledge of message queues (Redis, RabbitMQ)
- AWS or cloud platform experience
- Experience with monitoring and logging tools`,
      department: 'Engineering',
      location: 'Austin, TX',
      language: 'EN',
      status: 'ACTIVE',
      salaryMin: 90000,
      salaryMax: 130000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID_LEVEL',
      employmentType: ['FULL_TIME'],
      benefits: [
        'Health Insurance',
        'Dental Insurance',
        '401k Matching',
        'Flexible PTO',
        'Remote Work Options',
        'Learning Budget'
      ],
      requirements: [
        '3+ years Python development',
        'Django or FastAPI experience',
        'PostgreSQL knowledge',
        'RESTful API design',
        'Testing frameworks',
        'Docker experience'
      ],
      responsibilities: [
        'Design RESTful APIs',
        'Optimize database performance',
        'Build microservices',
        'Implement security practices',
        'Collaborate with DevOps'
      ],
      isRemote: true,
      publicToken: 'public-job-2-token',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  });

  const job3 = await prisma.job.upsert({
    where: { id: 'job-3-frontend-react' },
    update: {},
    create: {
      id: 'job-3-frontend-react',
      title: 'Frontend Developer - React',
      description: `We're seeking a talented Frontend Developer to create amazing user experiences with React. You'll work closely with our design team to bring beautiful interfaces to life.

**Your Role:**
- Build responsive and interactive user interfaces
- Collaborate with designers and backend developers
- Optimize applications for performance and accessibility
- Implement modern frontend best practices
- Participate in design system development

**What We're Looking For:**
- 2+ years of React development experience
- Strong HTML, CSS, and JavaScript skills
- Experience with modern CSS frameworks
- Knowledge of state management (Redux, Zustand, etc.)
- Understanding of responsive design principles
- Experience with testing libraries (Jest, React Testing Library)

**Nice to Have:**
- TypeScript experience
- Next.js knowledge
- Experience with design systems
- Knowledge of accessibility standards (WCAG)
- Previous experience with Figma or similar design tools`,
      department: 'Engineering',
      location: 'New York, NY',
      language: 'EN',
      status: 'ACTIVE',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'USD',
      experienceLevel: 'MID_LEVEL',
      employmentType: ['FULL_TIME'],
      benefits: [
        'Health Insurance',
        'Dental Insurance',
        'Vision Insurance',
        'Flexible PTO',
        'Remote Work Options',
        'Professional Development',
        'Gym Membership'
      ],
      requirements: [
        '2+ years React experience',
        'HTML, CSS, JavaScript skills',
        'CSS frameworks experience',
        'State management knowledge',
        'Responsive design principles',
        'Testing libraries experience'
      ],
      responsibilities: [
        'Build user interfaces',
        'Collaborate with design team',
        'Optimize for performance',
        'Implement best practices',
        'Develop design systems'
      ],
      isRemote: false,
      publicToken: 'public-job-3-token',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  });

  const job4 = await prisma.job.upsert({
    where: { id: 'job-4-devops-engineer' },
    update: {},
    create: {
      id: 'job-4-devops-engineer',
      title: 'DevOps Engineer',
      description: `Join our infrastructure team to build and maintain scalable, reliable systems. You'll work on automation, monitoring, and deployment pipelines that support our growing platform.

**Responsibilities:**
- Design and maintain CI/CD pipelines
- Manage cloud infrastructure (AWS/GCP)
- Implement monitoring and alerting systems
- Automate deployment processes
- Ensure system security and compliance
- Collaborate with development teams

**Requirements:**
- 3+ years of DevOps/Infrastructure experience
- Strong knowledge of AWS or GCP
- Experience with Docker and Kubernetes
- Proficiency in Infrastructure as Code (Terraform, CloudFormation)
- Knowledge of monitoring tools (Prometheus, Grafana, DataDog)
- Experience with CI/CD tools (Jenkins, GitLab CI, GitHub Actions)
- Scripting skills (Python, Bash, or similar)

**Preferred:**
- Kubernetes certification
- Experience with service mesh (Istio, Linkerd)
- Knowledge of security best practices
- Experience with database administration`,
      department: 'Infrastructure',
      location: 'Seattle, WA',
      language: 'EN',
      status: 'ACTIVE',
      salaryMin: 110000,
      salaryMax: 160000,
      salaryCurrency: 'USD',
      experienceLevel: 'SENIOR',
      employmentType: ['FULL_TIME'],
      benefits: [
        'Health Insurance',
        'Dental Insurance',
        'Vision Insurance',
        '401k Matching',
        'Flexible PTO',
        'Remote Work Options',
        'Professional Development Budget',
        'Stock Options',
        'On-call Compensation'
      ],
      requirements: [
        '3+ years DevOps experience',
        'AWS or GCP knowledge',
        'Docker and Kubernetes',
        'Infrastructure as Code',
        'Monitoring tools experience',
        'CI/CD tools experience',
        'Scripting skills'
      ],
      responsibilities: [
        'Design CI/CD pipelines',
        'Manage cloud infrastructure',
        'Implement monitoring systems',
        'Automate deployments',
        'Ensure security compliance',
        'Collaborate with dev teams'
      ],
      isRemote: true,
      publicToken: 'public-job-4-token',
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
    },
  });

  // Create sample candidates
  const candidate = await prisma.candidate.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      currentTitle: 'Senior Full Stack Developer',
      professionalHeadline: 'Experienced developer with expertise in modern web technologies',
      summary: 'Passionate full-stack developer with 8+ years of experience building scalable web applications. Expertise in React, Node.js, TypeScript, and cloud technologies.',
      experienceYears: 8,
      currentLocation: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      githubUrl: 'https://github.com/johndoe',
      phone: '+1-555-0123',
      expectedSalary: '120000',
      remotePreference: 'HYBRID',
      seniorityLevel: 'SENIOR',
      primaryIndustry: 'Technology',
      functionalDomain: 'Software Engineering',
      technicalSkills: [
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'Next.js',
        'PostgreSQL',
        'MongoDB',
        'AWS',
        'Docker',
        'Kubernetes'
      ],
      softSkills: [
        'Leadership',
        'Communication',
        'Problem Solving',
        'Team Collaboration',
        'Project Management'
      ],
      frameworks: ['React', 'Next.js', 'Express.js', 'NestJS'],
      programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Go'],
      methodologies: ['Agile', 'Scrum', 'TDD', 'CI/CD'],
      degrees: ['Bachelor of Computer Science'],
      universities: ['Stanford University'],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
      graduationYear: 2016,
      tags: ['Full Stack', 'Senior', 'React Expert', 'Node.js'],
      source: 'LinkedIn',
      status: 'ACTIVE',
      conversionStatus: 'IN_PIPELINE',
      freelancer: false,
      relocationWillingness: false,
      archived: false,
      profileToken: 'john-doe-token-123',
    },
  });

  const candidate2 = await prisma.candidate.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      currentTitle: 'Senior Backend Developer',
      professionalHeadline: 'Python expert with cloud infrastructure experience',
      summary: 'Experienced backend developer specializing in Python and cloud infrastructure. Strong background in building scalable APIs and microservices.',
      experienceYears: 7,
      currentLocation: 'Austin, TX',
      linkedinUrl: 'https://linkedin.com/in/janesmith',
      phone: '+1-555-0124',
      expectedSalary: '110000',
      remotePreference: 'REMOTE',
      seniorityLevel: 'SENIOR',
      primaryIndustry: 'Technology',
      functionalDomain: 'Backend Engineering',
      technicalSkills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'Redis', 'Docker'],
      softSkills: ['Problem Solving', 'Communication', 'Mentoring'],
      frameworks: ['Django', 'FastAPI', 'Flask'],
      programmingLanguages: ['Python', 'SQL', 'JavaScript'],
      methodologies: ['Agile', 'DevOps', 'TDD'],
      degrees: ['Master of Computer Science'],
      universities: ['UC Berkeley'],
      certifications: ['AWS Certified Developer'],
      graduationYear: 2017,
      tags: ['Python', 'AWS', 'Senior', 'Backend'],
      source: 'Seed Data',
      status: 'ACTIVE',
      conversionStatus: 'IN_PIPELINE',
      freelancer: false,
      relocationWillingness: true,
      archived: false,
      profileToken: 'jane-smith-token-456',
      recruiterNotes: ['Sample candidate for testing'],
    }
  });

  // Create sample applications
  const application1 = await prisma.application.upsert({
    where: { id: 'app-1-john-fullstack' },
    update: {},
    create: {
      id: 'app-1-john-fullstack',
      candidateId: candidate.id,
      jobId: job1.id,
      status: 'PENDING',
      coverLetter: 'I am excited to apply for the Senior Full Stack Developer position. With my 8 years of experience in full-stack development and expertise in React and Node.js, I believe I would be a great fit for your team.',
    },
  });

  const application2 = await prisma.application.upsert({
    where: { id: 'app-2-jane-backend' },
    update: {},
    create: {
      id: 'app-2-jane-backend',
      candidateId: candidate2.id,
      jobId: job2.id,
      status: 'REVIEWING',
      coverLetter: 'I am interested in the Backend Developer position. My experience with Python, Django, and AWS aligns perfectly with your requirements.',
    },
  });

  console.log('✅ Created sample jobs:');
  console.log('  -', job1.title, '(', job1.id, ')');
  console.log('  -', job2.title, '(', job2.id, ')');
  console.log('  -', job3.title, '(', job3.id, ')');
  console.log('  -', job4.title, '(', job4.id, ')');

  console.log('✅ Created sample candidates:');
  console.log('  -', candidate.firstName, candidate.lastName, '(', candidate.email, ')');
  console.log('  -', candidate2.firstName, candidate2.lastName, '(', candidate2.email, ')');

  console.log('✅ Created sample applications:');
  console.log('  -', application1.id, '- John Doe -> Senior Full Stack Developer');
  console.log('  -', application2.id, '- Jane Smith -> Backend Developer');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 