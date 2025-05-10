import { Comparable, DisplayWith, FilterPredicate } from "../types";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export interface FilterCriteria<T> {
    searchText?: string;
    selected?: T | T[] | null
}

export interface SelectDataSource<T> {
    /**
     * Connect to the data source to get updates
     */
    connect(): Observable<T[]>;

    /**
     * Disconnect from the data source
     */
    disconnect(): void;

    /**
     * Apply filter criteria as user types to filter data or fetch from server.
     * Can return void for synchronous operations or Promise<void> for async operations.
     * Note: If a Promise is returned, it will be "fire and forget" - the select component
     * will not wait for the Promise to resolve before emitting changes.
     */
    applyFilter(criteria: FilterCriteria<T>): void | Promise<void>;

    /**
     * Optional loading state observable
     */
    loading(): Observable<boolean> | undefined;
}

export class MerSelectDataSource<T> implements SelectDataSource<T> {
    // Data-related subjects and observables
    protected _data = new BehaviorSubject<T[]>([]);
    protected _filteredData = new BehaviorSubject<T[]>([]);
    protected _currentFilter = new BehaviorSubject<FilterCriteria<T>>({});
    protected _alwaysIncludesSelected = false;
    protected _onConnected = new Subject<void>();
    protected _onDisconnected = new Subject<void>();

    get data(): T[] {
        return this._data.value;
    }

    set data(value: T[]) {
        this._data.next(value);
        this._applyFilters();
    }

    get compareWith(): Comparable<T> {
        return this._compareWith;
    }

    set compareWith(value: Comparable<T>) {
        this._compareWith = value;
        this._applyFilters();
    }

    get displayWith(): DisplayWith<T> | undefined {
        return this._displayWith;
    }

    set displayWith(value: DisplayWith<T> | undefined) {
        this._displayWith = value;
        this._applyFilters();
    }

    get filterPredicate(): FilterPredicate<T> {
        return this._filterPredicate;
    }

    set filterPredicate(value: FilterPredicate<T>) {
        this._filterPredicate = value;
        this._applyFilters();
    }

    get onConnected(): Observable<void> {
        return this._onConnected.asObservable();
    }

    get onDisconnected(): Observable<void> {
        return this._onDisconnected.asObservable();
    }

    constructor(data?: T[], options?: {
        alwaysIncludesSelected?: boolean,
        compareWith?: Comparable<T>,
        displayWith?: DisplayWith<T>,
        filterPredicate?: FilterPredicate<T>,
    }) {
        this._data.next(data ?? []);

        if (options) {
            this._alwaysIncludesSelected = options.alwaysIncludesSelected ?? false;
            if (options.compareWith) {
                this._compareWith = options.compareWith;
            }
            if (options.displayWith) {
                this._displayWith = options.displayWith;
            }
            if (options.filterPredicate) {
                this._filterPredicate = options.filterPredicate;
            }
        }

        // Initialize filtered data
        this._applyFilters();
    }

    connect(): Observable<T[]> {
        this._onConnected.next();
        return this._filteredData.asObservable();
    }

    disconnect(): void {
        this._data.complete();
        this._filteredData.complete();
        this._currentFilter.complete();
        this._onConnected.complete();
        this._onDisconnected.complete();
        this._onConnected.complete();

        this._onDisconnected.next();
        this._onDisconnected.complete();
    }

    loading(): Observable<boolean> | undefined {
        return undefined;
    }

    applyFilter(criteria: FilterCriteria<T>): void {
        this._currentFilter.next(criteria);
        this._applyFilters();
    }

    protected _applyFilters(): void {
        const data = this._data.value;
        const filter = this._currentFilter.value;
        this._filteredData.next(this._filterData(data, filter));
    }

    /**
     * Returns a filtered data array based on the current filter criteria
     */
    private _filterData(data: T[], filter: FilterCriteria<T>): T[] {
        return !filter.searchText ?
            data :
            data.filter(obj => this._filterPredicate(
                obj,
                filter.searchText,
                filter.selected,
                this._alwaysIncludesSelected,
                this._compareWith,
                this._displayWith,
            ));
    }

    protected _compareWith: Comparable<T> = (a: T, b: T) => a === b;
    protected _displayWith?: DisplayWith<T>;

    /**
     * Default filter predicate implementation
     */
    protected _filterPredicate: FilterPredicate<T> = (data, filter, selected, alwaysIncludesSelected, compareWith, displayWith): boolean => {
        if (!filter) {
            return true;
        }

        if (alwaysIncludesSelected && selected) {
            if (Array.isArray(selected)) {
                const has = selected.some(item => compareWith(item, data))
                if (has) {
                    return true;
                }
            } else {
                if (compareWith(data, selected)) {
                    return true;
                }
            }
        }

        if (typeof filter === 'string') {
            // Transform the data into a lowercase string of all property values.
            const target = displayWith ? displayWith(data) : data;
            const dataStr = (typeof target === 'string') ? target.toLowerCase().trim() : Object.keys(target as unknown as Record<string, any>)
                .reduce((currentTerm: string, key: string) => {
                    // Use an obscure Unicode character to delimit the words in the concatenated string.
                    return currentTerm + (target as unknown as Record<string, any>)[key] + '◬';
                }, '')
                .toLowerCase();

            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();

            return dataStr.indexOf(transformedFilter) != -1;
        } else {
            //TODO: filter from object
            return true;
        }
    };
}
