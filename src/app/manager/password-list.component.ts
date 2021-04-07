import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Inject, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlingService } from '../platform/error-handling.service';
import { WINDOW, LOCAL_STORAGE } from '../platform/providers';

@Component({
    selector: 'app-password-list',
    templateUrl: 'password-list.component.html',
    styleUrls: [ 'password-list.component.scss' ]
})
export class PasswordListComponent {

    @Input()
    public items: IPasswordListEntry[] = [];

    constructor(
        @Inject(WINDOW) private readonly window: Window,
        private readonly errorHandlingService: ErrorHandlingService,
        private readonly snackBar: MatSnackBar,
        private readonly clipboard: Clipboard,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        @Inject(LOCAL_STORAGE) private readonly ls: Storage) { }

    public onItemClick(itemId: string) {
        this.router.navigate(['view/', itemId], { relativeTo: this.route })
                .catch(err => {
                    this.errorHandlingService.onError(err);
                });
    }

    public onUsePassword(event: MouseEvent, password: string) {
        event.stopPropagation();
        this.clipboard.copy(password);
        this.snackBar.open('Password copied to clipboard!');
        this.window.history.back();
    }

    public get desktop(): boolean {
        return this.ls.getItem('desktop') != null;
    }
}

export interface IPasswordListEntry {
    id: string;
    title: string;
    password: string;
    user: string;
    host: string;
}
