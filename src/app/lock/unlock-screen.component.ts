import { Component, ChangeDetectorRef, OnInit, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../auth.service';
import { PinLockService } from '../pin-lock.service';
import { BusyStateService } from '../platform/busy-state.service';
import { ErrorHandlingService } from '../platform/error-handling.service';
import { RedirectService } from '../redirect.service';
import { WINDOW } from '../platform/providers';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-unlock-screen',
    template: `<app-pin-code
            *ngIf="!offline"
            (confirm)="onSubmit($event)"
            [errorMessage]="error"
            altActionName="< Log out"
            (altAction)="onLogOut()">
        </app-pin-code>`
})
export class UnlockScreenComponent implements OnInit, OnDestroy {

    public offline: boolean = true;

    public error: string | null = null;

    private callback = () => {
        this.offline = !this.window.navigator.onLine;
        this.doCheckOfflineStatus(true);
    }

    constructor(
            private readonly route: ActivatedRoute,
            private readonly busy: BusyStateService,
            private readonly pinLockService: PinLockService,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly redirectService: RedirectService,
            private readonly authService: AuthService,
            private readonly cdr: ChangeDetectorRef,
            @Inject(WINDOW) private readonly window: Window,
            private readonly modal: MatDialog) {
                this.offline = !this.window.navigator.onLine;
                this.window.addEventListener('online', this.callback);
                this.window.addEventListener('offline', this.callback);
            }

    public onSubmit(pin: string) {
        this.busy.setBusy(true);
        this._unlock(pin)
            .finally(() => this.busy.setBusy(false))
            .catch(e => {
                this.error = e.message;
                this.errorHandlingService.onError(e);
            });
    }

    private doCheckOfflineStatus(changed: boolean = false) {
        if(changed) {
            this.modal.closeAll();
            this.cdr.detectChanges();
        }
        if(this.offline) {
            this.authService.getPasswordFromDialog('Offline mode. Please enter Master Password:').then(p => {
                this.onSubmit(p);
            });
        }
    }

    public ngOnInit(): void {
        this.doCheckOfflineStatus();
    }

    public ngOnDestroy(): void {
        this.window.removeEventListener('online', this.callback);
        this.window.removeEventListener('offline', this.callback);
    }

    public onLogOut() {
        this.pinLockService.reset();
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        this.authService.reset();
        this.redirectService.redirectToAuthZone(this.route.snapshot.url.join('/'));
    }

    private async _unlock(pin: string) {
        if (!this.pinLockService.hasSecret) {
            this.redirectService.redirectToAuthZone(this.route.snapshot.url.join('/'));
            return;
        }
        /*
         * pedro-arruda-moreira: desktop mode.
         */
        const data = await this.pinLockService.getSecret(pin);
        if (data == null) {
            throw new Error('Invalid pin');
        }

        /*
         * pedro-arruda-moreira: fixed bug.
         */
        let nextURL = this.route.snapshot.queryParamMap.get('next') ?? undefined;
        const unlockPart = '/unlock?next=';
        while(nextURL && nextURL.startsWith(unlockPart)) {
            nextURL = unescape(nextURL.substr(unlockPart.length));
        }
        await this.authService.logIn(JSON.parse(data), pin, nextURL);
    }
}
