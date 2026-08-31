import { fakeAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { anyString, instance, Mock, when } from 'omnimock';
import { Subject } from 'rxjs';

import { AuthService } from './auth.service';
import { AutoRedirectService } from './auto-redirect.service';
import { RedirectService } from './redirect.service';
import { cleanup, mock, verifyAllMocks } from './test/test-utils';

describe('AutoRedirectService', () => {

    let service: AutoRedirectService;
    let mockAuthService: Mock<AuthService>;
    let mockRouter: Mock<Router>;
    let mockRedirectService: Mock<RedirectService>;
    let statusChange$: Subject<boolean>;

    beforeEach(() => {
        mockAuthService = mock('AuthService', AuthService);
        mockRouter = mock('Router', Router);
        mockRedirectService = mock('RedirectService', RedirectService);

        statusChange$ = new Subject<boolean>();
        when(mockAuthService.authStatusChange$).useValue(statusChange$);

        service = new AutoRedirectService(
            instance(mockRouter),
            instance(mockRedirectService),
            instance(mockAuthService)
        );

        service.init();
    });

    afterEach(cleanup);

    // fakeAsync makes sure all rxjs tasks are flushed before the end of the test in case any processing gets defered.
    it('does nothing when status changes to authenticated', fakeAsync(() => {
        statusChange$.next(true);
        expect().nothing();
        verifyAllMocks();
    }));

    it('redirect when status changes to unauthenticated', fakeAsync(() => {
        when(mockRouter.routerState.snapshot.url).useValue('mock-url');
        when(mockRedirectService.redirectToAuthZone(anyString())).call(str => {
            expect(str).toBe('mock-url');
            return Promise.resolve(true);
        }).once();
        statusChange$.next(false);
        verifyAllMocks();
    }));
});
