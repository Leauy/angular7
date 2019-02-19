import {Injectable} from '@angular/core';
import {Hero} from './Hero';
import {InMemoryDbService} from 'angular-in-memory-web-api';
import {Observable} from "rxjs/index";

@Injectable({
    providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
    createDb(reqInfo?:RequestInfo):{}|Observable<Hero>|Promise<Hero> {
        const heroes = [
            {id: 1, name: 'Spider'},
            {id: 2, name: 'Super Man'},
            {id: 3, name: 'Iron Man'},
            {id: 4, name: 'HuangfeiHong'},
            {id: 5, name: 'Leauy'},
            {id: 6, name: 'TBetterMan'},
            {id: 7, name: 'Spider'}
        ];

        return {heroes};
    }


    genId(heroes:Hero[]):number {
        return heroes.length > 0 ? Math.max(...heroes.map(hero => hero.id)) + 1 : 11;
    }

    constructor() {
    }
}
