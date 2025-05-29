export class ReferralService {
  async createReferral(data: any) {
    console.log('Creating referral:', data);
    return { id: `ref_${Date.now()}`, ...data };
  }
}

export const referralService = new ReferralService(); 