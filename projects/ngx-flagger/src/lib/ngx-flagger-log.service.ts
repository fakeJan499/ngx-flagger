import {Inject, Injectable} from '@angular/core';
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {LogLevel} from "./log-level.enum";

@Injectable()
export class NgxFlaggerLogService {
  private readonly prefix = '[NgxFlagger]';

  constructor(@Inject(ngxFlaggerRootConfigInjectionToken) private readonly config: RootConfig){}

  error(message: string) {
    if (this.isEligible(LogLevel.ERROR)) console.error(`${this.prefix} - ${message}`);
  }

  warn(message: string) {
    if (this.isEligible(LogLevel.WARN)) console.warn(`${this.prefix} - ${message}`);
  }

  log(message: string) {
    if (this.isEligible(LogLevel.INFO)) console.log(`${this.prefix} - ${message}`);
  }

  private isEligible(logLevel: LogLevel): boolean {
    return !this.config.debugMessagesDisabled && logLevel >= (this.config.logLevel ?? LogLevel.WARN);
  }
}
