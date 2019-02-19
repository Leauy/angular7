import {Injectable} from '@angular/core';
import {Hero} from "./Hero";
import {Heroes} from './mock-heroers';
import {Observable, of} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {catchError} from "rxjs/internal/operators/catchError";
import {tap} from "rxjs/internal/operators/tap";

@Injectable({
    providedIn: 'root'
})
export class HeroService {
    private heroesUrl = 'api/heroes';
    constructor(private messageService:MessageService,
                private http:HttpClient) {
    }

    private log(message:string){
        this.messageService.add(`HeroService: ${message}`);
    }

    getHeroes():Observable<Hero[]> {
        this.log('fetched heroes');
        return this.http.get<Hero[]>(this.heroesUrl).pipe(
            tap(_ => this.log('fetched heroes')),
            catchError(this.handleError<Hero[]>('getHeroes', []))
        );
    }

    getHero(heroId:number):Observable<Hero> {
        this.log('fetched hero');
        return this.http.get<Hero>(`${this.heroesUrl}/${heroId}`).pipe(
            tap(_=> this.log(`fetched hero id=${heroId}`)),
            catchError(this.handleError<Hero>(`getHero error id=${heroId}`))
        );
    }

    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
