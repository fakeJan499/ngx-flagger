import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {HttpClientModule} from "@angular/common/http";
import {NgxFlaggerService} from "./ngx-flagger.service";
import {NgxFlaggerGuard} from "./ngx-flagger.guard";
import {NgxFlaggerDirective} from "./ngx-flagger.directive";
import {NgxFlaggerInitializerService} from "./ngx-flagger-initializer.service";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";

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
          provide: ngxFlaggerRootConfigInjectionToken,
          useValue: config
        },
        NgxFlaggerService,
        NgxFlaggerGuard,
        NgxFlaggerLogService,
        NgxFlaggerInitializerService,
        {
          provide: APP_INITIALIZER,
          useFactory: (initializer: NgxFlaggerInitializerService) => () => initializer.loadConfig(),
          deps: [NgxFlaggerInitializerService],
          multi: true
        }
      ]
    }
  }
}
