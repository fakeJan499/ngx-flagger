import {NgxFlaggerInitializerService} from "./ngx-flagger-initializer.service";
import {RootConfig} from "./root-config.interface";
import {TestBed} from "@angular/core/testing";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import createSpyObj = jasmine.createSpyObj;

describe('NgxFlaggerInitializerService', () => {
  let service: NgxFlaggerInitializerService;
  let logger: NgxFlaggerLogService;
  let httpClient: HttpTestingController;
  let config: RootConfig;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error']);
    config = {};

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ngxFlaggerRootConfigInjectionToken,
          useValue: config
        },
        {
          provide: NgxFlaggerLogService,
          useValue: logger
        },
        NgxFlaggerInitializerService,
      ]
    });

    service = TestBed.inject(NgxFlaggerInitializerService);
    httpClient = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get config from file', () => {
    service.loadConfig();

    const request = httpClient.expectOne(NgxFlaggerInitializerService.DEFAULT_PATH);
    expect(request.request.responseType).toBe('json');
    expect(request.cancelled).toBeFalsy();
    httpClient.verify();
  });

  it('should has null flags initially', (done) => {
    service.flags$.subscribe(flags => {
      expect(flags).toBeNull();
      done();
    })
  });

  it('should get config from path specified in config', () => {
    config.path = 'some/path/123.json';

    service.loadConfig();

    const request = httpClient.expectOne(config.path);
    expect(request.request.responseType).toBe('json');
    expect(request.cancelled).toBeFalsy();
    httpClient.verify();
  });

  it('should emit loaded flags', (done) => {
    const mockConfig: RootConfig = {debugMessagesDisabled: false};

    service.loadConfig().then(() => {
      service.flags$.subscribe(flags => {
        expect(flags).toEqual(mockConfig);
        done();
      })
    });

    const request = httpClient.expectOne(NgxFlaggerInitializerService.DEFAULT_PATH);
    request.flush(mockConfig)
    httpClient.verify();
  });

  it('should show error in the console on http error', (done) => {
    service.loadConfig().then(() => {
      expect(logger.error).toHaveBeenCalled();
      done();
    })

    const request = httpClient.expectOne(NgxFlaggerInitializerService.DEFAULT_PATH);
    request.error(new ProgressEvent('error'));
    httpClient.verify();
  });
});
