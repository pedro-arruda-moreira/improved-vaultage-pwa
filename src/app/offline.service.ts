import { Injectable, Inject } from '@angular/core';
import { IOfflineProvider } from 'improved-vaultage-client';
import { LOCAL_STORAGE, WINDOW } from './platform/providers';
import { AuthService } from './auth.service';
import { RedirectService } from './redirect.service';
import { Router } from '@angular/router';

const OFFLINE_CIPHER_KEY = 'offline_cipher';
const OFFLINE_SALT_KEY = 'offline_salt';

@Injectable()
export class OfflineService implements IOfflineProvider {

    private online = true;
    private _authService: AuthService | null = null;
    private _redirectService: RedirectService | null = null;

    constructor(
        @Inject(LOCAL_STORAGE) private readonly ls: Storage,
        @Inject(WINDOW) private readonly window: Window,
        private readonly router: Router
    ) {
        this.online = this.window.navigator.onLine;
        this.window.addEventListener('online', (_) => {
            this.online = true;
            this.relogin();
        });
        this.window.addEventListener('offline', (_) => {
            this.online = false;
            this.relogin();
        });
    }
    set authService(as: AuthService) {
        this._authService = as;
    }
    set redirectService(rs: RedirectService) {
        this._redirectService = rs;
    }
    isRunningOffline(): Promise<boolean> {
        return Promise.resolve(!this.online);
    }
    getOfflineCipher(): Promise<string> {
        return Promise.resolve(this.ls.getItem(OFFLINE_CIPHER_KEY) as string);
    }
    offlineSalt(): Promise<string> {
        return Promise.resolve(this.ls.getItem(OFFLINE_SALT_KEY) as string);
    }
    saveOfflineCipher(cipher: string): Promise<void> {
        this.ls.setItem(OFFLINE_CIPHER_KEY, cipher);
        return Promise.resolve();
    }

    private relogin() {
        (this._authService as AuthService).logOut();
        (this._redirectService as RedirectService).redirectToAuthZone(this.router.url);
    }

}