import {Flags} from "../lib/root-config";
import {FlagsLoaderService} from "../lib/loaders";
import {Observable, of} from "rxjs";

export class NoopLoaderService implements FlagsLoaderService {
  loadFlags(): Observable<Flags> {
    return of({});
  }
}
