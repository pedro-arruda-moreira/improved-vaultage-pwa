import { getMock, getService } from 'ng-vacuum';
import { anyString, Mock, reset, when, same } from 'omnimock';

import { PinLockService, STORAGE_KEY } from './pin-lock.service';
import { LOCAL_STORAGE } from './platform/providers';
import { CRYPTO_IMPL } from './root-providers';
import { OfflineService } from './offline.service';
/*
 * pedro-arruda-moreira: local storage encryption
 */



describe('PinLockServiceTest', () => {
    const correctPin = '1234';
    const data = JSON.stringify({pin: parseInt(correctPin), data: '53cr37'});
    const CT = 'this is encrypted.';
    let isRunningOffline = false;
    let lsMock: Mock<Storage>;
    let service: PinLockService;

    beforeEach(() => {
        isRunningOffline = false;
        when(getMock(OfflineService).isRunningOffline()).call(() => Promise.resolve(isRunningOffline));
        when(getMock(CRYPTO_IMPL).encrypt(anyString(), correctPin)).return(Promise.resolve(CT)).anyTimes();
        when(getMock(CRYPTO_IMPL).decrypt(CT, anyString())).call((_, pin) => {
            if(pin == correctPin) {
                return Promise.resolve(data);
            }
            return Promise.resolve('' + Math.random());
        }).anyTimes();
        lsMock = getMock(LOCAL_STORAGE);
        service = getService(PinLockService);
    });
	// pedro-arruda-moreira: desktop mode
    it('setSecret sets the secret', async () => {
        when(lsMock.setItem(anyString(), anyString())).call((key, datum) => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            expect(datum).toEqual(CT);
        }).once();
        await service.setSecret(correctPin, '53cr37');
    });
	// pedro-arruda-moreira: desktop mode
    it('getSecret with good pin returns the secret', async () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            return CT;
        });
        expect(await service.getSecret(correctPin)).toBe('53cr37');
    });
	// pedro-arruda-moreira: desktop mode
    it('getSecret with offline mode returns the mock secret', async () => {
        isRunningOffline = true;
        expect(JSON.parse(await (service.getSecret(correctPin) as Promise<string>))).toEqual({
            password: correctPin,
            url: 'offline://offline',
            username: 'offline_user'
        });
    });
	// pedro-arruda-moreira: desktop mode
    it('getSecret with bad pin returns undefined', async () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            /*
			 * pedro-arruda-moreira: local storage encryption
			 */
            return CT;
        });
        expect(await service.getSecret('4321')).toBe(undefined);
    });
	// pedro-arruda-moreira: desktop mode
    it('getSecret with no storage', async () => {
        //pedro-arruda-moreira: changed to constant
        when(lsMock.getItem(same(STORAGE_KEY))).call(key => {
            expect(key).toBe('vaultage_locked');
            return null;
        });
        expect(await service.getSecret('4321')).toBe(undefined);
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
