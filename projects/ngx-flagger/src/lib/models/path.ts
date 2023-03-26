import {InjectionToken} from "@angular/core";

export type PathEl = string | { path: string, wrapperName: string };
export type Path = PathEl | PathEl[];
export const PATH_TOKEN = new InjectionToken<Path>('FlagsHttpLoaderService path input')
