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

    public secureNotes: string = '';

    public passwordInputType: PasswordInputType = 'password';

    @Output()
    public confirm = new EventEmitter<PasswordEntry>();

    @Input()
    public set entry(e: PasswordEntry) {
        this.id = e.id;
        this.username = e.login;
        this.password = e.password;
        this.url = e.itemUrl;
        this.title = e.title;
        this.secureNotes = e.secureNoteText
    }

    public onSubmit() {
        this.confirm.emit({
            id: this.id,
            login: this.username,
            password: this.password,
            title: this.title,
            itemUrl: this.url,
            secureNoteText: this.secureNotes
        });
    }

    public togglePasswordVisibility() {
        this.passwordInputType = this.passwordInputType === 'text' ? 'password' : 'text';
    }
}

type PasswordInputType = 'text' | 'password';
