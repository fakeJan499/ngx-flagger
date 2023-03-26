import {inject} from '@angular/core';
import {ActivatedRouteSnapshot, Router, UrlTree} from '@angular/router';
import {NgxFlaggerService} from "./ngx-flagger.service";
import {LoggerService} from "../loggers";
import {joinUrlSegments} from "../../utils";

export interface NgxFlaggerGuardFactoryData {
  redirectTo?: string;
}

export const ngxFlaggerGuardFactory = (requiredFlag: string, config?: NgxFlaggerGuardFactoryData) => (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const featureFlags = inject(NgxFlaggerService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (!requiredFlag) {
    const url = joinUrlSegments(route.url);
    logger.error(`Error in route ${url} - required flag cannot be empty.`);
    return false;
  }

  if (featureFlags.isFeatureFlagEnabled(requiredFlag)) return true;

  if (config?.redirectTo) {
    logger.info(`Redirects to ${config.redirectTo}`);
    return router.createUrlTree([config.redirectTo]);
  }

  return false;
}
