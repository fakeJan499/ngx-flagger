import {FlagsLoaderService} from "../lib/loaders";
import {Observable, of} from "rxjs";
import {Flags} from "../lib/models";

export class NoopLoaderService implements FlagsLoaderService {
  loadFlags(): Observable<Flags> {
    return of({});
  }
}
