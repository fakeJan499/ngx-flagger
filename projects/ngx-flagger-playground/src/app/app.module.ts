import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {LogLevel, NgxFlaggerGuard, NgxFlaggerModule} from 'ngx-flagger';
import {RouterModule} from '@angular/router';
import {AComponent} from './a/a.component';
import {BOneComponent} from "./b-one/b-one.component";
import {BTwoComponent} from "./b-two/b-two.component";

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'routeA',
        component: AComponent,
        pathMatch: 'full',
        canActivate: [NgxFlaggerGuard],
        data: {requiredFeatureFlag: 'routeA'},
      },
      {
        path: 'routeB',
        canActivateChild: [NgxFlaggerGuard],
        data: {requiredFeatureFlag: 'routeB', featureFlagRedirect: '/routeA'},
        children: [
          {
            path: 'b1',
            component: BOneComponent,
            data: {featureFlagRedirect: '/'}, // this line overrides featureFlagRedirect from parent route
          },
          {path: 'b2', component: BTwoComponent},
        ],
      },
    ]),
    NgxFlaggerModule.forRoot({
      logLevel: LogLevel.INFO,
    }),
  ],
  declarations: [AppComponent, AComponent, BOneComponent, BTwoComponent],
  bootstrap: [AppComponent],
})
export class AppModule {
}
