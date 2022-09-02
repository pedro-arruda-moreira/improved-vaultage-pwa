function createSalt() {
    let salt = '';
    for (let i = 0; i < 25; i++) {
        salt += Math.random();
    }
    return salt;
}

export const FEATURE_SELF_CONTAINED = 'self_contained';
export const FEATURE_USE_BASIC = 'use_basic';
export const FEATURE_CRYPTO_TYPE = 'crypto_type';
export const FEATURE_DESKTOP = 'desktop';
export const FEATURE_CONFIG_CACHE = 'config_cache';
export const FEATURE_AUTO_CREATE = 'auto_create';
export const FEATURE_ONLINE_CRYPTO_PATH = 'online_crypto_path';
export const FEATURE_OFFLINE_ENABLED = 'offline_enabled';
export const FEATURE_OFFLINE_SALT = 'offline_salt';


export function start() {
    const params = new URLSearchParams(window.location.search);
    function detectFeature(name: string, defaultValue: string): string {
        const obtainedFromParam = params.get(name);
        const obtainedFromLS = localStorage.getItem(name);
        if (obtainedFromParam) {
            localStorage.setItem(name, obtainedFromParam);
            return obtainedFromParam;
        } else if(obtainedFromLS) {
            return obtainedFromLS;
        }
        localStorage.setItem(name, defaultValue);
        return defaultValue;
    }
    // self hosted mode
    detectFeature(FEATURE_SELF_CONTAINED, 'false');
    // use basic mode
    detectFeature(FEATURE_USE_BASIC, 'null');
    // online crypto support
    detectFeature(FEATURE_CRYPTO_TYPE, 'offline');
    // desktop mode
    detectFeature(FEATURE_DESKTOP, 'false');
    // config cache
    detectFeature(FEATURE_CONFIG_CACHE, 'false');
    // auto create new vault
    detectFeature(FEATURE_AUTO_CREATE, 'false');
    // online crypto path
    detectFeature(FEATURE_ONLINE_CRYPTO_PATH, './api/crypto');
    // offline mode
    if (detectFeature(FEATURE_OFFLINE_ENABLED, 'false') == 'true') {
        // offline salt
        detectFeature(FEATURE_OFFLINE_SALT, createSalt());
    }
}