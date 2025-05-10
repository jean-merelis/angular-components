import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { FilterCriteria, SelectDataSource } from './select.datasource';

/**
 * Interface for search services that can be used with TypeaheadDataSource
 */
export interface TypeaheadSearchService<T> {
    /**
     * Search method that takes a query string and returns an Observable of results
     * @param query The search query string
     * @returns Observable of search results
     */
    search(query: string): Observable<T[]>;
}

/**
 * Represents a function type definition for a typeahead search operation.
 *
 * @template T The type of the items returned in the search results.
 * @param {string} query The search query string input used to perform the typeahead search.
 * @returns {Observable<T[]>} An Observable that emits an array of type `T` items matching the search query.
 */
export type TypeaheadSearchFn<T> = (query: string) => Observable<T[]>;

export interface TypeaheadDataSourceOptions<T> {

    /**
     * Whether to always include selected items in the results. Default false.
     */
    alwaysIncludeSelected?: boolean;

    /**
     * When set to true, suppresses the emission of loading events.
     * Useful for cases where you do not want to show loading indicators in the UI component.
     * @default false
     */
    suppressLoadingEvents?: boolean;
    /**
     * Custom function to compare items for equality (defaults to comparing by reference)
     * @param a
     * @param b
     */
    compareWith?:  (a: T, b: T) => boolean ;
}

/**
 * Generic TypeaheadDataSource implementation that can be used with MerSelect
 * for typeahead functionality with automatic cancellation of previous requests
 */
export class TypeaheadDataSource<T> implements SelectDataSource<T> {
    // Stream of current data
    private data = new BehaviorSubject<T[]>([]);

    protected _onConnected = new Subject<void>();
    protected _onDisconnected = new Subject<void>();

    // Stream of loading state
    private loading$ = new BehaviorSubject<boolean>(false);

    // Subject to trigger new searches
    private searchSubject = new Subject<FilterCriteria<T>>();

    private alwaysIncludeSelected: boolean;
    private suppressLoadingEvents: boolean;
    private compareWith: (a: T, b: T) => boolean;

    /**
     * Returns an Observable that emits when the connection is established.
     *
     * @return {Observable<void>} An Observable that emits a void value when the connection occurs.
     */
    get onConnected(): Observable<void> {
        return this._onConnected.asObservable();
    }

    /**
     * Returns an observable that emits when the disconnection event occurs.
     *
     * @return {Observable<void>} An observable that emits a void value upon disconnection.
     */
    get onDisconnected(): Observable<void> {
        return this._onDisconnected.asObservable();
    }

    /**
     * Constructs an instance of the class with the provided search service and options.
     * Initializes the typeahead search pipeline, including handling cancellation of previous search requests, managing the inclusion of selected items, and emitting search results.
     *
     * @param {TypeaheadSearchFn<T> | TypeaheadSearchService<T>} searchService - The service or function used to perform the typeahead search. If a function is provided, it should return an observable with the search results.
     * @param {TypeaheadDataSourceOptions<T>} [options={}] - Optional configuration options for the typeahead data source. Includes settings such as whether to always include selected items or suppress loading events.
     * - `alwaysIncludeSelected`: Whether to always include selected items in the search results.
     * - `suppressLoadingEvents`: Whether to suppress loading indicators during search operations.
     * - `compareWith`: A comparison function to determine equality between items.
     *
     */
    constructor(
        private searchService: TypeaheadSearchFn<T> | TypeaheadSearchService<T>,
        private options: TypeaheadDataSourceOptions<T> = {}
    ) {
        this.alwaysIncludeSelected = options.alwaysIncludeSelected ?? false;
        this.suppressLoadingEvents = options.suppressLoadingEvents ?? false;
        this.compareWith = options.compareWith ?? ((a, b) => a === b);

        // Set up the search pipeline with automatic cancellation
        this.searchSubject.pipe(
            // Use switchMap to automatically cancel previous request when a new one comes in
            switchMap(criteria => {

                if (!this.suppressLoadingEvents){
                  this.loading$.next(true);
                }

                const searchQuery = criteria.searchText || '';
                const searchResult = typeof this.searchService === 'function'
                    ? this.searchService(searchQuery)
                    : this.searchService.search(searchQuery);

                return searchResult.pipe(
                    // Process the results to include selected items if needed
                    map(results => {
                        // Only process if we have search text, selected items, and alwaysIncludeSelected is true
                        if (this.alwaysIncludeSelected && criteria.searchText && criteria.selected) {
                            // Handle multiple selection
                            if (Array.isArray(criteria.selected)) {
                                // Make sure each selected item is in the results
                                criteria.selected.forEach(selectedItem => {
                                    // Skip null or undefined items
                                    if (!selectedItem) return;

                                    // Check if this selected item exists in the results
                                    const exists = results.some(item =>
                                        this.compareWith(item, selectedItem)
                                    );

                                    // If not found, add it to the results
                                    if (!exists) {
                                        results = [...results, selectedItem];
                                    }
                                });
                            }
                            // Handle single selection
                            else if (criteria.selected) {
                                // Check if selected item exists in results
                                const exists = results.some(item =>
                                    this.compareWith(item, criteria.selected as T)
                                );

                                // If not found, add it
                                if (!exists) {
                                    results = [...results, criteria.selected as T];
                                }
                            }
                        }

                        return results;
                    }),
                    // Handle errors gracefully
                    catchError(error => {
                        console.error('Error in typeahead search:', error);
                        return of([] as T[]);
                    }),
                    // Always turn off loading indicator when done
                    finalize(() => {
                        if (!this.suppressLoadingEvents){
                            this.loading$.next(false);
                        }
                    })
                );
            })
        ).subscribe(results => {
            // Update the data stream with new results
            this.data.next(results);
        });
    }

    /**
     * Required by SelectDataSource interface - returns the data stream
     */
    connect(): Observable<T[]> {
        this._onConnected.next();
        return this.data.asObservable();
    }

    /**
     * Required by SelectDataSource interface - cleans up resources
     */
    disconnect(): void {
        this.searchSubject.complete();
        this.loading$.complete();
        this.data.complete();
        this._onConnected.complete();

        this._onDisconnected.next();
        this._onDisconnected.complete();
    }

    /**
     * Required by SelectDataSource interface - returns the loading state stream
     */
    loading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    /**
     * Main method used by MerSelect for filtering
     * @param criteria The filter criteria from the component
     */
    applyFilter(criteria: FilterCriteria<T>): void {
        // Pass the entire criteria object to our subject
        this.searchSubject.next(criteria);
    }
}
