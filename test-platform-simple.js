#!/usr/bin/env node

/**
 * Simple Platform Testing Script
 * Tests basic functionality without authentication
 */

const BASE_URL = 'http://localhost:3000';

// Test CV content
const testCVContent = `
John Developer
Senior Software Engineer
Email: john.developer@email.com
Phone: +1-555-0123
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing scalable web applications.
Expertise in React, Node.js, and cloud technologies.

EXPERIENCE
Senior Software Engineer at TechCorp (2020-Present)
- Led development of microservices architecture serving 1M+ users
- Managed team of 5 developers
- Implemented CI/CD pipelines reducing deployment time by 60%
- Technologies: React, Node.js, AWS, Docker, Kubernetes

Software Engineer at StartupXYZ (2018-2020)
- Built React applications with 99.9% uptime
- Developed REST APIs handling 10K+ requests/minute
- Technologies: JavaScript, React, Express.js, MongoDB

EDUCATION
Bachelor of Computer Science, MIT (2018)
GPA: 3.8/4.0

SKILLS
Technical: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, MongoDB, PostgreSQL
Soft Skills: Team Leadership, Project Management, Agile Development, Problem Solving

CERTIFICATIONS
- AWS Certified Solutions Architect
- Certified Kubernetes Administrator (CKA)
`;

const testLinkedInUrls = [
  'https://linkedin.com/in/john-doe-developer',
  'https://www.linkedin.com/in/jane-smith-pm',
  'https://linkedin.com/in/alex-chen-devops'
];

class SimplePlatformTester {
  constructor() {
    this.results = {
      health: null,
      cvParsing: [],
      linkedinParsing: [],
      publicEndpoints: [],
      errors: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();
      return { status: response.status, data, ok: response.ok };
    } catch (error) {
      this.results.errors.push({ endpoint, error: error.message });
      throw error;
    }
  }

  async testHealthEndpoint() {
    this.log('🏥 Testing Health Endpoint...');
    
    try {
      const result = await this.makeRequest('/api/health');
      
      if (result.ok && result.data.success) {
        this.log('✅ Health endpoint working correctly', 'success');
        this.log(`   - Status: ${result.data.status}`);
        this.log(`   - Database: ${result.data.services.database}`);
        this.log(`   - API: ${result.data.services.api}`);
        
        this.results.health = {
          success: true,
          status: result.data.status,
          services: result.data.services,
          features: Object.keys(result.data.features).length
        };
      } else {
        this.log('❌ Health endpoint failed', 'error');
        this.results.health = { success: false, error: result.data.error };
      }
    } catch (error) {
      this.log(`❌ Error testing health endpoint: ${error.message}`, 'error');
      this.results.health = { success: false, error: error.message };
    }
  }

