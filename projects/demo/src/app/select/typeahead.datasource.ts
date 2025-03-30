import { inject, Injectable } from "@angular/core";
import { faker } from "@faker-js/faker";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { CollectionViewer, SelectDataSource } from "../../../../merelis/angular/select";

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
    private viewerSubscription?: Subscription;
    private data = new BehaviorSubject<Person[]>([]);
    private loading$ = new BehaviorSubject<boolean>(false);

    constructor(service: PersonService) {
        this.service = service;
    }

    connect(collectionViewer: CollectionViewer<Person>): Observable<Person[]> {
        this.viewerSubscription = collectionViewer.viewChange.subscribe(async vc => {
            if (vc.text) {
                this.loading$.next(true);
                try {
                    const result = await this.service.search(vc.text);
                    this.data.next(result);
                } finally {
                    this.loading$.next(false);
                }
            }
        })
        return this.data.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer<Person>): void {
        this.viewerSubscription?.unsubscribe();
        this.loading$.complete();
        this.data.complete();
    }

    loading(collectionViewer: CollectionViewer<Person>): Observable<boolean> {
        return this.loading$.asObservable();
    }

}
