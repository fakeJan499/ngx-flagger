import {Inject, Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
import {LoggerService} from "./logger.service";

@Injectable()
export class InitializerService {
  static readonly DEFAULT_PATH = `/assets/config.json`;
  readonly flags$ = new BehaviorSubject<Record<string, any> | null>(null);

  constructor(@Inject(ROOT_CONFIG_TOKEN) private readonly config: RootConfig,
              private readonly http: HttpClient,
              private readonly logger: LoggerService) {
  }

  public loadConfig() {
    const path = this.config.path ?? InitializerService.DEFAULT_PATH;

    // toPromise used because of backward compatibility - to replace in the future
    return this.http.get<Record<string, any>>(path).toPromise()
      .then(config => {
        this.flags$.next(config ?? null);
        this.logger.info('Loaded flags.');
      })
      .catch(err => {
        if (err.status === 404) {
          this.logger.error(`File ${path} not found.`);
        } else {
          this.logger.error(err.message)
        }
      });
  }
}
