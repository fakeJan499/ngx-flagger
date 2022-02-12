import {LogLevel} from "./log-level.enum";
import {InjectionToken} from "@angular/core";

export type PathEl = string | { path: string, wrapperName: string };

export type Path = PathEl | PathEl[];

export interface RootConfig {
  path?: Path;
  flagsAlwaysTrue?: boolean;
  debugMessagesDisabled?: boolean;
  logLevel?: LogLevel
}

export const ROOT_CONFIG_TOKEN = new InjectionToken<RootConfig>('ngx-flagger root config');
