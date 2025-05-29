import { loggingService } from './logging';

export interface CalendarEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  description?: string;
}

export class CalendarService {
  async scheduleInterview(event: CalendarEvent) {
    console.log('Scheduling interview:', event);
    
    // Mock implementation
    const eventId = `cal_${Date.now()}`;
    
    await loggingService.log({
      action: 'INTERVIEW_SCHEDULED',
      resource: `calendar:${eventId}`,
      details: { title: event.title, attendees: event.attendees },
    });
    
    return {
      id: eventId,
      ...event,
      link: `https://calendar.google.com/event/${eventId}`,
    };
  }
}

export const calendarService = new CalendarService(); 