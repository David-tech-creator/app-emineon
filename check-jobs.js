const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJobs() {
  try {
    console.log('🔍 Checking all jobs in the database...');
    
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        clientId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📊 Found ${jobs.length} jobs:`);
    
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   ID: ${job.id}`);
      console.log(`   Department: ${job.department}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Client: ${job.clientId || 'No client'}`);
      console.log(`   Created: ${job.createdAt}`);
    });

    // Look for Data Engineer jobs specifically
    const dataEngineerJobs = jobs.filter(job => 
      job.title.toLowerCase().includes('data engineer')
    );

    if (dataEngineerJobs.length > 0) {
      console.log('\n🎯 Data Engineer jobs found:');
      dataEngineerJobs.forEach(job => {
        console.log(`   • ${job.title} (${job.id})`);
      });
    } else {
      console.log('\n❌ No Data Engineer jobs found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs();
