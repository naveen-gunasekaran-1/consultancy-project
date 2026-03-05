import { config } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = (config.logLevel || 'info').toLowerCase() as LogLevel;

const shouldLog = (level: LogLevel): boolean => {
  const threshold = LOG_LEVELS[currentLevel] ?? LOG_LEVELS.info;
  return LOG_LEVELS[level] >= threshold;
};

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
};

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  if (!shouldLog(level)) {
    return;
  }

  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta) {
    const normalized = { ...meta };
    if ('error' in normalized) {
      normalized.error = serializeError(normalized.error);
    }
    payload.meta = normalized;
  }

  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
    return;
  }
  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => writeLog('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => writeLog('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => writeLog('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => writeLog('error', message, meta),
};
