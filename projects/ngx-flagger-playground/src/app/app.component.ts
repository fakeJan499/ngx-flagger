import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div *ngxFlagger="'someFeature'; else elseBlock">
      Text to display only if 'someFeature' flag is true.
    </div>
    <ng-template #elseBlock>Alternate text.</ng-template>

    <div *ngxFlagger="'*'">At least one flag is true</div>
    <div *ngxFlagger="'&'">All flags are true</div>
    <div *ngxFlagger="'routeA && routeB'">routeA and routeB flags are enabled</div>
    <div *ngxFlagger="'routeA || routeB'">routeA or routeB flag enabled</div>

    <nav>
      <a routerLink="/">root route</a>
      <a routerLink="/routeA">route A</a>
      <a routerLink="/routeB/b1">route B-1</a>
      <a routerLink="/routeB/b2">route B-2</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  title = 'ngx-flagger-test-app';
}
