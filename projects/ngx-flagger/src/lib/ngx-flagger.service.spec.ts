import {TestBed} from '@angular/core/testing';

import {NgxFlaggerService} from './ngx-flagger.service';
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {InitializerService} from "./initializer.service";
import {LoggerService} from "./logger.service";
import {BehaviorSubject} from "rxjs";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('NgxFlaggerService', () => {
  let config: RootConfig;
  let flags: Record<string, any>;
  let service: NgxFlaggerService;
  let initializer: SpyObj<InitializerService>;
  let logger: SpyObj<LoggerService>;

  beforeEach(() => {
    config = {};
    flags = {};
    initializer = createSpyObj('NgxFlaggerInitializerService', [''], {flags$: new BehaviorSubject(flags)});
    logger = createSpyObj('NgxFlaggerLogService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ROOT_CONFIG_TOKEN,
          useValue: config
        },
        {
          provide: InitializerService,
          useValue: initializer
        },
        {
          provide: LoggerService,
          useValue: logger
        },
        NgxFlaggerService
      ]
    });
    service = TestBed.inject(NgxFlaggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isFeatureFlagEnabled', () => {
    const anyFlag = 'any';

    it('should be false if flags are not loaded', () => {
      initializer.flags$.next(null);

      const result = service.isFeatureFlagEnabled(anyFlag);

      expect(result).toBeFalse();
    });

    it('should show error in the console if flags requested before initialization', () => {
      initializer.flags$.next(null);

      service.isFeatureFlagEnabled(anyFlag);

      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should be true if always true set in config', () => {
      config.flagsAlwaysTrue = true;

      const result = service.isFeatureFlagEnabled(anyFlag);

      expect(result).toBeTrue();
    });

    it('should be true if flag is true', () => {
      const flagName = 'myFlag';
      flags[flagName] = true;

      const result = service.isFeatureFlagEnabled(flagName);

      expect(result).toBeTrue();
    });

    it('should be false if flag is false', () => {
      const flagName = 'application';
      flags[flagName] = false;

      const result = service.isFeatureFlagEnabled(flagName);

      expect(result).toBeFalse();
    });

    it('should be false if flag does not exist', () => {
      const result = service.isFeatureFlagEnabled('notExistingFlag');

      expect(result).toBeFalse();
    });

    it('should show error in the console if flag does not exist', () => {
      service.isFeatureFlagEnabled('youCantSeeMe');

      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should be false if required flag is not of type boolean', () => {
      const stringFlagName = 'str';
      const numberFlagName = 'num';
      const objFlagName = 'obj';
      flags[stringFlagName] = 'str';
      flags[numberFlagName] = 'num';
      flags[objFlagName] = {};

      const resForStringFlag = service.isFeatureFlagEnabled(stringFlagName);
      const resForNumberFlag = service.isFeatureFlagEnabled(numberFlagName);
      const resForObjectFlag = service.isFeatureFlagEnabled(objFlagName);

      expect(resForStringFlag).toBeFalse();
      expect(resForNumberFlag).toBeFalse();
      expect(resForObjectFlag).toBeFalse();
    });

    it('should show error in the console if flag is not of type boolean', () => {
      const notBoolFlagName = 'anyName';
      flags[notBoolFlagName] = {};

      service.isFeatureFlagEnabled(notBoolFlagName);

      expect(logger.error).toHaveBeenCalledTimes(1);
    });

    it('should work with nested flags configuration', () => {
      flags['obj'] = {
        nested1: {
          flag: true
        }
      };

      const result = service.isFeatureFlagEnabled('obj.nested1.flag');

      expect(result).toBeTrue();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it(`should negate result if required flag started with !`, () => {
      const trueFlagName = 'flagA';
      const falseFlagName = 'flagB';
      flags[trueFlagName] = true;
      flags[falseFlagName] = false;

      const resultThatShouldBeFalse = service.isFeatureFlagEnabled('!' + trueFlagName);
      const resultThatShouldBeTrue = service.isFeatureFlagEnabled('!' + falseFlagName);

      expect(resultThatShouldBeTrue).toBeTrue();
      expect(resultThatShouldBeFalse).toBeFalse();
    });

    it(`should return whether any flag is true if required flag ended with *`, () => {
      flags['flags'] = {
        containerA: {
          flagAA: false,
          flagAB: true
        },
        containerB: {
          flagAB: false
        }
      };

      expect(service.isFeatureFlagEnabled('*')).toBeTrue();
      expect(service.isFeatureFlagEnabled('flags.*')).toBeTrue();
      expect(service.isFeatureFlagEnabled('flags.containerA.*')).toBeTrue();
      expect(service.isFeatureFlagEnabled('flags.containerB.*')).toBeFalse();
    });

    it(`should negate result when using * syntax`, () => {
      flags['false'] = false;

      const result = service.isFeatureFlagEnabled('!*');

      expect(result).toBeTrue();
    });

    it(`should return whether all valid flags are true if required flag ended with &`, () => {
      flags['flags'] = {
        onlyTrueContainer: {
          flagA: true,
          nestedContainer: {
            flagB: true
          }
        },
        containerWithFalse: {
          flagC: true,
          nested: {
            falseFlag: false
          }
        }
      };

      expect(service.isFeatureFlagEnabled('&')).toBeFalse();
      expect(service.isFeatureFlagEnabled('flags.onlyTrueContainer.&')).toBeTrue();
      expect(service.isFeatureFlagEnabled('flags.containerWithFalse.&')).toBeFalse();
    });

    it(`should negate result when using & syntax`, () => {
      flags['false'] = false;

      const result = service.isFeatureFlagEnabled('!&');

      expect(result).toBeTrue();
    });

    it(`should return logical AND of required flags when && is between required flags`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true && false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('false && false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('true && true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true && true && true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true && true && false')).toBeFalse();
    });

    it(`should return logical AND even if && is not preceded by or followed by space`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true&&false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('true&&true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true&& true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true &&true')).toBeTrue();
    });

    it(`should return logical OR of required flags when || is between required flags`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true || false')).toBeTrue();
      expect(service.isFeatureFlagEnabled('false || false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('true || true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true || true || false')).toBeTrue();
    });

    it(`should return logical OR even if || is not preceded by or followed by space`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true||false')).toBeTrue();
      expect(service.isFeatureFlagEnabled('false||false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('true|| true')).toBeTrue();
      expect(service.isFeatureFlagEnabled('true ||true')).toBeTrue();
    });

    it(`should work with combination of && and ||`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true && true || false')).toBeTrue();
      expect(service.isFeatureFlagEnabled('false || true && false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('true || true && false')).toBeTrue();
    });

    it(`should work with logical combinations in brackets`, () => {
      flags['true'] = true;
      flags['false'] = false;

      expect(service.isFeatureFlagEnabled('true && !(false || true)')).toBeFalse();
      expect(service.isFeatureFlagEnabled('(false || true) && false')).toBeFalse();
      expect(service.isFeatureFlagEnabled('(true || (true && false)) && false')).toBeFalse();
    });

    it(`should show error in the console if syntax with brackets is incorrect`, () => {
      flags[anyFlag] = false;

      service.isFeatureFlagEnabled(`((${anyFlag})`);
      service.isFeatureFlagEnabled(`${anyFlag})`);
      service.isFeatureFlagEnabled(`()`);

      expect(logger.error).toHaveBeenCalledTimes(3);
    });
  });

});
