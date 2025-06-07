import { openaiService } from '@/lib/openai';
import { loggingService } from './logging';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
  candidateId?: string;
}

export class EmailService {
  async sendEmail(input: SendEmailInput) {
    console.log('Sending email:', input);
    
    // Mock implementation
    const messageId = `email_${Date.now()}`;
    
    await loggingService.log({
      action: 'EMAIL_SENT',
      resource: input.candidateId ? `candidate:${input.candidateId}` : 'email',
      details: { to: input.to, subject: input.subject, messageId },
    });
    
    return { messageId, status: 'sent' };
  }

  async generateEmailTemplate(input: {
    candidateName: string;
    jobTitle: string;
    companyName: string;
    tone: 'professional' | 'friendly' | 'casual';
    purpose: 'communication' | 'interview_invite' | 'rejection' | 'offer';
  }): Promise<EmailTemplate> {
    return openaiService.generateEmailTemplate({
      ...input,
      templateType: input.purpose,
      tone: input.tone,
    });
  }
}

export const emailService = new EmailService(); 