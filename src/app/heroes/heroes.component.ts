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
    hero:Hero = null;

    heroes:Hero[];

    onSelect(hero:Hero):void {
        this.hero = hero;
    }

    getHeroes():void {

        this.heroService.getHeroes()
            .subscribe(heroes => this.heroes = heroes);
    }

    constructor(private heroService:HeroService) {
    }

    ngOnInit() {
        this.getHeroes();
    }

}
