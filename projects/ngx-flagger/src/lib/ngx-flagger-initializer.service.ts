import {Inject, Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {ngxFlaggerRootConfigInjectionToken} from "./root-config-injection-token";
import {RootConfig} from "./root-config.interface";
import {NgxFlaggerLogService} from "./ngx-flagger-log.service";

@Injectable()
export class NgxFlaggerInitializerService {
  static readonly DEFAULT_PATH = `/assets/config.json`;
  readonly flags$ = new BehaviorSubject<Record<string, any> | null>(null);

  constructor(@Inject(ngxFlaggerRootConfigInjectionToken) private readonly config: RootConfig,
              private readonly http: HttpClient,
              private readonly logger: NgxFlaggerLogService) {
  }

  public loadConfig() {
    const path = this.config.path ?? NgxFlaggerInitializerService.DEFAULT_PATH;

    // toPromise used because of backward compatibility - to replace in the future
    return this.http.get<Record<string, any>>(path).toPromise()
      .then(config => {
        this.flags$.next(config ?? null);
      })
      .catch(err => {
        if (err.status === 404) {
          this.logger.error(`File ${path} not found.`);
        } else {
          this.logger.error(err)
        }
      });
  }
}
