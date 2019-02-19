import {Component, OnInit, Input} from '@angular/core';
import {Hero} from "../Hero";
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {HeroService} from "../hero.service";


@Component({
    selector: 'app-hero-detail',
    templateUrl: './hero-detail.component.html',
    styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
    hero:Hero;

    constructor(private heroService:HeroService,
                private route:ActivatedRoute,
                private location:Location) {
    }

    ngOnInit() {
        this.getHero();
    }

    getHero():void {
        const heroId = Number.parseInt(this.route.snapshot.paramMap.get('id'));
        this.heroService.getHero(heroId)
            .subscribe(hero => this.hero = hero);
    }

    goBack():void {
        this.location.back();
    }

}
