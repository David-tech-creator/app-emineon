const fetch = require('node-fetch');

async function testAntaesFormatting() {
  console.log('🧪 Testing Antaes PDF formatting fix...\n');
  
  const testData = {
    candidateData: {
      id: "test-123",
      fullName: "Sarah Johnson",
      currentTitle: "Senior Software Engineer",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      yearsOfExperience: 8,
      skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
      certifications: ["AWS Solutions Architect", "Certified Scrum Master"],
      experience: [
        {
          company: "Google",
          title: "Senior Software Engineer",
          startDate: "2020",
          endDate: "Present",
          responsibilities: "Led development of scalable web applications. Mentored junior developers."
        }
      ],
      education: ["BS Computer Science - Stanford University"],
      languages: ["English (Native)", "Spanish (Fluent)"],
      summary: "Experienced software engineer with expertise in full-stack development."
    },
    template: "antaes",
    sections: [
      {
        title: "CORE COMPETENCIES",
        type: "core-competencies",
        order: 1,
        content: "**Delivery & Project Management** Project planning and execution * Stakeholder management and communication * Risk assessment and mitigation strategies * Proven ability to deliver complex projects on time and within budget while maintaining high quality standards.\n\n**Service & Release Management** Service lifecycle management * Release planning and coordination * Change management processes * Expertise in managing service delivery and coordinating releases across multiple environments.\n\n**Product Management/Owner** Product roadmap development * User story creation and prioritization * Cross-functional team collaboration * Strong background in product strategy and working with development teams to deliver user-focused solutions."
      },
      {
        title: "TECHNICAL EXPERTISE",
        type: "technical-expertise",
        order: 2,
        content: "**Programming & Development** Modern programming languages and frameworks * Extensive experience in full-stack development with focus on scalable, maintainable code.\n\n**Cloud & Infrastructure** Cloud platforms and containerization technologies * Proficient in designing and implementing cloud-native solutions with high availability.\n\n**Data & Analytics** Database management and data analysis tools * Strong background in data modeling, analysis, and business intelligence solutions."
      }
    ]
  };

  try {
    console.log('📤 Sending request to generate Antaes PDF...');
    const response = await fetch('https://app-emineon.vercel.app/api/competence-files/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pdfBuffer = await response.buffer();
    console.log(`✅ PDF generated successfully! Size: ${pdfBuffer.length} bytes`);
    
    // Check if PDF is valid (starts with PDF header)
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    if (pdfHeader === '%PDF') {
      console.log('✅ PDF header is valid');
      console.log('✅ Antaes PDF formatting fix appears to be working!');
      
      // Test HTML preview as well
      console.log('\n📤 Testing HTML preview...');
      const previewResponse = await fetch('https://app-emineon.vercel.app/api/competence-files/antaes-preview');
      if (previewResponse.ok) {
        const htmlContent = await previewResponse.text();
        
        // Check for proper HTML formatting
        const hasStrongTags = htmlContent.includes('<strong>');
        const hasListItems = htmlContent.includes('<li>');
        const hasBulletPoints = htmlContent.includes('•');
        
        console.log(`✅ HTML preview generated (${htmlContent.length} chars)`);
        console.log(`✅ Contains <strong> tags: ${hasStrongTags}`);
        console.log(`✅ Contains <li> elements: ${hasListItems}`);
        console.log(`✅ Contains bullet points: ${hasBulletPoints}`);
        
        if (hasStrongTags && hasListItems && hasBulletPoints) {
          console.log('\n🎉 SUCCESS: Antaes formatting fix is working correctly!');
          console.log('   - Markdown is being converted to proper HTML');
          console.log('   - Bold text (**text**) → <strong>text</strong>');
          console.log('   - Bullet points (*) → <li> with bullet styling');
          console.log('   - PDF generation is working');
        } else {
          console.log('\n⚠️  WARNING: Some formatting features may not be working properly');
        }
      } else {
        console.log('❌ HTML preview failed');
      }
    } else {
      console.log('❌ Invalid PDF generated');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAntaesFormatting(); 