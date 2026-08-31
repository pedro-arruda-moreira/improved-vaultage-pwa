import { instance, Mock, when } from 'omnimock';

import { AccessControlService } from './access-control.service';
import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { RedirectService } from './redirect.service';
import { cleanup, mock, verifyAllMocks } from './test/test-utils';

describe('AccessControlService', () => {

    let service: AccessControlService;
    let authService: Mock<AuthService>;
    let pinLockService: Mock<PinLockService>;
    let redirectService: Mock<RedirectService>;

    beforeEach(() => {
        authService = mock('AuthService', AuthService);
        pinLockService = mock('PinLockService', PinLockService);
        redirectService = mock('RedirectService', RedirectService);

        service = new AccessControlService(
            instance(pinLockService),
            instance(redirectService),
            instance(authService)
        );
    });

    afterEach(cleanup);

    it('requestAccess returns true for manager zone when authenticated', () => {
        when(authService.isAuthenticated).useValue(true);
        expect(service.requestAccess('manager', '/current')).toBe(true);
        verifyAllMocks();
    });

    it('requestAccess returns true for setup zone when not authenticated and no pin is saved', () => {
        when(pinLockService.hasSecret).useValue(false);
        when(authService.isAuthenticated).useValue(false);
        expect(service.requestAccess('setup', '/current')).toBe(true);
        verifyAllMocks();
    });

    it('requestAccess returns true for unlock-scrceen zone when not authenticated and pin is saved', () => {
        when(pinLockService.hasSecret).useValue(true);
        when(authService.isAuthenticated).useValue(false);
        expect(service.requestAccess('unlock-screen', '/current')).toBe(true);
        verifyAllMocks();
    });

    it('requestAccess redirects and returns false upon authentication error', () => {
        when(authService.isAuthenticated).useValue(false);
        when(redirectService.redirectToAuthZone('/current')).return(undefined).once();
        expect(service.requestAccess('manager', '/current')).toBe(false);
        verifyAllMocks();
    });
});
