import {LoggerService} from "./logger.service";
import {TestBed} from "@angular/core/testing";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {LogLevel} from "./log-level.enum";
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('LoggerService', () => {
  let service: LoggerService;
  let config: RootConfig;

  beforeEach(() => {
    config = {};

    console.info = createSpy('info');
    console.warn = createSpy('warn');
    console.error = createSpy('error');

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ROOT_CONFIG_TOKEN,
          useValue: config
        },
        LoggerService
      ]
    });

    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe(`info`, () => {
    beforeEach(() => {
      config.logLevel = LogLevel.INFO;
    });

    it('should log to the console', () => {
      const message = 'Logger works';

      service.info(message);

      expect(console.info).toHaveBeenCalledTimes(1);
      expect((console.info as Spy).calls.first().args[0]).toContain(message);
    });

    it('should not log to the console if debugMessagesDisabled', () => {
      config.logsDisabled = true;

      service.info('any');

      expect(console.info).not.toHaveBeenCalled();
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
      config.logsDisabled = true;

      service.info('any');

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
      config.logsDisabled = true;

      service.info('any');

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe(`filters`, () => {
    it(`should log all on LOG level`, () => {
      config.logLevel = LogLevel.INFO;

      service.info('');
      service.warn('');
      service.error('');

      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should filter logs on WARN level`, () => {
      config.logLevel = LogLevel.WARN;

      service.info('');
      service.warn('');
      service.error('');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should show only errors on ERROR level`, () => {
      config.logLevel = LogLevel.ERROR;

      service.info('');
      service.warn('');
      service.error('');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it(`should use WARN level by default`, () => {
      service.info('');
      service.warn('');
      service.error('');

      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });

})
