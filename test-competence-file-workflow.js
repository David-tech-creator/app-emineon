#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_FILES = [
  { name: 'test-resume.txt', type: 'text/plain', description: 'Plain Text Resume' },
  { name: 'test-resume.md', type: 'text/markdown', description: 'Markdown Resume' },
  { name: 'test-resume.html', type: 'text/html', description: 'HTML Resume' }
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testHealthCheck() {
  log('\n🏥 Testing Health Check...', 'blue');
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.success) {
    log('✅ Health check passed', 'green');
    return true;
  } else {
    log('❌ Health check failed', 'red');
    return false;
  }
}

async function testDocumentParsing(file) {
  log(`\n📄 Testing ${file.description} (${file.name})...`, 'blue');
  
  if (!fs.existsSync(file.name)) {
    log(`❌ Test file ${file.name} not found`, 'red');
    return false;
  }

  try {
    // Create FormData equivalent for node-fetch
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    form.append('file', fs.createReadStream(file.name));

    const result = await makeRequest(`${BASE_URL}/api/competence-files/parse-resume`, {
      method: 'POST',
      body: form
    });

    if (result.success && result.data.success) {
      log('✅ Document parsing successful', 'green');
      log(`   📝 Extracted: ${result.data.data.fullName}`, 'yellow');
      log(`   💼 Title: ${result.data.data.currentTitle}`, 'yellow');
      log(`   📧 Email: ${result.data.data.email}`, 'yellow');
      log(`   🎯 Skills: ${result.data.data.skills.slice(0, 3).join(', ')}...`, 'yellow');
      return result.data.data;
    } else {
      log('❌ Document parsing failed', 'red');
      log(`   Error: ${result.data?.message || result.error}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Document parsing error: ${error.message}`, 'red');
    return false;
  }
}

async function testCompetenceFileGeneration(candidateData) {
  log('\n📋 Testing Competence File Generation...', 'blue');
  
  const testData = {
    candidateData: {
      ...candidateData,
      id: `test_${Date.now()}`,
      summary: candidateData.summary || 'Test candidate for competence file generation'
    },
    format: 'pdf'
  };

  const result = await makeRequest(`${BASE_URL}/api/competence-files/test-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  });

  if (result.success && result.data.success) {
    log('✅ Competence file generation successful', 'green');
    log(`   📄 File URL: ${result.data.data.fileUrl}`, 'yellow');
    log(`   📏 File Size: ${(result.data.data.fileSize / 1024).toFixed(1)} KB`, 'yellow');
    return result.data.data;
  } else {
    log('❌ Competence file generation failed', 'red');
    log(`   Error: ${result.data?.message || result.error}`, 'red');
    return false;
  }
}

async function testLinkedInParsing() {
  log('\n🔗 Testing LinkedIn Parsing...', 'blue');
  
  const linkedinText = `
John Smith
Software Engineer at Google
San Francisco, CA

Experience:
• Software Engineer at Google (2020-Present)
  - Developed large-scale web applications
  - Led team of 3 junior developers
  - Implemented CI/CD pipelines

• Junior Developer at Startup Inc (2019-2020)
  - Built responsive web interfaces
  - Worked with REST APIs

Education:
• Stanford University - BS Computer Science (2015-2019)

Skills: JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes

Experienced software engineer with 5 years in full-stack development. 
Passionate about building scalable web applications using React, Node.js, and cloud technologies.
  `.trim();

  const result = await makeRequest(`${BASE_URL}/api/competence-files/parse-linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ linkedinText })
  });

  if (result.success && result.data.success) {
    log('✅ LinkedIn parsing successful', 'green');
    log(`   👤 Name: ${result.data.data.fullName}`, 'yellow');
    log(`   💼 Title: ${result.data.data.currentTitle}`, 'yellow');
    log(`   📍 Location: ${result.data.data.location}`, 'yellow');
    return result.data.data;
  } else {
    log('❌ LinkedIn parsing failed', 'red');
    log(`   Error: ${result.data?.message || result.error}`, 'red');
    return false;
  }
}

async function runFullWorkflowTest() {
  log('🚀 Starting Competence File Modal Full Workflow Test', 'bold');
  log('=' * 60, 'blue');

  // Test 1: Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    log('\n❌ Cannot proceed - server not healthy', 'red');
    return;
  }

  // Test 2: Document Parsing for each format
  const parsedCandidates = [];
  for (const file of TEST_FILES) {
    const candidateData = await testDocumentParsing(file);
    if (candidateData) {
      parsedCandidates.push({ file: file.name, data: candidateData });
    }
  }

  // Test 3: LinkedIn Parsing
  const linkedinCandidate = await testLinkedInParsing();
  if (linkedinCandidate) {
    parsedCandidates.push({ file: 'linkedin', data: linkedinCandidate });
  }

  // Test 4: Competence File Generation for each parsed candidate
  const generatedFiles = [];
  for (const candidate of parsedCandidates) {
    log(`\n📋 Generating competence file for candidate from ${candidate.file}...`, 'blue');
    const fileData = await testCompetenceFileGeneration(candidate.data);
    if (fileData) {
      generatedFiles.push({ source: candidate.file, file: fileData });
    }
  }

  // Summary
  log('\n📊 TEST SUMMARY', 'bold');
  log('=' * 40, 'blue');
  log(`✅ Documents parsed successfully: ${parsedCandidates.length}/${TEST_FILES.length + 1}`, 'green');
  log(`✅ Competence files generated: ${generatedFiles.length}/${parsedCandidates.length}`, 'green');
  
  if (generatedFiles.length > 0) {
    log('\n📄 Generated Files:', 'yellow');
    generatedFiles.forEach(item => {
      log(`   • ${item.source}: ${item.file.fileName}`, 'yellow');
      log(`     URL: ${item.file.fileUrl}`, 'yellow');
    });
  }

  const successRate = ((generatedFiles.length / (TEST_FILES.length + 1)) * 100).toFixed(1);
  log(`\n🎯 Overall Success Rate: ${successRate}%`, successRate > 80 ? 'green' : 'yellow');
  
  if (successRate === '100.0') {
    log('\n🎉 ALL TESTS PASSED! The competence file modal workflow is fully functional.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', 'yellow');
  }
}

// Run the test
runFullWorkflowTest().catch(error => {
  log(`\n💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
}); 