import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, UrlTree} from '@angular/router';
import {NgxFlaggerService} from "./ngx-flagger.service";
import {LoggerService} from "./logger.service";
import {joinUrlSegments} from "../utils/join-url-segments";

@Injectable()
export class NgxFlaggerGuard implements CanActivate, CanActivateChild {
  constructor(private readonly featureFlags: NgxFlaggerService,
              private readonly router: Router,
              private readonly logger: LoggerService) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredFeatureFlag: string = route.data['requiredFeatureFlag'] as string;
    const featureFlagRedirect: string = (route.data['featureFlagRedirect'] as string);

    if (!requiredFeatureFlag) {
      const url = joinUrlSegments(route.url);
      this.logger.error(`Route data 'requiredFeatureFlag' is not provided. Add 'requiredFeatureFlag' to the ${url} route data.`);
    }

    return requiredFeatureFlag && this.featureFlags.isFeatureFlagEnabled(requiredFeatureFlag)
      ? true
      : this.redirect(featureFlagRedirect, route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.canActivate(childRoute);
  }

  private redirect(destination: string, route: ActivatedRouteSnapshot) {
    if (!destination)
      this.logger.info(`'featureFlagRedirect' is falsy in route '${joinUrlSegments(route.url)}'. Redirecting to '/'.`)

    return this.router.createUrlTree([destination || '/']);
  }

}
