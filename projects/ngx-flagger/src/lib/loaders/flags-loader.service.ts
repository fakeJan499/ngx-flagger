import {Flags} from "../root-config";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable()
export abstract class FlagsLoaderService {
  protected constructor(...args: any) {
  }

  abstract loadFlags(): Observable<Flags>;
}
