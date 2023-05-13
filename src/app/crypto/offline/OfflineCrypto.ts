import { CryptoImpl, DEFAULT_SJCL_PARAMS } from '../internal/CryptoImpl';
import { sjcl_encrypt, sjcl_decrypt } from 'improved-vaultage-client';

export class OfflineCrypto implements CryptoImpl {
    
    encrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve(sjcl_encrypt(pin, data, DEFAULT_SJCL_PARAMS));
    }

    decrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve(sjcl_decrypt(pin, data));
    }

    
}