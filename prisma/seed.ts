import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample candidates
  const candidate1 = await prisma.candidate.upsert({
    where: { email: 'sarah.johnson@email.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      currentTitle: 'Senior Frontend Engineer',
      phone: '+41 79 123 4567',
      currentLocation: 'Zurich, Switzerland',
      experienceYears: 8,
      summary: 'Experienced frontend engineer with expertise in React and modern web technologies',
      technicalSkills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      certifications: ['AWS Certified Developer', 'React Professional'],
      degrees: ['MSc Computer Science, ETH Zurich'],
      spokenLanguages: ['English (Native)', 'German (Professional)', 'French (Basic)'],
      lastUpdated: new Date(),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created candidate:', candidate1.firstName, candidate1.lastName);

  // Create sample jobs
  const job1 = await prisma.job.upsert({
    where: { id: 'job-1' },
    update: {},
    create: {
      id: 'job-1',
      title: 'Senior Full-Stack Developer',
      description: 'We are looking for a Senior Full-Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
      department: 'Engineering',
      location: 'Zurich, Switzerland',
      status: 'ACTIVE',
      salaryMin: 120000,
      salaryMax: 180000,
      salaryCurrency: 'CHF',
      isRemote: true,
      requirements: [
        '5+ years full-stack development experience',
        'Strong JavaScript/TypeScript skills',
        'Experience with React and Node.js',
        'Database design knowledge',
      ],
      responsibilities: [
        'Develop and maintain web applications',
        'Collaborate with cross-functional teams',
        'Write clean, maintainable code',
        'Participate in code reviews',
      ],
      employmentType: ['FULL_TIME'],
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created job:', job1.title);

  // Create a sample application
  const application = await prisma.application.upsert({
    where: { 
      candidateId_jobId: {
        candidateId: candidate1.id,
        jobId: job1.id
      }
    },
    update: {},
    create: {
      candidateId: candidate1.id,
      jobId: job1.id,
      status: 'REVIEWING',
      source: 'Website',
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created application:', application.id);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 