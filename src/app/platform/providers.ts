import { InjectionToken } from '@angular/core';
/*
 * pedro-arruda-moreira: for some reason, build was failing
 * because of this.
 */
import { login, IHttpParams, IConfigCache, IOfflineProvider, Vault } from 'improved-vaultage-client';

export class Vaultage {
    public doLogin(serverURL: string,
                   username: string,
                   masterPassword: string,
                   httpParams?: IHttpParams | undefined,
                   configCache?: IConfigCache | undefined,
                   offlineProvider?: IOfflineProvider | undefined): Promise<Vault> {
        return login(serverURL, username, masterPassword, httpParams, configCache, offlineProvider);
    }
}

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage');
export const VAULTAGE = new InjectionToken<Vaultage>('Vaultage');
export const WINDOW = new InjectionToken<Window>('Window');
