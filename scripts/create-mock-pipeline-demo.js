const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Creating mock pipeline demo with drag-and-drop candidates...');

  // Find the demo job
  const demoJob = await prisma.job.findFirst({
    where: {
      OR: [
        { title: { contains: 'Senior Data Engineer - Pipeline Demo' } },
        { title: { contains: 'Data Engineer' } }
      ]
    }
  });

  if (!demoJob) {
    console.error('❌ Demo job not found! Please run the DataFlow portal setup first.');
    return;
  }

  console.log(`✅ Found demo job: ${demoJob.title} (${demoJob.id})`);

  // Delete existing applications for this job to start fresh
  await prisma.application.deleteMany({
    where: { jobId: demoJob.id }
  });

  // Mock candidates spread across all pipeline stages
  const mockCandidates = [
    // PENDING (Sourced) - 5 candidates
    {
      firstName: 'Alexandra',
      lastName: 'Schmidt',
      email: 'alexandra.schmidt@email.com',
      phone: '+41 79 123 4567',
      currentLocation: 'Basel, Switzerland',
      currentTitle: 'Senior Data Engineer',
      experience: '7 years',
      skills: ['Python', 'Apache Spark', 'AWS', 'MongoDB', 'TypeScript'],
      availability: 'Available in 2 months',
      source: 'LinkedIn',
      expectedSalary: 'CHF 135,000',
      noticePeriod: '3 months',
      stage: 'PENDING'
    },
    {
      firstName: 'Marco',
      lastName: 'Weber',
      email: 'marco.weber@email.com',
      phone: '+41 76 234 5678',
      currentLocation: 'Bern, Switzerland',
      currentTitle: 'Data Platform Engineer',
      experience: '5 years',
      skills: ['Scala', 'Kafka', 'Kubernetes', 'PostgreSQL', 'React'],
      availability: 'Available immediately',
      source: 'Referral',
      expectedSalary: 'CHF 125,000',
      noticePeriod: '1 month',
      stage: 'PENDING'
    },
    {
      firstName: 'Elena',
      lastName: 'Rossi',
      email: 'elena.rossi@email.com',
      phone: '+41 78 345 6789',
      currentLocation: 'Geneva, Switzerland',
      currentTitle: 'Data Engineer',
      experience: '4 years',
      skills: ['Python', 'Docker', 'Airflow', 'BigQuery', 'Vue.js'],
      availability: 'Available in 1 month',
      source: 'Company Website',
      expectedSalary: 'CHF 115,000',
      noticePeriod: '2 months',
      stage: 'PENDING'
    },
    {
      firstName: 'David',
      lastName: 'Müller',
      email: 'david.mueller@email.com',
      phone: '+49 176 456 7890',
      currentLocation: 'Munich, Germany',
      currentTitle: 'Senior Data Analyst',
      experience: '6 years',
      skills: ['R', 'Python', 'Tableau', 'SQL Server', 'Angular'],
      availability: 'Available in 6 weeks',
      source: 'Headhunter',
      expectedSalary: 'CHF 120,000',
      noticePeriod: '3 months',
      stage: 'PENDING'
    },
    {
      firstName: 'Sophie',
      lastName: 'Laurent',
      email: 'sophie.laurent@email.com',
      phone: '+33 6 56 78 90 12',
      currentLocation: 'Lyon, France',
      currentTitle: 'Data Engineer',
      experience: '3 years',
      skills: ['Python', 'Spark', 'Databricks', 'Azure', 'Node.js'],
      availability: 'Available immediately',
      source: 'Job Board',
      expectedSalary: 'CHF 110,000',
      noticePeriod: 'None',
      stage: 'PENDING'
    },

    // REVIEWING (Screened) - 3 candidates
    {
      firstName: 'Thomas',
      lastName: 'Andersen',
      email: 'thomas.andersen@email.com',
      phone: '+47 95 67 89 01',
      currentLocation: 'Oslo, Norway',
      currentTitle: 'Lead Data Engineer',
      experience: '8 years',
      skills: ['Java', 'Spark', 'Elasticsearch', 'AWS', 'React'],
      availability: 'Available in 2 months',
      source: 'LinkedIn',
      expectedSalary: 'CHF 145,000',
      noticePeriod: '3 months',
      stage: 'REVIEWING'
    },
    {
      firstName: 'Isabella',
      lastName: 'Romano',
      email: 'isabella.romano@email.com',
      phone: '+39 340 789 0123',
      currentLocation: 'Milan, Italy',
      currentTitle: 'Senior Data Engineer',
      experience: '6 years',
      skills: ['Python', 'TensorFlow', 'GCP', 'MongoDB', 'Express.js'],
      availability: 'Available in 1 month',
      source: 'Referral',
      expectedSalary: 'CHF 130,000',
      noticePeriod: '2 months',
      stage: 'REVIEWING'
    },
    {
      firstName: 'Raj',
      lastName: 'Patel',
      email: 'raj.patel@email.com',
      phone: '+44 7700 890123',
      currentLocation: 'London, UK',
      currentTitle: 'Data Platform Engineer',
      experience: '5 years',
      skills: ['Scala', 'Flink', 'Cassandra', 'Kubernetes', 'TypeScript'],
      availability: 'Available immediately',
      source: 'Headhunter',
      expectedSalary: 'CHF 125,000',
      noticePeriod: '1 month',
      stage: 'REVIEWING'
    },

    // INTERVIEW_SCHEDULED - 2 candidates
    {
      firstName: 'Amélie',
      lastName: 'Dubois',
      email: 'amelie.dubois@email.com',
      phone: '+33 6 78 90 12 34',
      currentLocation: 'Paris, France',
      currentTitle: 'Senior Data Scientist',
      experience: '7 years',
      skills: ['Python', 'MLflow', 'Databricks', 'Azure', 'React'],
      availability: 'Available in 6 weeks',
      source: 'LinkedIn',
      expectedSalary: 'CHF 140,000',
      noticePeriod: '2 months',
      stage: 'INTERVIEW_SCHEDULED'
    },
    {
      firstName: 'Klaus',
      lastName: 'Fischer',
      email: 'klaus.fischer@email.com',
      phone: '+49 176 901 2345',
      currentLocation: 'Berlin, Germany',
      currentTitle: 'Principal Data Engineer',
      experience: '10 years',
      skills: ['Java', 'Spark', 'Kafka', 'AWS', 'Angular'],
      availability: 'Available in 3 months',
      source: 'Company Website',
      expectedSalary: 'CHF 155,000',
      noticePeriod: '3 months',
      stage: 'INTERVIEW_SCHEDULED'
    },

    // INTERVIEWED - 1 candidate
    {
      firstName: 'Maria',
      lastName: 'González',
      email: 'maria.gonzalez@email.com',
      phone: '+34 600 123 456',
      currentLocation: 'Barcelona, Spain',
      currentTitle: 'Senior Data Engineer',
      experience: '6 years',
      skills: ['Python', 'Airflow', 'Snowflake', 'dbt', 'Vue.js'],
      availability: 'Available in 1 month',
      source: 'Referral',
      expectedSalary: 'CHF 135,000',
      noticePeriod: '2 months',
      stage: 'INTERVIEWED'
    },

    // OFFER_EXTENDED - 1 candidate
    {
      firstName: 'Stefan',
      lastName: 'Johansson',
      email: 'stefan.johansson@email.com',
      phone: '+46 70 234 5678',
      currentLocation: 'Stockholm, Sweden',
      currentTitle: 'Lead Data Engineer',
      experience: '9 years',
      skills: ['Scala', 'Spark', 'Kubernetes', 'GCP', 'React'],
      availability: 'Available in 2 months',
      source: 'Headhunter',
      expectedSalary: 'CHF 150,000',
      noticePeriod: '3 months',
      stage: 'OFFER_EXTENDED'
    }
  ];

  console.log(`🔄 Creating ${mockCandidates.length} mock candidates...`);

  // Create candidates and applications
  for (const candidateData of mockCandidates) {
    try {
      // Check if candidate exists by email
      let candidate = await prisma.candidate.findUnique({
        where: { email: candidateData.email }
      });

      if (!candidate) {
        // Create new candidate
        candidate = await prisma.candidate.create({
          data: {
            firstName: candidateData.firstName,
            lastName: candidateData.lastName,
            email: candidateData.email,
            phone: candidateData.phone,
            currentLocation: candidateData.currentLocation,
            currentTitle: candidateData.currentTitle,
            experience: candidateData.experience,
            skills: candidateData.skills,
            availability: candidateData.availability,
            source: candidateData.source,
            expectedSalary: candidateData.expectedSalary,
            noticePeriod: candidateData.noticePeriod,
            lastUpdated: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      // Create application
      const application = await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId: demoJob.id,
          status: candidateData.stage,
          appliedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Create AI match for this candidate
      await prisma.aI_Match.create({
        data: {
          candidateId: candidate.id,
          jobId: demoJob.id,
          score: Math.floor(Math.random() * 25) + 75, // Random score between 75-100
          factors: [
            'Strong technical skills match',
            'Relevant experience in data engineering',
            'Good location fit',
            'Salary expectations align'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName} (${candidateData.stage})`);
    } catch (error) {
      console.error(`❌ Error creating candidate ${candidateData.firstName} ${candidateData.lastName}:`, error);
    }
  }

  // Update job statistics
  const applicationCount = await prisma.application.count({
    where: { jobId: demoJob.id }
  });

  await prisma.job.update({
    where: { id: demoJob.id },
    data: {
      _count: {
        applications: applicationCount
      }
    }
  });

  console.log('🎉 Mock pipeline demo created successfully!');
  console.log(`📊 Total candidates in pipeline: ${applicationCount}`);
  
  // Show stage distribution
  const stages = ['PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED'];
  for (const stage of stages) {
    const count = await prisma.application.count({
      where: { jobId: demoJob.id, status: stage }
    });
    console.log(`   ${stage}: ${count} candidates`);
  }

  console.log('\n🚀 Demo is ready! You can now:');
  console.log('1. Visit the job page: http://localhost:3000/jobs/' + demoJob.id);
  console.log('2. Drag and drop candidates between pipeline stages');
  console.log('3. Click on candidates to view details');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 