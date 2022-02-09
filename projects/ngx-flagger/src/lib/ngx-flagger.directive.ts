import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {NgxFlaggerService} from "./ngx-flagger.service";

@Directive({
  selector: '[ngxFlagger]'
})
export class NgxFlaggerDirective implements OnInit {
  private requiredFlag: string = "";
  private elseTemplateRef: TemplateRef<any> | null = null;
  private explicitThenTemplateRef: TemplateRef<any> | null = null;
  private viewRef: TemplateRef<any> | null = null;

  @Input()
  set ngxFlaggerElse(val: TemplateRef<any>) {
    if (val) this.elseTemplateRef = val;
    else this.elseTemplateRef = null;

    this.updateView();
  }

  @Input()
  set ngxFlaggerThen(val: TemplateRef<any>) {
    if (val) this.explicitThenTemplateRef = val;
    else this.explicitThenTemplateRef = null;

    this.updateView();
  }

  @Input()
  set ngxFlagger(val: string) {
    if (val) {
      this.requiredFlag = val;
      this.updateView();
    }
  }

  constructor(
    private readonly implicitThenTemplateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly featureFlags: NgxFlaggerService
  ) {
  }

  ngOnInit() {
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
    if (this.explicitThenTemplateRef) {
      if (this.viewRef !== this.explicitThenTemplateRef) this.showTemplate(this.explicitThenTemplateRef);
    } else {
      if (this.viewRef !== this.implicitThenTemplateRef) this.showTemplate(this.implicitThenTemplateRef);
    }
  }

  private showElseTemplate() {
    if (this.elseTemplateRef && this.viewRef !== this.elseTemplateRef) this.showTemplate(this.elseTemplateRef);
  }

  private showTemplate(template: TemplateRef<any>) {
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(template);
    this.viewRef = template;
  }
}
