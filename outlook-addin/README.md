# Emineon for Email - Outlook Add-in

A powerful Outlook add-in that integrates Emineon ATS directly into your email workflow, enabling recruiters to manage candidates, track opportunities, and streamline recruitment processes without leaving their inbox.

## 🚀 Features

### 📧 Email Analysis & Contact Management
- **Smart Email Analysis**: AI-powered analysis of recruitment emails
- **Automatic Candidate Detection**: Identify and search for existing candidates
- **One-Click Candidate Addition**: Add new candidates directly from emails
- **Contact Information Display**: View candidate profiles and status

### 💼 Opportunity Management
- **Create Opportunities**: Generate job opportunities from email conversations
- **Track Applications**: Monitor candidate progress and status
- **Opportunity Association**: Link emails to existing job openings

### 📝 Notes & Communication
- **Email Notes**: Add contextual notes to candidate profiles
- **Communication History**: Track all email interactions
- **Activity Timeline**: View complete candidate engagement history

### 🤖 AI-Powered Email Templates
- **Smart Template Library**: Pre-built templates for all recruitment scenarios
- **AI Email Generation**: Generate personalized emails based on context
- **Template Categories**: Outreach, follow-up, interview, offer, rejection templates
- **Variable Replacement**: Dynamic content based on candidate and job data

### ⚡ Quick Actions
- **Schedule Interviews**: Direct integration with calendar systems
- **Email Improvement**: AI-powered writing assistance
- **Tone Analysis**: Ensure professional communication
- **Translation Support**: Multi-language recruitment support

## 📋 Prerequisites

- Microsoft Outlook (Office 365, Outlook 2016 or later)
- Active Emineon ATS account
- Internet connection for API integration

## 🛠️ Installation

### Method 1: Sideload for Development

1. **Download the Add-in Files**
   ```bash
   git clone https://github.com/your-repo/emineon-outlook-addin.git
   cd emineon-outlook-addin
   ```

2. **Host the Files**
   - Upload the `outlook-addin` folder to a web server (HTTPS required)
   - Or use a local development server:
   ```bash
   npx http-server outlook-addin --cors -p 8080 --ssl
   ```

3. **Update Manifest URLs**
   - Edit `manifest.xml`
   - Replace all `https://app-emineon.vercel.app/outlook-addin/` URLs with your hosting URL

4. **Sideload in Outlook**
   - Open Outlook on the web or Outlook desktop
   - Go to **Settings** > **Manage Add-ins** > **My add-ins**
   - Click **Add a custom add-in** > **Add from file**
   - Upload the `manifest.xml` file

### Method 2: Microsoft AppSource (Coming Soon)

The add-in will be available on Microsoft AppSource for easy installation.

## ⚙️ Configuration

### 1. Authentication Setup

1. **Open the Add-in**
   - In Outlook, open any email
   - Look for the "Emineon ATS" group in the ribbon
   - Click "Emineon Panel"

2. **Connect to Emineon**
   - Click "Connect to Emineon" in the authentication prompt
   - Sign in with your Emineon ATS credentials
   - Grant necessary permissions

### 2. API Configuration

Update the API base URL in the JavaScript files if using a different Emineon instance:

```javascript
// In taskpane.js and compose-taskpane.js
this.apiBaseUrl = 'https://your-emineon-instance.com/api';
```

## 📖 Usage Guide

### Reading Emails

1. **Open any email** in Outlook
2. **Click "Emineon Panel"** in the ribbon to open the side panel
3. **Analyze the email** by clicking "Analyze" to extract candidate information
4. **Take actions**:
   - Add sender as a candidate
   - Create job opportunities
   - Add notes and track communication
   - View existing candidate profiles

### Composing Emails

1. **Start composing** a new email or reply
2. **Click "Email Templates"** in the ribbon
3. **Choose a template category** or use AI generation:
   - Select email purpose (outreach, follow-up, interview, etc.)
   - Add context and details
   - Generate AI-powered personalized content
4. **Apply template** to your email
5. **Use quick actions** for writing improvement and tone analysis

### Quick Actions from Ribbon

- **Add Candidate**: Instantly add email sender to Emineon ATS
- **Create Opportunity**: Generate job opportunity from email context
- **Schedule Interview**: Set up interview scheduling workflow

## 🔧 API Integration

The add-in integrates with the following Emineon ATS API endpoints:

```javascript
// Authentication
GET  /api/auth/check
POST /api/auth/login

// Candidates
GET    /api/candidates/search?email={email}
POST   /api/candidates
GET    /api/candidates/{id}/opportunities
GET    /api/candidates/{id}/notes

// Opportunities
POST   /api/opportunities
GET    /api/opportunities

// Notes
POST   /api/notes

// AI Services
POST   /api/ai/email-analysis
POST   /api/ai/generate-email

// Interviews
POST   /api/interviews
```

## 🎨 Customization

### Branding

Update the branding elements in the HTML files:

```html
<!-- Update logo and colors -->
<div class="emineon-gradient">
  <!-- Your company branding -->
</div>
```

### Templates

Add custom email templates in `compose-taskpane.js`:

```javascript
// Add to getDefaultTemplates() method
{
  id: 'custom_1',
  category: 'custom',
  title: 'Your Custom Template',
  subject: 'Custom Subject',
  body: 'Custom email body...',
  tags: ['custom', 'your-tag']
}
```

### Styling

Customize the CSS variables in the HTML files:

```css
:root {
  --emineon-primary: #your-primary-color;
  --emineon-secondary: #your-secondary-color;
  --emineon-accent: #your-accent-color;
}
```

## 🔒 Security & Privacy

- **Secure Communication**: All API calls use HTTPS
- **Authentication**: OAuth 2.0 integration with Emineon ATS
- **Data Privacy**: No email content stored locally
- **Permissions**: Minimal required permissions for functionality

## 🐛 Troubleshooting

### Common Issues

1. **Add-in not loading**
   - Check HTTPS hosting requirement
   - Verify manifest.xml URLs are accessible
   - Clear Outlook cache and restart

2. **Authentication failures**
   - Ensure Emineon ATS credentials are correct
   - Check API endpoint availability
   - Verify CORS settings on server

3. **Template not applying**
   - Check Office.js API permissions
   - Verify email composition mode
   - Try refreshing the add-in

### Debug Mode

Enable debug logging:

```javascript
// Add to any .js file
console.log('Debug info:', data);
```

Check browser developer tools (F12) for detailed error messages.

## 📞 Support

- **Documentation**: [Emineon ATS Help Center](https://help.emineon.com)
- **Email Support**: support@emineon.com
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/your-repo/issues)

## 🔄 Updates

The add-in automatically checks for updates. To manually update:

1. Download the latest version
2. Update the hosted files
3. Restart Outlook to load new version

## 📄 License

Copyright © 2024 Emineon ATS. All rights reserved.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

---

**Made with ❤️ by the Emineon Team**

Transform your recruitment workflow with seamless email integration! 