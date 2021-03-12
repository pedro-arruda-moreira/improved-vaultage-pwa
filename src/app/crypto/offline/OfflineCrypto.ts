import { CryptoImpl } from '../internal/CryptoImpl';
import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class OfflineCrypto implements CryptoImpl {
    
    encrypt(data: string, pin: string): string {
        return (window as any).sjcl.encrypt(pin, data);
    }

    decrypt(data: string, pin: string): string {
        return (window as any).sjcl.decrypt(pin, data);
    }

    
}