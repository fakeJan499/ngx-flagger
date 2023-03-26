import {Injectable} from "@angular/core";
import {BehaviorSubject, concatMap, EMPTY} from "rxjs";
import {LoggerService} from "./loggers";
import {FlagsLoaderService} from "./loaders";

@Injectable()
export class InitializerService {
  readonly flags$ = new BehaviorSubject<Record<string, any> | null>(null);

  constructor(private readonly logger: LoggerService,
              private readonly loader: FlagsLoaderService) {
  }

  public loadFlags() {
    return this.loader.loadFlags().pipe(concatMap(config => {
      this.flags$.next(config);

      return EMPTY;
    }));
  }
}
