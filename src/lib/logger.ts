import pino from 'pino';

/**
 * Centralized logger using Pino for structured logging
 * 
 * Features:
 * - Structured JSON logging in production
 * - Pretty printing in development
 * - Automatic redaction of sensitive fields
 * - Appropriate log levels
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Redact sensitive fields from logs
  redact: {
    paths: [
      'password',
      'token',
      'authorization',
      'cookie',
      'apiKey',
      'api_key',
      'secret',
      'cognito_sub',
      'email', // Partial redaction - keep domain
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },

  // Pretty print in development for better readability
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,

  // Base fields for all logs
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * Create a child logger with additional context
 * @param context - Additional context to include in all logs
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

export default logger;
