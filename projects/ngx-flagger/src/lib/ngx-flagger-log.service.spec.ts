import {NgxFlaggerLogService} from "./ngx-flagger-log.service";
import {TestBed} from "@angular/core/testing";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {LogLevel} from "./log-level.enum";
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('NgxFlaggerLogService', () => {
  let service: NgxFlaggerLogService;
  let config: RootConfig;

  beforeEach(() => {
    config = {};

    console.log = createSpy('log');
    console.warn = createSpy('warn');
    console.error = createSpy('error');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ngxFlaggerRootConfigInjectionToken,
          useValue: config
        },
        NgxFlaggerLogService
      ]
    });

    service = TestBed.inject(NgxFlaggerLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`log`, () => {
    beforeEach(() => {
      config.logLevel = LogLevel.INFO;
    });

    it('should log to the console', () => {
      const message = 'Logger works';

      service.log(message);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect((console.log as Spy).calls.first().args[0]).toContain(message);
    });

    it('should not log to the console if debugMessagesDisabled', () => {
      config.debugMessagesDisabled = true;

      service.log('any');

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe(`warn`, () => {
    beforeEach(() => {
      config.logLevel = LogLevel.WARN;
    });

    it('should warn to the console', () => {
      const message = 'Warn 123';

      service.warn(message);

      expect(console.warn).toHaveBeenCalledTimes(1);
      expect((console.warn as Spy).calls.first().args[0]).toContain(message);
    });

    it('should not warn to the console if debugMessagesDisabled', () => {
      config.debugMessagesDisabled = true;

      service.log('any');

      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe(`error`, () => {
    beforeEach(() => {
      config.logLevel = LogLevel.ERROR;
    });

    it('should error to the console', () => {
      const message = 'some error message';

      service.error(message);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect((console.error as Spy).calls.first().args[0]).toContain(message);
    });

    it('should not error to the console if debugMessagesDisabled', () => {
      config.debugMessagesDisabled = true;

      service.log('any');

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe(`filters`, () => {
    it(`should log all on LOG level`, () => {
      config.logLevel = LogLevel.INFO;

      service.log('');
      service.warn('');
      service.error('');

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should filter logs on WARN level`, () => {
      config.logLevel = LogLevel.WARN;

      service.log('');
      service.warn('');
      service.error('');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should show only errors on ERROR level`, () => {
      config.logLevel = LogLevel.ERROR;

      service.log('');
      service.warn('');
      service.error('');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should use WARN level by default`, () => {
      service.log('');
      service.warn('');
      service.error('');

      expect(console.log).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });

})
