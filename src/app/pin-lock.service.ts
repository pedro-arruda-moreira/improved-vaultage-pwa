import { Inject, Injectable } from '@angular/core';
import { LOCAL_STORAGE } from './platform/providers';
import { OnlineCrypto } from './crypto/online/OnlineCrypto';
import { OfflineCrypto } from './crypto/offline/OfflineCrypto';
import { CryptoImpl } from './crypto/internal/CryptoImpl';
import { OfflineService } from './offline.service';
import { LoginConfig } from './auth.service';
import { CRYPTO_IMPL } from './app.module';

export const STORAGE_KEY = 'vaultage_locked';

@Injectable()
export class PinLockService {
    // pedro-arruda-moreira: online pin lock crypto mode
    constructor(@Inject(LOCAL_STORAGE) private readonly ls: Storage,
                @Inject(CRYPTO_IMPL) private readonly cryptoImpl: CryptoImpl,
                private readonly offlineService: OfflineService) { }

    public get hasSecret(): boolean {
        return this.getStorage() != null;
    }
	// pedro-arruda-moreira: desktop mode
    public async setSecret(pin: string, data: string) {
	    /*
		 * pedro-arruda-moreira: local storage encryption
         * and online pin lock crypto mode
		 */
        const value = await this.cryptoImpl.encrypt(JSON.stringify({pin, data}), pin);
        if(value == '') {
            return;
        }
        this.ls.setItem(STORAGE_KEY, value);
    }
	// pedro-arruda-moreira: desktop mode
    public async getSecret(userPin: string): Promise<string | undefined> {
        if(await this.offlineService.isRunningOffline()) {
            const data: LoginConfig = {
                password: userPin,
                url: 'offline://offline',
                username: 'offline_user'
            };
            return JSON.stringify(data);
        }
        const storage = this.getStorage();
	    /*
		 * pedro-arruda-moreira: local storage encryption
		 */
        if (storage != null) {
            let pinStorage;
            try {
                pinStorage = await this.checkDecryption(storage, userPin);
            } catch(e) {
                return undefined;
            }
            if(!pinStorage) {
                return undefined;
            }
            return pinStorage.data;
        }
    }
    // pedro-arruda-moreira: online pin lock crypto mode
    private async checkDecryption(storage: string, userPin: string): Promise<PinStorage> {
        const data = await this.cryptoImpl.decrypt(storage, userPin);
        return JSON.parse(data);
    }

    public reset(): void {
        this.ls.removeItem(STORAGE_KEY);
    }

    /*
	 * pedro-arruda-moreira: local storage encryption
	 */
    private getStorage(): string | undefined {
        const data = this.ls.getItem(STORAGE_KEY);
        if (data === null) {
            return undefined;
        }
        return data;
    }
}

interface PinStorage {
    pin: string;
    data: string;
}
