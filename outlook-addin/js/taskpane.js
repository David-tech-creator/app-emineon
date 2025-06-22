// Emineon Outlook Add-in - Enhanced Recruitment Assistant
// Copyright (c) 2024 Emineon ATS. All rights reserved.

Office.onReady((info) => {
    if (info.host === Office.HostApplication.Outlook) {
        console.log('✅ Emineon Outlook Add-in loaded successfully');
        
        // Initialize icons
        lucide.createIcons();
        
        // Initialize the add-in
        initializeAddin();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start analyzing the current email
        analyzeCurrentEmail();
    }
});

// Global variables
let currentEmailData = {};
let aiAnalysisComplete = false;

/**
 * Initialize the add-in
 */
function initializeAddin() {
    console.log('🔧 Initializing Emineon Add-in...');
    
    // Update connection status
    updateConnectionStatus(true);
    
    // Load email context
    loadEmailContext();
    
    console.log('✅ Add-in initialization complete');
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Settings button
    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
    
    // Primary action buttons
    document.getElementById('createProjectBtn')?.addEventListener('click', createProject);
    document.getElementById('createJobBtn')?.addEventListener('click', createJob);
    document.getElementById('addCandidateBtn')?.addEventListener('click', showAddCandidateModal);
    
    // Secondary action buttons
    document.getElementById('parseResumeBtn')?.addEventListener('click', parseResume);
    document.getElementById('scheduleInterviewBtn')?.addEventListener('click', scheduleInterview);
    document.getElementById('addContactBtn')?.addEventListener('click', showAddContactModal);
    document.getElementById('assignJobBtn')?.addEventListener('click', assignToJob);
    
    // Quick access buttons
    document.getElementById('openAtsBtn')?.addEventListener('click', openATS);
    document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
    
    // Modal event listeners
    setupModalEventListeners();
    
    console.log('✅ Event listeners set up');
}

/**
 * Set up modal event listeners
 */
function setupModalEventListeners() {
    // Add Contact Modal
    const addContactModal = document.getElementById('addContactModal');
    const closeContactModal = document.getElementById('closeContactModal');
    const cancelContactBtn = document.getElementById('cancelContactBtn');
    const contactForm = document.getElementById('contactForm');
    
    closeContactModal?.addEventListener('click', () => hideModal('addContactModal'));
    cancelContactBtn?.addEventListener('click', () => hideModal('addContactModal'));
    contactForm?.addEventListener('submit', handleContactFormSubmit);
    
    // Close modal when clicking outside
    addContactModal?.addEventListener('click', (e) => {
        if (e.target === addContactModal) {
            hideModal('addContactModal');
        }
    });
}

/**
 * Load email context and display basic info
 */
function loadEmailContext() {
    Office.context.mailbox.item.subject.getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            currentEmailData.subject = result.value || 'No subject';
            document.getElementById('emailSubject').textContent = currentEmailData.subject;
        }
    });
    
    Office.context.mailbox.item.from.getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            const from = result.value;
            currentEmailData.sender = from.displayName || from.emailAddress || 'Unknown sender';
            document.getElementById('emailSender').textContent = currentEmailData.sender;
        }
    });
    
    // Check for attachments
    checkForAttachments();
}

/**
 * Check for attachments and display them
 */
function checkForAttachments() {
    Office.context.mailbox.item.attachments.getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            const attachments = result.value;
            
            if (attachments && attachments.length > 0) {
                displayAttachments(attachments);
            }
        }
    });
}

/**
 * Display attachments in the UI
 */
function displayAttachments(attachments) {
    const attachmentPanel = document.getElementById('attachmentPanel');
    const attachmentList = document.getElementById('attachmentList');
    
    if (!attachmentPanel || !attachmentList) return;
    
    attachmentList.innerHTML = '';
    
    attachments.forEach(attachment => {
        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        
        const isResume = attachment.name.toLowerCase().includes('cv') || 
                        attachment.name.toLowerCase().includes('resume') ||
                        attachment.contentType === 'application/pdf';
        
        attachmentItem.innerHTML = `
            <div class="attachment-info">
                <i data-lucide="${getAttachmentIcon(attachment.contentType)}" style="width: 14px; height: 14px;"></i>
                <span class="attachment-name">${attachment.name}</span>
                <span class="attachment-size">(${formatFileSize(attachment.size)})</span>
            </div>
            ${isResume ? '<span class="resume-badge">Resume</span>' : ''}
        `;
        
        attachmentList.appendChild(attachmentItem);
    });
    
    attachmentPanel.classList.add('show');
    lucide.createIcons();
}

