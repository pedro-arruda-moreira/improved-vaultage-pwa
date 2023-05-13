import { ISJCLParams } from 'improved-vaultage-client';

export interface CryptoImpl {
    encrypt(data: string, pin: string): Promise<string>;
    decrypt(data: string, pin: string): Promise<string>;
}

export const DEFAULT_SJCL_PARAMS: ISJCLParams = {
    iter: 131244,
    mode: 'gcm',
    ks: 256
}