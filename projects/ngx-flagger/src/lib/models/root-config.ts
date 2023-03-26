import {InjectionToken, Provider} from "@angular/core";

export interface RootConfig {
  /**
   * Provider of a loader that will load feature flags. The loader needs to extend or implement {@link FlagsLoaderService}.
   */
  loader: Provider;

  /**
   * Provider of a logger that will be used inside ngx-flagger. The logger needs to extend or implement {@link LoggerService}.
   *
   * No logger is used by default.
   */
  logger?: Provider;

  /**
   * When true, all feature flag expressions will be evaluated to true.
   */
  flagsAlwaysTrue?: boolean;

  /**
   * Run in development mode. This will add additional debugging features:
   * - Object.freeze on the flags object to guarantee immutability (default: false)
   *
   * Note: It makes sense to use it only during development to ensure there are no feature flags object mutations.
   */
  developmentMode?: boolean;
}

export const ROOT_CONFIG_TOKEN = new InjectionToken<RootConfig>('ngx-flagger root config');
