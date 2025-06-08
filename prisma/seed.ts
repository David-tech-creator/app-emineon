import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@emineon.com' },
    update: {},
    create: {
      email: 'admin@emineon.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create sample candidates
  const candidate1 = await prisma.candidate.upsert({
    where: { id: 'candidate-1' },
    update: {},
    create: {
      id: 'candidate-1',
      fullName: 'Sarah Johnson',
      currentTitle: 'Senior Frontend Engineer',
      email: 'sarah.johnson@email.com',
      phone: '+41 79 123 4567',
      location: 'Zurich, Switzerland',
      yearsOfExperience: 8,
      summary: 'Experienced frontend engineer with expertise in React and modern web technologies',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
      certifications: ['AWS Certified Developer', 'React Professional'],
      education: ['MSc Computer Science, ETH Zurich'],
      languages: ['English (Native)', 'German (Professional)', 'French (Basic)'],
      userId: user.id,
      experience: {
        create: [
          {
            company: 'Tech Corp',
            title: 'Senior Frontend Engineer',
            startDate: '2021-01',
            endDate: 'Present',
            responsibilities: 'Led frontend development team, implemented modern React architecture',
          },
          {
            company: 'StartupXYZ',
            title: 'Frontend Developer',
            startDate: '2019-06',
            endDate: '2020-12',
            responsibilities: 'Developed responsive web applications using React and TypeScript',
          },
        ],
      },
    },
  });

  console.log('✅ Created candidate:', candidate1.fullName);

  // Create sample templates
  const template1 = await prisma.template.upsert({
    where: { id: 'template-ubs' },
    update: {},
    create: {
      id: 'template-ubs',
      name: 'UBS Technology Template',
      description: 'Professional template with UBS branding',
      colorHex: '#E60012',
      font: 'Helvetica',
      client: 'UBS',
      footerText: 'Generated with Emineon ATS for UBS',
      sections: [
        { key: 'header', label: 'Header Information', show: true, order: 1 },
        { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
        { key: 'experience', label: 'Work Experience', show: true, order: 3 },
        { key: 'skills', label: 'Technical Skills', show: true, order: 4 },
        { key: 'education', label: 'Education', show: true, order: 5 },
        { key: 'certifications', label: 'Certifications', show: true, order: 6 },
      ],
      userId: user.id,
    },
  });

  console.log('✅ Created template:', template1.name);

  // Create sample jobs
  const job1 = await prisma.job.upsert({
    where: { id: 'job-1' },
    update: {},
    create: {
      id: 'job-1',
      title: 'Senior Full-Stack Developer',
      company: 'TechCorp Inc',
      description: 'We are looking for a Senior Full-Stack Developer to join our growing team...',
      location: 'Zurich, Switzerland',
      remote: true,
      contractType: 'PERMANENT',
      status: 'ACTIVE',
      salaryMin: 120000,
      salaryMax: 180000,
      currency: 'CHF',
      urgent: false,
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
      requirements: [
        '5+ years full-stack development experience',
        'Strong JavaScript/TypeScript skills',
        'Experience with React and Node.js',
        'Database design knowledge',
      ],
      userId: user.id,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created job:', job1.title);

  // Create a competence file
  const competenceFile = await prisma.competenceFile.upsert({
    where: { id: 'cf-1' },
    update: {},
    create: {
      id: 'cf-1',
      fileName: 'Sarah_Johnson_Competence_File.pdf',
      filePath: 'competence-files/sarah-johnson-cf.pdf',
      format: 'PDF',
      fileSize: 1024000,
      downloadUrl: 'https://example.com/download/sarah-johnson-cf.pdf',
      customization: {
        colorHex: '#E60012',
        font: 'Helvetica',
        footerText: 'Generated with Emineon ATS',
      },
      sections: [
        { key: 'header', label: 'Header Information', show: true, order: 1 },
        { key: 'summary', label: 'Professional Summary', show: true, order: 2 },
        { key: 'experience', label: 'Work Experience', show: true, order: 3 },
        { key: 'skills', label: 'Technical Skills', show: true, order: 4 },
      ],
      candidateId: candidate1.id,
      templateId: template1.id,
      userId: user.id,
    },
  });

  console.log('✅ Created competence file:', competenceFile.fileName);

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