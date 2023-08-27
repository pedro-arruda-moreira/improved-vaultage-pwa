import { Router } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
// pedro-arruda-moreira: desktop mode
import { anyString, mockInstance, when, equals, anything, instance, mock, anyOf } from 'omnimock';
// pedro-arruda-moreira: changed client
import { Vault } from 'improved-vaultage-client';

import { AuthService, LoginConfig } from './auth.service';
import { PinLockService } from './pin-lock.service';
// pedro-arruda-moreira: desktop mode
import { VAULTAGE, LOCAL_STORAGE } from './platform/providers';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PasswordPromptComponent } from './platform/password-prompt/password.prompt.component';
import { LocalStorageConfigCache } from './util/LocalStorageConfigCache';
import { OfflineService } from './offline.service';
import { FEATURE_CONFIG_CACHE, FEATURE_DESKTOP, FEATURE_AUTO_CREATE } from 'src/misc/FeatureDetector';

describe('AuthService', () => {

    let service: AuthService;
    let dbRevision = 4;

    let fakeVaultMock = mock<Vault>('vault');
    let fakeVault = instance(fakeVaultMock);
    let offlineServiceMock = mock<OfflineService>('offlineService');
    let offlineService = instance(offlineServiceMock);
    let runningOffline = false;
    let offlineEnabled = false;
    function fakeLoginConfig(): LoginConfig {
        return {
            username: 'John',
            password: 'Tr4v0lt4',
            url: 'http://pulp.fiction',
            basic: {
                username: 'Quentin',
                password: 'Tarantino'
            }
        };
    }

    let changeEvents: boolean[];

    beforeEach(() => {
        runningOffline = false;
        offlineEnabled = false;
        fakeVaultMock = mock<Vault>('vault');
        fakeVault = instance(fakeVaultMock);
        offlineServiceMock = mock<OfflineService>('offlineService');
        offlineService = instance(offlineServiceMock);
        dbRevision = 4;
        changeEvents = [];
        service = getService(AuthService);
        service.offlineService = offlineService;
        service.authStatusChange$.subscribe(change => changeEvents.push(change));
        when(fakeVaultMock.getDBRevision()).call(() => dbRevision);
        when(offlineServiceMock.isRunningOffline()).call(() => Promise.resolve(runningOffline));
        when(offlineServiceMock.offlineEnabled).call(() => offlineEnabled);
    });

    it('testCredentials logs in to test the credentials', async () => {
        offlineEnabled = true;
        const config = fakeLoginConfig();
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(getMock(VAULTAGE).doLogin('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
            // pedro-arruda-moreira: config cache
            instance(getMock(LocalStorageConfigCache)), offlineService))
                .resolve(fakeVault)
                .once();
        await service.testCredentials(config);
        expect().nothing();
    });

    it('getVault throws an error when not authenticated', () => {
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
    });

    it('starts out not authenticated', () => {
        expect(service.isAuthenticated).toBe(false);
    });

    it('authStatusChange$ emits a value immediately', () => {
        // authStatusChange$ emits as soon as we subscrcibe to it because it is based on a BehaviorSubject
        expect(changeEvents.length).toBe(1);
        expect(changeEvents[0]).toBe(false);
    });

    async function doTestDesktop() {
        
        const config = fakeLoginConfig();
        
        when(getMock(MatDialog).closeAll()).return().once();
        const mockPasswordPrompt = {
            password: Promise.resolve('Tr4v0lt4')
        } as PasswordPromptComponent;
        when(getMock(MatDialog).open(anything(), anything())).return(
            {
                componentInstance: (mockPasswordPrompt as unknown) as PasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).once();
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_CONFIG_CACHE)).return('false').times(2);
        when(getMock(LOCAL_STORAGE).getItem(equals(FEATURE_DESKTOP))).return('true');
        when(getMock(VAULTAGE).doLogin('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        undefined, (offlineEnabled ? offlineService : undefined)))
            .resolve(fakeVault);
        if(!runningOffline) {
            when(getMock(PinLockService).setSecret('1234', anyString()))
                .call((_, secret) => {
                    expect(JSON.parse(secret)).toEqual(config);
                    return Promise.resolve();
                })
                .times(2);
        }
        when(getMock(Router).navigateByUrl('/manager', { replaceUrl: true })).resolve(true).times(2);
        dbRevision = 0;
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_AUTO_CREATE)).return('true').once();
        when(fakeVaultMock.save()).return(Promise.resolve()).once();
        await service.logIn(config, '1234');
        dbRevision = 1;
        expect(service.isAuthenticated).toBe(true);
        expect(service.getVault()).toBe(fakeVault);
        expect(changeEvents.length).toBe(2);
        expect(changeEvents[1]).toBe(true);

        service.logOut();

        expect(service.isAuthenticated).toBe(false);
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        expect(changeEvents.length).toBe(3);
        expect(changeEvents[2]).toBe(false);
        await service.logIn(config, '1234');
    }
	// pedro-arruda-moreira: desktop mode
    it('logIn only asks for master password once per session - desktop (with auto_create on)', async () => {
        await doTestDesktop();
    });
	// pedro-arruda-moreira: desktop mode
    it('logIn only asks for master password once per session - desktop (with auto_create on and running offline)', async () => {
        runningOffline = true;
        offlineEnabled = true;
        await doTestDesktop();
    });

    it('logIn logs in and redirects, logOut logs out', async () => {
        const config = fakeLoginConfig();
        
        // pedro-arruda-moreira: desktop mode
        when(getMock(MatDialog).closeAll()).return().once();
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(getMock(LOCAL_STORAGE).getItem(equals(FEATURE_DESKTOP))).return('false').times(2);
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        when(getMock(VAULTAGE).doLogin('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        instance(getMock(LocalStorageConfigCache)),
        undefined))
            .resolve(fakeVault);
        when(getMock(PinLockService).setSecret('1234', anyString()))
            .call((pin, secret) => {
                expect(JSON.parse(secret)).toEqual(config);
                return Promise.resolve();
            })
            .once();
        when(getMock(Router).navigateByUrl('/manager', { replaceUrl: true })).resolve(true).once();
        await service.logIn(config, '1234');

        expect(service.isAuthenticated).toBe(true);
        expect(service.getVault()).toBe(fakeVault);
        expect(changeEvents.length).toBe(2);
        expect(changeEvents[1]).toBe(true);

        service.logOut();

        expect(service.isAuthenticated).toBe(false);
        expect(() => service.getVault()).toThrowError(/not authenticated/i);
        expect(changeEvents.length).toBe(3);
        expect(changeEvents[2]).toBe(false);
    });

    it('logIn redirects to next URL', async () => {
        const config = fakeLoginConfig();
        
        // pedro-arruda-moreira: desktop mode
        when(getMock(LOCAL_STORAGE).getItem(equals(FEATURE_DESKTOP))).return('false');
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(getMock(VAULTAGE).doLogin('http://pulp.fiction', 'John', 'Tr4v0lt4',
        { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        instance(getMock(LocalStorageConfigCache)),
        undefined))
            .resolve(fakeVault);
        // pedro-arruda-moreira: desktop mode
        when(getMock(PinLockService).setSecret('1234', anyString())).return(Promise.resolve()).once();
        when(getMock(Router).navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        await service.logIn(config, '1234', '/next');
    });
    // pedro-arruda-moreira: change master password
    it('changeMasterPassword throw exceptions on validation errors - master pass confirmation wrong', async () => {
        
        // default master password for the service is '' if not authenticated
        when(getMock(PasswordPromptComponent).password).return(
            Promise.resolve('mypass123')).once();
        when(getMock(MatDialog).open(anyOf(PasswordPromptComponent), anything())).return(
            mockInstance<MatDialogRef<PasswordPromptComponent, any>>('MatDialogRef', {
                componentInstance: instance(getMock(PasswordPromptComponent))
            })).once();
        try {
            await service.changeMasterPassword();
            fail('exception expected');
        } catch(e) {
            expect((e as Error).message).toBe('Password does not match. Try again.');
        }
    });
    // pedro-arruda-moreira: change master password
    it('changeMasterPassword throw exceptions on validation errors - new pass confirmation wrong', async () => {
        
        // default master password for the service is '' if not authenticated
        let count = 0;
        when(getMock(PasswordPromptComponent).password).call(() => {
            switch(++count) {
                case 1:
                    return Promise.resolve('');
                case 2:
                    return Promise.resolve('new_pass');
                default:
                    return Promise.resolve('wrong_new_pass');
            }
        }).times(3);
        when(getMock(MatDialog).open(anyOf(PasswordPromptComponent), anything())).return(
            mockInstance<MatDialogRef<PasswordPromptComponent, any>>('MatDialogRef', {
                componentInstance: instance(getMock(PasswordPromptComponent))
            })).times(3);
        try {
            await service.changeMasterPassword();
            fail('exception expected');
        } catch(e) {
            expect((e as Error).message).toBe('Confirmation does not match. Try Again.');
        }
    });
    // pedro-arruda-moreira: change master password
    it('changeMasterPassword changes master password', async () => {

        // login expectations
        
        
        // pedro-arruda-moreira: desktop mode
        when(getMock(LOCAL_STORAGE).getItem(equals(FEATURE_DESKTOP))).return('false');
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        when(getMock(LOCAL_STORAGE).getItem(FEATURE_CONFIG_CACHE)).return('true').once();
        when(getMock(VAULTAGE).doLogin('http://pulp.fiction', 'John', 'Tr4v0lt4',
        { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        instance(getMock(LocalStorageConfigCache)),
        undefined))
            .resolve(fakeVault);
        // pedro-arruda-moreira: desktop mode
        when(getMock(PinLockService).setSecret('1234', anyString())).return(Promise.resolve()).once();
        when(getMock(Router).navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        
        // change pass expectations

        let count = 0;
        when(fakeVaultMock.updateMasterPassword('new_pass')).return(Promise.resolve()).once();
        when(getMock(PasswordPromptComponent).password).call(() => {
            switch(++count) {
                case 1:
                    return Promise.resolve('Tr4v0lt4');
                case 2:
                    return Promise.resolve('new_pass');
                default:
                    return Promise.resolve('new_pass');
            }
        }).times(3);
        when(getMock(MatDialog).open(anyOf(PasswordPromptComponent), anything())).return(
            mockInstance<MatDialogRef<PasswordPromptComponent, any>>('MatDialogRef', {
                componentInstance: instance(getMock(PasswordPromptComponent))
            })).times(3);
        await service.logIn(fakeLoginConfig(), '1234', '/next');
        await service.changeMasterPassword();
    });
});
