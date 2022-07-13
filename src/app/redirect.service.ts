import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { PinLockService } from './pin-lock.service';
import { ErrorHandlingService } from './platform/error-handling.service';
import { OfflineService } from './offline.service';

@Injectable()
export class RedirectService {

    constructor(
            private readonly authService: AuthService,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly pinLockService: PinLockService,
            private readonly router: Router,
            offlineService: OfflineService) {
                offlineService.authService = authService;
                offlineService.redirectService = this;
                authService.offlineService = offlineService;
            }

    /**
     * Redirects to the appropriate page based on the current authentication state.
     *
     * @param next "next" url for the unlock screen
     */
    public redirectToAuthZone(next: string): void {
        this._redirectToAuthZone(next).catch(e => this.errorHandlingService.onError(e));
    }

    private _redirectToAuthZone(next: string): Promise<boolean> {
        if (!this.authService.isAuthenticated && !this.pinLockService.hasSecret) {
            return this.router.navigate(['setup']);
        } else if (!this.authService.isAuthenticated) { // pinLockService.hasSecret implied by boolean logic
            return this.router.navigate(['unlock'], { queryParams: { next }});
        } else {
            return this.router.navigate(['manager']);
        }
    }
}
