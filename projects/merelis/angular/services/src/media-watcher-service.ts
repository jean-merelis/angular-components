import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { fromPairs } from "lodash-es";
import { map, Observable, ReplaySubject } from "rxjs";

export interface MerMediaWatcherConfig {
    /**
     * Dictionary of screen breakpoints, consisting of alias and screen size.
     */
    breakpoints: { [key: string]: string };
}

export const MER_MEDIA_WATCHER_CONFIG = new InjectionToken<MerMediaWatcherConfig>("MER_MEDIA_WATCHER_CONFIG", {
    factory: () => ({
        breakpoints: {
            sm: "600px",
            md: "960px",
            lg: "1280px",
            xl: "1440px",
        }
    })
})

export interface MerMediaWatcherChange {
    matchingAliases: string[];
    matchingQueries: any;
}

@Injectable({
    providedIn: "root"
})
export class MerMediaWatcher {
    private breakpointObserver = inject(BreakpointObserver);
    private config = inject(MER_MEDIA_WATCHER_CONFIG);
    private mediaChanged = new ReplaySubject<MerMediaWatcherChange>(1);
    private queryToAliasMap = new Map<string, string>();

    constructor() {
        const screens = fromPairs(Object.entries(this.config.breakpoints).map(([alias, screenSize]) => ([alias, `(min-width: ${screenSize})`])));
        Object.entries(screens).forEach(([alias, query]) => {
            this.queryToAliasMap.set(query, alias);
        });
        this.breakpointObserver.observe(Object.values(screens) as string[])
            .pipe(
                map((state) => {
                    const matchingAliases: string[] = [];
                    const matchingQueries: any = {};
                    const matchingBreakpoints = Object.entries(state.breakpoints).filter(([query, matches]) => matches) ?? [];
                    for (const [query] of matchingBreakpoints) {
                        const matchingAlias = this.queryToAliasMap.get(query);
                        if (matchingAlias) {
                            matchingAliases.push(matchingAlias);
                            matchingQueries[matchingAlias] = query;
                        }
                    }
                    this.mediaChanged.next({
                        matchingAliases,
                        matchingQueries
                    });
                }))
            .subscribe()
    }

    get onChanges(): Observable<MerMediaWatcherChange> {
        return this.mediaChanged.asObservable();
    }


    onMediaQueryChanges(query: string | string[]): Observable<BreakpointState> {
        return this.breakpointObserver.observe(query);
    }
}
