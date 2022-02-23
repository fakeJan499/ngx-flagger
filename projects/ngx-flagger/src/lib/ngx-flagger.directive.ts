import {Directive, Input, OnChanges, TemplateRef, ViewContainerRef} from '@angular/core';
import {NgxFlaggerService} from "./ngx-flagger.service";

@Directive({
  selector: '[ngxFlagger]'
})
export class NgxFlaggerDirective implements OnChanges {
  private requiredFlag: string = "";
  private elseTemplateRef: TemplateRef<any> | null = null;
  private explicitThenTemplateRef: TemplateRef<any> | null = null;
  private viewRef: TemplateRef<any> | null = null;

  @Input()
  set ngxFlaggerElse(val: TemplateRef<any>) {
    if (val) this.elseTemplateRef = val;
    else this.elseTemplateRef = null;
  }

  @Input()
  set ngxFlaggerThen(val: TemplateRef<any>) {
    if (val) this.explicitThenTemplateRef = val;
    else this.explicitThenTemplateRef = null;
  }

  @Input()
  set ngxFlagger(val: string) {
    if (val) this.requiredFlag = val;
  }

  constructor(
    private readonly implicitThenTemplateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly featureFlags: NgxFlaggerService
  ) {
  }

  ngOnChanges() {
    this.updateView();
  }

  private updateView() {
    if (this.requiredFeatureFlagEnabled()) this.showThenTemplate()
    else this.showElseTemplate();
  }

  private requiredFeatureFlagEnabled() {
    return this.requiredFlag && this.featureFlags.isFeatureFlagEnabled(this.requiredFlag);
  }

  private showThenTemplate() {
    if (this.requireTemplateChangeTo(this.explicitThenTemplateRef))
      this.showTemplate(this.explicitThenTemplateRef!);
    else if (this.requireTemplateChangeTo(this.implicitThenTemplateRef))
      this.showTemplate(this.implicitThenTemplateRef);
  }

  private showElseTemplate() {
    if (this.requireTemplateChangeTo(this.elseTemplateRef)) this.showTemplate(this.elseTemplateRef!);
  }

  private requireTemplateChangeTo(t: TemplateRef<any> | null): boolean {
    return !!t && this.viewRef !== t;
  }

  private showTemplate(template: TemplateRef<any>) {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(template);
    this.viewRef = template;
  }
}
