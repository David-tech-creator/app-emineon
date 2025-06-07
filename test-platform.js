#!/usr/bin/env node

/**
 * Comprehensive Platform Testing Script
 * Tests candidate search, CV parsing, and LinkedIn URL parsing
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testCandidates = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    currentTitle: 'Senior Software Engineer',
    technicalSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    experienceYears: 5,
    source: 'Test Data',
    tags: ['Frontend', 'Senior', 'React Expert']
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    currentTitle: 'Product Manager',
    technicalSkills: ['Product Strategy', 'Agile', 'Analytics'],
    experienceYears: 7,
    source: 'Test Data',
    tags: ['Product', 'Leadership', 'Senior']
  },
  {
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@example.com',
    currentTitle: 'DevOps Engineer',
    technicalSkills: ['Docker', 'Kubernetes', 'AWS', 'Python'],
    experienceYears: 4,
    source: 'Test Data',
    tags: ['DevOps', 'Cloud', 'AWS']
  }
];

const testCVContent = `
John Developer
Software Engineer
Email: john.developer@email.com
Phone: +1-555-0123

EXPERIENCE
Senior Software Engineer at TechCorp (2020-Present)
- Led development of microservices architecture
- Managed team of 5 developers
- Implemented CI/CD pipelines

Software Engineer at StartupXYZ (2018-2020)
- Built React applications
- Developed REST APIs

EDUCATION
Bachelor of Computer Science, MIT (2018)

SKILLS
JavaScript, React, Node.js, Python, AWS, Docker, Kubernetes
`;

const testLinkedInUrls = [
  'https://linkedin.com/in/john-doe',
  'https://www.linkedin.com/in/jane-smith',
  'https://linkedin.com/in/alex-chen-dev'
];

class PlatformTester {
  constructor() {
    this.results = {
      candidateCreation: [],
      candidateSearch: [],
      cvParsing: [],
      linkedinParsing: [],
      errors: []
    };
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
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

  async testCandidateCreation() {
    await this.log('🧪 Testing Candidate Creation...');
    
    for (const candidate of testCandidates) {
      try {
        const result = await this.makeRequest('/api/candidates', {
          method: 'POST',
          body: JSON.stringify(candidate)
        });

        if (result.ok) {
          await this.log(`✅ Created candidate: ${candidate.firstName} ${candidate.lastName}`, 'success');
          this.results.candidateCreation.push({
            candidate: `${candidate.firstName} ${candidate.lastName}`,
            success: true,
            id: result.data.data?.candidate?.id
          });
        } else {
          await this.log(`❌ Failed to create candidate: ${candidate.firstName} ${candidate.lastName} - ${result.data.error}`, 'error');
          this.results.candidateCreation.push({
            candidate: `${candidate.firstName} ${candidate.lastName}`,
            success: false,
            error: result.data.error
          });
        }
      } catch (error) {
        await this.log(`❌ Error creating candidate ${candidate.firstName} ${candidate.lastName}: ${error.message}`, 'error');
        this.results.candidateCreation.push({
          candidate: `${candidate.firstName} ${candidate.lastName}`,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testCandidateSearch() {
    await this.log('🔍 Testing Candidate Search...');

    const searchTests = [
      { query: '', description: 'Empty search (should return all)' },
      { query: 'John', description: 'Search by first name' },
      { query: 'Software Engineer', description: 'Search by title' },
      { query: 'React', description: 'Search by skill' },
      { query: 'TechCorp', description: 'Search by company' },
      { query: 'nonexistent', description: 'Search for non-existent term' }
    ];

    for (const test of searchTests) {
      try {
        const params = new URLSearchParams();
        if (test.query) params.append('search', test.query);

        const result = await this.makeRequest(`/api/candidates?${params.toString()}`);

        if (result.ok) {
          const count = result.data.data?.length || 0;
          await this.log(`✅ ${test.description}: Found ${count} candidates`, 'success');
          this.results.candidateSearch.push({
            test: test.description,
            query: test.query,
            success: true,
            count
          });
        } else {
          await this.log(`❌ ${test.description}: ${result.data.error}`, 'error');
          this.results.candidateSearch.push({
            test: test.description,
            query: test.query,
            success: false,
            error: result.data.error
          });
        }
      } catch (error) {
        await this.log(`❌ Error in search test "${test.description}": ${error.message}`, 'error');
        this.results.candidateSearch.push({
          test: test.description,
          query: test.query,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testCVParsing() {
    await this.log('📄 Testing CV Parsing...');

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

      if (result.ok) {
        const parsedData = result.data.data;
        await this.log(`✅ CV parsed successfully`, 'success');
        await this.log(`   - Name: ${parsedData.firstName} ${parsedData.lastName}`);
        await this.log(`   - Email: ${parsedData.email}`);
        await this.log(`   - Title: ${parsedData.currentTitle}`);
        await this.log(`   - Skills: ${parsedData.technicalSkills?.join(', ') || 'None'}`);
        
        this.results.cvParsing.push({
          success: true,
          parsedData: {
            name: `${parsedData.firstName} ${parsedData.lastName}`,
            email: parsedData.email,
            title: parsedData.currentTitle,
            skillsCount: parsedData.technicalSkills?.length || 0
          }
        });
      } else {
        await this.log(`❌ CV parsing failed: ${result.data.error}`, 'error');
        this.results.cvParsing.push({
          success: false,
          error: result.data.error
        });
      }
    } catch (error) {
      await this.log(`❌ Error in CV parsing test: ${error.message}`, 'error');
      this.results.cvParsing.push({
        success: false,
        error: error.message
      });
    }
  }

  async testLinkedInParsing() {
    await this.log('🔗 Testing LinkedIn URL Parsing...');

    for (const linkedinUrl of testLinkedInUrls) {
      try {
        const result = await this.makeRequest('/api/candidates/parse-linkedin', {
          method: 'POST',
          body: JSON.stringify({ linkedinUrl })
        });

        if (result.ok) {
          const parsedData = result.data.data;
          await this.log(`✅ LinkedIn profile parsed: ${linkedinUrl}`, 'success');
          await this.log(`   - Name: ${parsedData.firstName} ${parsedData.lastName}`);
          await this.log(`   - Title: ${parsedData.currentTitle}`);
          await this.log(`   - Company: ${parsedData.currentCompany}`);
          
          this.results.linkedinParsing.push({
            url: linkedinUrl,
            success: true,
            parsedData: {
              name: `${parsedData.firstName} ${parsedData.lastName}`,
              title: parsedData.currentTitle,
              company: parsedData.currentCompany
            }
          });
        } else {
          await this.log(`❌ LinkedIn parsing failed for ${linkedinUrl}: ${result.data.error}`, 'error');
          this.results.linkedinParsing.push({
            url: linkedinUrl,
            success: false,
            error: result.data.error
          });
        }
      } catch (error) {
        await this.log(`❌ Error parsing LinkedIn URL ${linkedinUrl}: ${error.message}`, 'error');
        this.results.linkedinParsing.push({
          url: linkedinUrl,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testAdvancedSearch() {
    await this.log('🎯 Testing Advanced Search Features...');

    const advancedTests = [
      { 
        params: { status: 'NEW' }, 
        description: 'Filter by status' 
      },
      { 
        params: { skills: 'React,JavaScript' }, 
        description: 'Filter by multiple skills' 
      },
      { 
        params: { source: 'Test Data' }, 
        description: 'Filter by source' 
      },
      { 
        params: { search: 'Engineer', status: 'NEW' }, 
        description: 'Combined search and filter' 
      }
    ];

    for (const test of advancedTests) {
      try {
        const params = new URLSearchParams();
        Object.entries(test.params).forEach(([key, value]) => {
          params.append(key, value);
        });

        const result = await this.makeRequest(`/api/candidates?${params.toString()}`);

        if (result.ok) {
          const count = result.data.data?.length || 0;
          await this.log(`✅ ${test.description}: Found ${count} candidates`, 'success');
        } else {
          await this.log(`❌ ${test.description}: ${result.data.error}`, 'error');
        }
      } catch (error) {
        await this.log(`❌ Error in advanced search "${test.description}": ${error.message}`, 'error');
      }
    }
  }

  async generateReport() {
    await this.log('\n📊 TEST RESULTS SUMMARY');
    await this.log('=' * 50);

    // Candidate Creation Results
    const creationSuccess = this.results.candidateCreation.filter(r => r.success).length;
    const creationTotal = this.results.candidateCreation.length;
    await this.log(`\n👥 Candidate Creation: ${creationSuccess}/${creationTotal} successful`);

    // Search Results
    const searchSuccess = this.results.candidateSearch.filter(r => r.success).length;
    const searchTotal = this.results.candidateSearch.length;
    await this.log(`🔍 Candidate Search: ${searchSuccess}/${searchTotal} successful`);

    // CV Parsing Results
    const cvSuccess = this.results.cvParsing.filter(r => r.success).length;
    const cvTotal = this.results.cvParsing.length;
    await this.log(`📄 CV Parsing: ${cvSuccess}/${cvTotal} successful`);

    // LinkedIn Parsing Results
    const linkedinSuccess = this.results.linkedinParsing.filter(r => r.success).length;
    const linkedinTotal = this.results.linkedinParsing.length;
    await this.log(`🔗 LinkedIn Parsing: ${linkedinSuccess}/${linkedinTotal} successful`);

    // Overall Success Rate
    const totalSuccess = creationSuccess + searchSuccess + cvSuccess + linkedinSuccess;
    const totalTests = creationTotal + searchTotal + cvTotal + linkedinTotal;
    const successRate = ((totalSuccess / totalTests) * 100).toFixed(1);
    
    await this.log(`\n🎯 Overall Success Rate: ${successRate}% (${totalSuccess}/${totalTests})`);

    // Error Summary
    if (this.results.errors.length > 0) {
      await this.log(`\n❌ Errors Encountered: ${this.results.errors.length}`);
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
    await this.log('🚀 Starting Comprehensive Platform Testing...\n');

    try {
      // Test candidate creation first
      await this.testCandidateCreation();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

      // Test search functionality
      await this.testCandidateSearch();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test advanced search
      await this.testAdvancedSearch();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test CV parsing
      await this.testCVParsing();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test LinkedIn parsing
      await this.testLinkedInParsing();

      // Generate final report
      const report = await this.generateReport();
      
      return report;
    } catch (error) {
      await this.log(`❌ Critical error during testing: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new PlatformTester();
  tester.runAllTests()
    .then(report => {
      console.log('\n✅ Testing completed!');
      process.exit(report.successRate > 80 ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Testing failed:', error.message);
      process.exit(1);
    });
}

module.exports = PlatformTester; 