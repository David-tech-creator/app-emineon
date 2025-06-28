const fs = require('fs');

const testCandidateData = {
  id: "test-123",
  fullName: "Adam Mersva",
  currentTitle: "Senior Consultant",
  email: "adam.mersva@example.com",
  phone: "+1-555-0123",
  location: "New York, NY",
  yearsOfExperience: 8,
  skills: ["Strategic Planning", "Leadership", "Data Analysis", "Project Management"],
  certifications: ["PMP", "Six Sigma Black Belt"],
  experience: [
    {
      company: "McKinsey & Company",
      title: "Senior Consultant",
      startDate: "2020",
      endDate: "Present",
      responsibilities: "Led strategic transformation initiatives for Fortune 500 clients. Developed comprehensive business strategies and implementation roadmaps."
    },
    {
      company: "Deloitte",
      title: "Business Analyst",
      startDate: "2018",
      endDate: "2020",
      responsibilities: "Conducted market research and financial analysis. Supported client engagement teams in delivering high-impact solutions."
    }
  ],
  education: ["MBA - Harvard Business School", "BS Computer Science - MIT"],
  languages: ["English", "Spanish", "French"],
  summary: "Experienced senior consultant with 8+ years in strategic planning and business transformation."
};

async function testPDFGeneration() {
  console.log('🧪 Testing PDF generation performance and issues...\n');

  // Test Emineon template
  console.log('📊 Testing Emineon template...');
  const emineonStart = Date.now();
  try {
    const emineonResponse = await fetch('http://localhost:3000/api/test-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-pdf',
        template: 'emineon',
        candidateData: testCandidateData
      })
    });

    if (!emineonResponse.ok) {
      console.log('❌ Emineon request failed:', emineonResponse.status, await emineonResponse.text());
    } else {
      const emineonBuffer = await emineonResponse.arrayBuffer();
      const emineonTime = Date.now() - emineonStart;
      fs.writeFileSync('test-emineon.pdf', Buffer.from(emineonBuffer));
      console.log(`✅ Emineon PDF generated: ${emineonBuffer.byteLength} bytes in ${emineonTime}ms`);
    }
  } catch (error) {
    console.log('❌ Emineon generation error:', error.message);
  }

  // Test Antaes template
  console.log('\n📊 Testing Antaes template...');
  const antaesStart = Date.now();
  try {
    const antaesResponse = await fetch('http://localhost:3000/api/test-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-pdf',
        template: 'antaes',
        candidateData: testCandidateData
      })
    });

    if (!antaesResponse.ok) {
      console.log('❌ Antaes request failed:', antaesResponse.status, await antaesResponse.text());
    } else {
      const antaesBuffer = await antaesResponse.arrayBuffer();
      const antaesTime = Date.now() - antaesStart;
      fs.writeFileSync('test-antaes.pdf', Buffer.from(antaesBuffer));
      console.log(`✅ Antaes PDF generated: ${antaesBuffer.byteLength} bytes in ${antaesTime}ms`);
    }
  } catch (error) {
    console.log('❌ Antaes generation error:', error.message);
  }

  // Test HTML generation speed
  console.log('\n📊 Testing HTML generation speed...');
  const htmlStart = Date.now();
  try {
    const htmlResponse = await fetch('http://localhost:3000/api/competence-files/antaes-preview');
    if (htmlResponse.ok) {
      const htmlContent = await htmlResponse.text();
      const htmlTime = Date.now() - htmlStart;
      console.log(`✅ HTML generated: ${htmlContent.length} chars in ${htmlTime}ms`);
      
      // Save HTML for manual inspection
      fs.writeFileSync('test-antaes.html', htmlContent);
      console.log('💾 HTML saved to test-antaes.html for inspection');
    }
  } catch (error) {
    console.log('❌ HTML generation error:', error.message);
  }

  // Test CV parsing performance
  console.log('\n📊 Testing CV parsing performance...');
  const cvParseStart = Date.now();
  try {
    const testCV = `
JOHN SMITH
Senior Software Engineer
Email: john.smith@email.com
Phone: +1-555-0199
Location: San Francisco, CA

EXPERIENCE
Senior Software Engineer | Google | 2020 - Present
- Developed scalable web applications using React and Node.js
- Led a team of 5 engineers in delivering critical product features
- Improved system performance by 40% through optimization

Software Engineer | Microsoft | 2018 - 2020
- Built RESTful APIs and microservices
- Collaborated with cross-functional teams

EDUCATION
BS Computer Science | Stanford University | 2018

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker
`;

    const cvResponse = await fetch('http://localhost:3000/api/test-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'parse-cv',
        content: testCV
      })
    });

    if (cvResponse.ok) {
      const cvResult = await cvResponse.json();
      const cvTime = Date.now() - cvParseStart;
      console.log(`✅ CV parsed in ${cvTime}ms`);
      console.log(`📋 Extracted: ${cvResult.data?.firstName || 'N/A'} ${cvResult.data?.lastName || 'N/A'}`);
    }
  } catch (error) {
    console.log('❌ CV parsing error:', error.message);
  }

  console.log('\n🎯 Performance test completed!');
}

testPDFGeneration().catch(console.error); 