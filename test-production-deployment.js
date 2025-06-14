#!/usr/bin/env node

/**
 * 🚀 PRODUCTION DEPLOYMENT TESTING SUITE
 * 
 * Comprehensive testing for Emineon ATS competence file functionality
 * Tests all endpoints with serverless Chromium PDF generation
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const PRODUCTION_URL = 'https://app-emineon-ev5r7gkyt-david-bicrawais-projects.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

// Test data
const TEST_CANDIDATE = {
  id: "prod-test-" + Date.now(),
  fullName: "Production Test User",
  currentTitle: "Senior Software Engineer",
  email: "test@production.com",
  phone: "+1 555-PROD-TEST",
  location: "Production City, Cloud",
  yearsOfExperience: 5,
  skills: ["JavaScript", "React", "Node.js", "Serverless", "Vercel", "Chromium"],
  certifications: ["AWS Certified", "Vercel Expert"],
  experience: [{
    company: "Production Corp",
    title: "Senior Engineer",
    startDate: "2020-01",
    endDate: "Present",
    responsibilities: "Testing production deployment with serverless PDF generation"
  }],
  education: ["BS Computer Science - Production University"],
  languages: ["English (Native)", "JavaScript (Fluent)"],
  summary: "Testing the production deployment of Emineon ATS with serverless Chromium PDF generation"
};

const LINKEDIN_TEST_DATA = `
Production Test User
Senior Software Engineer at Production Corp
Production City, Cloud

Experience:
• Senior Software Engineer at Production Corp (2020-Present)
  - Testing production deployment
  - Implementing serverless PDF generation
  - Verifying Chromium compatibility

• Junior Developer at Startup Inc (2018-2020)
  - Built web applications
  - Worked with cloud technologies

Education:
• Production University - BS Computer Science (2014-2018)

Skills: JavaScript, React, Node.js, Serverless, Vercel, Chromium

Testing the production deployment of serverless PDF generation...
`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : require('http');
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  log(`\n🧪 Testing ${name}...`, 'cyan');
  log(`📡 URL: ${url}`, 'blue');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(url, options);
    const duration = Date.now() - startTime;
    
    log(`⏱️  Response time: ${duration}ms`, 'yellow');
    log(`📊 Status: ${response.status}`, response.status === 200 ? 'green' : 'red');
    
    if (response.status === 200) {
      log(`✅ ${name} - SUCCESS`, 'green');
      if (response.data && typeof response.data === 'object') {
        if (response.data.data && response.data.data.fileUrl) {
          log(`🔗 File URL: ${response.data.data.fileUrl}`, 'blue');
        }
        if (response.data.message) {
          log(`💬 Message: ${response.data.message}`, 'cyan');
        }
      }
      return { success: true, response, duration };
    } else {
      log(`❌ ${name} - FAILED (${response.status})`, 'red');
      if (response.data) {
        log(`📝 Response: ${JSON.stringify(response.data, null, 2)}`, 'yellow');
      }
      return { success: false, response, duration };
    }
  } catch (error) {
    log(`💥 ${name} - ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runProductionTests() {
  log('🚀 EMINEON ATS PRODUCTION DEPLOYMENT TEST SUITE', 'bright');
  log('=' .repeat(60), 'cyan');
  log(`🌐 Testing production URL: ${PRODUCTION_URL}`, 'blue');
  log(`📅 Test started: ${new Date().toISOString()}`, 'yellow');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Health Check
  const healthTest = await testEndpoint(
    'Health Check',
    `${PRODUCTION_URL}/api/health`
  );
  results.tests.push({ name: 'Health Check', ...healthTest });
  results.total++;
  if (healthTest.success) results.passed++; else results.failed++;

  // Test 2: PDF Generation (Main Feature)
  const pdfTest = await testEndpoint(
    'PDF Generation (Serverless Chromium)',
    `${PRODUCTION_URL}/api/competence-files/test-generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        candidateData: TEST_CANDIDATE,
        format: 'pdf'
      })
    }
  );
  results.tests.push({ name: 'PDF Generation', ...pdfTest });
  results.total++;
  if (pdfTest.success) results.passed++; else results.failed++;

  // Test 3: LinkedIn Parsing
  const linkedinTest = await testEndpoint(
    'LinkedIn Parsing (OpenAI Responses API)',
    `${PRODUCTION_URL}/api/competence-files/test-linkedin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        linkedinText: LINKEDIN_TEST_DATA
      })
    }
  );
  results.tests.push({ name: 'LinkedIn Parsing', ...linkedinTest });
  results.total++;
  if (linkedinTest.success) results.passed++; else results.failed++;

  // Test 4: End-to-End Workflow (Parse → Generate → Upload)
  log('\n🔄 Testing End-to-End Workflow...', 'magenta');
  
  // First parse LinkedIn data
  const parseResult = await testEndpoint(
    'E2E: Parse LinkedIn',
    `${PRODUCTION_URL}/api/competence-files/test-linkedin`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        linkedinText: LINKEDIN_TEST_DATA
      })
    }
  );
  
  if (parseResult.success && parseResult.response.data && parseResult.response.data.candidateData) {
    // Then generate PDF from parsed data
    const generateResult = await testEndpoint(
      'E2E: Generate PDF from Parsed Data',
      `${PRODUCTION_URL}/api/competence-files/test-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          candidateData: parseResult.response.data.candidateData,
          format: 'pdf'
        })
      }
    );
    
    results.tests.push({ name: 'E2E Workflow', success: generateResult.success, ...generateResult });
    results.total++;
    if (generateResult.success) results.passed++; else results.failed++;
  } else {
    log('❌ E2E Workflow - FAILED (Parse step failed)', 'red');
    results.tests.push({ name: 'E2E Workflow', success: false, error: 'Parse step failed' });
    results.total++;
    results.failed++;
  }

  // Final Results
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 PRODUCTION TEST RESULTS', 'bright');
  log('='.repeat(60), 'cyan');
  
  log(`📈 Total Tests: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`📊 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`, 
      results.passed === results.total ? 'green' : 'yellow');

  // Detailed Results
  log('\n📋 DETAILED RESULTS:', 'cyan');
  results.tests.forEach((test, index) => {
    const status = test.success ? '✅' : '❌';
    const duration = test.duration ? ` (${test.duration}ms)` : '';
    log(`${index + 1}. ${status} ${test.name}${duration}`, test.success ? 'green' : 'red');
    
    if (!test.success && test.error) {
      log(`   Error: ${test.error}`, 'red');
    }
  });

  // Production Status
  log('\n🏭 PRODUCTION STATUS:', 'magenta');
  if (results.passed === results.total) {
    log('🎉 ALL SYSTEMS OPERATIONAL - PRODUCTION READY!', 'green');
    log('✅ Serverless Chromium PDF generation working', 'green');
    log('✅ OpenAI Responses API integration working', 'green');
    log('✅ Cloudinary file upload working', 'green');
    log('✅ End-to-end workflow operational', 'green');
  } else if (results.passed > 0) {
    log('⚠️  PARTIAL FUNCTIONALITY - SOME ISSUES DETECTED', 'yellow');
    log(`✅ ${results.passed}/${results.total} features working`, 'yellow');
  } else {
    log('🚨 CRITICAL ISSUES - DEPLOYMENT NEEDS ATTENTION', 'red');
  }

  log(`\n📅 Test completed: ${new Date().toISOString()}`, 'yellow');
  log('🔗 Production URL: ' + PRODUCTION_URL, 'blue');
  
  return results;
}

// Run the tests
if (require.main === module) {
  runProductionTests().catch(error => {
    log(`💥 Test suite failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runProductionTests, testEndpoint }; 