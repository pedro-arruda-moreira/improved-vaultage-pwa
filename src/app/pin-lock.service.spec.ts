import { getMock, getService } from 'ng-vacuum';
import { anyString, Mock, reset, when, same } from 'omnimock';

import { PinLockService, STORAGE_KEY } from './pin-lock.service';
import { LOCAL_STORAGE } from './platform/providers';
/*
 * pedro-arruda-moreira: local storage encryption
 */
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


describe('PinLockServiceTest', () => {
    let lsMock: Mock<Storage>;
    let service: PinLockService;
    (window as any).sjcl = require('./../assets/sjcl.js');

    beforeEach(() => {
        lsMock = getMock(LOCAL_STORAGE);
        //pedro-arruda-moreira: local storage encryption
        when(lsMock.getItem(same('crypto_type'))).return('offline');
        service = getService(PinLockService);
    });

    it('setSecret sets the secret', () => {
        when(lsMock.setItem(anyString(), anyString())).call((key, datum) => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            let obj = JSON.parse(datum);
            expect(obj.iter).toEqual(10000);
            expect(obj.mode).toEqual('ccm');
        }).once();
        service.setSecret('1234', '53cr37');
    });

    it('getSecret with good pin returns the secret', () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            return CT;
        });
        expect(service.getSecret('1234')).toBe('53cr37');
    });

    it('getSecret with bad pin returns undefined', () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            return CT;
        });
        expect(service.getSecret('4321')).toBe(undefined);
    });

    it('getSecret with no storage', () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            return null;
        });
        expect(service.getSecret('4321')).toBe(undefined);
    });

    it('hasSecret returns true iff there is a secret', () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).return(null);
        expect(service.hasSecret).toBe(false);

        reset(lsMock);
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).return(CT);
        expect(service.hasSecret).toBe(true);
    });

    it('reset resets the store', () => {
        when(lsMock.removeItem(anyString())).call(key => {
            expect(key).toBe('vaultage_locked');
        });
        service.reset();
    });
});
