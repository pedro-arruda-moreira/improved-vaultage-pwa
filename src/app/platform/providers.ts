import { InjectionToken } from '@angular/core';
/*
 * pedro-arruda-moreira: for some reason, build was failing
 * because of this.
 */
import * as vt from 'improved-vaultage-client';

export class Vaultage {
    static staticControl = vt;
    control = Vaultage.staticControl;
}

export const LOCAL_STORAGE = new InjectionToken<Storage>('LocalStorage');
export const VAULTAGE = new InjectionToken<Vaultage>('Vaultage');
export const WINDOW = new InjectionToken<Window>('Window');
