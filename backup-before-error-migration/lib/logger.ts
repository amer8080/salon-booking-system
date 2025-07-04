// src/lib/logger.ts - Professional Logging System (مُصحح)
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  apiEndpoint?: string;
  duration?: number;
  error?: string; // ✅ إضافة error property
  metadata?: Record<string, any>;
}

export interface ErrorLog {
  id?: number;
  level: string;
  message: string;
  context: string;
  stackTrace?: string;
  userId?: string;
  apiEndpoint?: string;
  createdAt?: Date;
}

class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private isDevelopment: boolean;
  private logDir: string;
  private prisma: any = null; // ✅ استخدام any بدلاً من PrismaClient

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.level = this.getLogLevel();
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();

    // Initialize Prisma only for critical errors
    if (!this.isDevelopment) {
      this.initializePrisma();
    }
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getLogLevel(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLevel) {
      case 'ERROR':
        return LogLevel.ERROR;
      case 'WARN':
        return LogLevel.WARN;
      case 'INFO':
        return LogLevel.INFO;
      case 'DEBUG':
        return LogLevel.DEBUG;
      default:
        return this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR;
    }
  }

  private ensureLogDirectory(): void {
    if (!this.isDevelopment && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private async initializePrisma(): Promise<void> {
    try {
      const { prisma } = await import('@/lib/prisma');
      this.prisma = prisma;
    } catch (_error) {
      // Fallback to file logging only
      if (this.isDevelopment) {
        console.error('Failed to initialize Prisma for logging:', error);
      }
    }
  }

  private formatLogMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';
    return `[${timestamp}] [${level}] ${message} ${contextStr}`;
  }

  private async writeToFile(level: string, message: string, context?: LogContext): Promise<void> {
    if (this.isDevelopment) return;

    try {
      const logMessage = this.formatLogMessage(level, message, context);
      const fileName = `salon-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = path.join(this.logDir, fileName);

      fs.appendFileSync(filePath, logMessage + '\n');
    } catch (_error) {
      // Silent fail for file operations in production
    }
  }

  private async saveToDatabase(
    level: string,
    message: string,
    context?: LogContext,
    error?: Error,
  ): Promise<void> {
    // Only save ERROR level to database
    if (level !== 'ERROR' || !this.prisma || this.isDevelopment) return;

    try {
      await this.prisma.$executeRaw`
        INSERT INTO error_logs (level, message, context, stack_trace, user_id, api_endpoint, created_at)
        VALUES (${level}, ${message}, ${JSON.stringify(context || {})}, 
                ${error?.stack || null}, ${context?.userId || null}, 
                ${context?.apiEndpoint || null}, NOW())
      `;
    } catch (dbError) {
      // Fallback to file logging if database fails
      await this.writeToFile('ERROR', `Database logging failed: ${String(dbError)}`);
    }
  }

  public async error(message: string, context?: LogContext, error?: Error): Promise<void> {
    if (this.level < LogLevel.ERROR) return;

    const logMessage = `❌ ${message}`;

    if (this.isDevelopment) {
      console.error(logMessage, context, error?.stack);
    } else {
      await this.writeToFile('ERROR', message, context);
      await this.saveToDatabase('ERROR', message, context, error);
    }
  }

  public async warn(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.WARN) return;

    const logMessage = `⚠️  ${message}`;

    if (this.isDevelopment) {
      console.warn(logMessage, context);
    } else {
      await this.writeToFile('WARN', message, context);
    }
  }

  public async info(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.INFO) return;

    const logMessage = `ℹ️  ${message}`;

    if (this.isDevelopment) {
      console.warn(logMessage, context);
    } else {
      await this.writeToFile('INFO', message, context);
    }
  }

  public async debug(message: string, context?: LogContext): Promise<void> {
    if (this.level < LogLevel.DEBUG) return;

    const logMessage = `🔍 ${message}`;

    if (this.isDevelopment) {
      console.warn(logMessage, context);
    }
    // No file/db logging for debug in production
  }

  // API Performance Tracking
  public async apiCall<T>(
    endpoint: string,
    operation: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const startTime = Date.now();
    const apiContext = { ...context, apiEndpoint: endpoint };

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      if (duration > 1000) {
        await this.warn(`Slow API call: ${endpoint} took ${duration}ms`, {
          ...apiContext,
          duration,
        });
      } else if (this.isDevelopment) {
        await this.debug(`API call: ${endpoint} completed in ${duration}ms`, {
          ...apiContext,
          duration,
        });
      }

      return result;
    } catch (_error) {
      const duration = Date.now() - startTime;
      await this.error(
        `API call failed: ${endpoint}`,
        {
          ...apiContext,
          duration,
          error: error instanceof Error ? error.message : String(error),
        },
        error instanceof Error ? error : undefined,
      );

      throw error;
    }
  }

  // Clean up old log files
  public cleanupOldLogs(daysToKeep: number = 30): void {
    if (this.isDevelopment) return;

    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (_error) {
      // Silent fail for cleanup
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common use cases
export const logError = (message: string, context?: LogContext, error?: Error) =>
  logger.error(message, context, error);

export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context);

export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);

export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);

// API wrapper for performance tracking
export const trackApiCall = <T>(
  endpoint: string,
  operation: () => Promise<T>,
  context?: LogContext,
) => logger.apiCall(endpoint, operation, context);

