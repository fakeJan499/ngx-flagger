import {Injectable, Optional} from '@angular/core';
import {LogLevel} from "./log-level.enum";
import {LoggerService} from "./logger.service";

@Injectable()
export class ConsoleLoggerService implements LoggerService {
  private readonly prefix = '[NgxFlagger]';
  private readonly logLevel: LogLevel;

  constructor(@Optional() logLevel: LogLevel | null) {
    this.logLevel = logLevel ?? LogLevel.WARN;
  }

  error(message: string) {
    if (this.isEligible(LogLevel.ERROR)) console.error(`${this.prefix} - ${message}`);
  }

  warn(message: string) {
    if (this.isEligible(LogLevel.WARN)) console.warn(`${this.prefix} - ${message}`);
  }

  info(message: string) {
    if (this.isEligible(LogLevel.INFO)) console.info(`${this.prefix} - ${message}`);
  }

  private isEligible(logLevel: LogLevel): boolean {
    return this.logLevel !== LogLevel.NONE && logLevel >= this.logLevel;
  }
}