/**
 * Get appropriate icon for attachment type
 */
function getAttachmentIcon(contentType) {
    if (contentType.includes('pdf')) return 'file-text';
    if (contentType.includes('word')) return 'file-text';
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return 'file-spreadsheet';
    return 'file';
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Analyze current email with AI
 */
async function analyzeCurrentEmail() {
    try {
        // Get email body
        Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, async (result) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
                currentEmailData.body = result.value;
                
                // Perform AI analysis
                await performAIAnalysis();
            }
        });
    } catch (error) {
        console.error('Error analyzing email:', error);
        showAIError('Failed to analyze email');
    }
}

/**
 * Perform AI analysis of the email
 */
async function performAIAnalysis() {
    try {
        const emailData = {
            subject: currentEmailData.subject,
            sender: currentEmailData.sender,
            body: currentEmailData.body,
            date: new Date().toISOString()
        };
        
        // Simulate AI analysis (replace with actual API call)
        setTimeout(() => {
            const analysisResult = analyzeEmailContent(emailData);
            displayAIAnalysis(analysisResult);
            updateEmailCategory(analysisResult.category);
            updatePriorityLevel(analysisResult.priority);
        }, 2000);
        
    } catch (error) {
        console.error('AI Analysis error:', error);
        showAIError('AI analysis failed');
    }
}

/**
 * Analyze email content and return suggestions
 */
function analyzeEmailContent(emailData) {
    const subject = emailData.subject.toLowerCase();
    const body = emailData.body.toLowerCase();
    const sender = emailData.sender.toLowerCase();
    
    // Determine email category
    let category = 'general';
    let priority = 'medium';
    let suggestions = [];
    
    // Check for candidate-related keywords
    if (body.includes('resume') || body.includes('cv') || body.includes('application') || 
        body.includes('applying for') || body.includes('interested in the position')) {
        category = 'candidate';
        suggestions.push({
            action: 'Add as candidate',
            confidence: 85,
            icon: 'user-plus'
        });
        suggestions.push({
            action: 'Parse resume',
            confidence: 90,
            icon: 'file-text'
        });
    }
    
    // Check for job opportunity keywords
    if (body.includes('position') || body.includes('role') || body.includes('opening') ||
        body.includes('hiring') || body.includes('job') || body.includes('opportunity')) {
        category = 'opportunity';
        suggestions.push({
            action: 'Create job posting',
            confidence: 75,
            icon: 'briefcase'
        });
    }
    
    // Check for project keywords
    if (body.includes('project') || body.includes('multiple positions') || 
        body.includes('team') || body.includes('several roles')) {
        category = 'project';
        suggestions.push({
            action: 'Create project',
            confidence: 80,
            icon: 'folder-plus'
        });
    }
    
    // Check for interview keywords
    if (body.includes('interview') || body.includes('schedule') || body.includes('meeting')) {
        category = 'interview';
        suggestions.push({
            action: 'Schedule interview',
            confidence: 70,
            icon: 'calendar-plus'
        });
    }
    
    // Determine priority
    if (body.includes('urgent') || body.includes('asap') || body.includes('immediately')) {
        priority = 'high';
    } else if (body.includes('when you have time') || body.includes('no rush')) {
        priority = 'low';
    }
    
    return {
        category,
        priority,
        suggestions,
        summary: generateSummary(emailData, category)
    };
}

/**
 * Generate AI summary based on email content
 */
function generateSummary(emailData, category) {
    const summaries = {
        candidate: `Candidate inquiry detected. Email from ${emailData.sender} regarding job application.`,
        opportunity: `Job opportunity identified. Review email for position details and requirements.`,
        project: `Multi-position project detected. Consider creating a project to manage multiple roles.`,
        interview: `Interview-related communication. Schedule or manage interview process.`,
        general: `General recruitment communication. Review for actionable items.`
    };
    
    return summaries[category] || summaries.general;
}

/**
 * Display AI analysis results
 */
