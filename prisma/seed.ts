import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample candidates
  const candidate1 = await prisma.candidate.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      experience: 5
    }
  });

  const candidate2 = await prisma.candidate.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      experience: 7
    }
  });

  console.log('✅ Created sample candidates:');
  console.log('  -', `${candidate1.firstName} ${candidate1.lastName}`, '(', candidate1.email, ')');
  console.log('  -', `${candidate2.firstName} ${candidate2.lastName}`, '(', candidate2.email, ')');

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