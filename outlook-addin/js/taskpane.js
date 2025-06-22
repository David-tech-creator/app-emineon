/* global Office */

// Emineon Recruitment Assistant for Outlook
// Enhanced with AI Copilot and recruitment-specific features

(() => {
    "use strict";

    let currentEmailData = {};
    let currentContact = null;
    let aiAnalysisCache = {};

    // Initialize Office Add-in
    Office.onReady((info) => {
        if (info.host === Office.HostType.Outlook) {
            console.log("Emineon Recruitment Assistant loaded");
            initializeApp();
        }
    });

    function initializeApp() {
        // Initialize icons
        lucide.createIcons();
        
        // Bind event handlers
        bindEventHandlers();
        
        // Auto-analyze current email
        analyzeCurrentEmail();
        
        // Start AI copilot
        initializeAICopilot();
    }

    function bindEventHandlers() {
        // AI Copilot handlers
        const aiCopilotBtn = document.getElementById('aiCopilotBtn');
        const askAiBtn = document.getElementById('askAiBtn');
        const refreshAiBtn = document.getElementById('refreshAiBtn');
        
        if (aiCopilotBtn) aiCopilotBtn.addEventListener('click', toggleAICopilotChat);
        if (askAiBtn) askAiBtn.addEventListener('click', openAIChat);
        if (refreshAiBtn) refreshAiBtn.addEventListener('click', refreshAIAnalysis);

        // Email analysis handlers
        const analyzeEmailBtn = document.getElementById('analyzeEmailBtn');
        if (analyzeEmailBtn) analyzeEmailBtn.addEventListener('click', analyzeCurrentEmail);

        // Contact management handlers
        const findContactBtn = document.getElementById('findContactBtn');
        const addContactBtn = document.getElementById('addContactBtn');
        
        if (findContactBtn) findContactBtn.addEventListener('click', findContact);
        if (addContactBtn) addContactBtn.addEventListener('click', addNewContact);

        // Quick action handlers
        const addCandidateAction = document.getElementById('addCandidateAction');
        const scheduleInterviewAction = document.getElementById('scheduleInterviewAction');
        const addToJobAction = document.getElementById('addToJobAction');
        const emailTemplateAction = document.getElementById('emailTemplateAction');
        const openAtsBtn = document.getElementById('openAtsBtn');

        if (addCandidateAction) addCandidateAction.addEventListener('click', () => handleQuickAction('add-candidate'));
        if (scheduleInterviewAction) scheduleInterviewAction.addEventListener('click', () => handleQuickAction('schedule-interview'));
        if (addToJobAction) addToJobAction.addEventListener('click', () => handleQuickAction('add-to-job'));
        if (emailTemplateAction) emailTemplateAction.addEventListener('click', () => handleQuickAction('email-template'));
        if (openAtsBtn) openAtsBtn.addEventListener('click', openFullATS);

        // Jobs and activity handlers
        const viewAllJobsBtn = document.getElementById('viewAllJobsBtn');
        const viewAllActivityBtn = document.getElementById('viewAllActivityBtn');
        
        if (viewAllJobsBtn) viewAllJobsBtn.addEventListener('click', viewAllJobs);
        if (viewAllActivityBtn) viewAllActivityBtn.addEventListener('click', viewAllActivity);

        // Settings handler
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    }

    // AI Copilot Functions
    async function initializeAICopilot() {
        const aiSuggestion = document.getElementById('aiSuggestion');
        
        try {
            // Simulate AI analysis startup
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const suggestions = await generateAISuggestions();
            displayAISuggestions(suggestions);
            
        } catch (error) {
            console.error('AI Copilot initialization failed:', error);
            aiSuggestion.innerHTML = `
                <span class="text-red-600">
                    <i data-lucide="alert-circle" class="w-4 h-4 inline mr-1"></i>
                    AI temporarily unavailable
                </span>
            `;
            lucide.createIcons();
        }
    }

    async function generateAISuggestions() {
        // In a real implementation, this would call your AI service
        // For now, we'll simulate intelligent suggestions based on email content
        
        const emailContext = currentEmailData;
        const suggestions = [];
        
        if (emailContext.subject?.toLowerCase().includes('application')) {
            suggestions.push({
                type: 'candidate',
                action: 'Add as candidate',
                confidence: 0.85,
                reason: 'Email appears to be a job application'
            });
        }
        
        if (emailContext.body?.toLowerCase().includes('resume') || 
            emailContext.body?.toLowerCase().includes('cv')) {
            suggestions.push({
                type: 'document',
                action: 'Parse resume',
                confidence: 0.90,
                reason: 'Resume/CV detected in email'
            });
        }
        
        if (emailContext.from && !currentContact) {
            suggestions.push({
                type: 'contact',
                action: 'Create contact',
                confidence: 0.75,
                reason: 'Unknown sender - potential new candidate'
            });
        }
        
        return suggestions;
    }

    function displayAISuggestions(suggestions) {
        const aiSuggestion = document.getElementById('aiSuggestion');
        const aiActions = document.getElementById('aiActions');
        
        if (suggestions.length === 0) {
            aiSuggestion.innerHTML = `
                <span class="text-gray-600">
                    <i data-lucide="check-circle" class="w-4 h-4 inline mr-1 text-green-600"></i>
                    No immediate actions needed
                </span>
            `;
        } else {
            const primarySuggestion = suggestions[0];
            aiSuggestion.innerHTML = `
                <span class="text-gray-800">
                    <i data-lucide="lightbulb" class="w-4 h-4 inline mr-1 text-yellow-500"></i>
                    <strong>Suggestion:</strong> ${primarySuggestion.action}
                </span>
                <p class="text-xs text-gray-600 mt-1">${primarySuggestion.reason}</p>
            `;
            
            // Show action buttons
            aiActions.innerHTML = suggestions.map(suggestion => `
                <button class="emineon-button-secondary emineon-button-sm" onclick="executeAISuggestion('${suggestion.type}', '${suggestion.action}')">
                    ${suggestion.action}
                </button>
            `).join('');
            aiActions.classList.remove('hidden');
        }
        
        lucide.createIcons();
    }

    window.executeAISuggestion = function(type, action) {
        console.log(`Executing AI suggestion: ${type} - ${action}`);
        
        switch(type) {
            case 'candidate':
                handleQuickAction('add-candidate');
                break;
            case 'document':
                parseResumeFromEmail();
                break;
            case 'contact':
                addNewContact();
                break;
            default:
                console.log('Unknown suggestion type:', type);
        }
    };

    async function refreshAIAnalysis() {
        const refreshBtn = document.getElementById('refreshAiBtn');
        const originalIcon = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        
        try {
            await analyzeCurrentEmail();
            const suggestions = await generateAISuggestions();
            displayAISuggestions(suggestions);
            
            showNotification('AI analysis refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh AI analysis:', error);
            showNotification('Failed to refresh AI analysis', 'error');
        } finally {
            refreshBtn.innerHTML = originalIcon;
            lucide.createIcons();
        }
    }

    // Email Analysis Functions
    async function analyzeCurrentEmail() {
        try {
            const item = Office.context.mailbox.item;
            
            if (!item) {
                console.log('No email item available');
                return;
            }

            // Get email properties
            const emailData = {
                subject: item.subject || 'No subject',
                from: item.from ? item.from.displayName || item.from.emailAddress : 'Unknown sender',
                date: item.dateTimeCreated ? new Date(item.dateTimeCreated).toLocaleDateString() : 'Unknown date',
                itemId: item.itemId
            };

            // Get email body if available
            if (item.body) {
                item.body.getAsync("text", (result) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        emailData.body = result.value;
                        currentEmailData = emailData;
                        updateEmailContext(emailData);
                        classifyEmail(emailData);
                    }
                });
            } else {
                currentEmailData = emailData;
                updateEmailContext(emailData);
                classifyEmail(emailData);
            }

        } catch (error) {
            console.error('Error analyzing email:', error);
            showNotification('Failed to analyze email', 'error');
        }
    }

    function updateEmailContext(emailData) {
        const emailFrom = document.getElementById('emailFrom');
        const emailSubject = document.getElementById('emailSubject');
        
        if (emailFrom) emailFrom.textContent = emailData.from;
        if (emailSubject) emailSubject.textContent = emailData.subject;
    }

    function classifyEmail(emailData) {
        const emailType = document.getElementById('emailType');
        const subject = emailData.subject?.toLowerCase() || '';
        const body = emailData.body?.toLowerCase() || '';
        
        let classification = 'general';
        let priority = 'medium';
        
        // Classification logic
        if (subject.includes('application') || subject.includes('apply') || body.includes('interested in')) {
            classification = 'application';
            priority = 'high';
        } else if (subject.includes('resume') || subject.includes('cv') || body.includes('resume')) {
            classification = 'resume';
            priority = 'high';
        } else if (subject.includes('interview') || body.includes('interview')) {
            classification = 'interview';
            priority = 'high';
        } else if (subject.includes('follow up') || subject.includes('follow-up')) {
            classification = 'follow-up';
            priority = 'medium';
        } else if (subject.includes('reference') || body.includes('reference')) {
            classification = 'reference';
            priority = 'medium';
        }
        
        if (emailType) {
            emailType.textContent = classification.charAt(0).toUpperCase() + classification.slice(1);
            emailType.className = `priority-badge priority-${priority}`;
        }
    }

    // Contact Management Functions
    async function findContact() {
        const findBtn = document.getElementById('findContactBtn');
        const originalContent = findBtn.innerHTML;
        
        findBtn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        
        try {
            // Simulate API call to find contact
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For demo, randomly decide if contact is found
            const contactFound = Math.random() > 0.5;
            
            if (contactFound) {
                displayFoundContact({
                    name: 'Sarah Johnson',
                    title: 'Senior React Developer',
                    status: 'interviewing',
                    priority: 'high',
                    email: currentEmailData.from,
                    initials: 'SJ'
                });
                showNotification('Contact found in database', 'success');
            } else {
                showNotification('Contact not found in database', 'info');
            }
            
        } catch (error) {
            console.error('Error finding contact:', error);
            showNotification('Failed to search contacts', 'error');
        } finally {
            findBtn.innerHTML = originalContent;
            lucide.createIcons();
        }
    }

    function displayFoundContact(contact) {
        const noContact = document.getElementById('noContact');
        const contactFound = document.getElementById('contactFound');
        const contactName = document.getElementById('contactName');
        const contactTitle = document.getElementById('contactTitle');
        const contactStatus = document.getElementById('contactStatus');
        const contactPriority = document.getElementById('contactPriority');
        const contactAvatar = document.getElementById('contactAvatar');
        
        if (noContact) noContact.classList.add('hidden');
        if (contactFound) contactFound.classList.remove('hidden');
        
        if (contactName) contactName.textContent = contact.name;
        if (contactTitle) contactTitle.textContent = contact.title;
        if (contactAvatar) contactAvatar.textContent = contact.initials;
        
        if (contactStatus) {
            contactStatus.textContent = contact.status;
            contactStatus.className = `status-badge status-${contact.status}`;
        }
        
        if (contactPriority) {
            contactPriority.textContent = contact.priority;
            contactPriority.className = `priority-badge priority-${contact.priority}`;
        }
        
        currentContact = contact;
    }

    async function addNewContact() {
        const addBtn = document.getElementById('addContactBtn');
        const originalContent = addBtn.innerHTML;
        
        addBtn.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        
        try {
            // Extract information from email for pre-filling
            const contactData = {
                name: extractNameFromEmail(currentEmailData.from),
                email: extractEmailFromSender(currentEmailData.from),
                source: 'Email',
                subject: currentEmailData.subject
            };
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo, show success
            displayFoundContact({
                name: contactData.name || 'New Contact',
                title: 'Candidate',
                status: 'new',
                priority: 'medium',
                email: contactData.email,
                initials: getInitials(contactData.name || 'New Contact')
            });
            
            showNotification('Contact created successfully', 'success');
            
        } catch (error) {
            console.error('Error creating contact:', error);
            showNotification('Failed to create contact', 'error');
        } finally {
            addBtn.innerHTML = originalContent;
            lucide.createIcons();
        }
    }

    // Quick Action Handlers
    function handleQuickAction(action) {
        console.log(`Executing quick action: ${action}`);
        
        switch(action) {
            case 'add-candidate':
                addCandidateFromEmail();
                break;
            case 'schedule-interview':
                scheduleInterview();
                break;
            case 'add-to-job':
                addToJob();
                break;
            case 'email-template':
                openEmailTemplates();
                break;
            default:
                console.log('Unknown quick action:', action);
        }
    }

    async function addCandidateFromEmail() {
        showLoadingOverlay('Creating candidate profile...');
        
        try {
            // Extract candidate information from email
            const candidateData = {
                name: extractNameFromEmail(currentEmailData.from),
                email: extractEmailFromSender(currentEmailData.from),
                source: 'Email Application',
                applicationDate: new Date().toISOString(),
                subject: currentEmailData.subject,
                emailBody: currentEmailData.body
            };
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            hideLoadingOverlay();
            showNotification('Candidate profile created successfully', 'success');
            
            // Update contact display
            displayFoundContact({
                name: candidateData.name || 'New Candidate',
                title: 'Job Applicant',
                status: 'new',
                priority: 'high',
                email: candidateData.email,
                initials: getInitials(candidateData.name || 'New Candidate')
            });
            
        } catch (error) {
            console.error('Error creating candidate:', error);
            hideLoadingOverlay();
            showNotification('Failed to create candidate profile', 'error');
        }
    }

    function scheduleInterview() {
        if (!currentContact) {
            showNotification('Please identify or create a contact first', 'warning');
            return;
        }
        
        // In a real implementation, this would open a scheduling interface
        showNotification(`Opening interview scheduler for ${currentContact.name}`, 'info');
        console.log('Schedule interview for:', currentContact);
    }

    function addToJob() {
        if (!currentContact) {
            showNotification('Please identify or create a contact first', 'warning');
            return;
        }
        
        // In a real implementation, this would show job matching interface
        showNotification(`Opening job matcher for ${currentContact.name}`, 'info');
        console.log('Add to job:', currentContact);
    }

    function openEmailTemplates() {
        // Open the compose taskpane for email templates
        Office.ribbon.requestUpdate([
            {
                id: "ComposeCommandSurface",
                controls: [
                    {
                        id: "TaskPaneButton",
                        enabled: true
                    }
                ]
            }
        ]);
        
        showNotification('Opening email templates...', 'info');
    }

    function openFullATS() {
        // Open the full ATS in a new tab
        const atsUrl = 'https://app-emineon.vercel.app';
        window.open(atsUrl, '_blank');
        showNotification('Opening full ATS system', 'info');
    }

    // Navigation Functions
    function viewAllJobs() {
        const atsUrl = 'https://app-emineon.vercel.app/jobs';
        window.open(atsUrl, '_blank');
        showNotification('Opening jobs dashboard', 'info');
    }

    function viewAllActivity() {
        const atsUrl = 'https://app-emineon.vercel.app/analytics';
        window.open(atsUrl, '_blank');
        showNotification('Opening activity dashboard', 'info');
    }

    function openSettings() {
        // In a real implementation, this would open settings panel
        showNotification('Settings panel coming soon', 'info');
    }

    // AI Chat Functions
    function toggleAICopilotChat() {
        // In a real implementation, this would toggle a chat interface
        showNotification('AI Chat interface coming soon', 'info');
    }

    function openAIChat() {
        // In a real implementation, this would open an AI chat modal
        showNotification('Ask AI feature coming soon', 'info');
    }

    // Utility Functions
    function extractNameFromEmail(fromString) {
        if (!fromString) return null;
        
        // Try to extract name from "Name <email>" format
        const nameMatch = fromString.match(/^([^<]+)<.*>$/);
        if (nameMatch) {
            return nameMatch[1].trim();
        }
        
        // If just email, try to extract name from email prefix
        const emailMatch = fromString.match(/^([^@]+)@/);
        if (emailMatch) {
            return emailMatch[1].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        return fromString;
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

    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    }

    async function parseResumeFromEmail() {
        showLoadingOverlay('Parsing resume from email...');
        
        try {
            // In a real implementation, this would extract attachments and parse them
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            hideLoadingOverlay();
            showNotification('Resume parsed successfully', 'success');
            
        } catch (error) {
            console.error('Error parsing resume:', error);
            hideLoadingOverlay();
            showNotification('Failed to parse resume', 'error');
        }
    }

    // UI Helper Functions
    function showLoadingOverlay(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageSpan = overlay.querySelector('span');
        
        if (messageSpan) messageSpan.textContent = message;
        if (overlay) overlay.classList.remove('hidden');
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.classList.add('hidden');
    }

    function showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-3 rounded-lg shadow-lg z-50 text-sm max-w-sm fade-in`;
        
        switch(type) {
            case 'success':
                notification.className += ' bg-green-100 text-green-800 border border-green-200';
                break;
            case 'error':
                notification.className += ' bg-red-100 text-red-800 border border-red-200';
                break;
            case 'warning':
                notification.className += ' bg-yellow-100 text-yellow-800 border border-yellow-200';
                break;
            default:
                notification.className += ' bg-blue-100 text-blue-800 border border-blue-200';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
        }

})(); 