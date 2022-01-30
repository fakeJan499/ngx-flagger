import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, UrlTree} from '@angular/router';
import {NgxFlaggerService} from "./ngx-flagger.service";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";

@Injectable()
export class NgxFlaggerGuard implements CanActivate, CanActivateChild {
  constructor(private readonly featureFlags: NgxFlaggerService,
              private readonly router: Router,
              private readonly logger: NgxFlaggerLogService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredFeatureFlag: string = route.data['requiredFeatureFlag'] as string;
    const featureFlagRedirect: string = (route.data['featureFlagRedirect'] as string) || '/';

    if (!requiredFeatureFlag) {
      const url = '/' + route.url.map(url => url.path).join('/');
      this.logger.error(`Route data 'requiredFeatureFlag' is not provided. Add 'requiredFeatureFlag' to the ${url} route data.`);
    }

    return requiredFeatureFlag && this.featureFlags.isFeatureFlagEnabled(requiredFeatureFlag)
      ? true
      : this.router.createUrlTree([featureFlagRedirect]);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.canActivate(childRoute);
  }

}
