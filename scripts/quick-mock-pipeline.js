const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Creating quick mock pipeline for demo...');

  // Find the demo job
  const demoJob = await prisma.job.findFirst({
    where: {
      OR: [
        { title: { contains: 'Senior Data Engineer' } },
        { title: { contains: 'Data Engineer' } }
      ]
    }
  });

  if (!demoJob) {
    console.error('❌ Demo job not found!');
    return;
  }

  console.log(`✅ Found demo job: ${demoJob.title} (${demoJob.id})`);

  // Delete existing applications for this job
  await prisma.application.deleteMany({
    where: { jobId: demoJob.id }
  });

  // Create mock candidates directly in applications table
  const mockCandidates = [
    { firstName: 'Alexandra', lastName: 'Schmidt', email: 'alexandra.schmidt@email.com', stage: 'PENDING' },
    { firstName: 'Marco', lastName: 'Weber', email: 'marco.weber@email.com', stage: 'PENDING' },
    { firstName: 'Elena', lastName: 'Rossi', email: 'elena.rossi@email.com', stage: 'PENDING' },
    { firstName: 'Thomas', lastName: 'Andersen', email: 'thomas.andersen@email.com', stage: 'REVIEWING' },
    { firstName: 'Isabella', lastName: 'Romano', email: 'isabella.romano@email.com', stage: 'REVIEWING' },
    { firstName: 'Raj', lastName: 'Patel', email: 'raj.patel@email.com', stage: 'INTERVIEW_SCHEDULED' },
    { firstName: 'Maria', lastName: 'González', email: 'maria.gonzalez@email.com', stage: 'INTERVIEWED' },
    { firstName: 'Stefan', lastName: 'Johansson', email: 'stefan.johansson@email.com', stage: 'OFFER_EXTENDED' }
  ];

  console.log(`🔄 Creating ${mockCandidates.length} mock candidates...`);

  for (const candidateData of mockCandidates) {
    try {
      // Check if candidate exists
      let candidate = await prisma.candidate.findUnique({
        where: { email: candidateData.email }
      });

      if (!candidate) {
        // Create candidate with minimal required fields
        candidate = await prisma.candidate.create({
          data: {
            firstName: candidateData.firstName,
            lastName: candidateData.lastName,
            email: candidateData.email,
            lastUpdated: new Date()
          }
        });
      }

      // Create application
      await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId: demoJob.id,
          status: candidateData.stage,
          appliedAt: new Date()
        }
      });

      console.log(`✅ Created: ${candidate.firstName} ${candidate.lastName} (${candidateData.stage})`);
    } catch (error) {
      console.error(`❌ Error creating ${candidateData.firstName}:`, error.message);
    }
  }

  console.log('🎉 Mock pipeline demo created!');
  console.log(`🚀 Visit: http://localhost:3000/jobs/${demoJob.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
