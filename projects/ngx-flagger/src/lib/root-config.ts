import {InjectionToken, Provider} from "@angular/core";

export type PathEl = string | { path: string, wrapperName: string };
export type Path = PathEl | PathEl[];
export const PATH_TOKEN = new InjectionToken<Path>('FlagsHttpLoaderService path input')

export type Flag = Record<string, boolean>;
export type Flags = Record<string, Flag | boolean>;


export interface RootConfig {
  loader: Provider;
  logger?: Provider;
  flagsAlwaysTrue?: boolean;
  developmentMode?: boolean;
}

export const ROOT_CONFIG_TOKEN = new InjectionToken<RootConfig>('ngx-flagger root config');
