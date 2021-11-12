import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
/*
 * pedro-arruda-moreira: changed client
 */
import { Vault } from 'improved-vaultage-client';
import { PinLockService } from './pin-lock.service';
/*
 * pedro-arruda-moreira: for some reason, build was failing because of this.
 */
// pedro-arruda-moreira: desktop mode
import { Vaultage, VAULTAGE, LOCAL_STORAGE } from './platform/providers';
import { MatDialog } from '@angular/material/dialog';
import { PasswordPromptComponent } from './platform/password-prompt/password.prompt.component';


/**
 * Manages application access rights.
 */
@Injectable()
export class AuthService {

    private readonly vaultSubject = new BehaviorSubject<Vault | null>(null);
    public readonly authStatusChange$: Observable<boolean> = this.vaultSubject.pipe(map(v => v != null));
    // pedro-arruda-moreira: desktop mode
    private masterPassword: string = '';

    constructor(
            private readonly pinLockService: PinLockService,
            private readonly router: Router,
            // pedro-arruda-moreira: desktop mode
            @Inject(VAULTAGE) private readonly vaultage: Vaultage,
            private readonly dialog: MatDialog,
            @Inject(LOCAL_STORAGE) private readonly ls: Storage) {
    }

    public get isAuthenticated(): boolean {
        return this.vaultSubject.value != null;
    }

    /**
     * Tests the given credentials.
     * @return a promise which completes on success and fails on error
     */
    public async testCredentials(config: LoginConfig) {
        await this.doLogin(config);
    }
	// pedro-arruda-moreira: desktop mode
    private get desktop(): boolean {
        return this.ls.getItem('desktop') == 'true';
    }

    public getPasswordFromDialog(promptText?: string): Promise<string> {
        const instance = this.dialog.open(
            PasswordPromptComponent,
            {
                disableClose: true
            }
        ).componentInstance;
        if(promptText) {
            instance.text = promptText;
        }
        return instance.password;
    }

    /**
     * Saves authentication settings
     */
    public async logIn(data: LoginConfig, pin: string, nextURL?: string) {
    	// pedro-arruda-moreira: desktop mode
        if(this.desktop) {
            let masterPass = '';
            if(this.masterPassword == '') {
                masterPass = await this.getPasswordFromDialog();
            } else {
                masterPass = this.masterPassword;
            }
            this.vaultSubject.next(await this.doLogin({
                password: masterPass,
                url: data.url,
                username: data.username,
                basic: data.basic
            }));
            this.masterPassword = masterPass;
        } else {
            this.vaultSubject.next(await this.doLogin(data));
            this.masterPassword = data.password;
        }
        if(this.desktop) {
            data.password = '';
        }
        await this.pinLockService.setSecret(pin, JSON.stringify(data));

        await this.router.navigateByUrl(nextURL ?? '/manager', { replaceUrl: true });
    }

    public async confirmMasterPassword() {
        const typedPassword = await this.getPasswordFromDialog();
        if(typedPassword != this.masterPassword) {
            throw new Error('Password does not match. Try again.');
        }
    }

    /**
     * Clears authentication settings
     */
    public logOut() {
        this.vaultSubject.next(null);
        // pedro-arruda-moreira: desktop mode
        this.dialog.closeAll();
    }
	// pedro-arruda-moreira: desktop mode
    public reset() {
        this.masterPassword = '';
    }

    /**
     * Returns a promise which resolves with the vault if the app is authenticated.
     * @throws if the app is not authenticated
     */
    public getVault(): Vault {
        const vault = this.vaultSubject.value;
        if (vault) {
            return vault;
        }
        throw new Error('App is not authenticated');
    }

    private doLogin(config: LoginConfig): Promise<Vault> {
	    /*
		 * pedro-arruda-moreira: for some reason, build was failing because of this.
		 */
        let control = this.vaultage.control;
        if(!control) {
            control = Vaultage.staticControl;
        }
        return control.login(config.url, config.username, config.password, {
            auth: config.basic
        });
    }
}

export interface AuthData {
    loginConfig: LoginConfig;
    pin: string;
}


export interface LoginConfig {
    username: string;
    password: string;
    url: string;
    basic?: {
        username: string;
        password: string;
    };
}
