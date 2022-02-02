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
    if (!this.prerequisitesFulfilled()) return this.prerequisitesNotFulfilledResult()

    const {result, isValid} = this.getFromFlags(requiredFlag);

    return isValid && requiredFlag.startsWith('!') ? !result : result;
  }

  private prerequisitesFulfilled(): boolean {
    return !!this.flags && !this.config.flagsAlwaysTrue;
  }

  private prerequisitesNotFulfilledResult(): boolean {
    if (!this.flags) this.logger.error('Flag requested before it has been initialize.');

    return !!this.config.flagsAlwaysTrue;
  }

  private getFromFlags(requiredFlag: string): {result: boolean, isValid: boolean} {
    let flag: Record<string, any> | boolean = this.flags!;
    const requiredFlagFragments = this.parseToNotNegateFlagFragments(requiredFlag);

    for (const fragment of requiredFlagFragments) {
      if (fragment === '*') flag = this.anyFlagEnabled(flag);
      else if (this.isContainerObject(flag) && fragment in (flag as Record<string, any>)) flag = (flag as Record<string, any>)[fragment];
      else return {result: this.noSuchFlagResult(requiredFlag), isValid: false};
    }

    if (typeof flag !== 'boolean') return {result: this.invalidFlagResult(requiredFlag, flag), isValid: false};


    return {result: flag, isValid: true};
  }

  private parseToNotNegateFlagFragments(requiredFlag: string): string[] {
    return requiredFlag.replace(/^!/, '').split('.');
  }

  private anyFlagEnabled(flags: Record<string, any> | boolean): boolean {
    if (typeof flags === 'boolean') return flags;

    for (const ffKey in flags) {
      if (flags[ffKey] === true) return true;
      else if (this.isContainerObject(flags[ffKey]))  {
        const res = this.anyFlagEnabled(flags[ffKey]);
        if (res) return true;
      }
    }

    return false;
  }

  private isContainerObject(flag: any): boolean {
    return typeof flag === 'object' && !Array.isArray(flag);
  }

  private noSuchFlagResult(requiredFlag: string): boolean {
    this.logger.error(`Flag '${requiredFlag}' does not exit.`);
    return false;
  }

  private invalidFlagResult(requiredFlag: string, flag: any): boolean {
    this.logger.error(`Invalid flag type. Flag '${requiredFlag}' should be of type boolean, but is ${typeof flag}.`);
    return false;
  }
}
