import {Inject, Injectable, OnDestroy} from '@angular/core';
import {NgxFlaggerInitializerService} from "./ngx-flagger-initializer.service";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";
import {Subscription} from "rxjs";

@Injectable()
export class NgxFlaggerService implements OnDestroy {
  private flags: Record<string, any> | null = null;
  private flagsSubscription: Subscription;

  constructor(@Inject(ngxFlaggerRootConfigInjectionToken) private readonly config: RootConfig,
              private readonly flaggerInitializer: NgxFlaggerInitializerService,
              private readonly logger: NgxFlaggerLogService) {
    this.flagsSubscription = flaggerInitializer.flags$.subscribe(flags => this.flags = flags);
  }

  isFeatureFlagEnabled(requiredFlagExpression: string): boolean {
    if (!this.prerequisitesFulfilled()) return this.prerequisitesNotFulfilledResult();

    return this.getResultForExpression(requiredFlagExpression);
  }

  private prerequisitesFulfilled(): boolean {
    return !!this.flags && !this.config.flagsAlwaysTrue;
  }

  private prerequisitesNotFulfilledResult(): boolean {
    if (!this.flags) this.logger.error('Flag requested before it has been initialize.');

    return !!this.config.flagsAlwaysTrue;
  }

  private getResultForExpression(requiredFlag: string): boolean {
    let flagExpression = requiredFlag;

    for (let flag of requiredFlag.split(/\|{2}|&{2}/)) { // || or &&
      flag = flag.replace(/[()!\s]/g, '');

      const isFlagEnabled = this.isFlagEnabled(flag);
      flagExpression = flagExpression.replace(flag, isFlagEnabled.toString());
    }

    return this.evalLogicalExpression(flagExpression);
  }

  private isFlagEnabled(requiredFlag: string): boolean {
    let flag: Record<string, any> | boolean = this.flags!;
    const requiredFlagFragments = this.parseToNotNegateFlagFragments(requiredFlag);

    for (const fragment of requiredFlagFragments) {
      if (fragment === '*') flag = this.anyFlagEnabled(flag);
      else if (fragment === '&') flag = this.allFlagsEnabled(flag);
      else if (this.isContainerObject(flag) && fragment in (flag as Record<string, any>)) flag = (flag as Record<string, any>)[fragment];
      else return this.noSuchFlagResult(requiredFlag);
    }

    if (typeof flag !== 'boolean') return this.invalidFlagResult(requiredFlag, flag);

    return flag;
  }

  private anyFlagEnabled(flags: Record<string, any> | boolean): boolean {
    return this.flagsGroupEnabled(flags, 'any');
  }

  private allFlagsEnabled(flags: Record<string, any> | boolean): boolean {
    return this.flagsGroupEnabled(flags, 'all');
  }

  private flagsGroupEnabled(flags: Record<string, any> | boolean, operator: 'any' | 'all') {
    if (typeof flags === 'boolean') return flags;

    const logicalOperator = operator === 'any';

    for (const ffKey in flags) {
      if (flags[ffKey] === logicalOperator) return logicalOperator;
      else if (this.isContainerObject(flags[ffKey])) {
        const res = this.flagsGroupEnabled(flags[ffKey], operator);

        if (logicalOperator && res) return true;
        if (!logicalOperator && !res) return false;
      }
    }

    return !logicalOperator;
  }

  private parseToNotNegateFlagFragments(requiredFlag: string): string[] {
    return requiredFlag.replace(/^!/, '').split('.');
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

  private evalLogicalExpression(expression: string): boolean {
    try {
      return eval(expression);
    } catch (e) {
      if (e instanceof SyntaxError) this.logger.error(`Incorrect syntax. ${e.message}`);

      return false;
    }
  }

  ngOnDestroy() {
    this.flagsSubscription.unsubscribe();
  }
}
