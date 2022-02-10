import {InitializerService} from "./initializer.service";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {TestBed} from "@angular/core/testing";
import {LoggerService} from "./logger.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import createSpyObj = jasmine.createSpyObj;

describe('InitializerService', () => {
  let service: InitializerService;
  let logger: LoggerService;
  let httpClient: HttpTestingController;
  let config: RootConfig;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error']);
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
    const mockConfig: RootConfig = {debugMessagesDisabled: false};

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
});
