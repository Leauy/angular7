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
    private httpOptions = {
        headers: new HttpHeaders({'Content-Type': 'application/json'})
    };

    constructor(private messageService:MessageService,
                private http:HttpClient) {
    }

    private log(message:string) {
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

    updateHero(hero:Hero):Observable<any> {
        this.log(`update hero id(${hero.id}) name(${hero.name})`);
        return this.http.put(this.heroesUrl, hero, this.httpOptions)
            .pipe(
                tap(_ => this.log(`updated hero id=${hero.id}`)),
                catchError(this.handleError<any>('updateHero'))
            );
    }

    // addHero(hero:Hero):Observable<Hero> {
    //     this.log(`add hero name:${hero.name}`);
    //     return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions)
    //         .pipe(
    //             tap((newHero:Hero) => this.log(`add hero id=${newHero.id},name:${newHero.name}`))),
    //         catchError(this.handleError<Hero>('addHero')
    //         );
    // }

    deleteHero(hero:Hero):Observable<Hero> {
        this.log(`delete hero name:${hero.name}, id:${hero.id}`);
        return this.http.delete(`${this.heroesUrl}/${hero.id}`, this.httpOptions).pipe(
            tap(_=> this.log(`delete hero id=${hero.id}, name=${hero.name}`)),
            catchError(this.handleError<Hero>('deleteHero'))
        );
    }

    searchHeroes(keyword: string): Observable<Hero[]>{
        if(!keyword.trim()) return of([]);

        return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${keyword}`).pipe(
            tap(_ => this.log(`found heroes matching ${keyword}`)),
            catchError(this.handleError<Hero[]>('searchHeroes', []))
        )
    }


    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?:T) {
        return (error:any):Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
