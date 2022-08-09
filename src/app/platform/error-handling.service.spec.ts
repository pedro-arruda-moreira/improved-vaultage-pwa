import { getMock, getService } from 'ng-vacuum';
import { when } from 'omnimock';

import { ErrorHandlingService } from './error-handling.service';
import { WINDOW } from './providers';

describe('ErrorHandlingService', () => {

    let service: ErrorHandlingService;

    beforeEach(() => {
        service = getService(ErrorHandlingService);
    });

    it('logs errors to the console', () => {
        when((getMock(WINDOW) as any).console.error('The error')).return(null).once();
        const { onError } = service;
        // Checks instance binding
        onError('The error');
        expect().nothing();
    });
});

