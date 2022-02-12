import {InitializerService} from "./initializer.service";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {TestBed} from "@angular/core/testing";
import {LoggerService} from "./logger.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {LogLevel} from "./log-level.enum";
import createSpyObj = jasmine.createSpyObj;

describe('InitializerService', () => {
  let service: InitializerService;
  let logger: LoggerService;
  let httpClient: HttpTestingController;
  let config: RootConfig;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error', 'info']);
    config = {};

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ROOT_CONFIG_TOKEN,
          useValue: config
        },
        {
          provide: LoggerService,
          useValue: logger
        },
        InitializerService,
      ]
    });

    service = TestBed.inject(InitializerService);
    httpClient = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get config from file', () => {
    service.loadConfig();

    const request = httpClient.expectOne(InitializerService.DEFAULT_PATH);
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
    const mockConfig = {debugMessagesDisabled: false};

    service.loadConfig().then(() => {
      service.flags$.subscribe(flags => {
        expect(flags).toEqual(mockConfig);
        done();
      })
    });

    const request = httpClient.expectOne(InitializerService.DEFAULT_PATH);
    request.flush(mockConfig)
    httpClient.verify();
  });

  it('should show error in the console on http error', (done) => {
    service.loadConfig().then(() => {
      expect(logger.error).toHaveBeenCalled();
      done();
    })

    const request = httpClient.expectOne(InitializerService.DEFAULT_PATH);
    request.error(new ProgressEvent('error'));
    httpClient.verify();
  });

  it(`should load config for multiple paths`, (done) => {
    const pathA = 'asd.json';
    const pathB = 'some/path.json';
    const pathC = 'next.json';
    config.path = [pathA, pathB, pathC];
    const mockConfigA = {debugMessagesDisabled: false};
    const mockConfigB = {debugMessagesDisabled: true};
    const mockConfigC = {flagsAlwaysTrue: true, logLevel: LogLevel.INFO};
    const expected = {debugMessagesDisabled: true, flagsAlwaysTrue: true, logLevel: LogLevel.INFO};

    service.loadConfig().then(() => {
      service.flags$.subscribe(flags => {
        expect(flags).toEqual(expected);
        done();
      })
    });

    const requestA = httpClient.expectOne(pathA);
    const requestB = httpClient.expectOne(pathB);
    const requestC = httpClient.expectOne(pathC);
    requestA.flush(mockConfigA)
    requestB.flush(mockConfigB)
    requestC.flush(mockConfigC)
    httpClient.verify();
  });

  it(`should create wrapper object`, (done) => {
    const path = 'somepath.json';
    const wrapperName = 'importantConfig';
    config.path = {path, wrapperName};
    const mockConfig = {someFeatureFlag: true};

    service.loadConfig().then(() => {
      service.flags$.subscribe(flags => {
        const expected: Record<string, any> = {};
        expected[wrapperName] = mockConfig;

        expect(flags).toEqual(expected);
        done();
      })
    })

    const request = httpClient.expectOne(path);
    request.flush(mockConfig);
    httpClient.verify();
  });

  it(`should work with mixed path syntax`, (done) => {
    const pathA = 'some';
    const pathB = 'some-path-2';
    const wrapperNameA = 'some';
    config.path = [
      {path: pathA, wrapperName: wrapperNameA},
      pathB
    ];
    const configA = {flagA: false};
    const configB = {flagB: true};

    service.loadConfig().then(() => {
      service.flags$.subscribe(flags => {
        const expected: Record<string, any> = configB;
        expected[wrapperNameA] = configA;

        expect(flags).toEqual(expected);
        done();
      })
    })

    const requestA = httpClient.expectOne(pathA);
    const requestB = httpClient.expectOne(pathB);
    requestA.flush(configA);
    requestB.flush(configB);
    httpClient.verify();
  });
});
