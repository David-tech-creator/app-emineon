export class SmsService {
  async sendSms(to: string, message: string) {
    console.log('Sending SMS:', { to, message });
    return { messageId: `sms_${Date.now()}`, status: 'sent' };
  }
}

export const smsService = new SmsService(); 