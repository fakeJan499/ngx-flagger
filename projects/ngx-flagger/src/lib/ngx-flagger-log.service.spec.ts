import {NgxFlaggerLogService} from "./ngx-flagger-log.service";
import {TestBed} from "@angular/core/testing";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import createSpy = jasmine.createSpy;
import Spy = jasmine.Spy;

describe('NgxFlaggerLogService', () => {
  let service: NgxFlaggerLogService;
  let config: RootConfig;

  beforeEach(() => {
    config = {};

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

  it('should log to the console', () => {
    const message = 'Logger works';
    console.log = createSpy('log');

    service.log(message);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect((console.log as Spy).calls.first().args[0]).toContain(message);
  });

  it('should not log to the console if debugMessagesDisabled', () => {
    console.log = createSpy('log');
    config.debugMessagesDisabled = true;

    service.log('any');

    expect(console.log).not.toHaveBeenCalled();
  });

  it('should warn to the console', () => {
    const message = 'Warn 123';
    console.warn = createSpy('warn');

    service.warn(message);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect((console.warn as Spy).calls.first().args[0]).toContain(message);
  });

  it('should not warn to the console if debugMessagesDisabled', () => {
    console.warn = createSpy('warn');
    config.debugMessagesDisabled = true;

    service.log('any');

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should error to the console', () => {
    const message = 'some error message';
    console.error = createSpy('error');

    service.error(message);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect((console.error as Spy).calls.first().args[0]).toContain(message);
  });

  it('should not error to the console if debugMessagesDisabled', () => {
    console.error = createSpy('error');
    config.debugMessagesDisabled = true;

    service.log('any');

    expect(console.error).not.toHaveBeenCalled();
  });
})
