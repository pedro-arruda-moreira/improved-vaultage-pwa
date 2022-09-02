import { InjectionToken } from '@angular/core';
import { CryptoImpl } from './crypto/internal/CryptoImpl';
import { FEATURE_CRYPTO_TYPE, FEATURE_ONLINE_CRYPTO_PATH } from 'src/misc/FeatureDetector';
import { OnlineCrypto } from './crypto/online/OnlineCrypto';
import { OfflineCrypto } from './crypto/offline/OfflineCrypto';


export const CRYPTO_IMPL = new InjectionToken<CryptoImpl>('CryptoImpl', {
    factory: cryptoImplFactory
});

export function cryptoImplFactory() {
    if(localStorage.getItem(FEATURE_CRYPTO_TYPE) == 'online') {
        return new OnlineCrypto(localStorage.getItem(FEATURE_ONLINE_CRYPTO_PATH) as string);
    } else {
        return new OfflineCrypto();
    }
}