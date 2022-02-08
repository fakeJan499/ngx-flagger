import {LogLevel} from "./log-level.enum";

export interface RootConfig {
  path?: string;
  flagsAlwaysTrue?: boolean;
  debugMessagesDisabled?: boolean;
  logLevel?: LogLevel
}
