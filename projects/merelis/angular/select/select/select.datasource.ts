import { Comparable, DisplayWith, FilterPredicate } from "../types";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";

export interface ViewerChange<T> {
    text?: string;
    selected?: T | T[] | null
}

export interface CollectionViewer<T> {
    /**
     * A stream that emits whenever the `CollectionViewer` starts looking at a new portion of the
     * data.
     */
    viewChange: Observable<ViewerChange<T>>;
}



export interface SelectDataSource<T> {

    connect(collectionViewer: CollectionViewer<T>): Observable<T[]>;

    disconnect(collectionViewer: CollectionViewer<T>): void;

    loading(collectionViewer: CollectionViewer<T>): Observable<boolean> | undefined;
}

class DataViewer<T> {
    readonly viewer: CollectionViewer<T>;
    readonly filtered = new BehaviorSubject<T[]>([]);
    readonly subscription: Subscription;
    private data: T[] = [];
    private viewerChange: ViewerChange<T> = {};
    private alwaysIncludesSelected: boolean;
    filterPredicate: FilterPredicate<T>
    compareWith: Comparable<T>;
    displayWith?: DisplayWith<T>;

    constructor(
        data: Observable<T[]>,
        viewer: CollectionViewer<T>,
        alwaysIncludesSelected: boolean,
        filterPredicate: FilterPredicate<T>,
        compareWith: Comparable<T>,
        displayWith: DisplayWith<T> | undefined,
    ) {
        this.viewer = viewer;
        this.alwaysIncludesSelected = alwaysIncludesSelected;
        this.filterPredicate = filterPredicate;
        this.compareWith = compareWith;
        this.displayWith = displayWith
        this.subscription = combineLatest([viewer.viewChange, data])
            .subscribe(([v, d]) => {
                this.data = d;
                this.viewerChange = v;
                this.doFilter();
            })
    }


    doFilter(): void {
        this.filtered.next(this.filterData(this.data ?? [], this.viewerChange ?? {}));
    }

    /**
     * Returns a filtered data array where each filter object contains the filter string within
     * the result of the filterPredicate function. If no filter is set, returns the data array
     * as provided.
     */
    private filterData(data: T[], viewer: ViewerChange<T>) {
        return !viewer.text ?
            data :
            data.filter(obj => this.filterPredicate(
                obj,
                viewer.text,
                viewer.selected,
                this.alwaysIncludesSelected,
                this.compareWith,
                this.displayWith,
            ));

    }
}


export class MerSelectDataSource<T> implements SelectDataSource<T> {

    get data(): T[] {
        return this._data.value;
    }

    set data(value: T[]) {
        this._data.next(value);
    }

    get compareWith(): Comparable<T> {
        return this._compareWith;
    }

    set compareWith(value: Comparable<T>) {
        this._compareWith = value;
        this.doUpdateDataViewers();
    }


    get displayWith(): DisplayWith<T> | undefined {
        return this._displayWith;
    }

    set displayWith(value: DisplayWith<T> | undefined) {
        this._displayWith = value;
        this.doUpdateDataViewers();
    }

    get filterPredicate(): FilterPredicate<T> {
        return this._filterPredicate;
    }

    set filterPredicate(value: FilterPredicate<T>) {
        this._filterPredicate = value;
        this.doUpdateDataViewers();
    }


    protected _data = new BehaviorSubject<T[]>([]);
    protected viewers: DataViewer<T>[] = [];
    protected alwaysIncludesSelected = false;

    constructor(data?: T[], options?: {
        alwaysIncludesSelected?: boolean,
        compareWith?: Comparable<T>,
        displayWith?: DisplayWith<T>,
        filterPredicate?: FilterPredicate<T>,
    }) {
        this._data.next(data ?? []);
        if (options) {
            this.alwaysIncludesSelected = options.alwaysIncludesSelected ?? false;
            if (options.compareWith) {
                this.compareWith = options.compareWith;
            }
            if (options.displayWith){
                this.displayWith = options.displayWith;
            }
            if (options.filterPredicate) {
                this.filterPredicate = options.filterPredicate;
            }
        }
    }

    connect(collectionViewer: CollectionViewer<T>): Observable<T[]> {
        const dataViewer = new DataViewer(this._data.asObservable(), collectionViewer,
            this.alwaysIncludesSelected,
            this.filterPredicate,
            this.compareWith,
            this.displayWith);
        this.viewers.push(dataViewer);
        return dataViewer.filtered.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer<T>): void {
        this.viewers = this.viewers.filter(dataViewer => {
            if (dataViewer.viewer === collectionViewer){
                dataViewer.subscription.unsubscribe();
                return false;
            }
            return true;
        });
    }

    dispose(): void {
        this.viewers.forEach(dataViewer => dataViewer.subscription.unsubscribe())
        this.viewers = [];
        this._data.complete();
    }

    loading(collectionViewer: CollectionViewer<T>): Observable<boolean> | undefined{
        return;
    }

    protected doUpdateDataViewers(): void {
        this.viewers.forEach(viewer => {
            viewer.compareWith = this._compareWith;
            viewer.filterPredicate = this._filterPredicate;
            viewer.doFilter();
        })
    }

    protected _compareWith: Comparable<T> = (a: T, b: T) => a === b;
    protected _displayWith?: DisplayWith<T>;

    /**
     * Checks if a data object matches the data source's filter string. By default, each data object
     * is converted to a string of its properties and returns true if the filter has
     * at least one occurrence in that string. By default, the filter string has its whitespace
     * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
     * filter matching.
     * @returns Whether the filter matches against the data
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
                    // This avoids matches where the values of two columns combined will match the user's query
                    // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                    // that has a very low chance of being typed in by somebody in a text field. This one in
                    // particular is "White up-pointing triangle with dot" from
                    // https://en.wikipedia.org/wiki/List_of_Unicode_characters
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
