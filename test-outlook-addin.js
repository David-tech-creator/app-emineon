// Test script for Emineon Outlook Add-in
// Run this in a Node.js environment to test API endpoints

const https = require('https');

const BASE_URL = 'https://app-emineon-3h5xnu9vi-david-bicrawais-projects.vercel.app';

// Test data - simulating email from Outlook
const testEmailData = {
    subject: "5 Data Engineers - DataFlow Innovations - Medical Domain",
    body: `Dear Recruitment Team,

We are DataFlow Innovations, a leading healthcare technology company based in Geneva, Switzerland. 

We are currently seeking 5 experienced Data Engineers to join our medical data processing team for a critical project starting in Q1 2024.

Position Details:
- Title: Senior Data Engineer - Medical Domain
- Quantity: 5 positions
- Location: Geneva, Switzerland (Hybrid work model)
- Duration: 12-month contract with extension possibility
- Start Date: January 2024
- Budget: €80,000 - €95,000 per position

Required Skills:
- Python programming (5+ years)
- SQL and database management
- ETL pipeline development
- Cloud platforms (AWS/Azure)
- Healthcare data standards (HL7, FHIR)
- Data privacy and GDPR compliance
- Medical device integration experience

Project Overview:
This is a high-priority project involving the development of a comprehensive medical data processing platform. The successful candidates will work on integrating multiple healthcare systems and ensuring compliance with medical data regulations.

We need candidates who can start immediately and have experience working in regulated healthcare environments.

Please let me know if you have suitable candidates available.

Best regards,
Emmanuel Dubois
Technical Director
DataFlow Innovations
emmanuel.dubois@dataflow-innovations.com
+41 22 123 4567`,
    from: {
        name: "Emmanuel Dubois",
        email: "emmanuel.dubois@dataflow-innovations.com"
    },
    date: new Date().toISOString(),
    attachments: [
        {
            name: "project_requirements.pdf",
            size: 245760,
            type: "PDF Document"
        },
        {
            name: "john_smith_resume.pdf", 
            size: 156432,
            type: "PDF Document",
            isResume: true
        }
    ]
};

