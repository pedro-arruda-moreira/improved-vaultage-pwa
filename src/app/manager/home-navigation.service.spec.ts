import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { anyFunction, anyString, instance, Mock, when } from 'omnimock';
import { NgZone } from '@angular/core';

import { ErrorHandlingService } from '../platform/error-handling.service';
import { SESSION_STORAGE } from '../platform/providers';
import { HomeNavigationService, QUERY_KEY } from './home-navigation.service';
import { cleanup, mock, verifyAllMocks } from '../test/test-utils';

describe('HomeNavigationService', () => {

    let service: HomeNavigationService;
    let mockSessionStorage: Mock<Storage>;
    let mockRouter: Mock<Router>;
    let mockActivatedRoute: Mock<ActivatedRoute>;
    let mockNgZone: Mock<NgZone>;

    let q: string | null;

    beforeEach(() => {
        q = null;
        mockSessionStorage = mock(SESSION_STORAGE, Storage);
        mockRouter = mock('Router', Router);
        const errorHandlingService = mock('ErrorHandlingService', ErrorHandlingService);
        mockActivatedRoute = mock('ActivatedRoute', ActivatedRoute);
        mockNgZone = mock('NgZone', NgZone);

        when(mockSessionStorage.getItem(QUERY_KEY)).call(() => q);
        when(mockSessionStorage.removeItem(QUERY_KEY)).call(() => {
            q = null;
        });
        when(mockSessionStorage.setItem(QUERY_KEY, anyString())).call((_: string, query: string) => {
            q = query;
        });
        when(mockActivatedRoute.snapshot.queryParamMap.has('q')).call(() => q != null);
        when(mockNgZone.run(anyFunction())).call((f: Function) => {
            f();
        });

        service = new HomeNavigationService(
            instance(mockSessionStorage),
            instance(mockRouter),
            instance(errorHandlingService),
            instance(mockActivatedRoute),
            instance(mockNgZone)
        );
    });

    afterEach(cleanup);

    it('responds to route changes', () => {
        q = 'some-query';
        expect(service.searchValue).toBe('some-query');
        expect(service.viewMode).toBe('search');
        q = null;
        expect(service.searchValue).toBe('');
        expect(service.viewMode).toBe('initial');
        q = '';
        expect(service.searchValue).toBe('');
        expect(service.viewMode).toBe('search');
        verifyAllMocks();
    });

    it('does nothing when setting search value to the same value', fakeAsync(() => {
        q = 'the quick brown fox';
        service.searchValue = 'the quick brown fox';
        expect().nothing();
        verifyAllMocks();
    }));

    it('does nothing when setting view mode to the same value', () => {
        service.viewMode = 'initial';
        expect().nothing();
        verifyAllMocks();
    });

    it('navigates to base url when setting initial mode from search mode', () => {
        q = 'some search';
        when(mockRouter.navigate(['/manager'], { replaceUrl: true }))
            .return(Promise.resolve(true)).once();
        service.viewMode = 'initial';
        expect().nothing();
        verifyAllMocks();
    });

    it('adds query param when going to search mode', () => {
        when(mockRouter.navigate(['/manager'], { replaceUrl: false, queryParams: { q: '1' } }))
            .return(Promise.resolve(true)).once();
        service.viewMode = 'search';
        expect().nothing();
        verifyAllMocks();
    });
});
