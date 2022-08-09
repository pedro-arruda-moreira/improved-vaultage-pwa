import { OfflineCrypto } from "./OfflineCrypto";

/*
decrypted mock data:
{
    "pin": "1234",
    "data": "53cr37"
}
encrypted mock data:*/
const CT = `{ "iv": "QBGp5xXcIzdSMqykVub9wg==", "v": 1, "iter": 10000, "ks": 128, "ts": 64, "mode": "ccm",
"adata": "", "cipher": "aes", "salt": "ajhKpL/K8dA=",
"ct": "D7HQz3xvRAbnnbEXjjWhKl/XAKAcQtc8aTy9YBSglAewu4OTD90="
}`;

describe('OfflineCrypto', () => {
    const data = {
        "pin": "1234",
        "data": "53cr37"
    };
    const pin = '1234';
    const crypto = new OfflineCrypto();
    (window as any).sjcl = require('src/assets/js/sjcl.js');

    it('decrypts correctly', async () => {
        expect(JSON.parse(await crypto.decrypt(CT, pin))).toEqual({
            "pin": "1234",
            "data": "53cr37"
        });
    });
    it('encrypts and then decrypts correctly', async () => {
        const cipher = await crypto.encrypt(JSON.stringify(data), pin);
        expect(JSON.parse(await crypto.decrypt(cipher, pin))).toEqual(data);
    });
});