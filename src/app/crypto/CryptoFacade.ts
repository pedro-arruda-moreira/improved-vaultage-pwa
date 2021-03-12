import { Injectable, Inject } from '@angular/core';
import { CRYPTO_IMPL } from '../platform/providers';
import { OfflineCrypto } from './offline/OfflineCrypto';
import { OnlineCrypto } from './online/OnlineCrypto';

@Injectable({
    providedIn: 'root'
})
export class CryptoFacade {

    constructor(@Inject(CRYPTO_IMPL) private cryptoImpl: string,
        private offline: OfflineCrypto,
        private online: OnlineCrypto) {}

    encrypt(data: string, pin: string): string {
        if(this.cryptoImpl == 'online') {
            return this.online.encrypt(data, pin);
        }
        return this.offline.encrypt(data, pin);
    }
    decrypt(data: string, pin: string): string {
        if(this.cryptoImpl == 'online') {
            return this.online.decrypt(data, pin);
        }
        return this.offline.decrypt(data, pin);
    }
}