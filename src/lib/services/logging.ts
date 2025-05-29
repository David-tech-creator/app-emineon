export interface LogEntry {
  actor?: string;
  action: string;
  resource: string;
  details?: any;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
}

export class Logger {
  async log(entry: LogEntry) {
    try {
      // For now, just log to console - would integrate with database when Prisma models are available
      const logData = {
        timestamp: new Date().toISOString(),
        actor: entry.actor || 'SYSTEM',
        action: entry.action,
        resource: entry.resource,
        details: entry.details,
        level: entry.level || 'INFO'
      };

      console.log(`[${logData.level}] ${logData.timestamp} - ${logData.actor}: ${logData.action} on ${logData.resource}`, logData.details);
      
      // Would store in database:
      // await prisma.log.create({ data: logData });
      
      return logData;
    } catch (error) {
      console.error('Logging error:', error);
    }
  }

  async getLogs(filters?: {
    actor?: string;
    action?: string;
    resource?: string;
    level?: string;
    limit?: number;
  }) {
    // Mock implementation - would query database
    console.log('Getting logs with filters:', filters);
    return [];
  }
}

export const logger = new Logger(); 