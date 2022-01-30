import {Inject, Injectable} from '@angular/core';
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";

@Injectable()
export class NgxFlaggerLogService {
  private readonly prefix = '[NgxFlagger]';

  constructor(@Inject(ngxFlaggerRootConfigInjectionToken) private readonly config: RootConfig){}

  error(message: string) {
    if (!this.config.debugMessagesDisabled) console.error(`${this.prefix} - ${message}`);
  }

  warn(message: string) {
    if (!this.config.debugMessagesDisabled) console.warn(`${this.prefix} - ${message}`);
  }

  log(message: string) {
    if (!this.config.debugMessagesDisabled) console.log(`${this.prefix} - ${message}`);
  }
}
