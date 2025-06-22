// Test script for Emmanuel's Data Engineers email
// This simulates the email parsing and project creation workflow

const emmanuelEmail = {
  emailSubject: "5 Data Engineers - DataFlow Innovations - Medical Domain",
  emailContent: `
Hi there,

I hope you're doing well! I have an exciting opportunity for you.

DataFlow Innovations is looking for 5 Data Engineers to join their team in Carouge, Geneva. This is a fantastic opportunity to work in the medical domain on cutting-edge healthcare data solutions.

Project Details:
- Company: DataFlow Innovations
- Position: Data Engineer
- Number of positions: 5
- Location: Carouge, Geneva (Hybrid work possible)
- Domain: Medical/Healthcare
- Duration: 12-month project with potential for extension
- Start Date: As soon as possible
- Budget: €500k - €750k total project budget

Required Skills:
- Python programming (mandatory)
- SQL and database management
- ETL/ELT processes
- Cloud platforms (AWS/Azure preferred)
- Data pipeline development
- Healthcare data standards (HL7, FHIR) - nice to have
- Machine learning basics
- Experience with medical data compliance (GDPR, HIPAA)

Experience Level:
- 3-5 years minimum in data engineering
- Previous experience in healthcare/medical domain preferred
- Strong analytical and problem-solving skills

The client is looking to fill these positions urgently as they have a major healthcare analytics project starting next month. They offer competitive salaries and excellent benefits.

Please let me know if you have suitable candidates or if you need any additional information.

Best regards,
Emmanuel Dubois
Senior Recruitment Consultant
DataFlow Innovations
emmanuel.dubois@dataflow-innovations.com
+41 22 123 4567
  `,
  senderEmail: "emmanuel.dubois@dataflow-innovations.com",
  receivedDate: new Date().toISOString()
};

async function testProjectCreation() {
  try {
    console.log('🧪 Testing Project Creation from Emmanuel\'s Email...\n');
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/projects/parse-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emmanuelEmail)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Project Created Successfully!');
    console.log('📋 Project Details:');
    console.log(`   Name: ${result.project.name}`);
    console.log(`   Client: ${result.project.clientName}`);
    console.log(`   Positions: ${result.project.totalPositions}`);
    console.log(`   Urgency: ${result.project.urgencyLevel}`);
    console.log(`   Location: ${result.project.location || 'Not specified'}`);
    console.log(`   Remote: ${result.project.isRemote ? 'Yes' : 'No'}`);
    console.log(`   Hybrid: ${result.project.isHybrid ? 'Yes' : 'No'}`);
    
    console.log('\n🛠️ Skills Required:');
    result.project.skillsRequired.forEach(skill => {
      console.log(`   • ${skill}`);
    });
    
    console.log('\n📈 Experience Required:');
    result.project.experienceRequired.forEach(exp => {
      console.log(`   • ${exp}`);
    });
    
    console.log('\n💼 Job Suggestions:');
    result.jobSuggestions.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.title} (Priority: ${job.priority})`);
      console.log(`      Level: ${job.experienceLevel}`);
      console.log(`      Requirements: ${job.requirements.slice(0, 3).join(', ')}${job.requirements.length > 3 ? '...' : ''}`);
    });
    
    console.log('\n🔗 Project URL:');
    console.log(`   https://app-emineon.vercel.app/projects/${result.project.id}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    throw error;
  }
}

// Test the projects API endpoint
async function testProjectsAPI() {
  try {
    console.log('\n🔍 Testing Projects API...');
    
    const response = await fetch('http://localhost:3000/api/projects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Found ${data.projects.length} projects`);
    
    if (data.projects.length > 0) {
      console.log('\n📊 Projects Summary:');
      data.projects.forEach(project => {
        console.log(`   • ${project.name} (${project.status}) - ${project.totalPositions} positions`);
      });
    }
    
  } catch (error) {
    console.error('❌ Projects API Test Failed:', error.message);
  }
}

// Run the tests
async function runTests() {
  console.log('🚀 Starting Emineon Project Management Tests\n');
  console.log('=' .repeat(60));
  
  try {
    // Test project creation
    await testProjectCreation();
    
    // Wait a moment for the project to be saved
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test projects listing
    await testProjectsAPI();
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Open the Outlook add-in');
    console.log('   2. Paste Emmanuel\'s email content');
    console.log('   3. Click "Create Project" in Quick Actions');
    console.log('   4. View the project in the main ATS dashboard');
    
  } catch (error) {
    console.log('\n' + '=' .repeat(60));
    console.error('💥 Tests failed:', error.message);
    process.exit(1);
  }
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    emmanuelEmail,
    testProjectCreation,
    testProjectsAPI,
    runTests
  };
}

// Run if called directly
if (require.main === module) {
  runTests();
} 