import {Injectable} from "@angular/core";

@Injectable()
export abstract class LoggerService {
  protected constructor(...args: any) {
  }

  abstract error(message: string): void;

  abstract warn(message: string): void;

  abstract info(message: string): void;
}
