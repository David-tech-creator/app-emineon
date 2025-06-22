/* global Office */

// Emineon Email Templates for Outlook
class EmineonEmailTemplates {
    constructor() {
        this.apiBaseUrl = 'https://app-emineon.vercel.app/api';
        this.templates = [];
        this.selectedTemplate = null;
        this.currentCategory = 'all';
        
        // Initialize when Office.js is ready
        Office.onReady(() => {
            this.init();
        });
    }

    async init() {
        console.log('🚀 Emineon Email Templates - Initializing...');
        
        // Initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load templates
        await this.loadTemplates();
        
        console.log('✅ Emineon Email Templates - Ready!');
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCategory(e.target.dataset.category));
        });
        
        // AI Assistant
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generateAIEmail());
        
        // Template Library
        document.getElementById('searchBtn')?.addEventListener('click', () => this.toggleSearch());
        document.getElementById('createTemplateBtn')?.addEventListener('click', () => this.createTemplate());
        document.getElementById('templateSearch')?.addEventListener('input', (e) => this.searchTemplates(e.target.value));
        
        // Template Preview
        document.getElementById('editTemplateBtn')?.addEventListener('click', () => this.editTemplate());
        document.getElementById('useTemplateBtn')?.addEventListener('click', () => this.useTemplate());
        
        // Quick Actions
        document.getElementById('improveEmailBtn')?.addEventListener('click', () => this.improveEmail());
        document.getElementById('translateBtn')?.addEventListener('click', () => this.translateEmail());
        document.getElementById('checkToneBtn')?.addEventListener('click', () => this.checkTone());
        document.getElementById('scheduleBtn')?.addEventListener('click', () => this.scheduleEmail());
        
        // Settings
        document.getElementById('customizeBtn')?.addEventListener('click', () => this.openCustomization());
    }

    selectCategory(category) {
        this.currentCategory = category;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        // Filter templates
        this.displayTemplates();
    }

    async loadTemplates() {
        try {
            // Load default templates (could be from API in future)
            this.templates = this.getDefaultTemplates();
            this.displayTemplates();
        } catch (error) {
            console.error('Error loading templates:', error);
            this.showError('Failed to load templates');
        }
    }

    getDefaultTemplates() {
        return [
            {
                id: 'outreach_1',
                category: 'outreach',
                title: 'Initial Candidate Outreach',
                subject: 'Exciting {{position}} opportunity at {{company}}',
                body: `Hi {{candidate_name}},

I hope this email finds you well. I came across your profile and was impressed by your background in {{skills}}.

We have an exciting {{position}} opportunity at {{company}} that I believe would be a great fit for your experience. The role involves:

• {{responsibility_1}}
• {{responsibility_2}}
• {{responsibility_3}}

What makes this opportunity special:
- {{benefit_1}}
- {{benefit_2}}
- {{benefit_3}}

Would you be open to a brief conversation to learn more about this opportunity? I'd love to hear about your current situation and see if this might be of interest.

Best regards,
{{recruiter_name}}
{{company}}
{{phone}} | {{email}}`,
                tags: ['outreach', 'initial', 'candidate']
            },
            {
                id: 'follow_up_1',
                category: 'follow-up',
                title: 'Follow-up After Application',
                subject: 'Thank you for your application - {{position}} at {{company}}',
                body: `Dear {{candidate_name}},

Thank you for your interest in the {{position}} role at {{company}}. We received your application and wanted to acknowledge it promptly.

Our hiring team is currently reviewing all applications, and we expect to complete the initial screening process by {{review_date}}. If your background aligns with what we're looking for, we'll reach out to schedule a conversation.

In the meantime, feel free to explore more about {{company}} on our website and connect with us on LinkedIn.

We appreciate your interest in joining our team!

Best regards,
{{recruiter_name}}
{{company}}`,
                tags: ['follow-up', 'application', 'acknowledgment']
            },
            {
                id: 'interview_1',
                category: 'interview',
                title: 'Interview Invitation',
                subject: 'Interview invitation - {{position}} at {{company}}',
                body: `Dear {{candidate_name}},

We were impressed with your application for the {{position}} role and would like to invite you for an interview.

Interview Details:
• Date: {{interview_date}}
• Time: {{interview_time}}
• Duration: {{duration}} minutes
• Format: {{format}} (Video call/In-person)
• Location/Link: {{location_or_link}}

You'll be meeting with:
• {{interviewer_1}} - {{title_1}}
• {{interviewer_2}} - {{title_2}}

To prepare for the interview:
- Review the job description and company information
- Prepare examples of your relevant experience
- Have questions ready about the role and company

Please confirm your availability by replying to this email. If you need to reschedule, please let me know as soon as possible.

Looking forward to our conversation!

Best regards,
{{recruiter_name}}
{{company}}`,
                tags: ['interview', 'invitation', 'scheduling']
            },
            {
                id: 'offer_1',
                category: 'offer',
                title: 'Job Offer Letter',
                subject: 'Job Offer - {{position}} at {{company}}',
                body: `Dear {{candidate_name}},

We are delighted to extend an offer for the position of {{position}} at {{company}}. After careful consideration, we believe you would be an excellent addition to our team.

Offer Details:
• Position: {{position}}
• Department: {{department}}
• Start Date: {{start_date}}
• Salary: {{salary}}
• Benefits: {{benefits}}
• Reporting to: {{manager_name}}

This offer is contingent upon:
- Successful completion of background check
- {{additional_conditions}}

Please review the attached detailed offer letter and let us know your decision by {{response_deadline}}. We're excited about the possibility of you joining our team and contributing to our continued success.

If you have any questions, please don't hesitate to reach out.

Congratulations and welcome to the team!

Best regards,
{{recruiter_name}}
{{company}}`,
                tags: ['offer', 'job offer', 'employment']
            },
            {
                id: 'rejection_1',
                category: 'rejection',
                title: 'Polite Rejection',
                subject: 'Update on your application - {{position}} at {{company}}',
                body: `Dear {{candidate_name}},

Thank you for your interest in the {{position}} role at {{company}} and for taking the time to interview with our team.

After careful consideration, we have decided to move forward with another candidate whose experience more closely aligns with our current needs. This was a difficult decision as we were impressed with your background and qualifications.

We encourage you to apply for future opportunities that match your skills and experience. We'll keep your information on file and reach out if a suitable position becomes available.

Thank you again for your interest in {{company}}, and we wish you all the best in your job search.

Best regards,
{{recruiter_name}}
{{company}}`,
                tags: ['rejection', 'polite', 'future opportunities']
            }
        ];
    }

    displayTemplates() {
        const templatesList = document.getElementById('templatesList');
        if (!templatesList) return;

        let filteredTemplates = this.templates;
        
        // Filter by category
        if (this.currentCategory !== 'all') {
            filteredTemplates = this.templates.filter(t => t.category === this.currentCategory);
        }

        // Filter by search
        const searchTerm = document.getElementById('templateSearch')?.value?.toLowerCase();
        if (searchTerm) {
            filteredTemplates = filteredTemplates.filter(t => 
                t.title.toLowerCase().includes(searchTerm) ||
                t.subject.toLowerCase().includes(searchTerm) ||
                t.body.toLowerCase().includes(searchTerm) ||
                t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        if (filteredTemplates.length === 0) {
            templatesList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    <p class="text-sm">No templates found</p>
                    <p class="text-xs">Try a different search term or category</p>
                </div>
            `;
        } else {
            templatesList.innerHTML = filteredTemplates.map(template => `
                <div class="template-card" data-template-id="${template.id}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-900 text-sm">${template.title}</h4>
                            <p class="text-xs text-gray-600 mt-1">${template.subject}</p>
                            <div class="flex flex-wrap gap-1 mt-2">
                                ${template.tags.map(tag => `
                                    <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                        <button class="text-gray-400 hover:text-gray-600 ml-2">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add click listeners to template cards
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                this.selectTemplate(templateId);
            });
        });
    }

    selectTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        this.selectedTemplate = template;

        // Update UI
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-template-id="${templateId}"]`)?.classList.add('selected');

        // Show preview
        this.showTemplatePreview(template);
    }

    showTemplatePreview(template) {
        const previewCard = document.getElementById('templatePreview');
        const subjectElement = document.getElementById('previewSubject');
        const bodyElement = document.getElementById('previewBody');

        if (previewCard) previewCard.classList.remove('hidden');
        if (subjectElement) subjectElement.textContent = template.subject;
        if (bodyElement) bodyElement.textContent = template.body;
    }

    async generateAIEmail() {
        const purpose = document.getElementById('emailPurpose')?.value;
        const context = document.getElementById('emailContext')?.value;
        const personalize = document.getElementById('personalizeEmail')?.checked;

        if (!purpose) {
            this.showError('Please select an email purpose');
            return;
        }

        this.showLoading('Generating AI email...');

        try {
            const response = await fetch(`${this.apiBaseUrl}/ai/generate-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    purpose,
                    context,
                    personalize,
                    currentEmailContent: await this.getCurrentEmailContent()
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    await this.insertGeneratedEmail(result.data);
                    this.showSuccess('AI email generated successfully!');
                } else {
                    throw new Error(result.message || 'Failed to generate email');
                }
            } else {
                throw new Error('Failed to generate email');
            }
        } catch (error) {
            console.error('AI email generation error:', error);
            this.showError('Failed to generate email. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getCurrentEmailContent() {
        return new Promise((resolve) => {
            Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, (result) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value);
                } else {
                    resolve('');
                }
            });
        });
    }

    async insertGeneratedEmail(emailData) {
        return new Promise((resolve, reject) => {
            // Set subject
            if (emailData.subject) {
                Office.context.mailbox.item.subject.setAsync(emailData.subject, (result) => {
                    if (result.status !== Office.AsyncResultStatus.Succeeded) {
                        console.error('Failed to set subject:', result.error);
                    }
                });
            }

            // Set body
            if (emailData.body) {
                Office.context.mailbox.item.body.setAsync(
                    emailData.body,
                    { coercionType: Office.CoercionType.Html },
                    (result) => {
                        if (result.status === Office.AsyncResultStatus.Succeeded) {
                            resolve();
                        } else {
                            reject(new Error('Failed to insert email content'));
                        }
                    }
                );
            } else {
                resolve();
            }
        });
    }

    async useTemplate() {
        if (!this.selectedTemplate) {
            this.showError('Please select a template first');
            return;
        }

        this.showLoading('Applying template...');

        try {
            // Process template variables
            const processedTemplate = await this.processTemplateVariables(this.selectedTemplate);
            
            // Insert into email
            await this.insertGeneratedEmail(processedTemplate);
            
            this.showSuccess('Template applied successfully!');
        } catch (error) {
            console.error('Template application error:', error);
            this.showError('Failed to apply template');
        } finally {
            this.hideLoading();
        }
    }

    async processTemplateVariables(template) {
        // In a real implementation, this would:
        // 1. Detect available variables from context (candidate info, job info, etc.)
        // 2. Prompt user for missing variables
        // 3. Replace variables with actual values
        
        // For now, return template with placeholder replacement prompts
        let subject = template.subject;
        let body = template.body;

        // Simple variable replacement (in real implementation, this would be more sophisticated)
        const variables = this.extractVariables(template.subject + ' ' + template.body);
        
        // For demo purposes, replace with placeholder values
        variables.forEach(variable => {
            const placeholder = `[${variable.toUpperCase()}]`;
            subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), placeholder);
            body = body.replace(new RegExp(`{{${variable}}}`, 'g'), placeholder);
        });

        return { subject, body };
    }

    extractVariables(text) {
        const regex = /{{(\w+)}}/g;
        const variables = [];
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            if (!variables.includes(match[1])) {
                variables.push(match[1]);
            }
        }
        
        return variables;
    }

    toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('templateSearch');
        
        if (searchBar?.classList.contains('hidden')) {
            searchBar.classList.remove('hidden');
            searchInput?.focus();
        } else {
            searchBar?.classList.add('hidden');
            if (searchInput) searchInput.value = '';
            this.displayTemplates();
        }
    }

    searchTemplates(searchTerm) {
        this.displayTemplates();
    }

    createTemplate() {
        this.showError('Custom template creation coming soon!');
    }

    editTemplate() {
        if (!this.selectedTemplate) {
            this.showError('Please select a template first');
            return;
        }
        this.showError('Template editing coming soon!');
    }

    async improveEmail() {
        this.showError('Email improvement coming soon!');
    }

    async translateEmail() {
        this.showError('Email translation coming soon!');
    }

    async checkTone() {
        this.showError('Tone analysis coming soon!');
    }

    async scheduleEmail() {
        this.showError('Email scheduling coming soon!');
    }

    openCustomization() {
        this.showError('Customization settings coming soon!');
    }

    // Utility methods
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.querySelector('span').textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        }`;
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i data-lucide="${type === 'error' ? 'alert-circle' : type === 'success' ? 'check-circle' : 'info'}" class="w-4 h-4"></i>
                <span class="text-sm">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the email templates add-in
const emineonEmailTemplates = new EmineonEmailTemplates(); 