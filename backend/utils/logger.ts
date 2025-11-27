/**
 * Winston Logger Configuration
 *
 * Provides structured logging with file rotation and multiple transports.
 *
 * Log Levels (in order of priority):
 * - error: Critical errors that require immediate attention
 * - warn: Warning messages for potentially harmful situations
 * - info: Informational messages highlighting application progress
 * - http: HTTP request/response logs
 * - debug: Detailed debug information
 *
 * Log Files:
 * - logs/error-%DATE%.log: Only error-level logs (retained for 14 days)
 * - logs/combined-%DATE%.log: All logs (retained for 7 days)
 * - Console: Formatted logs for development (all levels)
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Determine log level based on environment
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Custom format for console output (colorized and readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  })
);

// Custom format for file output (JSON for easier parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: fileFormat,
  defaultMeta: { service: 'aioscrew-backend' },
  transports: [
    // Error log - only errors, kept for 14 days
    new DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
      format: fileFormat,
    }),

    // Combined log - all levels, kept for 7 days
    new DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d',
      maxSize: '20m',
      format: fileFormat,
    }),

    // Console output - always enabled in development
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],

  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join('logs', 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
  ],
});

// Create a stream object for Morgan (HTTP request logger)
export const loggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for common logging patterns
export const logRequest = (method: string, url: string, statusCode?: number, duration?: number) => {
  const meta: any = { method, url };
  if (statusCode) meta.statusCode = statusCode;
  if (duration) meta.duration = `${duration}ms`;

  logger.http(`${method} ${url}`, meta);
};

export const logError = (message: string, error: Error | any, context?: object) => {
  logger.error(message, {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
    ...context,
  });
};

export const logDatabaseQuery = (query: string, duration?: number, rowCount?: number) => {
  const meta: any = { query: query.substring(0, 200) }; // Truncate long queries
  if (duration) meta.duration = `${duration}ms`;
  if (rowCount !== undefined) meta.rowCount = rowCount;

  logger.debug('Database query', meta);
};

export const logJobProgress = (jobId: string, status: string, progress: number, details?: object) => {
  logger.info(`Job ${jobId}: ${status} (${progress}%)`, {
    jobId,
    status,
    progress,
    ...details,
  });
};

export default logger;
