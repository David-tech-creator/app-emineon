export class VideoInterviewService {
  async createVideoInterview(candidateId: string) {
    console.log('Creating video interview for candidate:', candidateId);
    const interviewId = `video_${Date.now()}`;
    return {
      id: interviewId,
      url: `https://video-platform.com/interview/${interviewId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }
}

export const videoInterviewService = new VideoInterviewService(); 