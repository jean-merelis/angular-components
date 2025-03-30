export type Comparable<T> = (a: T, b: T) => boolean;
export type FilterPredicate<T> = (data: T,
                                  filter: string | undefined | null,
                                  selected: T | T[] | null | undefined,
                                  alwaysIncludesSelected: boolean,
                                  compareWith: Comparable<T>,
                                  displayWith: DisplayWith<T> | undefined
) => boolean;

export type OptionPredicate<T> = (data: T) => boolean;
export type DisplayWith<T> = (data: T) => string;
