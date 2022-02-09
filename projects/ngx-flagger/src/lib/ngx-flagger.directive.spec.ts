import {Component} from "@angular/core";
import {NgxFlaggerDirective} from "./ngx-flagger.directive";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {NgxFlaggerService} from "./ngx-flagger.service";
import {By} from "@angular/platform-browser";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

@Component({
  template: `
    <div id="flag-on" *ngxFlagger="flagName; else flagDisabled"></div>
    <ng-template #flagDisabled>
      <div id="flag-off"></div>
    </ng-template>

    <div *ngxFlagger="flagName; then thenBlock"><div id="inner"></div></div>
    <ng-template #thenBlock><div id="then-block"></div></ng-template>
  `
})
class NgxFlaggerHelperComponent {
  flagName = 'flag';
}

describe(`NgxFlaggerDirective`, () => {
  let fixture: ComponentFixture<NgxFlaggerHelperComponent>;
  let flaggerService: SpyObj<NgxFlaggerService>;

  beforeEach(() => {
    flaggerService = createSpyObj('NgxFlaggerService', ['isFeatureFlagEnabled']);

    fixture = TestBed.configureTestingModule({
      declarations: [NgxFlaggerDirective, NgxFlaggerHelperComponent],
      providers: [
        {
          provide: NgxFlaggerService,
          useValue: flaggerService
        }
      ]
    }).createComponent(NgxFlaggerHelperComponent);
  });

  it(`should show host element if feature flag enabled`, () => {
    const flagName = fixture.componentInstance.flagName;
    flaggerService.isFeatureFlagEnabled.withArgs(flagName).and.returnValue(true);
    fixture.detectChanges();

    const debugEl = fixture.debugElement;
    const el = debugEl.query(By.css('#flag-on'));

    expect(el).toBeTruthy();
  });

  it(`should hide host element if feature flag is disabled`, () => {
    const flagName = fixture.componentInstance.flagName;
    flaggerService.isFeatureFlagEnabled.withArgs(flagName).and.returnValue(false);
    fixture.detectChanges();

    const debugEl = fixture.debugElement;
    const el = debugEl.query(By.css('#flag-on'));

    expect(el).toBeFalsy();
  });

  it(`should show content from templateRef provided as else if feature flag is disabled`, () => {
    const flagName = fixture.componentInstance.flagName;
    flaggerService.isFeatureFlagEnabled.withArgs(flagName).and.returnValue(false);
    fixture.detectChanges();

    const debugEl = fixture.debugElement;
    const el = debugEl.query(By.css('#flag-off'));

    expect(el).toBeTruthy();
  });

  it(`should show "then" block`, () => {
    const flagName = fixture.componentInstance.flagName;
    flaggerService.isFeatureFlagEnabled.withArgs(flagName).and.returnValue(true);
    fixture.detectChanges();

    const debugEl = fixture.debugElement;
    const el = debugEl.query(By.css('#then-block'));

    expect(el).toBeTruthy();
  });
});
