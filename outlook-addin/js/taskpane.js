/* global Office */

// Emineon Recruitment Assistant for Outlook
// Enhanced AI Copilot with comprehensive recruitment functionality

(() => {
    "use strict";

    let currentEmailData = {};
    let currentAttachments = [];
    let aiAnalysisCache = {};
    let isAnalyzing = false;

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
        setTimeout(() => {
            analyzeCurrentEmail();
        }, 1000);
    }

    function bindEventHandlers() {
        // Primary Actions
        const createProjectAction = document.getElementById('createProjectAction');
        const createJobAction = document.getElementById('createJobAction');
        const addCandidateAction = document.getElementById('addCandidateAction');
        
        // Secondary Actions
        const parseResumeAction = document.getElementById('parseResumeAction');
        const scheduleInterviewAction = document.getElementById('scheduleInterviewAction');
        const addContactAction = document.getElementById('addContactAction');
        const assignToJobAction = document.getElementById('assignToJobAction');
        
        // Quick Access
        const openAtsBtn = document.getElementById('openAtsBtn');
        const refreshDataBtn = document.getElementById('refreshDataBtn');

        // Bind all event listeners
        if (createProjectAction) createProjectAction.addEventListener('click', () => handleAction('create-project'));
        if (createJobAction) createJobAction.addEventListener('click', () => handleAction('create-job'));
        if (addCandidateAction) addCandidateAction.addEventListener('click', () => handleAction('add-candidate'));
        if (parseResumeAction) parseResumeAction.addEventListener('click', () => handleAction('parse-resume'));
        if (scheduleInterviewAction) scheduleInterviewAction.addEventListener('click', () => handleAction('schedule-interview'));
        if (addContactAction) addContactAction.addEventListener('click', () => handleAction('add-contact'));
        if (assignToJobAction) assignToJobAction.addEventListener('click', () => handleAction('assign-to-job'));
        if (openAtsBtn) openAtsBtn.addEventListener('click', openFullATS);
        if (refreshDataBtn) refreshDataBtn.addEventListener('click', refreshAnalysis);

        // Settings handler
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    }

    // Main Email Analysis Function
    async function analyzeCurrentEmail() {
        if (isAnalyzing) return;
        isAnalyzing = true;

        const aiSuggestion = document.getElementById('aiSuggestion');
        const aiActions = document.getElementById('aiActions');
        
        try {
            const item = Office.context.mailbox.item;
            
            if (!item) {
                aiSuggestion.innerHTML = `
                    <span class="text-gray-600">
                        <i data-lucide="info" class="w-4 h-4 inline mr-1"></i>
                        No email selected
                    </span>
                `;
                lucide.createIcons();
                isAnalyzing = false;
                return;
            }

            // Show analyzing state
            aiSuggestion.innerHTML = `
                <div class="flex items-center">
                    <i data-lucide="loader-2" class="w-4 h-4 mr-2 animate-spin"></i>
                    <span>Analyzing email and attachments...</span>
                </div>
            `;
            lucide.createIcons();

            // Get email data
            const emailData = await getEmailData(item);
            currentEmailData = emailData;

            // Detect and analyze attachments
            const attachments = await detectAttachments(item);
            currentAttachments = attachments;

            // Update email context display
            updateEmailContext(emailData);

            // Show attachments if detected
            displayAttachments(attachments);

            // Generate AI suggestions
            const suggestions = await generateAISuggestions(emailData, attachments);
            displayAISuggestions(suggestions);

        } catch (error) {
            console.error('Email analysis failed:', error);
            aiSuggestion.innerHTML = `
                <span class="text-red-600">
                    <i data-lucide="alert-circle" class="w-4 h-4 inline mr-1"></i>
                    Analysis failed - ${error.message}
                </span>
            `;
            lucide.createIcons();
        } finally {
            isAnalyzing = false;
        }
    }

    // Get comprehensive email data
    async function getEmailData(item) {
        return new Promise((resolve, reject) => {
            const emailData = {
                subject: item.subject || 'No subject',
                from: item.from ? {
                    name: item.from.displayName || 'Unknown',
                    email: item.from.emailAddress || 'unknown@unknown.com'
                } : { name: 'Unknown', email: 'unknown@unknown.com' },
                date: item.dateTimeCreated ? new Date(item.dateTimeCreated) : new Date(),
                body: '',
                hasAttachments: item.attachments && item.attachments.length > 0
            };

            // Get email body
            if (item.body) {
                item.body.getAsync(Office.CoercionType.Text, (result) => {
                    if (result.status === Office.AsyncResultStatus.Succeeded) {
                        emailData.body = result.value || '';
                        resolve(emailData);
                    } else {
                        console.warn('Could not get email body:', result.error);
                        resolve(emailData);
                    }
                });
            } else {
                resolve(emailData);
            }
        });
    }

    // Detect and analyze attachments
    async function detectAttachments(item) {
        if (!item.attachments || item.attachments.length === 0) {
            return [];
        }

        const attachments = [];
        
        for (let i = 0; i < item.attachments.length; i++) {
            const attachment = item.attachments[i];
            const attachmentInfo = {
                id: attachment.id,
                name: attachment.name,
                size: attachment.size,
                type: getAttachmentType(attachment.name),
                isResume: isResumeFile(attachment.name),
                isDocument: isDocumentFile(attachment.name)
            };
            attachments.push(attachmentInfo);
        }

        return attachments;
    }

    function getAttachmentType(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        const types = {
            'pdf': 'PDF Document',
            'doc': 'Word Document',
            'docx': 'Word Document',
            'txt': 'Text File',
            'rtf': 'Rich Text',
            'jpg': 'Image',
            'jpeg': 'Image',
            'png': 'Image',
            'gif': 'Image'
        };
        return types[ext] || 'Unknown';
    }

    function isResumeFile(filename) {
        const resumeKeywords = ['resume', 'cv', 'curriculum'];
        const lowerName = filename.toLowerCase();
        return resumeKeywords.some(keyword => lowerName.includes(keyword));
    }

    function isDocumentFile(filename) {
        const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        const ext = filename.toLowerCase().split('.').pop();
        return docExtensions.includes(ext);
    }

    // Display attachments
    function displayAttachments(attachments) {
        const attachmentAnalysis = document.getElementById('attachmentAnalysis');
        const attachmentList = document.getElementById('attachmentList');
        
        if (attachments.length === 0) {
            attachmentAnalysis.classList.add('hidden');
            return;
        }

        attachmentAnalysis.classList.remove('hidden');
        
        attachmentList.innerHTML = attachments.map(attachment => `
            <div class="flex items-center justify-between p-1 bg-white rounded border">
                <div class="flex items-center space-x-2">
                    <i data-lucide="${getAttachmentIcon(attachment.type)}" class="w-3 h-3 text-gray-500"></i>
                    <span class="text-xs font-medium">${attachment.name}</span>
                    ${attachment.isResume ? '<span class="text-xs bg-blue-100 text-blue-800 px-1 rounded">Resume</span>' : ''}
                </div>
                <span class="text-xs text-gray-500">${formatFileSize(attachment.size)}</span>
            </div>
        `).join('');
        
        lucide.createIcons();
    }

    function getAttachmentIcon(type) {
        const icons = {
            'PDF Document': 'file-text',
            'Word Document': 'file-text',
            'Text File': 'file-text',
            'Rich Text': 'file-text',
            'Image': 'image',
            'Unknown': 'file'
        };
        return icons[type] || 'file';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Generate comprehensive AI suggestions
    async function generateAISuggestions(emailData, attachments) {
        const suggestions = [];
        const emailText = `${emailData.subject} ${emailData.body}`.toLowerCase();
        const senderName = emailData.from.name.toLowerCase();
        
        // Project Detection (Multi-position opportunities)
        const projectPatterns = [
            /\b(\d+)\s+(positions|roles|engineers|developers|consultants|specialists|people|candidates)\b/i,
            /\b(multiple|several|team of|group of)\s+(positions|roles|engineers|developers)\b/i,
            /\b(project|contract|engagement)\s+(requires|needs|looking for)\b/i
        ];
        
        const hasProjectIndicators = projectPatterns.some(pattern => pattern.test(emailText)) ||
            ['positions', 'multiple roles', 'team', 'project', 'contract'].some(keyword => emailText.includes(keyword));
        
        if (hasProjectIndicators) {
            suggestions.push({
                type: 'project',
                action: 'Create Project',
                icon: 'folder-plus',
                confidence: 0.90,
                reason: 'Email describes a multi-position opportunity or project',
                priority: 'high'
            });
        }

        // Job/Opportunity Detection
        const jobKeywords = ['hiring', 'position', 'role', 'opportunity', 'job opening', 'vacancy'];
        if (jobKeywords.some(keyword => emailText.includes(keyword))) {
            suggestions.push({
                type: 'job',
                action: 'Create Job',
                icon: 'briefcase',
                confidence: 0.85,
                reason: 'Job opportunity detected',
                priority: 'high'
            });
        }

        // Candidate Detection
        const candidateIndicators = [
            'application', 'applying for', 'interested in', 'resume attached', 
            'cv attached', 'looking for work', 'seeking position'
        ];
        if (candidateIndicators.some(indicator => emailText.includes(indicator))) {
            suggestions.push({
                type: 'candidate',
                action: 'Add Candidate',
                icon: 'user-plus',
                confidence: 0.90,
                reason: 'Email appears to be from a job candidate',
                priority: 'high'
            });
        }

        // Resume/CV Detection
        const resumeAttachments = attachments.filter(att => att.isResume);
        if (resumeAttachments.length > 0) {
            suggestions.push({
                type: 'parse-resume',
                action: 'Parse Resume',
                icon: 'file-text',
                confidence: 0.95,
                reason: `${resumeAttachments.length} resume(s) detected`,
                priority: 'high'
            });
        }

        // Document attachments
        const documentAttachments = attachments.filter(att => att.isDocument && !att.isResume);
        if (documentAttachments.length > 0) {
            suggestions.push({
                type: 'parse-document',
                action: 'Analyze Documents',
                icon: 'file-search',
                confidence: 0.80,
                reason: `${documentAttachments.length} document(s) to analyze`,
                priority: 'medium'
            });
        }

        // Interview Scheduling
        const interviewKeywords = ['interview', 'meeting', 'call', 'schedule', 'available'];
        if (interviewKeywords.some(keyword => emailText.includes(keyword))) {
            suggestions.push({
                type: 'interview',
                action: 'Schedule Interview',
                icon: 'calendar-plus',
                confidence: 0.75,
                reason: 'Interview scheduling detected',
                priority: 'medium'
            });
        }

        // Contact Creation
        if (!emailData.from.email.includes('noreply') && !emailData.from.email.includes('no-reply')) {
            suggestions.push({
                type: 'contact',
                action: 'Add Contact',
                icon: 'user-check',
                confidence: 0.70,
                reason: `Add ${emailData.from.name} to contacts`,
                priority: 'low'
            });
        }

        // Sort by priority and confidence
        return suggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0) || 
                   b.confidence - a.confidence;
        });
    }

    // Display AI suggestions
    function displayAISuggestions(suggestions) {
        const aiSuggestion = document.getElementById('aiSuggestion');
        const aiActions = document.getElementById('aiActions');
        
        if (suggestions.length === 0) {
            aiSuggestion.innerHTML = `
                <span class="text-gray-600">
                    <i data-lucide="check-circle" class="w-4 h-4 inline mr-1 text-green-600"></i>
                    Email analyzed - no immediate actions suggested
                </span>
            `;
            aiActions.classList.add('hidden');
        } else {
            const primarySuggestion = suggestions[0];
            aiSuggestion.innerHTML = `
                <div class="space-y-1">
                    <div class="flex items-center">
                        <i data-lucide="sparkles" class="w-4 h-4 mr-2 text-blue-600"></i>
                        <span class="text-sm font-medium text-gray-800">AI Recommendations</span>
                    </div>
                    <p class="text-xs text-gray-600">${primarySuggestion.reason}</p>
                </div>
            `;
            
            // Show top 3 suggestions as action buttons
            const topSuggestions = suggestions.slice(0, 3);
            aiActions.innerHTML = topSuggestions.map(suggestion => `
                <button class="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors" 
                        onclick="executeAISuggestion('${suggestion.type}')">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2">
                            <i data-lucide="${suggestion.icon}" class="w-4 h-4 text-blue-600"></i>
                            <span class="text-sm font-medium text-blue-800">${suggestion.action}</span>
                        </div>
                        <span class="text-xs text-blue-600">${Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                </button>
            `).join('');
            aiActions.classList.remove('hidden');
        }
        
        lucide.createIcons();
    }

    // Execute AI suggestions
    window.executeAISuggestion = function(type) {
        console.log(`Executing AI suggestion: ${type}`);
        handleAction(type);
    };

    // Update email context display
    function updateEmailContext(emailData) {
        const emailSender = document.getElementById('emailSender');
        const emailSubject = document.getElementById('emailSubject');
        const emailCategory = document.getElementById('emailCategory');
        const emailPriority = document.getElementById('emailPriority');

        if (emailSender) {
            emailSender.textContent = `${emailData.from.name} <${emailData.from.email}>`;
        }
        
        if (emailSubject) {
            emailSubject.textContent = emailData.subject;
        }

        // Classify email type
        const category = classifyEmail(emailData);
        if (emailCategory) {
            emailCategory.className = `status-badge status-${category.type}`;
            emailCategory.innerHTML = `<i data-lucide="${category.icon}" class="w-3 h-3"></i> ${category.label}`;
        }

        // Determine priority
        const priority = determinePriority(emailData);
        if (emailPriority) {
            const prioritySpan = emailPriority.querySelector('.priority-badge');
            if (prioritySpan) {
                prioritySpan.className = `priority-badge priority-${priority.level}`;
                prioritySpan.textContent = priority.label;
            }
        }

        lucide.createIcons();
    }

    function classifyEmail(emailData) {
        const subject = emailData.subject.toLowerCase();
        const body = emailData.body.toLowerCase();
        const text = `${subject} ${body}`;

        if (text.includes('application') || text.includes('resume') || text.includes('cv')) {
            return { type: 'candidate', label: 'Candidate', icon: 'user' };
        }
        if (text.includes('position') || text.includes('hiring') || text.includes('job')) {
            return { type: 'opportunity', label: 'Opportunity', icon: 'briefcase' };
        }
        if (text.includes('project') || text.includes('contract') || text.includes('engagement')) {
            return { type: 'project', label: 'Project', icon: 'folder' };
        }
        if (text.includes('interview') || text.includes('meeting') || text.includes('call')) {
            return { type: 'interview', label: 'Interview', icon: 'calendar' };
        }
        
        return { type: 'general', label: 'General', icon: 'mail' };
    }

    function determinePriority(emailData) {
        const text = `${emailData.subject} ${emailData.body}`.toLowerCase();
        const urgentKeywords = ['urgent', 'asap', 'immediate', 'priority', 'rush'];
        const highKeywords = ['important', 'critical', 'deadline', 'interview'];
        
        if (urgentKeywords.some(keyword => text.includes(keyword))) {
            return { level: 'high', label: 'High' };
        }
        if (highKeywords.some(keyword => text.includes(keyword)) || currentAttachments.length > 0) {
            return { level: 'medium', label: 'Medium' };
        }
        
        return { level: 'low', label: 'Low' };
    }

    // Handle all actions
    async function handleAction(action) {
        console.log(`Handling action: ${action}`);
        showLoadingOverlay(`Processing ${action}...`);
        
        try {
            switch(action) {
                case 'create-project':
                    await createProjectFromEmail();
                    break;
                case 'create-job':
                    await createJobFromEmail();
                    break;
                case 'add-candidate':
                    await addCandidateFromEmail();
                    break;
                case 'parse-resume':
                    await parseResumeFromEmail();
                    break;
                case 'schedule-interview':
                    await scheduleInterviewFromEmail();
                    break;
                case 'add-contact':
                    await addContactFromEmail();
                    break;
                case 'assign-to-job':
                    await assignToJobFromEmail();
                    break;
                case 'parse-document':
                    await parseDocumentsFromEmail();
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Action ${action} failed:`, error);
            showNotification(`Failed to ${action}: ${error.message}`, 'error');
        } finally {
            hideLoadingOverlay();
        }
    }

    // Action implementations
    async function createProjectFromEmail() {
        const response = await fetch('/api/projects/parse-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: currentEmailData.subject,
                body: currentEmailData.body,
                from: currentEmailData.from,
                date: currentEmailData.date.toISOString()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create project');
        }

        const result = await response.json();
        showNotification(`Project "${result.project.name}" created successfully!`, 'success');
        
        // Update UI with project details
        const aiSuggestion = document.getElementById('aiSuggestion');
        aiSuggestion.innerHTML = `
            <div class="space-y-2">
                <div class="flex items-center">
                    <i data-lucide="check-circle" class="w-4 h-4 mr-2 text-green-600"></i>
                    <span class="text-sm font-medium text-green-800">Project Created</span>
                </div>
                <div class="text-xs text-gray-600">
                    <p><strong>${result.project.name}</strong></p>
                    <p>Client: ${result.project.clientName}</p>
                    <p>Positions: ${result.project.totalPositions}</p>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    async function createJobFromEmail() {
        // Implementation for creating a job from email
        showNotification('Job creation functionality coming soon', 'info');
    }

    async function addCandidateFromEmail() {
        const candidateData = {
            firstName: extractFirstName(currentEmailData.from.name),
            lastName: extractLastName(currentEmailData.from.name),
            email: currentEmailData.from.email,
            source: 'Email',
            notes: `Added from email: ${currentEmailData.subject}`
        };

        const response = await fetch('/api/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidateData)
        });

        if (!response.ok) {
            throw new Error('Failed to add candidate');
        }

        const result = await response.json();
        showNotification(`Candidate ${result.firstName} ${result.lastName} added successfully!`, 'success');
    }

    async function parseResumeFromEmail() {
        const resumeAttachments = currentAttachments.filter(att => att.isResume);
        
        if (resumeAttachments.length === 0) {
            throw new Error('No resume attachments found');
        }

        // For now, show info about detected resumes
        showNotification(`Found ${resumeAttachments.length} resume(s). Full parsing coming soon.`, 'info');
    }

    async function scheduleInterviewFromEmail() {
        showNotification('Interview scheduling functionality coming soon', 'info');
    }

    async function addContactFromEmail() {
        const contactData = {
            name: currentEmailData.from.name,
            email: currentEmailData.from.email,
            type: 'candidate', // or 'client' based on classification
            source: 'Email'
        };

        showNotification(`Contact ${contactData.name} will be added to your contact list`, 'info');
    }

    async function assignToJobFromEmail() {
        showNotification('Job assignment functionality coming soon', 'info');
    }

    async function parseDocumentsFromEmail() {
        const docAttachments = currentAttachments.filter(att => att.isDocument);
        showNotification(`Found ${docAttachments.length} document(s) to analyze`, 'info');
    }

    // Utility functions
    function extractFirstName(fullName) {
        return fullName.split(' ')[0] || 'Unknown';
    }

    function extractLastName(fullName) {
        const parts = fullName.split(' ');
        return parts.length > 1 ? parts[parts.length - 1] : '';
    }

    async function refreshAnalysis() {
        const refreshBtn = document.getElementById('refreshDataBtn');
        const originalContent = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>';
        lucide.createIcons();
        
        try {
            await analyzeCurrentEmail();
            showNotification('Analysis refreshed successfully', 'success');
        } catch (error) {
            showNotification('Failed to refresh analysis', 'error');
        } finally {
            refreshBtn.innerHTML = originalContent;
            lucide.createIcons();
        }
    }

    function openFullATS() {
        const atsUrl = 'https://app-emineon-3h5xnu9vi-david-bicrawais-projects.vercel.app';
        window.open(atsUrl, '_blank');
    }

    function openSettings() {
        showNotification('Settings panel coming soon', 'info');
    }

    // UI Helper functions
    function showLoadingOverlay(message = 'Processing...') {
        // Create overlay if it doesn't exist
        let overlay = document.getElementById('loadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loadingOverlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            overlay.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-lg text-center">
                    <i data-lucide="loader-2" class="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600"></i>
                    <p class="text-sm text-gray-600" id="loadingMessage">${message}</p>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            document.getElementById('loadingMessage').textContent = message;
        }
        
        overlay.style.display = 'flex';
        lucide.createIcons();
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${getNotificationClasses(type)}`;
        
        const icon = getNotificationIcon(type);
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <i data-lucide="${icon}" class="w-5 h-5 flex-shrink-0 mt-0.5"></i>
                <div class="flex-1">
                    <p class="text-sm font-medium">${message}</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0">
                    <i data-lucide="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        lucide.createIcons();
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    function getNotificationClasses(type) {
        const classes = {
            success: 'bg-green-50 border border-green-200 text-green-800',
            error: 'bg-red-50 border border-red-200 text-red-800',
            warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border border-blue-200 text-blue-800'
        };
        return classes[type] || classes.info;
    }

    function getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || icons.info;
    }

})(); 