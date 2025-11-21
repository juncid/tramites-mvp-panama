type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment = import.meta.env.MODE === 'development';
  private serviceName = 'frontend-tramites';
  private logBuffer: LogEntry[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL_MS = 5000;

  constructor() {
    // Iniciar flush automático solo en producción
    if (!this.isDevelopment) {
      window.setInterval(() => {
        this.flushLogs();
      }, this.FLUSH_INTERVAL_MS);
    }
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      // Enviar logs al backend (endpoint opcional)
      if (import.meta.env.VITE_SEND_LOGS_TO_BACKEND === 'true') {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/logs/frontend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logs: logsToSend }),
        }).catch(() => {
          // Silenciar errores de logging para no crear loops
        });
      }
    } catch (error) {
      // Silenciar errores de logging
    }
  }

  private formatLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };
  }

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    const entry = this.formatLogEntry(level, message, data, context);
    const prefix = `[${entry.timestamp}] [${this.serviceName}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;

    // Console output siempre (visible en la consola del navegador)
    switch (level) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'info':
        console.info(prefix, message, data || '');
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(prefix, message, data || '');
        }
        break;
    }

    // Agregar a buffer para envío al backend (opcional)
    if (!this.isDevelopment && (level === 'error' || level === 'warn')) {
      this.logBuffer.push(entry);
      
      // Flush inmediato si hay muchos logs o es un error
      if (this.logBuffer.length >= this.BUFFER_SIZE || level === 'error') {
        this.flushLogs();
      }
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context);
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context);
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context);
  }

  error(message: string, error?: any, context?: string) {
    const errorData = error instanceof Error 
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;
    
    this.log('error', message, errorData, context);
  }

  // Logging específico para llamadas API
  api(method: string, url: string, data?: any) {
    this.info(`API ${method.toUpperCase()} ${url}`, data, 'API');
  }

  apiResponse(method: string, url: string, status: number, data?: any) {
    this.info(
      `API ${method.toUpperCase()} ${url} - ${status}`,
      { status, data },
      'API'
    );
  }

  apiError(method: string, url: string, error: any) {
    const status = error?.response?.status || 'NETWORK_ERROR';
    const errorData = {
      status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    };
    
    this.error(
      `API ${method.toUpperCase()} ${url} - ${status}`,
      errorData,
      'API'
    );
  }

  // Logging de componentes
  component(componentName: string, action: string, data?: any) {
    this.debug(`${componentName}: ${action}`, data, 'COMPONENT');
  }

  // Logging de workflow
  workflow(action: string, data?: any) {
    this.info(action, data, 'WORKFLOW');
  }

  // Logging de navegación
  navigation(from: string, to: string) {
    this.debug(`Navigation: ${from} → ${to}`, null, 'ROUTER');
  }

  // Performance monitoring
  performance(action: string, duration: number, data?: any) {
    this.info(
      `Performance: ${action} took ${duration}ms`,
      { duration, ...data },
      'PERFORMANCE'
    );
  }
}

export const logger = new Logger();
