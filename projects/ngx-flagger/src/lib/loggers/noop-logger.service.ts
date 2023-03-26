import {Injectable} from "@angular/core";
import {LoggerService} from "./logger.service";

@Injectable()
export class NoopLoggerService implements LoggerService {
  error(message: string): void {
  }

  info(message: string): void {
  }

  warn(message: string): void {
  }

}
