import { Router } from '@angular/router';
import { getMock, getService } from 'ng-vacuum';
// pedro-arruda-moreira: desktop mode
import { anyString, mockInstance, when, equals, anything, instance, mock } from 'omnimock';
// pedro-arruda-moreira: changed client
import { Vault } from 'improved-vaultage-client';

import { AuthService, LoginConfig } from './auth.service';
import { PinLockService } from './pin-lock.service';
// pedro-arruda-moreira: desktop mode
import { VAULTAGE, LOCAL_STORAGE } from './platform/providers';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PasswordPromptComponent } from './platform/password-prompt/password.prompt.component';
import { LocalStorageConfigCache } from './util/LocalStorageConfigCache';

describe('AuthService', () => {

    let service: AuthService;
    let dbRevision: number = 4;

    let fakeVaultMock = mock<Vault>('vault');
    let fakeVault = instance(fakeVaultMock);
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
        fakeVaultMock = mock<Vault>('vault');
        fakeVault = instance(fakeVaultMock);
        dbRevision = 4;
        changeEvents = [];
        service = getService(AuthService);
        service.authStatusChange$.subscribe(change => changeEvents.push(change));
        when(fakeVaultMock.getDBRevision()).call(() => dbRevision);
    });

    it('testCredentials logs in to test the credentials', async () => {
        const config = fakeLoginConfig();
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        
        when(getMock(LOCAL_STORAGE).getItem('config_cache')).return('true').once();
        when(getMock(VAULTAGE).control.login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
            // pedro-arruda-moreira: config cache
            instance(getMock(LocalStorageConfigCache))))
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
	// pedro-arruda-moreira: desktop mode
    it('logIn only asks for master password once per session - desktop (with auto_create on)', async () => {
        const config = fakeLoginConfig();
        
        when(getMock(MatDialog).closeAll()).return().once();
        const mockPasswordPrompt = {
            password: Promise.resolve('Tr4v0lt4')
        } as PasswordPromptComponent;
        when(getMock(MatDialog).open(anything(), anything())).return(
            {
                componentInstance: (mockPasswordPrompt as unknown) as PasswordPromptComponent
            } as MatDialogRef<PasswordPromptComponent, any>).once();
        when(getMock(LOCAL_STORAGE).getItem('config_cache')).return('false').times(2);
        when(getMock(LOCAL_STORAGE).getItem(equals('desktop'))).return('true');
        when(getMock(VAULTAGE).control.login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        undefined))
            .resolve(fakeVault);
        when(getMock(PinLockService).setSecret('1234', anyString()))
            .call((pin, secret) => {
                expect(JSON.parse(secret)).toEqual(config);
                return Promise.resolve();
            })
            .times(2);
        when(getMock(Router).navigateByUrl('/manager', { replaceUrl: true })).resolve(true).times(2);
        dbRevision = 0;
        when(getMock(LOCAL_STORAGE).getItem('auto_create')).return('true').once();
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
    });

    it('logIn logs in and redirects, logOut logs out', async () => {
        const config = fakeLoginConfig();
        
        // pedro-arruda-moreira: desktop mode
        when(getMock(MatDialog).closeAll()).return().once();
        when(getMock(LOCAL_STORAGE).getItem('config_cache')).return('true').once();
        when(getMock(LOCAL_STORAGE).getItem(equals('desktop'))).return('false').times(2);
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        when(getMock(VAULTAGE).control.login('http://pulp.fiction', 'John', 'Tr4v0lt4', { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        instance(getMock(LocalStorageConfigCache))))
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
        when(getMock(LOCAL_STORAGE).getItem(equals('desktop'))).return('false');
        /*
		 * pedro-arruda-moreira: adjusted unit tests.
		 */
        when(getMock(LOCAL_STORAGE).getItem('config_cache')).return('true').once();
        when(getMock(VAULTAGE).control.login('http://pulp.fiction', 'John', 'Tr4v0lt4',
        { auth: { username: 'Quentin', password: 'Tarantino'}},
        // pedro-arruda-moreira: config cache
        instance(getMock(LocalStorageConfigCache))))
            .resolve(fakeVault);
        // pedro-arruda-moreira: desktop mode
        when(getMock(PinLockService).setSecret('1234', anyString())).return(Promise.resolve()).once();
        when(getMock(Router).navigateByUrl(anyString(), { replaceUrl: true })).call(url => {
            expect(url).toBe('/next');
            return Promise.resolve(true);
        }).once();
        await service.logIn(config, '1234', '/next');
    });
});
