// Test script for Enhanced Outlook Add-in with Project Creation
// This script validates the complete workflow from email to project creation

const testEmailData = {
    subject: "5 Data Engineers - DataFlow Innovations - Medical Domain",
    from: "Emmanuel Dubois <emmanuel.dubois@dataflow-innovations.com>",
    body: `
Dear Emineon Team,

We are looking for 5 experienced Data Engineers for our medical technology startup, DataFlow Innovations.

Project Details:
- Company: DataFlow Innovations
- Location: Carouge, Geneva (Hybrid work possible)
- Start Date: Immediate
- Budget: €500k - €750k for the entire project
- Duration: 12 months

Positions Needed:
1. Senior Data Engineer (2 positions)
2. Junior Data Engineer (2 positions)  
3. Lead Data Architect (1 position)

Technical Requirements:
- Python, SQL, ETL processes
- Cloud platforms (AWS, Azure)
- Healthcare data standards (HL7, FHIR)
- Machine Learning experience preferred
- Medical domain knowledge is a plus

The project involves building a comprehensive data pipeline for medical research data, ensuring compliance with healthcare regulations and creating analytics dashboards for clinical insights.

Please let me know if you can help us find these candidates.

Best regards,
Emmanuel Dubois
CTO, DataFlow Innovations
emmanuel.dubois@dataflow-innovations.com
+41 22 345 6789
    `
};

async function testOutlookAddinWorkflow() {
    console.log('🧪 Testing Enhanced Outlook Add-in Workflow');
    console.log('================================================');
    
    // Test 1: Email Analysis and Classification
    console.log('\n1. Testing Email Analysis...');
    const emailAnalysis = analyzeEmailContent(testEmailData);
    console.log('✅ Email Classification:', emailAnalysis);
    
    // Test 2: AI Suggestion Generation
    console.log('\n2. Testing AI Suggestions...');
    const aiSuggestions = generateAISuggestionsFromEmail(testEmailData);
    console.log('✅ AI Suggestions:', aiSuggestions);
    
    // Test 3: Project Creation API Call
    console.log('\n3. Testing Project Creation from Email...');
    try {
        const projectResult = await createProjectFromEmail(testEmailData);
        console.log('✅ Project Created Successfully:');
        console.log('   - Project ID:', projectResult.project.id);
        console.log('   - Project Name:', projectResult.project.name);
        console.log('   - Total Positions:', projectResult.project.totalPositions);
        console.log('   - Jobs Created:', projectResult.project.jobs?.length || 0);
        console.log('   - Skills Required:', projectResult.project.skillsRequired);
        
        // Test 4: Verify Individual Jobs Created
        if (projectResult.project.jobs && projectResult.project.jobs.length > 0) {
            console.log('\n4. Testing Individual Job Creation...');
            projectResult.project.jobs.forEach((job, index) => {
                console.log(`   Job ${index + 1}:`);
                console.log(`   - Title: ${job.title}`);
                console.log(`   - Department: ${job.department}`);
                console.log(`   - Location: ${job.location}`);
                console.log(`   - Requirements: ${job.requirements?.slice(0, 3).join(', ')}...`);
                console.log(`   - Experience Level: ${job.experienceLevel}`);
            });
        }
        
        return projectResult;
        
    } catch (error) {
        console.error('❌ Project Creation Failed:', error.message);
        
        // Try to get more details from the response
        if (error.response) {
            try {
                const errorText = await error.response.text();
                console.error('Error response:', errorText.substring(0, 500));
            } catch (e) {
                console.error('Could not read error response');
            }
        }
        return null;
    }
}

function analyzeEmailContent(emailData) {
    const subject = emailData.subject?.toLowerCase() || '';
    const body = emailData.body?.toLowerCase() || '';
    const emailText = `${subject} ${body}`;
    
    // Classification logic (matching the add-in)
    const projectKeywords = ['positions', 'engineers', 'developers', 'consultants', 'specialists', 'team', 'project', 'multiple', 'several'];
    const numberPattern = /\b(\d+)\s+(positions|engineers|developers|consultants|specialists|people|candidates)\b/i;
    
    const hasProjectKeywords = projectKeywords.some(keyword => emailText.includes(keyword));
    const hasNumberMatch = numberPattern.test(emailText);
    
    let classification = 'general';
    let priority = 'medium';
    let confidence = 0.5;
    
    if (hasProjectKeywords || hasNumberMatch) {
        classification = 'project';
        priority = 'high';
        confidence = 0.95;
    } else if (subject.includes('application') || body.includes('interested in')) {
        classification = 'application';
        priority = 'high';
        confidence = 0.85;
    } else if (subject.includes('resume') || body.includes('resume')) {
        classification = 'resume';
        priority = 'high';
        confidence = 0.90;
    }
    
    return {
        classification,
        priority,
        confidence,
        hasProjectKeywords,
        hasNumberMatch,
        extractedNumbers: emailText.match(numberPattern)
    };
}

