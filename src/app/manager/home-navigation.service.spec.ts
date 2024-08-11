import { fakeAsync } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { getMock } from 'ng-vacuum';
import { reset, when, anyFunction, instance, anyString } from 'omnimock';

import { ErrorHandlingService } from '../platform/error-handling.service';
import { SESSION_STORAGE } from '../platform/providers';
import { HomeNavigationService, QUERY_KEY } from './home-navigation.service';
import { NgZone } from '@angular/core';

describe('HomeNavigationService', () => {

    let service: HomeNavigationService;

    let q: string | null;

    beforeEach(() => {
        q = null;
        when(getMock(SESSION_STORAGE).getItem(QUERY_KEY)).call(() => q);
        when(getMock(SESSION_STORAGE).removeItem(QUERY_KEY)).call(() => {
            q = null;
        });
        when(getMock(SESSION_STORAGE).setItem(QUERY_KEY, anyString())).call((_, query) => {
            q = query;
        });
        when(getMock(ActivatedRoute).snapshot.queryParamMap.has('q')).call(() => q != null);
        when(getMock(NgZone).run(anyFunction())).call((f) => {
            f();
        });
        service = new HomeNavigationService(
            instance(getMock(SESSION_STORAGE)),
            instance(getMock(Router)),
            instance(getMock(ErrorHandlingService)),
            instance(getMock(ActivatedRoute)),
            instance(getMock(NgZone))
        );
    });

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
    });

    it('does nothing when setting search value to the same value', async () => {
        q = 'the quick brown fox';
        service.searchValue = 'the quick brown fox';
        expect().nothing();
    });

    it('navigates when search value changes', () => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: { q: '1'}}))
            .resolve(true).once();
        service.searchValue = 'the fox';
        expect().nothing();
    });

    it('handles navigation error when search value changes', fakeAsync(() => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true, queryParams: { q: '1'}}))
            .reject('uh oh').once();
        when(getMock(ErrorHandlingService).onError('uh oh')).return().once();
        service.searchValue = 'the fox';
        expect().nothing();
    }));

    it('does nothing when setting view mode to the same value', () => {
        service.viewMode = 'initial';
        expect().nothing();
    });

    it('navigates to base url when setting initial mode from search mode', () => {
        q = 'some search';
        when(getMock(Router).navigate(['/manager'], { replaceUrl: true }))
            .resolve(true).once();
        service.viewMode = 'initial';
        expect().nothing();
    });

    it('adds query param when going to search mode', () => {
        when(getMock(Router).navigate(['/manager'], { replaceUrl: false, queryParams: { q: '1' } }))
            .resolve(true).once();
        service.viewMode = 'search';
        expect().nothing();
    });
});
