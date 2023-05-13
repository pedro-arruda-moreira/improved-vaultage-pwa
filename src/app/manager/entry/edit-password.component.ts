import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { catchError, tap } from 'rxjs/operators';
// pedro-arruda-moreira: changed client
import { IVaultDBEntryImproved } from 'improved-vaultage-client';

import { AuthService } from '../../auth.service';
import { BusyStateService } from '../../platform/busy-state.service';
import { ErrorHandlingService } from '../../platform/error-handling.service';
import { WINDOW } from '../../platform/providers';
import { PasswordEntry, toVaultageEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-edit-password',
    templateUrl: 'edit-password.component.html',
    styleUrls: [ 'edit-password.component.scss' ]
})
export class EditPasswordComponent implements OnInit {

    public entry: PasswordEntry;

    constructor(
            @Inject(WINDOW) private readonly window: Window,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly busy: BusyStateService,
            private readonly authService: AuthService,
            private readonly snackBar: MatSnackBar,
            private readonly route: ActivatedRoute) {
        this.entry = this.route.snapshot.data.entry;
    }

    public ngOnInit() {
       this.subscribeToRouteData();
    }

    public subscribeToRouteData() {
        this._subscribeToRouteData().catch((err) => {
            this.errorHandlingService.onError(err);
            this.subscribeToRouteData();
        });
    }

    public _subscribeToRouteData() {
        return this.route.data.pipe(
        	// pedro-arruda-moreira: changed client
            tap((data: { entry?: IVaultDBEntryImproved }) => {
                if (data.entry == null) {
                    throw new Error('Router did not provide mandatory "entry" parameter');
                }
                this.entry = data.entry;
            })
        ).toPromise();
    }

    public onExit() {
        this.window.history.back();
    }
    /*
     * pedro-arruda-moreira: adding delete entry.
     */
    public onSave(entry: PasswordEntry) {
        this.busy.setBusy(true);
        if(entry.isDelete) {
            this.doDelete(entry)
                .finally(() => this.busy.setBusy(false))
                .catch(e => this.snackBar.open(e.message, undefined, {
                    panelClass: 'error'
                }));
        } else {
            this.doSave(entry)
                .finally(() => this.busy.setBusy(false))
                .catch(e => this.snackBar.open(e.message, undefined, {
                    panelClass: 'error'
                }));
        }
    }
    /*
     * pedro-arruda-moreira: adding delete entry.
     */
    private async doDelete(entry: PasswordEntry) {
        const vault = this.authService.getVault();
        vault.removeEntry(entry.id);
        await vault.save();
        this.snackBar.open('Entry deleted successfully.');
        this.onExit();
    }

    private async doSave(entry: PasswordEntry) {
        const vault = this.authService.getVault();
        vault.updateEntry(entry.id, toVaultageEntry(entry));
        await vault.save();
        this.onExit();
    }
}
