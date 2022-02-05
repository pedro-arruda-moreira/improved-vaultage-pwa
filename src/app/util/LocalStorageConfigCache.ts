import { IConfigCache } from 'improved-vaultage-client';
import { IVaultageConfig } from 'vaultage-protocol';
import { Injectable, Inject } from '@angular/core';
import { LOCAL_STORAGE } from '../platform/providers';

@Injectable({
    providedIn:"any"
})
export class LocalStorageConfigCache implements IConfigCache {
    constructor(
        @Inject(LOCAL_STORAGE) private readonly localStorage: Storage
    ) {}

    private getLocalStorageKey(url: string) {
        return `config_cache_${btoa(url.split('/').join('').trim())}`
            .split('=').join('').trim();
    }

    saveConfig(url: string, config: IVaultageConfig): void {
        this.localStorage.setItem(this.getLocalStorageKey(url), JSON.stringify(config));
    }
    loadConfig(url: string): IVaultageConfig | null {
        const strVal = this.localStorage.getItem(this.getLocalStorageKey(url));
        if(strVal == null) {
            return null;
        }
        return JSON.parse(strVal) as IVaultageConfig;
    }
    remove(url: string) {
        this.localStorage.removeItem(this.getLocalStorageKey(url));
    }
}