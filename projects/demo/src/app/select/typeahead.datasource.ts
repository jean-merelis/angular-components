import { Injectable } from "@angular/core";
import { faker } from "@faker-js/faker";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { FilterCriteria, SelectDataSource } from "../../../../merelis/angular/select";

interface Person {
    name: string;
}

const DATASET: Person[] = [];
for (let i = 0; i < 100; i++) {
    DATASET.push({name: faker.person.fullName()});
}
DATASET.sort((a, b) => a.name.localeCompare(b.name));


@Injectable({providedIn: "root"})
export class PersonService {

    // simulate an external http call
    async search(query: string): Promise<Person[]> {
        return new Promise<Person[]>((resolve, reject) => {
            setTimeout(() => {
                const filtered = DATASET.filter(person => person.name.toLowerCase().startsWith(query.toLowerCase()));
                resolve(filtered);
            }, 500)
        })
    }
}

export class PersonDataSource implements SelectDataSource<Person> {
    private service: PersonService;
    private data = new BehaviorSubject<Person[]>([]);
    private loading$ = new BehaviorSubject<boolean>(false);

    constructor(service: PersonService) {
        this.service = service;
    }

    connect(): Observable<Person[]> {
        return this.data.asObservable();
    }

    disconnect(): void {
        this.loading$.complete();
        this.data.complete();
    }

    loading(): Observable<boolean> {
        return this.loading$.asObservable();
    }

    async applyFilter(criteria: FilterCriteria<Person>): Promise<void> {

        if (criteria.searchText) {
            this.loading$.next(true);
            try {
                const result = await this.service.search(criteria.searchText);
                this.data.next(result);
            } finally {
                this.loading$.next(false);
            }
        }
    }
}
