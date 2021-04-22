import { CryptoImpl } from '../internal/CryptoImpl';

export class OfflineCrypto implements CryptoImpl {
    
    encrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve((window as any).sjcl.encrypt(pin, data));
    }

    decrypt(data: string, pin: string): Promise<string> {
        return Promise.resolve((window as any).sjcl.decrypt(pin, data));
    }

    
}