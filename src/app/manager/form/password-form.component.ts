import { Component, EventEmitter, Input, Output, Inject } from '@angular/core';

import { PasswordEntry } from '../domain/PasswordEntry';
import { WINDOW } from 'src/app/platform/providers';
import { MatDialog } from '@angular/material/dialog';
import { PasswordGeneratorComponent } from './password-generator/password.generator.component';

@Component({
    selector: 'app-password-form',
    templateUrl: 'password-form.component.html',
    styleUrls: [ 'password-form.component.scss' ]
})
export class PasswordFormComponent {

    constructor(@Inject(WINDOW) private readonly window: Window,
    private readonly dialog: MatDialog) {}

    private id: string = '';

    public username: string = '';

    public password: string = '';

    public url: string = '';

    public title: string = '';
	// pedro-arruda-moreira: secure notes
    public secureNotes: string = '';

    public passwordInputType: PasswordInputType = 'password';

    @Output()
    public confirm = new EventEmitter<PasswordEntry>();

    @Input()
    public set entry(e: PasswordEntry) {
        this.id = e.id;
        this.username = e.login;
        this.password = e.password;
        // pedro-arruda-moreira: changed client
        this.url = e.itemUrl;
        this.title = e.title;
        // pedro-arruda-moreira: secure notes
        this.secureNotes = e.secureNoteText
    }

    @Input()
    public showDelete: boolean = false;

    public onSubmit() {
        this.confirm.emit({
            id: this.id,
            login: this.username,
            password: this.password,
            title: this.title,
            // pedro-arruda-moreira: changed client/secure notes
            itemUrl: this.url,
            secureNoteText: this.secureNotes
        });
    }
    public onDelete() {
        if(this.window.confirm('Are you sure you want to delete this entry?')) {
            this.confirm.emit({
                id: this.id,
                login: this.username,
                password: this.password,
                title: this.title,
                // pedro-arruda-moreira: changed client/secure notes
                itemUrl: this.url,
                secureNoteText: this.secureNotes,
                isDelete: true
            });
        }
    }

    public togglePasswordVisibility() {
        this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
    }

    public async openGenerate() {
        this.password = await this.dialog.open(
            PasswordGeneratorComponent,
            {
                disableClose: true
            }
        ).componentInstance.generatedPassword;
    }
}

type PasswordInputType = 'text' | 'password';
