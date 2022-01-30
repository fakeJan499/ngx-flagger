import {Inject, Injectable} from '@angular/core';
import {NgxFlaggerInitializerService} from "./ngx-flagger-initializer.service";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";

@Injectable()
export class NgxFlaggerService {
  private flags: Record<string, any> | null = null;

  constructor(@Inject(ngxFlaggerRootConfigInjectionToken) private readonly config: RootConfig,
              private readonly flaggerInitializer: NgxFlaggerInitializerService,
              private readonly logger: NgxFlaggerLogService) {
    flaggerInitializer.flags$.subscribe(flags => this.flags = flags);
  }

  isFeatureFlagEnabled(requiredFlag: string): boolean {
    if (!this.flags) this.logger.error('Flag requested before it has been initialize.');

    if (this.config.flagsAlwaysTrue) return true;

    if (!this.flags) return false;

    let config = this.flags;
    const isFlagNegative = requiredFlag.startsWith('!');
    requiredFlag = requiredFlag.replace(/^!/, '');
    for (const key of requiredFlag.split('.')) {
      if (key in config) config = config[key];
      else {
        this.logger.error(`Flag '${requiredFlag}' does not exit.`);
        return false;
      }
    }

    if (typeof config !== 'boolean') {
      this.logger.error(`Invalid flag type. Flag '${requiredFlag}' should be of type boolean, but is ${typeof config}.`);
      return false;
    }

    return isFlagNegative ? !config : config;
  }
}
