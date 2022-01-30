import {InjectionToken} from "@angular/core";
import {RootConfig} from "./root-config.interface";

export const ngxFlaggerRootConfigInjectionToken = new InjectionToken<RootConfig>('root config provided by developer');
