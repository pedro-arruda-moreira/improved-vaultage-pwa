import { CryptoImpl, DEFAULT_SJCL_PARAMS } from '../internal/CryptoImpl';
import { encrypt, decrypt, NoOPLog } from 'improved-vaultage-client';

export class OfflineCrypto implements CryptoImpl {
    
    async encrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve(await encrypt(pin, data, NoOPLog.INSTANCE, DEFAULT_SJCL_PARAMS));
    }

    async decrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve(await decrypt(pin, data, NoOPLog.INSTANCE));
    }

    
}