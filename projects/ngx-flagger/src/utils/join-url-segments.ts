import {UrlSegment} from "@angular/router";

export const joinUrlSegments = (seg: UrlSegment[]): string => '/' + seg.map(url => url.path).join('/');
