import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {Flags} from "../models";

@Injectable()
export abstract class FlagsLoaderService {
  protected constructor() {
  }

  abstract loadFlags(): Observable<Flags>;
}
