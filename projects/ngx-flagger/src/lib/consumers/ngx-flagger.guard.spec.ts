import {TestBed} from "@angular/core/testing";
import {ActivatedRouteSnapshot, Router} from "@angular/router";
import {LoggerService} from "../loggers";
import {NgxFlaggerService} from "./ngx-flagger.service";
import {ngxFlaggerGuardFactory} from "./ngx-flagger.guard";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe(`NgxFlaggerGuard`, () => {
  const anyFlag = 'flag';
  let logger: SpyObj<LoggerService>;
  let featureFlagsService: SpyObj<NgxFlaggerService>;
  let router: SpyObj<Router>;
  let activatedRouteSnapshot: SpyObj<ActivatedRouteSnapshot>;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error', 'info']);
    activatedRouteSnapshot = createSpyObj('activatedRouteSnapshot',
      [''],
      {url: []});
    router = createSpyObj('Router', ['createUrlTree']);
    featureFlagsService = createSpyObj('NgxFlaggerService', ['isFeatureFlagEnabled']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: NgxFlaggerService,
          useValue: featureFlagsService
        },
        {
          provide: Router,
          useValue: router
        },
        {
          provide: LoggerService,
          useValue: logger
        },
      ]
    })
  });

  it(`should return true if feature flag enabled`, (done) => {
    featureFlagsService.isFeatureFlagEnabled.withArgs(anyFlag).and.returnValue(true);

    TestBed.runInInjectionContext(async () => {
      const result = ngxFlaggerGuardFactory(anyFlag)(activatedRouteSnapshot);

      expect(result).toBeTrue();

      done();
    });
  });

  it(`should return false if feature flag disabled`, (done) => {
    featureFlagsService.isFeatureFlagEnabled.withArgs(anyFlag).and.returnValue(false);

    TestBed.runInInjectionContext(async () => {
      const result = ngxFlaggerGuardFactory(anyFlag)(activatedRouteSnapshot);

      expect(result).toBeFalse();

      done();
    });
  });

  it(`should navigate away if feature flag is disabled`, (done) => {
    const redirect = '/root/redirect/path';
    featureFlagsService.isFeatureFlagEnabled.withArgs(anyFlag).and.returnValue(false);

    TestBed.runInInjectionContext(async () => {
      ngxFlaggerGuardFactory(anyFlag, {redirectTo: redirect})(activatedRouteSnapshot);

      expect(router.createUrlTree).toHaveBeenCalledOnceWith([redirect]);

      done();
    });
  });

  it(`should show error in the console if requiredFeatureFlag is falsy`, (done) => {
    TestBed.runInInjectionContext(async () => {
      ngxFlaggerGuardFactory('')(activatedRouteSnapshot);

      expect(logger.error).toHaveBeenCalled();

      done();
    });
  });
});
