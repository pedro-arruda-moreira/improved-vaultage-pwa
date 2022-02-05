import { animate, group, query, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnDestroy, ViewChild, Inject, OnInit } from '@angular/core';

import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { HomeNavigationService } from './home-navigation.service';
import { IPasswordListEntry } from './password-list.component';
import { WINDOW } from '../platform/providers';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.scss'],
    animations: [
        trigger('searchBar', [
            state('search', style({
                paddingTop: '0vh'
            })),
        ]),
        trigger('viewMode', [
            transition('initial => search', [
                group([
                    query('.main-search-container', animate('200ms ease-out', style({
                        paddingTop: '0'
                    }))),
                    // Disabled because buggy in firefox
                    // query(':leave', [animate('200ms ease-out', style({
                    //     opacity: 0,
                    //     padding: '0'
                    // }))]),
                    query(':enter', [
                        style({ top: '-100%' }),
                        animate('200ms ease-out')
                    ])
                ])
            ]),
            transition('search => initial', [
                group([
                    query('.main-search-container', [
                        style({ paddingTop: '0' }),
                        animate('200ms ease-out', style({
                            paddingTop: '25vh'
                        }))
                    ]),
                    query(':enter', [
                        style({ opacity: 0, padding: '0' }),
                        animate('200ms ease-out'),
                    ])
                ])
            ]),
        ]),
    ]
})
export class HomeComponent implements OnDestroy, OnInit {

    @ViewChild('search') searchElement?: ElementRef<HTMLInputElement>;


    constructor(
            private readonly pinLockService: PinLockService,
            private readonly authService: AuthService,
            private readonly navigation: HomeNavigationService,
            @Inject(WINDOW)
            private readonly window: Window) { }

    public get listItems(): IPasswordListEntry[] {
        const vault = this.authService.getVault();
        return vault.findEntries(this.searchValue).map(e => ({
        	// pedro-arruda-moreira: changed client
            host: this.getHost(e.itemUrl),
            id: e.id,
            title: e.title,
            user: e.login,
            password: e.password
        }));
    }

    public get viewMode() {
        return this.navigation.viewMode;
    }

    public get searchValue(): string {
        return this.navigation.searchValue;
    }

    public set searchValue(v: string) {
        this.navigation.searchValue = v;
    }

    public doFocusIn() {
        this.navigation.viewMode = 'search';
    }

    public clearInput() {
        this.searchValue = '';
        // tslint:disable-next-line: no-non-null-assertion
        this.searchElement!.nativeElement.focus();
    }

    public exitSearchMode() {
        this.navigation.viewMode = 'initial';
        this.searchValue = '';
    }

    public logOut() {
        this.pinLockService.reset();
        this.authService.logOut();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        this.authService.reset();
    }

    private getHost(url: string): string {
        const match = url.match(/^\s*(?:\w*:?\/?\/)?(\w+(?:\.\w+)*)/);
        if (match != null) {
            return match[1];
        }
        return url;
    }
    private handler: (e: HashChangeEvent) => void = (e) => {
        this.onHashChange(e);
    };
    ngOnDestroy(): void {
        this.window.removeEventListener('hashchange', this.handler)
    }
    ngOnInit(): void {
        this.window.addEventListener('hashchange', this.handler);
    }
    onHashChange(e: HashChangeEvent) {
        const hashValue = e.newURL.split('#')[1];
        if(hashValue == '/manager') {
            this.searchElement?.nativeElement.blur();
            this.exitSearchMode();
        }
    }
}