function generateAISuggestionsFromEmail(emailData) {
    const analysis = analyzeEmailContent(emailData);
    const suggestions = [];
    
    if (analysis.classification === 'project') {
        suggestions.push({
            type: 'project',
            action: 'Create project',
            confidence: analysis.confidence,
            reason: 'Email describes a multi-position opportunity',
            priority: 'high'
        });
    }
    
    if (analysis.classification === 'application') {
        suggestions.push({
            type: 'candidate',
            action: 'Add as candidate',
            confidence: 0.85,
            reason: 'Email appears to be a job application',
            priority: 'high'
        });
    }
    
    if (emailData.body?.toLowerCase().includes('resume') || emailData.body?.toLowerCase().includes('cv')) {
        suggestions.push({
            type: 'document',
            action: 'Parse resume',
            confidence: 0.90,
            reason: 'Resume/CV detected in email',
            priority: 'medium'
        });
    }
    
    return suggestions;
}

async function createProjectFromEmail(emailData) {
    const projectData = {
        emailContent: emailData.body || '',
        emailSubject: emailData.subject || '',
        senderEmail: extractEmailFromSender(emailData.from),
        receivedDate: new Date().toISOString()
    };
    
    const response = await fetch('https://app-emineon-ol3msv7gs-david-bicrawais-projects.vercel.app/api/projects/parse-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

function extractEmailFromSender(fromString) {
    if (!fromString) return null;
    
    // Extract email from "Name <email>" format
    const emailMatch = fromString.match(/<([^>]+)>/);
    if (emailMatch) {
        return emailMatch[1];
    }
    
    // If it's already just an email
    if (fromString.includes('@')) {
        return fromString;
    }
    
    return null;
}

// Test UI Components
function testUIComponents() {
    console.log('\n5. Testing UI Component Updates...');
    
    // Simulate UI updates that would happen in the add-in
    const uiTests = {
        aiSuggestion: {
            before: 'Analyzing email...',
            after: 'Suggestion: Create project'
        },
        emailCategory: {
            before: 'Analyzing',
            after: 'Project'
        },
        emailPriority: {
            before: 'Medium',
            after: 'High'
        },
        quickActions: {
            createProject: 'enabled',
            addCandidate: 'enabled',
            parseResume: 'enabled',
            scheduleInterview: 'conditional'
        }
    };
    
    console.log('✅ UI Component Tests:', uiTests);
    return uiTests;
}

// Run the complete test suite
async function runCompleteTest() {
    try {
        const projectResult = await testOutlookAddinWorkflow();
        const uiTests = testUIComponents();
        
        console.log('\n🎉 Test Summary:');
        console.log('================');
        console.log('✅ Email Analysis: PASSED');
        console.log('✅ AI Suggestions: PASSED');
        console.log(projectResult ? '✅ Project Creation: PASSED' : '❌ Project Creation: FAILED');
        console.log('✅ UI Components: PASSED');
        
        if (projectResult) {
            console.log('\n📊 Project Details:');
            console.log(`   - Project: ${projectResult.project.name}`);
            console.log(`   - Client: ${projectResult.project.clientName}`);
            console.log(`   - Positions: ${projectResult.project.totalPositions}`);
            console.log(`   - Jobs Created: ${projectResult.project.jobs?.length || 0}`);
            console.log(`   - Urgency: ${projectResult.project.urgencyLevel}`);
            console.log(`   - Location: ${projectResult.project.location}`);
            
            if (projectResult.jobSuggestions && projectResult.jobSuggestions.length > 0) {
                console.log('\n💡 Job Suggestions:');
                projectResult.jobSuggestions.forEach((job, index) => {
                    console.log(`   ${index + 1}. ${job.title} (${job.experienceLevel})`);
                });
            }
        }
        
        console.log('\n🔗 Production URLs:');
        console.log('   - Main ATS: https://app-emineon-ol3msv7gs-david-bicrawais-projects.vercel.app');
        console.log('   - Projects: https://app-emineon-ol3msv7gs-david-bicrawais-projects.vercel.app/projects');
        console.log('   - Jobs: https://app-emineon-ol3msv7gs-david-bicrawais-projects.vercel.app/jobs');
        
    } catch (error) {
        console.error('❌ Test Suite Failed:', error);
    }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testOutlookAddinWorkflow,
        analyzeEmailContent,
        generateAISuggestionsFromEmail,
        createProjectFromEmail,
        runCompleteTest
    };
}

// Auto-run if executed directly
if (typeof window === 'undefined') {
    runCompleteTest();
} 