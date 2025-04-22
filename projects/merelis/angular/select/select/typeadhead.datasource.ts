import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { FilterCriteria, SelectDataSource } from '@merelis/angular/select';

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
 * Generic TypeaheadDataSource implementation that can be used with MerSelectComponent
 * for typeahead functionality with automatic cancellation of previous requests
 */
export class TypeaheadDataSource<T> implements SelectDataSource<T> {
    // Stream of current data
    private data = new BehaviorSubject<T[]>([]);

    // Stream of loading state
    private loading$ = new BehaviorSubject<boolean>(false);

    // Subject to trigger new searches
    private searchSubject = new Subject<FilterCriteria<T>>();

    /**
     * Creates a new TypeaheadDataSource
     * @param searchService Service that implements the search functionality
     * @param alwaysIncludeSelected Whether to always include selected items in the results. Default false.
     * @param compareItems Custom function to compare items for equality (defaults to comparing by reference)
     */
    constructor(
        private searchService: TypeaheadSearchService<T>,
        private alwaysIncludeSelected: boolean = false,
        private compareItems: (a: T, b: T) => boolean = (a, b) => a === b
    ) {
        // Set up the search pipeline with automatic cancellation
        this.searchSubject.pipe(
            // Use switchMap to automatically cancel previous request when a new one comes in
            switchMap(criteria => {
                this.loading$.next(true);

                return this.searchService.search(criteria.searchText || '').pipe(
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
                                        this.compareItems(item, selectedItem)
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
                                    this.compareItems(item, criteria.selected as T)
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
                    finalize(() => this.loading$.next(false))
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
        return this.data.asObservable();
    }

    /**
     * Required by SelectDataSource interface - cleans up resources
     */
    disconnect(): void {
        this.searchSubject.complete();
        this.loading$.complete();
        this.data.complete();
    }

    /**
     * Required by SelectDataSource interface - returns the loading state stream
     */
    loading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    /**
     * Main method used by MerSelectComponent for filtering
     * @param criteria The filter criteria from the component
     */
    async applyFilter(criteria: FilterCriteria<T>): Promise<void> {
        // Pass the entire criteria object to our subject
        this.searchSubject.next(criteria);
    }
}
