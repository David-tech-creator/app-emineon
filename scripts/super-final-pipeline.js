const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const demoJob = await prisma.job.findFirst({
    where: { title: { contains: 'Data Engineer' } }
  });
  
  if (!demoJob) {
    console.error('❌ No job found!');
    return;
  }

  await prisma.application.deleteMany({ where: { jobId: demoJob.id } });

  const candidates = [
    { firstName: 'Alexandra', lastName: 'Schmidt', email: 'alexandra@demo.com', stage: 'PENDING' },
    { firstName: 'Marco', lastName: 'Weber', email: 'marco@demo.com', stage: 'PENDING' },
    { firstName: 'Elena', lastName: 'Rossi', email: 'elena@demo.com', stage: 'PENDING' },
    { firstName: 'Thomas', lastName: 'Andersen', email: 'thomas@demo.com', stage: 'REVIEWING' },
    { firstName: 'Isabella', lastName: 'Romano', email: 'isabella@demo.com', stage: 'REVIEWING' },
    { firstName: 'Raj', lastName: 'Patel', email: 'raj@demo.com', stage: 'INTERVIEW_SCHEDULED' },
    { firstName: 'Maria', lastName: 'González', email: 'maria@demo.com', stage: 'INTERVIEWED' },
    { firstName: 'Stefan', lastName: 'Johansson', email: 'stefan@demo.com', stage: 'OFFER_EXTENDED' }
  ];

  for (const data of candidates) {
    try {
      let candidate = await prisma.candidate.findUnique({ where: { email: data.email } });
      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            lastUpdated: new Date()
          }
        });
      }

      await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId: demoJob.id,
          status: data.stage,
          updatedAt: new Date()
        }
      });

      console.log(`✅ ${data.firstName} ${data.lastName} (${data.stage})`);
    } catch (error) {
      console.error(`❌ ${data.firstName}: ${error.message}`);
    }
  }

  console.log(`🎉 Demo ready: http://localhost:3000/jobs/${demoJob.id}`);
}

main().finally(() => prisma.$disconnect());
