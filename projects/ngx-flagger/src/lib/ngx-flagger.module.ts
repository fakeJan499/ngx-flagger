import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {NgxFlaggerService} from "./ngx-flagger.service";
import {NgxFlaggerGuard} from "./ngx-flagger.guard";
import {NgxFlaggerDirective} from "./ngx-flagger.directive";
import {InitializerService} from "./initializer.service";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {LoggerService} from "./logger.service";

@NgModule({
  imports: [
    HttpClientModule
  ],
  declarations: [
    NgxFlaggerDirective
  ],
  exports: [
    NgxFlaggerDirective
  ]
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
        NgxFlaggerService,
        NgxFlaggerGuard,
        LoggerService,
        InitializerService,
        {
          provide: APP_INITIALIZER,
          useFactory: (initializer: InitializerService) => () => initializer.loadConfig(),
          deps: [InitializerService],
          multi: true
        }
      ]
    }
  }
}
