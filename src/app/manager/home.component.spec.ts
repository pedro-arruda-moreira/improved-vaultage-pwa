import { ComponentFixture } from '@angular/core/testing';
import { ParamMap } from '@angular/router';
import { createMock, getMock, renderComponent } from 'ng-vacuum';
import { instance, mockInstance, when, anyOf, anyFunction } from 'omnimock';
import { Subject } from 'rxjs';
import { Rendering } from 'shallow-render/dist/lib/models/rendering';

import { AppModule } from '../app.module';
import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { typeValue } from '../test/test-utils';
import { HomeNavigationService, HomeViewMode } from './home-navigation.service';
import { HomeComponent } from './home.component';
import { PasswordListComponent } from './password-list.component';
// pedro-arruda-moreira: changed client
import { IVaultDBEntryImproved, Vault } from 'improved-vaultage-client';
import { WINDOW } from '../platform/providers';

describe('HomeComponent', () => {

    let fixture: ComponentFixture<HomeComponent>;
    let queryParamsMap: Subject<ParamMap>;
    let page: Page;
    let viewMode: HomeViewMode;
    let searchValue: string;
    let selectStartHandler: EventListenerOrEventListenerObject | null = null;
	// pedro-arruda-moreira: changed client
    function fakeEntries(): IVaultDBEntryImproved[] {
        return [
            mockInstance<IVaultDBEntryImproved>('entry1', {
                itemUrl: 'http://url',
                id: '1',
                title: 'Yolo',
                login: 'swag',
                password: '5W4G',
                secureNoteText: 'secure note 1'
            }),
            mockInstance<IVaultDBEntryImproved>('entry2', {
                itemUrl: '',
                id: '2',
                title: 'GitHub',
                login: 'hmil',
                password: 'iluvcake',
                secureNoteText: 'secure note 2'
            }),
        ];
    }


    beforeEach(async () => {
        selectStartHandler = null;
        queryParamsMap = new Subject();
        when(getMock(AuthService).getVault()).return(instance(getMock(Vault)));
        when(getMock(WINDOW).addEventListener('hashchange', anyFunction())).call((_, f) => {
            selectStartHandler = f;
        }).once();
        when(getMock(WINDOW).removeEventListener('hashchange', anyFunction())).call((_, f) => {
            expect(f).toBe(selectStartHandler!);
        }).atMostOnce();

        createMock(HomeNavigationService, {
            get viewMode() { return viewMode; },
            set viewMode(m: HomeViewMode) { viewMode = m; },
            get searchValue() { return searchValue; },
            set searchValue(s: string) { searchValue = s; },
        });

        viewMode = 'initial';
        searchValue = '';

        const rendering = await renderComponent(HomeComponent, AppModule);
        page = new Page(rendering);
        fixture = rendering.fixture;
    });

    it('shows the home page', () => {
        page.expectInitialMode();
    });

    it('responds to focus (note: this test spec requires test browser to have focus)', async () => {
        when(getMock(Vault).findEntries('')).return(fakeEntries());
        page.input.focus();
        fixture.detectChanges();
        await fixture.whenStable();
        expect(viewMode).toBe('search');
    });

    it('filters the list of results on input', async () => {
        when(getMock(Vault).findEntries('the quick brown fox')).return(fakeEntries());
        typeValue(page.input, 'the quick brown fox');
        fixture.detectChanges();
        await fixture.whenStable();
        expect(searchValue).toBe('the quick brown fox');
    });

    it('exits search mode on click', async () => {
        // First set to search mode
        viewMode = 'search';
        searchValue = 'some-query';
        when(getMock(Vault).findEntries('some-query')).return(fakeEntries());
        fixture.detectChanges();
        await fixture.whenStable();
        page.expectSearchMode('some-query');

        // Then, exit search mode
        page.exitSearchModeButton.click();
        expect(viewMode).toBe('initial');
        expect(searchValue).toBe('');
    });

    it('shows the list of results', async () => {
        viewMode = 'search';
        searchValue = 'some-query';
        when(getMock(Vault).findEntries('some-query')).return(fakeEntries());
        fixture.detectChanges();
        await fixture.whenStable();
        expect(page.passwordList.items).toEqual([{
            host: 'url',
            id: '1',
            title: 'Yolo',
            user: 'swag',
            password: '5W4G'
        }, {
            host: '',
            id: '2',
            title: 'GitHub',
            user: 'hmil',
            password: 'iluvcake'
        }]);
        page.expectSearchMode('some-query');
    });

    it('can log out', async () => {
        when(getMock(PinLockService).reset()).return().once();
        when(getMock(AuthService).logOut()).return().once();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        when(getMock(AuthService).reset()).return().once();
        page.logOutButton.click();

        expect().nothing();
    });

    it('clears and focuses input on clear search field', async () => {
        // First move to search mode
        searchValue = 'some-query';
        viewMode = 'search';
        when(getMock(Vault).findEntries('some-query')).return(fakeEntries());
        fixture.detectChanges();
        await fixture.whenStable();
        page.expectSearchMode('some-query');

        const spy = spyOn(page.input, 'focus');

        page.clearSearchButton.click();

        expect(spy).toHaveBeenCalled();
    });

    it('blurs search on hash change to #/manager', async () => {
        viewMode = 'search';
        when(getMock(Vault).findEntries('')).return(fakeEntries());
        fixture.detectChanges();
        await fixture.whenStable();


        const spy = spyOn(page.input, 'blur');
        page.exitSearchModeButton.click();
        ((selectStartHandler) as any)(mockInstance<HashChangeEvent>('eventMock', {
            newURL: "http://test/#/manager",
        }));
        expect(viewMode).toBe('initial');
        expect(searchValue).toBe('');

        expect(spy).toHaveBeenCalled();
    });

    it('does not blur search on hash change to #/nopenope', async () => {
        viewMode = 'search';
        when(getMock(Vault).findEntries('')).return(fakeEntries());
        fixture.detectChanges();
        await fixture.whenStable();


        const spy = spyOn(page.input, 'blur');
        page.exitSearchModeButton.click();
        ((selectStartHandler) as any)(mockInstance<HashChangeEvent>('eventMock', {
            newURL: "http://test/#/nopenope",
        }));
        expect(viewMode).toBe('initial');
        expect(searchValue).toBe('');

        expect(spy).toHaveBeenCalledTimes(0);
    });

});

class Page {

    constructor(private readonly rendering: Rendering<HomeComponent, never>) { }

    get input(): HTMLInputElement {
        return this.rendering.find('[test-id="search-input"]').nativeElement;
    }

    get clearSearchButton(): HTMLAnchorElement {
        return this.rendering.find('[test-id="clear-search-action"]').nativeElement;
    }

    get logOutButton(): HTMLAnchorElement {
        return this.rendering.find('.simple-link').nativeElement;
    }

    get exitSearchModeButton(): HTMLAnchorElement {
        return this.rendering.find('[test-id="exit-search-mode"]').nativeElement;
    }

    get passwordList(): PasswordListComponent {
        return this.rendering.find('app-password-list').componentInstance;
    }


    expectSearchMode(query: string) {
        expect(this.rendering.find('[test-id="clear-search-action"]').length).toBe(1);
        expect(this.input.value).toBe(query);
    }

    expectInitialMode() {
        expect(this.rendering.find('[test-id="clear-search-action"]').length).toBe(0);
        expect(this.input.value).toBe('');
    }
}