  async testCVParsing() {
    this.log('📄 Testing CV Parsing...');

    try {
      // Create a test file blob
      const blob = new Blob([testCVContent], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('cv', blob, 'test-cv.txt');

      const result = await this.makeRequest('/api/candidates/parse-cv', {
        method: 'POST',
        body: formData,
        headers: {} // Remove Content-Type to let browser set it for FormData
      });

      if (result.ok && result.data.success) {
        const parsedData = result.data.data;
        this.log('✅ CV parsed successfully', 'success');
        this.log(`   - Name: ${parsedData.firstName || 'N/A'} ${parsedData.lastName || 'N/A'}`);
        this.log(`   - Email: ${parsedData.email || 'N/A'}`);
        this.log(`   - Title: ${parsedData.currentTitle || 'N/A'}`);
        this.log(`   - Experience: ${parsedData.experienceYears || 'N/A'} years`);
        this.log(`   - Skills: ${parsedData.technicalSkills?.length || 0} technical skills found`);
        this.log(`   - Education: ${parsedData.degrees?.length || 0} degrees found`);
        
        this.results.cvParsing.push({
          success: true,
          parsedData: {
            name: `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
            email: parsedData.email,
            title: parsedData.currentTitle,
            experience: parsedData.experienceYears,
            skillsCount: parsedData.technicalSkills?.length || 0,
            educationCount: parsedData.degrees?.length || 0
          }
        });
      } else {
        this.log(`❌ CV parsing failed: ${result.data.error || 'Unknown error'}`, 'error');
        this.results.cvParsing.push({
          success: false,
          error: result.data.error || 'Unknown error'
        });
      }
    } catch (error) {
      this.log(`❌ Error in CV parsing test: ${error.message}`, 'error');
      this.results.cvParsing.push({
        success: false,
        error: error.message
      });
    }
  }

  async testLinkedInParsing() {
    this.log('🔗 Testing LinkedIn URL Parsing...');

    for (const linkedinUrl of testLinkedInUrls) {
      try {
        const result = await this.makeRequest('/api/candidates/parse-linkedin', {
          method: 'POST',
          body: JSON.stringify({ linkedinUrl })
        });

        if (result.ok && result.data.success) {
          const parsedData = result.data.data;
          this.log(`✅ LinkedIn profile parsed: ${linkedinUrl}`, 'success');
          this.log(`   - Name: ${parsedData.firstName || 'N/A'} ${parsedData.lastName || 'N/A'}`);
          this.log(`   - Title: ${parsedData.currentTitle || 'N/A'}`);
          this.log(`   - Location: ${parsedData.currentLocation || 'N/A'}`);
          
          this.results.linkedinParsing.push({
            url: linkedinUrl,
            success: true,
            parsedData: {
              name: `${parsedData.firstName || ''} ${parsedData.lastName || ''}`.trim(),
              title: parsedData.currentTitle,
              location: parsedData.currentLocation
            }
          });
        } else {
          this.log(`❌ LinkedIn parsing failed for ${linkedinUrl}: ${result.data.error || 'Unknown error'}`, 'error');
          this.results.linkedinParsing.push({
            url: linkedinUrl,
            success: false,
            error: result.data.error || 'Unknown error'
          });
        }
      } catch (error) {
        this.log(`❌ Error parsing LinkedIn URL ${linkedinUrl}: ${error.message}`, 'error');
        this.results.linkedinParsing.push({
          url: linkedinUrl,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testPublicEndpoints() {
    this.log('🌐 Testing Public Endpoints...');

    const publicEndpoints = [
      { path: '/api/public/jobs', description: 'Public jobs listing' },
      { path: '/api/apply', method: 'POST', description: 'Job application endpoint', 
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          jobId: 'job-1-senior-fullstack',
          source: 'Test'
        }
      }
    ];

    for (const endpoint of publicEndpoints) {
      try {
        const options = {
          method: endpoint.method || 'GET'
        };

        if (endpoint.body) {
          options.body = JSON.stringify(endpoint.body);
        }

        const result = await this.makeRequest(endpoint.path, options);

        if (result.ok || (result.status === 409 && endpoint.path === '/api/apply')) {
          // 409 for job application means "already applied" - this is a success case
          const statusMessage = result.status === 409 ? 'Working (duplicate application prevented)' : 'Working';
          this.log(`✅ ${endpoint.description}: ${statusMessage}`, 'success');
          this.results.publicEndpoints.push({
            path: endpoint.path,
            description: endpoint.description,
            success: true,
            status: result.status
          });
        } else {
          this.log(`⚠️ ${endpoint.description}: ${result.status} - ${result.data.error || 'Error'}`, 'error');
          this.results.publicEndpoints.push({
            path: endpoint.path,
            description: endpoint.description,
            success: false,
            status: result.status,
            error: result.data.error
          });
        }
      } catch (error) {
        this.log(`❌ Error testing ${endpoint.description}: ${error.message}`, 'error');
        this.results.publicEndpoints.push({
          path: endpoint.path,
          description: endpoint.description,
          success: false,
          error: error.message
        });
      }
    }
  }

  generateReport() {
    this.log('\n📊 TEST RESULTS SUMMARY');
    this.log('='.repeat(50));

    // Health Check
    const healthStatus = this.results.health?.success ? '✅' : '❌';
    this.log(`\n🏥 Health Check: ${healthStatus} ${this.results.health?.success ? 'PASSED' : 'FAILED'}`);

    // CV Parsing Results
    const cvSuccess = this.results.cvParsing.filter(r => r.success).length;
    const cvTotal = this.results.cvParsing.length;
    this.log(`📄 CV Parsing: ${cvSuccess}/${cvTotal} successful`);

    // LinkedIn Parsing Results
    const linkedinSuccess = this.results.linkedinParsing.filter(r => r.success).length;
    const linkedinTotal = this.results.linkedinParsing.length;
    this.log(`🔗 LinkedIn Parsing: ${linkedinSuccess}/${linkedinTotal} successful`);

    // Public Endpoints
    const publicSuccess = this.results.publicEndpoints.filter(r => r.success).length;
    const publicTotal = this.results.publicEndpoints.length;
    this.log(`🌐 Public Endpoints: ${publicSuccess}/${publicTotal} working`);

    // Overall Success Rate
    const totalSuccess = (this.results.health?.success ? 1 : 0) + cvSuccess + linkedinSuccess + publicSuccess;
    const totalTests = 1 + cvTotal + linkedinTotal + publicTotal;
    const successRate = totalTests > 0 ? ((totalSuccess / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`\n🎯 Overall Success Rate: ${successRate}% (${totalSuccess}/${totalTests})`);

    // Feature Analysis
    if (this.results.cvParsing.length > 0 && this.results.cvParsing[0].success) {
      const cvData = this.results.cvParsing[0].parsedData;
      this.log(`\n📋 CV Parsing Analysis:`);
      this.log(`   - Name extraction: ${cvData.name ? '✅' : '❌'}`);
      this.log(`   - Email extraction: ${cvData.email ? '✅' : '❌'}`);
      this.log(`   - Title extraction: ${cvData.title ? '✅' : '❌'}`);
      this.log(`   - Skills extraction: ${cvData.skillsCount > 0 ? '✅' : '❌'} (${cvData.skillsCount} found)`);
      this.log(`   - Education extraction: ${cvData.educationCount > 0 ? '✅' : '❌'} (${cvData.educationCount} found)`);
    }

    // Error Summary
    if (this.results.errors.length > 0) {
      this.log(`\n❌ Errors Encountered: ${this.results.errors.length}`);
      this.results.errors.forEach(error => {
        console.log(`   - ${error.endpoint}: ${error.error}`);
      });
    }

    return {
      successRate: parseFloat(successRate),
      totalTests,
      totalSuccess,
      details: this.results
    };
  }

  async runAllTests() {
    this.log('🚀 Starting Simple Platform Testing...\n');

    try {
      // Test health endpoint first
      await this.testHealthEndpoint();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test CV parsing
      await this.testCVParsing();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test LinkedIn parsing
      await this.testLinkedInParsing();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test public endpoints
      await this.testPublicEndpoints();

      // Generate final report
      const report = this.generateReport();
      
      return report;
    } catch (error) {
      this.log(`❌ Critical error during testing: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SimplePlatformTester();
  tester.runAllTests()
    .then(report => {
      console.log('\n✅ Testing completed!');
      console.log(`Final Score: ${report.successRate}%`);
      process.exit(report.successRate > 70 ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = SimplePlatformTester; 