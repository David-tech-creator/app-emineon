// Emineon ATS LinkedIn Extension - Content Script
console.log('Emineon ATS Extension loaded on LinkedIn');

class LinkedInScraper {
  constructor() {
    this.isProcessing = false;
    this.init();
  }

  init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.addEmineonButton());
    } else {
      this.addEmineonButton();
    }

    // Handle navigation changes (LinkedIn is SPA)
    this.observeUrlChanges();
  }

  observeUrlChanges() {
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        setTimeout(() => this.addEmineonButton(), 2000); // Wait for content to load
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  addEmineonButton() {
    // Only add button on profile pages
    if (!this.isProfilePage()) return;

    // Remove existing button if present
    const existingButton = document.querySelector('.emineon-add-candidate-btn');
    if (existingButton) existingButton.remove();

    // Find the action buttons container
    const actionContainer = this.findActionContainer();
    if (!actionContainer) {
      console.log('Could not find action container');
      return;
    }

    // Create Emineon button
    const emineonButton = this.createEmineonButton();
    actionContainer.appendChild(emineonButton);
  }

  isProfilePage() {
    return window.location.pathname.includes('/in/') && 
           !window.location.pathname.includes('/search/');
  }

  findActionContainer() {
    // Try multiple selectors for different LinkedIn layouts
    const selectors = [
      '.pv-s-profile-actions',
      '.pv-top-card-v2-ctas',
      '.pv-top-card__actions',
      '.ph5.pb5 .pv-text-details__left-panel .pv-top-card-v2-ctas',
      '.artdeco-card.pv-top-card'
    ];

    for (const selector of selectors) {
      const container = document.querySelector(selector);
      if (container) return container;
    }

    // Fallback: create our own container
    const profileCard = document.querySelector('.pv-top-card') || 
                       document.querySelector('.pv-top-card-v2');
    if (profileCard) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'emineon-button-container';
      profileCard.appendChild(buttonContainer);
      return buttonContainer;
    }

    return null;
  }

  createEmineonButton() {
    const button = document.createElement('button');
    button.className = 'emineon-add-candidate-btn';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      Add to Emineon ATS
    `;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleAddCandidate();
    });

    return button;
  }

  async handleAddCandidate() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    const button = document.querySelector('.emineon-add-candidate-btn');
    
    try {
      // Update button state
      button.innerHTML = `
        <div class="emineon-spinner"></div>
        Processing...
      `;
      button.disabled = true;

      // Extract candidate data
      const candidateData = this.extractCandidateData();
      
      // Send to Emineon ATS
      const result = await this.sendToEmineonATS(candidateData);
      
      if (result.success) {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Added to ATS
        `;
        button.style.backgroundColor = '#10B981';
        
        // Show success notification
        this.showNotification('Candidate added to Emineon ATS successfully!', 'success');
      } else {
        throw new Error(result.error || 'Failed to add candidate');
      }
    } catch (error) {
      console.error('Error adding candidate:', error);
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Error - Try Again
      `;
      button.style.backgroundColor = '#EF4444';
      
      this.showNotification('Failed to add candidate. Please try again.', 'error');
      
      // Reset button after 3 seconds
      setTimeout(() => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          Add to Emineon ATS
        `;
        button.style.backgroundColor = '';
        button.disabled = false;
      }, 3000);
    } finally {
      this.isProcessing = false;
    }
  }

  extractCandidateData() {
    const data = {
      linkedinUrl: window.location.href,
      extractedAt: new Date().toISOString(),
      source: 'linkedin_extension'
    };

    // Extract name
    const nameSelectors = [
      'h1.text-heading-xlarge',
      '.pv-text-details__left-panel h1',
      '.pv-top-card--list h1',
      '.pv-top-card-v2-ctas h1'
    ];
    
    for (const selector of nameSelectors) {
      const nameElement = document.querySelector(selector);
      if (nameElement) {
        const fullName = nameElement.textContent.trim();
        const nameParts = fullName.split(' ');
        data.firstName = nameParts[0];
        data.lastName = nameParts.slice(1).join(' ');
        break;
      }
    }

    // Extract current title and company
    const titleSelectors = [
      '.text-body-medium.break-words',
      '.pv-text-details__left-panel .text-body-medium',
      '.pv-top-card--list .pv-top-card-v2-ctas .text-body-medium'
    ];

    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement) {
        const titleText = titleElement.textContent.trim();
        if (titleText.includes(' at ')) {
          const [title, company] = titleText.split(' at ');
          data.currentTitle = title.trim();
          data.currentCompany = company.trim();
        } else {
          data.currentTitle = titleText;
        }
        break;
      }
    }

    // Extract location
    const locationSelectors = [
      '.text-body-small.inline.t-black--light.break-words',
      '.pv-text-details__left-panel .text-body-small',
      '.pv-top-card-v2-ctas .text-body-small'
    ];

    for (const selector of locationSelectors) {
      const locationElement = document.querySelector(selector);
      if (locationElement && locationElement.textContent.includes(',')) {
        const locationText = locationElement.textContent.trim();
        const [city, country] = locationText.split(',').map(s => s.trim());
        data.location = { city, country };
        break;
      }
    }

    // Extract profile image
    const imageSelectors = [
      '.pv-top-card-profile-picture__image',
      '.profile-photo-edit__preview',
      'img[data-anonymize="headshot-photo"]'
    ];

    for (const selector of imageSelectors) {
      const imageElement = document.querySelector(selector);
      if (imageElement && imageElement.src) {
        data.profileImage = imageElement.src;
        break;
      }
    }

    // Extract about/summary
    const aboutElement = document.querySelector('#about ~ .pv-shared-text-with-see-more .inline-show-more-text');
    if (aboutElement) {
      data.summary = aboutElement.textContent.trim();
    }

    // Extract experience (first few positions)
    const experienceSection = document.querySelector('#experience');
    if (experienceSection) {
      const experienceItems = experienceSection.parentElement.querySelectorAll('.pvs-list__item--line-separated');
      data.workHistory = [];
      
      for (let i = 0; i < Math.min(3, experienceItems.length); i++) {
        const item = experienceItems[i];
        const titleElement = item.querySelector('.mr1.t-bold span[aria-hidden="true"]');
        const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
        const durationElement = item.querySelector('.t-14.t-normal.t-black--light span[aria-hidden="true"]');
        
        if (titleElement && companyElement) {
          data.workHistory.push({
            title: titleElement.textContent.trim(),
            company: companyElement.textContent.trim(),
            duration: durationElement ? durationElement.textContent.trim() : ''
          });
        }
      }
    }

    console.log('Extracted candidate data:', data);
    return data;
  }

  async sendToEmineonATS(candidateData) {
    try {
      // Get stored API configuration
      const config = await chrome.storage.sync.get(['emineonApiUrl', 'emineonApiKey']);
      
      if (!config.emineonApiUrl || !config.emineonApiKey) {
        throw new Error('Emineon ATS not configured. Please set up the extension.');
      }

      const response = await fetch(`${config.emineonApiUrl}/api/candidates/linkedin-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.emineonApiKey}`,
          'X-Extension-Version': '1.0.0'
        },
        body: JSON.stringify(candidateData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.emineon-notification');
    existingNotifications.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `emineon-notification emineon-notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// Initialize the scraper
new LinkedInScraper(); 