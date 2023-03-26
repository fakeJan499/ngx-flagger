import {FlagsHttpLoaderService} from "./flags-http-loader.service";
import {LoggerService} from "../loggers";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {TestBed} from "@angular/core/testing";
import {PATH_TOKEN} from "../root-config";
import createSpyObj = jasmine.createSpyObj;

describe('FlagsHttpLoaderService', () => {
  let logger: LoggerService;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error', 'info']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: LoggerService,
          useValue: logger
        },
        FlagsHttpLoaderService,
      ]
    });
  })

  it('should get config from path provided by arg', () => {
    const path = 'some/path/123.json';
    TestBed.overrideProvider(PATH_TOKEN, {
      useValue: path
    });
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe();

    const request = httpClient.expectOne(path);
    expect(request.request.responseType).toBe('json');
    expect(request.cancelled).toBeFalsy();
    httpClient.verify();
  });

  it('should emit loaded flags', (done) => {
    const mockFlags = {debugMessagesDisabled: false};
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe((flags) => {
      expect(flags).toEqual(mockFlags);
      done();
    });

    const request = httpClient.expectOne(FlagsHttpLoaderService.DEFAULT_PATH);
    request.flush(mockFlags)
    httpClient.verify();
  });

  it('should show error in the console on http error', (done) => {
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe(() => {
      expect(logger.error).toHaveBeenCalled();
      done();
    })

    const request = httpClient.expectOne(FlagsHttpLoaderService.DEFAULT_PATH);
    request.error(new ProgressEvent('error'));
    httpClient.verify();
  });

  it(`should load feature flags for multiple paths`, (done) => {
    const pathA = 'asd.json';
    const pathB = 'some/path.json';
    const pathC = 'next.json';
    const paths = [pathA, pathB, pathC];
    const mockConfigA = {debugMessagesDisabled: false};
    const mockConfigB = {debugMessagesDisabled: true};
    const mockConfigC = {flagsAlwaysTrue: true};
    const expected = {debugMessagesDisabled: true, flagsAlwaysTrue: true};

    TestBed.overrideProvider(PATH_TOKEN, {
      useValue: paths
    });
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe((flags) => {
      expect(flags).toEqual(expected);
      done();
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
    const pathObj = {path, wrapperName};
    const mockConfig = {someFeatureFlag: true};

    TestBed.overrideProvider(PATH_TOKEN, {
      useValue: pathObj
    });
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe((flags) => {
      const expected: Record<string, any> = {};
      expected[wrapperName] = mockConfig;

      expect(flags).toEqual(expected);
      done();
    })

    const request = httpClient.expectOne(path);
    request.flush(mockConfig);
    httpClient.verify();
  });

  it(`should work with mixed path syntax`, (done) => {
    const pathA = 'some';
    const pathB = 'some-path-2';
    const wrapperNameA = 'some';
    const path = [
      {path: pathA, wrapperName: wrapperNameA},
      pathB
    ];
    const configA = {flagA: false};
    const configB = {flagB: true};

    TestBed.overrideProvider(PATH_TOKEN, {
      useValue: path
    });
    const service = TestBed.inject(FlagsHttpLoaderService);
    const httpClient = TestBed.inject(HttpTestingController);

    service.loadFlags().subscribe((flags) => {
      const expected: Record<string, any> = configB;
      expected[wrapperNameA] = configA;

      expect(flags).toEqual(expected);
      done();
    })

    const requestA = httpClient.expectOne(pathA);
    const requestB = httpClient.expectOne(pathB);
    requestA.flush(configA);
    requestB.flush(configB);
    httpClient.verify();
  });
})
