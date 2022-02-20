import {Inject, Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, zip} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {Path, PathEl, ROOT_CONFIG_TOKEN, RootConfig} from "./root-config";
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
    return this.createLoader(path).toPromise()
      .then(config => {
        this.flags$.next(config);
        this.logger.info('Loaded flags.');
      });
  }

  private createLoader(path: Path): Observable<any> {
    if (Array.isArray(path)) return this.createArrayLoader(path);

    return this.createSimpleLoader(path);
  }

  private createArrayLoader(path: PathEl[]): Observable<any> {
    return zip(...path.map(p => this.createSimpleLoader(p))).pipe(
      map(res => res.reduce((config, val) => ({...config, ...val}), {}))
    );
  }

  private createSimpleLoader(path: PathEl): Observable<any> {
    let resourcePath = typeof path === 'object' ? path.path : path;

    return this.http.get(resourcePath).pipe(
      map(c => {
        if (typeof path === 'object') {
          const config: Record<string, any> = {};
          config[path.wrapperName] = c;
          return config;
        }

        return c;
      }),
      catchError(e => {
        this.logError(e, resourcePath);
        return of({});
      })
    );
  }

  private logError(err: { message: string, status: number }, path: string): void {
    if (err.status === 404) {
      this.logger.error(`File ${path} not found.`);
    } else {
      this.logger.error(err.message)
    }
  }
}
