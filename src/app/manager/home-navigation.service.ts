import { Inject, Injectable, NgZone, ElementRef } from '@angular/core';

import { SESSION_STORAGE, WINDOW } from '../platform/providers';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ErrorHandlingService } from '../platform/error-handling.service';

export const QUERY_KEY = "QUERY";

/**
 * The state of the home page is controlled by the URL parameters.
 * This class handles the mapping between URL parameter and view state.
 */
@Injectable()
export class HomeNavigationService {

    constructor(
        @Inject(SESSION_STORAGE) private readonly sessionStorage: Storage,
        private readonly router: Router,
        private readonly errorHandlingService: ErrorHandlingService,
        private readonly route: ActivatedRoute,
        private readonly zone: NgZone
    ) {
    }

    private _input?: () => ElementRef<HTMLInputElement> | undefined;

    public set input(input: () => (ElementRef<HTMLInputElement> | undefined)) {
        this._input = input;
    }

    public get viewMode(): HomeViewMode {
        const viewMode = this.route.snapshot.queryParamMap.has('q') ? 'search' : 'initial';
        if(viewMode === 'initial') {
            this.searchValue = '';
        }
        return viewMode;
    }

    private clearSearchField() {
        if (!this._input) {
            return;
        }
        const theInput = this._input();
        if (!theInput) {
            return;
        }
        theInput.nativeElement.blur();
    }

    public set viewMode(mode: HomeViewMode) {
        // Navigate in a way which makes sense of the back button
        if (mode !== this.viewMode) {
            if (mode === 'initial') {
                this.searchValue = '';
                this.navigate({ replaceUrl: true });
                this.clearSearchField();
            } else {
                this.navigate({
                    replaceUrl: false,
                    q: '1'
                });
            }
        }
    }

    public get searchValue(): string {
        return this.sessionStorage.getItem(QUERY_KEY) || '';
    }

    public set searchValue(v: string) {
        if (v !== this.searchValue) {
            if (v === '') {
                this.sessionStorage.removeItem(QUERY_KEY);
                return;
            }
            this.sessionStorage.setItem(QUERY_KEY, v);
        }
    }

    private navigate({ replaceUrl, q }: { replaceUrl: boolean, q?: string }) {
        let extra: NavigationExtras;
        if(q) {
            extra = { replaceUrl, queryParams: { q } };
        } else {
            extra = { replaceUrl };
        }
        this.zone.run(() => {
            this.router.navigate(['/manager'], extra)
                .catch(err => this.errorHandlingService.onError(err));
        });
    }
}

export type HomeViewMode = 'initial' | 'search';
