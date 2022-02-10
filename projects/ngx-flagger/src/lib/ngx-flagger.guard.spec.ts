import {TestBed} from "@angular/core/testing";
import {RootConfig} from "./root-config";
import {ActivatedRouteSnapshot, Router} from "@angular/router";
import {LoggerService} from "./logger.service";
import {NgxFlaggerService} from "./ngx-flagger.service";
import {NgxFlaggerGuard} from "./ngx-flagger.guard";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;

describe(`NgxFlaggerGuard`, () => {
  const anyFlag = 'flag';
  let config: RootConfig;
  let logger: SpyObj<LoggerService>;
  let featureFlagsService: SpyObj<NgxFlaggerService>;
  let router: SpyObj<Router>;
  let activatedRouteSnapshot: SpyObj<ActivatedRouteSnapshot>;
  let routeData: Record<string, any>;
  let guard: NgxFlaggerGuard;

  beforeEach(() => {
    config = {};
    logger = createSpyObj('NgxFlaggerLogService', ['error']);
    routeData = {};
    activatedRouteSnapshot = createSpyObj('activatedRouteSnapshot',
      [''],
      {data: routeData, url: []});
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
        NgxFlaggerGuard
      ]
    })

    guard = TestBed.inject(NgxFlaggerGuard);
  });

  it(`should be created`, () => {
    expect(guard).toBeTruthy();
  });

  it(`should return true if feature flag enabled`, () => {
    routeData['requiredFeatureFlag'] = anyFlag;
    featureFlagsService.isFeatureFlagEnabled.withArgs(anyFlag).and.returnValue(true);

    const result = guard.canActivate(activatedRouteSnapshot);

    expect(result).toBeTrue();
  });

  it(`should navigate away if feature flag is disabled`, () => {
    const redirect = '/root/redirect/path';
    routeData['requiredFeatureFlag'] = anyFlag;
    routeData['featureFlagRedirect'] = redirect
    featureFlagsService.isFeatureFlagEnabled.withArgs(anyFlag).and.returnValue(false);

    guard.canActivate(activatedRouteSnapshot);

    expect(router.createUrlTree).toHaveBeenCalledOnceWith([redirect]);
  });

  it(`should show error in the console if requiredFeatureFlag is falsy`, () => {
    guard.canActivate(activatedRouteSnapshot);

    expect(logger.error).toHaveBeenCalled();
  });

  it(`should navigate to / if featureFlagRedirect not provided`, () => {
    guard.canActivate(activatedRouteSnapshot);

    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/']);
  });
});
