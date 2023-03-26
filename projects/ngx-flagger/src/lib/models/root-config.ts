import {InjectionToken, Provider} from "@angular/core";

export interface RootConfig {
  loader: Provider;
  logger?: Provider;
  flagsAlwaysTrue?: boolean;
  developmentMode?: boolean;
}

export const ROOT_CONFIG_TOKEN = new InjectionToken<RootConfig>('ngx-flagger root config');
