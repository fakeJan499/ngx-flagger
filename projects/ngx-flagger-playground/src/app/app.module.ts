import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppComponent} from './app.component';
import {
  ConsoleLoggerService,
  FlagsHttpLoaderService,
  FlagsLoaderService,
  LoggerService,
  LogLevel,
  ngxFlaggerGuardFactory,
  NgxFlaggerModule
} from 'ngx-flagger';
import {RouterModule} from '@angular/router';
import {AComponent} from './a/a.component';
import {BOneComponent} from "./b-one/b-one.component";
import {BTwoComponent} from "./b-two/b-two.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: 'routeA',
        component: AComponent,
        pathMatch: 'full',
        canActivate: [ngxFlaggerGuardFactory('routeA', {redirectTo: '/'})],
      },
      {
        path: 'routeB',
        canActivateChild: [ngxFlaggerGuardFactory('routeB')],
        children: [
          {
            path: 'b1',
            component: BOneComponent,
          },
          {path: 'b2', component: BTwoComponent},
        ],
      },
    ]),
    NgxFlaggerModule.forRoot({
      loader: {
        provide: FlagsLoaderService,
        useClass: FlagsHttpLoaderService
      },
      logger: {
        provide: LoggerService,
        useValue: new ConsoleLoggerService(LogLevel.INFO)
      }
    }),
  ],
  declarations: [AppComponent, AComponent, BOneComponent, BTwoComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
}