function displayAIAnalysis(analysisResult) {
    const aiMessage = document.getElementById('aiMessage');
    const aiSuggestions = document.getElementById('aiSuggestions');
    
    if (!aiMessage || !aiSuggestions) return;
    
    // Update AI message
    aiMessage.innerHTML = `
        <div style="font-size: 13px; color: var(--primary-600); line-height: 1.4;">
            ${analysisResult.summary}
        </div>
    `;
    
    // Display suggestions
    if (analysisResult.suggestions.length > 0) {
        aiSuggestions.innerHTML = '';
        
        analysisResult.suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.innerHTML = `
                <div class="suggestion-left">
                    <i data-lucide="${suggestion.icon}" style="width: 14px; height: 14px;"></i>
                    <span class="suggestion-text">${suggestion.action}</span>
                </div>
                <span class="confidence-score">${suggestion.confidence}%</span>
            `;
            
            suggestionItem.addEventListener('click', () => executeSuggestion(suggestion.action));
            aiSuggestions.appendChild(suggestionItem);
        });
        
        aiSuggestions.classList.add('show');
        lucide.createIcons();
    }
    
    aiAnalysisComplete = true;
}

/**
 * Execute AI suggestion
 */
function executeSuggestion(action) {
    switch (action.toLowerCase()) {
        case 'add as candidate':
            showAddCandidateModal();
            break;
        case 'parse resume':
            parseResume();
            break;
        case 'create job posting':
            createJob();
            break;
        case 'create project':
            createProject();
            break;
        case 'schedule interview':
            scheduleInterview();
            break;
        default:
            showNotification('Action not implemented yet', 'warning');
    }
}

/**
 * Show AI error message
 */
function showAIError(message) {
    const aiMessage = document.getElementById('aiMessage');
    if (aiMessage) {
        aiMessage.innerHTML = `
            <div style="color: var(--error-600); font-size: 13px;">
                <i data-lucide="alert-circle" style="width: 14px; height: 14px; margin-right: 6px;"></i>
                ${message}
            </div>
        `;
        lucide.createIcons();
    }
}

/**
 * Update email category badge
 */
function updateEmailCategory(category) {
    const emailCategory = document.getElementById('emailCategory');
    if (!emailCategory) return;
    
    const categoryConfig = {
        candidate: { text: 'Candidate', class: 'status-candidate', icon: 'user' },
        opportunity: { text: 'Opportunity', class: 'status-opportunity', icon: 'briefcase' },
        project: { text: 'Project', class: 'status-project', icon: 'folder' },
        interview: { text: 'Interview', class: 'status-interview', icon: 'calendar' },
        general: { text: 'General', class: 'status-general', icon: 'tag' }
    };
    
    const config = categoryConfig[category] || categoryConfig.general;
    
    emailCategory.className = `status-badge ${config.class}`;
    emailCategory.innerHTML = `
        <i data-lucide="${config.icon}" style="width: 10px; height: 10px;"></i>
        ${config.text}
    `;
    
    lucide.createIcons();
}

/**
 * Update priority level
 */
function updatePriorityLevel(priority) {
    const emailPriority = document.getElementById('emailPriority');
    if (!emailPriority) return;
    
    emailPriority.className = `priority-badge priority-${priority}`;
    emailPriority.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Update connection status
 */
function updateConnectionStatus(connected) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.connection-status span');
    
    if (statusDot && statusText) {
        statusDot.style.background = connected ? '#10B981' : '#EF4444';
        statusText.textContent = connected ? 'Connected' : 'Disconnected';
    }
}

// Button action handlers

/**
 * Open settings
 */
function openSettings() {
    showNotification('Settings panel coming soon!', 'info');
}

/**
 * Create project from email
 */
async function createProject() {
    try {
        showNotification('Creating project from email...', 'info');
        
        const emailData = {
            subject: currentEmailData.subject,
            sender: currentEmailData.sender,
            body: currentEmailData.body,
            date: new Date().toISOString()
        };
        
        // This would normally call your API
        // const response = await fetch('/api/projects/parse-email', { ... });
        
        // Simulate success
        setTimeout(() => {
            showNotification('Project created successfully!', 'success');
        }, 1500);
        
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Failed to create project', 'error');
    }
}

/**
 * Create job from email
 */
function createJob() {
    showNotification('Creating job posting...', 'info');
    setTimeout(() => {
        showNotification('Job posting created!', 'success');
    }, 1000);
}

/**
 * Show add candidate modal
 */
