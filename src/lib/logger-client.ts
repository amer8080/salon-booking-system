// src/lib/logger-client.ts - Browser-Safe Logger
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  apiEndpoint?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

class ClientLogger {
  private static instance: ClientLogger;
  private level: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.getLogLevel();
  }

  public static getInstance(): ClientLogger {
    if (!ClientLogger.instance) {
      ClientLogger.instance = new ClientLogger();
    }
    return ClientLogger.instance;
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR': return LogLevel.ERROR;
      case 'WARN': return LogLevel.WARN;
      case 'INFO': return LogLevel.INFO;
      case 'DEBUG': return LogLevel.DEBUG;
      default: return this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
    }
  }

  // Send to API for server-side logging
  private async sendToServer(level: string, message: string, context?: LogContext, error?: Error): Promise<void> {
    if (!this.isDevelopment && level === 'ERROR') {
      try {
        await fetch('/api/logging', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level,
            message,
            context,
            stack: error?.stack,
            timestamp: new Date().toISOString()
          })
        });
      } catch (e) {
        // Silent fail for logging API
      }
    }
  }

  public async error(message: string, context?: LogContext, error?: Error): Promise<void> {
    if (this.level < LogLevel.ERROR) return;

    const logMessage = `❌ ${message}`;
    
    if (this.isDevelopment) {
      console.error(logMessage, context, error?.stack);
    } else {
      await this.sendToServer('ERROR', message, context, error);
    }
  }

  public async warn(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.WARN) return;

    const logMessage = `⚠️  ${message}`;
    
    if (this.isDevelopment) {
      console.warn(logMessage, context);
    } else {
      await this.sendToServer('WARN', message, context);
    }
  }

  public async info(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.INFO) return;

    const logMessage = `ℹ️  ${message}`;
    
    if (this.isDevelopment) {
      console.log(logMessage, context);
    }
    // No server logging for info in production
  }

  public async debug(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.DEBUG) return;

    const logMessage = `🔍 ${message}`;
    
    if (this.isDevelopment) {
      console.log(logMessage, context);
    }
    // No server logging for debug
  }
}

// Export singleton instance
export const clientLogger = ClientLogger.getInstance();

// Convenience functions
export const logError = (message: string, context?: LogContext, error?: Error) => 
  clientLogger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => 
  clientLogger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => 
  clientLogger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => 
  clientLogger.debug(message, context);
