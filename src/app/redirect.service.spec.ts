import { fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { getMock, createMock } from 'ng-vacuum';
import { anyString, anything, when, instance, Mock } from 'omnimock';

import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { ErrorHandlingService } from './platform/error-handling.service';
import { RedirectService } from './redirect.service';
import { OfflineService } from './offline.service';

describe('RedirectService', () => {

    let service: RedirectService;
    let offlineServiceMock: Mock<OfflineService> = getMock(OfflineService);
    let offlineService: OfflineService = instance(offlineServiceMock);
    let offlineBacking: Partial<OfflineService> = {};
    let authServiceMock: Mock<AuthService> = getMock(AuthService);
    let authService: AuthService = instance(authServiceMock);
    let authBacking: Partial<AuthService> = {};

    beforeEach(() => {
        offlineBacking = {};
        offlineServiceMock = createMock(OfflineService, offlineBacking);
        offlineService = instance(offlineServiceMock);
        authBacking = {};
        authServiceMock = createMock(AuthService, authBacking);
        authService = instance(authServiceMock);
        service = new RedirectService(
            authService,
            instance(getMock(ErrorHandlingService)),
            instance(getMock(PinLockService)),
            instance(getMock(Router)),
            offlineService
        );
    });

    it('constructs correctly', () => {
        expect(offlineBacking.authService === authService).toBe(true);
        expect(offlineBacking.redirectService === service).toBe(true);
        expect(authBacking.offlineService === offlineService).toBe(true);
    });

    it('redirects to setup when not authenticated and no pin is set', () => {
        when(getMock(AuthService).isAuthenticated).useValue(false);
        when(getMock(PinLockService).hasSecret).useValue(false);
        when(getMock(Router).navigate([anyString()])).call(route => {
            expect(route).toEqual(['setup']);
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('redirects to unlock when not authenticated but has pin', () => {
        when(getMock(AuthService).isAuthenticated).useValue(false);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()], anything())).call((route, params) => {
            expect(route).toEqual(['unlock']);
            expect(params).toEqual({ queryParams: { next: '/next' }});
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('redirects to manager when authenticated', () => {
        when(getMock(AuthService).isAuthenticated).useValue(true);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()])).call(route => {
            expect(route).toEqual(['manager']);
            return Promise.resolve(true);
        });
        service.redirectToAuthZone('/next');
    });

    it('handles errors', fakeAsync(() => {
        when(getMock(AuthService).isAuthenticated).useValue(true);
        when(getMock(PinLockService).hasSecret).useValue(true);
        when(getMock(Router).navigate([anyString()])).reject('my error');
        when(getMock(ErrorHandlingService).onError(anything())).call(err => {
            expect(err).toEqual('my error');
        }).once();
        service.redirectToAuthZone('/next');
    }));
});
