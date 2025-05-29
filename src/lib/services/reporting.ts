export class ReportingService {
  async getHiringMetrics() {
    console.log('Getting hiring metrics');
    return { totalHires: 45, avgTimeToHire: 21 };
  }
}

export const reportingService = new ReportingService(); 