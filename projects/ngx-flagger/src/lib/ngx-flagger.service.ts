import {Inject, Injectable, OnDestroy} from '@angular/core';
import {InitializerService} from "./initializer.service";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {LoggerService} from "./logger.service";
import {map, Subscription} from "rxjs";
import {copy} from "../utils/copy";
import {isObject} from "../utils/is-object";

@Injectable()
export class NgxFlaggerService implements OnDestroy {
  private _flags: Record<string, any> | null = null;
  private flagsSubscription: Subscription;

  flags$ = this.flaggerInitializer.flags$.pipe(map(v => copy(v)));

  get flags(): Record<string, any> | null {
    return copy(this._flags);
  }

  constructor(@Inject(ROOT_CONFIG_TOKEN) private readonly config: RootConfig,
              private readonly flaggerInitializer: InitializerService,
              private readonly logger: LoggerService) {
    this.flagsSubscription = flaggerInitializer.flags$.subscribe(flags => this._flags = flags);
  }

  isFeatureFlagEnabled(requiredFlagExpression: string): boolean {
    if (!this.prerequisitesFulfilled()) return this.prerequisitesNotFulfilledResult();

    this.logger.info(`Evaluating expression '${requiredFlagExpression}'.`);
    return this.getResultForExpression(requiredFlagExpression);
  }

  private prerequisitesFulfilled(): boolean {
    return !!this._flags && !this.config.flagsAlwaysTrue;
  }

  private prerequisitesNotFulfilledResult(): boolean {
    if (!this._flags) this.logger.error('Flag requested before it has been initialize.');

    return !!this.config.flagsAlwaysTrue;
  }

  private getResultForExpression(requiredFlag: string): boolean {
    let flagExpression = requiredFlag;

    for (let flag of requiredFlag.split(/\|{2}|&{2}/)) { // || or &&
      flag = flag.replace(/[()!\s]/g, '');

      const isFlagEnabled = this.isFlagEnabled(flag);
      flagExpression = flagExpression.replace(flag, isFlagEnabled.toString());
    }

    return this.evalLogicalExpression(flagExpression, requiredFlag);
  }

  private isFlagEnabled(requiredFlag: string): boolean {
    let flag: Record<string, any> | boolean = this._flags!;
    const requiredFlagFragments = this.parseToNotNegateFlagFragments(requiredFlag);

    for (const fragment of requiredFlagFragments) {
      if (fragment === '*') flag = this.anyFlagEnabled(flag);
      else if (fragment === '&') flag = this.allFlagsEnabled(flag);
      else if (isObject(flag) && fragment in (flag as Record<string, any>)) flag = (flag as Record<string, any>)[fragment];
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
      else if (isObject(flags[ffKey])) {
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

  private noSuchFlagResult(requiredFlag: string): boolean {
    this.logger.error(`Flag '${requiredFlag}' does not exit.`);
    return false;
  }

  private invalidFlagResult(requiredFlag: string, flag: any): boolean {
    this.logger.error(`Invalid flag type. Flag '${requiredFlag}' should be of type boolean, but is ${typeof flag}.`);
    return false;
  }

  private evalLogicalExpression(expression: string, requiredFlag: string): boolean {
    try {
      this.logger.info(`Expression '${requiredFlag}' parsed to '${expression}'.`);

      const result = eval(expression);
      this.logger.info(`Expression '${requiredFlag}' evaluated to ${result}.`);

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) this.logger.error(`Incorrect syntax in '${requiredFlag}'. ${e.message}`);

      return false;
    }
  }

  ngOnDestroy() {
    this.flagsSubscription.unsubscribe();
  }
}
