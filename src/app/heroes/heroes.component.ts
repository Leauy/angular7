import {Component, OnInit} from '@angular/core';
import {Hero} from "../Hero";
import {Heroes} from '../mock-heroers';
import {HeroService} from '../hero.service';

@Component({
    selector: 'app-heroes',
    templateUrl: './heroes.component.html',
    styleUrls: ['./heroes.component.css']
})
export class HeroesComponent implements OnInit {
    heroes:Hero[];

    getHeroes():void {

        this.heroService.getHeroes()
            .subscribe(heroes => this.heroes = heroes);
    }

    constructor(private heroService:HeroService) {
    }

    ngOnInit() {
        this.getHeroes();
    }


    // add(heroName:string):void {
    //     heroName = heroName.trim();
    //     if (!heroName) return;
    //     this.heroService.addHero({heroName} as Hero)
    //         .subscribe(hero => {
    //             this.heroes.push(hero);
    //         });
    // }

    delete(hero:Hero):void {
        if (!hero.id) return;
        this.heroService.deleteHero(hero)
            .subscribe(() => {
                this.getHeroes();
            });
    }

    searchHeroes(keyword:string):Hero[] {
        if (!keyword) return [];
        this.heroService.searchHeroes(keyword)
            .subscribe((heroes:Hero[]) => this.heroes = heroes);
    }
}
