import { InjectionToken } from '@angular/core';
/*
 * pedro-arruda-moreira: for some reason, build was failing
 * because of this.
 */
import { login, Vault, ILoginOptions } from 'improved-vaultage-client';

export class Vaultage {
    public doLogin(options: ILoginOptions): Promise<Vault> {
        return login(options);
    }
}

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage');
export const VAULTAGE = new InjectionToken<Vaultage>('Vaultage');
export const WINDOW = new InjectionToken<Window>('Window');
