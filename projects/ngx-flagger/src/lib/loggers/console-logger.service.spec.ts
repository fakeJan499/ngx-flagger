import {ConsoleLoggerService} from "./console-logger.service";
import {TestBed} from "@angular/core/testing";
import {LogLevel} from "./log-level.enum";
import createSpy = jasmine.createSpy;

describe('ConsoleLoggerService', () => {
  beforeEach(() => {
    console.info = createSpy('info');
    console.warn = createSpy('warn');
    console.error = createSpy('error');
  });

  it('should not write to the console if use LogLevel NONE', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConsoleLoggerService,
          useValue: new ConsoleLoggerService(LogLevel.NONE)
        }
      ]
    })
    const service = TestBed.inject(ConsoleLoggerService);

    service.info('any');
    service.warn('any');
    service.error('any');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it(`should log all on LOG level`, () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConsoleLoggerService,
          useValue: new ConsoleLoggerService(LogLevel.INFO)
        }
      ]
    })
    const service = TestBed.inject(ConsoleLoggerService);

    service.info('');
    service.warn('');
    service.error('');

    expect(console.info).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it(`should filter logs on WARN level`, () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConsoleLoggerService,
          useValue: new ConsoleLoggerService(LogLevel.WARN)
        }
      ]
    })
    const service = TestBed.inject(ConsoleLoggerService);

    service.info('');
    service.warn('');
    service.error('');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it(`should show only errors on ERROR level`, () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ConsoleLoggerService,
          useValue: new ConsoleLoggerService(LogLevel.ERROR)
        }
      ]
    })
    const service = TestBed.inject(ConsoleLoggerService);

    service.info('');
    service.warn('');
    service.error('');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it(`should use WARN level by default`, () => {
    TestBed.configureTestingModule({
      providers: [
        ConsoleLoggerService
      ]
    })
    const service = TestBed.inject(ConsoleLoggerService);

    service.info('');
    service.warn('');
    service.error('');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });
})
