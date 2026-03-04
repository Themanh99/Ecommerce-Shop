import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends ConsoleLogger {
  logRequest(method: string, url: string, context = 'HTTP'): void {
    this.log(`${method} ${url}`, context);
  }

  logResponse(method: string, url: string, statusCode: number, context = 'HTTP'): void {
    this.log(`${method} ${url} -> ${statusCode}`, context);
  }

  logError(message: string, trace?: string, context = 'App'): void {
    this.error(message, trace, context);
  }
}
