import {Directive, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {NgxFlaggerService} from "./ngx-flagger.service";

@Directive({
  selector: '[ngxFlagger]'
})
export class NgxFlaggerDirective implements OnInit{
  private requiredFlag: string = "";
  private elseTemplate: TemplateRef<any> | null = null
  private isHidden = true;
  private isElseHidden = true;

  @Input()
  set ngxFlaggerElse(val: TemplateRef<any>) {
    if (val) this.elseTemplate = val;
    else this.elseTemplate = null;
  }

  @Input()
  set ngxFlagger(val: string) {
    if (val) {
      this.requiredFlag = val;
      this.updateView();
    }
  }

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly featureFlags: NgxFlaggerService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    if (this.checkValidity()) {
      if (this.isHidden) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
        this.isElseHidden = true;
      }
    } else {
      this.viewContainer.clear();
      this.isHidden = true;
      if (this.elseTemplate && this.isElseHidden) {
        this.isElseHidden = false;
        this.viewContainer.createEmbeddedView(this.elseTemplate);
      }
    }
  }

  private checkValidity() {
    return this.requiredFlag && this.featureFlags.isFeatureFlagEnabled(this.requiredFlag);
  }

}
