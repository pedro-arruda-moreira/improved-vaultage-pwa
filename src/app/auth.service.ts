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
import { LocalStorageConfigCache } from './util/LocalStorageConfigCache';
import { OfflineService } from './offline.service';
import { FEATURE_DESKTOP, FEATURE_CONFIG_CACHE, FEATURE_AUTO_CREATE } from 'src/misc/FeatureDetector';
import { DEFAULT_SJCL_PARAMS } from './crypto/internal/CryptoImpl';


/**
 * Manages application access rights.
 */
@Injectable()
export class AuthService {

    private readonly vaultSubject = new BehaviorSubject<Vault | null>(null);
    public readonly authStatusChange$: Observable<boolean> = this.vaultSubject.pipe(map(v => v != null));
    // pedro-arruda-moreira: desktop mode
    private masterPassword: string = '';
    private _offlineService: OfflineService | null = null;

    constructor(
            private readonly pinLockService: PinLockService,
            private readonly router: Router,
            // pedro-arruda-moreira: desktop mode
            @Inject(VAULTAGE) private readonly vaultage: Vaultage,
            private readonly dialog: MatDialog,
            @Inject(LOCAL_STORAGE) private readonly ls: Storage,
            // pedro-arruda-moreira: config cache
            private readonly configCache: LocalStorageConfigCache) {
    }

    public get isAuthenticated(): boolean {
        return this.vaultSubject.value != null;
    }

    public set offlineService(os: OfflineService) {
        this._offlineService = os;
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
        return this.ls.getItem(FEATURE_DESKTOP) == 'true';
    }
    private get configCacheEnabled(): boolean {
        return this.ls.getItem(FEATURE_CONFIG_CACHE) == 'true';
    }
    private get autoCreateVault(): boolean {
        return this.ls.getItem(FEATURE_AUTO_CREATE) == 'true';
    }
    // pedro-arruda-moreira: change master password
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
            if(!await (this._offlineService as OfflineService).isRunningOffline()) {
                await this.pinLockService.setSecret(pin, JSON.stringify(data));
            }

        await this.router.navigateByUrl(nextURL ?? '/manager', { replaceUrl: true });
    }
    // pedro-arruda-moreira: change master password
    public async confirmMasterPassword() {
        const typedPassword = await this.getPasswordFromDialog();
        if(typedPassword != this.masterPassword) {
            throw new Error('Password does not match. Try again.');
        }
    }
    // pedro-arruda-moreira: change master password
    public async changeMasterPassword() {
        await this.confirmMasterPassword();
        const newPass = await this.getPasswordFromDialog('Now type the new password');
        if(await this.getPasswordFromDialog('Finally, confirm the new password') != newPass) {
            throw new Error('Confirmation does not match. Try Again.');
        }
        const vault = this.getVault();
        await vault.updateMasterPassword(newPass);
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
        // pedro-arruda-moreira: config cache
        this.configCache.clear();
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
        const assuredOfflineService = (this._offlineService as OfflineService);
        // pedro-arruda-moreira: config cache
        return this.vaultage.doLogin({
            serverURL: config.url,
            username: config.username,
            masterPassword: config.password,
            httpParams: {
                auth: config.basic
            },
            configCache: (this.configCacheEnabled ? this.configCache : undefined),
            offlineProvider: (assuredOfflineService.offlineEnabled ? assuredOfflineService : undefined),
            cryptoParams: DEFAULT_SJCL_PARAMS
        }).then(async (v): Promise<Vault> => {
            if(v.getDBRevision() == 0 && this.autoCreateVault) {
                await v.save();
            }
            return v;
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
