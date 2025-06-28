const fs = require('fs');

const testData = {
  id: "test-user",
  fullName: "Test User",
  currentTitle: "Senior Consultant", 
  email: "test@example.com",
  phone: "+1-555-0123",
  location: "Test City",
  yearsOfExperience: 5,
  summary: "Test summary for debugging",
  skills: ["Leadership", "Strategy", "Analysis"],
  experience: [{
    company: "Test Company",
    title: "Consultant",
    startDate: "2020",
    endDate: "Present",
    responsibilities: "Test responsibilities"
  }],
  education: ["Test Education"],
  certifications: ["Test Cert"],
  languages: ["English"]
};

async function debugPDFGeneration() {
  console.log('🔍 Debugging Antaes PDF generation in production...\n');

  // Test Antaes template
  console.log('📊 Testing Antaes template with direct HTML generation...');
  try {
    const htmlResponse = await fetch('https://app-emineon.vercel.app/api/competence-files/antaes-preview');
    
    if (htmlResponse.ok) {
      const htmlContent = await htmlResponse.text();
      console.log(`✅ Antaes HTML preview generated: ${htmlContent.length} characters`);
      
      // Check if it's actual HTML or redirect
      if (htmlContent.includes('<!DOCTYPE html>') && !htmlContent.includes('sign-in')) {
        console.log('✅ Valid HTML content received');
        fs.writeFileSync('antaes-preview.html', htmlContent);
        console.log('💾 HTML saved to antaes-preview.html');
      } else {
        console.log('❌ Received redirect or invalid content');
        console.log('First 200 chars:', htmlContent.substring(0, 200));
      }
    } else {
      console.log(`❌ HTML preview failed: ${htmlResponse.status}`);
    }
  } catch (error) {
    console.log('❌ HTML preview error:', error.message);
  }

  // Test Emineon template for comparison
  console.log('\n📊 Testing Emineon template for comparison...');
  try {
    const emineonResponse = await fetch('https://app-emineon.vercel.app/api/competence-files/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateData: testData,
        template: 'emineon',
        format: 'pdf'
      })
    });

    console.log(`Emineon response status: ${emineonResponse.status}`);
    console.log('Emineon response headers:', Object.fromEntries(emineonResponse.headers.entries()));
    
    if (emineonResponse.ok) {
      const buffer = await emineonResponse.arrayBuffer();
      fs.writeFileSync('debug-emineon.pdf', Buffer.from(buffer));
      console.log(`✅ Emineon response saved: ${buffer.byteLength} bytes`);
    }
  } catch (error) {
    console.log('❌ Emineon test error:', error.message);
  }

  // Test Antaes template
  console.log('\n📊 Testing Antaes template...');
  try {
    const antaesResponse = await fetch('https://app-emineon.vercel.app/api/competence-files/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidateData: testData,
        template: 'antaes',
        format: 'pdf'
      })
    });

    console.log(`Antaes response status: ${antaesResponse.status}`);
    console.log('Antaes response headers:', Object.fromEntries(antaesResponse.headers.entries()));
    
    if (antaesResponse.ok) {
      const buffer = await antaesResponse.arrayBuffer();
      fs.writeFileSync('debug-antaes.pdf', Buffer.from(buffer));
      console.log(`✅ Antaes response saved: ${buffer.byteLength} bytes`);
    }
  } catch (error) {
    console.log('❌ Antaes test error:', error.message);
  }

  console.log('\n🔍 Debug completed! Check the generated files.');
}

debugPDFGeneration().catch(console.error); 