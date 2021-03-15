import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PasswordEntry } from '../domain/PasswordEntry';

@Component({
    selector: 'app-password-form',
    templateUrl: 'password-form.component.html',
    styleUrls: [ 'password-form.component.scss' ]
})
export class PasswordFormComponent {

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

    public togglePasswordVisibility() {
        this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
    }
}

type PasswordInputType = 'text' | 'password';
