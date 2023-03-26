import {Inject, Injectable, Optional} from "@angular/core";
import {FlagsLoaderService} from "./flags-loader.service";
import {Flags, Path, PATH_TOKEN, PathEl} from "../root-config";
import {concatMap, Observable, of, zip} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {LoggerService} from "../loggers";

@Injectable()
export class FlagsHttpLoaderService implements FlagsLoaderService {
  static readonly DEFAULT_PATH = `/assets/feature-management.json`;

  constructor(private readonly http: HttpClient,
              private readonly logger: LoggerService,
              @Optional() @Inject(PATH_TOKEN) private readonly path?: Path | null) {
  }

  loadFlags(): Observable<Flags> {
    const path = this.path ?? FlagsHttpLoaderService.DEFAULT_PATH;

    return this.createLoader(path).pipe(
      concatMap(flags => {
        this.logger.info(`Loaded flags from ${path}.`);

        return of(flags);
      })
    )
  }

  private createLoader(path: Path): Observable<Flags> {
    if (Array.isArray(path)) return this.createArrayLoader(path);

    return this.createSimpleLoader(path);
  }

  private createArrayLoader(path: PathEl[]): Observable<Flags> {
    return zip(...path.map(p => this.createSimpleLoader(p))).pipe(
      map(res => res.reduce((config, val) => ({...config, ...val}), {}))
    );
  }

  private createSimpleLoader(path: PathEl): Observable<Flags> {
    const isPathObject = typeof path === 'object';
    const resourcePath = isPathObject ? path.path : path;

    return this.http.get<Flags>(resourcePath).pipe(
      map(v => {
        if (isPathObject) return {[path.wrapperName]: v} as Flags;

        return v;
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
