import { DOCUMENT } from '@angular/common';
import { anyFunction, anyString, instance, Mock, reset, verify, when } from 'omnimock';

import { AuthService } from './auth.service';
import { AutoLogoutService } from './auto-logout.service';
import { cleanup, mock, verifyAllMocks } from './test/test-utils';

describe('AutoLogoutService', () => {

    let mockDocument: Mock<Document>;
    let service: AutoLogoutService;
    let mockAuthService: Mock<AuthService>;

    let callback: () => void;

    beforeEach(() => {
        mockDocument = mock(DOCUMENT, Document);
        mockAuthService = mock('AuthService', AuthService);

        when(mockDocument.addEventListener(anyString(), anyFunction())).call((evt, cb) => {
            expect(evt).toBe('visibilitychange');
            expect(typeof cb).toBe('function');
            callback = cb as () => void;
        }).once();

        service = new AutoLogoutService(
            instance(mockDocument) as Document,
            instance(mockAuthService) as AuthService
        );

        service.init();
        verify(mockDocument);
        expect(callback).not.toBeUndefined();
    });

    afterEach(cleanup);

    it('logs out on hidden', () => {
        when(mockDocument.hidden).useValue(true);
        when(mockAuthService.logOut()).return(undefined).once();
        callback();
        verifyAllMocks();
    });

    it('ignores when not hidden', () => {
        when(mockDocument.hidden).useValue(false);
        when(mockAuthService.logOut()).return(undefined).never();
        callback();
        verifyAllMocks();
    });

    it('does not re-subscribe', () => {
        reset(mockDocument);
        service.init();
        verifyAllMocks();
    });
});
