import { ICryptoParams } from 'improved-vaultage-client';

export interface CryptoImpl {
    encrypt(data: string, pin: string): Promise<string>;
    decrypt(data: string, pin: string): Promise<string>;
}

export const DEFAULT_SJCL_PARAMS: ICryptoParams = {
    iter: 1048576,
    mode: 'gcm',
    ks: 256,
    adata: 'vaultage'
}