function showAddCandidateModal() {
    // Pre-fill with email data if available
    const modal = document.getElementById('addContactModal');
    const contactType = document.getElementById('contactType');
    const contactEmail = document.getElementById('contactEmail');
    const contactNotes = document.getElementById('contactNotes');
    
    if (contactType) contactType.value = 'candidate';
    if (contactEmail) contactEmail.value = extractEmailFromSender(currentEmailData.sender);
    if (contactNotes) contactNotes.value = `Added from email: "${currentEmailData.subject}"`;
    
    showModal('addContactModal');
}

/**
 * Show add contact modal
 */
function showAddContactModal() {
    // Pre-fill with email data
    const contactEmail = document.getElementById('contactEmail');
    const contactNotes = document.getElementById('contactNotes');
    
    if (contactEmail) contactEmail.value = extractEmailFromSender(currentEmailData.sender);
    if (contactNotes) contactNotes.value = `Added from email communication: "${currentEmailData.subject}"`;
    
    showModal('addContactModal');
}

/**
 * Extract email address from sender string
 */
function extractEmailFromSender(sender) {
    if (!sender) return '';
    
    const emailMatch = sender.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : '';
}

/**
 * Parse resume from attachments
 */
function parseResume() {
    Office.context.mailbox.item.attachments.getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
            const attachments = result.value;
            const resumeAttachment = attachments.find(att => 
                att.name.toLowerCase().includes('cv') || 
                att.name.toLowerCase().includes('resume') ||
                att.contentType === 'application/pdf'
            );
            
            if (resumeAttachment) {
                showNotification('Parsing resume...', 'info');
                setTimeout(() => {
                    showNotification('Resume parsed successfully!', 'success');
                }, 2000);
            } else {
                showNotification('No resume attachment found', 'warning');
            }
        }
    });
}

/**
 * Schedule interview
 */
function scheduleInterview() {
    showNotification('Opening interview scheduler...', 'info');
    setTimeout(() => {
        showNotification('Interview scheduled!', 'success');
    }, 1000);
}

/**
 * Assign to job
 */
function assignToJob() {
    showNotification('Opening job assignment...', 'info');
    setTimeout(() => {
        showNotification('Assigned to job successfully!', 'success');
    }, 1000);
}

/**
 * Open ATS in new window
 */
function openATS() {
    const atsUrl = 'https://app-emineon-3h5xnu9vi-david-bicrawais-projects.vercel.app';
    window.open(atsUrl, '_blank');
    showNotification('Opening Emineon ATS...', 'info');
}

/**
 * Refresh data
 */
function refreshData() {
    showNotification('Refreshing data...', 'info');
    
    // Reload email context
    loadEmailContext();
    
    // Re-run AI analysis
    if (currentEmailData.body) {
        setTimeout(() => {
            analyzeCurrentEmail();
            showNotification('Data refreshed!', 'success');
        }, 1000);
    } else {
        setTimeout(() => {
            showNotification('Data refreshed!', 'success');
        }, 500);
    }
}

// Modal functions

/**
 * Show modal
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Hide modal
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        type: document.getElementById('contactType').value,
        firstName: document.getElementById('contactFirstName').value,
        lastName: document.getElementById('contactLastName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value,
        company: document.getElementById('contactCompany').value,
        position: document.getElementById('contactPosition').value,
        notes: document.getElementById('contactNotes').value
    };
    
    try {
        showNotification('Saving contact...', 'info');
        
        // Simulate API call
        setTimeout(() => {
            showNotification(`${contactData.type.charAt(0).toUpperCase() + contactData.type.slice(1)} added successfully!`, 'success');
            hideModal('addContactModal');
            
            // Reset form
            document.getElementById('contactForm').reset();
        }, 1000);
        
    } catch (error) {
        console.error('Error saving contact:', error);
        showNotification('Failed to save contact', 'error');
    }
}

// Notification system

/**
 * Show notification
 */
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    // Update notification content
    notificationText.textContent = message;
    
    // Update notification type
    notification.className = `notification ${type}`;
    
    // Update icon based on type
    const iconElement = notification.querySelector('i');
    if (iconElement) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        iconElement.setAttribute('data-lucide', icons[type] || 'info');
        lucide.createIcons();
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Utility functions

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

console.log('✅ Emineon Outlook Add-in JavaScript loaded'); 