import { Component, EventEmitter, Input, Output, Inject, OnInit, OnDestroy } from '@angular/core';

import { PasswordEntry } from '../domain/PasswordEntry';
/*
 * pedro-arruda-moreira: password generator/desktop mode.
 */
import { WINDOW, SESSION_STORAGE } from 'src/app/platform/providers';
import { MatDialog } from '@angular/material/dialog';
import { PasswordGeneratorComponent } from './password-generator/password.generator.component';
import { TextareaResizer } from 'src/app/util/TextareaResizer';
import { encrypt, decrypt, NoOPLog } from 'improved-vaultage-client';

function generateRandomString() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const ENCRYPTION_KEY_STORAGE_KEY = 'DRAFT_ENCRYPTION_KEY';
const DRAFT_STORAGE_KEY = 'DRAFT';

function checkSessionEncryptionKey(storage: Storage) {
    if (!storage.getItem(ENCRYPTION_KEY_STORAGE_KEY)) {
        storage.setItem(ENCRYPTION_KEY_STORAGE_KEY, generateRandomString());
    }
}

@Component({
    selector: 'app-password-form',
    templateUrl: 'password-form.component.html',
    styleUrls: ['password-form.component.scss']
})
// pedro-arruda-moreira: textarea auto sizing.
export class PasswordFormComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        checkSessionEncryptionKey(this.sessionStorage);
        if (this.id !== '' || this.doNotSaveDraft) {
            return;
        }
        const entryJson = JSON.stringify({
            login: this.username,
            password: this.password,
            // pedro-arruda-moreira: changed client/secure notes
            itemUrl: this.url,
            title: this.title,
            secureNoteText: this.secureNotes
        });
        const theKey = this.sessionStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
        if (!theKey) {
            throw new Error("Session encryption key not found");
        }
        encrypt(theKey, entryJson, NoOPLog.INSTANCE).then((entrySjcl) => {
            this.sessionStorage.setItem(DRAFT_STORAGE_KEY, entrySjcl);
        });
    }

    // pedro-arruda-moreira: textarea auto sizing.
    constructor(
        @Inject(WINDOW) private readonly window: Window,
        @Inject(SESSION_STORAGE) readonly sessionStorage: Storage,
        private readonly dialog: MatDialog,
        private readonly resizer: TextareaResizer
    ) { }

    private id: string = '';

    private doNotSaveDraft = false;

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
        if(this.id === '') {
            this.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
            this.doNotSaveDraft = true;
        }
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
        if (this.window.confirm('Are you sure you want to delete this entry?')) {
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
    // pedro-arruda-moreira: textarea auto sizing.
    ngOnInit() {
        this.resizer.doResizeTextareas();
        checkSessionEncryptionKey(this.sessionStorage);

        if (this.id !== '') {
            return;
        }
        const entryText = this.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (!entryText) {
            return;
        }
        const theKey = this.sessionStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
        if (!theKey) {
            throw new Error("Session encryption key not found");
        }
        decrypt(theKey, entryText, NoOPLog.INSTANCE).then((entryJson) => {
            const entry = JSON.parse(entryJson) as PasswordEntry;
            this.username = entry.login;
            this.password = entry.password;
            this.url = entry.itemUrl;
            this.title = entry.title;
            this.secureNotes = entry.secureNoteText
        });
    }
}

type PasswordInputType = 'text' | 'password';
