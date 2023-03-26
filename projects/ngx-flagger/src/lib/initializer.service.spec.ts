import {InitializerService} from "./initializer.service";
import {fakeAsync, flush, TestBed} from "@angular/core/testing";
import {LoggerService} from "./loggers";
import {NoopLoaderService} from "../testing";
import {FlagsLoaderService} from "./loaders";
import {of} from "rxjs";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./models";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('InitializerService', () => {
  let service: InitializerService;
  let logger: LoggerService;
  let config: RootConfig;
  let loader: SpyObj<FlagsLoaderService>;

  beforeEach(() => {
    logger = createSpyObj('NgxFlaggerLogService', ['error', 'info']);
    loader = createSpyObj('FlagsLoaderService', ['loadFlags']);
    config = {loader: NoopLoaderService};

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ROOT_CONFIG_TOKEN,
          useValue: config
        },
        {
          provide: LoggerService,
          useValue: logger
        },
        {
          provide: FlagsLoaderService,
          useValue: loader
        },
        InitializerService,
      ]
    });

    service = TestBed.inject(InitializerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should has null flags initially', (done) => {
    service.flags$.subscribe(flags => {
      expect(flags).toBeNull();
      done();
    })
  });

  it('should set up flags from loader', fakeAsync(() => {
    const loadedFlags = {someFlag: true, anyOtherFlag: false};

    loader.loadFlags.and.returnValue(of(loadedFlags));

    service.loadFlags().subscribe();

    flush();

    expect(loader.loadFlags).toHaveBeenCalledTimes(1);
    expect(service.flags$.getValue()).toEqual(loadedFlags);
  }));
});
