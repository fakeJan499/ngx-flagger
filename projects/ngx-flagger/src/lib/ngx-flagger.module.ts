import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {InitializerService} from "./initializer.service";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {LoggerService, NoopLoggerService} from "./loggers";
import {NgxFlaggerDirective, NgxFlaggerService} from "./consumers";

@NgModule({
  declarations: [NgxFlaggerDirective],
  exports: [NgxFlaggerDirective]
})
export class NgxFlaggerModule {
  static forRoot(config: RootConfig): ModuleWithProviders<NgxFlaggerModule> {
    return {
      ngModule: NgxFlaggerModule,
      providers: [
        {
          provide: ROOT_CONFIG_TOKEN,
          useValue: config
        },
        config.logger ? config.logger : {provide: LoggerService, useClass: NoopLoggerService},
        config.loader,
        InitializerService,
        NgxFlaggerService,
        {
          provide: APP_INITIALIZER,
          useFactory: (initializer: InitializerService) => () => initializer.loadFlags(),
          deps: [InitializerService],
          multi: true
        }
      ]
    }
  }
}
