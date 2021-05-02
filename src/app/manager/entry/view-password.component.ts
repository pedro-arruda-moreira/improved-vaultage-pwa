import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
// pedro-arruda-moreira: changed client
import { IVaultDBEntryImproved } from 'improved-vaultage-client';

import { AuthService } from '../../auth.service';
import { ErrorHandlingService } from '../../platform/error-handling.service';
import { IToolbarActionConfig } from '../../platform/toolbar/toolbar.component';
import { PasswordEntry } from '../domain/PasswordEntry';
// pedro-arruda-moreira: textarea auto sizing.
import { TextareaResizer } from 'src/app/util/TextareaResizer';

@Component({
    selector: 'app-view-password',
    templateUrl: 'view-password.component.html',
    styleUrls: [ 'view-password.component.scss' ]
})
export class ViewPasswordComponent implements OnInit {

    public entry: PasswordEntry;

    public passwordVisible = false;

    public toolbarAction: IToolbarActionConfig = {
        icon: 'edit',
        action: () => this.onEdit()
    };

    constructor(
            private readonly snackBar: MatSnackBar,
            readonly authService: AuthService,
            private readonly clipboard: Clipboard,
            private readonly route: ActivatedRoute,
            private readonly errorHandlingService: ErrorHandlingService,
            private readonly router: Router,
            // pedro-arruda-moreira: textarea auto sizing.
            private readonly resizer: TextareaResizer) {
        this.entry = this.route.snapshot.data.entry;
    }

    ngOnInit() {
        this.subscribeToRouteData();
        // pedro-arruda-moreira: textarea auto sizing.
        this.resizer.doResizeTextareas();
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

    public onEdit() {
        this.router.navigate(['../../edit', this.entry.id], { relativeTo: this.route })
                .catch(err => this.errorHandlingService.onError(err));
    }

    public togglePasswordVisibility(event: MouseEvent) {
        event.stopPropagation();
        this.passwordVisible = !this.passwordVisible;
    }

    public copyToClipboard() {
        if (this.clipboard.copy(this.entry.password)) {
            this.snackBar.open('Password copied to clipboard');
        } else {
            this.errorHandlingService.onError(new Error('Failed to copy password'));
        }
    }
}