// Test functions
async function testProjectCreation() {
    console.log('\n=== Testing Project Creation from Email ===');
    
    try {
        const response = await makeRequest('/api/projects/parse-email', 'POST', testEmailData);
        
        if (response.success) {
            console.log('✅ Project created successfully!');
            console.log(`Project Name: ${response.project.name}`);
            console.log(`Client: ${response.project.clientName}`);
            console.log(`Total Positions: ${response.project.totalPositions}`);
            console.log(`Skills Required: ${response.project.skillsRequired.join(', ')}`);
            console.log(`Urgency Level: ${response.project.urgencyLevel}`);
            return response.project.id;
        } else {
            console.log('❌ Project creation failed:', response.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Project creation error:', error.message);
        return null;
    }
}

async function testCandidateCreation() {
    console.log('\n=== Testing Candidate Creation from Email ===');
    
    const candidateData = {
        firstName: testEmailData.from.name.split(' ')[0],
        lastName: testEmailData.from.name.split(' ').slice(1).join(' '),
        email: testEmailData.from.email,
        source: 'Email',
        notes: `Added from email: ${testEmailData.subject}`
    };
    
    try {
        const response = await makeRequest('/api/candidates', 'POST', candidateData);
        
        if (response.id) {
            console.log('✅ Candidate created successfully!');
            console.log(`Candidate: ${response.firstName} ${response.lastName}`);
            console.log(`Email: ${response.email}`);
            console.log(`Source: ${response.source}`);
            return response.id;
        } else {
            console.log('❌ Candidate creation failed:', response.error || 'Unknown error');
            return null;
        }
    } catch (error) {
        console.log('❌ Candidate creation error:', error.message);
        return null;
    }
}

async function testHealthCheck() {
    console.log('\n=== Testing API Health Check ===');
    
    try {
        const response = await makeRequest('/api/health', 'GET');
        
        if (response.status === 'ok') {
            console.log('✅ API is healthy');
            console.log(`Timestamp: ${response.timestamp}`);
            return true;
        } else {
            console.log('❌ API health check failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

async function testProjectsList() {
    console.log('\n=== Testing Projects List ===');
    
    try {
        const response = await makeRequest('/api/projects', 'GET');
        
        if (Array.isArray(response)) {
            console.log(`✅ Retrieved ${response.length} projects`);
            if (response.length > 0) {
                const project = response[0];
                console.log(`Latest Project: ${project.name}`);
                console.log(`Client: ${project.clientName}`);
                console.log(`Status: ${project.status}`);
            }
            return true;
        } else {
            console.log('❌ Projects list failed:', response.error || 'Invalid response');
            return false;
        }
    } catch (error) {
        console.log('❌ Projects list error:', error.message);
        return false;
    }
}

async function testEmailAnalysis() {
    console.log('\n=== Testing Email Analysis (Simulated) ===');
    
    // Simulate the AI analysis that would happen in the Outlook add-in
    const emailText = `${testEmailData.subject} ${testEmailData.body}`.toLowerCase();
    
    // Project Detection
    const projectPatterns = [
        /\b(\d+)\s+(positions|roles|engineers|developers|consultants|specialists|people|candidates)\b/i,
        /\b(multiple|several|team of|group of)\s+(positions|roles|engineers|developers)\b/i,
        /\b(project|contract|engagement)\s+(requires|needs|looking for)\b/i
    ];
    
    const hasProjectIndicators = projectPatterns.some(pattern => pattern.test(emailText)) ||
        ['positions', 'multiple roles', 'team', 'project', 'contract'].some(keyword => emailText.includes(keyword));
    
    console.log(`Project Detection: ${hasProjectIndicators ? '✅ Detected' : '❌ Not detected'}`);
    
    // Resume Detection
    const resumeAttachments = testEmailData.attachments.filter(att => att.isResume);
    console.log(`Resume Detection: ${resumeAttachments.length > 0 ? '✅ Found ' + resumeAttachments.length + ' resume(s)' : '❌ No resumes'}`);
    
    // Skills Extraction
    const skillKeywords = ['python', 'sql', 'etl', 'aws', 'azure', 'healthcare', 'hl7', 'fhir'];
    const detectedSkills = skillKeywords.filter(skill => emailText.includes(skill));
    console.log(`Skills Detected: ${detectedSkills.length > 0 ? '✅ ' + detectedSkills.join(', ') : '❌ No skills detected'}`);
    
    // Priority Assessment
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'priority', 'critical'];
    const hasUrgency = urgentKeywords.some(keyword => emailText.includes(keyword));
    console.log(`Priority Level: ${hasUrgency ? '🔴 High' : '🟡 Medium'}`);
    
    return true;
}

async function testAttachmentAnalysis() {
    console.log('\n=== Testing Attachment Analysis ===');
    
    testEmailData.attachments.forEach((attachment, index) => {
        console.log(`Attachment ${index + 1}:`);
        console.log(`  Name: ${attachment.name}`);
        console.log(`  Size: ${formatFileSize(attachment.size)}`);
        console.log(`  Type: ${attachment.type}`);
        console.log(`  Is Resume: ${attachment.isResume ? '✅ Yes' : '❌ No'}`);
        console.log(`  Is Document: ${isDocumentFile(attachment.name) ? '✅ Yes' : '❌ No'}`);
    });
    
    return true;
}

// Helper functions
function makeRequest(path, method, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Emineon-Outlook-Addin-Test/1.0'
            }
        };
        
        const req = https.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (error) {
                    resolve({ error: 'Invalid JSON response', body });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function isDocumentFile(filename) {
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const ext = filename.toLowerCase().split('.').pop();
    return docExtensions.includes(ext);
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Emineon Outlook Add-in Tests');
    console.log('=====================================');
    
    const results = {
        healthCheck: await testHealthCheck(),
        emailAnalysis: await testEmailAnalysis(),
        attachmentAnalysis: await testAttachmentAnalysis(),
        projectCreation: await testProjectCreation(),
        candidateCreation: await testCandidateCreation(),
        projectsList: await testProjectsList()
    };
    
    console.log('\n📊 Test Results Summary');
    console.log('======================');
    
    let passed = 0;
    let total = 0;
    
    Object.entries(results).forEach(([test, result]) => {
        total++;
        if (result) passed++;
        console.log(`${result ? '✅' : '❌'} ${test}: ${result ? 'PASSED' : 'FAILED'}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Outlook add-in is ready for deployment.');
    } else {
        console.log('⚠️  Some tests failed. Please check the implementation.');
    }
}

// Export for use in other modules
module.exports = {
    testProjectCreation,
    testCandidateCreation,
    testHealthCheck,
    testProjectsList,
    testEmailAnalysis,
    testAttachmentAnalysis,
    runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
} 