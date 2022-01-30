import {TestBed} from '@angular/core/testing';

import {NgxFlaggerService} from './ngx-flagger.service';
import {RootConfig} from "./root-config.interface";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {NgxFlaggerInitializerService} from "./ngx-flagger-initializer.service";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";
import {BehaviorSubject} from "rxjs";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('NgxFlaggerService', () => {
  let config: RootConfig;
  let flags: Record<string, any>;
  let service: NgxFlaggerService;
  let initializer: SpyObj<NgxFlaggerInitializerService>;
  let logger: SpyObj<NgxFlaggerLogService>;

  beforeEach(() => {
    config = {};
    flags = {};
    initializer = createSpyObj('NgxFlaggerInitializerService', [''], {flags$: new BehaviorSubject(flags)});
    logger = createSpyObj('NgxFlaggerLogService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ngxFlaggerRootConfigInjectionToken,
          useValue: config
        },
        {
          provide: NgxFlaggerInitializerService,
          useValue: initializer
        },
        {
          provide: NgxFlaggerLogService,
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

      expect(logger.error).toHaveBeenCalled();
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

      expect(logger.error).toHaveBeenCalled();
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

      expect(logger.error).toHaveBeenCalled();
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
  });

});
